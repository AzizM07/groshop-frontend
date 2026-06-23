// SuperDeals.jsx — GROSHOP.tn

import { useState } from 'react'

const ACCENT = '#E11D48'

// ── Data ─────────────────────────────────────────────────────────
const SUPERDEALS_PRODUCTS = [
  { id: 's1', name: 'Masque chirurgical x50',  price: 5.90,  was: 8.00,  discount: 26, rating: 4.7, soldCount: 2100, image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=300&q=80' },
  { id: 's2', name: 'T-shirt coton x50',        price: 4.20,  was: 7.50,  discount: 44, rating: 4.6, soldCount: 4800, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80' },
  { id: 's3', name: 'Détergent 5L x60',         price: 6.80,  was: 11.00, discount: 38, rating: 4.7, soldCount: 3200, image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300&q=80' },
  { id: 's4', name: 'Pack écolier x24',         price: 8.50,  was: 14.00, discount: 39, rating: 4.5, soldCount: 2800, image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&q=80' },
  { id: 's5', name: "Huile d'olive 5L",         price: 24.50, was: 38.00, discount: 35, rating: 4.8, soldCount: 1900, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80' },
  { id: 's6', name: 'Couches bébé x6',          price: 42.00, was: 60.00, discount: 30, rating: 4.6, soldCount: 1650, image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&q=80' },
  { id: 's7', name: 'Café arabica 1kg',         price: 18.90, was: 26.00, discount: 27, rating: 4.9, soldCount: 1400, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&q=80' },
]

// ── MiniCard ─────────────────────────────────────────────────────
function MiniCard({ product }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        borderRadius: '9px',
        overflow: 'hidden',
        border: `1px solid ${hov ? ACCENT : '#F0F0F0'}`,
        cursor: 'pointer',
        transition: 'all 0.18s',
        boxShadow: hov ? '0 4px 14px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.05)',
        transform: hov ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#F8F8F8' }}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.2s',
            transform: hov ? 'scale(1.07)' : 'scale(1)',
          }}
          onError={e => { e.target.src = 'https://via.placeholder.com/150?text=IMG' }}
        />
        {product.discount && (
          <span style={{
            position: 'absolute', top: '5px', left: '5px',
            background: ACCENT, color: '#fff',
            fontSize: '10px', fontWeight: 800,
            padding: '1px 6px', borderRadius: '4px',
          }}>
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Infos */}
      <div style={{ padding: '6px 7px 8px' }}>
        <div style={{
          fontSize: '11px', color: '#0F1419', lineHeight: 1.3,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          marginBottom: '4px',
          minHeight: '27px',
        }}>
          {product.name}
        </div>

        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F1419' }}>
          TND{product.price.toFixed(2)}
        </div>

        {product.was && (
          <div style={{ fontSize: '10.5px', color: '#9AA3AE', textDecoration: 'line-through' }}>
            TND{product.was.toFixed(2)}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill={ACCENT} stroke={ACCENT} strokeWidth="1">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span style={{ fontSize: '10px', color: '#6B7785' }}>{product.rating}</span>
          <span style={{ fontSize: '10px', color: '#C0C6CC' }}>·</span>
          <span style={{ fontSize: '10px', color: '#9AA3AE' }}>
            {product.soldCount >= 1000
              ? (product.soldCount / 1000).toFixed(1) + 'k'
              : product.soldCount}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Composant principal ──────────────────────────────────────────
export default function SuperDeals() {
  return (
    <div style={{
      borderRadius: '0 0 clamp(10px, 1.5vw, 16px) clamp(10px, 1.5vw, 16px)',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.09)',
      border: '1px solid #EBEBEB',
      borderTop: 'none',
    }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(100deg, #BE123C 0%, #E11D48 40%, #F43F5E 70%, #FB7185 100%)',
        padding: 'clamp(8px, 1vw, 12px) clamp(14px, 2vw, 22px)',
        display: 'flex', alignItems: 'center',
        gap: 'clamp(8px, 1.2vw, 14px)',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Cercles déco */}
        <div style={{
          position: 'absolute', right: '-30px', top: '50%',
          transform: 'translateY(-50%)',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: '60px', top: '-20px',
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
        }} />

        {/* Icône */}
        <span style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', flexShrink: 0, zIndex: 1 }}>🔥</span>

        {/* Titre */}
        <span style={{
          fontSize: 'clamp(13px, 1.5vw, 16px)', fontWeight: 900,
          color: '#fff', flexShrink: 0, zIndex: 1, letterSpacing: '-0.3px',
        }}>
          Super Deals
        </span>

        {/* Badge */}
        <span style={{
          background: 'rgba(255,255,255,0.22)',
          backdropFilter: 'blur(4px)',
          color: '#fff',
          fontSize: 'clamp(9px, 0.85vw, 10.5px)', fontWeight: 800,
          padding: '2px clamp(6px, 0.8vw, 9px)', borderRadius: '20px',
          flexShrink: 0, whiteSpace: 'nowrap', zIndex: 1,
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          MEILLEURES VENTES
        </span>

        <div style={{ flex: 1 }} />

        {/* CTA */}
        <a
          href="/deals"
          style={{
            color: '#fff', fontSize: 'clamp(10px, 1vw, 12px)',
            fontWeight: 600, textDecoration: 'none',
            flexShrink: 0, whiteSpace: 'nowrap', zIndex: 1,
            opacity: 0.85,
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.85' }}
        >
          Voir tout →
        </a>
      </div>

      {/* ── Produits ── */}
      <div style={{
        background: '#FFF5F7',
        padding: '10px clamp(14px, 2vw, 22px)',
        borderTop: '1px solid rgba(225,29,72,0.10)',
      }}>
        <div style={{
          display: 'flex', gap: '0.5rem',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '2px',
        }}>
          {SUPERDEALS_PRODUCTS.map(p => (
            <div key={p.id} style={{
              flex: '0 0 clamp(100px, 13vw, 155px)',
              minWidth: 'clamp(100px, 13vw, 155px)',
              scrollSnapAlign: 'start',
            }}>
              <MiniCard product={p} />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}