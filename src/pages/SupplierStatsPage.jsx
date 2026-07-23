// pages/SupplierStatsPage.jsx — GROSHOP.tn
// ⚠️ Renomme ton fichier actuel en DesktopSupplierStatsPage.jsx
// et remplace son export en `export default function DesktopSupplierStatsPage`.

import { useIsMobile } from '../hooks/useIsMobile'
import DesktopSupplierStatsPage from './DesktopSupplierStatsPage'
import MobileSupplierStats from '../components/supplier/MobileSupplierStats'

export default function SupplierStatsPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileSupplierStats /> : <DesktopSupplierStatsPage />
}