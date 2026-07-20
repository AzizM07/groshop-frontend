// components/DashboardLayout.jsx — GROSHOP.tn
import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutGrid, MessageSquare, ClipboardList, Heart,
  Settings, Store, Truck, ChevronRight, Headphones,
  ShoppingCart, User,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { messaging } from '../lib/api'
import LOGO_SRC from '../assets/logo2.png'
import { useIsMobile } from '../hooks/useIsMobile'
import MobileBottomNav from './MobileBottomNav'

const ORANGE = '#FF4500'
const INK    = '#0F1419'
const MUTE   = '#6B7785'
const FAINT  = '#9AA3AE'
const LINE   = '#E8EAED'
const BG     = '#F4F5F7'
const FONT   = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const CSS = `
.gd-shell { display: flex; align-items: stretch; height: calc(100vh - 64px); }
.gd-rail { width: clamp(200px, 17vw, 280px); flex-shrink: 0; overflow-y: auto; height: 100%; background: ${BG}; }
.gd-main { flex: 1; min-width: 0; overflow-y: auto; height: 100%; display: flex; flex-direction: column; }
.gd-main > *:first-child { flex: 1; }
.gd-grid { display: grid; grid-template-columns: minmax(0,1fr) 360px; gap: 16px; align-items: start; }
@media (max-width: 1100px) { .gd-grid { grid-template-columns: minmax(0,1fr); } .gd-aside { grid-column: 1 / -1; } }
@media (max-width: 820px) {
  .gd-shell { display: block; height: auto; }
  .gd-rail { width: 100%; height: auto; }
  .gd-main { height: auto; }
  .gd-sidenav { display: flex; overflow-x: auto; gap: 4px; }
  .gd-sidenav-group { display: none; }
}
@keyframes gd-spin { to { transform: rotate(360deg) } }
@media (max-width: 720px) { .gd-tb-hide { display: none !important; } }`

const NAV = [
  { group: null, items: [
    { label: 'Tableau de bord', to: '/dashboard', icon: LayoutGrid, exact: true },
  ]},
  { group: 'Commerce en ligne', items: [
    { label: 'Messages',    to: '/dashboard/messages',   icon: MessageSquare },
    { label: 'Commandes',   to: '/dashboard/commandes',  icon: ClipboardList },
    { label: 'Favoris',     to: '/dashboard/favoris',    icon: Heart },
  ]},
  { group: 'Services complémentaires', items: [
    { label: 'Services logistiques', to: '/dashboard/logistique', icon: Truck },
    { label: 'Vendre sur GROSHOP',   to: '/vendre',               icon: Store },
  ]},
  { group: 'Paramètres', items: [
    { label: 'Paramètres du compte', to: '/dashboard/parametres', icon: Settings },
  ]},
]

function normalize(d) {
  if (Array.isArray(d)) return d
  return d?.results || d?.conversations || []
}

export default function DashboardLayout() {
  const isMobile = useIsMobile()
  const { user, loading: authLoading } = useAuth()
  const { count: cartCount = 0 } = useCart()
  const [convos, setConvos] = useState(null)

  useEffect(() => {
    if (!user || isMobile) return   // le badge topbar n'existe pas en mobile
    let alive = true
    messaging.conversations()
      .then(d => alive && setConvos(normalize(d)))
      .catch(() => alive && setConvos([]))
    return () => { alive = false }
  }, [user, isMobile])

  if (authLoading || !user) {
    return (
      <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{CSS}</style>
        <div style={{ width: 32, height: 32, border: `4px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gd-spin .8s linear infinite' }} />
      </div>
    )
  }

  // ── Coque mobile : plein écran + bottom nav, la page gère sa propre barre ──
  if (isMobile) {
    return (
      <div style={{ background: BG, minHeight: '100dvh', fontFamily: FONT, color: INK }}>
        <Outlet />
        <MobileBottomNav />
      </div>
    )
  }

  const unread = (convos || []).reduce((n, c) => n + (Number(c.unread_count) || 0), 0)

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: FONT, color: INK }}>
      <style>{CSS}</style>
      <DashboardTopbar unread={unread} cartCount={cartCount} />
      <div className="gd-shell">
        <aside className="gd-rail"><Sidebar /></aside>
        <div className="gd-main"><Outlet /></div>
      </div>
    </div>
  )
}

function DashboardTopbar({ unread = 0, cartCount = 0 }) {
  return (
    <div style={{ background: '#FFFFFF', borderBottom: `1px solid ${LINE}`, position: 'sticky', top: 0, zIndex: 1000, width: '100%', boxShadow: '0 1px 3px rgba(0,0,0,.04)', isolation: 'isolate' }}>
      <div style={{ padding: '0 clamp(20px, 3vw, 48px)', height: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img src={LOGO_SRC} alt="GROSHOP.tn" style={{ height: 'auto', maxHeight: 48, maxWidth: 170, objectFit: 'contain', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} />
        </Link>
        <div style={{ width: 1, height: 26, background: LINE, flexShrink: 0 }} />
        <span style={{ fontSize: 17, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>Mon compte</span>
        <div style={{ flex: 1 }} />
        <div className="gd-tb-hide" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: MUTE }}>Adresse de livraison :</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14.5, fontWeight: 700, color: INK, marginTop: 3 }}>
            <span style={{ fontSize: 16 }}>🇹🇳</span> TN
          </span>
        </div>
        <div className="gd-tb-hide" style={{ width: 1, height: 26, background: LINE, flexShrink: 0 }} />
        <Link to="/vendre" className="gd-tb-hide" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: INK, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>
          <Store size={20} strokeWidth={1.7} /> Vendre sur GROSHOP
        </Link>
        <div style={{ width: 1, height: 26, background: LINE, flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
          <TbIcon to="/dashboard/messages" title="Messages" badge={unread}><MessageSquare size={22} strokeWidth={1.7} /></TbIcon>
          <TbIcon to="/dashboard/commandes" title="Mes commandes"><ClipboardList size={22} strokeWidth={1.7} /></TbIcon>
          <TbIcon to="/panier" title="Panier" badge={cartCount}><ShoppingCart size={22} strokeWidth={1.7} /></TbIcon>
          <TbIcon to="/help/acheteurs" title="Assistance"><Headphones size={22} strokeWidth={1.7} /></TbIcon>
          <TbIcon to="/dashboard" title="Mon compte"><User size={22} strokeWidth={1.7} /></TbIcon>
        </div>
      </div>
    </div>
  )
}

function TbIcon({ to, title, badge = 0, children }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to} title={title} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: hov ? ORANGE : INK, textDecoration: 'none', transition: 'color .15s' }}>
      {children}
      {badge > 0 && (
        <span style={{ position: 'absolute', top: -5, right: -7, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, background: ORANGE, color: '#fff', fontSize: 10, fontWeight: 700, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', boxSizing: 'border-box' }}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )
}

function Sidebar() {
  const { pathname } = useLocation()
  return (
    <div style={{ padding: '4px 0' }}>
      <div className="gd-sidenav">
        {NAV.map((section, si) => (
          <div key={si}>
            {section.group && (
              <div className="gd-sidenav-group" style={{ fontSize: 11.5, fontWeight: 600, color: FAINT, padding: '18px 20px 8px', letterSpacing: '.2px' }}>{section.group}</div>
            )}
            {section.items.map(item => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to)
              const Icon = item.icon
              return (
                <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', textDecoration: 'none', background: active ? '#fff' : 'transparent', borderRadius: active ? '0 30px 30px 0' : 0, boxShadow: active ? '0 1px 4px rgba(0,0,0,.05)' : 'none', color: active ? INK : '#3D4853', fontSize: 14, fontWeight: active ? 800 : 500, whiteSpace: 'nowrap', position: 'relative' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = ORANGE }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#3D4853' }}>
                  {active && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 4, background: INK, borderRadius: '0 4px 4px 0' }} />}
                  <Icon size={18} strokeWidth={1.7} color={active ? INK : '#3D4853'} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {!item.exact && <ChevronRight size={15} color={FAINT} />}
                </Link>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}