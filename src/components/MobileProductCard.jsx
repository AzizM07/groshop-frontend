// MobileProductCard.jsx — GROSHOP.tn
// Port MOBILE de DesktopProductCard : mêmes infos, même style B2B (Alibaba-like),
// adapté au tactile (pas de :hover — feedback au :active). Pensé pour une grille
// 2 colonnes. Reçoit exactement le même objet `product` que la version desktop.

import { useState } from 'react'
import { Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const ORANGE = '#ff5e20'
const INK    = '#0F1419'
const MUTE   = '#6B7785'
const FAINT  = '#9AA3AE'
const BLUE   = '#1A6DD2'
const GREEN  = '#0F9D58'
const FONT   = "'DM Sans', -apple-system, system-ui, sans-serif"

// DM Sans + états tactiles (:active), injecté une seule fois
if (typeof document !== 'undefined' && !document.getElementById('mpc-styles')) {
  const s = document.createElement('style')
  s.id = 'mpc-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
    .mpc-card:active .mpc-img { transform: scale(1.03); }
    .mpc-order:active:not(:disabled) { background: ${ORANGE} !important; color: #fff !important; border-color: ${ORANGE} !important; }
  `
  document.head.appendChild(s)
}

// Prix : accepte un nombre OU une fourchette [min, max]
function fmtPrice(p) {
  const f = n => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return Array.isArray(p) ? `${f(p[0])}\u2013${f(p[1])}` : f(p)
}

// Étoiles (identiques au desktop)
function Stars({ value = 0, size = 13 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, flexShrink: 0 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size} fill={s <= Math.round(value) ? '#FFB800' : '#E3E6EA'} stroke="none" />
      ))}
    </span>
  )
}

export default function MobileProductCard({ product, onOrder }) {
  const [done, setDone] = useState(false)   // ✓ éphémère après ajout
  const navigate = useNavigate()
  const { add, adding } = useCart()

  const {
    id             = null,
    name           = 'Produit',
    price          = 0,        // number | [min, max]
    was            = null,
    rating         = null,
    soldCount      = null,
    reviewCount    = null,
    image          = null,
    isFreeShipping = false,
    isBestSeller   = false,
    moq            = null,
    moqUnit        = 'pcs',
    supplier       = null,
    verified       = false,
    medals         = 0,
    years          = null,
  } = product || {}

  const busy = adding === id

  /* Ajout au panier — quantité = MOQ (vente en gros) */
  async function handleClick(e) {
    e.stopPropagation()
    if (onOrder) return onOrder(product)
    if (!id || busy) return

    const res = await add(id, moq || 1)
    if (res?.ok) {
      setDone(true)
      setTimeout(() => setDone(false), 1600)
    } else if (res?.reason === 'error') {
      alert(res.message || "Impossible d'ajouter au panier.")
    }
    // reason === 'auth' → redirection déjà déclenchée par le contexte
  }

  const btnLabel = busy ? 'Ajout…' : done ? '✓ Ajouté' : 'Commander'

  return (
    <div
      className="mpc-card"
      onClick={() => id && navigate(`/produit/${id}`)}
      style={{
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        fontFamily: FONT,
        minWidth: 0,
      }}
    >
      {/* IMAGE (carrée, arrondie 4 coins — comme desktop) */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '1 / 1',
        background: '#F7F8FA', overflow: 'hidden', borderRadius: 8,
      }}>
        {image ? (
          <img
            className="mpc-img"
            src={image} alt={name} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .35s' }}
            onError={e => { e.target.src = 'https://placehold.co/300x300/F4F5F7/9AA3AE?text=GROSHOP' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C0C6CC', fontSize: 12 }}>
            Pas d'image
          </div>
        )}
      </div>

      {/* INFOS (compact) */}
      <div style={{ padding: '7px 1px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Nom — 2 lignes fixes */}
        <div style={{
          fontSize: 12.5, color: INK, lineHeight: 1.28, fontWeight: 400,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', minHeight: 32,
        }}>{name}</div>

        {/* Prix — grand, noir, gras (comme Alibaba) */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: INK, lineHeight: 1.15 }}>
            {fmtPrice(price)} <span style={{ fontSize: '0.65em', fontWeight: 600 }}>TND</span>
          </span>
          {was && (
            <span style={{ fontSize: 11, color: FAINT, textDecoration: 'line-through' }}>
              {fmtPrice(was)} TND
            </span>
          )}
        </div>

        {/* Étoiles + note + nb d'avis */}
        {rating != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Stars value={rating} size={13} />
            <span style={{ fontSize: 11, fontWeight: 600, color: INK, lineHeight: 1 }}>{rating.toFixed(1)}</span>
            {reviewCount != null && reviewCount > 0 && (
              <span style={{ fontSize: 10.5, color: MUTE, lineHeight: 1 }}>({reviewCount})</span>
            )}
          </div>
        )}

        {/* Quantité min. (MOQ) + vendus */}
        {moq && (
          <div style={{ fontSize: 11.5, color: INK }}>
            Quantité min. : {moq} {moqUnit}
            {soldCount != null && (
              <span style={{ color: MUTE }}> · {soldCount >= 1000 ? (soldCount / 1000).toFixed(1) + 'k' : soldCount} vendus</span>
            )}
          </div>
        )}
        {!moq && soldCount != null && (
          <div style={{ fontSize: 11.5, color: MUTE }}>
            {soldCount >= 1000 ? (soldCount / 1000).toFixed(1) + 'k' : soldCount} vendus
          </div>
        )}

        {/* Fournisseur + Verified · médailles · années */}
        {(supplier || verified || medals > 0 || years) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, flexWrap: 'wrap', rowGap: 2 }}>
            {supplier && (
              <span style={{
                color: MUTE, fontSize: 11.5,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: '55%', flexShrink: 1, minWidth: 0,
              }}>{supplier}</span>
            )}
            {verified && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: BLUE, fontWeight: 700, flexShrink: 0 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill={BLUE} stroke="none">
                  <path d="M12 1l2.4 2.4 3.3-.5.6 3.3L21 9l-1.7 2.9 1.7 2.9-2.7 1.3-.6 3.3-3.3-.5L12 23l-2.4-2.4-3.3.5-.6-3.3L3 14.9 4.7 12 3 9.1l2.7-1.3.6-3.3 3.3.5z" />
                  <polyline points="8.5 12 11 14.5 15.5 9.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified
              </span>
            )}
            {medals > 0 && (
              <span style={{ display: 'flex', gap: 1, flexShrink: 0 }} title="Notation boutique">
                {Array.from({ length: medals }).map((_, i) => (
                  <svg key={i} width="9" height="9" viewBox="0 0 24 24" fill={ORANGE}>
                    <rect x="12" y="2" width="14" height="14" rx="2" transform="rotate(45 12 12)" />
                  </svg>
                ))}
              </span>
            )}
            {years && <span style={{ color: MUTE, flexShrink: 0 }}>{years} ans</span>}
          </div>
        )}

        {/* Tags */}
        {(isFreeShipping || isBestSeller) && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {isFreeShipping && <span style={{ fontSize: 10.5, color: GREEN, fontWeight: 600 }}>✓ Livraison gratuite</span>}
            {isBestSeller && <span style={{ fontSize: 10.5, color: ORANGE, fontWeight: 600 }}>🔥 Top ventes</span>}
          </div>
        )}

        {/* Bouton commander — contour orange au repos, plein au tap (:active), vert quand ajouté */}
        <button
          onClick={handleClick}
          disabled={busy}
          className="mpc-order"
          style={{
            marginTop: 3, width: '100%', padding: '7px',
            background: done ? GREEN : '#fff',
            color: done ? '#fff' : ORANGE,
            border: `1.5px solid ${done ? GREEN : ORANGE}`,
            borderRadius: 999,
            fontFamily: FONT, fontSize: 12.5, fontWeight: 600,
            cursor: busy ? 'default' : 'pointer',
            opacity: busy ? 0.65 : 1,
            transition: 'background .18s, color .18s, border-color .18s',
          }}
        >
          {btnLabel}
        </button>
      </div>
    </div>
  )
}