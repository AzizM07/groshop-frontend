export default function PasswordStrength({ password }) {
  if (!password) return null

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const levels = [
    { label: 'Très faible', color: '#ef4444', width: '20%' },
    { label: 'Faible',      color: '#f97316', width: '40%' },
    { label: 'Moyen',       color: '#eab308', width: '60%' },
    { label: 'Bon',         color: '#84cc16', width: '80%' },
    { label: 'Fort',        color: '#22c55e', width: '100%' },
  ]
  const level = levels[Math.min(score, 4)]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
      <div style={{
        flex: 1, height: 3, background: '#f3f4f6', borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: level.width,
          background: level.color, borderRadius: 2,
          transition: 'all 0.3s ease',
        }} />
      </div>
      <span style={{ fontSize: 10.5, color: level.color, fontWeight: 600, minWidth: 60, textAlign: 'right' }}>
        {level.label}
      </span>
    </div>
  )
}