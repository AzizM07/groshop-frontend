// pages/SupplierOrdersPage.jsx — GROSHOP.tn
// Aiguillage mobile/desktop, identique au pattern de SupplierDashboardPage.
//
// ⚠️ Renomme ton fichier actuel en DesktopSupplierOrdersPage.jsx
// et remplace son export en `export default function DesktopSupplierOrdersPage`.

import { useIsMobile } from '../hooks/useIsMobile'
import DesktopSupplierOrdersPage from './DesktopSupplierOrdersPage'
import MobileSupplierOrders from '../components/supplier/MobileSupplierOrders'

export default function SupplierOrdersPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileSupplierOrders /> : <DesktopSupplierOrdersPage />
}