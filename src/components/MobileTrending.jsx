// src/components/MobileTrending.jsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Flame, ChevronRight } from 'lucide-react'

const FONT   = '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const ORANGE = '#ff6500'
const PROMO_RED       = '#FF2E4D'
const PILL_BG_ACTIVE = '#0F1419'
const BLUE       = '#2E7CF6'
const fmtNum = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// price peut être un number OU [min, max] (fourchette de tiers)
function fmtPrice(price) {
  if (Array.isArray(price)) {
    const [min, max] = price
    return `${fmtNum(min)} - ${fmtNum(max)}`
  }
  return fmtNum(price)
}

// % de réduction calculé à la volée (was = ancien prix, price = prix actuel)
function computeDiscount(price, was) {
  const p = Array.isArray(price) ? price[0] : price
  if (!was || !p || was <= p) return 0
  return Math.round(((was - p) / was) * 100)
}

const INITIAL_COUNT = 6 // 2 rangées de 3, comme la capture AliExpress

if (typeof document !== 'undefined' && !document.getElementById('mt-styles')) {
  const s = document.createElement('style')
  s.id = 'mt-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
    .mt-scroll { scrollbar-width: none; -ms-overflow-style: none; }
    .mt-scroll::-webkit-scrollbar { display: none; }
    .mt-card img { transition: transform .25s ease; }
    .mt-card:active img { transform: scale(1.03); }
    .mt-cart-btn { transition: transform .15s ease, box-shadow .15s ease; }
    .mt-cart-btn:active { transform: scale(0.9); }
  `
  document.head.appendChild(s)
}

export default function MobileTrending({ products = [] }) {
  const navigate = useNavigate()
  const [active, setActive] = useState('Tout')
  const [expanded, setExpanded] = useState(false)

  const categories = useMemo(
    () => ['Tout', ...new Set(products.map(p => p.category).filter(Boolean))],
    [products]
  )

  const filtered = active === 'Tout' ? products : products.filter(p => p.category === active)
  const list = expanded ? filtered : filtered.slice(0, INITIAL_COUNT)

  if (!products.length) return null

  return (
    <div style={{ fontFamily: FONT, padding: '4px 0' }}>

      {/* ══ Titre centré avec flèche, taille/style "Daily deals >" ══ */}
      <div
        onClick={() => navigate('/tendances')} // adapte la route si besoin, ou retire l'onClick
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          padding: '4px 12px 14px',
          cursor: 'pointer',
          width: 'fit-content',
          margin: '0 auto',
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 700, color: ORANGE, letterSpacing: '-.2px' }}>
          Best
        </span>
        <span style={{ fontSize: 20, fontWeight: 700, color: BLUE, letterSpacing: '-.2px' }}>
          Sellers
        </span>
        <ChevronRight size={13} color="#9AA3AE" strokeWidth={2} />
      </div>

      {/* ══ Filtres catégories, style pastille (comme "All / Underwear / Shoes...") ══ */}
      <div
        className="mt-scroll"
        style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 12px 14px', WebkitOverflowScrolling: 'touch' }}
      >
        {categories.map(cat => {
          const on = active === cat
          return (
            <button
              key={cat}
              onClick={() => { setActive(cat); setExpanded(false) }}
              style={{
                flexShrink: 0,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                fontFamily: FONT,
                fontSize: 12.5,
                fontWeight: 600,
                color: on ? '#fff' : '#5B6470',
                background: on ? 'BLUE' : '#F1F2F4',
                border: 'none',
                borderRadius: 999,
                padding: '9px 16px',
                transition: 'background .2s, color .2s',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* ══ Grille 3 colonnes ══ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          padding: '0 12px',
        }}
      >
        {list.map(p => {
          const discount = computeDiscount(p.price, p.was)
          const showSold = p.soldCount && p.soldCount > 0

          return (
            <div
              key={p.id}
              className="mt-card"
              onClick={() => navigate(`/produit/${p.id}`)}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            >
              {/* Image carrée + bouton panier flottant */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', borderRadius: 14, overflow: 'hidden', background: '#FAFAFB' }}>
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.currentTarget.src = 'https://placehold.co/300x300/FAFAFB/9AA3AE?text=Produit' }}
                />
                <button
                  className="mt-cart-btn"
                  onClick={(e) => { e.stopPropagation(); /* TODO: ajouter au panier */ }}
                  aria-label="Ajouter au panier"
                  style={{
                    position: 'absolute', bottom: 6, right: 6,
                    width: 26, height: 26, borderRadius: '50%',
                    background: '#fff', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,.18)',
                  }}
                >
                  <ShoppingCart size={13} color="#0F1419" strokeWidth={2.3} />
                </button>
              </div>

              {/* Tag "X vendus" / "Meilleur prix 30j" */}
              <div style={{ minHeight: 16, margin: '6px 0 2px' }}>
                {showSold ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 600, color: ORANGE }}>
                    <Flame size={11} fill={ORANGE} stroke="none" />
                    {p.soldCount >= 1000 ? (p.soldCount / 1000).toFixed(1) + 'k' : p.soldCount} vendus
                  </span>
                ) : discount > 0 ? (
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: '#9AA3AE' }}>
                    Meilleur prix 30j
                  </span>
                ) : null}
              </div>

              {/* Prix */}
              <div style={{ fontSize: Array.isArray(p.price) ? 12 : 14, fontWeight: 800, color: '#0F1419', letterSpacing: '-.2px', lineHeight: 1.2 }}>
                {fmtPrice(p.price)} <span style={{ fontSize: 9.5, fontWeight: 700 }}>TND</span>
              </div>

              {/* Pastille remise */}
              {discount > 0 && (
                <span style={{
                  marginTop: 4,
                  alignSelf: 'flex-start',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  background: ORANGE,
                  borderRadius: 999,
                  padding: '2px 8px',
                }}>
                  -{discount}%
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* ══ View more ══ */}
      {!expanded && filtered.length > INITIAL_COUNT && (
        <div style={{ textAlign: 'center', padding: '16px 12px 4px' }}>
          <button
            onClick={() => setExpanded(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: FONT, fontSize: 13, fontWeight: 600,
              color: '#0F1419', textDecoration: 'underline',
            }}
          >
            Voir plus
          </button>
        </div>
      )}
    </div>
  )
}