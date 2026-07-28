// src/components/MobileTrending.jsx
import { useState, useEffect, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const ORANGE = '#FF4500'
const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Compte à rebours cyclique sur 48h (se réinitialise tout seul)
function useCountdown48h() {
  const [rem, setRem] = useState(0)
  useEffect(() => {
    const cycle = 48 * 3600 * 1000
    const tick = () => setRem(cycle - (Date.now() % cycle))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])
  const s = Math.floor(rem / 1000)
  return [
    String(Math.floor(s / 3600)).padStart(2, '0'),
    String(Math.floor((s % 3600) / 60)).padStart(2, '0'),
    String(s % 60).padStart(2, '0'),
  ]
}

export default function MobileTrending({ products = [] }) {
  const navigate = useNavigate()
  const [active, setActive] = useState('Tout')
  const [hh, mm, ss] = useCountdown48h()

  if (!products.length) return null

  const categories = ['Tout', ...new Set(products.map(p => p.category).filter(Boolean))]
  const list = active === 'Tout' ? products : products.filter(p => p.category === active)

  return (
    <div style={{ fontFamily: FONT, padding: '4px 0' }}>

      {/* Header : titre + compte à rebours (chiffres colorés) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px 12px' }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#0F1419', letterSpacing: '-0.3px' }}>Tendances 48h</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: '#9AA3AE', fontWeight: 500 }}>Fin dans :</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontVariantNumeric: 'tabular-nums' }}>
          {[hh, mm, ss].map((v, i) => (
            <Fragment key={i}>
              {i > 0 && <span style={{ color: ORANGE, fontWeight: 700, fontSize: 13 }}>:</span>}
              <span style={{ color: ORANGE, fontSize: 13.5, fontWeight: 800, letterSpacing: '0.5px' }}>{v}</span>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Chips de filtres : active pleine (orange), inactives blanches bordées */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 12px 14px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {categories.map(cat => {
          const on = active === cat
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              style={{
                flexShrink: 0,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                fontSize: 13.5,
                fontWeight: on ? 700 : 600,
                color: on ? '#fff' : '#3D4853',
                background: on ? ORANGE : '#fff',
                border: on ? `1px solid ${ORANGE}` : '1px solid #E5E7EB',
                padding: '8px 18px',
                borderRadius: 24,
                boxShadow: on ? '0 4px 12px rgba(255,69,0,.28)' : 'none',
                transition: 'background .2s, color .2s, border-color .2s, box-shadow .2s',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Cartes en scroll horizontal */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 12px 4px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}>
        {list.map(p => (
          <div key={p.id} onClick={() => navigate(`/produit/${p.id}`)} style={{ flex: '0 0 148px', scrollSnapAlign: 'start', cursor: 'pointer' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: '#FAFAFB' }}>
              <img src={p.image} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.currentTarget.src = 'https://placehold.co/300x300/FAFAFB/9AA3AE?text=Produit' }} />
              {p.discount > 0 && (
                <span style={{ position: 'absolute', top: 8, left: 8, background: ORANGE, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 6px', borderRadius: 5 }}>-{p.discount}%</span>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: '#333', lineHeight: 1.3, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 3 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: ORANGE, letterSpacing: '-0.4px' }}>{fmt(p.newPrice)} <span style={{ fontSize: 10, fontWeight: 700 }}>TND</span></span>
              {p.discount > 0 && p.oldPrice > p.newPrice && (
                <span style={{ fontSize: 10.5, color: '#BBB', textDecoration: 'line-through' }}>{fmt(p.oldPrice)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}