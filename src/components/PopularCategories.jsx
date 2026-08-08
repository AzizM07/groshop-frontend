// PopularCategories.jsx — GROSHOP.tn
// Section "Catégories populaires" — placée entre HeroSearch et HeroGrid.
// Utilise products.categories() qui met en cache la réponse : pas de double
// fetch avec Header (mega menu), même endpoint réseau taperait qu'une fois.
// Cartes rondes — même style que SubCategoryItem dans le header.

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

    /* Cartes rondes */
    .pc-card       { cursor: pointer; transition: transform .2s ease; }
    .pc-card:hover { transform: scale(1.04); }
    .pc-card:hover .pc-card-circle { background: #EAECEF; }
    .pc-card:hover .pc-card-label { color: #1668FF; }

    /* Zoom léger sur l'image au survol */
    .pc-card-circle img { transition: transform .35s ease; }
    .pc-card:hover .pc-card-circle img { transform: scale(1.06); }

    /* Boutons flèches */
    .pc-nav-btn        { transition: background .2s, box-shadow .2s, transform .2s; }
    .pc-nav-btn:hover  { background: #ff5e20; box-shadow: 0 8px 22px rgba(255,94,32,.35); }
    .pc-nav-btn:hover svg { stroke: #fff; }
    .pc-nav-btn:active { transform: translateY(-50%) scale(.95); }

    /* Skeleton */
    @keyframes pc-skel-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }
    .pc-skel { animation: pc-skel-pulse 1.5s ease-in-out infinite; }

    @media (prefers-reduced-motion: reduce) {
      .pc-scroll, .pc-card, .pc-nav-btn, .pc-skel, .pc-card-circle img {
        transition: none !important;
        scroll-behavior: auto !important;
        animation: none !important;
      }
    }
  `
  document.head.appendChild(s)
}

// ── Icône Lucide dynamique (fallback ultime : Grid) ───────────
function CatIcon({ name, size = 40, color = '#6B7280' }) {
  const Icon = name ? Icons[name] : null
  if (!Icon) return <Icons.Grid size={size} color={color} strokeWidth={1.4} />
  return <Icon size={size} color={color} strokeWidth={1.4} />
}

// ── Cascade de fallback pour la vignette ──────────────────────
function pickImage(cat) {
  return cat.image_url || null
}

// ── Squelette pendant le chargement ───────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      flex: '0 0 auto',
      width: 'clamp(110px, 12vw, 135px)',
      textAlign: 'center',
    }}>
      <div className="pc-skel" style={{
        width: 'clamp(90px, 10vw, 120px)',
        height: 'clamp(90px, 10vw, 120px)',
        background: '#F4F5F7',
        borderRadius: '50%',
        margin: '0 auto',
      }} />
      <div className="pc-skel" style={{
        height: '11px',
        width: '65%',
        margin: '12px auto 0',
        background: '#F4F5F7',
        borderRadius: '4px',
      }} />
    </div>
  )
}

// ── Carte catégorie (ronde) ────────────────────────────────────
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
        width: 'clamp(110px, 12vw, 135px)',
        scrollSnapAlign: 'start',
        textAlign: 'center',
      }}
    >
      {/* Vignette ronde */}
      <div
        className="pc-card-circle"
        style={{
          width: 'clamp(90px, 10vw, 120px)',
          height: 'clamp(90px, 10vw, 120px)',
          margin: '0 auto',
          borderRadius: '50%',
          background: '#F2F3F5',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background .2s',
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
          marginTop: '12px',
          fontSize: '13px',
          fontWeight: 500,
          color: '#1F2937',
          fontFamily: '"DM Sans", sans-serif',
          letterSpacing: '-.1px',
          transition: 'color .15s',
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          padding: '0 4px',
          minHeight: '35px',
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

  // Tap sur une sous-catégorie → recherche par son nom
  const goTo = (sub) => {
    navigate(`/search?q=${encodeURIComponent(sub.name)}`)
  }

  // Sous-catégories = enfants aplatis de toutes les grandes catégories
  const subcategories = categories.flatMap(c => c.children || [])
  const displayed = subcategories.slice(0, limit)

  return (
    <section style={{
      padding: '2.5rem 0 1.5rem',
      fontFamily: '"DM Sans", -apple-system, sans-serif',
    }}>

      {/* ══ Bandeau promo orange ══ */}
      <div style={{
        background: ORANGE ,
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '2rem',
      }}>
        <Icons.Megaphone size={15} color="#fff" strokeWidth={2} />
        <span style={{
          color: '#fff',
          fontSize: '13px',
          fontWeight: 500,
          textAlign: 'center',
        }}>
          Bienvenue sur GROSHOP ! Profitez de nouvelles offres chaque week-end — Code promo : GROSHOP2026
        </span>
      </div>

      {/* ══ En-tête — titre gras centré + petit trait, comme "Deals Of The Day" ══ */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 style={{
          fontSize: 'clamp(18px, 1.8vw, 22px)',
          fontWeight: 700,
          color: '#424141',
          margin: '0 0 10px',
          letterSpacing: '0.2px',
        }}>
          Catégories populaires
        </h2>

        <div style={{
          width: '46px',
          height: '3px',
          background: ORANGE,
          borderRadius: '2px',
          margin: '0 auto',
        }} />
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
              gap: '18px',
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