// components/supplier/SupplierMobileTopbar.jsx — GROSHOP.tn
// Topbar mobile de l'espace fournisseur — câblée au backend comme le desktop
// (auth.me + auth.supplierMe). Avatar réel (image ou initiales), menu
// déroulant identité + navigation, déconnexion. Le titre de la page vit
// dans la page elle-même, pas ici.
// ⚠️ Si ton lib/api est ailleurs, corrige juste le chemin d'import ci-dessous.

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { auth } from '../../lib/api'
import logoGroshop from '../../assets/logo2.png'

const ORANGE = '#ff5e20'
const INK    = '#141414'
const MUTE   = '#6B7280'
const FAINT  = '#9AA3AE'
const LINE   = '#EFECE4'
const FONT   = '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

/* Renvoie la 1ʳᵉ valeur non vide parmi une liste de clés (gère l'imbrication "a.b"). */
function pick(obj, keys) {
  if (!obj) return null
  for (const key of keys) {
    const val = key.split('.').reduce((o, k) => (o == null ? o : o[k]), obj)
    if (val) return val
  }
  return null
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  const a = parts[0]?.[0] || ''
  const b = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (a + b).toUpperCase() || '?'
}

export default function SupplierMobileTopbar({ notificationCount = 0 }) {
  const [user, setUser] = useState(null)
  const [shop, setShop] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  /* ── Chargement user + boutique ── */
  useEffect(() => {
    let alive = true
    auth.me?.().then((d) => alive && setUser(d)).catch(() => {})
    auth.supplierMe?.().then((d) => alive && setShop(d)).catch(() => {})
    return () => { alive = false }
  }, [])

  /* ── Fermer le menu au tap extérieur (souris + tactile) ── */
  useEffect(() => {
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
    }
  }, [])

  /* ── Dérivés (mêmes clés que le desktop — ajuste ici si tes endpoints diffèrent) ── */
  const shopName = pick(shop, ['company_name', 'name', 'store.name'])
  const userName = pick(user, ['full_name', 'name']) ||
    [pick(user, ['first_name']), pick(user, ['last_name'])].filter(Boolean).join(' ') ||
    pick(user, ['username', 'email'])

  const displayName = shopName || userName || 'Fournisseur'
  const handle =
    pick(shop, ['slug']) ? `@${shop.slug}` :
    pick(user, ['username']) ? `@${user.username}` :
    pick(user, ['email']) || ''

  const avatarUrl = pick(user, ['avatar_url', 'avatar', 'photo_url', 'photo', 'image']) ||
    pick(shop, ['store.logo_url', 'logo_url'])

  const loaded = user || shop

  async function handleSignOut() {
    setMenuOpen(false)
    try { if (auth.logout) await auth.logout() } catch (_) {}
    window.location.href = '/login'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px 16px', fontFamily: FONT, flexShrink: 0 }}>
      {/* Logo */}
      <Link to="/supplier" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
        <img src={logoGroshop} alt="GROSHOP"
          style={{ height: 26, width: 'auto', maxWidth: 120, objectFit: 'contain', objectPosition: 'left center', display: 'block' }}
          onError={(e) => { e.currentTarget.style.display = 'none' }} />
      </Link>

      {/* Messages */}
      <Link to="/supplier/messages" aria-label="Messages" style={iconBtn}>
        <Icons.MessageSquare size={16} color={MUTE} strokeWidth={2} />
      </Link>

      {/* Notifications */}
      <Link to="/supplier/orders" aria-label="Notifications" style={{ ...iconBtn, position: 'relative' }}>
        <Icons.Bell size={16} color={MUTE} strokeWidth={2} />
        {notificationCount > 0 && (
          <span style={{ position: 'absolute', top: 5, right: 6, width: 6, height: 6, borderRadius: '50%', background: ORANGE, border: '1.5px solid #fff' }} />
        )}
      </Link>

      {/* Avatar + menu identité */}
      <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button onClick={() => setMenuOpen((o) => !o)} aria-label="Profil" aria-expanded={menuOpen}
          style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', display: 'block', borderRadius: '50%' }}>
          {loaded ? (
            avatarUrl
              ? <img src={avatarUrl} alt={displayName}
                     style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', display: 'block', boxShadow: '0 0 0 1px #ececec' }}
                     onError={(e) => { e.currentTarget.replaceWith(Object.assign(document.createElement('span'), { textContent: getInitials(displayName) })) }} />
              : <span style={avatarFallback}>{getInitials(displayName)}</span>
          ) : (
            <span style={{ ...avatarFallback, background: LINE, color: 'transparent', animation: 'smt-pulse 1.4s infinite' }} />
          )}
        </button>

        {menuOpen && (
          <div style={menu}>
            {/* En-tête identité (le nom/handle que le desktop affiche dans la barre) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 12px', borderBottom: `1px solid ${LINE}`, marginBottom: 6 }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : <span style={{ ...avatarFallback, width: 36, height: 36, fontSize: 14 }}>{getInitials(displayName)}</span>}
              <div style={{ minWidth: 0, lineHeight: 1.3 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {loaded ? displayName : '…'}
                </div>
                {handle && <div style={{ fontSize: 11.5, color: FAINT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{handle}</div>}
              </div>
            </div>

            <Link to="/supplier/store" style={menuItem} className="smt-item" onClick={() => setMenuOpen(false)}>
              <Icons.Store size={15} color={MUTE} strokeWidth={2} /> Ma boutique
            </Link>
            <Link to="/supplier/settings" style={menuItem} className="smt-item" onClick={() => setMenuOpen(false)}>
              <Icons.Settings size={15} color={MUTE} strokeWidth={2} /> Paramètres
            </Link>
            <div style={{ height: 1, background: LINE, margin: '6px 4px' }} />
            <button onClick={handleSignOut} className="smt-item"
              style={{ ...menuItem, color: '#D63A00', fontWeight: 600, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Icons.LogOut size={15} color="#D63A00" strokeWidth={2} /> Déconnexion
            </button>
          </div>
        )}
      </div>

      <style>{`
        .smt-item:hover { background: #F7F6F3 !important; }
        @keyframes smt-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────
const iconBtn = {
  width: 32, height: 32, borderRadius: '50%', background: '#fff', border: `1px solid ${LINE}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none',
}
const avatarFallback = {
  width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: ORANGE, color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13,
}
const menu = {
  position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#fff',
  border: `1px solid ${LINE}`, borderRadius: 14, boxShadow: '0 12px 30px rgba(0,0,0,0.14)',
  minWidth: 210, padding: 6, zIndex: 2000,
}
const menuItem = {
  display: 'flex', alignItems: 'center', gap: 9, padding: '10px 11px', fontSize: 13, color: '#3D4853',
  textDecoration: 'none', borderRadius: 9, fontFamily: FONT,
}