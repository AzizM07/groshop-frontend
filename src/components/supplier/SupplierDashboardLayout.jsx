// components/supplier/SupplierDashboardLayout.jsx — GROSHOP.tn

import { Outlet, useLocation } from 'react-router-dom'
import SupplierSidebar from './SupplierSidebar'
import SupplierTopbar from './SupplierTopbar'
import SupplierMobileTopbar from './SupplierMobileTopbar'
import SupplierMobileNav from './SupplierMobileNav'
import { useIsMobile } from '../../hooks/useIsMobile'

// 🎨 Une seule couleur de fond partagée (sauf sidebar + cartes blanches)
export const PAGE_BG = '#FAFAFA'

// Routes "plein écran" : le <main> ne scrolle pas et n'a pas de padding.
// Chaque section de la page gère alors son propre scroll interne.
const FULLBLEED_ROUTES = ['/supplier/messages']

export default function SupplierDashboardLayout() {
  const { pathname } = useLocation()
  const isMobile = useIsMobile()
  const isFullBleed = FULLBLEED_ROUTES.some(r => pathname.startsWith(r))

  /* ═══════════ MOBILE ═══════════
     Pas de hauteur figée ni de scroll interne : sur téléphone, le scroll
     du document laisse la barre d'adresse du navigateur se replier, ce
     qu'un conteneur en overflow:auto empêche. La nav basse est fixed et
     réserve sa place via son propre spacer. */
  if (isMobile) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: PAGE_BG,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <SupplierMobileTopbar />

        <main style={{
          flex: 1,
          minWidth: 0,
          padding: isFullBleed ? 0 : '0 14px 14px',
          boxSizing: 'border-box',
        }}>
          <Outlet />
        </main>

        <SupplierMobileNav />
      </div>
    )
  }

  /* ═══════════ DESKTOP ═══════════ */
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