// src/components/Layout.jsx
import Header from './Header'
import MobileBottomNav from './MobileBottomNav'
import { useIsMobile } from '../hooks/useIsMobile'

export default function Layout({ children }) {
  const isMobile = useIsMobile()
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F8FB 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    }}>
      <Header />
      <main>
        {children}
      </main>
      {isMobile && <MobileBottomNav />}
    </div>
  )
}