// src/components/MobileBottomNav.jsx
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'  // ⚠️ ajuste si ton hook s'appelle autrement

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const ACTIVE = '#FF4500'
const IDLE   = '#6B7785'

const Icon = {
  home: (c) => <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5 12 3l9 6.5"/><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/></svg>,
  cat:  (c) => <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  msg:  (c) => <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.6A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>,
  cart: (c) => <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>,
  user: (c) => <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
}

export default function MobileBottomNav() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const cart = useCart()
  const cartCount = cart?.items?.length ?? cart?.count ?? 0   // ⚠️ adapte à l'API de ton CartContext

  const tabs = [
    { key: 'home', icon: 'home', label: 'Accueil',    to: '/',                                match: (p) => p === '/' },
    { key: 'cat',  icon: 'cat',  label: 'Catégories', to: '/categories',                      match: (p) => p.startsWith('/categories') },
    { key: 'msg',  icon: 'msg',  label: 'Messages',   to: user ? '/dashboard/messages' : '/login', match: (p) => p.includes('/messages') },
    { key: 'cart', icon: 'cart', label: 'Panier',     to: '/panier',                          match: (p) => p === '/panier', badge: cartCount },
    { key: 'acc',  icon: 'user', label: user ? 'Compte' : 'Connexion', to: user ? '/dashboard' : '/login', match: (p) => p.startsWith('/dashboard') },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
        background: '#fff', borderTop: '0.5px solid #E8EAED',
        display: 'flex', alignItems: 'stretch', justifyContent: 'space-around',
        paddingBottom: 'env(safe-area-inset-bottom)', fontFamily: FONT,
      }}>
        {tabs.map(t => {
          const on = t.match(pathname)
          const color = on ? ACTIVE : IDLE
          return (
            <Link key={t.key} to={t.to}
              style={{ flex: 1, height: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, textDecoration: 'none', position: 'relative' }}>
              <span style={{ position: 'relative', display: 'flex' }}>
                {Icon[t.icon](color)}
                {t.badge > 0 && (
                  <span style={{ position: 'absolute', top: -5, right: -8, minWidth: 16, height: 16, padding: '0 4px', boxSizing: 'border-box', background: '#FF4500', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {t.badge > 99 ? '99+' : t.badge}
                  </span>
                )}
              </span>
              <span style={{ fontSize: 10, fontWeight: on ? 700 : 500, color }}>{t.label}</span>
            </Link>
          )
        })}
      </nav>

      <div style={{ height: 'calc(56px + env(safe-area-inset-bottom))' }} aria-hidden="true" />
    </>
  )
}