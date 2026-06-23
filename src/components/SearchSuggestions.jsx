// SearchSuggestions.jsx — GROSHOP.tn
// Hook + composant dropdown réutilisable pour les barres de recherche

import { useState, useRef, useEffect } from 'react'
import { products as productsApi, store as storeApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'

// ── Hook : gère le fetch + debounce + navigation clavier ──────────
export function useSearchSuggestions(query) {
  const { user } = useAuth()
  const [suggestions, setSuggestions]   = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex]   = useState(-1)
  const debounceRef = useRef(null)

  // ── Charge l'historique récent une fois (si connecté) ──
  useEffect(() => {
    if (!user) {
      setRecentSearches([])
      return
    }
    storeApi.recentSearches()
      .then(data => setRecentSearches(data?.searches || []))
      .catch(err => console.error(err))
  }, [user])

  // ── Fetch suggestions produits/catégories avec debounce ──
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = query.trim()
    if (q.length < 2) {
      setSuggestions([])
      // Si vide, affiche les récentes (si dispo)
      setShowDropdown(recentSearches.length > 0)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await productsApi.suggestions(q)
        setSuggestions(data?.suggestions || [])
        setShowDropdown((data?.suggestions || []).length > 0)
        setActiveIndex(-1)
      } catch (err) {
        console.error(err)
      }
    }, 250)

    return () => clearTimeout(debounceRef.current)
  }, [query, recentSearches])

  // ── Items affichés : suggestions si query saisie, sinon récentes ──
  const items = query.trim().length >= 2
    ? suggestions
    : recentSearches.map(text => ({ text, type: 'recent' }))

  const handleKeyDown = (e, onSelect) => {
    if (!showDropdown || items.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev - 1 + items.length) % items.length)
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault()
        onSelect(items[activeIndex].text)
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const refreshRecent = () => {
    if (!user) return
    storeApi.recentSearches()
      .then(data => setRecentSearches(data?.searches || []))
      .catch(err => console.error(err))
  }

  const clearRecent = async () => {
    try {
      await storeApi.clearRecentSearches()
      setRecentSearches([])
    } catch (err) {
      console.error(err)
    }
  }

  return {
    suggestions: items,
    showDropdown, setShowDropdown,
    activeIndex, setActiveIndex, handleKeyDown,
    isRecent: query.trim().length < 2,
    refreshRecent, clearRecent,
    hasRecent: recentSearches.length > 0,
  }
}

// ── Composant dropdown — flotte par-dessus, ne pousse pas le layout ──
export function SuggestionsDropdown({ suggestions, activeIndex, setActiveIndex, onSelect, isRecent, onClearRecent }) {
  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: '-2px',
      right: '-2px',
      background: '#fff',
      border: '2px solid #FF4500',
      borderTop: 'none',
      borderRadius: '0 0 24px 24px',
      boxShadow: '0 16px 40px rgba(0,0,0,.10)',
      overflow: 'hidden',
      zIndex: 3000,
      textAlign: 'left',
    }}>
      {/* Header "Recherches récentes" + bouton effacer */}
      {isRecent && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px',
          borderBottom: '1px solid #F4F4F4',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#9AA3AE', textTransform: 'uppercase', letterSpacing: '.5px' }}>
            Recherches récentes
          </span>
          {onClearRecent && (
            <button
              onMouseDown={onClearRecent}
              style={{
                fontSize: '12px', fontWeight: 600, color: '#FF4500',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              Effacer
            </button>
          )}
        </div>
      )}

      {suggestions.map((s, i) => (
        <div
          key={`${s.type}-${s.text}`}
          onMouseDown={() => onSelect(s.text)}
          onMouseEnter={() => setActiveIndex(i)}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 20px',
            cursor: 'pointer',
            background: activeIndex === i ? '#FFF4F0' : '#fff',
            borderBottom: i < suggestions.length - 1 ? '1px solid #F4F4F4' : 'none',
            transition: 'background 0.1s',
          }}
        >
          {s.type === 'recent' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={activeIndex === i ? '#FF4500' : '#bbb'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={activeIndex === i ? '#FF4500' : '#bbb'} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          )}
          <span style={{
            fontSize: '14px', fontWeight: 500,
            color: activeIndex === i ? '#FF4500' : '#333',
            flex: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {s.text}
          </span>
          {s.type === 'category' && (
            <span style={{
              fontSize: '11px', fontWeight: 600, color: '#9AA3AE',
              background: '#F4F5F7', padding: '3px 10px', borderRadius: '20px',
              flexShrink: 0, textTransform: 'uppercase', letterSpacing: '.4px',
            }}>
              Catégorie
            </span>
          )}
        </div>
      ))}
    </div>
  )
}