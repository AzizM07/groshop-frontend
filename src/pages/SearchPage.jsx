// pages/SearchPage.jsx — GROSHOP.tn
// Résultats de recherche — /search?q=... ou /search?cat=<id>
// Mobile : layout façon AliExpress (hero + chips rondes + masonry 2 colonnes)
// Desktop : layout existant (grille + filtres + tri)

import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { products as productsApi } from '../lib/api'
import { usePageTracking } from '../hooks/usePageTracking'
import { useIsMobile } from '../hooks/useIsMobile'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
import AdSlot from '../components/AdSlot'
import SearchCategoryBannerDesktop from '../components/SearchCategoryBannerDesktop'
import SearchCategoryBannerMobile from '../components/SearchCategoryBannerMobile'

const LAYOUT = { maxWidth: '1500px', padding: '0 2%' }
const ORANGE = '#FF7A00'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

/* ── Cache mémoire des résultats déjà chargés ──
   Clé : "q::cat" → affichage instantané au retour sur un onglet déjà visité,
   pendant qu'on revalide en arrière-plan (même principe que _cache dans DesktopHeader). */
const _searchResultsCache = new Map()

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

/* ── Django API → props ProductCard ── */
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
    images:         extractImages(p),
    supplier:       p.supplier_name,
    supplierSlug:   p.supplier_slug,
  }
}

function extractImages(p) {
  const raw = p.images || p.gallery || p.product_images || p.image_urls || []
  const list = (Array.isArray(raw) ? raw : [])
    .map(im => (typeof im === 'string' ? im : (im?.image || im?.url || im?.src)))
    .filter(Boolean)
  return list.length ? list : null
}

/* ── Cherche récursivement une catégorie par ID dans l'arbre ── */
function findCategoryById(cats, id) {
  if (!id) return null
  const target = String(id)
  for (const c of cats || []) {
    if (String(c.id) === target) return c
    const found = findCategoryById(c.children || [], id)
    if (found) return found
  }
  return null
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
  s.textContent = `
    @keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes gsSlideIn {
      from { transform: translateX(var(--gs-slide-from, 28px)); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
  `
  document.head.appendChild(s)
}

const SORTS = [
  { key: 'relevance',  label: 'Pertinence' },
  { key: 'price_asc',  label: 'Prix croissant' },
  { key: 'price_desc', label: 'Prix décroissant' },
  { key: 'sold',       label: 'Meilleures ventes' },
  { key: 'rating',     label: 'Mieux notés' },
]

/* ══════════════ Grille MASONRY 2 colonnes (mobile) ══════════════ */
function MasonryProducts({ items = [], loading = false, adEvery = 8, gap = 8 }) {
  if (loading) {
    const cols = [[], []]
    for (let i = 0; i < 8; i++) cols[i % 2].push(i)
    return (
      <div style={{ display: 'flex', gap, alignItems: 'flex-start' }}>
        {cols.map((col, c) => (
          <div key={c} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap }}>
            {col.map(i => <SkeletonCard key={i} />)}
          </div>
        ))}
      </div>
    )
  }

  const stream = []
  items.forEach((p, i) => {
    stream.push({ kind: 'product', data: p })
    if (adEvery && (i + 1) % adEvery === 0) stream.push({ kind: 'ad', at: i })
  })
  const cols = [[], []]
  stream.forEach((it, idx) => cols[idx % 2].push(it))

  return (
    <div style={{ display: 'flex', gap, alignItems: 'flex-start' }}>
      {cols.map((col, c) => (
        <div key={c} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap }}>
          {col.map(it => it.kind === 'ad'
            ? <AdSlot key={`ad-${it.at}`} index={it.at} />
            : <ProductCard key={it.data.id} product={mapProduct(it.data)} variant="wholesale" />)}
        </div>
      ))}
    </div>
  )
}

/* ══════════════ Chip pilule sous-catégorie (mobile, style neutre) ══════════════ */
function SubIcon({ label, img, emoji, active, heart, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '2px 12px 2px 2px',
      borderRadius: 999,
      border: active ? '1.5px solid #0F1419' : '1.5px solid #E5E7EB',
      background: '#fff',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all .18s',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: '50%', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, background: '#F4F5F7',
      }}>
        {heart ? (
          <span style={{ fontSize: 12, color: '#E53935' }}>♥</span>
        ) : img ? (
          <img src={img} alt={label}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <span style={{ fontSize: 11 }}>{emoji || (label && label[0])}</span>
        )}
      </span>
      <span style={{
        fontSize: 13, color: '#0F1419',
        fontWeight: 500,
      }}>{label}</span>
    </button>
  )
}

/* ══════════════════════════ VUE MOBILE ══════════════════════════ */
function MobileSearchView({ query, cat, catObj, results, loading, error, banner, goBannerLink, direction }) {
  const [activeSub, setActiveSub] = useState('all')
  const subs = catObj?.children || []

  useEffect(() => { setActiveSub('all') }, [cat])

  const activeSubObj = activeSub !== 'all'
    ? subs.find(s => String(s.id) === String(activeSub))
    : null

  const shown = useMemo(() => {
    if (activeSub === 'all' || !activeSubObj) return results
    return results.filter(p => p.category_name === activeSubObj.name)
  }, [results, activeSub, activeSubObj])

  const gridLabel = query
    ? `${shown.length} résultat${shown.length > 1 ? 's' : ''}`
    : (activeSubObj?.name || catObj?.name || 'Top ventes')

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', fontFamily: FONT }}>

      {banner?.image_url && (
        <div style={{ background: '#fff' }}>
          <SearchCategoryBannerMobile banner={banner} onClick={goBannerLink} />
        </div>
      )}

      {subs.length > 0 && (
        <div style={{
          background: '#fff',
          display: 'flex', gap: 10, overflowX: 'auto',
          padding: '10px 12px 12px',
          WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
        }}
        className="gs-nosb">
          <SubIcon label="Tout" active={activeSub === 'all'} onClick={() => setActiveSub('all')} heart />
          {subs.map(s => (
            <SubIcon key={s.id} label={s.name} img={s.image_url} emoji={s.emoji}
              active={activeSub === String(s.id)}
              onClick={() => setActiveSub(String(s.id))} />
          ))}
        </div>
      )}

      {!loading && shown.length > 0 && (
        <div style={{
          background: '#fff',
          padding: '10px 14px 8px',
          fontSize: 13, fontWeight: 600, color: '#3D4853',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span>{gridLabel}</span>
          <span style={{ fontSize: 11, color: '#8A94A0' }}>▼</span>
        </div>
      )}

      {/* ⭐ key change → relance l'animation de slide à chaque nouvelle catégorie/sous-catégorie
           opacity → fade doux pendant la revalidation réseau, même si contenu déjà affiché via cache */}
<div
  key={`${query}::${cat}::${activeSub}`}
  style={{
    padding: '8px 8px 80px',
    animation: 'gsSlideIn .28s ease',
    '--gs-slide-from': `${direction * 28}px`,
  }}
>
        {error ? (
          <EmptyState icon="⚠️" title="Erreur" text={error} />
        ) : !query && !cat ? (
          <EmptyState icon="🔍" title="Que cherchez-vous ?" text="Saisissez un produit ou choisissez une catégorie." />
        ) : shown.length === 0 && !loading ? (
          <EmptyState
            icon="📦"
            title="Aucun résultat"
            text={activeSubObj
              ? `Aucun produit dans « ${activeSubObj.name} ».`
              : query
                ? `Aucun produit ne correspond à « ${query} ».`
                : `Aucun produit dans cette catégorie pour le moment.`}
          />
        ) : shown.length === 0 && loading ? (
          <MasonryProducts loading />
        ) : (
          <MasonryProducts items={shown} />
        )}
      </div>

      <style>{`
        .gs-nosb::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

/* ═══════════════════════════ PAGE ═══════════════════════════ */
export default function SearchPage() {
  const [params]  = useSearchParams()
  const query     = (params.get('q')   || '').trim()
  const cat       = (params.get('cat') || '').trim()   // ID de catégorie
  const navigate  = useNavigate()
  const isMobile  = useIsMobile()

  const [results, setResults] = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [sort, setSort]       = useState('relevance')
  const [category, setCategory] = useState(null)  // filtre desktop (par nom)
  const [banner, setBanner]   = useState(null)
  const [catObj, setCatObj]   = useState(null)

  // ── Direction du slide : ordre des catégories racines + comparaison ancien/nouveau ──
  const [catOrder, setCatOrder] = useState([])
  const prevCatRef = useRef(cat)
  const [direction, setDirection] = useState(1)

  usePageTracking({ pageType: 'search' })

  /* ── Ordre des catégories (pour déterminer le sens du slide) ── */
  useEffect(() => {
    productsApi.categories()
      .then(tree => setCatOrder((tree || []).map(c => String(c.id))))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const prevIdx = catOrder.indexOf(prevCatRef.current)
    const curIdx  = catOrder.indexOf(cat)
    if (prevIdx !== -1 && curIdx !== -1 && prevIdx !== curIdx) {
      setDirection(curIdx > prevIdx ? 1 : -1)
    }
    prevCatRef.current = cat
  }, [cat, catOrder])

  /* ── Résolution de la catégorie via l'arbre ── */
  useEffect(() => {
    if (!cat) { setCatObj(null); return }
    let alive = true
    productsApi.categories()
      .then(tree => { if (alive) setCatObj(findCategoryById(tree || [], cat)) })
      .catch(() => { if (alive) setCatObj(null) })
    return () => { alive = false }
  }, [cat])

  /* ── Chargement des résultats, avec cache stale-while-revalidate ──
     q présent → products.search()
     q absent + cat présent → products.list({ category_id, include_descendants: 1 })
     Un retour sur un q/cat déjà visité affiche le cache instantanément
     pendant qu'une requête rafraîchit les données en arrière-plan. */
  useEffect(() => {
    if (!query && !cat) {
      setResults([]); setTotal(0); setLoading(false)
      return
    }

    const cacheKey = `${query}::${cat}`
    const cached = _searchResultsCache.get(cacheKey)

    let alive = true
    if (cached) {
      setResults(cached.results)
      setTotal(cached.total)
      setLoading(false)
    } else {
      setLoading(true)
    }
    setError(null)

    const promise = query
      ? productsApi.search(query, cat ? { category_id: cat, include_descendants: 1 } : {})
      : productsApi.list({ category_id: cat, include_descendants: 1, page_size: 60 })

    promise
      .then(d => {
        if (!alive) return
        const list = d?.results || d || []
        const newResults = Array.isArray(list) ? list : []
        const newTotal = d?.total ?? d?.count ?? newResults.length
        _searchResultsCache.set(cacheKey, { results: newResults, total: newTotal })
        setResults(newResults)
        setTotal(newTotal)
      })
      .catch(() => { if (alive && !cached) setError('Erreur lors de la recherche.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [query, cat])

  /* ── Bannière : par mot-clé OU par nom de catégorie résolu ── */
  useEffect(() => {
    if (typeof productsApi.categoryBanner !== 'function') { setBanner(null); return }
    const term = query || catObj?.name || ''
    if (!term) { setBanner(null); return }
    let alive = true
    productsApi.categoryBanner(term)
      .then(d => { if (alive) setBanner(d?.banner || null) })
      .catch(() => { if (alive) setBanner(null) })
    return () => { alive = false }
  }, [query, catObj?.name])

  const goBannerLink = () => {
    const l = banner?.link
    if (!l) return
    if (/^https?:\/\//i.test(l)) window.open(l, '_blank', 'noopener')
    else navigate(l)
  }

  /* ══════════════════════════════════════════════════════
     MOBILE : nouvelle vue façon AliExpress
     ══════════════════════════════════════════════════════ */
  if (isMobile) {
    return (
      <MobileSearchView
        query={query}
        cat={cat}
        catObj={catObj}
        results={results}
        loading={loading}
        error={error}
        banner={banner}
        goBannerLink={goBannerLink}
        direction={direction}
      />
    )
  }

  /* ══════════════════════════════════════════════════════
     DESKTOP : layout existant (inchangé)
     ══════════════════════════════════════════════════════ */

  const categories = [...new Set(results.map(p => p.category_name).filter(Boolean))]

  const catTabs = [
    { name: null, label: 'Tout', count: results.length },
    ...categories.map(c => ({
      name: c, label: c,
      count: results.filter(p => p.category_name === c).length,
    })),
  ]

  const shown = (() => {
    let r = category ? results.filter(p => p.category_name === category) : [...results]
    const num = (p) => parseFloat(p.base_price_tnd) || 0
    if (sort === 'price_asc')       r.sort((a, b) => num(a) - num(b))
    else if (sort === 'price_desc') r.sort((a, b) => num(b) - num(a))
    else if (sort === 'sold')       r.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
    else if (sort === 'rating')     r.sort((a, b) => (parseFloat(b.rating_avg) || 0) - (parseFloat(a.rating_avg) || 0))
    return r
  })()

  const displayCatName = catObj?.name || ''

  return (
    <div style={{ fontFamily: FONT }}>
      <Container style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>

        {banner && (
          <SearchCategoryBannerDesktop banner={banner} onClick={goBannerLink} />
        )}

        {!loading && (query || cat) && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0F1419' }}>
              {total} produit{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
            </span>
            {query && <span style={{ fontSize: 14, color: '#6B7785' }}> pour « {query} »</span>}
            {cat && !query && displayCatName && (
              <span style={{ fontSize: 14, color: '#6B7785' }}> dans « {displayCatName} »</span>
            )}
            {category && <span style={{ fontSize: 14, color: '#6B7785' }}> · {category}</span>}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, borderBottom: '1px solid #EEF0F2', paddingBottom: 10 }}>
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

            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, borderLeft: '1px solid #E2E5E9' }}>
              <label style={{ fontSize: 12.5, color: '#6B7785', whiteSpace: 'nowrap' }}>Trier par</label>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ padding: '8px 14px', border: '1px solid #E8EAED', borderRadius: 999, fontSize: 12.5, fontWeight: 500, color: '#0F1419', background: '#fff', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
                {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {error ? (
          <EmptyState icon="⚠️" title="Erreur" text={error} />
        ) : !query && !cat ? (
          <EmptyState icon="🔍" title="Que cherchez-vous ?" text="Saisissez un produit, une catégorie ou un fournisseur." />
        ) : loading ? (
          <div style={grid} className="gs-search-grid">{[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : shown.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Aucun résultat"
            text={results.length
              ? `Aucun produit dans « ${category} ». Essayez un autre filtre.`
              : query
                ? `Aucun produit ne correspond à « ${query} ». Essayez d'autres mots-clés.`
                : `Aucun produit dans cette catégorie pour le moment.`}
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
    <div style={{ padding: '70px 20px', textAlign: 'center', background: '#fff', borderRadius: 12, margin: 12 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#0F1419', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: '#9AA3AE', maxWidth: 420, margin: '0 auto' }}>{text}</div>
    </div>
  )
}