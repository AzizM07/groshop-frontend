// src/components/MobileHome.jsx
import { useState, useEffect, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { products as productsApi } from '../lib/api'
import ProductCard from '../components/ProductCard'
import CategorySection from '../components/CategorySection'
import Footer from '../components/Footer'
import AdSlot from '../components/AdSlot'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const HEADER_H = 56  // hauteur du MobileHeader fixe — les onglets se collent juste dessous

// ── Onglets sticky sous la barre de recherche (style AliExpress) ──
function StickyTabs() {
  const [cats, setCats] = useState([])
  useEffect(() => {
    productsApi.categories().then(d => setCats((d || []).slice(0, 10))).catch(() => {})
  }, [])

  const tabs = [
    { id: 'pour-vous', name: 'Pour vous', to: '/', active: true },
    ...cats.map(c => ({ id: String(c.id), name: c.name, to: `/search?cat=${c.id}` })),
  ]

  return (
    <div style={{
      position: 'sticky', top: HEADER_H, zIndex: 900,
      background: '#fff', borderBottom: '1px solid #F0F0F0',
      display: 'flex', gap: 20, overflowX: 'auto', padding: '0 14px',
      WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
    }}>
      {tabs.map(t => (
        <Link key={t.id} to={t.to}
          style={{
            flexShrink: 0, textDecoration: 'none', whiteSpace: 'nowrap',
            padding: '13px 2px', position: 'relative',
            fontSize: 15, fontWeight: t.active ? 800 : 500,
            color: t.active ? '#0F1419' : '#8A94A0',
          }}>
          {t.name}
          {t.active && (
            <span style={{ position: 'absolute', left: 0, right: 0, bottom: 6, height: 3, borderRadius: 3, background: '#FF4500' }} />
          )}
        </Link>
      ))}
    </div>
  )
}

// ── Raccourcis (adaptation B2B des icônes AliExpress) ────────────
const ICONS = {
  tag:   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  new:   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 14.2 8.6 21 9 15.5 13.2 17.5 20 12 16 6.5 20 8.5 13.2 3 9 9.8 8.6 12 2"/></svg>,
  quote: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>,
  shield:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
}
const SHORTCUTS = [
  { label: 'Meilleures offres', to: '/produits', bg: '#FFF0E9', color: '#FF4500', icon: 'tag' },
  { label: 'Nouveautés',        to: '/produits', bg: '#EAF7F0', color: '#0F9D58', icon: 'new' },
  { label: 'Demander un devis', to: '/devis',    bg: '#EAF0FE', color: '#1668FF', icon: 'quote' },
  { label: 'Vérifiés',          to: '/produits', bg: '#F3EAFE', color: '#7C3AED', icon: 'shield' },
]
function Shortcuts() {
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '14px 12px 4px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
      {SHORTCUTS.map(s => (
        <Link key={s.label} to={s.to} style={{ flex: '0 0 72px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <span style={{ width: 48, height: 48, borderRadius: '50%', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {ICONS[s.icon]}
          </span>
          <span style={{ fontSize: 11, color: '#3D4853', textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
        </Link>
      ))}
    </div>
  )
}

// ── Hero promo (une bannière carrousel) ──────────────────────────
const SLIDES = [
  { image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80', tag: 'Nouveautés', title: 'Grossiste Tunisie 2025',     href: '/produits' },
  { image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80', tag: 'Promo −40%',  title: 'Mode & Textile',           href: '/produits/textile' },
  { image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80', tag: 'Tendance',    title: 'High-Tech & Électronique', href: '/produits/electronique' },
]
function MobileHero() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI(p => (p + 1) % SLIDES.length), 4500)
    return () => clearInterval(t)
  }, [])
  const s = SLIDES[i]
  return (
    <a href={s.href} style={{ display: 'block', margin: '10px 12px 0', borderRadius: 14, overflow: 'hidden', position: 'relative', textDecoration: 'none' }}>
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

      <StickyTabs />
      <Shortcuts />
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