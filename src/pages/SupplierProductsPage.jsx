// pages/SupplierProductsPage.jsx — GROSHOP.tn
// Aiguillage mobile/desktop, identique au pattern de SupplierDashboardPage.
//
// ⚠️ Renomme ton fichier actuel en DesktopSupplierProductsPage.jsx
// et remplace son export en `export default function DesktopSupplierProductsPage`.

import { useIsMobile } from '../hooks/useIsMobile'
import DesktopSupplierProductsPage from './DesktopSupplierProductsPage'
import MobileSupplierProducts from '../components/supplier/MobileSupplierProducts'

export default function SupplierProductsPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileSupplierProducts /> : <DesktopSupplierProductsPage />
}