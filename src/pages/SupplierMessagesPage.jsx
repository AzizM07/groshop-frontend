// pages/SupplierMessagesPage.jsx — GROSHOP.tn
// Aiguillage mobile/desktop, identique au pattern de SupplierDashboardPage.
//
// ⚠️ Renomme ton fichier actuel en DesktopSupplierMessagesPage.jsx
// et remplace son export en `export default function DesktopSupplierMessagesPage`.

import { useIsMobile } from '../hooks/useIsMobile'
import DesktopSupplierMessagesPage from './DesktopSupplierMessagesPage'
import MobileSupplierMessages from '../components/supplier/MobileSupplierMessages'

export default function SupplierMessagesPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileSupplierMessages /> : <DesktopSupplierMessagesPage />
}