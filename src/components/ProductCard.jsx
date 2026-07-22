// ProductCard.jsx — GROSHOP.tn
// Style B2B wholesale (Alibaba-like) :
// image plein cadre arrondie · prix simple · quantité min ·
// fournisseur · Verified + médailles + années + drapeau · bouton Commander.
// Card "invisible" : pas de bordure, pas d'ombre, pas de bg différent de la page.
// Compact : pensée pour 6 colonnes par ligne en desktop.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useIsMobile } from '../hooks/useIsMobile'
import MobileProductCard from './MobileProductCard'
const ORANGE = '#ff5e20'
const INK    = '#0F1419'
const MUTE   = '#6B7785'
const FAINT  = '#9AA3AE'
const BLUE   = '#1A6DD2'   // badge Verified (style Alibaba)
const GREEN  = '#0F9D58'

// Prix : accepte un nombre OU une fourchette [min, max]
function fmtPrice(p) {
  const f = n => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return Array.isArray(p) ? `${f(p[0])}–${f(p[1])}` : f(p)
}

function DesktopProductCard({ product, onOrder }) {
  const [hov, setHov]   = useState(false)
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
        // Pas de bg, pas de bordure, pas d'ombre : la card se fond dans la page
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'DM Sans', -apple-system, system-ui, sans-serif",
        minWidth: 0, // évite l'overflow dans une grille étroite
      }}
    >
      {/* ── IMAGE (arrondie sur les 4 coins, comme Alibaba) — pas de badge de réduction ── */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '1 / 1',
        background: '#F7F8FA', overflow: 'hidden',
        borderRadius: '8px',
      }}>
        {image ? (
          <img
            src={image} alt={name}
            loading="lazy"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform .35s', transform: hov ? 'scale(1.04)' : 'scale(1)',
            }}
            onError={e => { e.target.src = 'https://placehold.co/300x300/F4F5F7/9AA3AE?text=GROSHOP' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C0C6CC', fontSize: '12px' }}>
            Pas d'image
          </div>
        )}

        <div style={{
          position: 'absolute', bottom: '6px', left: '6px',
          width: '24px', height: '24px', background: '#fff', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 6px rgba(0,0,0,.18)',
          opacity: hov ? 1 : 0, transform: hov ? 'translateY(0)' : 'translateY(4px)',
          transition: 'opacity .2s, transform .2s',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={MUTE} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* ── INFOS (compact) ── */}
      <div style={{ padding: '7px 1px 0', display: 'flex', flexDirection: 'column', gap: '3px' }}>

        {/* Nom */}
        <div style={{
          fontSize: 'clamp(11.5px, 1vw, 13px)', color: INK, lineHeight: 1.28, fontWeight: 400,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', minHeight: '32px',
        }}>{name}</div>

        {/* Prix — grand, noir, gras (comme Alibaba) */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'clamp(14px, 1.3vw, 18px)', fontWeight: 700, color: INK, lineHeight: 1.15 }}>
            {fmtPrice(price)} <span style={{ fontSize: '0.65em', fontWeight: 600 }}>TND</span>
          </span>
          {was && (
            <span style={{ fontSize: '11px', color: FAINT, textDecoration: 'line-through' }}>
              {fmtPrice(was)} TND
            </span>
          )}
        </div>

        {/* Quantité min. (MOQ) — en noir */}
        {moq && (
          <div style={{ fontSize: '11.5px', color: INK }}>
            Quantité min. : {moq} {moqUnit}
            {soldCount != null && (
              <span style={{ color: MUTE }}> · {soldCount >= 1000 ? (soldCount / 1000).toFixed(1) + 'k' : soldCount} vendus</span>
            )}
          </div>
        )}

        {/* Note produit (sans MOQ affiché) */}
        {!moq && (rating || soldCount) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', fontSize: '11.5px', color: MUTE }}>
            {rating && <span style={{ fontWeight: 600, color: INK }}>★ {rating.toFixed(1)}</span>}
            {soldCount != null && (
              <span>{soldCount >= 1000 ? (soldCount / 1000).toFixed(1) + 'k' : soldCount} vendus</span>
            )}
            {reviewCount != null && reviewCount > 0 && <span>({reviewCount} avis)</span>}
          </div>
        )}

        {/* Fournisseur (lien) */}
        {supplier && (
          <div style={{
            fontSize: '11.5px', color: MUTE,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{supplier}</div>
        )}

        {/* Verified · médailles (notation boutique) · années · drapeau */}
        {(verified || medals > 0 || years || flag) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', flexWrap: 'wrap' }}>
            {verified && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: BLUE, fontWeight: 700 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill={BLUE} stroke="none">
                  <path d="M12 1l2.4 2.4 3.3-.5.6 3.3L21 9l-1.7 2.9 1.7 2.9-2.7 1.3-.6 3.3-3.3-.5L12 23l-2.4-2.4-3.3.5-.6-3.3L3 14.9 4.7 12 3 9.1l2.7-1.3.6-3.3 3.3.5z" />
                  <polyline points="8.5 12 11 14.5 15.5 9.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified
              </span>
            )}
            {medals > 0 && (
              <span style={{ display: 'flex', gap: '1px' }} title="Notation boutique">
                {Array.from({ length: medals }).map((_, i) => (
                  <svg key={i} width="9" height="9" viewBox="0 0 24 24" fill={ORANGE}>
                    <rect x="12" y="2" width="14" height="14" rx="2" transform="rotate(45 12 12)" />
                  </svg>
                ))}
              </span>
            )}
            {years && <span style={{ color: MUTE }}>{years} ans</span>}
            {flag && <span style={{ fontSize: '11px' }}>{flag}</span>}
          </div>
        )}

        {/* Tags */}
        {(isFreeShipping || isBestSeller) && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {isFreeShipping && <span style={{ fontSize: '10.5px', color: GREEN, fontWeight: 600 }}>✓ Livraison gratuite</span>}
            {isBestSeller && <span style={{ fontSize: '10.5px', color: ORANGE, fontWeight: 600 }}>🔥 Top ventes</span>}
          </div>
        )}

        {/* Bouton commander — branché sur le panier */}
        <button
          onClick={handleClick}
          disabled={busy}
          style={{
            marginTop: '3px', width: '100%', padding: '6px',
            background: done ? GREEN : (btnFilled ? ORANGE : '#fff'),
            color: btnFilled ? '#fff' : ORANGE,
            border: `1.5px solid ${done ? GREEN : ORANGE}`,
            borderRadius: '999px',
            fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(11px, 1vw, 12.5px)', fontWeight: 600,
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
export default function ProductCard(props) {
  const isMobile = useIsMobile()
  return isMobile ? <MobileProductCard {...props} /> : <DesktopProductCard {...props} />
}