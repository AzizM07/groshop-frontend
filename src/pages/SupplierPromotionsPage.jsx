// pages/SupplierReviewsPage.jsx — GROSHOP.tn
// ⚠️ Renomme ton fichier actuel en DesktopSupplierReviewsPage.jsx
// et remplace son export en `export default function DesktopSupplierReviewsPage`.

import { useIsMobile } from '../hooks/useIsMobile'
import DesktopSupplierReviewsPage from './DesktopSupplierReviewsPage'
import MobileSupplierReviews from '../components/supplier/MobileSupplierReviews'

export default function SupplierReviewsPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileSupplierReviews /> : <DesktopSupplierReviewsPage />
}