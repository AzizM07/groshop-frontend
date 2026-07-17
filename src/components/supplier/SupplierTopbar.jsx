// components/supplier/SupplierTopbar.jsx — GROSHOP.tn
// Topbar espace fournisseur — câblé au backend (auth.me + auth.supplierMe).
// ⚠️ Si ton lib/api est ailleurs, corrige juste le chemin d'import ci-dessous.

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bell, MoreVertical } from 'lucide-react'
import { auth } from '../../lib/api'

const ORANGE = '#FF4500'

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

export default function SupplierTopbar({ pageTitle = 'Tableau de bord', notificationCount = 0 }) {
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

  /* ── Fermer le menu au clic extérieur ── */
  useEffect(() => {
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  /* ── Dérivés (ajuste les clés ici si tes endpoints diffèrent) ── */
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
    try { if (auth.logout) await auth.logout() } catch (_) {}
    window.location.href = '/login'
  }

  return (
    <div style={S.bar}>
      <h2 style={S.title}>{pageTitle}</h2>

      <div style={S.right}>
        {/* Notifications */}
        <button style={S.bell} className="stb-bell" aria-label="Notifications">
          <Bell size={20} strokeWidth={1.9} color="#3D4853" />
          {notificationCount > 0 && <span style={S.dot} />}
        </button>

        {/* Utilisateur / boutique */}
        <div style={S.userWrap}>
          {avatarUrl
            ? <img src={avatarUrl} alt={displayName} style={S.avatar} onError={(e) => { e.currentTarget.style.display = 'none' }} />
            : <span style={S.avatarFallback}>{getInitials(displayName)}</span>}
          <div style={{ lineHeight: 1.25, minWidth: 0 }}>
            <div style={S.name}>{loaded ? displayName : <span style={S.skelName} />}</div>
            {handle && <div style={S.handle}>{handle}</div>}
          </div>
        </div>

        {/* Menu kebab */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button style={S.kebab} className="stb-kebab" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            <MoreVertical size={20} strokeWidth={1.9} color="#6B7785" />
          </button>
          {menuOpen && (
            <div style={S.menu}>
              <Link to="/supplier/store" style={S.menuItem} className="stb-item" onClick={() => setMenuOpen(false)}>Ma boutique</Link>
              <Link to="/supplier/settings" style={S.menuItem} className="stb-item" onClick={() => setMenuOpen(false)}>Paramètres</Link>
              <div style={S.menuSep} />
              <button style={{ ...S.menuItem, color: '#D63A00', fontWeight: 600, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                className="stb-item" onClick={handleSignOut}>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .stb-bell:hover, .stb-kebab:hover { background: #F4F5F7 !important; }
        .stb-item:hover { background: #F7F6F3 !important; }
        @keyframes stb-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  )
}

const FONT = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif"

const S = {
  bar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px clamp(20px, 3vw, 40px)', background: 'transparent', fontFamily: FONT, gap: 16 },
  title: { fontSize: 22, fontWeight: 700, color: '#141414', margin: 0, letterSpacing: -0.3 },

  right: { display: 'flex', alignItems: 'center', gap: 16 },
  bell: { position: 'relative', width: 42, height: 42, borderRadius: '50%', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s' },
  dot: { position: 'absolute', top: 9, right: 10, width: 9, height: 9, borderRadius: '50%', background: '#FF3B30', border: '2px solid #fff' },

  userWrap: { display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 },
  avatar: { width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #fff', boxShadow: '0 0 0 1px #ececec' },
  avatarFallback: { width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: '#FFE9DF', color: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 },
  name: { fontSize: 14, fontWeight: 700, color: '#141414', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 },
  handle: { fontSize: 12, color: '#9aa3ae', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 },
  skelName: { display: 'inline-block', width: 110, height: 12, borderRadius: 4, background: '#eceef2', animation: 'stb-pulse 1.4s infinite' },

  kebab: { width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s' },
  menu: { position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#fff', border: '1px solid #ECEEF2', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.12)', minWidth: 190, padding: 6, zIndex: 2000 },
  menuItem: { display: 'block', padding: '10px 12px', fontSize: 13.5, color: '#3D4853', textDecoration: 'none', borderRadius: 8, fontFamily: FONT },
  menuSep: { height: 1, background: '#F0F0F0', margin: '5px 4px' },
}