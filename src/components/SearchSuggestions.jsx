// SearchSuggestions.jsx — GROSHOP.tn
// Hook + composants dropdown réutilisables pour les barres de recherche.
//
// Le hook appelle maintenant productsApi.autocomplete(q) qui renvoie 3 groupes :
//   { completions: string[], products: [{id,name,slug,price,image}], categories: [{id,name,slug}] }
// Il expose :
//   - groups     : les 3 groupes (pour l'affichage riche)
//   - flatItems  : liste à plat (dans l'ordre d'affichage) pour la navigation clavier,
//                  chaque item porte { kind, label, to, index } + alias { text, type }
//   - suggestions: alias de flatItems (compat ascendante)
// Rien d'autre ne change dans l'API publique (showDropdown, activeIndex, handleKeyDown…).

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { products as productsApi, store as storeApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const EMPTY = { completions: [], products: [], categories: [] }

// ── Hook : fetch + debounce + navigation clavier ──────────────────
export function useSearchSuggestions(query) {
  const { user } = useAuth()
  const [data, setData]                     = useState(EMPTY)
  const [recentSearches, setRecentSearches] = useState([])
  const [showDropdown, setShowDropdown]     = useState(false)
  const [activeIndex, setActiveIndex]       = useState(-1)
  const debounceRef = useRef(null)

  // ── Historique récent (si connecté) ──
  const loadRecent = useCallback(() => {
    if (!user) { setRecentSearches([]); return }
    storeApi.recentSearches()
      .then(d => setRecentSearches(d?.searches || []))
      .catch(() => setRecentSearches([]))
  }, [user])

  useEffect(() => { loadRecent() }, [loadRecent])

  // ── Autocomplete (produits Meilisearch + catégories + complétions) ──
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = query.trim()
    if (q.length < 2) { setData(EMPTY); return }

    debounceRef.current = setTimeout(() => {
      productsApi.autocomplete(q)
        .then(d => {
          const next = {
            completions: d?.completions || [],
            products:    d?.products    || [],
            categories:  d?.categories  || [],
          }
          setData(next)
          const has = next.completions.length + next.products.length + next.categories.length > 0
          setShowDropdown(has)
          setActiveIndex(-1)
        })
        .catch(() => setData(EMPTY))
    }, 250)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  const isRecent = query.trim().length < 2

  // ── Liste à plat (ordre d'affichage) avec index global pour le clavier ──
  const flatItems = useMemo(() => {
    const out = []
    if (isRecent) {
      recentSearches.forEach(text =>
        out.push({ kind: 'recent', label: text, to: `/search?q=${encodeURIComponent(text)}` }))
    } else {
      data.completions.forEach(text =>
        out.push({ kind: 'completion', label: text, to: `/search?q=${encodeURIComponent(text)}` }))
      data.products.forEach(p =>
        out.push({ kind: 'product', id: p.id, label: p.name, price: p.price, image: p.image, to: `/produit/${p.id}` }))
      data.categories.forEach(c =>
        out.push({ kind: 'category', label: c.name, slug: c.slug, to: `/search?q=${encodeURIComponent(c.name)}` }))
    }
    // index global + alias .text/.type (compat avec l'ancien SuggestionsDropdown)
    return out.map((it, i) => ({
      ...it,
      index: i,
      text: it.label,
      type: it.kind === 'completion' ? 'query' : it.kind,
    }))
  }, [isRecent, recentSearches, data])

  // Ouvre le dropdown sur les récentes quand le champ est vide
  useEffect(() => {
    if (isRecent) setShowDropdown(recentSearches.length > 0)
  }, [isRecent, recentSearches.length])

  const handleKeyDown = (e, onSelect) => {
    if (!showDropdown || flatItems.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1) % flatItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev - 1 + flatItems.length) % flatItems.length)
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault()
        onSelect(flatItems[activeIndex])
      }
      // activeIndex < 0 → laisse le submit natif du <form> lancer /search?q=
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const clearRecent = async () => {
    try { await storeApi.clearRecentSearches() } catch (_) { /* silencieux */ }
    setRecentSearches([])
    setShowDropdown(false)
  }

  return {
    groups: data,
    flatItems,
    suggestions: flatItems,          // alias compat
    isRecent, query,
    showDropdown, setShowDropdown,
    activeIndex, setActiveIndex, handleKeyDown,
    refreshRecent: loadRecent, clearRecent,
    hasRecent: recentSearches.length > 0,
  }
}

// ── Helpers d'affichage ───────────────────────────────────────────
function fmtPrice(n) {
  const v = Number(n)
  if (!v && v !== 0) return null
  return v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Préfixe tapé en gris + complétion en gras (façon Alibaba)
function BoldMatch({ label, query }) {
  const q = (query || '').trim()
  if (q && label.toLowerCase().startsWith(q.toLowerCase())) {
    return (
      <>
        <span>{label.slice(0, q.length)}</span>
        <span style={{ fontWeight: 700 }}>{label.slice(q.length)}</span>
      </>
    )
  }
  return <span>{label}</span>
}

const SECTION_LABEL = { product: 'Produits', category: 'Catégories' }

// ══════════════════════════════════════════════════════════════════
//  NOUVEAU : dropdown groupé partagé (Header + HeroSearch)
//  Rend UNIQUEMENT le contenu interne (hairline + sections + lignes).
//  Le conteneur positionné reste géré par chaque barre appelante.
// ══════════════════════════════════════════════════════════════════
export function SearchDropdown({
  flatItems, query, activeIndex, setActiveIndex, onSelect,
  isRecent, hasRecent, clearRecent, accent = '#FF4500',
}) {
  if (!flatItems || !flatItems.length) return null

  let lastKind = null

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ height: 1, background: '#F0F0F0', margin: '0 18px' }} />

      {isRecent && hasRecent && (
        <div style={{ display: 'flex', alignItems: 'center', padding: '9px 18px 3px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#9AA3AE', textTransform: 'uppercase', letterSpacing: '.5px' }}>
            Recherches récentes
          </span>
          <div style={{ flex: 1 }} />
          {clearRecent && (
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={clearRecent}
              style={{ fontSize: 12, fontWeight: 600, color: accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Effacer
            </button>
          )}
        </div>
      )}

      <div style={{ padding: '4px 0 8px' }}>
        {flatItems.map(item => {
          const active   = item.index === activeIndex
          const showHead = !isRecent && SECTION_LABEL[item.kind] && item.kind !== lastKind
          lastKind = item.kind

          return (
            <div key={`${item.kind}-${item.id || item.label}`}>
              {showHead && (
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', color: '#9AA3AE', padding: '10px 18px 5px', textTransform: 'uppercase' }}>
                  {SECTION_LABEL[item.kind]}
                </div>
              )}

              <div
                onMouseDown={e => { e.preventDefault(); onSelect(item) }}
                onMouseEnter={() => setActiveIndex(item.index)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 18px', cursor: 'pointer',
                  background: active ? '#FFF4F0' : 'transparent',
                  transition: 'background .1s',
                }}
              >
                {item.kind === 'product' ? (
                  <img src={item.image} alt="" loading="lazy"
                    onError={e => { e.currentTarget.src = 'https://placehold.co/80x80/F4F5F7/9AA3AE?text=%20' }}
                    style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0, background: '#F4F5F7' }} />
                ) : item.kind === 'category' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? accent : '#9AA3AE'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                ) : item.kind === 'recent' ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? accent : '#bbb'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? accent : '#bbb'} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                )}

                <span style={{
                  fontSize: 14, color: active ? accent : '#333', flex: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.kind === 'completion'
                    ? <BoldMatch label={item.label} query={query} />
                    : item.label}
                </span>

                {item.kind === 'product' && fmtPrice(item.price) && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F1419', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {fmtPrice(item.price)} TND
                  </span>
                )}

                {item.kind === 'category' && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: '#9AA3AE',
                    background: '#F4F5F7', padding: '3px 10px', borderRadius: 20,
                    flexShrink: 0, textTransform: 'uppercase', letterSpacing: '.4px',
                  }}>
                    Catégorie
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Ancien dropdown (conservé pour compat si importé ailleurs) ────
export function SuggestionsDropdown({ suggestions, activeIndex, setActiveIndex, onSelect, isRecent, onClearRecent }) {
  if (!suggestions.length) return null
  return (
    <div style={{
      position: 'absolute', top: '100%', left: '-2px', right: '-2px',
      background: '#fff', border: '2px solid #FF4500', borderTop: 'none',
      borderRadius: '0 0 24px 24px', boxShadow: '0 16px 40px rgba(0,0,0,.10)',
      overflow: 'hidden', zIndex: 3000, textAlign: 'left',
    }}>
      {isRecent && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #F4F4F4' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#9AA3AE', textTransform: 'uppercase', letterSpacing: '.5px' }}>Recherches récentes</span>
          {onClearRecent && (
            <button onMouseDown={onClearRecent} style={{ fontSize: 12, fontWeight: 600, color: '#FF4500', background: 'none', border: 'none', cursor: 'pointer' }}>Effacer</button>
          )}
        </div>
      )}
      {suggestions.map((s, i) => (
        <div key={`${s.type}-${s.text}`} onMouseDown={() => onSelect(s.text)} onMouseEnter={() => setActiveIndex(i)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', cursor: 'pointer', background: activeIndex === i ? '#FFF4F0' : '#fff', borderBottom: i < suggestions.length - 1 ? '1px solid #F4F4F4' : 'none' }}>
          {s.type === 'recent' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={activeIndex === i ? '#FF4500' : '#bbb'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={activeIndex === i ? '#FF4500' : '#bbb'} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          )}
          <span style={{ fontSize: 14, fontWeight: 500, color: activeIndex === i ? '#FF4500' : '#333', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.text}</span>
          {s.type === 'category' && (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#9AA3AE', background: '#F4F5F7', padding: '3px 10px', borderRadius: 20, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '.4px' }}>Catégorie</span>
          )}
        </div>
      ))}
    </div>
  )
}