// src/components/MobileHome.jsx
import { useState, useEffect, Fragment } from 'react'
import { products as productsApi } from '../lib/api'
import ProductCard from './ProductCard'
import CategorySection from './CategorySection'
import Footer from './Footer'
import AdSlot from './AdSlot'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

// ── Chips catégories (scroll horizontal, style Alibaba) ──────────
const chip = (active) => ({
  flexShrink: 0, textDecoration: 'none', whiteSpace: 'nowrap',
  fontSize: 13, fontWeight: active ? 700 : 500,
  color: active ? '#fff' : '#0F1419',
  background: active ? '#FF4500' : '#F4F5F7',
  padding: '7px 14px', borderRadius: 20,
})

function CategoryChips() {
  const [cats, setCats] = useState([])
  useEffect(() => {
    productsApi.categories()
      .then(d => setCats((d || []).slice(0, 12)))
      .catch(() => {})
  }, [])
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 12px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
      <a href="/produits" style={chip(true)}>Tout</a>
      {cats.map(c => (
        <a key={c.id} href={`/search?cat=${c.id}`} style={chip(false)}>{c.name}</a>
      ))}
    </div>
  )
}

// ── Hero mobile : une seule bannière carrousel ───────────────────
const SLIDES = [
  { image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80', tag: 'Nouveautés', title: 'Grossiste Tunisie 2025',        href: '/produits' },
  { image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80', tag: 'Promo −40%',  title: 'Mode & Textile',              href: '/produits/textile' },
  { image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80', tag: 'Tendance',    title: 'High-Tech & Électronique',    href: '/produits/electronique' },
]

function MobileHero() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI(p => (p + 1) % SLIDES.length), 4500)
    return () => clearInterval(t)
  }, [])
  const s = SLIDES[i]
  return (
    <a href={s.href} style={{ display: 'block', margin: '4px 12px 0', borderRadius: 14, overflow: 'hidden', position: 'relative', textDecoration: 'none' }}>
      <div style={{ position: 'relative', height: 150 }}>
        <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.5), transparent 70%)' }} />
        <div style={{ position: 'absolute', left: 16, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: '#FF4500', padding: '3px 9px', borderRadius: 20, width: 'fit-content' }}>{s.tag}</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 8, maxWidth: 200, lineHeight: 1.25 }}>{s.title}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
          {SLIDES.map((_, k) => (
            <span key={k} style={{ width: k === i ? 16 : 6, height: 6, borderRadius: 3, background: k === i ? '#FF4500' : 'rgba(255,255,255,.6)', transition: 'width .25s' }} />
          ))}
        </div>
      </div>
    </a>
  )
}

// ── Skeleton (2 colonnes) ────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E8EAED', overflow: 'hidden' }}>
      <div style={{ aspectRatio: '1/1', background: '#F0F0F0' }} />
      <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ height: 10, background: '#F0F0F0', borderRadius: 4, width: '90%' }} />
        <div style={{ height: 10, background: '#F0F0F0', borderRadius: 4, width: '55%' }} />
        <div style={{ height: 14, background: '#F0F0F0', borderRadius: 4, width: '45%' }} />
      </div>
    </div>
  )
}

// ── Home mobile ──────────────────────────────────────────────────
// Reçoit les produits DÉJÀ mappés depuis HomePage (props.items).
export default function MobileHome({ items = [], trending = [], loading, error, isPersonalized }) {
  return (
    <div style={{ fontFamily: FONT, background: '#fff' }}>

      <CategoryChips />
      <MobileHero />

      {trending.length > 0 && (
        <div style={{ padding: '14px 12px 0' }}>
          <CategorySection products={trending} />
        </div>
      )}

      <div style={{ padding: '16px 12px 24px' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#0F1419' }}>
          {isPersonalized ? 'Recommandé pour vous' : 'Produits recommandés'}
        </h2>

        {error && <div style={{ color: '#D32F2F', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {loading
            ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
            : items.map((p, i) => (
                <Fragment key={p.id}>
                  <ProductCard product={p} />
                  {(i + 1) % 6 === 0 && (
                    <div style={{ gridColumn: '1 / -1' }}><AdSlot index={i} /></div>
                  )}
                </Fragment>
              ))
          }
        </div>
      </div>

      <Footer />
    </div>
  )
}