// src/components/supplier/SupplierMobileNav.jsx
import { Link, useLocation } from 'react-router-dom'
import * as Icons from 'lucide-react'

const ORANGE = '#ff5e20'
const IDLE   = '#9AA3AE'
const FONT   = '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

/* Cinq emplacements, celui du milieu est le bouton flottant.
   L'ordre correspond au layout SellRecord : deux onglets, le FAB, deux onglets. */
const TABS = [
  { key: 'dash',  icon: 'LayoutGrid', label: 'Dashboard',  to: '/supplier',            match: (p) => p === '/supplier' || p === '/supplier/' },
  { key: 'ord',   icon: 'ClipboardList', label: 'Commandes', to: '/supplier/orders',   match: (p) => p.startsWith('/supplier/orders') },
  { key: 'add',   fab: true, icon: 'Plus', label: 'Ajouter', to: '/supplier/products/new' },
  { key: 'prod',  icon: 'Package', label: 'Produits',       to: '/supplier/products',   match: (p) => p.startsWith('/supplier/products') && !p.endsWith('/new') },
  { key: 'stats', icon: 'BarChart3', label: 'Stats',        to: '/supplier/stats',      match: (p) => p.startsWith('/supplier/stats') },
]

export default function SupplierMobileNav() {
  const { pathname } = useLocation()

  return (
    <>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 900,
        background: '#fff',
        borderTop: '0.5px solid #EFECE4',
        boxShadow: '0 -2px 14px rgba(0,0,0,.05)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around',
        padding: '8px 4px calc(8px + env(safe-area-inset-bottom))',
        fontFamily: FONT,
      }}>
        {TABS.map(t => {
          const Icon = Icons[t.icon] || Icons.Circle

          /* Le FAB déborde vers le haut : marginTop négatif plutôt que
             position absolue, pour qu'il garde sa place dans le flex. */
          if (t.fab) {
            return (
              <Link key={t.key} to={t.to}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
                <span style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: ORANGE, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: -26,
                  boxShadow: `0 6px 18px rgba(255, 94, 32, .42)`,
                  border: '3px solid #fff',
                }}>
                  <Icon size={22} strokeWidth={2.6} />
                </span>
                <span style={{ fontSize: 9.5, fontWeight: 500, color: IDLE }}>{t.label}</span>
              </Link>
            )
          }

          const on = t.match?.(pathname)
          const color = on ? ORANGE : IDLE
          return (
            <Link key={t.key} to={t.to}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', paddingTop: 4 }}>
              <Icon size={20} color={color} strokeWidth={on ? 2.4 : 1.9} />
              <span style={{ fontSize: 9.5, fontWeight: on ? 700 : 500, color }}>{t.label}</span>
            </Link>
          )
        })}
      </nav>

      <div style={{ height: 'calc(66px + env(safe-area-inset-bottom))' }} aria-hidden="true" />
    </>
  )
}