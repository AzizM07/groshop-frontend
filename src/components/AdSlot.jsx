// AdSlot.jsx — GROSHOP.tn
// Wrapper GPT qui s'intègre dans la grille comme une ProductCard
// Test ID: /6355419/Travel/Europe (fonctionne sans compte GAM)
// Production: remplace AD_UNIT_PATH par ton network ID GAM

import { useEffect, useRef, useState } from 'react'

const AD_UNIT_PATH = '/6355419/Travel/Europe'  // ← test Google

export default function AdSlot({ index = 0 }) {
  const slotId = `groshop-ad-${index}`
  const [hov, setHov] = useState(false)
  const [status, setStatus] = useState('loading') // loading | loaded | empty

  useEffect(() => {
    const googletag = window.googletag
    if (!googletag?.cmd) return

    let slot = null
    let cancelled = false

    googletag.cmd.push(() => {
      if (cancelled) return

      slot = googletag.defineSlot(
        AD_UNIT_PATH,
        ['fluid', [300, 250], [336, 280]],
        slotId
      )

      if (!slot) return

      slot.addService(googletag.pubads())

      const listener = (e) => {
        if (e.slot === slot) {
          setStatus(e.isEmpty ? 'empty' : 'loaded')
        }
      }
      googletag.pubads().addEventListener('slotRenderEnded', listener)

      googletag.enableServices()
      googletag.display(slotId)
    })

    return () => {
      cancelled = true
      if (slot && window.googletag?.destroySlots) {
        window.googletag.cmd.push(() => {
          window.googletag.destroySlots([slot])
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  // ← une seule fois au montage, jamais re-déclenché

  // Don't take grid space if no ad served
  if (status === 'empty') return null

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid #E8EAED',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.13)' : '0 1px 4px rgba(0,0,0,0.06)',
        transform: hov ? 'translateY(-3px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}
    >
      {/* Conteneur GPT — React ne touche JAMAIS à l'intérieur de ce div
          une fois monté. Aucun contenu conditionnel React dedans. */}
      <div style={{ position: 'relative', minHeight: status === 'loaded' ? 'auto' : '280px' }}>
        <div id={slotId} style={{ width: '100%' }} />

        {/* Loader en OVERLAY, par-dessus, géré entièrement par React
            indépendamment du div GPT — aucun conflit possible */}
        {status === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ color: '#9AA3AE', fontSize: '12px' }}>
              Chargement...
            </span>
          </div>
        )}
      </div>

      {/* Badge Sponsorisé — même style que le footer des ProductCards */}
      <div style={{
        padding: '8px 11px',
        borderTop: '1px solid #E8EAED',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '11.5px',
        color: '#9AA3AE',
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="#9AA3AE" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Sponsorisé
      </div>
    </div>
  )
}