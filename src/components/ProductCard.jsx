// ProductCard.jsx — GROSHOP.tn
// Style B2B wholesale (Alibaba-like) :
// image plein cadre arrondie · badge Tendance · prix + %réduction · étoiles ·
// quantité min · fournisseur · Verified + médailles + années + drapeau · bouton Commander.
// Card "invisible" : pas de bordure, pas d'ombre, pas de bg différent de la page.
//
// 6 variantes via la prop `variant` :
//   • 'default'    → compact, pensé pour 6 colonnes (inchangé).
//   • 'wholesale'  → texte agrandi (façon Alibaba), pensé pour 5 colonnes,
//                    bouton "Ajouter au panier" noir qui devient orange au survol.
//   • 'mini'       → plus dense, pensé pour 7 colonnes.
//   • 'catalog'    → mêmes infos que la card normale, tailles propres.
//   • 'trending'   → texte plus grand, pour CategorySection (Best Sellers).
//   • 'aliexpress' → NOUVEAU. Style mobile façon AliExpress pour
//                    MobileCategoriesPage : bandeau "Certified Original" en bas
//                    de l'image, badges Marque+/Promo/custom, nom 2 lignes,
//                    ventes + note, prix, badge "Prix à venir".
//                    Rendu identique sur mobile et desktop (bypass MobileProductCard).
//
// Nom du produit : max 2 lignes (WebkitLineClamp: 2) MAIS sans réservation d'espace
// vide — si le nom tient sur 1 ligne, le contenu qui suit remonte.
//
// Props additionnelles :
//   • hideButton      → masque le bouton d'action, quelle que soit la variante.
//   • hideReviewCount → masque le nombre d'avis à côté de la note, garde les étoiles.

import { useState } from 'react'
import { Star, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useIsMobile } from '../hooks/useIsMobile'
import MobileProductCard from './MobileProductCard'

const ORANGE      = '#ff5e20'
const ORANGE_DEEP = '#ff8820'
const INK         = '#0F1419'
const MUTE        = '#6B7785'
const FAINT       = '#9AA3AE'
const BLUE        = '#1A6DD2'
const GREEN       = '#0F9D58'
const CERT_BLUE   = '#2E7CF6'   // bandeau Certified Original
const PROMO_RED   = '#FF3B30'
const AMBER_BG    = '#FFF3D6'
const AMBER_INK   = '#B25E00'

// ── Jeux de tailles selon la variante ──
const SIZES = {
  default: {
    name:        'clamp(11.5px, 1vw, 13px)',
    nameLh:      1.28,
    nameWeight:  400,
    price:       'clamp(14px, 1.3vw, 18px)',
    tnd:         '0.65em',
    star:        13,
    ratingNum:   'clamp(10.5px, 0.9vw, 11.5px)',
    ratingCount: 'clamp(10px, 0.85vw, 11px)',
    moq:         '11.5px',
    sold:        '11.5px',
    supplier:    '11.5px',
    meta:        '11px',
    medal:       9,
    tag:         '10.5px',
    btn:         'clamp(11px, 1vw, 12.5px)',
    btnPad:      '6px',
    label:       'Commander',
    withCartIcon: false,
    withButton:  true,
  },
  wholesale: {
    name:        '15px',
    nameLh:      1.4,
    nameWeight:  400,
    price:       '23px',
    tnd:         '0.58em',
    star:        16,
    ratingNum:   '13px',
    ratingCount: '12.5px',
    moq:         '14px',
    sold:        '14px',
    supplier:    '14px',
    meta:        '13px',
    medal:       11,
    tag:         '12.5px',
    btn:         '14.5px',
    btnPad:      '10px',
    label:       'Ajouter au panier',
    withCartIcon: true,
    withButton:  true,
  },
  mini: {
    name:        'clamp(10.5px, 0.82vw, 12.5px)',
    nameLh:      1.28,
    nameWeight:  400,
    price:       'clamp(13px, 1.05vw, 16.5px)',
    tnd:         '0.6em',
    star:        'clamp(11px, 0.85vw, 13px)',
    ratingNum:   'clamp(10px, 0.78vw, 11px)',
    ratingCount: 'clamp(9.5px, 0.72vw, 10.5px)',
    moq:         'clamp(10px, 0.8vw, 11.5px)',
    sold:        'clamp(10px, 0.8vw, 11.5px)',
    supplier:    'clamp(10px, 0.8vw, 11.5px)',
    meta:        'clamp(9.5px, 0.75vw, 11px)',
    medal:       9,
    tag:         'clamp(9.5px, 0.75vw, 10.5px)',
    btn:         'clamp(10.5px, 0.85vw, 12px)',
    btnPad:      'clamp(5px, 0.5vw, 7px)',
    label:       'Commander',
    withCartIcon: false,
    withButton:  true,
  },
  catalog: {
    name:        '15.5px',
    nameLh:      1.35,
    nameWeight:  500,
    price:       '20px',
    tnd:         '0.55em',
    oldPrice:    '14px',
    star:        15,
    ratingNum:   '14px',
    ratingCount: '12px',
    moq:         '13px',
    sold:        '13px',
    supplier:    '13px',
    meta:        '12px',
    medal:       9,
    tag:         '10.5px',
    btn:         '12px',
    btnPad:      '8px',
    label:       'Commander',
    withCartIcon: false,
    withButton:  false,
  },
  trending: {
    name:        '15px',
    nameLh:      1.35,
    nameWeight:  500,
    price:       '19px',
    tnd:         '0.6em',
    oldPrice:    '13.5px',
    star:        16,
    ratingNum:   '14px',
    ratingCount: '13px',
    moq:         '13.5px',
    sold:        '13.5px',
    supplier:    '13px',
    meta:        '12px',
    medal:       9,
    tag:         '11.5px',
    btn:         '13px',
    btnPad:      '9px',
    label:       'Commander',
    withCartIcon: false,
    withButton:  false,
  },
}

// Prix : accepte un nombre OU une fourchette [min, max]
function fmtPrice(p) {
  const f = n => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return Array.isArray(p) ? `${f(p[0])}–${f(p[1])}` : f(p)
}

// Format compact "1.2k" au-delà de 1000, sinon le nombre brut
function fmtCount(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n
}

function Stars({ value = 0, size = 15 }) {
  const dim = typeof size === 'number' ? size : undefined
  const styleDim = typeof size === 'string' ? { width: size, height: size } : undefined
  return (
    <span style={{ display: 'inline-flex', gap: 1, flexShrink: 0 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={dim} style={styleDim} fill={s <= Math.round(value) ? '#FFB800' : '#E3E6EA'} stroke="none" />
      ))}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════════
   VARIANTE 'aliexpress' — style mobile façon AliExpress
   Mappée sur le shape réel de l'API GROSHOP :
     - base_price_tnd (string) → prix
     - old_price_tnd  (string) → prix barré + badge Promo
     - primary_image           → image
     - rating_avg (string), rating_count, sold_count
     - badge_choice (bool)     → bandeau bleu "Certifié Original"
     - badge_flash  (bool)     → badge "Promo"
     - is_free_shipping (bool) → petite étiquette verte
     - in_stock (bool)         → overlay "Rupture" si false
     - moq, unit               → "MOQ 100 pièces"
   ══════════════════════════════════════════════════════════════════ */
function AliExpressMobileCard({ product, onClick }) {
  const navigate = useNavigate()
  const p = product || {}

  const img       = p.primary_image || p.image || null
  const price     = p.base_price_tnd != null ? Number(p.base_price_tnd) : null
  const oldPrice  = p.old_price_tnd  != null ? Number(p.old_price_tnd)  : null
  const rating    = p.rating_avg != null ? Number(p.rating_avg) : null
  const sold      = p.sold_count ?? null
  const certified = !!p.badge_choice
  const promo     = !!p.badge_flash || (oldPrice && price && oldPrice > price)
  const discount  = (oldPrice && price && oldPrice > price)
    ? Math.round((1 - price / oldPrice) * 100)
    : null

  const handleClick = (e) => {
    e?.stopPropagation?.()
    if (onClick) return onClick(product)
    if (p.id) navigate(`/produit/${p.id}`)
  }

  return (
    <button
      onClick={handleClick}
      style={{
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        textAlign: 'left', width: '100%', minWidth: 0,
        fontFamily: "'DM Sans', -apple-system, system-ui, sans-serif",
      }}
    >
      {/* image */}
      <div style={{
        width: '100%', aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
        background: '#F4F5F7', position: 'relative',
      }}>
        {img
          ? <img src={img} alt={p.name || ''} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.currentTarget.style.display = 'none' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>📦</div>}

        {/* Rupture de stock */}
        {p.in_stock === false && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#0F1419', letterSpacing: 0.5,
          }}>RUPTURE</div>
        )}

        {/* Bandeau Certifié Original */}
        {certified && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: CERT_BLUE, color: '#fff',
            fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '3px 0',
          }}>Certifié Original</div>
        )}
      </div>

      {/* infos */}
      <div style={{ padding: '6px 2px 0' }}>
        {/* badges */}
        {(promo || p.is_free_shipping) && (
          <div style={{ display: 'flex', gap: 3, marginBottom: 3, flexWrap: 'wrap' }}>
            {promo && (
              <span style={{ background: PROMO_RED, color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 2 }}>Promo</span>
            )}
            {p.is_free_shipping && (
              <span style={{ background: GREEN, color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 2 }}>Livraison offerte</span>
            )}
          </div>
        )}

        {/* nom — max 2 lignes, remonte le contenu si 1 seule ligne */}
        <div style={{
          fontSize: 12, color: INK, lineHeight: 1.25, fontWeight: 500,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {p.name}
        </div>

        {/* ventes + note */}
        {(sold != null || rating != null) && (
          <div style={{ fontSize: 10.5, color: MUTE, marginTop: 3, display: 'flex', alignItems: 'center' }}>
            {sold != null && <span>{fmtCount(sold)}+ vendus</span>}
            {sold != null && rating != null && <span style={{ color: '#DDD', margin: '0 4px' }}>|</span>}
            {rating != null && (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFB800" style={{ marginRight: 2 }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span>{rating.toFixed(1)}</span>
              </>
            )}
          </div>
        )}

        {/* prix */}
        {price != null && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: INK }}>
              TND {price.toFixed(2).replace('.', ',')}
            </span>
            {oldPrice != null && oldPrice > price && (
              <>
                <span style={{ fontSize: 10.5, color: FAINT, textDecoration: 'line-through' }}>
                  {oldPrice.toFixed(2).replace('.', ',')}
                </span>
                {discount != null && (
                  <span style={{ fontSize: 10.5, color: PROMO_RED, fontWeight: 700 }}>
                    -{discount}%
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {/* MOQ */}
        {p.moq && (
          <div style={{ fontSize: 10.5, color: MUTE, marginTop: 3 }}>
            Min. {p.moq} {p.unit || 'pcs'}
          </div>
        )}
      </div>
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════════
   VARIANTES DESKTOP (default/wholesale/mini/catalog/trending)
   ══════════════════════════════════════════════════════════════════ */
function DesktopProductCard({
  product,
  onOrder,
  variant = 'default',
  hideButton = false,
  hideReviewCount = false,
}) {
  const [imgHov, setImgHov] = useState(false)
  const [btnHov, setBtnHov] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const [done, setDone]     = useState(false)
  const navigate = useNavigate()
  const { add, adding } = useCart()

  const S = SIZES[variant] || SIZES.default
  const big = variant === 'wholesale'

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
    isTrending     = false,
    moq            = null,
    moqUnit        = 'pcs',
    supplier       = null,
    verified       = false,
    medals         = 0,
    years          = null,
  } = product || {}

  const busy = adding === id

  const discount = (!Array.isArray(price) && was && was > price)
    ? Math.round((1 - price / was) * 100)
    : null

  const gallery = Array.isArray(product?.images) ? product.images.filter(Boolean) : []
  const imgs    = [...new Set([image, ...gallery].filter(Boolean))]
  const hasCarousel = imgs.length > 1
  const cur = imgs[Math.min(imgIdx, imgs.length - 1)] || image || null

  const stepImg = (e, dir) => {
    e.stopPropagation()
    setImgIdx(v => (v + dir + imgs.length) % imgs.length)
  }

  const onImgMove = (e) => {
    if (!hasCarousel) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const seg = Math.floor((x / rect.width) * imgs.length)
    setImgIdx(Math.min(imgs.length - 1, Math.max(0, seg)))
  }

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
  }

  const btnBaseColor = big ? INK : ORANGE
  const btnFilled = btnHov || done
  const btnBg      = done ? GREEN : (btnFilled ? ORANGE : '#fff')
  const btnFg      = btnFilled ? '#fff' : btnBaseColor
  const btnBorder  = done ? GREEN : (btnFilled ? ORANGE : btnBaseColor)

  const showButton = S.withButton !== false && !hideButton

  return (
    <div
      onClick={() => id && navigate(`/produit/${id}`)}
      style={{
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'DM Sans', -apple-system, system-ui, sans-serif",
        minWidth: 0,
      }}
    >
      {/* ── IMAGE + carrousel ── */}
      <div
        onMouseEnter={() => setImgHov(true)}
        onMouseLeave={() => { setImgHov(false); setImgIdx(0) }}
        onMouseMove={onImgMove}
        style={{
          position: 'relative', width: '100%', aspectRatio: '1 / 1',
          background: '#F7F8FA', overflow: 'hidden',
          borderRadius: '8px',
        }}
      >
        {isTrending && (
          <div style={{
            position: 'absolute', top: '8px', left: '8px', zIndex: 2,
            background: `linear-gradient(135deg, ${ORANGE_DEEP} 0%, ${ORANGE} 100%)`,
            color: '#fff', padding: '4px 9px', borderRadius: '4px',
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1,
          }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            Tendance
          </div>
        )}

        {cur ? (
          <img
            src={cur} alt={name}
            loading="lazy"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform .35s',
              transform: imgHov ? 'scale(1.04)' : 'scale(1)',
            }}
            onError={e => { e.target.src = 'https://placehold.co/300x300/F4F5F7/9AA3AE?text=GROSHOP' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C0C6CC', fontSize: '12px' }}>
            Pas d'image
          </div>
        )}

        <div
          onClick={e => { e.stopPropagation(); if (cur) window.open(cur, '_blank') }}
          title="Voir l'image"
          style={{
            position: 'absolute', bottom: '6px', left: '6px',
            width: '26px', height: '26px', background: '#fff', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 6px rgba(0,0,0,.18)', cursor: 'pointer', zIndex: 2,
            opacity: imgHov ? 1 : 0, transform: imgHov ? 'translateY(0)' : 'translateY(4px)',
            transition: 'opacity .2s, transform .2s',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTE} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {hasCarousel && (
          <>
            <button
              onClick={e => stepImg(e, -1)} aria-label="Image précédente"
              style={{ ...arrowBtn, left: '6px', opacity: imgHov ? 1 : 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button
              onClick={e => stepImg(e, 1)} aria-label="Image suivante"
              style={{ ...arrowBtn, right: '6px', opacity: imgHov ? 1 : 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>

            <div style={{
              position: 'absolute', bottom: '8px', left: '10px', right: '10px',
              display: 'flex', gap: '3px',
              opacity: imgHov ? 1 : 0, transition: 'opacity .18s', pointerEvents: 'none',
            }}>
              {imgs.map((_, k) => (
                <span key={k} style={{
                  flex: 1, height: '3px', borderRadius: '2px',
                  background: k === imgIdx ? '#fff' : 'rgba(255,255,255,.5)',
                  boxShadow: '0 0 2px rgba(0,0,0,.25)',
                  transition: 'background .15s',
                }} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── INFOS ── */}
      <div style={{ padding: '9px 1px 0', display: 'flex', flexDirection: 'column', gap: big ? '5px' : '3px' }}>

        {/* Nom — max 2 lignes, remonte le contenu si 1 seule ligne (pas de minHeight) */}
        <div style={{
          fontSize: S.name, color: INK, lineHeight: S.nameLh, fontWeight: S.nameWeight || 400,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{name}</div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: S.price, fontWeight: 700, color: INK, lineHeight: 1.15 }}>
            {fmtPrice(price)} <span style={{ fontSize: S.tnd, fontWeight: 600 }}>TND</span>
          </span>
          {was && (
            <span style={{ fontSize: S.oldPrice || '11px', color: FAINT, textDecoration: 'line-through' }}>
              {fmtPrice(was)} TND
            </span>
          )}
          {discount != null && discount > 0 && (
            <span style={{ fontSize: S.oldPrice || '11px', color: ORANGE, fontWeight: 700 }}>
              -{discount}%
            </span>
          )}
        </div>

        {rating != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Stars value={rating} size={S.star} />
            <span style={{ fontSize: S.ratingNum, fontWeight: 600, color: INK, lineHeight: 1 }}>
              {rating.toFixed(1)}
            </span>
            {!hideReviewCount && reviewCount != null && reviewCount > 0 && (
              <span style={{ fontSize: S.ratingCount, color: MUTE, lineHeight: 1 }}>
                · {fmtCount(reviewCount)} avis
              </span>
            )}
          </div>
        )}

        {moq && (
          <div style={{ fontSize: S.moq, color: INK, display: 'flex', flexWrap: 'wrap', columnGap: '4px', rowGap: '2px' }}>
            <span style={{ whiteSpace: 'nowrap' }}>Quantité min. : {moq} {moqUnit}</span>
            {soldCount != null && (
              <span style={{ color: MUTE, whiteSpace: 'nowrap' }}>· {fmtCount(soldCount)} vendus</span>
            )}
          </div>
        )}

        {!moq && soldCount != null && (
          <div style={{ fontSize: S.sold, color: MUTE }}>
            {fmtCount(soldCount)} vendus
          </div>
        )}

        {(supplier || verified || medals > 0 || years) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: S.meta, flexWrap: 'wrap', rowGap: '2px' }}>
            {supplier && (
              <span style={{
                color: MUTE, fontSize: S.supplier,
                textDecoration: big ? 'underline' : 'none', textUnderlineOffset: '2px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: '55%', flexShrink: 1, minWidth: 0,
              }}>{supplier}</span>
            )}
            {verified && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: BLUE, fontWeight: 700, flexShrink: 0 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill={BLUE} stroke="none">
                  <path d="M12 1l2.4 2.4 3.3-.5.6 3.3L21 9l-1.7 2.9 1.7 2.9-2.7 1.3-.6 3.3-3.3-.5L12 23l-2.4-2.4-3.3.5-.6-3.3L3 14.9 4.7 12 3 9.1l2.7-1.3.6-3.3 3.3.5z" />
                  <polyline points="8.5 12 11 14.5 15.5 9.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified
              </span>
            )}
            {medals > 0 && (
              <span style={{ display: 'flex', gap: '1px', flexShrink: 0 }} title="Notation boutique">
                {Array.from({ length: medals }).map((_, i) => (
                  <svg key={i} width={S.medal} height={S.medal} viewBox="0 0 24 24" fill={ORANGE}>
                    <rect x="12" y="2" width="14" height="14" rx="2" transform="rotate(45 12 12)" />
                  </svg>
                ))}
              </span>
            )}
            {years && <span style={{ color: MUTE, flexShrink: 0 }}>{years} ans</span>}
          </div>
        )}

        {(isFreeShipping || isBestSeller) && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {isFreeShipping && <span style={{ fontSize: S.tag, color: GREEN, fontWeight: 600 }}>✓ Livraison gratuite</span>}
            {isBestSeller && <span style={{ fontSize: S.tag, color: ORANGE, fontWeight: 600 }}>🔥 Top ventes</span>}
          </div>
        )}

        {showButton && (
          <button
            onClick={handleClick}
            onMouseEnter={() => setBtnHov(true)}
            onMouseLeave={() => setBtnHov(false)}
            disabled={busy}
            style={{
              marginTop: '4px', width: '100%', padding: S.btnPad,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              background: btnBg,
              color: btnFg,
              border: `1.5px solid ${btnBorder}`,
              borderRadius: '999px',
              fontFamily: "'DM Sans', sans-serif", fontSize: S.btn, fontWeight: 600,
              cursor: busy ? 'default' : 'pointer',
              opacity: busy ? 0.65 : 1,
              transition: 'background .18s, color .18s, border-color .18s',
            }}
          >
            {S.withCartIcon && !busy && !done && <ShoppingCart size={15} />}
            {busy ? 'Ajout…' : done ? '✓ Ajouté' : S.label}
          </button>
        )}
      </div>
    </div>
  )
}

const arrowBtn = {
  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
  width: '30px', height: '30px', borderRadius: '50%',
  background: '#fff', border: 'none',
  boxShadow: '0 1px 6px rgba(0,0,0,.2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0, zIndex: 2,
  transition: 'opacity .18s',
}

/* ══════════════════════════════════════════════════════════════════
   EXPORT — routage par variante
   • 'aliexpress' → composant dédié, rendu identique mobile/desktop
   • sinon        → MobileProductCard sur mobile, DesktopProductCard sinon
   ══════════════════════════════════════════════════════════════════ */
export default function ProductCard(props) {
  if (props.variant === 'aliexpress') return <AliExpressMobileCard {...props} />
  const isMobile = useIsMobile()
  return isMobile ? <MobileProductCard {...props} /> : <DesktopProductCard {...props} />
}