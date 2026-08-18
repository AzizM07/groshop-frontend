// MobileProductCard.jsx — GROSHOP.tn
// Port MOBILE de DesktopProductCard : mêmes infos, même style B2B (Alibaba-like),
// adapté au tactile (pas de :hover — feedback au :active). Pensé pour une grille
// 2 colonnes. Reçoit exactement le même objet `product` que la version desktop.
//
// Badges (rangée colorée en haut, façon AliExpress) :
//   - Certifié     (bleu)    ← verified / supplier_verified === 'approved'
//   - Choice       (jaune)   ← isChoice / badge_choice
//   - SuperDeals   (violet)  ← isFlash / badge_flash
//   - Promo        (rouge)   ← was > price (sauf si SuperDeals déjà présent)
//   - Livraison offerte (vert) ← isFreeShipping / is_free_shipping
//   - Top ventes   (orange)  ← isBestSeller
//
// PAS de bouton "Commander" en mobile — toute la carte est cliquable → fiche produit.
// Nom : max 2 lignes ; si le nom tient sur 1 ligne, le contenu qui suit remonte
// (pas de réservation d'espace vide).

import { Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ORANGE      = '#ff5e20'
const INK         = '#0F1419'
const MUTE        = '#6B7785'
const FAINT       = '#9AA3AE'
const BLUE        = '#1A6DD2'
const GREEN       = '#0F9D58'
const FONT        = "'DM Sans', -apple-system, system-ui, sans-serif"

// Palette badges (alignée sur AliExpressMobileCard dans ProductCard.jsx)
const CERT_BLUE       = '#2E7CF6'
const CHOICE_BG       = '#FFE264'
const CHOICE_FG       = '#0F1419'
const SUPERDEALS_BG   = '#C4B5FD'
const SUPERDEALS_FG   = '#3F1D9B'
const PROMO_RED       = '#FF2E4D'

// DM Sans + états tactiles (:active), injecté une seule fois
if (typeof document !== 'undefined' && !document.getElementById('mpc-styles')) {
  const s = document.createElement('style')
  s.id = 'mpc-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
    .mpc-card:active .mpc-img { transform: scale(1.03); }
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

// Petit badge coloré rectangulaire
function Badge({ bg, fg, children }) {
  return (
    <span style={{
      display: 'inline-block',
      background: bg, color: fg,
      fontSize: 10, fontWeight: 700, lineHeight: 1,
      padding: '3px 6px', borderRadius: 3,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  )
}

export default function MobileProductCard({ product }) {
  const navigate = useNavigate()

  const {
    id             = null,
    name           = 'Produit',
    price          = 0,
    was            = null,
    rating         = null,
    soldCount      = null,
    reviewCount    = null,
    image          = null,
    isFreeShipping = false,
    isBestSeller   = false,
    isFlash        = false,
    isChoice       = false,
    moq            = null,
    moqUnit        = 'pcs',
    supplier       = null,
    verified       = false,
    medals         = 0,
    years          = null,
  } = product || {}

  // Détection promo — badge rouge (uniquement si SuperDeals absent, sinon doublon)
  const hasPromo = !Array.isArray(price) && was && price && was > price
  const showPromo = hasPromo && !isFlash

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
      {/* IMAGE */}
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

      {/* INFOS */}
      <div style={{ padding: '7px 1px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Rangée de badges */}
        {(verified || isChoice || isFlash || showPromo || isFreeShipping || isBestSeller) && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 2 }}>
            {verified       && <Badge bg={CERT_BLUE}     fg="#fff">Certifié</Badge>}
            {isChoice       && <Badge bg={CHOICE_BG}     fg={CHOICE_FG}>Choice</Badge>}
            {isFlash        && <Badge bg={SUPERDEALS_BG} fg={SUPERDEALS_FG}>SuperDeals</Badge>}
            {showPromo      && <Badge bg={PROMO_RED}     fg="#fff">Promo</Badge>}
            {isFreeShipping && <Badge bg={GREEN}         fg="#fff">Livraison offerte</Badge>}
            {isBestSeller   && <Badge bg={ORANGE}        fg="#fff">Top ventes</Badge>}
          </div>
        )}

        {/* Nom — max 2 lignes, sans réserver d'espace vide si 1 seule ligne */}
        <div style={{
          fontSize: 12.5, color: INK, lineHeight: 1.28, fontWeight: 400,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{name}</div>

        {/* Prix */}
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

        {/* Fournisseur + Verified icône + médailles + années */}
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
      </div>
    </div>
  )
}