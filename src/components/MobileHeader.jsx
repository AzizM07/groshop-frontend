// src/components/MobileHeader.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, matchPath, useSearchParams } from 'react-router-dom'
import LOGO_SRC from '../assets/logo4.png'
import LOGO_WHITE from '../assets/logo4.png'
import { products as productsApi } from '../lib/api'
import { useSearchSuggestions, SearchDropdown } from './SearchSuggestions'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

/* ══════════════ GRADIENT GLOBAL RÉPARTI SUR 3 ZONES ══════════════
   Un seul fondu continu, du haut de l'écran jusqu'au milieu du banner :
     • Zone 1 (header, 0→134px)    : 100% → 60% → 45%
     • Zone 2 (spacer, 134→268px)  : 45%  → 22%
     • Zone 3 (content dans MobileHome, 268→~398px) : 22% → 0% (blanc)
   La chute 100→60 est CONCENTRÉE dans les 46 premiers px (au-dessus
   de la searchbar), puis 60→0 s'étale sur les ~350px restants. */
export const GRADIENT_TOP = '#ff6c0b'   // 100% orange — Y=0
const   ORANGE_60         = '#fe8331'   // 60% mix     — Y=46 (haut searchbar)
const   ORANGE_45         = '#fb9c66'   // 45% mix     — Y=134 (bas header / haut spacer)
export const GRADIENT_MID = '#FFDEC9'   // 22% mix     — Y=268 (bas spacer / haut content)
export const GRADIENT_END = '#FFFFFF'   //  0%         — Y=398 (milieu banner)

const ORANGE = '#FF7A00'

/* Header : 0 → 34% du header = 0 → Y=46, chute rapide 100→60.
            34% → 100%          = Y=46 → Y=134, chute douce 60→45. */
const HEADER_GRADIENT = `linear-gradient(180deg, ${GRADIENT_TOP} 0%, ${ORANGE_60} 34%, ${ORANGE_45} 100%)`

/* Spacer : continue la pente douce, 45% → 22%. Pas de palier plat. */
const SPACER_GRADIENT = `linear-gradient(180deg, ${ORANGE_45} 0%, ${GRADIENT_MID} 100%)`

const PRODUCT_ROUTES = ['/produit/:id']
const HOME_ROUTES = ['/']
const SEARCH_ROUTES = ['/search']

export function useIsProductRoute() {
  const { pathname } = useLocation()
  return PRODUCT_ROUTES.some(p => matchPath(p, pathname))
}
export function useIsHomeRoute() {
  const { pathname } = useLocation()
  return HOME_ROUTES.some(p => matchPath({ path: p, end: true }, pathname))
}
export function useIsSearchRoute() {
  const { pathname } = useLocation()
  return SEARCH_ROUTES.some(p => matchPath({ path: p, end: true }, pathname))
}

const H_HOME_TOP      = 134
const H_HOME_SCROLLED = 86
const H_DEFAULT       = 56
const H_PRODUCT       = 104
const SCROLL_TRIGGER  = 30

export default function MobileHeader() {
  const navigate = useNavigate()
  const isProduct = useIsProductRoute()
  const isHome = useIsHomeRoute()
  const isSearch = useIsSearchRoute()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cats, setCats] = useState([])

  const { user } = useAuth()
  const cart = useCart()
  const cartCount = cart?.items?.length ?? cart?.count ?? 0

  const {
    suggestions, showDropdown, setShowDropdown,
    activeIndex, setActiveIndex, handleKeyDown,
    isRecent, clearRecent, hasRecent,
  } = useSearchSuggestions(query)

  useEffect(() => {
    if (!isHome) { setScrolled(false); return }
    const onScroll = () => setScrolled(window.scrollY > SCROLL_TRIGGER)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  useEffect(() => {
    if (!isHome && !isSearch) return
    productsApi.categories().then(d => setCats(d || [])).catch(() => {})
  }, [isHome, isSearch])

  const goToSearch = (text) => {
    setShowDropdown(false)
    if (text.trim()) navigate(`/search?q=${encodeURIComponent(text)}`)
  }
  const onSelectItem = (item) => {
    setShowDropdown(false)
    if (item?.to) navigate(item.to)
  }
  const openDrop = showDropdown && suggestions.length > 0

  const onDark = isProduct || (isHome && !scrolled)

  let spacerH = H_DEFAULT
  if (isProduct) spacerH = H_PRODUCT
  else if (isHome) spacerH = scrolled ? H_HOME_SCROLLED : H_HOME_TOP
  else if (isSearch) spacerH = H_HOME_SCROLLED

  let headerBg = '#fff'
  if (isProduct) headerBg = ORANGE
  else if (isHome && !scrolled) headerBg = HEADER_GRADIENT

  /* Spacer : dégradé 45% → 22% (continuité de la courbe, aucune bande plate) */
  let spacerBg = 'transparent'
  if (isProduct) spacerBg = ORANGE
  else if (isHome && !scrolled) spacerBg = SPACER_GRADIENT

  const searchField = ({ dark }) => (
    <form onSubmit={e => { e.preventDefault(); goToSearch(query) }}
      style={{ flex: 1, minWidth: 0, position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', height: 40,
        background: '#fff',
        border: dark ? 'none' : '1.5px solid #0F1419',
        borderRadius: 999,
        padding: '0 4px 0 14px', boxSizing: 'border-box',
        transition: 'border-color .18s',
      }}>
        <button type="button" title="Recherche par image"
          style={{ background: 'none', border: 'none', padding: 0, marginRight: 8, display: 'flex', color: '#6B7785', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </button>
        <div style={{ width: 1, height: 18, background: '#E5E7EB', marginRight: 10, flexShrink: 0 }} />
        <input value={query} onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.length) setShowDropdown(true) }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          onKeyDown={e => handleKeyDown(e, onSelectItem)}
          placeholder="Rechercher un produit…"
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: '#0F1419' }} />
        <button type="submit" aria-label="Rechercher"
          style={{
            flexShrink: 0, width: 50, height: 32,
            borderRadius: 999, border: 'none',
            background: '#0F1419',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {openDrop && (
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

  const HomeTabs = ({ dark }) => {
    const location = useLocation()
    const [params] = useSearchParams()
    // "cat" vient toujours en string depuis l'URL, on ne le compare qu'en string
    const activeCatId = location.pathname === '/search' ? params.get('cat') : null

    const tabs = [
      { key: null, name: 'Pour vous', to: '/' },
      ...cats.map(c => ({
        key: c.id,
        name: c.name,
        to: `/search?cat=${c.id}`,
      })),
    ]

    return (
      <div style={{
        display: 'flex', gap: 22, overflowX: 'auto', padding: '0 14px',
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
      }}>
        {tabs.map(t => {
          const on = t.key === null
            ? location.pathname === '/'
            : activeCatId !== null && String(activeCatId) === String(t.key)

          const isPourVous = t.key === null

          const color = dark
            ? (on ? '#FFFFFF' : 'rgba(255,255,255,.75)')
            : (on ? (isPourVous ? ORANGE : '#0F1419') : '#6B7785')

          const underline = dark
            ? '#FFFFFF'
            : (isPourVous && on ? ORANGE : '#3e3e3e')

          return (
            <Link key={t.key ?? 'all'} to={t.to}
              style={{
                flexShrink: 0, textDecoration: 'none', whiteSpace: 'nowrap',
                padding: '10px 2px 9px', position: 'relative',
                fontSize: 15, fontWeight: on ? 500 : 600,
                color, transition: 'color .18s',
              }}>
              {t.name}
              {on && (
                <span style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0,
                  height: 2.5, borderRadius: 2, background: underline,
                }} />
              )}
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: headerBg,
        boxShadow: onDark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
        fontFamily: FONT, boxSizing: 'border-box',
        transition: 'background .18s',
      }}>

        {isProduct ? (
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
              <Link to={user ? '/dashboard' : '/login'} aria-label="Compte" style={{ display: 'flex', color: '#fff', flexShrink: 0 }}>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </Link>
              <Link to="/panier" aria-label="Panier" style={{ position: 'relative', display: 'flex', color: '#fff', flexShrink: 0 }}>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: -5, right: -7, minWidth: 17, height: 17, padding: '0 4px', boxSizing: 'border-box', background: '#fff', color: ORANGE, fontSize: 10, fontWeight: 800, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
            <div style={{ padding: '0 14px 12px' }}>{searchField({ dark: true })}</div>
          </>
        ) : isHome ? (
          <>
            {!scrolled && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px 4px',
              }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={LOGO_WHITE} alt="GROSHOP.tn"
                    style={{
                      height: 28, width: 'auto', maxWidth: 130,
                      objectFit: 'contain', display: 'block',
                      filter: 'brightness(0) invert(1)',
                    }}
                    onError={e => { e.currentTarget.style.display = 'none' }} />
                </Link>
                <Link to="/panier" aria-label="Panier"
                  style={{ position: 'relative', display: 'flex', color: '#fff' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
                  {cartCount > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -6, minWidth: 17, height: 17, padding: '0 4px', boxSizing: 'border-box', background: '#fff', color: ORANGE, fontSize: 10, fontWeight: 800, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </div>
            )}

            <div style={{ padding: scrolled ? '8px 12px 6px' : '4px 12px 8px' }}>
              {searchField({ dark: !scrolled })}
            </div>

            {/* dark=true tant qu'on est sur le fond orange (haut de page),
                dark=false une fois scrollé (fond blanc) */}
            <HomeTabs dark={!scrolled} />
          </>
        ) : isSearch ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 56, padding: '0 12px' }}>
              <Link to="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <img src={LOGO_SRC} alt="GROSHOP.tn"
                  style={{ height: 30, width: 'auto', maxWidth: 120, objectFit: 'contain', display: 'block' }}
                  onError={e => { e.currentTarget.style.display = 'none' }} />
              </Link>
              {searchField({ dark: false })}
            </div>
            <HomeTabs dark={false} />
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 56, padding: '0 12px' }}>
            <Link to="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <img src={LOGO_SRC} alt="GROSHOP.tn"
                style={{ height: 30, width: 'auto', maxWidth: 120, objectFit: 'contain', display: 'block' }}
                onError={e => { e.currentTarget.style.display = 'none' }} />
            </Link>
            {searchField({ dark: false })}
          </div>
        )}
      </header>

      {/* Spacer avec dégradé continu 45% → 22% (aucune bande plate) */}
      <div style={{
        height: spacerH,
        background: spacerBg,
        transition: 'height .18s, background .18s',
      }} aria-hidden="true" />
    </>
  )
}