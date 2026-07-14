// Header.jsx — GROSHOP.tn

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { products } from '../lib/api'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import * as Icons from 'lucide-react'
import LOGO_SRC from '../assets/logo2.png'
import { useSearchSuggestions, SuggestionsDropdown } from './SearchSuggestions'

if (typeof document !== 'undefined' && !document.getElementById('header-anim')) {
  const s = document.createElement('style')
  s.id = 'header-anim'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&display=swap');

    @keyframes fadeIn { from { opacity:0; transform:scaleX(0.95) } to { opacity:1; transform:scaleX(1) } }
    @keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

    /* Icônes utilitaires (messages, commandes, panier, compte) — taille relative */
    .gh-util svg { width: clamp(23px, 2.2vw, 30px); height: clamp(23px, 2.2vw, 30px); }

    /* Animation d'ouverture des menus déroulants */
    @keyframes dropdownIn { from { opacity: 0; transform: translateY(-10px) } to { opacity: 1; transform: translateY(0) } }
    .gh-dd { animation: dropdownIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); transform-origin: top center; }

    /* ── Anti-scroll horizontal (clip, pas hidden : ne casse pas le fixed/sticky) ── */
    html, body { overflow-x: clip; max-width: 100%; }

    /* ── Spacer : compense la hauteur du header fixed (ligne1 + ligne2) ── */
    .gh-spacer { height: clamp(106px, 11vw, 126px); flex-shrink: 0; }

    /* Responsive header */
    @media (max-width: 1100px) { .gh-delivery { display: none !important; } }
    @media (max-width: 920px)  { .gh-lang-text, .gh-account-text { display: none !important; } }
    @media (max-width: 720px)  {
      .gh-cta    { padding: 9px 14px !important; font-size: 13px !important; }
      .gh-search { flex-basis: clamp(120px, 40vw, 560px) !important; padding-left: 12px !important; }
      .gh-searchbtn-text { display: none !important; }
      .gh-searchcam      { display: none !important; }
    }
    @media (max-width: 600px)  {
      .gh-lang { display: none !important; }
      .gh-logo { max-width: clamp(110px, 34vw, 150px) !important; }
    }
    @media (max-width: 560px)  {
      .gh-line2   { display: none !important; }
      .gh-spacer  { height: clamp(68px, 7vw, 88px); }
    }
  `
  document.head.appendChild(s)
}

export default function Header() {
  const { user, signOut }           = useAuth()
  const navigate                    = useNavigate()
  const location                    = useLocation()
  const isHome                      = location.pathname === '/'

  const [showSearch, setShowSearch] = useState(!isHome)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { setShowSearch(!isHome) }, [isHome])

  useEffect(() => {
    if (!isHome) return
    const handler = (e) => setShowSearch(!e.detail.visible)
    window.addEventListener('herosearch-visibility', handler)
    return () => window.removeEventListener('herosearch-visibility', handler)
  }, [isHome])

  const {
    suggestions, showDropdown, setShowDropdown,
    activeIndex, setActiveIndex, handleKeyDown,
  } = useSearchSuggestions(searchQuery)

  const goToSearch = (text) => {
    setShowDropdown(false)
    if (text.trim()) navigate(`/search?q=${encodeURIComponent(text)}`)
  }

  return (
    <>
      <header style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        background: '#fff',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        maxWidth: '100%', boxSizing: 'border-box',
      }}>

        {/* ══ LIGNE 1 ══ */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '0 clamp(16px, 3.5vw, 40px)',
          height: 'clamp(68px, 7vw, 88px)',
          background: '#fff',
          gap: 'clamp(6px, 1vw, 16px)',
          minWidth: 0, maxWidth: '100%', overflow: 'visible', boxSizing: 'border-box',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
            <img src={LOGO_SRC} alt="GROSHOP.tn" className="gh-logo"
              style={{
                height: 'auto', width: 'auto',
                maxHeight: 'clamp(48px, 5.5vw, 72px)',
                maxWidth: 'clamp(140px, 18vw, 200px)',
                display: 'block', objectFit: 'contain',
              }}
              onError={e => { e.currentTarget.style.display = 'none' }} />
          </Link>

          <div style={{ flex: 1, minWidth: 0 }} />

          {showSearch && (
            <form className="gh-search"
              onSubmit={e => { e.preventDefault(); goToSearch(searchQuery) }}
              style={{
                display: 'flex', alignItems: 'center',
                border: '2px solid #FF4500',
                borderRadius: showDropdown ? '24px 24px 0 0' : '50px',
                height: 'clamp(42px, 4.5vw, 50px)',
                flex: '0 1 clamp(200px, 42vw, 760px)',
                marginRight: 'clamp(8px, 1.5vw, 20px)',
                paddingLeft: '20px', paddingRight: '4px',
                background: '#fff', animation: 'fadeIn 0.2s ease', minWidth: 0,
                position: 'relative', boxSizing: 'border-box',
              }}>

              <input type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowDropdown(true) }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                onKeyDown={e => handleKeyDown(e, goToSearch)}
                placeholder="Rechercher..."
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: '14px', color: '#0F1419', background: 'transparent' }} />

              <button type="button" title="Recherche par image" className="gh-searchcam"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', display: 'flex', alignItems: 'center', color: '#6B7785', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
              </button>

              <div style={{ width: '1px', height: '22px', background: '#E8EAED', marginRight: '4px', flexShrink: 0 }} />

              <button type="submit"
                style={{
                  background: 'linear-gradient(135deg, #FF8A3D, #FF4500)',
                  border: 'none', borderRadius: '50px',
                  padding: '0 clamp(14px, 1.6vw, 24px)', height: 'clamp(34px, 3.6vw, 40px)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  transition: 'filter 0.15s', flexShrink: 0, whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.95)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span className="gh-searchbtn-text">Rechercher</span>
              </button>

              {showDropdown && suggestions.length > 0 && (
                <SuggestionsDropdown
                  suggestions={suggestions}
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                  onSelect={goToSearch}
                />
              )}
            </form>
          )}

          <div className="gh-delivery" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginRight: '6px', cursor: 'pointer', lineHeight: 1.05, flexShrink: 0 }}>
            <span style={{ fontSize: 'clamp(11px, 0.95vw, 13.5px)', color: '#6B7785', marginBottom: '3px' }}>Adresse de livraison :</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'clamp(14px, 1.25vw, 17px)', fontWeight: 700, color: '#0F1419' }}>
              <span style={{ fontSize: 'clamp(16px, 1.4vw, 20px)' }}>🇹🇳</span>TN
            </span>
          </div>

          <Divider />

          <button className="gh-lang" style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'none', border: 'none', cursor: 'pointer', padding: '0 14px', fontSize: 'clamp(13.5px, 1.15vw, 16.5px)', color: '#0F1419', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3D4853" strokeWidth="1.8" style={{ width: 'clamp(17px, 1.5vw, 21px)', height: 'clamp(17px, 1.5vw, 21px)', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
            <span className="gh-lang-text">Français-TND</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="#6B7785" strokeWidth="2.5" style={{ width: 'clamp(11px, 1vw, 14px)', height: 'clamp(11px, 1vw, 14px)', flexShrink: 0 }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>

          {user ? (
            /* ══ CONNECTÉ : rangée d'icônes ══ */
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 1.7vw, 24px)', marginLeft: 'clamp(12px, 1.8vw, 26px)', flexShrink: 0 }}>
              <HeaderIcon to="/messages" title="Messages">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </HeaderIcon>
              <HeaderIcon to="/dashboard/commandes" title="Mes commandes">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1"/>
                  <line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="13" y2="15"/>
                </svg>
              </HeaderIcon>
              <HeaderIcon to="/panier" title="Panier">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </HeaderIcon>
              <AccountMenu signOut={signOut} />
            </div>
          ) : (
            /* ══ DÉCONNECTÉ ══ */
            <>
              <Divider />

              <button style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#0F1419', padding: '0 14px', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </button>

              <Divider />

              <Link to="/login" style={{ ...topLinkStyle, padding: '0 14px', flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ marginRight: '5px' }}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="gh-account-text">Se connecter</span>
              </Link>

              <Link to="/signup/buyer" className="gh-cta"
                style={{ background: '#FF4500', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 700, padding: '10px 24px', borderRadius: '6px', marginLeft: '10px', whiteSpace: 'nowrap', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background = '#D63A00' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FF4500' }}>
                Créer un compte
              </Link>
            </>
          )}
        </div>

        {/* ══ LIGNE 2 ══ */}
        <nav className="gh-line2" style={{ display: 'flex', alignItems: 'center', padding: '0 clamp(16px, 3.5vw, 40px)', height: '38px', background: '#fff', position: 'relative', overflow: 'visible', maxWidth: '100%', boxSizing: 'border-box' }}>
          <CategoriesButton />
          <div style={{ flex: 1, minWidth: 0 }} />
          <AppNavLink />
          <VendreNavLink />
        </nav>
      </header>

      {/* ══ SPACER : réserve la place du header fixed ══ */}
      <div className="gh-spacer" aria-hidden="true" />
    </>
  )
}

// ── HeaderIcon (icône cliquable avec hover orange) ────────────────
function HeaderIcon({ to, title, children }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to} title={title} className="gh-util"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: hov ? '#FF4500' : '#0F1419', textDecoration: 'none', transition: 'color .15s', flexShrink: 0 }}>
      {children}
    </Link>
  )
}

// ── AccountMenu (icône compte + menu déroulant avec déconnexion) ──
function AccountMenu({ signOut }) {
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)
  const enter = () => { clearTimeout(timerRef.current); setOpen(true) }
  const leave = () => { timerRef.current = setTimeout(() => setOpen(false), 150) }
  const links = [
    { label: 'Mon compte',        to: '/dashboard' },
    { label: 'Mes commandes',     to: '/dashboard/commandes' },
    { label: 'Mes messages',      to: '/messages' },
    { label: 'Liste de souhaits', to: '/favoris' },
  ]
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} onMouseEnter={enter} onMouseLeave={leave}>
      <Link to="/dashboard" title="Mon compte" className="gh-util"
        style={{ display: 'flex', alignItems: 'center', color: open ? '#FF4500' : '#0F1419', textDecoration: 'none', transition: 'color .15s' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </Link>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '12px', background: '#fff', border: '1px solid #E8EAED', borderRadius: '12px', boxShadow: '0 8px 28px rgba(0,0,0,0.12)', minWidth: '200px', padding: '8px', zIndex: 2000 }}>
          {links.map((it, i) => (
            <Link key={i} to={it.to}
              style={{ display: 'block', padding: '9px 12px', fontSize: '13.5px', color: '#0F1419', textDecoration: 'none', borderRadius: '8px' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              {it.label}
            </Link>
          ))}
          <div style={{ height: '1px', background: '#E8EAED', margin: '6px 4px' }} />
          <button onClick={signOut}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: '13.5px', color: '#D63A00', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FFF4F0' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
            Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}

// ── CatIcon ───────────────────────────────────────────────────────
function CatIcon({ name, size = 18, color = 'currentColor' }) {
  const Icon = Icons[name]
  if (!Icon) return <Icons.Grid size={size} color={color} />
  return <Icon size={size} color={color} strokeWidth={1.6} />
}

// ── CategoriesButton ──────────────────────────────────────────────
function CategoriesButton() {
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)
  const handleEnter = () => { clearTimeout(timerRef.current); setOpen(true) }
  const handleLeave = () => { timerRef.current = setTimeout(() => setOpen(false), 150) }

  return (
    <div style={{ position: 'relative', height: '38px', display: 'flex', alignItems: 'center' }}
      onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'clamp(14px, 1.1vw, 16px)', fontWeight: 600, color: open ? '#FF4500' : '#0F1419', padding: '0 14px 0 0', height: '100%', marginRight: '12px', flexShrink: 0, whiteSpace: 'nowrap' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        Toutes les catégories
      </button>
      {open && <MegaMenu onMouseEnter={handleEnter} onMouseLeave={handleLeave} />}
    </div>
  )
}

// ── SubCategoryItem ───────────────────────────────────────────────
function SubCategoryItem({ sub }) {
  const [hov, setHov] = useState(false)

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ textAlign: 'center', cursor: 'pointer', width: '100%' }}>

      <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 10px' }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          overflow: 'hidden',
          transition: 'transform 0.2s, background 0.2s',
          transform: hov ? 'scale(1.04)' : 'scale(1)',
          background: hov ? '#EAECEF' : '#F2F3F5',
        }}>
          {sub.image_url ? (
            <img
              src={sub.image_url}
              alt={sub.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={e => { e.target.style.display = 'none' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
            }}>
              {sub.emoji || (sub.name && sub.name[0])}
            </div>
          )}
        </div>

        {sub.is_external && (
          <div style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#1668FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(22,104,255,0.3)',
            zIndex: 2,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </div>
        )}

        {sub.is_hot && !sub.is_external && (
          <div style={{ position: 'absolute', top: '-4px', right: '-4px', zIndex: 2 }}>
            <DotLottieReact src="/src/assets/lottie/fire.json" autoplay loop width={32} height={32} />
          </div>
        )}
        {sub.is_new && !sub.is_hot && !sub.is_external && (
          <div style={{ position: 'absolute', top: '-6px', right: '-10px', zIndex: 2 }}>
            <DotLottieReact src="/src/assets/lottie/new.json" autoplay loop width={44} height={44} />
          </div>
        )}
      </div>

      <div style={{
        fontSize: '13px',
        fontWeight: 400,
        color: hov ? '#1668FF' : '#1F2937',
        lineHeight: 1.35,
        transition: 'color 0.15s',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        padding: '0 4px',
        minHeight: '36px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}>
        {sub.name}
      </div>
    </div>
  )
}

// ── MegaMenu ──────────────────────────────────────────────────────
const POUR_VOUS_ID = '__pour_vous__'
const _cache = { categories: null, allSubs: null, subs: {} }

function MegaMenu({ onMouseEnter, onMouseLeave }) {
  const [categories, setCategories] = useState(_cache.categories || [])
  const [activeId, setActiveId]     = useState(POUR_VOUS_ID)
  const [loading, setLoading]       = useState(!_cache.categories)
  const [, forceUpdate]             = useState(0)
  const rightRef             = useRef(null)
  const leftRef              = useRef(null)
  const isScrollingFromClick = useRef(false)

  const scrollToCategory = (catId) => {
    if (catId === POUR_VOUS_ID) {
      rightRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.getElementById(`cat-section-${catId}`)
    if (el && rightRef.current) {
      isScrollingFromClick.current = true
      rightRef.current.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
      setTimeout(() => { isScrollingFromClick.current = false }, 800)
    }
  }

  const handleRightScroll = () => {
    if (isScrollingFromClick.current || !rightRef.current) return
    if (activeId !== POUR_VOUS_ID) return
    const scrollTop = rightRef.current.scrollTop
    const cats = _cache.categories || []
    for (let i = cats.length - 1; i >= 0; i--) {
      const el = document.getElementById(`cat-section-${cats[i].id}`)
      if (el && el.offsetTop <= scrollTop + 100) {
        document.querySelectorAll('[id^="cat-left-"]').forEach(e => {
          e.style.background = 'transparent'
          e.style.borderLeft = '4px solid transparent'
        })
        const leftEl = document.getElementById(`cat-left-${cats[i].id}`)
        if (leftEl) {
          leftEl.style.background = '#F4F5F7'
          leftEl.style.borderLeft = '4px solid #1F2937'
          leftEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
        return
      }
    }
    const pourVousEl = document.getElementById(`cat-left-${POUR_VOUS_ID}`)
    if (pourVousEl) {
      pourVousEl.style.background = '#F4F5F7'
      pourVousEl.style.borderLeft = '4px solid #1F2937'
    }
  }

  useEffect(() => {
  if (_cache.categories) return
  products.categories().then(data => {
    const cats = data || []
    // L'API Django renvoie les catégories racines AVEC leurs children imbriqués
    // On sépare en 2 structures : racines (sans children) + map des sous-cats
    const c = cats.map(({ children, ...rest }) => rest)
    const s = []

    cats.forEach(cat => {
      const subs = (cat.children || []).map(sub => ({
        ...sub,
        parent_id: cat.id,   // ← compatibilité avec l'ancien code
      }))
      _cache.subs[cat.id] = subs
      s.push(...subs)
    })

    _cache.categories = c
    _cache.allSubs = s
    setCategories(c)
    setLoading(false)
    forceUpdate(n => n + 1)
  }).catch(err => {
    console.error('Categories error:', err)
    setLoading(false)
  })
}, [])

  const activeCat  = activeId === POUR_VOUS_ID
    ? { id: POUR_VOUS_ID, name: 'Catégories pour vous', emoji: '⭐' }
    : categories.find(c => c.id === activeId)

  const activeSubs = activeId === POUR_VOUS_ID
    ? (() => { const all = _cache.allSubs || []; return [...all].sort(() => Math.random() - 0.5).slice(0, 14) })()
    : (_cache.subs[activeId] || [])

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="gh-dd"
      style={{
        /* COLLÉ EN HAUT — touche le bas du header de navigation */
        position: 'fixed',
        top: 'clamp(106px, 11vw, 126px)',
        left: 0,
        right: 0,
        /* Le fond prend toute la largeur (pas de scroll horizontal via 100vw) */
        height: '540px',
        background: '#fff',
        borderTop: '1px solid #E8EAED',
        boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        zIndex: 2000,
      }}
    >
      {/* Container interne centré avec marges latérales — c'est ça qui crée le "blanc" autour */}
      <div style={{
        maxWidth: '1600px',
        width: '100%',
        height: '100%',
        margin: '0 auto',
        padding: '0 clamp(40px, 4vw, 80px)',  /* marges blanches gauche/droite */
        display: 'flex',
        boxSizing: 'border-box',
      }}>

        {/* SIDEBAR gauche */}
        <div ref={leftRef} style={{
          width: '300px',
          flexShrink: 0,
          overflowY: 'auto',
          height: '100%',
          background: '#fff',
          padding: '20px 0',
        }}>
          {loading
            ? [...Array(10)].map((_, i) => <div key={i} style={{ height: '48px', margin: '4px 12px', background: '#F4F5F7', borderRadius: '6px', animation: 'skeleton-pulse 1.5s infinite' }} />)
            : [{ id: POUR_VOUS_ID, name: 'Catégories pour vous', is_hot: false, is_new: false }, ...categories].map(cat => {
                const isActive = activeId === cat.id
                return (
                  <div
                    key={cat.id}
                    id={`cat-left-${cat.id}`}
                    onMouseEnter={() => setActiveId(cat.id)}
                    onClick={() => { setActiveId(cat.id); scrollToCategory(cat.id) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 24px',
                      cursor: 'pointer',
                      background: isActive ? '#F4F5F7' : 'transparent',
                      borderLeft: isActive ? '4px solid #1F2937' : '4px solid transparent',
                      transition: 'background 0.1s',
                      position: 'relative',
                    }}
                  >
                    <span style={{
                      flexShrink: 0,
                      color: '#1F2937',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: isActive ? 1 : 0.85,
                    }}>
                      {cat.id === POUR_VOUS_ID
                        ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        : <CatIcon name={cat.icon} size={22} color="#1F2937" />
                      }
                    </span>
                    <span style={{
                      fontSize: '14px',
                      flex: 1,
                      lineHeight: 1.3,
                      fontWeight: isActive ? 700 : 500,
                      color: '#1F2937',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                    }}>
                      {cat.name}
                    </span>
                    {cat.is_hot && <span style={{ fontSize: '14px' }}>🔥</span>}
                    {cat.is_new && <span style={{ background: '#0F9D58', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px' }}>NEW</span>}
                  </div>
                )
              })
          }
        </div>

        {/* PANNEAU droit — grille catégories */}
        <div ref={rightRef} onScroll={handleRightScroll} style={{
          flex: 1,
          overflowY: 'auto',
          height: '100%',
          padding: '24px 0 24px 40px',
          background: '#fff',
          scrollbarWidth: 'thin',
          scrollbarColor: '#C0C6CC #f0f0f0',
          minWidth: 0,
        }}>
          {activeCat && (
            <>
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '24px 12px' }}>
                  {[...Array(14)].map((_, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#F2F3F5', margin: '0 auto 10px', animation: 'skeleton-pulse 1.5s infinite' }} />
                      <div style={{ height: '10px', background: '#F2F3F5', borderRadius: '4px', width: '70%', margin: '0 auto' }} />
                    </div>
                  ))}
                </div>
              ) : activeId === POUR_VOUS_ID ? (
                (() => {
                  const allSubs = Object.values(_cache.subs).flat()
                  const randomSubs = [...allSubs].sort(() => Math.random() - 0.5).slice(0, 14)
                  const cats = _cache.categories || []
                  return (
                    <div>
                      <div style={{ marginBottom: '32px' }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#1F2937',
                          marginBottom: '20px',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                        }}>
                          Catégories pour vous
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '20px 12px' }}>
                          {randomSubs.map((sub, i) => <SubCategoryItem key={`${sub.id}-${i}`} sub={sub} />)}
                        </div>
                      </div>
                      {cats.map(cat => {
                        const catSubs = _cache.subs[cat.id] || []
                        if (catSubs.length === 0) return null
                        return (
                          <div key={cat.id} id={`cat-section-${cat.id}`} style={{ marginBottom: '32px' }}>
                            <div style={{
                              fontSize: '18px',
                              fontWeight: 700,
                              color: '#1F2937',
                              marginBottom: '20px',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                            }}>
                              {cat.name}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '20px 12px' }}>
                              {catSubs.map(sub => <SubCategoryItem key={sub.id} sub={sub} />)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()
              ) : activeSubs.length > 0 ? (
                <>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1F2937',
                    marginBottom: '20px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                  }}>
                    {activeCat.name}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '20px 12px' }}>
                    {activeSubs.map(sub => <SubCategoryItem key={sub.id} sub={sub} />)}
                  </div>
                </>
              ) : (
                <div style={{ color: '#9AA3AE', fontSize: '13px', paddingTop: '20px' }}>Aucune sous-catégorie</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── ProtectionNavLink ─────────────────────────────────────────────
function ProtectionNavLink() {
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)
  const handleEnter = () => { clearTimeout(timerRef.current); setOpen(true) }
  const handleLeave = () => { timerRef.current = setTimeout(() => setOpen(false), 150) }
  return (
    <div style={{ position: 'relative', height: '38px', display: 'flex', alignItems: 'center' }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <a href="/protection" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 12px', height: '38px', textDecoration: 'none', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: open ? 600 : 400, color: open ? '#FF4500' : '#3D4853', borderBottom: open ? '2px solid #FF4500' : '2px solid transparent', transition: 'color 0.15s, border-color 0.15s' }}>
        Protection des commandes
      </a>
      {open && <ProtectionMenu onMouseEnter={handleEnter} onMouseLeave={handleLeave} />}
    </div>
  )
}

function ProtectionMenu({ onMouseEnter, onMouseLeave }) {
  const items = [
    { icon: 'ShieldCheck', label: 'Paiements sûrs et faciles',  desc: 'Paiements 100% sécurisés',  href: '/protection/paiements' },
    { icon: 'RefreshCw',   label: 'Politique de remboursement', desc: 'Remboursement garanti',      href: '/protection/remboursement' },
    { icon: 'Ship',        label: 'Services logistiques',        desc: 'Livraison suivie',           href: '/protection/logistique' },
    { icon: 'Wrench',      label: 'Protections après-vente',    desc: 'SAV dédié aux acheteurs',    href: '/protection/apres-vente' },
  ]
  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      style={{ position: 'fixed', top: 'clamp(106px, 11vw, 126px)', left: 0, right: 0, background: '#fff', borderTop: '1px solid #E8EAED', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', zIndex: 2000, padding: '40px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', display: 'flex', gap: '80px', alignItems: 'center' }}>
        <div style={{ flexShrink: 0, width: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #FFF3CD, #FFE082)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.ShieldCheck size={22} color="#E65C00" strokeWidth={2} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F1419' }}>Protection des commandes</span>
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0F1419', lineHeight: 1.25, margin: '0 0 10px' }}>Achetez en toute confiance</h3>
          <p style={{ fontSize: '14px', color: '#6B7785', lineHeight: 1.6, margin: '0 0 24px' }}>Votre paiement est protégé jusqu'à la réception et validation de votre commande.</p>
          <a href="/protection" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FF4500', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 700, padding: '11px 28px', borderRadius: '8px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#D63A00' }} onMouseLeave={e => { e.currentTarget.style.background = '#FF4500' }}>
            En savoir plus <Icons.ArrowRight size={16} />
          </a>
        </div>
        <div style={{ width: '1px', height: '160px', background: '#E8EAED', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {items.map((item, i) => {
            const Icon = Icons[item.icon] || Icons.Shield
            return (
              <a key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: '14px', textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#FFF8F5'; e.currentTarget.style.borderColor='#FFD0BC'; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background='#FAFAFA'; e.currentTarget.style.borderColor='#F0F0F0'; e.currentTarget.style.transform='none' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFF3CD, #FFE082)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color="#E65C00" strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F1419', marginBottom: '3px' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: '#9AA3AE' }}>{item.desc}</div>
                </div>
                <Icons.ArrowRight size={16} color="#C0C6CC" style={{ flexShrink: 0 }} />
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CentreAcheteursNavLink() {
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)
  const handleEnter = () => { clearTimeout(timerRef.current); setOpen(true) }
  const handleLeave = () => { timerRef.current = setTimeout(() => setOpen(false), 150) }
  const links = [
    { label: 'Pourquoi GROSHOP ?',              href: '/about' },
    { label: 'À propos de GROSHOP',              href: '/about/groshop' },
    { label: 'Comment fonctionne le sourcing ?', href: '/about/sourcing' },
    { label: 'Actualités GROSHOP',               href: '/news' },
  ]
  const services = [
    { label: 'Protection des commandes',          href: '/protection' },
    { label: 'Suivi de production et inspection', href: '/inspection' },
  ]
  const assistance = [
    { label: 'Assistance pour les acheteurs', href: '/help/acheteurs' },
    { label: 'Ouvrir un litige',              href: '/help/litige' },
    { label: 'Signaler un abus',              href: '/help/abus' },
  ]
  return (
    <div style={{ position: 'relative', height: '38px', display: 'flex', alignItems: 'center' }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <a href="/acheteurs" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 12px', height: '38px', textDecoration: 'none', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: open ? 600 : 400, color: open ? '#FF4500' : '#3D4853', borderBottom: open ? '2px solid #FF4500' : '2px solid transparent', transition: 'color 0.15s, border-color 0.15s' }}>Centre des acheteurs</a>
      {open && (
        <div onMouseEnter={handleEnter} onMouseLeave={handleLeave}
          style={{ position: 'fixed', top: 'clamp(106px, 11vw, 126px)', left: 0, right: 0, background: '#fff', borderTop: '1px solid #E8EAED', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', zIndex: 2000, padding: '36px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1px 1fr', gap: '0 40px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F1419', marginBottom: '14px' }}>Pourquoi GROSHOP ?</div>
              {links.map((l, i) => <a key={i} href={l.href} style={{ display: 'block', fontSize: '13px', color: '#3D4853', textDecoration: 'none', padding: '6px 0' }} onMouseEnter={e => e.target.style.color='#FF4500'} onMouseLeave={e => e.target.style.color='#3D4853'}>{l.label}</a>)}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F1419', marginBottom: '14px' }}>Services</div>
              {services.map((l, i) => <a key={i} href={l.href} style={{ display: 'block', fontSize: '13px', color: '#3D4853', textDecoration: 'none', padding: '6px 0' }} onMouseEnter={e => e.target.style.color='#FF4500'} onMouseLeave={e => e.target.style.color='#3D4853'}>{l.label}</a>)}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F1419', marginBottom: '14px' }}>Centre d'assistance</div>
              {assistance.map((l, i) => <a key={i} href={l.href} style={{ display: 'block', fontSize: '13px', color: '#3D4853', textDecoration: 'none', padding: '6px 0' }} onMouseEnter={e => e.target.style.color='#FF4500'} onMouseLeave={e => e.target.style.color='#3D4853'}>{l.label}</a>)}
            </div>
            <div style={{ background: '#E8EAED' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F1419', marginBottom: '14px' }}>Magasins partenaires</div>
              <a href="/partenaires/wix" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', border: '1px solid #E8EAED', borderRadius: '10px', textDecoration: 'none', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#FF4500'} onMouseLeave={e => e.currentTarget.style.borderColor='#E8EAED'}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px', color: '#0F1419' }}>WiX</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F1419' }}>Intégrer GROSHOP à Wix</div>
                  <div style={{ fontSize: '12px', color: '#9AA3AE' }}>Connectez votre boutique</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AppNavLink() {
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)
  const handleEnter = () => { clearTimeout(timerRef.current); setOpen(true) }
  const handleLeave = () => { timerRef.current = setTimeout(() => setOpen(false), 150) }
  return (
    <div style={{ position: 'relative', height: '38px', display: 'flex', alignItems: 'center' }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <a href="/app" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 12px', height: '38px', textDecoration: 'none', whiteSpace: 'nowrap', fontSize: 'clamp(14px, 1.1vw, 16px)', fontWeight: open ? 600 : 400, color: open ? '#FF4500' : '#3D4853', borderBottom: open ? '2px solid #FF4500' : '2px solid transparent', transition: 'color 0.15s, border-color 0.15s' }}>Application et extension</a>
      {open && (
        <div onMouseEnter={handleEnter} onMouseLeave={handleLeave} className="gh-dd"
          style={{ position: 'fixed', top: 'clamp(106px, 11vw, 126px)', left: 0, right: 0, background: '#fff', borderTop: '1px solid #E8EAED', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', zIndex: 2000, padding: '40px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '0 60px', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F1419', marginBottom: '10px' }}>Téléchargez l'application GROSHOP</div>
              <p style={{ fontSize: '13px', color: '#6B7785', lineHeight: 1.6, margin: '0 0 20px' }}>Trouvez des produits, communiquez avec des fournisseurs, gérez et payez vos commandes partout.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href="/app/ios" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0F1419', color: '#fff', textDecoration: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                  <Icons.Apple size={18} /> App Store
                </a>
                <a href="/app/android" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0F1419', color: '#fff', textDecoration: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                  <Icons.Smartphone size={18} /> Google Play
                </a>
              </div>
            </div>
            <div style={{ background: '#E8EAED', height: '120px', alignSelf: 'center' }} />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F1419', marginBottom: '10px' }}>Découvrez GROSHOP Lens</div>
              <p style={{ fontSize: '13px', color: '#6B7785', lineHeight: 1.6, margin: '0 0 16px' }}>Recherche d'images pour trouver et comparer des produits similaires avec des prix de gros.</p>
              <a href="/extension" style={{ fontSize: '13px', color: '#FF4500', fontWeight: 600, textDecoration: 'underline' }}>En savoir plus →</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VendreNavLink() {
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)
  const handleEnter = () => { clearTimeout(timerRef.current); setOpen(true) }
  const handleLeave = () => { timerRef.current = setTimeout(() => setOpen(false), 150) }
  const cards = [
    { icon: 'Globe',     title: 'Fournisseurs Tunisie',        desc: "Vendez localement et à l'export", href: '/vendre/tunisie' },
    { icon: 'Globe2',    title: 'Fournisseurs internationaux', desc: 'Basés hors Tunisie',              href: '/vendre/international' },
    { icon: 'Handshake', title: 'Programme de partenariat',    desc: 'Devenez partenaire GROSHOP',      href: '/vendre/partenariat' },
  ]
  return (
    <div style={{ position: 'relative', height: '38px', display: 'flex', alignItems: 'center' }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <a href="/vendre" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 12px', height: '38px', textDecoration: 'none', whiteSpace: 'nowrap', fontSize: 'clamp(14px, 1.1vw, 16px)', fontWeight: open ? 600 : 400, color: open ? '#FF4500' : '#3D4853', borderBottom: open ? '2px solid #FF4500' : '2px solid transparent', transition: 'color 0.15s, border-color 0.15s' }}>Vendre sur GROSHOP</a>
      {open && (
        <div onMouseEnter={handleEnter} onMouseLeave={handleLeave} className="gh-dd"
          style={{ position: 'fixed', top: 'clamp(106px, 11vw, 126px)', left: 0, right: 0, background: '#fff', borderTop: '1px solid #E8EAED', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', zIndex: 2000, padding: '40px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
            <div style={{ fontSize: '13px', color: '#9AA3AE', marginBottom: '20px', fontWeight: 500 }}>Choisissez votre profil fournisseur</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {cards.map((card, i) => {
                const Icon = Icons[card.icon] || Icons.Store
                return (
                  <a key={i} href={card.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', border: '1px solid #E8EAED', borderRadius: '16px', textDecoration: 'none', textAlign: 'center', gap: '12px', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='#FF4500'; e.currentTarget.style.background='#FFF8F5'; e.currentTarget.style.transform='translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='#E8EAED'; e.currentTarget.style.background='#fff'; e.currentTarget.style.transform='none' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={28} color="#3D4853" strokeWidth={1.5} />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F1419' }}>{card.title}</div>
                    <div style={{ fontSize: '12px', color: '#9AA3AE' }}>{card.desc}</div>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NavLink({ label, href, bold }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={href} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'inline-flex', alignItems: 'center', padding: '0 12px', height: '38px', textDecoration: 'none', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: bold ? 600 : 400, color: hov ? '#FF4500' : '#3D4853', borderBottom: hov ? '2px solid #FF4500' : '2px solid transparent', transition: 'color 0.15s, border-color 0.15s' }}>
      {label}
    </a>
  )
}

function Divider() { return <div style={{ width: '1px', height: '22px', background: '#E8EAED', flexShrink: 0 }} /> }

const topLinkStyle = { display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#0F1419', fontSize: '13.5px', fontWeight: 400 }