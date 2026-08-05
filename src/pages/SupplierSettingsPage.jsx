// pages/SupplierSettingsPage.jsx — wrapper responsive
import { useIsMobile } from '../hooks/useIsMobile'
import DesktopSupplierSettingsPage from './DesktopSupplierSettingsPage'
import MobileSupplierSettingsPage from '../components/supplier/MobileSupplierSettingsPage'

export default function SupplierSettingsPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileSupplierSettingsPage /> : <DesktopSupplierSettingsPage />
}