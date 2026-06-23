// components/supplier/SupplierDashboardLayout.jsx — GROSHOP.tn

import { Outlet } from 'react-router-dom'
import SupplierBrandBar from './SupplierBrandBar'
import SupplierSidebar from './SupplierSidebar'
import SupplierTopbar from './SupplierTopbar'

// 🎨 Une seule couleur de fond partagée (sauf sidebar + cartes blanches)
export const PAGE_BG = '#FAFAFA'

export default function SupplierDashboardLayout() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',  // ← colonne : brand bar au-dessus, row en dessous
      height: '100vh',
      overflow: 'hidden',
      background: PAGE_BG,
    }}>
      {/* ═══════════ BRAND BAR — full-width ═══════════ */}
      <SupplierBrandBar preset="navy" />

      {/* ═══════════ ROW : sidebar + contenu ═══════════ */}
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,        // ← essentiel pour que le scroll interne fonctionne
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
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            padding: '0 28px 28px',
            background: PAGE_BG,
          }}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}