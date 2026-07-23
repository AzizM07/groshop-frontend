// components/supplier/SupplierMobileTopbar.jsx — GROSHOP.tn
// Topbar de toutes les pages fournisseur en version téléphone.
// Le titre de la page vit dans la page elle-même, pas ici.

import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import logoGroshop from '../../assets/logo2.png'

const ORANGE = '#ff5e20'
const MUTE   = '#6B7280'
const FONT   = '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

export default function SupplierMobileTopbar() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '14px 14px 16px',
      fontFamily: FONT,
      flexShrink: 0,
    }}>
      <Link to="/supplier" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
        <img src={logoGroshop} alt="GROSHOP"
          style={{ height: 26, width: 'auto', maxWidth: 120, objectFit: 'contain', objectPosition: 'left center', display: 'block' }}
          onError={e => { e.currentTarget.style.display = 'none' }} />
      </Link>

      <Link to="/supplier/messages" aria-label="Messages" style={iconBtn}>
        <Icons.MessageSquare size={16} color={MUTE} strokeWidth={2} />
      </Link>

      <Link to="/supplier/orders" aria-label="Notifications" style={{ ...iconBtn, position: 'relative' }}>
        <Icons.Bell size={16} color={MUTE} strokeWidth={2} />
        <span style={{ position: 'absolute', top: 6, right: 7, width: 6, height: 6, borderRadius: '50%', background: ORANGE }} />
      </Link>

      <Link to="/supplier/settings" aria-label="Profil" style={{
        width: 34, height: 34, borderRadius: '50%', background: ORANGE,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textDecoration: 'none', flexShrink: 0,
      }}>
        <Icons.User size={17} strokeWidth={2.2} />
      </Link>
    </div>
  )
}

const iconBtn = {
  width: 32, height: 32, borderRadius: '50%', background: '#fff',
  border: '1px solid #EFECE4',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0, textDecoration: 'none',
}