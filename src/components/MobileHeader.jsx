// src/components/MobileHeader.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LOGO_SRC from '../assets/logo2.png'
import { useSearchSuggestions } from './SearchSuggestions'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

export default function MobileHeader() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const {
    suggestions, showDropdown, setShowDropdown,
    activeIndex, setActiveIndex, handleKeyDown,
    isRecent, clearRecent, hasRecent,
  } = useSearchSuggestions(query)

  const goToSearch = (text) => {
    setShowDropdown(false)
    if (text.trim()) navigate(`/search?q=${encodeURIComponent(text)}`)
  }
  const open = showDropdown && suggestions.length > 0

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        fontFamily: FONT, boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 56, padding: '0 12px' }}>

          <Link to="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <img src={LOGO_SRC} alt="GROSHOP.tn"
              style={{ height: 30, width: 'auto', maxWidth: 120, objectFit: 'contain', display: 'block' }}
              onError={e => { e.currentTarget.style.display = 'none' }} />
          </Link>

          <form onSubmit={e => { e.preventDefault(); goToSearch(query) }}
            style={{ flex: 1, minWidth: 0, position: 'relative' }}>
            <div style={{
              display: 'flex', alignItems: 'center', height: 38,
              border: '2px solid #FF4500', borderRadius: 50,
              padding: '0 5px 0 14px', boxSizing: 'border-box',
            }}>
              <input value={query} onChange={e => setQuery(e.target.value)}
                onFocus={() => { if (suggestions.length) setShowDropdown(true) }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                onKeyDown={e => handleKeyDown(e, goToSearch)}
                placeholder="Rechercher…"
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: '#0F1419' }} />

              <button type="button" title="Recherche par image"
                style={{ background: 'none', border: 'none', padding: '0 8px', display: 'flex', color: '#6B7785', cursor: 'pointer', flexShrink: 0 }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
                </svg>
              </button>

              <button type="submit" aria-label="Rechercher"
                style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #FF8A3D, #FF4500)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>

            {open && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', border: '1px solid #E8EAED', borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,.14)', overflow: 'hidden', zIndex: 2500 }}>
                {isRecent && hasRecent && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px 4px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#9AA3AE', textTransform: 'uppercase', letterSpacing: '.5px' }}>Recherches récentes</span>
                    <div style={{ flex: 1 }} />
                    <button type="button" onMouseDown={e => e.preventDefault()} onClick={clearRecent}
                      style={{ fontSize: 12, fontWeight: 600, color: '#FF4500', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Effacer</button>
                  </div>
                )}
                {suggestions.map((s, i) => {
                  const active = i === activeIndex
                  const stroke = active ? '#FF4500' : '#bbb'
                  return (
                    <div key={`${s.type}-${s.text}`}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => goToSearch(s.text)}
                      onMouseEnter={() => setActiveIndex(i)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', cursor: 'pointer', background: active ? '#FFF4F0' : 'transparent' }}>
                      {s.type === 'recent' ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      )}
                      <span style={{ fontSize: 14, fontWeight: 500, color: active ? '#FF4500' : '#333', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.text}</span>
                      {s.type === 'category' && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#9AA3AE', background: '#F4F5F7', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.4px', flexShrink: 0 }}>Catégorie</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </form>
        </div>
      </header>

      <div style={{ height: 56 }} aria-hidden="true" />
    </>
  )
}