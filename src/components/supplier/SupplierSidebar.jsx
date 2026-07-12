// components/supplier/SupplierSidebar.jsx — GROSHOP.tn (clair, orange unique #FF4500)

import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react'

import logoGroshop from '../../assets/logo2.png'

// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-supplier-sidebar-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-supplier-sidebar-styles'
  s.textContent = `
    .gs-side-item {
      height: 42px;
      display: flex;
      align-items: center;
      gap: 13px;
      padding: 0 4px;
      color: #9CA3AF;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      position: relative;
      transition: color 0.15s;
    }
    .gs-side-item:hover:not(.active) {
      color: #0F1419;
    }
    .gs-side-item.active {
      color: #ff5e00;
    }
    .gs-side-item.active::before {
      content: '';
      position: absolute;
      left: -20px;
      top: 7px;
      bottom: 7px;
      width: 3px;
      background: #ff5e00;
    }

    .gs-side-badge {
      margin-left: auto;
      background: #FFEEE6;
      color: #ff5e00;
      font-size: 10px;
      font-weight: 600;
      padding: 1px 7px;
      border-radius: 9px;
    }

    .gs-side-upgrade-btn {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
      border: none;
      padding: 8px 0;
      border-radius: 8px;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      font-family: inherit;
      transition: background 0.15s;
    }
    .gs-side-upgrade-btn:hover {
      background: rgba(255, 255, 255, 0.28);
    }
  `
  document.head.appendChild(s)
}

// ── Menu items ─────────────────────────────────────────────────────
const MENU_ITEMS = [
  { icon: 'LayoutDashboard', label: 'Tableau de bord', to: '/supplier' },
  { icon: 'Package',         label: 'Mes produits',    to: '/supplier/products' },
  { icon: 'ShoppingCart',    label: 'Commandes',       to: '/supplier/orders',   badge: 7 },
  { icon: 'MessageSquare',   label: 'Messages',        to: '/supplier/messages', badge: 3 },
  { icon: 'BarChart3',       label: 'Statistiques',    to: '/supplier/stats' },
  { icon: 'Star',            label: 'Avis',            to: '/supplier/reviews' },
  { icon: 'Tag',             label: 'Promotions',      to: '/supplier/promotions' },
  { icon: 'Store',           label: 'Ma boutique',     to: '/supplier/shop' },
]

/* ============================================================
   DIMENSIONS
   SIDEBAR_W       : largeur totale de la sidebar
   SIDEBAR_PAD_X   : padding latéral
   LOGO_W / LOGO_H : boîte du logo, verrouillée.

   Largeur utile = SIDEBAR_W - (2 × SIDEBAR_PAD_X) = 200px ici.
   LOGO_W ne doit JAMAIS dépasser cette valeur, sinon le logo
   est rogné par le bord de la sidebar.
   Pour un logo plus grand : augmente SIDEBAR_W puis LOGO_W.
   ============================================================ */
const SIDEBAR_W     = 240
const SIDEBAR_PAD_X = 20
const LOGO_W        = 200
const LOGO_H        = 52

export default function SupplierSidebar() {
  return (
    <aside
      style={{
        width: SIDEBAR_W,
        height: '100vh',
        background: '#fff',
        borderRight: '1px solid #EFEDE6',
        padding: `24px ${SIDEBAR_PAD_X}px 20px`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        fontFamily: '"DM Sans", -apple-system, sans-serif',
      }}
    >
      {/* ── Logo (boîte verrouillée) ── */}
      <div
        style={{
          width: LOGO_W,
          height: LOGO_H,
          minWidth: LOGO_W,
          minHeight: LOGO_H,
          maxWidth: LOGO_W,
          maxHeight: LOGO_H,
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginBottom: 26,
        }}
      >
        <img
          src={logoGroshop}
          alt="GROSHOP"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'left center',
            display: 'block',
          }}
        />
      </div>

      {/* ── Menu items ── */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {MENU_ITEMS.map(item => {
          const Icon = Icons[item.icon] || Icons.Circle
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/supplier'}
              className={({ isActive }) => `gs-side-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.label}
              </span>
              {item.badge != null && (
                <span className="gs-side-badge">{item.badge}</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* ── Paramètres ── */}
      <NavLink
        to="/supplier/settings"
        className={({ isActive }) => `gs-side-item ${isActive ? 'active' : ''}`}
        style={{ marginBottom: 14 }}
      >
        <Icons.Settings size={18} strokeWidth={1.8} />
        <span>Paramètres</span>
      </NavLink>

      {/* ── Carte "Passer à Pro" ── */}
      <div style={{
        background: '#ff5e00',
        borderRadius: 14,
        padding: '14px',
      }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
          Passer à Pro
        </div>
        <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4, marginBottom: 11 }}>
          Débloque des statistiques avancées et des insights IA
        </div>
        <button className="gs-side-upgrade-btn">Mettre à niveau</button>
      </div>
    </aside>
  )
}