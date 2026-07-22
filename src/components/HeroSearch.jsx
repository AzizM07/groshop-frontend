// HeroSearch.jsx — GROSHOP.tn

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchSuggestions } from './SearchSuggestions'
import heroBg from '../assets/hero-bg1.png'   // ⬅️ ton image ici

const ORANGE      = '#ff8820'
const ORANGE_DEEP = '#ff5e20'

// Hauteur de la zone
const HERO_HEIGHT = 'clamp(400px, 0vh, 620px)'

// Voile sombre sur la photo. À 0 : l'image est affichée telle quelle.
const OVERLAY = 0

// Arrondi des coins. 0 = bord à bord, pleine largeur écran.
const RADIUS = '0px'

// Halo lumineux derrière la barre — la détache du fond orange
const SHOW_HALO = true

// Lévitation lente de la barre
const FLOAT = true

// Tags de recherche rapide sous la barre
const SHOW_TAGS = false

const POPULAR_SEARCHES = [
  'huile olive', 'café 1kg', 'détergent 5L', 't-shirts coton', 'couches bébé'
]

// Inject font + keyframes
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

    /* La lévitation se fige dès qu'on interagit : viser une cible mouvante, non. */
    .hs-float.is-still { animation-play-state: paused; }

    .hs-input::placeholder { color: #A8ADB4; }

    @media (prefers-reduced-motion: reduce) {
      .hs-float, .hs-halo, .hs-shim { animation: none !important; }
    }
  `
  document.head.appendChild(s)
}

export default function HeroSearch({ backgroundImage = heroBg }) {
  const [query, setQuery]     = useState('')
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)

  /* On mesure la ligne de saisie pour réserver exactement sa hauteur :
     le conteneur des suggestions s'étale par-dessus sans pousser le reste. */
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

  // ── Suggestions live + récentes (logique partagée avec Header) ──
  const {
    suggestions, showDropdown, setShowDropdown,
    activeIndex, setActiveIndex, handleKeyDown,
    isRecent, clearRecent, hasRecent,
  } = useSearchSuggestions(query)

  const goToSearch = (text) => {
    setShowDropdown(false)
    if (text.trim()) navigate(`/search?q=${encodeURIComponent(text)}`)
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

      {/* ═══ Calque image : le clipping vit ICI uniquement, derrière le contenu,
          pour que le menu de suggestions puisse déborder sous la barre. ═══ */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: RADIUS,
        overflow: 'hidden',
        zIndex: 0,
      }}>
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
        {OVERLAY > 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `rgba(13,13,13,${OVERLAY})`,
          }} />
        )}
      </div>

      {/* ═══ Contenu — non clippé ═══ */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: HERO_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        boxSizing: 'border-box',
      }}>

        {/* ── Search bar ── */}
        <form onSubmit={handleSearch} style={{
          width: '100%', maxWidth: '760px',
          position: 'relative', zIndex: 100,
        }}>

          {/* Halo : ellipse blanche floutée, derrière la barre */}
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

          {/* Réserve la hauteur de la ligne de saisie */}
          <div style={{ position: 'relative', height: rowH, zIndex: 1 }}>

            {/* Couche 1 — lévitation */}
            <div
              className={`${FLOAT ? 'hs-float' : ''} ${active ? 'is-still' : ''}`}
              style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
            >
              {/* Couche 2 — LE conteneur unique : fond, radius, ombre, bordure */}
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

                {/* ── Ligne de saisie ── */}
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
                    onKeyDown={e => handleKeyDown(e, goToSearch)}
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

                {/* ── Suggestions ── */}
                {open && (
                  <>
                    <div style={{ height: 1, background: '#EFEFEF', margin: '0 22px' }} />

                    {isRecent && (
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        padding: '10px 22px 4px',
                      }}>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#bbb', letterSpacing: '.3px' }}>
                          RECHERCHES RÉCENTES
                        </span>
                        <div style={{ flex: 1 }} />
                        <button
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={clearRecent}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 11.5, fontWeight: 600, color: ORANGE_DEEP,
                            fontFamily: '"DM Sans", sans-serif', padding: 0,
                          }}
                        >
                          Effacer
                        </button>
                      </div>
                    )}

                    <div style={{ padding: '6px 0 10px' }}>
                      {suggestions.map((s, i) => {
                        const isActive = i === activeIndex
                        const stroke = isActive ? ORANGE_DEEP : '#bbb'
                        return (
                          <div
                            key={`${s.type}-${s.text}`}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => goToSearch(s.text)}
                            onMouseEnter={() => setActiveIndex(i)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '11px 22px',
                              cursor: 'pointer',
                              background: isActive ? '#FFF4F0' : 'transparent',
                              textAlign: 'left',
                              transition: 'background .12s',
                            }}
                          >
                            {s.type === 'recent' ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                              </svg>
                            )}
                            <span style={{
                              fontSize: 14.5, fontWeight: 500,
                              color: isActive ? ORANGE_DEEP : '#333',
                              flex: 1,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {s.text}
                            </span>
                            {s.type === 'category' && (
                              <span style={{
                                fontSize: 11, fontWeight: 600, color: '#9AA3AE',
                                background: '#F4F5F7', padding: '3px 10px', borderRadius: 20,
                                flexShrink: 0, textTransform: 'uppercase', letterSpacing: '.4px',
                              }}>
                                Catégorie
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* ── Tags ── */}
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