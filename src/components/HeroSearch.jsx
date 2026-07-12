// HeroSearch.jsx — GROSHOP.tn

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchSuggestions, SuggestionsDropdown } from './SearchSuggestions'

const POPULAR_SEARCHES = [
  'huile olive', 'café 1kg', 'détergent 5L', 't-shirts coton', 'couches bébé'
]

// Inject fonts + keyframe
if (typeof document !== 'undefined' && !document.getElementById('hs-styles')) {
  const s = document.createElement('style')
  s.id = 'hs-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,400;1,700;1,900&family=DM+Sans:wght@400;500;600;700&display=swap');
    @keyframes hs-bob { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(5px)} }
  `
  document.head.appendChild(s)
}

export default function HeroSearch() {
  const [query, setQuery]     = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)

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

  return (
    <div ref={ref} style={{
      position: 'relative',
      padding: '48px 32px 56px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center',
      fontFamily: '"DM Sans", -apple-system, sans-serif',
      overflow: 'visible',
      background: `
        radial-gradient(ellipse 55% 80% at -5% 50%,  rgba(255,110,30,0.15) 0%, rgba(255,150,60,0.07) 45%, transparent 72%),
        radial-gradient(ellipse 40% 55% at 106% 85%, rgba(255,120,40,0.10) 0%, transparent 62%),
        radial-gradient(ellipse 75% 55% at 50%  50%, rgba(255,255,255,0.97) 0%, transparent 68%),
        #ffffff
      `,
    }}>

      {/* ── Badge ── */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0,0,0,.08)',
        borderRadius: '40px',
        padding: '6px 18px 6px 9px',
        marginBottom: '16px',
        boxShadow: '0 1px 8px rgba(0,0,0,.07)',
      }}>
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%',
          background: '#FF4500',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF4500', letterSpacing: '.7px', textTransform: 'uppercase' }}>
          Marketplace B2B · 500+ Fournisseurs vérifiés
        </span>
      </div>

      {/* ── Heading — Fraunces ── */}
      <h1 style={{
        fontFamily: '"Fraunces", Georgia, serif',
        fontSize: 'clamp(40px, 5.2vw, 68px)',
        fontWeight: 900, lineHeight: 1.07,
        letterSpacing: '-1.5px', color: '#0D0D0D',
        marginBottom: 0, maxWidth: '700px',
      }}>
        Tout ce dont votre commerce{' '}
        <br/>
        <span style={{ fontWeight: 400, fontStyle: 'italic', color: '#555' }}>
          a vraiment{' '}
        </span>
        <span style={{ color: '#FF4500', fontStyle: 'italic' }}>
          besoin.
        </span>
      </h1>

      {/* ── Sous-titre — DM Sans ── */}
      <p style={{
        fontFamily: '"DM Sans", sans-serif',
        fontSize: 'clamp(15px, 1.4vw, 18px)',
        fontWeight: 400, color: '#999', lineHeight: 1.65,
        margin: '10px 0 24px', maxWidth: '480px',
      }}>
        Cherchez parmi 10 000+ produits en gros<br/>
        Livraison directe depuis les fournisseurs tunisiens
      </p>

      {/* ── Stats ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {[
          { num: '10 000+', lbl: 'Produits' },
          { num: '500+',    lbl: 'Fournisseurs vérifiés' },
          { num: '24h',     lbl: 'Livraison Tunisie' },
        ].map((s, i) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && <div style={{ width: '1px', height: '36px', background: 'rgba(0,0,0,.09)' }} />}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 28px' }}>
              <span style={{
                fontFamily: '"Fraunces", serif',
                fontSize: 'clamp(20px, 2vw, 26px)',
                fontWeight: 700, color: '#111', lineHeight: 1, letterSpacing: '-.5px',
              }}>{s.num}</span>
              <span style={{
                fontSize: '12px', fontWeight: 500, color: '#bbb', marginTop: '4px',
              }}>{s.lbl}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search bar ── */}
      <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '720px', marginBottom: '14px', position: 'relative', zIndex: 100 }}>
        <div style={{
          width: '100%',
          background: '#fff',
          border: `1.5px solid ${focused ? '#FF4500' : '#E5E5E5'}`,
          borderRadius: showDropdown ? '22px 22px 0 0' : '22px',
          display: 'flex', alignItems: 'center',
          padding: '12px 12px 12px 26px',
          boxShadow: focused
            ? '0 6px 8px rgba(0,0,0,.03), 0 16px 50px rgba(255,69,0,.10), 0 0 0 5px rgba(255,69,0,.06)'
            : '0 6px 8px rgba(0,0,0,.03), 0 16px 50px rgba(0,0,0,.09)',
          transition: 'border-color .2s, box-shadow .2s',
          position: 'relative',
          zIndex: 21,
        }}>
          <svg style={{ color: '#ccc', flexShrink: 0, marginRight: '14px' }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>

          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { setFocused(true); if (suggestions.length > 0 || hasRecent) setShowDropdown(true) }}
            onBlur={() => { setFocused(false); setTimeout(() => setShowDropdown(false), 150) }}
            onKeyDown={e => handleKeyDown(e, goToSearch)}
            placeholder="ex: huile d'olive 5L palette, t-shirts coton..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '16px', color: '#111',
              background: 'transparent',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 500,
            }}
          />

          <div style={{ width: '1px', height: '30px', background: '#eee', flexShrink: 0, margin: '0 12px' }} />

          <button
            type="button"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', border: 'none',
              fontSize: '13px', fontWeight: 600, color: '#999',
              cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
              flexShrink: 0, padding: '6px 4px', whiteSpace: 'nowrap',
            }}
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
              background: '#FF4500', color: '#fff',
              border: 'none', borderRadius: '15px',
              padding: '15px 34px', fontSize: '16px', fontWeight: 700,
              cursor: 'pointer',
              fontFamily: '"DM Sans", sans-serif',
              flexShrink: 0,
              boxShadow: '0 5px 20px rgba(255,69,0,.36)',
              marginLeft: '10px', whiteSpace: 'nowrap',
              letterSpacing: '-.1px',
            }}
          >
            Rechercher
          </button>
        </div>

        {/* ── Dropdown suggestions / récentes ── */}
        {showDropdown && suggestions.length > 0 && (
          <SuggestionsDropdown
            suggestions={suggestions}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            onSelect={goToSearch}
            isRecent={isRecent}
            onClearRecent={isRecent ? clearRecent : null}
          />
        )}
      </form>

      {/* ── Tags : Recherches récentes si dispo, sinon Populaires ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {hasRecent ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontSize: '13px', color: '#bbb', fontWeight: 500 }}>Récentes :</span>
          </>
        ) : (
          <span style={{ fontSize: '13px', color: '#bbb', fontWeight: 500 }}>Populaires :</span>
        )}
        {(hasRecent ? suggestions.map(s => s.text).slice(0, 5) : POPULAR_SEARCHES).map(tag => (
          <button
            key={tag}
            onClick={() => { setQuery(tag); navigate(`/search?q=${encodeURIComponent(tag)}`) }}
            style={{
              fontSize: '13px', fontWeight: 500, color: '#666',
              background: 'rgba(255,255,255,.78)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(0,0,0,.09)',
              padding: '6px 16px', borderRadius: '40px', cursor: 'pointer',
              fontFamily: '"DM Sans", sans-serif',
              boxShadow: '0 1px 4px rgba(0,0,0,.04)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF4500'; e.currentTarget.style.color = '#FF4500' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,.09)'; e.currentTarget.style.color = '#666' }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* ── Scroll cue ── */}
      <div style={{
        position: 'absolute', bottom: '26px', left: '50%',
        transform: 'translateX(-50%)',
        width: '34px', height: '34px', borderRadius: '50%',
        border: '1.5px solid rgba(0,0,0,.11)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#ccc',
        animation: 'hs-bob 2.2s ease-in-out infinite',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
        </svg>
      </div>

    </div>
  )
}
