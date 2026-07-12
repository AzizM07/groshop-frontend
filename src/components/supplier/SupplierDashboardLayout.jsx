// components/supplier/SupplierDashboardLayout.jsx — GROSHOP.tn

import { Outlet, useLocation } from 'react-router-dom'
import SupplierSidebar from './SupplierSidebar'
import SupplierTopbar from './SupplierTopbar'

// 🎨 Une seule couleur de fond partagée (sauf sidebar + cartes blanches)
export const PAGE_BG = '#FAFAFA'

// Routes "plein écran" : le <main> ne scrolle pas et n'a pas de padding.
// Chaque section de la page gère alors son propre scroll interne.
const FULLBLEED_ROUTES = ['/supplier/messages']

export default function SupplierDashboardLayout() {
  const { pathname } = useLocation()
  const isFullBleed = FULLBLEED_ROUTES.some(r => pathname.startsWith(r))

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: PAGE_BG,
    }}>
      {/* ═══════════ ROW : sidebar + contenu ═══════════ */}
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        background: PAGE_BG,
      }}>
        <SupplierSidebar />

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: PAGE_BG,
        }}>
          <SupplierTopbar />

          <main style={{
            flex: 1,
            // Plein écran (Messages) : pas de scroll page, pas de padding.
            // Autres pages : scroll vertical + padding habituel.
            overflowY: isFullBleed ? 'hidden' : 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            padding: isFullBleed ? 0 : '0 28px 28px',
            background: PAGE_BG,
          }}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}