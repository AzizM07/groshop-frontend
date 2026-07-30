// Header.jsx — GROSHOP.tn — wrapper responsive
import { useIsMobile } from '../hooks/useIsMobile'
import DesktopHeader from './DesktopHeader'
import MobileHeader from './MobileHeader'

export default function Header() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileHeader /> : <DesktopHeader />
}