// src/components/HeroGrid.jsx
import { useState, useEffect, useRef } from 'react'

// ── Palette ──────────────────────────────────────────────────────
const C = {
  orange: '#ff5e20',
  blue:   '#1a1aff',
  purple: '#6B35FF',
  pink:   '#FF4580',
}

// ── Helpers ──────────────────────────────────────────────────────
function hexA(hex, alpha) {
  const clean = (hex || '').replace('#', '')
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return 'rgba(0,0,0,0)'
  const n = parseInt(clean, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

const scrim = (from, to) => {
  if (!from && !to) return 'none'
  return `linear-gradient(100deg, ${hexA(from, 0.86)} 0%, ${hexA(from, 0.58)} 32%, ${hexA(to, 0.24)} 60%, ${hexA(to, 0)} 100%)`
}

const S = {
  zone: { position: 'relative', borderRadius: '14px', overflow: 'hidden', width: '100%', height: '100%' },
  img: {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover', display: 'block',
    transition: 'transform 0.6s cubic-bezier(.25,.46,.45,.94), opacity .2s',
  },
  veil: { position: 'absolute', inset: 0, pointerEvents: 'none' },
}

const ArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

const ChevronLeft = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronRight = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

// ── Extrait la liste d'images utilisables d'une bannière ─────────
function imagesOf(data) {
  const list = (data.images && data.images.length ? data.images : [data.image_url]).filter(Boolean)
  return list
}

// ── Hook générique : carrousel auto-rotatif avec transition ──────
function usePastilleCarousel(length, intervalMs = 5000) {
  const [current, setCurrent] = useState(0)
  const [anim, setAnim] = useState(false)
  const timer = useRef(null)

  const go = (idx) => {
    if (anim || length <= 1) return
    setAnim(true)
    setTimeout(() => {
      setCurrent((idx + length) % length)
      setAnim(false)
    }, 200)
  }

  useEffect(() => {
    if (length <= 1) return
    timer.current = setInterval(() => go(current + 1), intervalMs)
    return () => clearInterval(timer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, length])

  // borne current si la longueur diminue (ex: images retirées en admin)
  useEffect(() => {
    if (current >= length && length > 0) setCurrent(0)
  }, [length, current])

  return { current, anim, go }
}

const pastilleArrowBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '18px',
  height: '18px',
  background: 'none',
  border: 'none',
  color: '#6B7785',
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
}

// ── Pastille de navigation réutilisable (hero et cartes) ─────────
function Pastille({ count, current, go, compact = false }) {
  if (count <= 1) return null
  const stop = (fn) => (e) => { e.preventDefault(); e.stopPropagation(); fn() }
  return (
    <div style={{
      position: 'absolute',
      bottom: compact ? '12px' : '22px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      gap: compact ? '8px' : '12px',
      background: '#fff',
      borderRadius: '24px',
      padding: compact ? '5px 10px' : '9px 16px',
      boxShadow: '0 4px 16px rgba(0,0,0,.14)',
    }}>
      <button onClick={stop(() => go(current - 1))} aria-label="Précédent" style={pastilleArrowBtn}>
        <ChevronLeft size={compact ? 12 : 14} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {Array.from({ length: count }).map((_, i) => (
          <button key={i} onClick={stop(() => go(i))} aria-label={`Slide ${i + 1}`}
            style={{
              width: i === current ? (compact ? '14px' : '18px') : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i === current ? C.orange : '#D3D6DA',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'width .25s, background .2s',
            }} />
        ))}
      </div>
      <button onClick={stop(() => go(current + 1))} aria-label="Suivant" style={pastilleArrowBtn}>
        <ChevronRight size={compact ? 12 : 14} />
      </button>
    </div>
  )
}

// ── Carte générique (side_card, three_cards, etc.) ────────────────
// Devient elle-même un carrousel avec pastille dès qu'elle a plus d'une image.
function BannerCard({ data, isHero = false }) {
  const [hov, setHov] = useState(false)
  const images = imagesOf(data)
  const { current, anim, go } = usePastilleCarousel(images.length, 4500)
  const activeImg = images[current] ?? images[0]

  return (
    <a
      href={data.link || '#'}
      style={{ ...S.zone, display: 'block', textDecoration: 'none' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <img
        src={activeImg}
        alt={data.title}
        style={{ ...S.img, transform: hov ? 'scale(1.06)' : 'scale(1)', opacity: anim ? 0 : 1 }}
      />
      <div style={{ ...S.veil, background: scrim(data.tint_from, data.tint_to) }} />
      <div style={{
        position: 'absolute',
        left: isHero ? '48px' : '26px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        maxWidth: isHero ? '52%' : '70%',
      }}>
        {data.tag && (
          <div style={{
            fontSize: isHero ? '11px' : '10px',
            letterSpacing: isHero ? '2.4px' : '1.8px',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: '#fff',
            opacity: 0.85,
          }}>
            {data.tag}
          </div>
        )}
        <div style={{
          fontSize: isHero ? '40px' : '19px',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '-0.2px',
          marginTop: isHero ? '10px' : '7px',
          lineHeight: isHero ? 1.12 : 1.2,
          textShadow: '0 1px 12px rgba(0,0,0,.25)',
        }}>
          {data.title}
        </div>
        {isHero && data.subtitle && (
          <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,.85)', margin: '12px 0 0 0' }}>
            {data.subtitle}
          </p>
        )}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11.5px',
          color: '#fff',
          marginTop: isHero ? '26px' : '14px',
          opacity: hov ? 1 : 0.85,
          transition: 'opacity .2s',
        }}>
          {data.cta_label || 'Découvrir'} <ArrowRight />
        </div>
      </div>

      <Pastille count={images.length} current={current} go={go} compact={!isHero} />
    </a>
  )
}

// ── HeroSlider ─────────────────────────────────────────────────────
// `banners` = liste des bannières hero_slider. On aplatit toutes leurs
// images en une seule séquence de slides, chacune gardant les métadonnées
// (titre, tag, lien...) de sa bannière d'origine.
function flattenImages(banners) {
  const out = []
  banners.forEach((b) => {
    const imgs = imagesOf(b)
    imgs.forEach((url) => out.push({ ...b, image_url: url }))
  })
  return out
}

function HeroSlider({ banners }) {
  const [hovHero, setHovHero] = useState(false)
  const slides = flattenImages(banners)
  const { current, anim, go } = usePastilleCarousel(slides.length, 5000)
  const slide = slides[current] ?? slides[0]

  if (!slide) return null

  return (
    <div style={S.zone} onMouseEnter={() => setHovHero(true)} onMouseLeave={() => setHovHero(false)}>
      <img
        src={slide.image_url}
        alt={slide.title}
        style={{ ...S.img, transform: hovHero ? 'scale(1.04)' : 'scale(1)', opacity: anim ? 0 : 1 }}
      />
      <div style={{ ...S.veil, background: scrim(slide.tint_from, slide.tint_to), opacity: anim ? 0.6 : 1, transition: 'opacity .2s' }} />

      <div style={{
        position: 'absolute', left: '48px', top: '50%', transform: 'translateY(-50%)',
        zIndex: 2, maxWidth: '52%', opacity: anim ? 0 : 1, transition: 'opacity .2s',
      }}>
        {slide.tag && (
          <div style={{ fontSize: '11px', letterSpacing: '2.4px', textTransform: 'uppercase', fontWeight: 600, color: '#fff', opacity: 0.85 }}>
            {slide.tag}
          </div>
        )}
        <h1 style={{
          fontSize: '40px', fontWeight: 700, color: '#fff', letterSpacing: '-0.8px',
          lineHeight: 1.12, margin: '10px 0 0 0', textShadow: '0 2px 18px rgba(0,0,0,.22)',
        }}>
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,.85)', margin: '12px 0 0 0' }}>
            {slide.subtitle}
          </p>
        )}
        <a
          href={slide.link || '#'}
          style={{
            display: 'inline-block', marginTop: '26px', background: '#fff', color: '#0F1419',
            fontSize: '11.5px', fontWeight: 700, letterSpacing: '1.6px', textTransform: 'uppercase',
            padding: '14px 26px', borderRadius: '4px', textDecoration: 'none', transition: 'transform .2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {slide.cta_label || 'Découvrir'}
        </a>
      </div>

      <Pastille count={slides.length} current={current} go={go} />
    </div>
  )
}

// ── Composant principal ─────────────────────────────────────────
export default function HeroGrid() {
  const [heroBanners, setHeroBanners] = useState([])
  const [sideCards, setSideCards] = useState([])
  const [layout, setLayout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    Promise.all([
      fetch(`${API_URL}/api/layout/active/`).then(r => {
        if (!r.ok) throw new Error(`Layout API error: ${r.status}`)
        return r.json()
      }),
      fetch(`${API_URL}/api/banners/active/`).then(r => {
        if (!r.ok) throw new Error(`Banners API error: ${r.status}`)
        return r.json()
      }),
    ]).then(([layoutData, banners]) => {
      setLayout(layoutData)
      setHeroBanners(banners.filter(b => b.zone === 'hero_slider'))
      setSideCards(banners.filter(b => b.zone === 'side_card'))
      setLoading(false)
    }).catch(err => {
      console.error('HeroGrid loading error:', err)
      setError(err.message)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div style={{ height: 540, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7785' }}>Chargement…</div>
  }

  if (error) {
    return (
      <div style={{ height: 540, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6B7785', textAlign: 'center', padding: 20 }}>
        <p>Impossible de charger les bannières.</p>
        <p style={{ fontSize: 12, color: '#999' }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '8px 20px', background: '#ff5e20', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Réessayer</button>
      </div>
    )
  }

  if (heroBanners.length === 0 && sideCards.length === 0) {
    return (
      <div style={{ height: 540, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7785', border: '1px dashed #ddd', borderRadius: 14 }}>
        Aucune bannière active. Configurez‑en dans l'administration.
      </div>
    )
  }

  const layoutCode = layout?.code || 'two_cards'
  // slide "représentative" pour les layouts qui mélangent hero + cartes (three_cards, two_rows, one_big...)
  const heroAsCard = heroBanners[0]

  if (layoutCode === 'two_cards') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', width: '100%', height: '540px' }}>
        <HeroSlider banners={heroBanners} />
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '10px' }}>
          {sideCards.slice(0, 2).map((card, i) => <BannerCard key={card.id ?? i} data={card} isHero={false} />)}
        </div>
      </div>
    )
  }

  if (layoutCode === 'three_cards') {
    const allCards = [heroAsCard, ...sideCards].filter(Boolean).slice(0, 3)
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', width: '100%', height: '540px' }}>
        {allCards.map((card, i) => <BannerCard key={card.id ?? i} data={card} isHero={i === 0} />)}
      </div>
    )
  }

  if (layoutCode === 'full_width') {
    const extra = sideCards.slice(0, 3)
    return (
      <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '10px', width: '100%', height: '540px' }}>
        <HeroSlider banners={heroBanners} />
        {extra.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(extra.length, 3)}, 1fr)`, gap: '10px' }}>
            {extra.map((card, i) => <BannerCard key={card.id ?? i} data={card} isHero={false} />)}
          </div>
        )}
      </div>
    )
  }

  if (layoutCode === 'two_rows') {
    const all = [heroAsCard, ...sideCards].filter(Boolean).slice(0, 4)
    const row1 = all.slice(0, 2)
    const row2 = all.slice(2, 4)
    return (
      <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '10px', width: '100%', height: '540px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {row1.map((card, i) => <BannerCard key={card.id ?? i} data={card} isHero={i === 0} />)}
        </div>
        {row2.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {row2.map((card, i) => <BannerCard key={card.id ?? i} data={card} isHero={false} />)}
          </div>
        )}
      </div>
    )
  }

  if (layoutCode === 'one_big') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '10px', width: '100%', height: '540px' }}>
        <HeroSlider banners={heroBanners} />
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '10px' }}>
          {sideCards.slice(0, 2).map((card, i) => <BannerCard key={card.id ?? i} data={card} isHero={false} />)}
        </div>
      </div>
    )
  }

  // Fallback
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', width: '100%', height: '540px' }}>
      <HeroSlider banners={heroBanners} />
      <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '10px' }}>
        {sideCards.slice(0, 2).map((card, i) => <BannerCard key={card.id ?? i} data={card} isHero={false} />)}
      </div>
    </div>
  )
}