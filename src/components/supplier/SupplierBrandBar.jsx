// components/supplier/SupplierBrandBar.jsx — GROSHOP.tn
// Brand bar full-width au-dessus du layout dashboard.

import * as Icons from 'lucide-react'
import logoSrc from './../../assets/logo2.png' // ← ajuste si différent

// ── Inject styles (force fresh on every mount, gère HMR + versions) ─
const STYLE_ID = 'gs-brandbar-styles-v3'
if (typeof document !== 'undefined') {
  // Nettoie toutes anciennes versions
  document.querySelectorAll('style[id^="gs-brandbar-styles"]').forEach(el => {
    if (el.id !== STYLE_ID) el.remove()
  })
  if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style')
    s.id = STYLE_ID
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

      .gs-bb-iconbtn-hover:hover {
        background: rgba(255,255,255,0.12) !important;
        border-color: rgba(255,255,255,0.20) !important;
        color: #fff !important;
      }
      .gs-bb-pro-hover:hover {
        background: linear-gradient(135deg, rgba(252, 211, 77, 0.22), rgba(245, 158, 11, 0.12)) !important;
        border-color: rgba(252, 211, 77, 0.45) !important;
        box-shadow: 0 0 32px -4px rgba(252, 211, 77, 0.30) !important;
      }
      .gs-bb-avatar-hover:hover {
        transform: scale(1.06);
      }
    `
    document.head.appendChild(s)
  }
}

// ── PRESETS ────────────────────────────────────────────────────────
export const BRANDBAR_PRESETS = {
  navy:   { bg: '#0F1419', text: '#FFFFFF' },
  ink:    { bg: '#0A0E13', text: '#FFFFFF' },
  orange: { bg: '#FF4500', text: '#FFFFFF' },
  cream:  { bg: '#F4F1EA', text: '#0F1419' },
  white:  { bg: '#FFFFFF', text: '#0F1419' },
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function SupplierBrandBar({
  preset = 'navy',
  bgColor,
  textColor,
  userName = 'Supplier User',
  notifCount = 3,
}) {
  const p = BRANDBAR_PRESETS[preset]
  const bg = bgColor || p.bg
  const text = textColor || p.text
  const initials = userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <header
      style={{
        background: bg,
        color: text,
        width: '100%',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        flexShrink: 0,
        boxShadow: '0 1px 0 rgba(255,255,255,0.04)',
        fontFamily: '"DM Sans", -apple-system, sans-serif',
      }}
    >
      {/* ═══════════ LEFT: LOGO ═══════════ */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <img
          src={logoSrc}
          alt="GROSHOP.tn"
          style={{
            height: 36,
            width: 'auto',
            display: 'block',
            // Si ton logo est sombre sur fond sombre, décommente :
            // filter: 'brightness(0) invert(1)',
          }}
        />
      </div>

      {/* ═══════════ RIGHT: actions premium ═══════════ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>

        {/* Plan Pro — glass amber pill */}
        <button
          className="gs-bb-pro-hover"
          title="Plan Pro actif"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px 7px 10px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: '#FCD34D',
            background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.14), rgba(245, 158, 11, 0.06))',
            border: '1px solid rgba(252, 211, 77, 0.30)',
            boxShadow: '0 0 24px -4px rgba(252, 211, 77, 0.20)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
            lineHeight: 1,
          }}
        >
          <span style={{
            width: 18, height: 18,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FCD34D, #F59E0B)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(252, 211, 77, 0.55)',
            flexShrink: 0,
          }}>
            <Icons.Sparkles size={10} color="#451A03" strokeWidth={3} />
          </span>
          Plan Pro
        </button>

        {/* Help */}
        <button
          className="gs-bb-iconbtn-hover"
          title="Aide"
          style={iconBtnStyle}
        >
          <Icons.HelpCircle size={17} strokeWidth={1.8} />
        </button>

        {/* Bell with badge */}
        <button
          className="gs-bb-iconbtn-hover"
          title="Notifications"
          style={iconBtnStyle}
        >
          <Icons.Bell size={17} strokeWidth={1.8} />
          {notifCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 3, right: 3,
              minWidth: 17, height: 17,
              background: '#EF4444',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 999,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${bg}`,
              padding: '0 4px',
              boxShadow: '0 0 12px rgba(239, 68, 68, 0.55)',
              lineHeight: 1,
            }}>
              {notifCount}
            </span>
          )}
        </button>

        {/* Vertical divider */}
        <div style={{
          width: 1,
          height: 26,
          background: 'rgba(255,255,255,0.10)',
          margin: '0 4px',
        }} />

        {/* Avatar with online dot */}
        <div style={{ position: 'relative' }}>
          <button
            className="gs-bb-avatar-hover"
            title={userName}
            style={{
              background: 'linear-gradient(135deg, #FF8B5C 0%, #FF4500 100%)',
              color: '#fff',
              border: '2px solid rgba(255,255,255,0.14)',
              width: 38, height: 38,
              borderRadius: '50%',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 14px -2px rgba(255, 69, 0, 0.45)',
              transition: 'transform 0.18s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            {initials}
          </button>
          <span style={{
            position: 'absolute',
            bottom: 0, right: 0,
            width: 11, height: 11,
            background: '#22C55E',
            border: `2px solid ${bg}`,
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />
        </div>
      </div>
    </header>
  )
}

// ── Shared inline styles ───────────────────────────────────────────
const iconBtnStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '50%',
  width: 38, height: 38,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  transition: 'background 0.18s ease, border-color 0.18s ease, color 0.18s ease',
  color: 'rgba(255,255,255,0.80)',
  padding: 0,
}