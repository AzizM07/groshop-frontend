// components/supplier/SupplierTopbar.jsx — GROSHOP.tn (allégé)
// Les actions (Plan Pro, Help, Bell, Avatar) sont passées dans SupplierBrandBar.
// Cette bar garde juste le titre route-aware au-dessus du contenu.

import { useLocation } from 'react-router-dom'

const ROUTE_INFO = {
  '/supplier':            { title: 'Vue d\'ensemble' },
  '/supplier/products':   { title: 'Mes produits' },
  '/supplier/orders':     { title: 'Commandes' },
  '/supplier/messages':   { title: 'Messages' },
  '/supplier/stats':      { title: 'Statistiques' },
  '/supplier/reviews':    { title: 'Avis clients' },
  '/supplier/promotions': { title: 'Promotions' },
  '/supplier/shop':       { title: 'Ma boutique' },
  '/supplier/settings':   { title: 'Paramètres' },
}

if (typeof document !== 'undefined' && !document.getElementById('gs-topbar-title-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-topbar-title-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,400&display=swap');
    .gs-topbar-title { font-family: 'Fraunces', Georgia, serif; font-weight: 700; letter-spacing: -0.02em; }
  `
  document.head.appendChild(s)
}

export default function SupplierTopbar() {
  const location = useLocation()
  const routeInfo = ROUTE_INFO[location.pathname] || { title: 'GROSHOP' }

  return (
    <header style={{
      padding: '20px 28px 16px',
      display: 'flex',
      alignItems: 'center',
      background: 'transparent',
      flexShrink: 0,
      fontFamily: '"DM Sans", -apple-system, sans-serif',
    }}>
      <h1 className="gs-topbar-title" style={{
        fontSize: 24,
        color: '#0F1419',
        margin: 0,
      }}>
        {routeInfo.title}
      </h1>
    </header>
  )
}