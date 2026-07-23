// pages/SupplierReviewsPage.jsx — GROSHOP.tn

import { useState } from 'react'
import * as Icons from 'lucide-react'

// ── Design tokens ──────────────────────────────────────────────────
const STAR = '#FFB800'          // gold star
const STAR_BG = '#FEF3C7'        // light gold bg for badges
const STAR_TEXT = '#92400E'      // amber-900 for text in gold contexts
const ORANGE = '#FF4500'         // brand
const ORANGE_LIGHT = '#FFF3E8'   // selected row tint
const TRACK = '#F1F2F4'          // light gray track
const BORDER = '#F0F1F3'         // card borders

// ── Inject styles ──────────────────────────────────────────────────
const STYLE_ID = 'gs-reviews-styles-v2'
if (typeof document !== 'undefined') {
  document.querySelectorAll('style[id^="gs-reviews-styles"]').forEach(el => {
    if (el.id !== STYLE_ID) el.remove()
  })
  if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style')
    s.id = STYLE_ID
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
      .gs-rev { font-family: 'DM Sans', -apple-system, sans-serif; color: #0F1419; }
      .gs-h1  { font-family: 'Fraunces', Georgia, serif; font-weight: 700; letter-spacing: -0.02em; }
      .gs-num { font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: -0.02em; }

      .gs-rev-card {
        background: #fff;
        border-radius: 20px;
        border: 1px solid ${BORDER};
        box-shadow: 0 1px 2px rgba(15, 20, 25, 0.03);
      }
      .gs-rev-row { transition: background 0.18s ease; cursor: pointer; }
      .gs-rev-row-default:hover { background: #FAFAFB; }
      .gs-rev-btn-primary {
        background: ${ORANGE};
        color: #fff;
        border: none;
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        box-shadow: 0 6px 16px -4px rgba(255, 69, 0, 0.40);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .gs-rev-btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 20px -4px rgba(255, 69, 0, 0.50);
      }
      .gs-rev-btn-ghost {
        background: #fff;
        color: #0F1419;
        border: 1px solid ${BORDER};
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        transition: background 0.15s ease, border-color 0.15s ease;
      }
      .gs-rev-btn-ghost:hover { background: #FAFAFB; border-color: #DDE0E5; }
    `
    document.head.appendChild(s)
  }
}

// ── Data ───────────────────────────────────────────────────────────
const REVIEWS = [
  {
    id: 1, date: '14 Juin 2026', orderId: 'GS-7842',
    productName: "Huile d'olive extra vierge 5L",
    productIcon: 'Wine', productBg: '#FFE5D6',
    rating: 4.8, helpful: 24,
    text: "Excellente qualité d'huile, livraison rapide et emballage très soigné. Le fournisseur a été réactif sur ma question concernant la date de pressage. Je recommande vivement pour les épiceries qui cherchent un produit haut de gamme à prix compétitif.",
  },
  {
    id: 2, date: '13 Juin 2026', orderId: 'GS-7839',
    productName: 'Pâtes spaghetti premium 500g',
    productIcon: 'Wheat', productBg: '#FEF3C7',
    rating: 5.0, helpful: 18,
    text: "Commande conforme, prix imbattable au gros. Les pâtes tiennent bien à la cuisson, qualité italienne authentique. Je vais renouveler la commande pour ma chaîne de restaurants.",
  },
  {
    id: 3, date: '12 Juin 2026', orderId: 'GS-7831',
    productName: 'Café arabica moulu 1kg',
    productIcon: 'Coffee', productBg: '#E8DCC9',
    rating: 4.2, helpful: 9,
    text: "Très bon café, arôme prononcé. Petit bémol sur le grain qui pourrait être plus fin pour les machines espresso pro, mais excellent rapport qualité/prix sinon.",
  },
  {
    id: 4, date: '11 Juin 2026', orderId: 'GS-7825',
    productName: "Savon bio à l'huile d'argan",
    productIcon: 'Sparkles', productBg: '#EDE9FE',
    rating: 4.9, helpful: 31,
    text: "Produit de qualité artisanale, mes clientes adorent. Packaging premium qui valorise le produit en rayon. Le seul point d'amélioration serait des délais de réassort plus courts.",
  },
  {
    id: 5, date: '10 Juin 2026', orderId: 'GS-7818',
    productName: 'Crevettes royales congelées 1kg',
    productIcon: 'Fish', productBg: '#FFE0E8',
    rating: 4.0, helpful: 6,
    text: "Bonne marchandise, chaîne du froid respectée à la livraison. Le calibrage des crevettes pourrait être plus régulier dans le sachet.",
  },
]

const RATING_DIST = [
  { stars: 5, count: 1740, pct: 70 },
  { stars: 4, count: 520,  pct: 21 },
  { stars: 3, count: 150,  pct: 6 },
  { stars: 2, count: 45,   pct: 1.8 },
  { stars: 1, count: 25,   pct: 1 },
]

const TOTAL_REVIEWS = RATING_DIST.reduce((s, r) => s + r.count, 0)
const AVG_RATING = 4.8

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function DesktopSupplierReviewsPage() {
  const [selectedId, setSelectedId] = useState(REVIEWS[0].id)
  const selected = REVIEWS.find(r => r.id === selectedId)

  return (
    <div className="gs-rev">
      {/* Top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
      }}>
        <h1 className="gs-h1" style={{ fontSize: 26, margin: 0 }}>Avis clients</h1>
        <button className="gs-rev-btn-ghost" style={{ padding: '9px 16px' }}>
          <Icons.Download size={14} strokeWidth={2} />
          Exporter
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2.3fr 1fr',
        gap: 18,
        alignItems: 'start',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <RatingDistributionCard />
          <ReviewsTable reviews={REVIEWS} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        <ReviewDetail review={selected} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// RATING DISTRIBUTION CARD
// ═══════════════════════════════════════════════════════════════════
function RatingDistributionCard() {
  return (
    <div className="gs-rev-card" style={{ padding: 28 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 40,
        alignItems: 'center',
      }}>
        {/* Big rating */}
        <div style={{ textAlign: 'center', minWidth: 120 }}>
          <div className="gs-num" style={{ fontSize: 58, color: '#0F1419', lineHeight: 1 }}>
            {AVG_RATING.toFixed(1)}
          </div>
          <div style={{ marginTop: 10 }}>
            <StarRating value={AVG_RATING} size={20} />
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 10, fontWeight: 500 }}>
            {TOTAL_REVIEWS.toLocaleString('fr-FR')} notes
          </div>
        </div>

        {/* Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {RATING_DIST.map(r => (
            <div key={r.stars} style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 92px',
              alignItems: 'center',
              gap: 14,
            }}>
              <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                {r.stars} étoile{r.stars > 1 ? 's' : ''}
              </span>
              <div style={{
                height: 8,
                background: TRACK,
                borderRadius: 999,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${r.pct}%`,
                  background: `linear-gradient(90deg, #FFB088 0%, ${ORANGE} 100%)`,
                  borderRadius: 999,
                }} />
              </div>
              <span style={{ fontSize: 11.5, color: '#9AA3AE', textAlign: 'right', fontWeight: 500 }}>
                {r.count.toLocaleString('fr-FR')} avis
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// REVIEWS TABLE
// ═══════════════════════════════════════════════════════════════════
function ReviewsTable({ reviews, selectedId, onSelect }) {
  const cols = '140px 240px 1fr 90px'

  return (
    <div className="gs-rev-card" style={{ padding: '8px 0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: cols,
        padding: '16px 28px 14px',
        fontSize: 11,
        color: '#9AA3AE',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div>Date</div>
        <div>Produit · Commande</div>
        <div>Avis</div>
        <div style={{ textAlign: 'right' }}>Note</div>
      </div>

      {/* Rows */}
      {reviews.map((r, i) => {
        const Icon = Icons[r.productIcon] || Icons.Package
        const isSelected = r.id === selectedId
        return (
          <div
            key={r.id}
            className={`gs-rev-row ${isSelected ? '' : 'gs-rev-row-default'}`}
            onClick={() => onSelect(r.id)}
            style={{
              display: 'grid',
              gridTemplateColumns: cols,
              padding: '18px 28px',
              fontSize: 12.5,
              alignItems: 'center',
              borderBottom: i < reviews.length - 1 ? `1px solid ${BORDER}` : 'none',
              background: isSelected ? ORANGE_LIGHT : 'transparent',
              borderLeft: isSelected ? `3px solid ${ORANGE}` : '3px solid transparent',
            }}
          >
            <div style={{ color: '#6B7280', fontSize: 12 }}>{r.date}</div>

            {/* Produit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: r.productBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: `1px solid rgba(15,20,25,0.04)`,
              }}>
                <Icon size={19} strokeWidth={1.6} color="#0F1419" style={{ opacity: 0.75 }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 12.5, fontWeight: 700, color: '#0F1419',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  #{r.orderId}
                </div>
                <div style={{
                  fontSize: 10.5, color: '#9AA3AE', marginTop: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {r.productName}
                </div>
              </div>
            </div>

            {/* Avis text */}
            <div style={{
              fontSize: 12,
              color: '#0F1419',
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              paddingRight: 18,
            }}>
              {r.text}
            </div>

            {/* Rating badge — GOLD theme */}
            <div style={{ textAlign: 'right' }}>
              <span style={{
                background: STAR_BG,
                color: STAR_TEXT,
                padding: '5px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                border: `1px solid rgba(255, 184, 0, 0.25)`,
              }}>
                <Icons.Star size={11} fill={STAR} stroke={STAR} />
                {r.rating.toFixed(1)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// REVIEW DETAIL (right)
// ═══════════════════════════════════════════════════════════════════
function ReviewDetail({ review }) {
  const Icon = Icons[review.productIcon] || Icons.Package

  return (
    <div className="gs-rev-card" style={{
      padding: 26,
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      position: 'sticky',
      top: 16,
    }}>
      {/* Product avatar avec rating badge */}
      <div style={{ position: 'relative', alignSelf: 'center', marginTop: 6 }}>
        {/* Outer ring */}
        <div style={{
          padding: 4,
          background: '#fff',
          borderRadius: '50%',
          border: `1px solid ${BORDER}`,
          boxShadow: '0 10px 24px -8px rgba(15, 20, 25, 0.18)',
        }}>
          <div style={{
            width: 108, height: 108,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${review.productBg} 0%, ${review.productBg}AA 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={48} strokeWidth={1.4} color="#0F1419" style={{ opacity: 0.75 }} />
          </div>
        </div>

        {/* Rating chip — gold */}
        <div style={{
          position: 'absolute',
          bottom: -2,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          color: STAR_TEXT,
          padding: '5px 12px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          boxShadow: '0 4px 12px -2px rgba(15, 20, 25, 0.18)',
          border: `1px solid ${BORDER}`,
          whiteSpace: 'nowrap',
        }}>
          <Icons.Star size={11} fill={STAR} stroke={STAR} />
          {review.rating.toFixed(1)}
        </div>
      </div>

      {/* Product name */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#0F1419',
          marginBottom: 6,
          lineHeight: 1.3,
        }}>
          {review.productName}
        </div>
        <div style={{
          fontSize: 11.5,
          color: '#9AA3AE',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <Icons.Receipt size={11} strokeWidth={2} />
          Commande <strong style={{ color: '#0F1419', fontWeight: 700 }}>#{review.orderId}</strong>
          <span style={{ color: '#DDE0E5' }}>·</span>
          {review.date}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: BORDER }} />

      {/* Stars centered */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <StarRating value={review.rating} size={20} />
      </div>

      {/* Review text */}
      <div style={{
        background: '#FAFAFB',
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        padding: '14px 16px',
        fontSize: 12.5,
        color: '#0F1419',
        lineHeight: 1.6,
      }}>
        {review.text}
      </div>

      {/* Stat boxes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
      }}>
        <StatBox
          value={review.rating.toFixed(1)}
          label="Note attribuée"
          color={STAR_TEXT}
          bg={STAR_BG}
          borderColor="rgba(255, 184, 0, 0.20)"
        />
        <StatBox
          value={review.helpful}
          label="Votes utiles"
          color="#0369A1"
          bg="#E0F2FE"
          borderColor="rgba(14, 165, 233, 0.20)"
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <button className="gs-rev-btn-primary">
          <Icons.MessageSquare size={14} strokeWidth={2.2} />
          Répondre à l'avis
        </button>
        <button className="gs-rev-btn-ghost">
          <Icons.Receipt size={14} strokeWidth={2.2} />
          Voir la commande
        </button>
      </div>
    </div>
  )
}

function StatBox({ value, label, color, bg, borderColor }) {
  return (
    <div style={{
      background: bg,
      border: `1px solid ${borderColor}`,
      padding: 16,
      borderRadius: 14,
      textAlign: 'center',
    }}>
      <div className="gs-num" style={{ fontSize: 24, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 6, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STAR RATING (gold, supports decimals)
// ═══════════════════════════════════════════════════════════════════
function StarRating({ value, size = 16 }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    const fill = Math.max(0, Math.min(1, value - (i - 1)))
    stars.push(
      <span key={i} style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
        <Icons.Star size={size} stroke={STAR} fill="none" strokeWidth={1.5} />
        {fill > 0 && (
          <span style={{
            position: 'absolute',
            top: 0, left: 0,
            width: `${fill * 100}%`,
            height: '100%',
            overflow: 'hidden',
          }}>
            <Icons.Star size={size} fill={STAR} stroke={STAR} strokeWidth={1.5} />
          </span>
        )}
      </span>
    )
  }
  return <div style={{ display: 'inline-flex', gap: 4 }}>{stars}</div>
}