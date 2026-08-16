// pages/SearchPage.jsx — GROSHOP.tn
// Résultats de recherche — /search?q=...

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { products as productsApi } from '../lib/api'
import { usePageTracking } from '../hooks/usePageTracking'
import { useIsMobile } from '../hooks/useIsMobile'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
import SearchCategoryBannerDesktop from '../components/SearchCategoryBannerDesktop'
import SearchCategoryBannerMobile from '../components/SearchCategoryBannerMobile'

const LAYOUT = { maxWidth: '1500px', padding: '0 2%' }

function Container({ children, style = {} }) {
  return (
    <div style={{ maxWidth: LAYOUT.maxWidth, margin: '0 auto', padding: LAYOUT.padding, ...style }}>
      {children}
    </div>
  )
}

/* ── Prix : fourchette si paliers ── */
function computePrice(p) {
  const base  = parseFloat(p.base_price_tnd) || 0
  const tiers = p.price_tiers || []
  if (!tiers.length) return base
  const prices = tiers.map(t => parseFloat(t.price_tnd)).filter(n => !isNaN(n))
  if (!prices.length) return base
  const min = Math.min(...prices), max = Math.max(...prices)
  return min === max ? min : [min, max]
}

/* ── Django API → props ProductCard (identique à HomePage) ── */
function mapProduct(p) {
  return {
    id:             p.id,
    name:           p.name,
    price:          computePrice(p),
    was:            p.old_price_tnd ? parseFloat(p.old_price_tnd) : null,
    discount:       p.old_price_tnd
                      ? Math.round((1 - parseFloat(p.base_price_tnd) / parseFloat(p.old_price_tnd)) * 100)
                      : null,
    rating:         p.rating_avg ? parseFloat(p.rating_avg) : null,
    reviewCount:    p.rating_count ?? null,
    soldCount:      p.sold_count,
    moq:            p.moq,
    moqUnit:        p.unit || 'pcs',
    isFlash:        p.badge_flash,
    isChoice:       p.badge_choice,
    isBestSeller:   (p.sold_count || 0) > 1000,
    isFreeShipping: p.is_free_shipping || false,
    verified:       p.supplier_verified === 'approved',
    medals:         p.supplier_medals || 0,
    years:          p.years_active || null,
    flag:           '🇹🇳',
    image:          p.primary_image,
    images:         extractImages(p),          // galerie pour le carrousel
    supplier:       p.supplier_name,
    supplierSlug:   p.supplier_slug,
  }
}

/* ── Galerie d'images du produit (pour le carrousel de la carte) ──
   Forme renvoyée par l'API : p.images = [{ url: '...' }, …].
   ⚠️ Nécessite que l'endpoint de recherche renvoie bien `images`
      (champ à ajouter dans ProductListSerializer côté Django). */
function extractImages(p) {
  const raw = p.images || p.gallery || p.product_images || p.image_urls || []
  const list = (Array.isArray(raw) ? raw : [])
    .map(im => (typeof im === 'string' ? im : (im?.image || im?.url || im?.src)))
    .filter(Boolean)
  return list.length ? list : null
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E8EAED', overflow: 'hidden', animation: 'skeleton-pulse 1.5s ease-in-out infinite' }}>
      <div style={{ aspectRatio: '1/1', background: '#F0F0F0' }} />
      <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 12, background: '#F0F0F0', borderRadius: 4, width: '90%' }} />
        <div style={{ height: 12, background: '#F0F0F0', borderRadius: 4, width: '60%' }} />
        <div style={{ height: 16, background: '#F0F0F0', borderRadius: 4, width: '45%' }} />
      </div>
    </div>
  )
}

if (typeof document !== 'undefined' && !document.getElementById('skeleton-anim')) {
  const s = document.createElement('style')
  s.id = 'skeleton-anim'
  s.textContent = '@keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }'
  document.head.appendChild(s)
}

const SORTS = [
  { key: 'relevance',  label: 'Pertinence' },
  { key: 'price_asc',  label: 'Prix croissant' },
  { key: 'price_desc', label: 'Prix décroissant' },
  { key: 'sold',       label: 'Meilleures ventes' },
  { key: 'rating',     label: 'Mieux notés' },
]

export default function SearchPage() {
  const [params]  = useSearchParams()
  const query     = params.get('q') || ''
  const cat       = params.get('cat') || ''    // ⭐ AJOUTÉ
  const navigate  = useNavigate()
  const isMobile  = useIsMobile()

  const [results, setResults] = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [sort, setSort]       = useState('relevance')
  const [category, setCategory] = useState(null)
  const [banner, setBanner]   = useState(null)

  usePageTracking({ pageType: 'search' })

  /* ── Résultats : par mot-clé (q) OU par catégorie (cat) ── */
  useEffect(() => {
    // Rien à chercher si ni q ni cat
    if (!query.trim() && !cat.trim()) {
      setResults([]); setTotal(0); setLoading(false)
      return
    }
    let alive = true
    setLoading(true); setError(null)

    // ⭐ On envoie q ET/OU cat au backend. Si seulement cat, q reste vide.
    productsApi.search(query, cat ? { cat } : {})
      .then(d => {
        if (!alive) return
        setResults(d?.results || [])
        setTotal(d?.total ?? (d?.results?.length || 0))
      })
      .catch(() => { if (alive) setError('Erreur lors de la recherche.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [query, cat])

  /* ── Bannière (uniquement si mot-clé) ── */
  useEffect(() => {
    if (!query.trim() || typeof productsApi.categoryBanner !== 'function') { setBanner(null); return }
    let alive = true
    productsApi.categoryBanner(query)
      .then(d => { if (alive) setBanner(d?.banner || null) })
      .catch(() => { if (alive) setBanner(null) })
    return () => { alive = false }
  }, [query])

  /* ── Bannière de la catégorie correspondant au terme recherché ── */
  useEffect(() => {
    if (!query.trim() || typeof productsApi.categoryBanner !== 'function') { setBanner(null); return }
    let alive = true
    productsApi.categoryBanner(query)
      .then(d => { if (alive) setBanner(d?.banner || null) })
      .catch(() => { if (alive) setBanner(null) })
    return () => { alive = false }
  }, [query])

  const goBannerLink = () => {
    const l = banner?.link
    if (!l) return
    if (/^https?:\/\//i.test(l)) window.open(l, '_blank', 'noopener')
    else navigate(l)
  }

  /* ── Catégories présentes dans les résultats ── */
  const categories = useMemo(
    () => [...new Set(results.map(p => p.category_name).filter(Boolean))],
    [results],
  )

  /* ── Onglets de catégories : "Tout" + chaque catégorie, avec son compte ── */
  const catTabs = useMemo(() => ([
    { name: null, label: 'Tout', count: results.length },
    ...categories.map(c => ({
      name: c, label: c,
      count: results.filter(p => p.category_name === c).length,
    })),
  ]), [results, categories])

  /* ── Filtre + tri (côté client — l'API renvoie déjà le top 20) ── */
  const shown = useMemo(() => {
    let r = category ? results.filter(p => p.category_name === category) : [...results]
    const num = (p) => parseFloat(p.base_price_tnd) || 0
    if (sort === 'price_asc')       r.sort((a, b) => num(a) - num(b))
    else if (sort === 'price_desc') r.sort((a, b) => num(b) - num(a))
    else if (sort === 'sold')       r.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
    else if (sort === 'rating')     r.sort((a, b) => (parseFloat(b.rating_avg) || 0) - (parseFloat(a.rating_avg) || 0))
    return r
  }, [results, category, sort])

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <Container style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>

        {/* ── Bannière de catégorie (1/4 de page) — Desktop ou Mobile ── */}
        {query && banner && (
          isMobile
            ? <SearchCategoryBannerMobile  banner={banner} onClick={goBannerLink} />
            : <SearchCategoryBannerDesktop banner={banner} onClick={goBannerLink} />
        )}

        {/* ── Nombre de résultats (plus de fil d'Ariane ni de gros titre) ── */}
        {!loading && (query || cat) && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0F1419' }}>
              {total} produit{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
            </span>
            {query && <span style={{ fontSize: 14, color: '#6B7785' }}> pour « {query} »</span>}
{cat && !query && <span style={{ fontSize: 14, color: '#6B7785' }}> dans « {cat} »</span>}
            {category && <span style={{ fontSize: 14, color: '#6B7785' }}> · {category}</span>}
          </div>
        )}

        {/* ── Barre de catégories (une ligne défilable + séparateurs) · Trier par à droite ── */}
        {!loading && results.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, borderBottom: '1px solid #EEF0F2', paddingBottom: 10 }}>

            {/* Onglets défilables horizontalement */}
            <div className="gs-cat-strip" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
              {catTabs.map((c, i) => {
                const active = category === c.name
                return (
                  <div key={c.name ?? 'all'} style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => setCategory(c.name)} style={catItem(active)}>
                      {c.label} <span style={{ color: active ? '#FF4500' : '#9AA3AE', fontWeight: 500 }}>({c.count})</span>
                    </button>
                    {i < catTabs.length - 1 && <span style={{ width: 1, height: 16, background: '#E2E5E9', flexShrink: 0 }} />}
                  </div>
                )
              })}
            </div>

            {/* Trier par — épinglé à droite */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, borderLeft: '1px solid #E2E5E9' }}>
              <label style={{ fontSize: 12.5, color: '#6B7785', whiteSpace: 'nowrap' }}>Trier par</label>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ padding: '8px 14px', border: '1px solid #E8EAED', borderRadius: 999, fontSize: 12.5, fontWeight: 500, color: '#0F1419', background: '#fff', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
                {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* ── Contenu ── */}
        {error ? (
          <EmptyState icon="⚠️" title="Erreur" text={error} />
) : !query.trim() && !cat.trim() ? (
  <EmptyState icon="🔍" title="Que cherchez-vous ?" text="Saisissez un produit, une catégorie ou un fournisseur." />
        ) : loading ? (
          <div style={grid} className="gs-search-grid">{[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : shown.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Aucun résultat"
            text={results.length
              ? `Aucun produit dans « ${category} ». Essayez un autre filtre.`
              : `Aucun produit ne correspond à « ${query} ». Essayez d'autres mots-clés.`}
          />
        ) : (
          <div style={grid} className="gs-search-grid">
            {shown.map(p => <ProductCard key={p.id} product={mapProduct(p)} variant="wholesale" />)}
          </div>
        )}
      </Container>

      <Footer />

      <style>{`
        .gs-cat-strip::-webkit-scrollbar { display: none; }
        .gs-cat-strip { scrollbar-width: none; }
        @media (max-width: 1200px) { .gs-search-grid { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (max-width: 900px)  { .gs-search-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 640px)  { .gs-search-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  )
}

const grid = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }

const catItem = (active) => ({
  padding: '6px 14px',
  border: 'none',
  background: 'none',
  color: active ? '#FF4500' : '#3D4853',
  fontSize: 13.5,
  fontWeight: active ? 700 : 500,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  fontFamily: 'inherit',
  flexShrink: 0,
})

function EmptyState({ icon, title, text }) {
  return (
    <div style={{ padding: '70px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#0F1419', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: '#9AA3AE', maxWidth: 420, margin: '0 auto' }}>{text}</div>
    </div>
  )
}