// src/components/MobileAdSlot.jsx
// Annonce GPT native, format carte produit (grille 2 colonnes mobile)
import { useEffect, useState } from 'react'

const AD_UNIT_PATH = '/6355419/Travel/Europe'  // ← test Google ; remplace par ton unit GAM
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

export default function MobileAdSlot({ index = 0 }) {
  const slotId = `groshop-ad-m-${index}`
  const [status, setStatus] = useState('loading') // loading | loaded | empty

  useEffect(() => {
    const googletag = window.googletag
    if (!googletag?.cmd) return

    let slot = null
    let cancelled = false

    googletag.cmd.push(() => {
      if (cancelled) return

      // Formats compacts adaptés à une demi-largeur d'écran
      slot = googletag.defineSlot(
        AD_UNIT_PATH,
        ['fluid', [180, 150], [168, 280], [120, 240]],
        slotId
      )
      if (!slot) return

      slot.addService(googletag.pubads())

      const listener = (e) => {
        if (e.slot === slot) setStatus(e.isEmpty ? 'empty' : 'loaded')
      }
      googletag.pubads().addEventListener('slotRenderEnded', listener)

      googletag.enableServices()
      googletag.display(slotId)
    })

    return () => {
      cancelled = true
      if (slot && window.googletag?.destroySlots) {
        window.googletag.cmd.push(() => window.googletag.destroySlots([slot]))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pas d'annonce servie → ne prend pas de place dans la grille
  if (status === 'empty') return null

  return (
    <div style={{
      fontFamily: FONT,
      background: '#fff',
      borderRadius: 8,
      overflow: 'hidden',
      border: '1px solid #EFF0F3',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    }}>
      {/* Conteneur GPT — React n'y touche jamais après montage */}
      <div style={{ position: 'relative', minHeight: status === 'loaded' ? 'auto' : 150 }}>
        <div id={slotId} style={{ width: '100%' }} />
        {status === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ color: '#9AA3AE', fontSize: 11 }}>Chargement…</span>
          </div>
        )}
      </div>

      {/* Badge Sponsorisé — compact, même esprit que la carte produit */}
      <div style={{ padding: '5px 8px', borderTop: '1px solid #F0F1F3', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#9AA3AE' }}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#9AA3AE" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Sponsorisé
      </div>
    </div>
  )
}