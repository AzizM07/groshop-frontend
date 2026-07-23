// src/components/MobileSupplierProfilePage.jsx — GROSHOP.tn
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Star, MapPin, BadgeCheck, MessageCircle, Share2, Check,
  Eye, Users, Clock, Package, Award, ChevronRight, ChevronDown, Calendar,
} from 'lucide-react'
import { usePageTracking } from '../../hooks/usePageTracking'
import Footer from '../Footer'

/* Même teinte orange que le reste du projet */
const ORANGE      = '#ff5e20'
const ORANGE_TINT = 'rgba(255, 94, 32, .12)'
const ORANGE_FILM = 'rgba(255, 94, 32, .08)'

const INK='#0F1419', SUB='#3D4853', MUTE='#6B7785', FAINT='#9AA3AE', LINE='#ECEEF1', BG='#F0F0F0', GREEN='#0E9F6E'
const FONT='-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const TABS_H = 50                 // hauteur de la barre d'onglets collante

const TABS = [
  { id: 'home',     label: 'Accueil'  },
  { id: 'products', label: 'Produits' },
  { id: 'profile',  label: 'Profil'   },
  { id: 'reviews',  label: 'Avis'     },
]

const toNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n }
const fmtNum = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtCount = (n) => {
  const v = Number(n) || 0
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1).replace('.', ',')} K`
  return String(v)
}

export default function MobileSupplierProfilePage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading]     = useState(true)

  const [supplier, setSupplier] = useState(null)
  const [store, setStore]       = useState(null)
  const [products, setProducts] = useState([])
  const [reviews, setReviews]   = useState([])

  const [following, setFollowing] = useState(false)
  const [copied, setCopied]       = useState(false)
  const [lightbox, setLightbox]   = useState(null)

  /* ── Chargement des données (même mock que la version desktop) ── */
  useEffect(() => {
    async function loadSupplier() {
      setLoading(true)
      await new Promise((r) => setTimeout(r, 200))

      setSupplier({
        company_name: 'Sfax Textile Co.',
        slug: slug || 'sfax-textile-co',
        city: 'Sfax',
        wilaya: 'Sfax',
        verification_status: 'verified',
        rating_avg: 4.6,
        rating_count: 128,
        followers_count: 1240,
        created_at: '2012-03-15',
      })

      setStore({
        brand_logo_url: 'https://www.livinx.com/img/livinx-logo-1738657124.jpg',
        banner_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1600&q=80',
        hero_title: 'Un fournisseur de confiance\nsur lequel vous pouvez compter.',

        stats_title: "Sfax Textile Co.,\nl'expertise grossiste\nau service des pros.",
        stats_description: "Notre savoir-faire allie production de qualité, logistique fiable et accompagnement personnalisé. À chaque étape, nous garantissons un service à la hauteur des exigences professionnelles.",
        highlight_image_1: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
        highlight_image_2: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80',

        about_title_main: 'Un fournisseur de confiance.',
        about_title_accent: 'Une vision claire.',
        about_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
        about_images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=80',
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&q=80',
          'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
        ],

        description: "Sfax Textile Co. est un fournisseur grossiste spécialisé dans la fabrication et distribution de textiles de qualité supérieure depuis 2012. Notre usine basée à Sfax dispose d'une capacité de production de 50 000 pièces/mois, garantissant des délais compétitifs et une traçabilité complète de nos produits. Nous accompagnons les professionnels en Tunisie et au Maghreb avec un service personnalisé.",
        mission: "Offrir aux professionnels tunisiens et maghrébins un textile de qualité industrielle, à prix juste, avec un service humain et une traçabilité totale.",
        founded_year: 2012,
        certifications: ['ISO 9001:2015', 'OEKO-TEX', 'INNORPI'],
        page_views: 142000,
        response_rate: 94,
        response_time_hrs: 2,
      })

      setProducts([
        { id: 1, name: 'T-shirt coton premium',         subtitle: 'Lot de 12 unités', price: 84,  currency: 'TND', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
        { id: 2, name: 'Chemise Oxford homme',          subtitle: 'Lot de 6 unités',  price: 138, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80' },
        { id: 3, name: 'Polo piqué bicolore',           subtitle: 'Lot de 12 unités', price: 108, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80' },
        { id: 4, name: 'Jean slim stretch',             subtitle: 'Lot de 6 unités',  price: 192, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' },
        { id: 5, name: 'Hoodie zip intérieur molleton', subtitle: 'Lot de 6 unités',  price: 174, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80' },
        { id: 6, name: 'Veste légère coupe-vent',       subtitle: 'Lot de 4 unités',  price: 236, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80' },
      ])

      setReviews([
        { id: 1, rating: 5, text: "Qualité irréprochable et livraison rapide depuis Sfax. Les lots de t-shirts sont conformes à la description, finitions soignées.", author_name: 'Karim Ben Salah', city: 'Tunis',  avatar_url: 'https://i.pravatar.cc/150?img=12', attached_images: [] },
        { id: 2, rating: 4, text: "Bons produits, tissu conforme à la description et délai respecté. Je recommande pour les commandes en volume.",                     author_name: 'Sonia Mhiri',     city: 'Sousse', avatar_url: 'https://i.pravatar.cc/150?img=47', attached_images: [] },
        { id: 3, rating: 5, text: "Fournisseur de confiance avec lequel je travaille depuis 2 ans. Les certifications sont un vrai gage de qualité.",                 author_name: 'Nabil Trabelsi',  city: 'Sfax',   avatar_url: 'https://i.pravatar.cc/150?img=33', attached_images: [] },
      ])

      setLoading(false)
    }
    loadSupplier()
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
  const handleContact = () => alert('Fonctionnalité de contact bientôt disponible.')
  const handleSeeAllProducts = () => navigate(`/fournisseur/${supplier.slug}/catalogue`)
  const share = () => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800) }

  if (loading) return (
    <div style={{ minHeight: '70dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ width: 30, height: 30, border: `4px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gs-spin .8s linear infinite' }} />
    </div>
  )

  const rating = toNum(supplier.rating_avg)
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, n: reviews.filter((r) => Math.round(toNum(r.rating)) === star).length }))
  const yearsActive = new Date().getFullYear() - (store.founded_year || new Date().getFullYear())

  return (
    <div style={{ background: BG, minHeight: '100dvh', fontFamily: FONT, paddingBottom: 'calc(78px + env(safe-area-inset-bottom))' }}>

      {/* ═══════════════════ SECTION ACCUEIL ═══════════════════ */}
      <section id="section-home" style={{ scrollMarginTop: TABS_H }}>

        {/* Bannière + identité */}
        <div style={{ position: 'relative' }}>
          <div style={{ width: '100%', aspectRatio: '16 / 9', background: '#E6E6E6', overflow: 'hidden' }}>
            <img src={store.banner_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.10) 0%, rgba(0,0,0,.55) 100%)' }} />
          </div>

          <button onClick={share} aria-label="Partager la boutique"
            style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: '50%', background: '#fff', border: `1px solid ${LINE}`, boxShadow: '0 2px 8px rgba(0,0,0,.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
            {copied ? <Check size={17} color={GREEN} /> : <Share2 size={16} color={INK} />}
          </button>

          <p style={{ position: 'absolute', left: 16, right: 16, bottom: 34, margin: 0, color: '#fff', fontSize: 15, fontWeight: 600, lineHeight: 1.35, whiteSpace: 'pre-line', textShadow: '0 1px 6px rgba(0,0,0,.35)' }}>
            {store.hero_title}
          </p>
        </div>

        {/* Carte identité qui chevauche la bannière */}
        <div style={{ padding: '0 10px', marginTop: -18, position: 'relative' }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 58, height: 58, borderRadius: 16, background: ORANGE_FILM, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {store.brand_logo_url
                  ? <img src={store.brand_logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 24, fontWeight: 700, color: ORANGE }}>{supplier.company_name[0]}</span>}
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

        {/* Barre d'onglets collante */}
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

        {/* Statistiques */}
        <div style={{ padding: '10px 10px 0' }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatTile icon={Package}  value={products.length || 48}                 label="Produits en ligne" />
              <StatTile icon={Star}     value={`${rating.toFixed(1)} / 5`}            label={`${supplier.rating_count} avis`} />
              <StatTile icon={Clock}    value={`${store.response_rate} %`}            label={`Réponse sous ${store.response_time_hrs} h`} />
              <StatTile icon={Eye}      value={fmtCount(store.page_views)}            label="Vues de la boutique" />
              <StatTile icon={Users}    value={fmtCount(supplier.followers_count)}    label="Abonnés" />
              <StatTile icon={Calendar} value={store.founded_year}                    label={`${yearsActive} ans d'activité`} />
            </div>
          </div>

          {/* Bloc éditorial */}
          <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginTop: 10 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: INK, lineHeight: 1.25, letterSpacing: '-0.3px', whiteSpace: 'pre-line' }}>
              {store.stats_title}
            </h2>
            <p style={{ margin: '10px 0 0', fontSize: 13.5, color: SUB, lineHeight: 1.65 }}>{store.stats_description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
              {[store.highlight_image_1, store.highlight_image_2].filter(Boolean).map((src, i) => (
                <div key={i} style={{ width: '100%', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', background: '#F5F5F5' }}>
                  <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION PRODUITS ═══════════════════ */}
      <section id="section-products" style={{ scrollMarginTop: TABS_H, padding: '10px 10px 0' }}>
        <SectionTitle small="Catalogue" title="Nos produits" subtitle="La gamme complète disponible en gros pour les professionnels." />

        <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginTop: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {products.map((p) => (
              <div key={p.id} onClick={() => navigate(`/produit/${p.id}`)} style={{ cursor: 'pointer' }}>
                <div style={{ width: '100%', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', background: '#F5F5F5' }}>
                  {p.image_url
                    ? <img src={p.image_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📦</div>}
                </div>
                <div style={{ fontSize: 13, color: SUB, lineHeight: 1.3, marginTop: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 34 }}>{p.name}</div>
                {p.subtitle && <div style={{ fontSize: 11.5, color: FAINT, marginTop: 3 }}>{p.subtitle}</div>}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: ORANGE }}>{fmtNum(p.price)}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: ORANGE }}>{p.currency}</span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSeeAllProducts}
            style={{ width: '100%', marginTop: 16, height: 46, borderRadius: 12, background: '#fff', border: `1.5px solid ${ORANGE}`, color: ORANGE, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            Voir tout le catalogue <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* ═══════════════════ SECTION PROFIL ═══════════════════ */}
      <section id="section-profile" style={{ scrollMarginTop: TABS_H, padding: '10px 10px 0' }}>
        <SectionTitle small="Qui sommes-nous" title="Profil de l'entreprise" subtitle="L'histoire, la mission et les coulisses du fournisseur." />

        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', marginTop: 10 }}>
          {store.about_image_url && (
            <div style={{ width: '100%', aspectRatio: '16 / 10', background: '#F5F5F5' }}>
              <img src={store.about_image_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ padding: 16 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: INK, lineHeight: 1.25, letterSpacing: '-0.3px' }}>
              {store.about_title_main}<br />
              <span style={{ color: ORANGE }}>{store.about_title_accent}</span>
            </h2>
            <p style={{ margin: '12px 0 0', fontSize: 13.5, color: SUB, lineHeight: 1.7 }}>{store.description}</p>

            {store.mission && (
              <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 14, background: ORANGE_FILM, borderLeft: `3px solid ${ORANGE}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: ORANGE, letterSpacing: '.5px' }}>NOTRE MISSION</div>
                <p style={{ margin: '6px 0 0', fontSize: 13.5, color: SUB, lineHeight: 1.6 }}>{store.mission}</p>
              </div>
            )}

            {store.certifications?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 4, height: 14, background: ORANGE, borderRadius: 2 }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: INK, letterSpacing: '.5px' }}>CERTIFICATIONS</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {store.certifications.map((c) => (
                    <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F5F5F5', border: `1px solid ${LINE}`, borderRadius: 10, padding: '7px 12px', fontSize: 12.5, fontWeight: 600, color: SUB }}>
                      <Award size={14} color={ORANGE} /> {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {store.about_images?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 18, padding: '16px 0 16px 16px', marginTop: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: INK, marginBottom: 12 }}>En coulisses</div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingRight: 16, scrollbarWidth: 'none' }}>
              {store.about_images.map((src, i) => (
                <button key={i} onClick={() => setLightbox({ photos: store.about_images, index: i })}
                  style={{ flex: '0 0 150px', width: 150, height: 150, borderRadius: 12, overflow: 'hidden', padding: 0, border: `1px solid ${LINE}`, background: '#F5F5F5', cursor: 'pointer' }}>
                  <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════ SECTION AVIS ═══════════════════ */}
      <section id="section-reviews" style={{ scrollMarginTop: TABS_H, padding: '10px 10px 0' }}>
        <SectionTitle small="Témoignages" title="Avis clients" subtitle="Ce que disent les professionnels qui font confiance à ce fournisseur." />

        <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginTop: 10 }}>
          {/* Résumé + distribution */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18 }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: INK, lineHeight: 1 }}>{rating.toFixed(1)}</div>
              <span style={{ display: 'inline-flex', gap: 1, marginTop: 4 }}>
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} fill={s <= Math.round(rating) ? '#FFB800' : '#E5E7EB'} stroke="none" />)}
              </span>
              <div style={{ fontSize: 11, color: MUTE, marginTop: 3 }}>{supplier.rating_count} avis</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {dist.map(({ star, n }) => {
                const pct = reviews.length ? (n / reviews.length) * 100 : 0
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: MUTE, width: 22 }}>{star}★</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 4, background: '#EEF0F2', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#FFB800' }} />
                    </div>
                    <span style={{ fontSize: 11, color: FAINT, width: 20, textAlign: 'right' }}>{n}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Liste */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.length === 0
              ? <p style={{ margin: 0, fontSize: 13, color: FAINT }}>Aucun avis pour le moment.</p>
              : reviews.map((r) => (
                <div key={r.id} style={{ borderTop: `1px solid ${LINE}`, paddingTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', background: ORANGE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                      {r.avatar_url
                        ? <img src={r.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (r.author_name || '?')[0]?.toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{r.author_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ display: 'inline-flex', gap: 1 }}>
                          {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={11} fill={s <= Math.round(r.rating) ? '#FFB800' : '#E5E7EB'} stroke="none" />)}
                        </span>
                        {r.city && <span style={{ fontSize: 11, color: FAINT }}>{r.city}</span>}
                      </div>
                    </div>
                  </div>
                  {r.text && <p style={{ margin: '8px 0 0', fontSize: 13, color: SUB, lineHeight: 1.5 }}>{r.text}</p>}
                  {r.attached_images?.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      {r.attached_images.map((src, i) => (
                        <button key={i} onClick={() => setLightbox({ photos: r.attached_images, index: i })}
                          style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', padding: 0, border: `1px solid ${LINE}`, cursor: 'pointer', background: '#F7F8FA' }}>
                          <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </section>

      <div style={{ marginTop: 10 }}><Footer /></div>

      {/* Barre d'action fixe */}
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

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <img src={lightbox.photos[lightbox.index]} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '84vh', objectFit: 'contain', borderRadius: 8 }} />
          {lightbox.photos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setLightbox((l) => ({ ...l, index: (l.index - 1 + l.photos.length) % l.photos.length })) }}
                style={{ position: 'fixed', left: 14, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.15)', color: '#fff', cursor: 'pointer', fontSize: 22 }}>‹</button>
              <button onClick={(e) => { e.stopPropagation(); setLightbox((l) => ({ ...l, index: (l.index + 1) % l.photos.length })) }}
                style={{ position: 'fixed', right: 14, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.15)', color: '#fff', cursor: 'pointer', fontSize: 22 }}>›</button>
            </>
          )}
          <button onClick={() => setLightbox(null)} style={{ position: 'fixed', top: 14, right: 14, width: 42, height: 42, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.15)', color: '#fff', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>
      )}
    </div>
  )
}

/* ── Sous-composants ── */

function SectionTitle({ small, title, subtitle }) {
  return (
    <div style={{ padding: '16px 6px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 4, height: 14, background: ORANGE, borderRadius: 2 }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: ORANGE, letterSpacing: '.5px', textTransform: 'uppercase' }}>{small}</span>
      </div>
      <h2 style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 800, color: INK, letterSpacing: '-0.4px' }}>{title}</h2>
      {subtitle && <p style={{ margin: '6px 0 0', fontSize: 13, color: MUTE, lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  )
}

function StatTile({ icon: Icon, value, label }) {
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${LINE}`, padding: '12px 12px' }}>
      <Icon size={17} color={ORANGE} />
      <div style={{ fontSize: 18, fontWeight: 900, color: INK, marginTop: 6, letterSpacing: '-0.3px' }}>{value}</div>
      <div style={{ fontSize: 11, color: MUTE, marginTop: 2, lineHeight: 1.3 }}>{label}</div>
    </div>
  )
}