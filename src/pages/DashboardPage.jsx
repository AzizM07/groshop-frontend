// pages/DashboardPage.jsx — GROSHOP.tn
// Tableau de bord acheteur : sidebar + résumé compte, commandes, favoris, historique.

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, MessageSquare, ClipboardList, CreditCard, Heart,
  Settings, Store, Truck, Package, ChevronRight, Headphones, Gift,
  ShoppingCart, User, MapPin,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { orders as ordersApi, messaging, store as storeApi } from '../lib/api'
import LOGO_SRC from '../assets/logo2.png'
import Footer from '../components/Footer'

const ORANGE = '#FF4500'
const INK    = '#0F1419'
const MUTE   = '#6B7785'
const FAINT  = '#9AA3AE'
const LINE   = '#E8EAED'
const SOFT   = '#FFF0E8'
const BG     = '#F4F5F7'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const asText = (v) => {
  if (v == null) return ''
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (typeof v === 'object') return v.content || v.text || v.name || v.title || ''
  return ''
}
const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return isNaN(date) ? '' : date.toLocaleDateString('fr-FR')
}

const CSS = `
/* Coque sous la topbar (64px) : sidebar fixe + zone droite scrollable */
.gd-shell {
  display: flex;
  align-items: stretch;
  height: calc(100vh - 64px);
}
.gd-rail {
  width: clamp(200px, 17vw, 280px);
  flex-shrink: 0;
  overflow-y: auto;
  height: 100%;
  background: ${BG};
}
.gd-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.gd-main > div:first-child { flex: 1; }   /* pousse le footer en bas si contenu court */

.gd-grid {
  display: grid;
  grid-template-columns: minmax(0,1fr) 360px;
  gap: 16px;
  align-items: start;
}
@media (max-width: 1100px) {
  .gd-grid { grid-template-columns: minmax(0,1fr); }
  .gd-aside { grid-column: 1 / -1; }
}
@media (max-width: 820px) {
  .gd-shell { display: block; height: auto; }
  .gd-rail { width: 100%; height: auto; }
  .gd-main { height: auto; }
  .gd-sidenav { display: flex; overflow-x: auto; gap: 4px; }
  .gd-sidenav-group { display: none; }
}
@keyframes gd-spin { to { transform: rotate(360deg) } }
@media (max-width: 720px) {
  .gd-tb-hide { display: none !important; }
}`

const NAV = [
  { group: null, items: [
    { label: 'Tableau de bord', to: '/dashboard', icon: LayoutGrid, exact: true },
  ]},
  { group: 'Commerce en ligne', items: [
    { label: 'Messages',    to: '/messages',              icon: MessageSquare },
    { label: 'Commandes',   to: '/dashboard/commandes',   icon: ClipboardList },
    { label: 'Paiement',    to: '/dashboard/paiement',    icon: CreditCard },
    { label: 'Favoris',     to: '/favoris',               icon: Heart },
  ]},
  { group: 'Services complémentaires', items: [
    { label: 'Services logistiques', to: '/dashboard/logistique', icon: Truck },
    { label: 'Vendre sur GROSHOP',   to: '/vendre',               icon: Store },
  ]},
  { group: 'Paramètres', items: [
    { label: 'Paramètres du compte', to: '/dashboard/parametres', icon: Settings },
  ]},
]

// ═══════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { count: cartCount = 0 } = useCart()
  const navigate = useNavigate()

  const [orders, setOrders]     = useState(null)
  const [convos, setConvos]     = useState(null)
  const [recent, setRecent]     = useState([])
  const [tab, setTab]           = useState('all')

  useEffect(() => {
    if (!user) return
    let alive = true

    ordersApi.list()
      .then(d => alive && setOrders(normalize(d)))
      .catch(() => alive && setOrders([]))

    messaging.conversations()
      .then(d => alive && setConvos(normalize(d)))
      .catch(() => alive && setConvos([]))

    storeApi.recentSearches()
      .then(d => alive && setRecent(d?.searches || []))
      .catch(() => {})

    return () => { alive = false }
  }, [user])

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  if (authLoading || !user) {
    return (
      <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{CSS}</style>
        <div style={{ width: 32, height: 32, border: `4px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gd-spin .8s linear infinite' }} />
      </div>
    )
  }

  const unread = (convos || []).reduce((n, c) => n + (Number(c.unread_count) || 0), 0)

  const TABS = [
    { id: 'all',      label: 'Toutes les commandes' },
    { id: 'pending',  label: 'À confirmer' },
    { id: 'paid',     label: 'Paiements en attente' },
    { id: 'shipping', label: 'Expéditions en attente' },
  ]

  const filtered = (orders || []).filter(o => {
    if (tab === 'all') return true
    const s = String(o.status || '').toLowerCase()
    if (tab === 'pending')  return s.includes('pending') || s.includes('attente')
    if (tab === 'paid')     return s.includes('paid') || s.includes('pay')
    if (tab === 'shipping') return s.includes('ship') || s.includes('expedi')
    return true
  })

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: FONT, color: INK }}>
      <style>{CSS}</style>

      <DashboardTopbar unread={unread} cartCount={cartCount} />

      {/* Sous la topbar : sidebar fixe à gauche + zone droite scrollable */}
      <div className="gd-shell">

        {/* ═══ SIDEBAR — fixe, ne scrolle pas avec la page ═══ */}
        <aside className="gd-rail">
          <Sidebar />
        </aside>

        {/* ═══ ZONE DROITE — contenu + footer, prend tout sauf la sidebar ═══ */}
        <div className="gd-main">
          <div style={{ padding: '16px clamp(16px, 2vw, 32px) 40px' }}>
            <div className="gd-grid">

              {/* COLONNE CENTRALE */}
              <div>
                {/* Carte profil */}
                <Card style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 22px 0' }}>
                    <Avatar user={user} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: INK }}>
                      {asText(user.full_name) || asText(user.email)?.split('@')[0]}
                    </span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, color: '#fff', background: ORANGE,
                      padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '.4px',
                    }}>
                      {user.role === 'supplier' ? 'Fournisseur' : 'Acheteur'}
                    </span>
                  </div>
                  <Link to="/dashboard/parametres" style={{
                    fontSize: 13, color: MUTE, textDecoration: 'underline', textUnderlineOffset: 3,
                    display: 'inline-block', marginTop: 4,
                  }}>
                    Profil
                  </Link>
                </div>
                <Link to="/help/acheteurs" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontSize: 13.5, fontWeight: 600, color: INK, textDecoration: 'underline',
                  textUnderlineOffset: 3, flexShrink: 0,
                }}>
                  <Headphones size={18} /> Assistance en ligne
                </Link>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', padding: '22px 22px 20px' }}>
                <Stat value={unread}        label="Messages non lus" to="/messages" />
                <StatDivider />
                <Stat value={(orders || []).length} label="Commandes"       to="/dashboard/commandes" />
                <StatDivider />
                <Stat value={cartCount}     label="Articles au panier" to="/panier" />
              </div>

              {/* Bandeau */}
              <div style={{ padding: '0 22px 20px' }}>
                <Link to="/dashboard/parametres" style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#FAFAFA', border: `1px solid ${LINE}`, borderRadius: 10,
                  padding: '14px 16px', textDecoration: 'none',
                }}>
                  <span style={{ fontSize: 13.5, color: INK, flex: 1 }}>
                    Complétez vos informations d'entreprise
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: MUTE }}>
                    Vérifier <ChevronRight size={15} />
                  </span>
                </Link>
              </div>
            </Card>

            {/* Carte commandes */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', padding: '20px 22px 14px' }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: INK }}>Commandes</h2>
                <div style={{ flex: 1 }} />
                <Link to="/dashboard/commandes" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 13.5, fontWeight: 600, color: MUTE, textDecoration: 'none',
                }}>
                  Afficher tout <ChevronRight size={15} />
                </Link>
              </div>

              <div style={{ display: 'flex', gap: 8, padding: '0 22px 16px', flexWrap: 'wrap' }}>
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    padding: '9px 18px', borderRadius: 30, cursor: 'pointer',
                    border: `1px solid ${tab === t.id ? INK : LINE}`,
                    background: '#fff', fontFamily: FONT,
                    fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                    color: tab === t.id ? INK : MUTE, whiteSpace: 'nowrap',
                  }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {orders === null && <Skeleton rows={2} />}

              {orders !== null && filtered.length === 0 && (
                <div style={{ padding: '30px 22px 44px', textAlign: 'center' }}>
                  <div style={{ fontSize: 54, marginBottom: 12 }}>📄</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: INK, marginBottom: 18 }}>
                    Vous n'avez aucune commande pour l'instant
                  </div>
                  <Link to="/" style={{
                    display: 'inline-block', padding: '12px 28px', borderRadius: 30,
                    border: `1px solid ${INK}`, color: INK, textDecoration: 'none',
                    fontSize: 13.5, fontWeight: 700,
                  }}>
                    Commencez à vous approvisionner
                  </Link>
                </div>
              )}

              {orders !== null && filtered.slice(0, 5).map(o => (
                <Link key={o.id} to={`/dashboard/commandes/${o.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 22px', borderTop: `1px solid #F2F3F5`, textDecoration: 'none',
                }}>
                  <div style={{ width: 52, height: 52, borderRadius: 8, background: '#F4F5F7', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {o.image_url
                      ? <img src={o.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Package size={20} color={FAINT} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>
                      {asText(o.reference) || `Commande #${o.id}`}
                    </div>
                    <div style={{ fontSize: 12, color: MUTE, marginTop: 3 }}>
                      {fmtDate(o.created_at)} · {o.items_count || 0} article{(o.items_count || 0) > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: ORANGE }}>{fmt(o.total_tnd)} TND</div>
                    {(o.status_display || o.status) && (
                      <span style={{
                        display: 'inline-block', marginTop: 4, fontSize: 10.5, fontWeight: 600,
                        color: MUTE, background: '#F4F5F7', padding: '2px 8px', borderRadius: 20,
                      }}>
                        {asText(o.status_display || o.status)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </Card>
          </div>

          {/* ═══ COLONNE DROITE ═══ */}
          <aside className="gd-aside">
            {/* Favoris */}
            <Card style={{ marginBottom: 16, padding: '20px 20px 22px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: INK }}>Favoris</h3>
              <div style={{
                background: '#FAFAFA', borderRadius: 10, padding: '30px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📦</div>
                <div style={{ fontSize: 13.5, color: MUTE, marginBottom: 6 }}>Aucun favori pour l'instant</div>
                <Link to="/" style={{ fontSize: 13, color: MUTE, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  Explorer des produits
                </Link>
              </div>
            </Card>

            {/* Historique de recherches */}
            <Card style={{ marginBottom: 16, padding: '20px 20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: INK, flex: 1 }}>Historique de recherches</h3>
                {recent.length > 0 && (
                  <Link to="/search" style={{ fontSize: 12.5, color: FAINT, textDecoration: 'none' }}>Afficher tout ›</Link>
                )}
              </div>
              {recent.length === 0 ? (
                <div style={{ fontSize: 13, color: FAINT, padding: '8px 0' }}>Aucune recherche récente</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {recent.slice(0, 8).map((s, i) => {
                    const text = asText(s)
                    return (
                      <Link key={i} to={`/search?q=${encodeURIComponent(text)}`} style={{
                        fontSize: 12.5, color: MUTE, background: '#F4F5F7',
                        padding: '7px 14px', borderRadius: 30, textDecoration: 'none',
                      }}>
                        {text}
                      </Link>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Promotion */}
            <Card style={{ padding: '20px 20px 22px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 800, color: INK }}>Promotion</h3>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: SOFT, borderRadius: 10, padding: '16px 18px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#B33000' }}>Parrainer un ami</div>
                  <div style={{ fontSize: 12, color: '#B33000', opacity: .8, marginTop: 3 }}>
                    Gagnez des réductions sur vos commandes
                  </div>
                </div>
                <Gift size={30} color={ORANGE} style={{ flexShrink: 0 }} />
              </div>
            </Card>
          </aside>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TOPBAR dédiée au tableau de bord (style « Mon compte »)
// ═══════════════════════════════════════════════════════════════════
function DashboardTopbar({ unread = 0, cartCount = 0 }) {
  return (
    <div style={{
      background: '#FFFFFF', borderBottom: `1px solid ${LINE}`,
      position: 'sticky', top: 0, zIndex: 1000, width: '100%',
      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      isolation: 'isolate',
    }}>
      <div style={{
        padding: '0 clamp(20px, 3vw, 48px)', height: 64,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        {/* Logo → accueil */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img src={LOGO_SRC} alt="GROSHOP.tn"
            style={{ height: 'auto', maxHeight: 48, maxWidth: 170, objectFit: 'contain', display: 'block' }}
            onError={e => { e.currentTarget.style.display = 'none' }} />
        </Link>

        {/* Séparateur + libellé */}
        <div style={{ width: 1, height: 26, background: LINE, flexShrink: 0 }} />
        <span style={{ fontSize: 17, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>Mon compte</span>

        <div style={{ flex: 1 }} />

        {/* Adresse de livraison */}
        <div className="gd-tb-hide" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: MUTE }}>Adresse de livraison :</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14.5, fontWeight: 700, color: INK, marginTop: 3 }}>
            <span style={{ fontSize: 16 }}>🇹🇳</span> TN
          </span>
        </div>

        <div className="gd-tb-hide" style={{ width: 1, height: 26, background: LINE, flexShrink: 0 }} />

        {/* Vendre sur GROSHOP */}
        <Link to="/vendre" className="gd-tb-hide" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 14, color: INK, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          <Store size={20} strokeWidth={1.7} /> Vendre sur GROSHOP
        </Link>

        <div style={{ width: 1, height: 26, background: LINE, flexShrink: 0 }} />

        {/* Icônes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
          <TbIcon to="/messages" title="Messages" badge={unread}>
            <MessageSquare size={22} strokeWidth={1.7} />
          </TbIcon>
          <TbIcon to="/dashboard/commandes" title="Mes commandes">
            <ClipboardList size={22} strokeWidth={1.7} />
          </TbIcon>
          <TbIcon to="/panier" title="Panier" badge={cartCount}>
            <ShoppingCart size={22} strokeWidth={1.7} />
          </TbIcon>
          <TbIcon to="/help/acheteurs" title="Assistance">
            <Headphones size={22} strokeWidth={1.7} />
          </TbIcon>
          <TbIcon to="/dashboard" title="Mon compte">
            <User size={22} strokeWidth={1.7} />
          </TbIcon>
        </div>
      </div>
    </div>
  )
}

function TbIcon({ to, title, badge = 0, children }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hov ? ORANGE : INK, textDecoration: 'none', transition: 'color .15s',
      }}>
      {children}
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: -5, right: -7,
          minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9,
          background: ORANGE, color: '#fff', fontSize: 10, fontWeight: 700, lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid #fff', boxSizing: 'border-box',
        }}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )
}

// ═══════════════════════════════════════════════════════════════════
function normalize(d) {
  if (Array.isArray(d)) return d
  return d?.results || d?.orders || d?.conversations || []
}

function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${LINE}`, ...style }}>
      {children}
    </div>
  )
}

function Avatar({ user }) {
  const initial = (asText(user.full_name) || asText(user.email) || '?')[0].toUpperCase()
  return (
    <div style={{
      width: 56, height: 56, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
      background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {user.avatar_url
        ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontSize: 22, fontWeight: 800, color: ORANGE }}>{initial}</span>}
    </div>
  )
}

function Stat({ value, label, to }) {
  return (
    <Link to={to} style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: INK, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: MUTE, marginTop: 7 }}>{label}</div>
    </Link>
  )
}

function StatDivider() {
  return <div style={{ width: 1, background: LINE, alignSelf: 'stretch' }} />
}

function Skeleton({ rows = 2 }) {
  return (
    <div style={{ padding: '8px 22px 20px' }}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0' }}>
          <div style={{ width: 52, height: 52, borderRadius: 8, background: '#F4F5F7', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 11, width: '35%', background: '#F4F5F7', borderRadius: 4, marginBottom: 9 }} />
            <div style={{ height: 11, width: '60%', background: '#F4F5F7', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────
function Sidebar() {
  const path = typeof window !== 'undefined' ? window.location.pathname : ''

  return (
    <div style={{ padding: '4px 0' }}>
      <div className="gd-sidenav">
        {NAV.map((section, si) => (
          <div key={si}>
            {section.group && (
              <div className="gd-sidenav-group" style={{
                fontSize: 11.5, fontWeight: 600, color: FAINT,
                padding: '18px 20px 8px', letterSpacing: '.2px',
              }}>
                {section.group}
              </div>
            )}
            {section.items.map(item => {
              const active = item.exact ? path === item.to : path.startsWith(item.to)
              const Icon = item.icon
              return (
                <Link key={item.to} to={item.to} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 20px', textDecoration: 'none',
                  // seul l'item actif a un fond blanc arrondi à droite
                  background: active ? '#fff' : 'transparent',
                  borderRadius: active ? '0 30px 30px 0' : 0,
                  boxShadow: active ? '0 1px 4px rgba(0,0,0,.05)' : 'none',
                  color: active ? INK : '#3D4853',
                  fontSize: 14, fontWeight: active ? 800 : 500,
                  whiteSpace: 'nowrap', position: 'relative',
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = ORANGE }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#3D4853' }}>
                  {active && <span style={{
                    position: 'absolute', left: 0, top: 8, bottom: 8, width: 4,
                    background: INK, borderRadius: '0 4px 4px 0',
                  }} />}
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