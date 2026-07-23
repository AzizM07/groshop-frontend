import { useIsMobile } from '../hooks/useIsMobile'
import DesktopSupplierMessagesPage from './DesktopSupplierMessagesPage'
import MobileSupplierMessages from '../components/supplier/MobileSupplierMessages'

export default function SupplierStatsPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileSupplierMessages /> : <DesktopSupplierMessagesPage />
}