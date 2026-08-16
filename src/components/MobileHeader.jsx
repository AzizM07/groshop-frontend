// src/components/MobileHeader.jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation, matchPath } from 'react-router-dom'
import LOGO_SRC from '../assets/logo2.png'
import LOGO_WHITE from '../assets/logo2.png' // même image, on l'inverse via CSS
import { useSearchSuggestions, SearchDropdown } from './SearchSuggestions'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

/* Orange harmonisé — même valeur partout dans le projet (header, gradient home, tabs, chips) */
const ORANGE = '#FF7A00'

/* Routes qui déclenchent la variante « produit » (bandeau orange, 2 rangées) */
const PRODUCT_ROUTES = ['/produit/:id']
/* Routes qui déclenchent la variante « home » (bandeau orange, 1 rangée, style AliExpress) */
const HOME_ROUTES = ['/']

export function useIsProductRoute() {
  const { pathname } = useLocation()
  return PRODUCT_ROUTES.some(pattern => matchPath(pattern, pathname))
}
export function useIsHomeRoute() {
  const { pathname } = useLocation()
  return HOME_ROUTES.some(pattern => matchPath({ path: pattern, end: true }, pathname))
}

export default function MobileHeader() {
  const navigate = useNavigate()
  const isProduct = useIsProductRoute()
  const isHome = useIsHomeRoute()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const { user } = useAuth()
  const cart = useCart()
  const cartCount = cart?.items?.length ?? cart?.count ?? 0

  const {
    suggestions, showDropdown, setShowDropdown,
    activeIndex, setActiveIndex, handleKeyDown,
    isRecent, clearRecent, hasRecent,
  } = useSearchSuggestions(query)

  const goToSearch = (text) => {
    setShowDropdown(false)
    if (text.trim()) navigate(`/search?q=${encodeURIComponent(text)}`)
  }

  const onSelectItem = (item) => {
    setShowDropdown(false)
    if (item?.to) navigate(item.to)
  }

  const open = showDropdown && suggestions.length > 0

  /* Hauteur du spacer selon variante */
  const spacerH = isProduct ? 104 : 56

  /* Header sur fond orange (home ou produit) → search bar transparente avec bouton noir */
  const onDark = isProduct || isHome

  // ── Champ de recherche ──
  const searchField = () => (
    <form onSubmit={e => { e.preventDefault(); goToSearch(query) }}
      style={{ flex: 1, minWidth: 0, position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', height: 38,
        background: '#fff',
        border: onDark ? 'none' : `2px solid ${ORANGE}`,
        borderRadius: 50,
        padding: onDark ? '0 3px 0 12px' : '0 5px 0 14px',
        boxSizing: 'border-box',
      }}>
        <input value={query} onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.length) setShowDropdown(true) }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          onKeyDown={e => handleKeyDown(e, onSelectItem)}
          placeholder="Rechercher un produit…"
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: '#0F1419' }} />

        <button type="button" title="Recherche par image"
          style={{ background: 'none', border: 'none', padding: '0 8px', display: 'flex', color: '#6B7785', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
          </svg>
        </button>

        <button type="submit" aria-label="Rechercher"
          style={{
            flexShrink: 0,
            width: onDark ? 44 : 30,
            height: onDark ? 32 : 30,
            borderRadius: onDark ? 999 : '50%',
            border: 'none',
            background: onDark ? '#0F1419' : ORANGE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
          <svg width={onDark ? 15 : 15} height={onDark ? 15 : 15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', border: '1px solid #E8EAED', borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,.14)', overflow: 'hidden', zIndex: 2500 }}>
          <SearchDropdown
            flatItems={suggestions}
            query={query}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            onSelect={onSelectItem}
            isRecent={isRecent}
            hasRecent={hasRecent}
            clearRecent={clearRecent}
            accent={ORANGE}
          />
        </div>
      )}
    </form>
  )

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: onDark ? ORANGE : '#fff',
        boxShadow: onDark ? 'none' : '0 1px 4px rgba(0,0,0,0.08)',
        fontFamily: FONT, boxSizing: 'border-box',
      }}>

        {isProduct ? (
          /* ═══ VARIANTE PRODUIT — bandeau orange, deux rangées ═══ */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: 52, padding: '0 14px' }}>
              <button onClick={() => navigate(-1)} aria-label="Retour"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: '#fff', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>

              <button onClick={() => setMenuOpen(o => !o)} aria-label="Menu"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: '#fff', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
              </button>

              <Link to="/" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                <img src={LOGO_WHITE} alt="GROSHOP.tn"
                  style={{ height: 26, width: 'auto', maxWidth: 110, objectFit: 'contain', display: 'block', filter: 'brightness(0) invert(1)' }}
                  onError={e => { e.currentTarget.style.display = 'none' }} />
              </Link>

              <Link to={user ? '/dashboard' : '/login'} aria-label="Compte"
                style={{ display: 'flex', color: '#fff', flexShrink: 0 }}>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </Link>

              <Link to="/panier" aria-label="Panier"
                style={{ position: 'relative', display: 'flex', color: '#fff', flexShrink: 0 }}>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: -5, right: -7, minWidth: 17, height: 17, padding: '0 4px', boxSizing: 'border-box', background: '#fff', color: ORANGE, fontSize: 10, fontWeight: 800, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>

            <div style={{ padding: '0 14px 12px' }}>
              {searchField()}
            </div>
          </>
        ) : isHome ? (
          /* ═══ VARIANTE HOME — bandeau orange AliExpress-style, une rangée ═══ */
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 56, padding: '0 12px' }}>
            <Link to="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <img src={LOGO_WHITE} alt="GROSHOP.tn"
                style={{
                  height: 30, width: 'auto', maxWidth: 110,
                  objectFit: 'contain', display: 'block',
                  filter: 'brightness(0) invert(1)', // logo blanc sur fond orange
                }}
                onError={e => { e.currentTarget.style.display = 'none' }} />
            </Link>

            {searchField()}

            <Link to="/panier" aria-label="Panier"
              style={{ position: 'relative', display: 'flex', color: '#fff', flexShrink: 0, padding: 2 }}>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -3, right: -5, minWidth: 16, height: 16, padding: '0 4px', boxSizing: 'border-box', background: '#fff', color: ORANGE, fontSize: 10, fontWeight: 800, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        ) : (
          /* ═══ VARIANTE NORMALE — fond blanc, une rangée (autres pages) ═══ */
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 56, padding: '0 12px' }}>
            <Link to="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <img src={LOGO_SRC} alt="GROSHOP.tn"
                style={{ height: 30, width: 'auto', maxWidth: 120, objectFit: 'contain', display: 'block' }}
                onError={e => { e.currentTarget.style.display = 'none' }} />
            </Link>
            {searchField()}
          </div>
        )}
      </header>

      <div style={{ height: spacerH }} aria-hidden="true" />
    </>
  )
}