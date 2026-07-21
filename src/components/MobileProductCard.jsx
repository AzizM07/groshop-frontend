// src/components/MobileProductCard.jsx
import { useNavigate } from 'react-router-dom'

const INK='#1A1A1A', SUB='#333333', MUTE='#888888', FAINT='#999999', BLUE='#1A6DD2', GREEN='#0F9D58', ORANGE='#FF4500'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtPrice = (p) => Array.isArray(p) ? `${fmt(p[0])}–${fmt(p[1])}` : fmt(p)

const STAR = "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"

export default function MobileProductCard({ product }) {
  const navigate = useNavigate()
  const {
    id = null, name = 'Produit', price = 0,
    rating = null, soldCount = null, reviewCount = null,
    moq = null, moqUnit = 'pcs', image = null,
    isChoice = false, verified = false, isFreeShipping = false, isBestSeller = false,
  } = product || {}

  const soldTxt = soldCount > 0 ? (soldCount >= 1000 ? `${(soldCount / 1000).toFixed(1)}k` : `${soldCount}`) : null

  return (
    <div onClick={() => id && navigate(`/produit/${id}`)}
      style={{ cursor: 'pointer', fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>

      {/* Image carrée */}
      <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 8, overflow: 'hidden', background: '#F5F5F5' }}>
        {image
          ? <img src={image} alt={name} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.currentTarget.src = 'https://placehold.co/300x300/F4F5F7/9AA3AE?text=GROSHOP' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📦</div>}
      </div>

      <div style={{ padding: '6px 2px 0' }}>

        {/* Choice + nom — une ligne, ellipsis */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
          {isChoice && (
            <span style={{ flexShrink: 0, background: '#FFD000', color: '#2E2E2E', fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 3, lineHeight: 1 }}>Choice</span>
          )}
          <span style={{ fontSize: 14, fontWeight: 400, color: SUB, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        </div>

        {/* Prix compact */}
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: INK, letterSpacing: '-0.2px' }}>TND</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: '-0.8px', lineHeight: 1, marginLeft: 1 }}>{fmtPrice(price)}</span>
        </div>

        {/* Vendus | étoiles */}
        {(soldTxt || rating != null) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4, overflow: 'hidden' }}>
            {soldTxt && <span style={{ fontSize: 11, fontWeight: 500, color: MUTE, whiteSpace: 'nowrap' }}>{soldTxt} vendus</span>}
            {soldTxt && rating != null && <span style={{ fontSize: 11, color: '#DDD' }}>|</span>}
            {rating != null && (
              <>
                <span style={{ display: 'flex' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? '#FF8C00' : '#E0E0E0'} stroke="none">
                      <polygon points={STAR} />
                    </svg>
                  ))}
                </span>
                <span style={{ fontSize: 10, fontWeight: 500, color: MUTE }}>
                  {Number(rating).toFixed(1)}{reviewCount > 0 ? ` (${reviewCount})` : ''}
                </span>
              </>
            )}
          </div>
        )}

        {/* MOQ */}
        {moq && <div style={{ fontSize: 11, fontWeight: 600, color: FAINT, marginTop: 2 }}>MOQ. {moq} {moqUnit}</div>}

        {/* Verified / livraison / top ventes */}
        {(verified || isFreeShipping || isBestSeller) && (
          <div style={{ marginTop: 3 }}>
            {verified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={BLUE} stroke="none">
                  <path d="M12 1l2.4 2.4 3.3-.5.6 3.3L21 9l-1.7 2.9 1.7 2.9-2.7 1.3-.6 3.3-3.3-.5L12 23l-2.4-2.4-3.3.5-.6-3.3L3 14.9 4.7 12 3 9.1l2.7-1.3.6-3.3 3.3.5z"/>
                  <polyline points="8.5 12 11 14.5 15.5 9.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 10, fontWeight: 700, color: BLUE }}>Verified</span>
              </div>
            )}
            {(isFreeShipping || isBestSeller) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                {isFreeShipping && <span style={{ fontSize: 10, fontWeight: 600, color: GREEN }}>✓ Livraison gratuite</span>}
                {isBestSeller && <span style={{ fontSize: 10, fontWeight: 700, color: ORANGE }}>🔥 Top ventes</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}