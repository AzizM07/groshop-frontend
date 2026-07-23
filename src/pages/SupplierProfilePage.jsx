// pages/SupplierProfilePage.jsx — GROSHOP.tn
// ⚠️ Renomme ton fichier actuel en DesktopSupplierProfilePage.jsx
// et remplace son export en `export default function DesktopSupplierProfilePage`.

import { useIsMobile } from '../hooks/useIsMobile'
import DesktopSupplierProfilePage from './DesktopSupplierProfilePage'
import MobileSupplierProfile from '../components/supplier/MobileSupplierProfile'

export default function SupplierProfilePage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileSupplierProfile /> : <DesktopSupplierProfilePage />
}