// components/supplier/SupplierTopbar.jsx — GROSHOP.tn
// Header : titre de page à gauche · cloche + profil user + menu à droite.
// Background TRANSPARENT → hérite du background du layout parent.

import * as Icons from 'lucide-react'

// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-topbar-styles-v4')) {
  document.querySelectorAll('style[id^="gs-topbar"]').forEach(el => el.remove())
  const s = document.createElement('style')
  s.id = 'gs-topbar-styles-v4'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

    .gs-tb-iconbtn { transition: background 0.15s, transform 0.1s; }
    .gs-tb-iconbtn:hover { background: #F4F4F2 !important; }
    .gs-tb-iconbtn:active { transform: scale(0.95); }

    .gs-tb-user { transition: background 0.15s; }
    .gs-tb-user:hover { background: #F4F4F2 !important; }
  `
  document.head.appendChild(s)
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function SupplierTopbar({
  pageTitle = 'Messages',
  userName = 'Aziz Mehri',
  userHandle = '@aziz.groshop',
  // 🔗 Lien de l'image de profil — remplace par l'URL réelle de l'utilisateur.
  avatarUrl = 'https://i.pravatar.cc/100?img=12',
  notifCount = 3,
  onNotifClick = () => {},
  onUserClick = () => {},
  onMenuClick = () => {},
}) {
  return (
    <header style={{
      background: 'transparent', // ⭐ hérite du bg du layout parent
      padding: '18px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexShrink: 0,
      fontFamily: '"DM Sans", -apple-system, sans-serif',
    }}>

      {/* ═══════════ LEFT : Titre de page ═══════════ */}
      <h1 style={{
        margin: 0,
        fontSize: 22,
        fontWeight: 700,
        color: '#0F1419',
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
      }}>
        {pageTitle}
      </h1>

      {/* ═══════════ RIGHT : Cloche + Profil + Menu ═══════════ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        {/* Cloche + pastille */}
        <button
          onClick={onNotifClick}
          className="gs-tb-iconbtn"
          title="Notifications"
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: '50%',
            width: 40,
            height: 40,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: 0,
          }}
        >
          <Icons.Bell size={19} color="#0F1419" strokeWidth={1.8} />
          {notifCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 9, right: 10,
              width: 8, height: 8,
              borderRadius: '50%',
              background: '#FF4500',
              boxShadow: '0 0 0 2px #fff',
              pointerEvents: 'none',
            }} />
          )}
        </button>

        {/* Profil user : avatar photo + nom + handle */}
        <button
          onClick={onUserClick}
          className="gs-tb-user"
          title={userName}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'transparent',
            border: 'none',
            padding: '4px 6px',
            borderRadius: 12,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <img
            src={avatarUrl}
            alt={userName}
            style={{
              width: 40, height: 40,
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
              display: 'block',
              background: '#EAE7DF',
            }}
          />
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F1419', whiteSpace: 'nowrap' }}>
              {userName}
            </div>
            <div style={{ fontSize: 11.5, color: '#9AA3AE', fontWeight: 500, whiteSpace: 'nowrap', marginTop: 1 }}>
              {userHandle}
            </div>
          </div>
        </button>

        {/* Menu 3 points */}
        <button
          onClick={onMenuClick}
          className="gs-tb-iconbtn"
          title="Options"
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            color: '#6B7280',
          }}
        >
          <Icons.MoreVertical size={18} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  )
}