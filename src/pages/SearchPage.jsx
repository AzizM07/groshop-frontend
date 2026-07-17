// pages/SearchPage.jsx — GROSHOP.tn
// Résultats de recherche — /search?q=...

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { products as productsApi } from '../lib/api'
import { usePageTracking } from '../hooks/usePageTracking'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'

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
    supplier:       p.supplier_name,
    supplierSlug:   p.supplier_slug,
  }
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

  const [results, setResults] = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [sort, setSort]       = useState('relevance')
  const [category, setCategory] = useState(null)

  usePageTracking({ pageType: 'search' })

  useEffect(() => {
    if (!query.trim()) { setResults([]); setTotal(0); setLoading(false); return }
    let alive = true
    setLoading(true); setError(null)
    productsApi.search(query)
      .then(d => {
        if (!alive) return
        setResults(d?.results || [])
        setTotal(d?.total ?? (d?.results?.length || 0))
      })
      .catch(() => { if (alive) setError('Erreur lors de la recherche.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [query])

  /* ── Catégories présentes dans les résultats ── */
  const categories = useMemo(
    () => [...new Set(results.map(p => p.category_name).filter(Boolean))],
    [results],
  )

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

        {/* ── Fil d'Ariane ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9AA3AE', marginBottom: 14 }}>
          <Link to="/" style={{ color: '#9AA3AE', textDecoration: 'none' }}>Accueil</Link>
          <span>›</span>
          <span style={{ color: '#0F1419', fontWeight: 500 }}>Recherche</span>
        </div>

        {/* ── Titre ── */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(18px,2vw,24px)', fontWeight: 700, color: '#0F1419' }}>
            {query ? <>Résultats pour « <span style={{ color: '#FF4500' }}>{query}</span> »</> : 'Recherche'}
          </h1>
          {!loading && query && (
            <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#6B7785' }}>
              {total} produit{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
              {category && ` · filtré sur ${category}`}
            </p>
          )}
        </div>

        {/* ── Barre de filtres ── */}
        {!loading && results.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            <button onClick={() => setCategory(null)} style={chip(!category)}>Tout ({results.length})</button>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(v => v === c ? null : c)} style={chip(category === c)}>
                {c} ({results.filter(p => p.category_name === c).length})
              </button>
            ))}

            <div style={{ flex: 1 }} />

            <label style={{ fontSize: 12.5, color: '#6B7785' }}>Trier par</label>
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ padding: '8px 14px', border: '1px solid #E8EAED', borderRadius: 999, fontSize: 12.5, fontWeight: 500, color: '#0F1419', background: '#fff', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
              {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        )}

        {/* ── Contenu ── */}
        {error ? (
          <EmptyState icon="⚠️" title="Erreur" text={error} />
        ) : !query.trim() ? (
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
            {shown.map(p => <ProductCard key={p.id} product={mapProduct(p)} />)}
          </div>
        )}
      </Container>

      <Footer />

      <style>{`
        @media (max-width: 1200px) { .gs-search-grid { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (max-width: 900px)  { .gs-search-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 640px)  { .gs-search-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  )
}

const grid = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }

const chip = (active) => ({
  padding: '7px 14px',
  borderRadius: 999,
  border: `1px solid ${active ? '#FF4500' : '#E8EAED'}`,
  background: active ? '#FFF4F0' : '#fff',
  color: active ? '#FF4500' : '#6B7785',
  fontSize: 12.5,
  fontWeight: active ? 600 : 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
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