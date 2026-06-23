import { useState } from 'react'
import { C } from './constants'

export default function SimpleInput({ type = 'text', value, onChange, placeholder, rightSlot, prefix, height = 46 }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: `1px solid ${focused ? C.primary : '#d1d5db'}`,
      borderRadius: 9,
      background: '#fff',
      boxShadow: focused ? `0 0 0 3px rgba(255,107,53,0.10)` : 'none',
      transition: 'all 0.15s ease',
      paddingLeft: prefix ? 0 : 14,
      paddingRight: rightSlot ? 6 : 14,
      height,
    }}>
      {prefix && (
        <span style={{
          paddingLeft: 12, paddingRight: 8, marginRight: 6,
          borderRight: '1px solid #e5e7eb',
          color: '#6b7280', fontSize: 13, fontWeight: 600,
          height: '60%', display: 'flex', alignItems: 'center',
        }}>{prefix}</span>
      )}
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, border: 'none', background: 'transparent',
          outline: 'none', fontSize: 14, color: '#111827',
          fontWeight: 500,
        }}
      />
      {rightSlot}
    </div>
  )
}