// PopularCategories.jsx — GROSHOP.tn
// Section "Catégories populaires" — placée entre HeroSearch et HeroGrid.
// Utilise products.categories() qui met en cache la réponse : pas de double
// fetch avec Header (mega menu), même endpoint réseau taperait qu'une fois.

import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { products } from '../lib/api'

const ORANGE      = '#ff8820'
const ORANGE_DEEP = '#ff5e20'

// ── Styles CSS injectés une seule fois ────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('pc-styles')) {
  const s = document.createElement('style')
  s.id = 'pc-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

    /* Piste horizontale : scroll fluide, scrollbar cachée */
    .pc-scroll {
      scroll-behavior: smooth;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .pc-scroll::-webkit-scrollbar { display: none; }

    /* Cartes */
    .pc-card       { cursor: pointer; transition: transform .25s ease; }
    .pc-card:hover { transform: translateY(-3px); }
    .pc-card:hover .pc-card-img {
      border-color: #ff5e20;
      box-shadow: 0 12px 26px rgba(255,94,32,.20);
    }
    .pc-card:hover .pc-card-label { color: #ff5e20; }

    /* Zoom léger sur l'image au survol */
    .pc-card-img img { transition: transform .35s ease; }
    .pc-card:hover .pc-card-img img { transform: scale(1.06); }

    /* Boutons flèches */
    .pc-nav-btn        { transition: background .2s, box-shadow .2s, transform .2s; }
    .pc-nav-btn:hover  { background: #ff5e20; box-shadow: 0 8px 22px rgba(255,94,32,.35); }
    .pc-nav-btn:hover svg { stroke: #fff; }
    .pc-nav-btn:active { transform: translateY(-50%) scale(.95); }

    /* Skeleton */
    @keyframes pc-skel-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }
    .pc-skel { animation: pc-skel-pulse 1.5s ease-in-out infinite; }

    @media (prefers-reduced-motion: reduce) {
      .pc-scroll, .pc-card, .pc-nav-btn, .pc-skel, .pc-card-img img {
        transition: none !important;
        scroll-behavior: auto !important;
        animation: none !important;
      }
    }
  `
  document.head.appendChild(s)
}

// ── Icône Lucide dynamique (fallback ultime : Grid) ───────────
function CatIcon({ name, size = 44, color = '#6B7280' }) {
  const Icon = name ? Icons[name] : null
  if (!Icon) return <Icons.Grid size={size} color={color} strokeWidth={1.4} />
  return <Icon size={size} color={color} strokeWidth={1.4} />
}

// ── Cascade de fallback pour la vignette ──────────────────────
// 1) image_url sur la catégorie elle-même
// 2) image_url de la première sous-catégorie qui en a une
//    (le backend renvoie souvent les images sur les subs, pas sur les cats)
// 3) null → on affichera <CatIcon> (icône Lucide ou Grid par défaut)
function pickImage(cat) {
  if (cat.image_url) return cat.image_url
  const firstWithImg = cat.children?.find(c => c && c.image_url)
  return firstWithImg?.image_url || null
}

// ── Squelette pendant le chargement ───────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      flex: '0 0 auto',
      width: 'clamp(120px, 14vw, 170px)',
    }}>
      <div className="pc-skel" style={{
        aspectRatio: '1 / 1',
        background: '#F4F5F7',
        borderRadius: '12px',
      }} />
      <div className="pc-skel" style={{
        height: '12px',
        width: '70%',
        margin: '12px auto 0',
        background: '#F4F5F7',
        borderRadius: '4px',
      }} />
    </div>
  )
}

// ── Carte catégorie ───────────────────────────────────────────
function CategoryCard({ cat, onClick }) {
  const [imgFailed, setImgFailed] = useState(false)
  const imgSrc  = pickImage(cat)
  const showImg = imgSrc && !imgFailed

  return (
    <div
      className="pc-card"
      onClick={() => onClick(cat)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(cat)
        }
      }}
      style={{
        flex: '0 0 auto',
        width: 'clamp(120px, 14vw, 170px)',
        scrollSnapAlign: 'start',
      }}
    >
      {/* Vignette : image en pleine surface, cover, coins arrondis clippent */}
      <div
        className="pc-card-img"
        style={{
          position: 'relative',
          aspectRatio: '1 / 1',
          background: '#F4F5F7',
          borderRadius: '12px',
          border: '1.5px solid transparent',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color .25s, box-shadow .25s',
        }}
      >
        {showImg ? (
          <img
            src={imgSrc}
            alt={cat.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
          />
        ) : (
          <CatIcon name={cat.icon} />
        )}
      </div>

      {/* Libellé */}
      <div
        className="pc-card-label"
        style={{
          textAlign: 'center',
          marginTop: '10px',
          fontSize: '13.5px',
          fontWeight: 600,
          color: '#374151',
          fontFamily: '"DM Sans", sans-serif',
          letterSpacing: '-.1px',
          transition: 'color .2s',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '0 4px',
        }}
      >
        {cat.name}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────

export default function PopularCategories({ limit = 20 }) {
  // Init synchrone depuis le cache de api.js — pas de flash de loading
  // si Header a déjà déclenché le fetch
  const cachedInit = products.categoriesCached()

  const scrollRef = useRef(null)
  const [categories, setCategories] = useState(cachedInit || [])
  const [loading, setLoading]       = useState(!cachedInit)
  const [error, setError]           = useState(null)
  const [canLeft, setCanLeft]       = useState(false)
  const [canRight, setCanRight]     = useState(false)
  const navigate = useNavigate()

  // ── Fetch ─────────────────────────────────────────────────
  useEffect(() => {
    if (cachedInit) return
    let cancelled = false

    products.categories()
      .then(data => {
        if (cancelled) return
        setCategories(data || [])
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        console.error('[PopularCategories] fetch error:', err)
        setError('Impossible de charger les catégories.')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  // ── Visibilité des flèches selon le scroll ────────────────
  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    updateArrows()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [updateArrows, categories, loading])

  const scrollBy = (dir) => {
    const el = scrollRef.current
    if (!el) return
    const step = el.clientWidth * 0.75
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' })
  }

  // Ajuste la route ici si ton router utilise autre chose
  // (par ex. `/produits?category=${cat.slug}` ou `/c/${cat.slug}`).
  const goTo = (cat) => {
    navigate(`/categories/${cat.slug || cat.id}`)
  }

  const displayed = categories.slice(0, limit)

  return (
    <section style={{
      padding: '2.5rem 0 1.5rem',
      fontFamily: '"DM Sans", -apple-system, sans-serif',
    }}>

      {/* ══ En-tête ══ */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          fontSize: '12px',
          letterSpacing: '2.5px',
          color: '#9AA3AE',
          fontWeight: 500,
          marginBottom: '10px',
          textTransform: 'uppercase',
        }}>
          Explorez nos rayons
        </div>

        <h2 style={{
          fontSize: 'clamp(26px, 3vw, 38px)',
          fontWeight: 700,
          color: '#0F1419',
          margin: '0 0 10px',
          lineHeight: 1.15,
          letterSpacing: '-0.5px',
        }}>
          Catégories <span style={{ color: ORANGE_DEEP }}>populaires</span>
        </h2>

        <div style={{
          width: '44px',
          height: '3px',
          background: ORANGE_DEEP,
          borderRadius: '2px',
          margin: '0 auto 14px',
        }} />

        <p style={{
          color: '#6B7280',
          fontSize: '15px',
          margin: 0,
        }}>
          Tous les rayons professionnels au même endroit
        </p>
      </div>

      {/* ══ Erreur ══ */}
      {error && !loading && (
        <div style={{
          color: '#D32F2F',
          fontSize: '13px',
          textAlign: 'center',
          padding: '20px',
        }}>
          {error}
        </div>
      )}

      {/* ══ Piste de cartes + flèches ══ */}
      {!error && (
        <div style={{ position: 'relative', padding: '0 44px' }}>

          {/* Flèche gauche */}
          {canLeft && !loading && (
            <button
              type="button"
              className="pc-nav-btn"
              onClick={() => scrollBy('left')}
              aria-label="Voir les catégories précédentes"
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#fff',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 14px rgba(15,20,25,.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 2,
                padding: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}

          {/* Flèche droite */}
          {canRight && !loading && (
            <button
              type="button"
              className="pc-nav-btn"
              onClick={() => scrollBy('right')}
              aria-label="Voir les catégories suivantes"
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#fff',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 14px rgba(15,20,25,.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 2,
                padding: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )}

          {/* Piste scrollable */}
          <div
            ref={scrollRef}
            className="pc-scroll"
            style={{
              display: 'flex',
              gap: '14px',
              overflowX: 'auto',
              padding: '8px 4px 20px',
              scrollSnapType: 'x mandatory',
            }}
          >
            {loading
              ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
              : displayed.length === 0
                ? (
                  <div style={{
                    padding: '30px 20px',
                    fontSize: '13px',
                    color: '#9AA3AE',
                    textAlign: 'center',
                    width: '100%',
                  }}>
                    Aucune catégorie disponible.
                  </div>
                )
                : displayed.map(cat => (
                  <CategoryCard key={cat.id} cat={cat} onClick={goTo} />
                ))
            }
          </div>
        </div>
      )}
    </section>
  )
}