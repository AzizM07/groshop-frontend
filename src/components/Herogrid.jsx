// HeroGrid.jsx — GROSHOP.tn

import { useState, useEffect, useRef } from 'react'

// ── Images ────────────────────────────────────────────────────────────────────
import bannerLeft from '../assets/banner.png'  // ⬅️ depuis assets

const IMG = {
  bannerLeft,

  slides: [
    {
      image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=85',
      tag:   'Nouveautés',
      title: 'Alimentaire & Épicerie\nGrossiste Tunisie 2025',
      sub:   '+2 000 références · Prix usine direct',
      price: 'TND 1.200 / pcs',
      cta:   'Explorer le catalogue',
      href:  '/produits',
    },
    {
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=85',
      tag:   'Promo −40%',
      title: 'Mode & Textile\nMeilleurs prix du marché',
      sub:   'Cartons complets · Livraison Tunisie',
      price: 'TND 4.200 / pcs',
      cta:   'Voir les offres mode',
      href:  '/produits/textile',
    },
    {
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900&q=85',
      tag:   'Tendance',
      title: 'High-Tech & Électronique\nStock disponible',
      sub:   'Fournisseurs vérifiés · Prix grossiste',
      price: 'TND 45.000 / pcs',
      cta:   'Découvrir la sélection',
      href:  '/produits/electronique',
    },
  ],

  miniBottomLeft:  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=460&q=85',
  miniBottomRight: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=460&q=85',
  rightTop:    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=520&q=85',
  rightBottom: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=520&q=85',
}

const S = {
  zone: {
    borderRadius: '14px',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  img: {
    width: '100%', height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.5s cubic-bezier(.25,.46,.45,.94)',
  },
}

function ZoomImg({ src, alt }) {
  const [hov, setHov] = useState(false)
  return (
    <img
      src={src} alt={alt}
      style={{ ...S.img, transform: hov ? 'scale(1.05)' : 'scale(1)' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    />
  )
}

const ArrowRight = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

export default function HeroGrid() {
  const [current, setCurrent] = useState(0)
  const [anim, setAnim]       = useState(false)
  const timer = useRef(null)

  const go = (idx) => {
    if (anim) return
    setAnim(true)
    setTimeout(() => {
      setCurrent((idx + IMG.slides.length) % IMG.slides.length)
      setAnim(false)
    }, 200)
  }

  useEffect(() => {
    timer.current = setInterval(() => go(current + 1), 5000)
    return () => clearInterval(timer.current)
  }, [current])

  const slide = IMG.slides[current]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 4fr 2fr',
      gridTemplateRows: '340px 145px',
      gap: '10px',
      width: '100%',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    }}>

      {/* ── Bannière gauche depuis assets — sans overlay ── */}
      <div style={{ gridColumn: '1', gridRow: '1 / 3', ...S.zone }}>
        <ZoomImg src={IMG.bannerLeft} alt="Parfums et cosmétique grossiste" />
      </div>

      {/* ── Slider centre — sans overlay ── */}
      <div style={{
        gridColumn: '2', gridRow: '1',
        ...S.zone,
        opacity: anim ? 0 : 1,
        transition: 'opacity 0.2s',
      }}>
        <img src={slide.image} alt={`Slide ${current + 1}`} style={S.img} />

        {/* Dots */}
        <div style={{
          position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '5px', zIndex: 10,
        }}>
          {IMG.slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              style={{
                width: i === current ? '18px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === current ? '#FF4500' : 'rgba(255,255,255,.45)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width .25s, background .2s',
              }}
            />
          ))}
        </div>

        {/* Nav arrows */}
        <div style={{
          position: 'absolute', bottom: '14px', right: '14px', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '4px',
          background: 'rgba(0,0,0,.45)', borderRadius: '20px',
          padding: '5px 12px', backdropFilter: 'blur(6px)',
        }}>
          <button onClick={() => go(current - 1)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '17px', cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}>‹</button>
          <span style={{ fontSize: '12px', color: '#fff', fontWeight: 700 }}>{current + 1} / {IMG.slides.length}</span>
          <button onClick={() => go(current + 1)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '17px', cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}>›</button>
        </div>
      </div>

      {/* ── 2 mini cards bas centre — sans overlay ── */}
      <div style={{ gridColumn: '2', gridRow: '2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={S.zone}>
          <ZoomImg src={IMG.miniBottomLeft} alt="Électronique grossiste" />
        </div>
        <div style={S.zone}>
          <ZoomImg src={IMG.miniBottomRight} alt="Beauté grossiste" />
        </div>
      </div>

      {/* ── Colonne droite — sans overlay ── */}
      <div style={{ gridColumn: '3', gridRow: '1 / 3', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ ...S.zone, flex: 1 }}>
          <ZoomImg src={IMG.rightTop} alt="Alimentaire grossiste" />
        </div>
        <div style={{ ...S.zone, flex: 1 }}>
          <ZoomImg src={IMG.rightBottom} alt="Mode grossiste" />
        </div>
      </div>

    </div>
  )
}