// src/components/MobileAdSlot.jsx
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

export default function MobileAdSlot() {
  return (
    <div style={{
      fontFamily: FONT, borderRadius: 10, overflow: 'hidden',
      background: 'linear-gradient(120deg, #1a1aff10, #FF458012)',
      border: '1px solid #EFF0F3',
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: '#9AA3AE', textTransform: 'uppercase', letterSpacing: '.5px', flexShrink: 0 }}>Pub</span>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#3D4853', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        Passez fournisseur sur GROSHOP — vendez en gros
      </span>
      <a href="/vendre" onClick={e => e.stopPropagation()} style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 700, color: '#fff', background: '#FF4500', padding: '6px 12px', borderRadius: 20, textDecoration: 'none' }}>Voir</a>
    </div>
  )
}