// PopularCategoriesMobile.jsx — GROSHOP.tn
// Version MOBILE — affiche les SOUS-catégories en icônes rondes ;
// un tap lance la recherche /search?q=<nom>.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { products } from '../lib/api'

const ORANGE_DEEP = '#ff5e20'

if (typeof document !== 'undefined' && !document.getElementById('pcm-styles')) {
  const s = document.createElement('style')
  s.id = 'pcm-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
    .pcm-scroll { scroll-behavior: smooth; scrollbar-width: none; -ms-overflow-style: none; }
    .pcm-scroll::-webkit-scrollbar { display: none; }
    .pcm-item        { cursor: pointer; -webkit-tap-highlight-color: transparent; }
    .pcm-item:active .pcm-circle { transform: scale(.92); }
    .pcm-item:active .pcm-label  { color: #ff5e20; }
    @keyframes pcm-skel { 0%,100% { opacity: 1 } 50% { opacity: .45 } }
    .pcm-skel { animation: pcm-skel 1.4s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .pcm-scroll, .pcm-circle, .pcm-skel { transition: none !important; scroll-behavior: auto !important; animation: none !important; }
    }
  `
  document.head.appendChild(s)
}

function CatIcon({ name, size = 26, color = ORANGE_DEEP }) {
  const Icon = name ? Icons[name] : null
  if (!Icon) return <Icons.Grid size={size} color={color} strokeWidth={1.7} />
  return <Icon size={size} color={color} strokeWidth={1.7} />
}

// Une sous-catégorie a en principe sa propre image_url
function pickImage(sub) {
  return sub.image_url || null
}

function SkeletonItem() {
  return (
    <div style={{ flex: '0 0 auto', width: 'clamp(58px, 16vw, 66px)' }}>
      <div className="pcm-skel" style={{ width: '100%', aspectRatio: '1 / 1', background: '#F1F2F4', borderRadius: '50%' }} />
      <div className="pcm-skel" style={{ height: '9px', width: '80%', margin: '9px auto 0', background: '#F1F2F4', borderRadius: '4px' }} />
    </div>
  )
}

function CategoryCircle({ cat, onClick }) {
  const [imgFailed, setImgFailed] = useState(false)
  const imgSrc  = pickImage(cat)
  const showImg = imgSrc && !imgFailed

  return (
    <div
      className="pcm-item"
      role="button"
      tabIndex={0}
      onClick={() => onClick(cat)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(cat) } }}
      style={{ flex: '0 0 auto', width: 'clamp(58px, 16vw, 66px)', scrollSnapAlign: 'start' }}
    >
      <div
        className="pcm-circle"
        style={{
          position: 'relative', width: '100%', aspectRatio: '1 / 1', borderRadius: '50%',
          background: showImg ? '#F4F5F7' : '#FFF3EC', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .18s ease',
        }}
      >
        {showImg ? (
          <img src={imgSrc} alt={cat.name} loading="lazy" onError={() => setImgFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
        ) : (
          <CatIcon name={cat.icon} />
        )}
      </div>

      <div
        className="pcm-label"
        style={{
          textAlign: 'center', marginTop: '7px', fontSize: '11px', fontWeight: 600, color: '#374151',
          fontFamily: '"DM Sans", sans-serif', lineHeight: 1.2, letterSpacing: '-.1px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color .18s',
        }}
      >
        {cat.name}
      </div>
    </div>
  )
}

export default function PopularCategoriesMobile({ limit = 24, seeAllPath = '/categories' }) {
  const cachedInit = products.categoriesCached()

  const [categories, setCategories] = useState(cachedInit || [])
  const [loading, setLoading]       = useState(!cachedInit)
  const [error, setError]           = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (cachedInit) return
    let cancelled = false
    products.categories()
      .then(data => { if (!cancelled) { setCategories(data || []); setLoading(false) } })
      .catch(err => { if (!cancelled) { console.error('[PopularCategoriesMobile] fetch error:', err); setError('Impossible de charger les catégories.'); setLoading(false) } })
    return () => { cancelled = true }
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  // Tap sur une sous-catégorie → recherche par son nom
  const goTo = (sub) => navigate(`/search?q=${encodeURIComponent(sub.name)}`)

  // Sous-catégories = enfants aplatis de toutes les grandes catégories
  const subcategories = categories.flatMap(c => c.children || [])
  const displayed = subcategories.slice(0, limit)

  return (
    <section style={{ padding: '1.1rem 0 .4rem', fontFamily: '"DM Sans", -apple-system, sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 14px', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F1419', letterSpacing: '-.3px' }}>
          Catégories <span style={{ color: ORANGE_DEEP }}>populaires</span>
        </h2>
        <button type="button" onClick={() => navigate(seeAllPath)}
          style={{ border: 'none', background: 'none', padding: 0, fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 600, color: ORANGE_DEEP, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Voir tout →
        </button>
      </div>

      {error && !loading && (
        <div style={{ color: '#D32F2F', fontSize: '12px', textAlign: 'center', padding: '14px' }}>{error}</div>
      )}

      {!error && (
        <div className="pcm-scroll" style={{ display: 'flex', gap: '14px', overflowX: 'auto', padding: '2px 14px 6px', scrollSnapType: 'x proximity' }}>
          {loading
            ? [...Array(6)].map((_, i) => <SkeletonItem key={i} />)
            : displayed.length === 0
              ? <div style={{ fontSize: '12px', color: '#9AA3AE', padding: '18px 14px', width: '100%', textAlign: 'center' }}>Aucune sous-catégorie disponible.</div>
              : displayed.map(sub => <CategoryCircle key={sub.id} cat={sub} onClick={goTo} />)
          }
        </div>
      )}
    </section>
  )
}