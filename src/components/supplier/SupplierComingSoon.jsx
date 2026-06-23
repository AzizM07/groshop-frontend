// components/supplier/SupplierComingSoon.jsx — GROSHOP.tn

import * as Icons from 'lucide-react'

export default function SupplierComingSoon({
  title,
  message = 'On code cette page très bientôt.',
  icon = 'Hammer',
}) {
  const Icon = Icons[icon] || Icons.Hammer

  return (
    <div style={{
      padding: 60,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9AA3AE',
      minHeight: '60vh',
      gap: 14,
      fontFamily: '"DM Sans", -apple-system, sans-serif',
    }}>
      <div style={{
        width: 80, height: 80,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #FFE5D6, #FFB088)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        boxShadow: '0 8px 20px -8px rgba(255, 69, 0, 0.4)',
      }}>
        <Icon size={34} color="#FF4500" strokeWidth={1.8} />
      </div>
      <div style={{
        fontSize: 26,
        fontWeight: 700,
        color: '#0F1419',
        fontFamily: 'Fraunces, Georgia, serif',
        letterSpacing: '-0.02em',
      }}>
        {title}
      </div>
      <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 360 }}>
        {message}
      </div>
    </div>
  )
}