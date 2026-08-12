// HeroSearch.jsx — GROSHOP.tn

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchSuggestions, SearchDropdown } from './SearchSuggestions'

const ORANGE      = '#ff8820'
const ORANGE_DEEP = '#ff5e20'

const HERO_BG_ZONE = 'hero_bg'
const API_BASE = import.meta.env.VITE_API_URL || ''

// ⭐ CORRIGÉ : clamp(400px, 0vh, 620px) retombait TOUJOURS sur 400px fixe,
// car la valeur préférée (0vh) est toujours < au minimum (400px) → clamp()
// choisit systématiquement le minimum. Remplacé par une vraie valeur fluide.
const HERO_HEIGHT = 'clamp(400px, 55vh, 620px)'
// Position verticale de la barre = hauteur du "vide" au-dessus, en % de la hauteur du hero.
// ≈50% = centre, plus grand = plus bas. Comme c'est un % du hero (donc de l'image),
// la barre reste ancrée au même endroit de l'image quelle que soit sa taille.
const SEARCH_Y = '70%'
const OVERLAY = 0
const RADIUS = '0px'
const SHOW_HALO = true
const FLOAT = true
const SHOW_TAGS = false

// ⭐ Clé localStorage pour afficher instantanément la dernière bannière connue
// pendant que le fetch revalide en arrière-plan (stale-while-revalidate).
const BG_CACHE_KEY = 'hero_bg_url'

const POPULAR_SEARCHES = [
  'huile olive', 'café 1kg', 'détergent 5L', 't-shirts coton', 'couches bébé'
]

if (typeof document !== 'undefined' && !document.getElementById('hs-styles')) {
  const s = document.createElement('style')
  s.id = 'hs-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

    @keyframes hs-float  { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-7px) } }
    @keyframes hs-halo   { 0%,100% { opacity:.5;  transform: translate(-50%,-50%) scale(1) }
                           50%     { opacity:.78; transform: translate(-50%,-50%) scale(1.07) } }
    @keyframes hs-shimmer{ 0% { transform: translateX(-140%) } 60%,100% { transform: translateX(260%) } }

    .hs-float { animation: hs-float 6s ease-in-out infinite; }
    .hs-halo  { animation: hs-halo  6s ease-in-out infinite; }
    .hs-shim  { animation: hs-shimmer 3.6s ease-in-out infinite; }

    .hs-float.is-still { animation-play-state: paused; }

    .hs-input::placeholder { color: #A8ADB4; }

    @media (prefers-reduced-motion: reduce) {
      .hs-float, .hs-halo, .hs-shim { animation: none !important; }
    }
  `
  document.head.appendChild(s)
}

export default function HeroSearch() {
  const [query, setQuery]     = useState('')
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  // ⭐ CORRIGÉ : état initial lu depuis localStorage (si dispo) au lieu de null.
  // L'image s'affiche donc immédiatement au montage, sans attendre le fetch,
  // pour toute visite après la première. Le fetch ci-dessous revalide en tâche
  // de fond et met à jour le cache si la bannière active a changé côté back.
  const [bgUrl, setBgUrl] = useState(() => {
    try { return localStorage.getItem(BG_CACHE_KEY) || null } catch { return null }
  })
  const navigate = useNavigate()
  const ref = useRef(null)

  useEffect(() => {
    let alive = true
    fetch(`${API_BASE}/api/banners/active/`)
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || [])
        const hero = list
          .find(b => b.zone === HERO_BG_ZONE && b.is_active && b.image_url)
        if (alive && hero) {
          setBgUrl(hero.image_url)
          try { localStorage.setItem(BG_CACHE_KEY, hero.image_url) } catch {}
        }
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const rowRef = useRef(null)
  const [rowH, setRowH] = useState(66)

  useLayoutEffect(() => {
    if (!rowRef.current) return
    const measure = () => setRowH(rowRef.current.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(rowRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => window.dispatchEvent(new CustomEvent('herosearch-visibility', { detail: { visible: entry.isIntersecting } })),
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const {
    suggestions, showDropdown, setShowDropdown,
    activeIndex, setActiveIndex, handleKeyDown,
    isRecent, clearRecent, hasRecent,
  } = useSearchSuggestions(query)

  const goToSearch = (text) => {
    setShowDropdown(false)
    if (text.trim()) navigate(`/search?q=${encodeURIComponent(text)}`)
  }

  // produit → fiche, complétion/catégorie → /search
  const onSelectItem = (item) => {
    setShowDropdown(false)
    if (item?.to) navigate(item.to)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    goToSearch(query)
  }

  const open   = showDropdown && suggestions.length > 0
  const active = focused || hovered || open

  return (
    <section ref={ref} style={{
      position: 'relative',
      width: '100vw',
      marginLeft: 'calc(50% - 50vw)',
      marginRight: 'calc(50% - 50vw)',
      boxSizing: 'border-box',
      fontFamily: '"DM Sans", -apple-system, sans-serif',
    }}>

      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: RADIUS,
        overflow: 'hidden',
        zIndex: 0,
      }}>
        {bgUrl && (
          <img
            src={bgUrl}
            alt=""
            aria-hidden="true"
            // ⭐ CORRIGÉ : priorité de chargement élevée — c'est une image
            // above-the-fold, le navigateur doit la traiter en priorité
            // plutôt que de la mettre en concurrence avec d'autres ressources.
            fetchPriority="high"
            decoding="async"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
          />
        )}
        {OVERLAY > 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `rgba(13,13,13,${OVERLAY})`,
          }} />
        )}
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        height: HERO_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 24px',
        boxSizing: 'border-box',
      }}>

        {/* Espace au-dessus de la barre → contrôle sa position verticale, en % du hero (donc de l'image) */}
        <div aria-hidden="true" style={{ height: SEARCH_Y, flexShrink: 0 }} />

        <form onSubmit={handleSearch} style={{
          width: '100%', maxWidth: '760px',
          position: 'relative', zIndex: 100,
        }}>

          {SHOW_HALO && (
            <div
              className="hs-halo"
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '50%', top: '50%',
                width: '118%', height: '260%',
                transform: 'translate(-50%,-50%)',
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,.85) 0%, rgba(255,255,255,.30) 42%, rgba(255,255,255,0) 70%)',
                filter: 'blur(26px)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          )}

          <div style={{ position: 'relative', height: rowH, zIndex: 1 }}>

            <div
              className={`${FLOAT ? 'hs-float' : ''} ${active ? 'is-still' : ''}`}
              style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
            >
              <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                  background: '#fff',
                  border: `1.5px solid ${focused ? ORANGE : 'transparent'}`,
                  borderRadius: '22px',
                  overflow: 'hidden',
                  transform: active ? 'translateY(-3px)' : 'translateY(0)',
                  boxShadow: focused
                    ? `0 0 0 6px rgba(255,136,32,.20),
                       0 2px 6px rgba(120,45,0,.10),
                       0 18px 38px rgba(120,45,0,.26),
                       0 36px 74px rgba(120,45,0,.20)`
                    : `0 0 0 6px rgba(255,255,255,.30),
                       0 2px 6px rgba(120,45,0,.10),
                       0 14px 30px rgba(120,45,0,.22),
                       0 30px 64px rgba(120,45,0,.18)`,
                  transition: 'border-color .25s, box-shadow .3s, transform .3s cubic-bezier(.25,.46,.45,.94)',
                }}
              >

                <div ref={rowRef} style={{
                  display: 'flex', alignItems: 'center',
                  padding: '9px 9px 9px 22px',
                }}>
                  <svg
                    style={{
                      color: focused ? ORANGE : '#c9ccd1',
                      flexShrink: 0, marginRight: '12px',
                      transition: 'color .25s',
                    }}
                    width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  >
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>

                  <input
                    className="hs-input"
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => { setFocused(true); if (suggestions.length > 0 || hasRecent) setShowDropdown(true) }}
                    onBlur={() => { setFocused(false); setTimeout(() => setShowDropdown(false), 150) }}
                    onKeyDown={e => handleKeyDown(e, onSelectItem)}
                    placeholder="ex: huile d'olive 5L palette, t-shirts coton..."
                    style={{
                      flex: 1, minWidth: 0, border: 'none', outline: 'none',
                      fontSize: '15px', color: '#111',
                      background: 'transparent',
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: 500,
                    }}
                  />

                  <div style={{ width: '1px', height: '26px', background: '#eee', flexShrink: 0, margin: '0 12px' }} />

                  <button
                    type="button"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'transparent', border: 'none',
                      fontSize: '13px', fontWeight: 600, color: '#999',
                      cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
                      flexShrink: 0, padding: '6px 4px', whiteSpace: 'nowrap',
                      transition: 'color .2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = ORANGE_DEEP }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#999' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    Image
                  </button>

                  <button
                    type="submit"
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      background: `linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_DEEP} 100%)`,
                      color: '#fff',
                      border: 'none', borderRadius: '16px',
                      padding: '14px 32px', fontSize: '15px', fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: '"DM Sans", sans-serif',
                      flexShrink: 0,
                      boxShadow: '0 6px 20px rgba(255,94,32,.45)',
                      marginLeft: '10px', whiteSpace: 'nowrap',
                      letterSpacing: '-.1px',
                      transition: 'transform .2s, box-shadow .2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'
                      e.currentTarget.style.boxShadow = '0 10px 28px rgba(255,94,32,.55)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,94,32,.45)'
                    }}
                  >
                    <span style={{ position: 'relative', zIndex: 1 }}>Rechercher</span>
                    <span
                      className="hs-shim"
                      aria-hidden="true"
                      style={{
                        position: 'absolute', top: 0, bottom: 0, left: 0,
                        width: '40%',
                        background: 'linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.45) 50%, rgba(255,255,255,0) 100%)',
                        pointerEvents: 'none',
                      }}
                    />
                  </button>
                </div>

                {/* ── Suggestions (menu groupé partagé) ── */}
                {open && (
                  <SearchDropdown
                    flatItems={suggestions}
                    query={query}
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                    onSelect={onSelectItem}
                    isRecent={isRecent}
                    hasRecent={hasRecent}
                    clearRecent={clearRecent}
                    accent={ORANGE_DEEP}
                  />
                )}
              </div>
            </div>
          </div>
        </form>

        {SHOW_TAGS && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            flexWrap: 'wrap', justifyContent: 'center',
            marginTop: '18px',
          }}>
            {hasRecent ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span style={{ fontSize: '12.5px', color: '#555', fontWeight: 600, textShadow: '0 1px 6px rgba(255,255,255,.7)' }}>Récentes :</span>
              </>
            ) : (
              <span style={{ fontSize: '12.5px', color: '#555', fontWeight: 600, textShadow: '0 1px 6px rgba(255,255,255,.7)' }}>Populaires :</span>
            )}
            {(hasRecent ? suggestions.map(s => (typeof s === 'string' ? s : s.text)).slice(0, 5) : POPULAR_SEARCHES).map(tag => (
              <button
                key={tag}
                onClick={() => { setQuery(tag); navigate(`/search?q=${encodeURIComponent(tag)}`) }}
                style={{
                  fontSize: '12.5px', fontWeight: 500, color: '#555',
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,.08)',
                  padding: '6px 15px', borderRadius: '40px', cursor: 'pointer',
                  fontFamily: '"DM Sans", sans-serif',
                  boxShadow: '0 2px 10px rgba(0,0,0,.12)',
                  transition: 'background .2s, color .2s, border-color .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = ORANGE_DEEP; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = ORANGE_DEEP }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = 'rgba(0,0,0,.08)' }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}