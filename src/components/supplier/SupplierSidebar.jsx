// components/supplier/SupplierSidebar.jsx — GROSHOP.tn

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react'

// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-supplier-sidebar-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-supplier-sidebar-styles'
  s.textContent = `
    .gs-side {
      transition: width 0.22s ease;
    }

    .gs-side-toggle {
      width: 44px;
      height: 44px;
      border-radius: 11px;
      background: transparent;
      border: none;
      color: #FF4500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .gs-side-toggle:hover {
      background: #FFE5D6;
    }

    .gs-side-edge {
      position: absolute;
      right: -12px;
      top: 80px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      border: 1px solid #E5E7EB;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FF4500;
      z-index: 11;
      padding: 0;
      transition: background 0.15s, transform 0.15s;
    }
    .gs-side-edge:hover {
      background: #FFE5D6;
      transform: scale(1.08);
    }

    .gs-side-item {
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      color: #B0B3B8;
      text-decoration: none;
      transition: background 0.15s, color 0.15s, padding 0.22s, justify-content 0.22s;
      position: relative;
      cursor: pointer;
      gap: 12px;
    }
    .gs-side-item:hover:not(.active) {
      background: #FFF3EC;
      color: #6B7280;
    }
    .gs-side-item.active {
      background: linear-gradient(135deg, #FFB088 0%, #FF4500 100%);
      color: #fff;
      box-shadow: 0 8px 16px -4px rgba(255, 69, 0, 0.35);
    }
    .gs-side-item.active::before {
      content: '';
      position: absolute;
      left: -14px;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 24px;
      background: linear-gradient(180deg, #FFB088, #FF4500);
      border-radius: 0 3px 3px 0;
    }

    .gs-side-badge-dot {
      position: absolute;
      top: 5px;
      right: 5px;
      background: #EF4444;
      color: #fff;
      font-size: 9px;
      min-width: 14px;
      height: 14px;
      padding: 0 3px;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      line-height: 1;
      border: 2px solid #fff;
    }
    .gs-side-badge-pill {
      background: #EF4444;
      color: #fff;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 600;
      margin-left: auto;
    }
    .gs-side-item.active .gs-side-badge-pill {
      background: #fff;
      color: #FF4500;
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
  { icon: 'Settings',        label: 'Paramètres',      to: '/supplier/settings' },
]

const COLLAPSED_W = 72
const EXPANDED_W  = 240

export default function SupplierSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const toggle = () => setIsExpanded(prev => !prev)

  return (
    <aside
      className="gs-side"
      style={{
        width: isExpanded ? EXPANDED_W : COLLAPSED_W,
        height: '100vh',
        background: '#fff',
        borderRight: '1px solid #EFEDE6',
        padding: '20px 14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        flexShrink: 0,
        position: 'relative',
        fontFamily: '"DM Sans", -apple-system, sans-serif',
      }}
    >
      {/* Bouton flèche sur le bord droit (toggle) */}
      <button
        onClick={toggle}
        className="gs-side-edge"
        title={isExpanded ? 'Réduire' : 'Étendre'}
      >
        {isExpanded
          ? <Icons.ChevronLeft size={14} strokeWidth={2.5} />
          : <Icons.ChevronRight size={14} strokeWidth={2.5} />
        }
      </button>

      {/* Hamburger en haut (toggle) */}
      <button
        onClick={toggle}
        className="gs-side-toggle"
        title="Menu"
      >
        <Icons.Menu size={22} strokeWidth={2.2} />
      </button>

      <div style={{ height: 8 }} />

      {/* Menu items */}
      {MENU_ITEMS.map(item => {
        const Icon = Icons[item.icon] || Icons.Circle
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/supplier'}
            title={!isExpanded ? item.label : undefined}
            className={({ isActive }) => `gs-side-item ${isActive ? 'active' : ''}`}
            style={{
              justifyContent: isExpanded ? 'flex-start' : 'center',
              padding: isExpanded ? '0 14px' : 0,
            }}
          >
            <Icon size={20} strokeWidth={1.8} style={{ flexShrink: 0 }} />

            {isExpanded && (
              <span style={{
                fontSize: 13.5,
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}>
                {item.label}
              </span>
            )}

            {item.badge != null && (
              isExpanded
                ? <span className="gs-side-badge-pill">{item.badge}</span>
                : <span className="gs-side-badge-dot">{item.badge}</span>
            )}
          </NavLink>
        )
      })}
    </aside>
  )
}