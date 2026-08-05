// src/components/supplier/MobileSupplierProfilePage.jsx — GROSHOP.tn
// Vitrine PUBLIQUE mobile — HEADER mobile conservé (bannière + carte identité
// + onglets collants), et pour tout le reste on RÉUTILISE les composants
// desktop (SectionTitle, SupplierStats, SupplierProducts, SupplierAbout,
// SupplierReviews). Ils portent déjà leurs media queries → même look que le
// desktop, adapté au mobile. Bannière plafonnée à ~40% (clamp 200/40dvh/340).
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, MapPin, BadgeCheck, MessageCircle, Share2, Check, Users } from 'lucide-react'
import { usePageTracking } from '../../hooks/usePageTracking'
import { suppliers as suppliersApi, messaging as messagingApi } from '../../lib/api'
import SectionTitle     from './SectionTitle'
import SupplierStats    from './SupplierStats'
import SupplierProducts from './SupplierProducts'
import SupplierAbout    from './SupplierAbout'
import SupplierReviews  from './SupplierReviews'
import Footer           from '../Footer'

/* Même teinte orange que le header du reste du projet */
const ORANGE      = '#ff5e20'
const ORANGE_TINT = 'rgba(255, 94, 32, .12)'
const ORANGE_FILM = 'rgba(255, 94, 32, .08)'

const INK='#0F1419', SUB='#3D4853', MUTE='#6B7785', FAINT='#9AA3AE', LINE='#ECEEF1', BG='#FAFAFA', GREEN='#0E9F6E'
const FONT='-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const TABS_H = 50                 // hauteur de la barre d'onglets collante

const TABS = [
  { id: 'home',     label: 'Accueil'  },
  { id: 'products', label: 'Produits' },
  { id: 'profile',  label: 'Profil'   },
  { id: 'reviews',  label: 'Avis'     },
]

const toNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n }
const fmtCount = (n) => {
  const v = Number(n) || 0
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1).replace('.', ',')} K`
  return String(v)
}

/* ── Helpers backend (mêmes règles que DesktopSupplierProfilePage) ── */
const pickStore = (d) => d?.store ?? d?.supplier_store ?? d ?? {}
const unwrap = (r) => (Array.isArray(r) ? r : r?.results ?? [])
const computePrice = (p) => {
  const prices = (p.price_tiers || []).map((t) => parseFloat(t.price_tnd)).filter((n) => !isNaN(n))
  if (prices.length) return Math.min(...prices)
  return parseFloat(p.base_price_tnd) || 0
}

/* Spinner (keyframes injectées une seule fois) */
if (typeof document !== 'undefined' && !document.getElementById('gs-spin-style')) {
  const s = document.createElement('style')
  s.id = 'gs-spin-style'
  s.textContent = `@keyframes gs-spin { to { transform: rotate(360deg) } }`
  document.head.appendChild(s)
}

export default function MobileSupplierProfilePage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)

  const [supplier, setSupplier] = useState(null)
  const [store, setStore]       = useState(null)
  const [products, setProducts] = useState([])
  const [reviews, setReviews]   = useState([])

  const [following, setFollowing] = useState(false)
  const [copied, setCopied]       = useState(false)

  /* ── Chargement depuis le backend (identique au desktop) ── */
  useEffect(() => {
    let cancelled = false

    async function loadSupplier() {
      setLoading(true)
      setNotFound(false)
      try {
        const [profileRes, productsRes] = await Promise.all([
          suppliersApi.profile(slug),
          suppliersApi.products(slug, { page_size: 12 }).catch(() => []),
        ])

        if (cancelled) return

        // request() renvoie null si la session a expiré / 401 non récupérable
        if (!profileRes) {
          setNotFound(true)
          setLoading(false)
          return
        }

        const raw = pickStore(profileRes)

        // ── Entête fournisseur ──
        setSupplier({
          id:                  profileRes.id,
          company_name:        profileRes.company_name || profileRes.name || '',
          slug:                profileRes.slug || slug,
          city:                profileRes.city || '',
          wilaya:              profileRes.wilaya || '',
          verification_status: profileRes.verification_status || 'pending',
          rating_avg:          Number(profileRes.rating_avg ?? profileRes.rating ?? 0),
          rating_count:        Number(profileRes.rating_count ?? 0),
          followers_count:     Number(profileRes.followers_count ?? 0),
          created_at:          profileRes.created_at || null,
        })

        // ── Vitrine : on garde TOUT le store tel quel (hero_title, stats_*,
        //    about_*, highlight_*, description, mission, response_rate…) et on
        //    ne normalise que logo/bannière/certifications/about_images —
        //    exactement comme le desktop, pour nourrir les mêmes composants. ──
        setStore({
          ...raw,
          brand_logo_url: raw.brand_logo_url || raw.logo_url || raw.logo || '',
          banner_url:     raw.banner_url     || raw.banner    || '',
          certifications: Array.isArray(raw.certifications)
            ? raw.certifications
            : (raw.certifications || '').split(',').map((s) => s.trim()).filter(Boolean),
          about_images: Array.isArray(raw.about_images) ? raw.about_images : [],
        })

        // ── Produits → forme attendue par SupplierProducts ──
        setProducts(
          unwrap(productsRes).map((p) => ({
            id:        p.id,
            name:      p.name,
            subtitle:  p.moq ? `MOQ ${p.moq} ${p.unit || 'pièces'}` : p.category_name || '',
            price:     computePrice(p),
            currency:  'TND',
            image_url: p.primary_image || p.images?.[0]?.url || '',
          }))
        )

        // ── Avis → forme attendue par SupplierReviews ──
        setReviews(
          (profileRes.reviews || []).map((r) => ({
            id:              r.id,
            rating:          Number(r.rating) || 0,
            text:            r.text || r.comment || '',
            author_name:     r.author_name || r.reviewer_name || 'Client',
            city:            r.city || '',
            avatar_url:      r.avatar_url || '',
            attached_images: r.attached_images || (r.photos ? r.photos.map((ph) => ph.url) : []),
          }))
        )
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSupplier()
    return () => { cancelled = true }
  }, [slug])

  usePageTracking({ pageType: 'supplier_shop', supplierId: supplier?.id })

  /* ── Scroll spy ── */
  useEffect(() => {
    if (loading) return
    const observers = []
    TABS.forEach(({ id }) => {
      const el = document.getElementById(`section-${id}`)
      if (!el) return
      const observer = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveTab(id) }),
        { rootMargin: `-${TABS_H + 10}px 0px -65% 0px`, threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [loading])

  /* ── Handlers ── */
  const goTo = (id) => {
    setActiveTab(id)
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const handleContact = async () => {
    if (!supplier?.slug) return
    try {
      await messagingApi.startConversation(supplier.slug)
      navigate('/dashboard/messages') // ← ajuste la route si ta messagerie mobile diffère
    } catch (e) {
      if (e?.status === 401) navigate('/login')
      else alert("Impossible d'ouvrir la messagerie pour le moment.")
    }
  }
  const handleSeeAllProducts = () => navigate(`/fournisseur/${supplier.slug}/catalogue`)
  const share = () => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800) }

  if (loading) return (
    <div style={{ minHeight: '70dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ width: 30, height: 30, border: `4px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gs-spin .8s linear infinite' }} />
    </div>
  )

  if (notFound || !supplier || !store) return (
    <div style={{ minHeight: '70dvh', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', background: BG, fontFamily: FONT, textAlign: 'center', padding: 24 }}>
      <span style={{ fontSize: 15, color: SUB }}>Ce fournisseur est introuvable.</span>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: ORANGE, fontWeight: 700, cursor: 'pointer' }}>
        Retour à l'accueil
      </button>
    </div>
  )

  const rating = toNum(supplier.rating_avg)

  return (
    <div style={{ background: BG, minHeight: '100dvh', fontFamily: FONT, paddingBottom: 'calc(78px + env(safe-area-inset-bottom))' }}>

      {/* ═══════════════════ SECTION ACCUEIL ═══════════════════
          HEADER MOBILE CONSERVÉ + stats desktop (comme la home desktop). */}
      <section id="section-home" style={{ scrollMarginTop: TABS_H }}>

        {/* ── Bannière (~40% de l'écran) ── */}
        <div style={{ position: 'relative' }}>
          <div style={{ width: '100%', height: 'clamp(200px, 40dvh, 340px)', background: '#E6E6E6', overflow: 'hidden' }}>
            {store.banner_url && <img src={store.banner_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover'}} loading="lazy"/>}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.10) 0%, rgba(0,0,0,.55) 100%)' }} />
          </div>

          <button onClick={share} aria-label="Partager la boutique"
            style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: '50%', background: '#fff', border: `1px solid ${LINE}`, boxShadow: '0 2px 8px rgba(0,0,0,.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
            {copied ? <Check size={17} color={GREEN} /> : <Share2 size={16} color={INK} />}
          </button>

          {store.hero_title && (
            <p style={{ position: 'absolute', left: 16, right: 16, bottom: 34, margin: 0, color: '#fff', fontSize: 15, fontWeight: 600, lineHeight: 1.35, whiteSpace: 'pre-line', textShadow: '0 1px 6px rgba(0,0,0,.35)' }}>
              {store.hero_title}
            </p>
          )}
        </div>

        {/* ── Carte identité qui chevauche la bannière ── */}
        <div style={{ padding: '0 10px', marginTop: -18, position: 'relative' }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: '0 6px 20px rgba(15,20,25,.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 58, height: 58, borderRadius: 16, background: ORANGE_FILM, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {store.brand_logo_url
                  ? <img src={store.brand_logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover'}} loading="lazy"/>
                  : <span style={{ fontSize: 24, fontWeight: 700, color: ORANGE }}>{(supplier.company_name || '?')[0]}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{supplier.company_name}</span>
                  {supplier.verification_status === 'verified' && <BadgeCheck size={17} fill={ORANGE} stroke="#fff" style={{ flexShrink: 0 }} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: MUTE, marginTop: 3 }}>
                  <MapPin size={12} />{supplier.city}{supplier.wilaya ? `, ${supplier.wilaya}` : ''}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <span style={{ display: 'inline-flex', gap: 1 }}>
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill={s <= Math.round(rating) ? '#FFB800' : '#E5E7EB'} stroke="none" />)}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{rating.toFixed(1)}</span>
              <span style={{ fontSize: 12, color: FAINT, textDecoration: 'underline' }} onClick={() => goTo('reviews')}>{supplier.rating_count} avis</span>
              <span style={{ color: '#DDD' }}>|</span>
              <span style={{ fontSize: 12, color: FAINT }}>{fmtCount(supplier.followers_count)} abonnés</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={handleContact}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 12, border: 'none', background: ORANGE, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                <MessageCircle size={16} /> Contacter
              </button>
              <button onClick={() => setFollowing((f) => !f)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, background: following ? ORANGE_TINT : '#fff', color: following ? ORANGE : INK, border: `1.5px solid ${following ? ORANGE : '#E5E5E5'}` }}>
                {following ? <><Check size={16} /> Abonné</> : 'Suivre'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Barre d'onglets collante ── */}
        <div style={{ position: 'sticky', top: 0, zIndex: 900, background: '#fff', borderBottom: `1px solid ${LINE}`, marginTop: 10 }}>
          <div style={{ display: 'flex', height: TABS_H, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {TABS.map((t) => {
              const on = activeTab === t.id
              return (
                <button key={t.id} onClick={() => goTo(t.id)}
                  style={{ flex: 1, minWidth: 84, position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: on ? 800 : 600, color: on ? ORANGE : MUTE, padding: 0 }}>
                  {t.label}
                  <span style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)', width: on ? 26 : 0, height: 3, borderRadius: 2, background: ORANGE, transition: 'width .2s' }} />
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Stats desktop (mêmes que la home desktop) ── */}
        <SupplierStats
          supplier={supplier}
          store={store}
          productsCount={products.length || 0}
          onCta={handleSeeAllProducts}
          editable={false}
        />
      </section>

      {/* ═══════════════════ SECTION PRODUITS ═══════════════════ */}
      <section id="section-products" style={{ scrollMarginTop: TABS_H }}>
        <SectionTitle
          small="Catalogue"
          title="Nos produits"
          subtitle="Découvrez notre gamme complète de produits disponibles en gros pour les professionnels."
        />
        <SupplierProducts
          products={products}
          supplierSlug={supplier.slug}
          onSeeAll={handleSeeAllProducts}
        />
      </section>

      {/* ═══════════════════ SECTION PROFIL ═══════════════════ */}
      <section id="section-profile" style={{ scrollMarginTop: TABS_H }}>
        <SectionTitle
          small="Qui sommes-nous"
          title="Profil de l'entreprise"
          subtitle="Découvrez l'histoire, la mission et les coulisses de notre fournisseur."
        />
        <SupplierAbout
          supplier={supplier}
          store={store}
          onContact={handleContact}
          editable={false}
        />
      </section>

      {/* ═══════════════════ SECTION AVIS ═══════════════════ */}
      <section id="section-reviews" style={{ scrollMarginTop: TABS_H }}>
        <SectionTitle
          small="Témoignages"
          title="Avis clients"
          subtitle="Ce que disent les professionnels qui font confiance à ce fournisseur sur GROSHOP."
        />
        <SupplierReviews reviews={reviews} />
      </section>

      <Footer />

      {/* ── Barre d'action fixe (chrome mobile conservé) ── */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1100, background: '#fff', borderTop: `1px solid ${LINE}`, boxShadow: '0 -2px 12px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px calc(10px + env(safe-area-inset-bottom))' }}>
        <button onClick={() => setFollowing((f) => !f)}
          style={{ flexShrink: 0, width: 50, height: 48, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: following ? ORANGE_TINT : '#fff', color: ORANGE, border: `1.5px solid ${ORANGE}` }}>
          {following ? <Check size={20} /> : <Users size={20} />}
        </button>
        <button onClick={handleSeeAllProducts}
          style={{ flex: 1, height: 48, borderRadius: 12, border: `1.5px solid ${ORANGE}`, background: '#fff', color: ORANGE, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Catalogue
        </button>
        <button onClick={handleContact}
          style={{ flex: 1, height: 48, borderRadius: 12, border: 'none', background: ORANGE, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <MessageCircle size={18} /> Contacter
        </button>
      </div>
    </div>
  )
}