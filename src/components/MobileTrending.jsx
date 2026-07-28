// src/components/MobileTrending.jsx
import { useState, useEffect, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'

// Même police que PopularCategoriesMobile, même orange que le desktop / la section catégories
const FONT   = '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const ORANGE = '#ff5e20'
const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Dimensions FIXES → cartes strictement identiques, quelle que soit l'image.
// Baisse CARD_W si tu veux des cartes encore plus petites.
const CARD_W = 145   // largeur carte (desktop = 220, réduit pour le mobile)
const NAME_H = 33    // hauteur réservée au nom : 2 lignes toujours

// ── DM Sans + scrollbars cachées, injecté une seule fois ────────
if (typeof document !== 'undefined' && !document.getElementById('mt-styles')) {
  const s = document.createElement('style')
  s.id = 'mt-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
    .mt-scroll { scrollbar-width: none; -ms-overflow-style: none; }
    .mt-scroll::-webkit-scrollbar { display: none; }
    .mt-card         { transition: transform .18s ease, box-shadow .18s ease; }
    .mt-card:active  { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(255,94,32,.14); }
  `
  document.head.appendChild(s)
}

// ── Étoiles (identique au desktop) ──────────────────────────────
function Stars({ value = 0, size = 11 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size} fill={s <= Math.round(value) ? '#FFB800' : '#E3E6EA'} stroke="none" />
      ))}
    </span>
  )
}

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

      {/* ══ Header : titre + compte à rebours ══ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px 10px' }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#0F1419', letterSpacing: '-.3px' }}>
          Tendances <span style={{ color: ORANGE }}>48h</span>
        </span>
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

      {/* ══ Onglets style desktop : texte souligné en MAJUSCULES (pas de bulles) ══ */}
      <div
        className="mt-scroll"
        style={{
          display: 'flex',
          gap: 20,
          overflowX: 'auto',
          padding: '10px 12px 0',
          borderTop: '1px solid #EDF0F2',
          WebkitOverflowScrolling: 'touch',
        }}
      >
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
                background: 'none',
                border: 'none',
                fontFamily: FONT,
                fontSize: 11.5,
                fontWeight: on ? 700 : 500,
                color: on ? ORANGE : '#9AA3AE',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '0 0 8px',
                borderBottom: on ? `2px solid ${ORANGE}` : '2px solid transparent',
                transition: 'color .2s, border-color .2s',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* ══ Cartes : port fidèle de la carte desktop, compactées pour le mobile ══ */}
      <div
        className="mt-scroll"
        style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '14px 12px 4px', WebkitOverflowScrolling: 'touch', scrollSnapType: 'x proximity', alignItems: 'stretch' }}
      >
        {list.map(p => (
          <div
            key={p.id}
            className="mt-card"
            onClick={() => navigate(`/produit/${p.id}`)}
            style={{
              flex: `0 0 ${CARD_W}px`,
              width: CARD_W,
              scrollSnapAlign: 'start',
              cursor: 'pointer',
              background: '#fff',
              border: '1px solid #EDF0F2',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,.04)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Vignette carrée forcée + badge "Tendance" (comme desktop) */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: '#FAFAFB', overflow: 'hidden' }}>
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.currentTarget.src = 'https://placehold.co/300x300/FAFAFB/9AA3AE?text=Produit' }}
              />
              <div style={{
                position: 'absolute', top: 8, left: 8,
                background: ORANGE, color: '#fff',
                padding: '3px 7px', borderRadius: 4,
                fontSize: 9, fontWeight: 700, letterSpacing: '.5px',
                textTransform: 'uppercase',
                display: 'inline-flex', alignItems: 'center', gap: 3, lineHeight: 1,
              }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                Tendance
              </div>
            </div>

            {/* Infos : nom (2 lignes fixes) + prix + note — toutes hauteurs fixes */}
            <div style={{ padding: '10px 10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>

              {/* Nom */}
              <div style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: '#0F1419',
                lineHeight: 1.3,
                letterSpacing: '-.1px',
                minHeight: NAME_H,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {p.name}
              </div>

              {/* Prix : neuf (sombre) + ancien barré + -X% en orange (comme desktop) */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#0F1419', letterSpacing: '-.3px' }}>
                  {fmt(p.newPrice)} <span style={{ fontSize: 10, fontWeight: 700 }}>TND</span>
                </span>
                {p.discount > 0 && p.oldPrice > p.newPrice && (
                  <>
                    <span style={{ fontSize: 10.5, color: '#9AA3AE', textDecoration: 'line-through' }}>{fmt(p.oldPrice)}</span>
                    <span style={{ fontSize: 10.5, color: ORANGE, fontWeight: 700 }}>-{p.discount}%</span>
                  </>
                )}
              </div>

              {/* Note : étoiles + valeur + nb d'avis (comme desktop) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <Stars value={p.rating} size={11} />
                <span style={{ fontSize: 10.5, color: '#6B7785', fontWeight: 600 }}>{Number(p.rating || 0).toFixed(1)}</span>
                <span style={{ fontSize: 10.5, color: '#9AA3AE' }}>
                  · {p.reviews >= 1000 ? (p.reviews / 1000).toFixed(1) + 'k' : p.reviews} avis
                </span>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}