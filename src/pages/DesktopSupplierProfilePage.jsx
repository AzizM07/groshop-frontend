// src/pages/DesktopSupplierProfilePage.jsx — GROSHOP.tn
// Vitrine PUBLIQUE d'un fournisseur (route /fournisseur/:slug)
// Branchée sur Django : suppliers.profile(slug) + suppliers.products(slug)
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePageTracking } from '../hooks/usePageTracking'
import { suppliers as suppliersApi, messaging as messagingApi } from '../lib/api'
import SupplierBanner   from '../components/supplier/SupplierBanner'
import SectionTitle     from '../components/supplier/SectionTitle'
import SupplierStats    from '../components/supplier/SupplierStats'
import SupplierProducts from '../components/supplier/SupplierProducts'
import SupplierAbout    from '../components/supplier/SupplierAbout'
import SupplierReviews  from '../components/supplier/SupplierReviews'
import Footer           from '../components/Footer'

/* ── Helpers ──────────────────────────────────────────────────────
   La réponse de /auth/suppliers/<slug>/ peut renvoyer la vitrine
   imbriquée (data.store), sous un autre nom (data.supplier_store),
   ou à plat sur data. On couvre les trois cas — même stratégie que
   SupplierCataloguePage. ── */
const pickStore = (d) => d?.store ?? d?.supplier_store ?? d ?? {}

// {results:[…]} (DRF paginé) OU tableau nu.
const unwrap = (r) => (Array.isArray(r) ? r : r?.results ?? [])

// Prix affiché = plus bas palier si price_tiers, sinon base_price_tnd.
const computePrice = (p) => {
  const prices = (p.price_tiers || [])
    .map((t) => parseFloat(t.price_tnd))
    .filter((n) => !isNaN(n))
  if (prices.length) return Math.min(...prices)
  return parseFloat(p.base_price_tnd) || 0
}

export default function DesktopSupplierProfilePage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)

  const [supplier, setSupplier] = useState(null)
  const [store, setStore]       = useState(null)
  const [products, setProducts] = useState([])
  const [reviews, setReviews]   = useState([])

  /* ── Chargement depuis le backend ── */
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

        // ── Entête fournisseur (nom, note, ville, statut…) ──
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

        // ── Vitrine : on garde TOUT l'objet store tel quel (hero_title,
        //    stats_*, about_*, highlight_*, description, mission,
        //    certifications, response_rate…). On ne normalise que le
        //    logo et la bannière, qui ont plusieurs alias possibles. ──
        setStore({
          ...raw,
          brand_logo_url: raw.brand_logo_url || raw.logo_url || raw.logo || '',
          banner_url:     raw.banner_url     || raw.banner    || '',
          // certifications : le back renvoie une chaîne CSV, SupplierAbout attend un tableau.
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

        // ── Avis boutique : embarqués dans la réponse profil s'ils
        //    existent, sinon vide (SupplierReviews gère la liste vide). ──
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

    const sections = ['home', 'products', 'profile', 'reviews']
    const observers = []

    sections.forEach((id) => {
      const el = document.getElementById(`section-${id}`)
      if (!el) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveTab(id)
          })
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [loading])

  /* ── Handlers publics ── */
  const handleContact = async () => {
    if (!supplier?.slug) return
    try {
      // Ouvre (ou récupère) la conversation avec ce fournisseur
      await messagingApi.startConversation(supplier.slug)
      navigate('/dashboard/messages') // ← ajuste la route si besoin
    } catch (e) {
      // Non connecté → redirige vers la connexion
      if (e?.status === 401) navigate('/login')
      else alert("Impossible d'ouvrir la messagerie pour le moment.")
    }
  }

  const handleSeeAllProducts = () => {
    navigate(`/fournisseur/${supplier.slug}/catalogue`)
  }

  if (loading) return (
    <div style={centerStyle}>Chargement de la vitrine…</div>
  )

  if (notFound || !supplier) return (
    <div style={{ ...centerStyle, flexDirection: 'column', gap: 12 }}>
      <span>Ce fournisseur est introuvable.</span>
      <button
        onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', color: '#FF5E00', fontWeight: 700, cursor: 'pointer' }}
      >
        Retour à l'accueil
      </button>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg,#FFFFFF 0%,#F8F8FB 100%)',
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
    }}>

      {/* ═══════════════════ SECTION HOME ═══════════════════ */}
      <section id="section-home">
        <SupplierBanner
          supplier={supplier}
          store={store}
          activeTab={activeTab}
          onContact={handleContact}
          editable={false}
        />

        <SupplierStats
          supplier={supplier}
          store={store}
          productsCount={products.length || 0}
          editable={false}
        />
      </section>

      {/* ═══════════════════ SECTION PRODUCTS ═══════════════════ */}
      <section id="section-products">
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

      {/* ═══════════════════ SECTION PROFILE ═══════════════════ */}
      <section id="section-profile" style={{ paddingTop: 60 }}>
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
      <section id="section-reviews" style={{ paddingTop: 60, paddingBottom: 120 }}>
        <SectionTitle
          small="Témoignages"
          title="Avis clients"
          subtitle="Ce que disent les professionnels qui font confiance à ce fournisseur sur GROSHOP."
        />

        <SupplierReviews reviews={reviews} />
      </section>

      <Footer />
    </div>
  )
}

/* ── Styles ── */
const centerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(180deg,#FFFFFF 0%,#F8F8FB 100%)',
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
  color: '#666',
  fontSize: 14,
}