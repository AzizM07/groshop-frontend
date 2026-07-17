// ProductCard.jsx — GROSHOP.tn
// Style B2B wholesale (Alibaba-like) :
// image plein cadre · prix · quantité min ·
// fournisseur · Verified + médailles + années + drapeau · bouton Commander.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const ORANGE = '#FF4500'
const INK    = '#0F1419'
const MUTE   = '#6B7785'
const FAINT  = '#9AA3AE'
const LINE   = '#E8EAED'
const BLUE   = '#1A6DD2'   // badge Verified (style Alibaba)
const GREEN  = '#0F9D58'

// Prix : accepte un nombre OU une fourchette [min, max]
function fmtPrice(p) {
  const f = n => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return Array.isArray(p) ? `${f(p[0])}–${f(p[1])}` : f(p)
}

export default function ProductCard({ product, onOrder }) {
  const [hov, setHov]   = useState(false)
  const [done, setDone] = useState(false)   // ✓ éphémère après ajout
  const navigate = useNavigate()
  const { add, adding } = useCart()

  const {
    id             = null,
    name           = 'Produit',
    price          = 0,        // number | [min, max]
    was            = null,
    discount       = null,
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
    flag           = '🇹🇳',
  } = product || {}

  const busy = adding === id

  /* ── Ajout au panier — quantité = MOQ (vente en gros) ── */
  async function handleClick(e) {
    e.stopPropagation()

    // onOrder custom prioritaire (permet de surcharger le comportement)
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
  const btnFilled = hov || done

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => id && navigate(`/produit/${id}`)}
      style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${hov ? '#FFD2C2' : LINE}`,
        cursor: 'pointer',
        transition: 'box-shadow .2s, transform .2s, border-color .2s',
        boxShadow: hov ? '0 10px 28px rgba(15,20,25,.12)' : '0 1px 4px rgba(15,20,25,.05)',
        transform: hov ? 'translateY(-3px)' : 'none',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'DM Sans', -apple-system, system-ui, sans-serif",
      }}
    >
      {/* ── IMAGE (plein cadre) ── */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: '#F7F8FA', overflow: 'hidden' }}>
        {image ? (
          <img
            src={image} alt={name}
            loading="lazy"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform .35s', transform: hov ? 'scale(1.05)' : 'scale(1)',
            }}
            onError={e => { e.target.src = 'https://placehold.co/300x300/F4F5F7/9AA3AE?text=GROSHOP' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C0C6CC', fontSize: '13px' }}>
            Pas d'image
          </div>
        )}

        {discount && (
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            background: ORANGE, color: '#fff', fontSize: '12px', fontWeight: 700, lineHeight: 1,
            padding: '5px 8px', borderRadius: '7px', boxShadow: '0 2px 8px rgba(255,69,0,.3)',
          }}>-{discount}%</div>
        )}

        <div style={{
          position: 'absolute', bottom: '12px', left: '12px',
          width: '32px', height: '32px', background: '#fff', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,.18)',
          opacity: hov ? 1 : 0, transform: hov ? 'translateY(0)' : 'translateY(4px)',
          transition: 'opacity .2s, transform .2s',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={MUTE} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* ── INFOS ── */}
      <div style={{ padding: '11px 12px 13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>

        {/* Nom */}
        <div style={{
          fontSize: '14.5px', color: INK, lineHeight: 1.32, fontWeight: 500,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', minHeight: '38px',
        }}>{name}</div>

        {/* Prix (fourchette ou unique) */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '21px', fontWeight: 700, color: INK, lineHeight: 1 }}>
            {fmtPrice(price)} <span style={{ fontSize: '13px', fontWeight: 600 }}>TND</span>
          </span>
          {was && (
            <span style={{ fontSize: '12px', color: FAINT, textDecoration: 'line-through' }}>
              {fmtPrice(was)} TND
            </span>
          )}
        </div>

        {/* Quantité min. (MOQ) */}
        {moq && (
          <div style={{ fontSize: '12.5px', color: MUTE }}>
            Quantité min. : <strong style={{ color: INK, fontWeight: 600 }}>{moq} {moqUnit}</strong>
          </div>
        )}

        {/* Note produit + ventes */}
        {(rating || soldCount) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '1px' }}>
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="14" height="14" viewBox="0 0 24 24"
                  fill={rating && s <= Math.round(rating) ? '#FFB800' : LINE}
                  stroke={rating && s <= Math.round(rating) ? '#FFB800' : LINE} strokeWidth="1">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            {rating && <span style={{ fontSize: '12px', color: MUTE, fontWeight: 600 }}>{rating.toFixed(1)}</span>}
            {soldCount != null && (
              <span style={{ fontSize: '12px', color: FAINT }}>
                · {soldCount >= 1000 ? (soldCount / 1000).toFixed(1) + 'k' : soldCount} vendus
              </span>
            )}
            {reviewCount != null && reviewCount > 0 && (
              <span style={{ fontSize: '12px', color: FAINT }}>
                ({reviewCount} avis)
              </span>
            )}
          </div>
        )}

        {/* Fournisseur (lien) */}
        {supplier && (
          <div style={{
            fontSize: '12.5px', color: MUTE, textDecoration: 'underline',
            textUnderlineOffset: '2px', textDecorationColor: '#D0D5DB',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{supplier}</div>
        )}

        {/* Verified · médailles (notation boutique) · années · drapeau */}
        {(verified || medals > 0 || years || flag) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', flexWrap: 'wrap' }}>
            {verified && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: BLUE, fontWeight: 700 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={BLUE} stroke="none">
                  <path d="M12 1l2.4 2.4 3.3-.5.6 3.3L21 9l-1.7 2.9 1.7 2.9-2.7 1.3-.6 3.3-3.3-.5L12 23l-2.4-2.4-3.3.5-.6-3.3L3 14.9 4.7 12 3 9.1l2.7-1.3.6-3.3 3.3.5z" />
                  <polyline points="8.5 12 11 14.5 15.5 9.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified
              </span>
            )}
            {medals > 0 && (
              <span style={{ display: 'flex', gap: '1px' }} title="Notation boutique">
                {Array.from({ length: medals }).map((_, i) => (
                  <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={ORANGE}>
                    <rect x="12" y="2" width="14" height="14" rx="2" transform="rotate(45 12 12)" />
                  </svg>
                ))}
              </span>
            )}
            {years && <span style={{ color: MUTE }}>{years} ans</span>}
            {flag && <span style={{ fontSize: '13px' }}>{flag}</span>}
          </div>
        )}

        {/* Tags */}
        {(isFreeShipping || isBestSeller) && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {isFreeShipping && <span style={{ fontSize: '11.5px', color: GREEN, fontWeight: 600 }}>✓ Livraison gratuite</span>}
            {isBestSeller && <span style={{ fontSize: '11.5px', color: ORANGE, fontWeight: 600 }}>🔥 Top ventes</span>}
          </div>
        )}

        {/* Bouton commander — branché sur le panier */}
        <button
          onClick={handleClick}
          disabled={busy}
          style={{
            marginTop: '5px', width: '100%', padding: '9px',
            background: done ? GREEN : (btnFilled ? ORANGE : '#fff'),
            color: btnFilled ? '#fff' : ORANGE,
            border: `1.5px solid ${done ? GREEN : ORANGE}`,
            borderRadius: '999px',
            fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600,
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