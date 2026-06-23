// HeroGrid.jsx — GROSHOP.tn

import { useState, useEffect, useRef } from 'react'

// ── Images (remplace les URLs par tes assets locaux quand prêts) ──────────────
const IMG = {
  bannerLeft: 'https://images.unsplash.com/photo-1640975972263-1f73398e943b?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // import bannerLeft from '../assets/banner-left.jpg'

  slides: [
    {
      image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=85',
      // image: slide1,
      tag:   'Nouveautés',
      title: 'Alimentaire & Épicerie\nGrossiste Tunisie 2025',
      sub:   '+2 000 références · Prix usine direct',
      price: 'TND 1.200 / pcs',
      cta:   'Explorer le catalogue',
      href:  '/produits',
    },
    {
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=85',
      // image: slide2,
      tag:   'Promo −40%',
      title: 'Mode & Textile\nMeilleurs prix du marché',
      sub:   'Cartons complets · Livraison Tunisie',
      price: 'TND 4.200 / pcs',
      cta:   'Voir les offres mode',
      href:  '/produits/textile',
    },
    {
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900&q=85',
      // image: slide3,
      tag:   'Tendance',
      title: 'High-Tech & Électronique\nStock disponible',
      sub:   'Fournisseurs vérifiés · Prix grossiste',
      price: 'TND 45.000 / pcs',
      cta:   'Découvrir la sélection',
      href:  '/produits/electronique',
    },
  ],

  miniBottomLeft:  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=460&q=85',
  // miniBottomLeft: miniB1,
  miniBottomRight: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=460&q=85',
  // miniBottomRight: miniB2,

  rightTop:    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=520&q=85',
  // rightTop: miniR1,
  rightBottom: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=520&q=85',
  // rightBottom: miniR2,
}

// ── Styles partagés ───────────────────────────────────────────────────────────
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
  overlayBottom: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '18px 16px',
    background: 'linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,.15) 45%, transparent 100%)',
    pointerEvents: 'none',
  },
  miniTitle: {
    color: '#fff',
    fontSize: 'clamp(11px, 0.9vw, 13px)',
    fontWeight: 800,
    lineHeight: 1.3,
  },
  miniSub: {
    color: 'rgba(255,255,255,.78)',
    fontSize: 'clamp(9px, 0.75vw, 11px)',
    marginTop: '3px',
  },
  tagDark: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    background: '#FF4500', color: '#fff',
    fontSize: '10px', fontWeight: 900,
    padding: '4px 10px', borderRadius: '20px',
    textTransform: 'uppercase', letterSpacing: '.7px',
    width: 'fit-content', marginBottom: '10px',
  },
  tagWhite: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    background: '#fff', color: '#FF4500',
    fontSize: '10px', fontWeight: 900,
    padding: '4px 10px', borderRadius: '20px',
    textTransform: 'uppercase', letterSpacing: '.7px',
    width: 'fit-content', marginBottom: '10px',
  },
  ctaOrange: {
    display: 'inline-flex', alignItems: 'center', gap: '7px',
    background: '#FF4500', color: '#fff',
    fontSize: 'clamp(10px,.9vw,12px)', fontWeight: 800,
    padding: '9px 16px', borderRadius: '8px',
    textDecoration: 'none', width: 'fit-content',
    marginTop: '13px',
  },
  ctaWhite: {
    display: 'inline-flex', alignItems: 'center', gap: '7px',
    background: '#fff', color: '#FF4500',
    fontSize: 'clamp(10px,.9vw,12px)', fontWeight: 800,
    padding: '9px 16px', borderRadius: '8px',
    textDecoration: 'none', width: 'fit-content',
    marginTop: '13px',
  },
}

// ── Sous-composants ───────────────────────────────────────────────────────────
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

function MiniOverlay({ title, sub }) {
  return (
    <div style={S.overlayBottom}>
      <div style={S.miniTitle}>{title}</div>
      <div style={S.miniSub}>{sub}</div>
    </div>
  )
}

const ArrowRight = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

// ── Composant principal ───────────────────────────────────────────────────────
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

      {/* ── Bannière gauche : parfum/cosmétique ── */}
      <div style={{ gridColumn: '1', gridRow: '1 / 3', ...S.zone }}>
        <ZoomImg src={IMG.bannerLeft} alt="Parfums et cosmétique grossiste" />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: '22px 18px',
          background: 'linear-gradient(170deg, rgba(255,69,0,.82) 0%, rgba(180,30,0,.4) 40%, transparent 70%)',
        }}>
          <div style={S.tagWhite}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Offre flash
          </div>
          <div style={{ color: '#fff', fontSize: 'clamp(14px,1.2vw,17px)', fontWeight: 900, lineHeight: 1.25 }}>
            Parfums &amp;<br/>Cosmétique<br/>Luxe
          </div>
          <div style={{ color: 'rgba(255,255,255,.82)', fontSize: 'clamp(10px,.85vw,12px)', marginTop: '6px' }}>
            jusqu'à −55%<br/>MOQ dès 10 pcs
          </div>
          <a href="/produits/cosmetique" style={S.ctaWhite}>
            Voir les offres <ArrowRight />
          </a>
        </div>
      </div>

      {/* ── Slider centre ── */}
      <div style={{
        gridColumn: '2', gridRow: '1',
        ...S.zone,
        opacity: anim ? 0 : 1,
        transition: 'opacity 0.2s',
      }}>
        <img src={slide.image} alt={`Slide ${current + 1}`} style={S.img} />

        {/* Overlay texte */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
          padding: '28px 34px',
          background: 'linear-gradient(100deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.1) 55%, transparent 100%)',
        }}>
          <div style={S.tagDark}>{slide.tag}</div>
          <div style={{
            color: '#fff',
            fontSize: 'clamp(17px,1.8vw,24px)',
            fontWeight: 900, lineHeight: 1.2,
            whiteSpace: 'pre-line', maxWidth: '58%',
            textShadow: '0 2px 10px rgba(0,0,0,.4)',
          }}>
            {slide.title}
          </div>
          <div style={{ color: 'rgba(255,255,255,.82)', fontSize: 'clamp(11px,.9vw,13px)', marginTop: '6px' }}>
            {slide.sub}
          </div>

          {/* Price badge glassmorphism */}
          <div style={{
            display: 'inline-flex', flexDirection: 'column',
            background: 'rgba(255,255,255,.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,.3)',
            borderRadius: '10px', padding: '8px 14px',
            marginTop: '10px', width: 'fit-content',
          }}>
            <span style={{ color: 'rgba(255,255,255,.75)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>
              À partir de
            </span>
            <span style={{ color: '#fff', fontSize: 'clamp(15px,1.4vw,20px)', fontWeight: 900, lineHeight: 1, marginTop: '2px' }}>
              {slide.price}
            </span>
          </div>

          <a href={slide.href} style={S.ctaOrange}>
            {slide.cta} <ArrowRight />
          </a>
        </div>

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

      {/* ── 2 mini cards bas centre ── */}
      <div style={{ gridColumn: '2', gridRow: '2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={S.zone}>
          <ZoomImg src={IMG.miniBottomLeft} alt="Électronique grossiste" />
          <MiniOverlay title="Électronique & High-Tech" sub="Voir 340 produits →" />
        </div>
        <div style={S.zone}>
          <ZoomImg src={IMG.miniBottomRight} alt="Beauté grossiste" />
          <MiniOverlay title="Beauté & Maquillage" sub="Voir 210 produits →" />
        </div>
      </div>

      {/* ── Colonne droite ── */}
      <div style={{ gridColumn: '3', gridRow: '1 / 3', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ ...S.zone, flex: 1 }}>
          <ZoomImg src={IMG.rightTop} alt="Alimentaire grossiste" />
          <MiniOverlay title="Alimentaire & Boissons" sub="MOQ dès 12 pcs" />
        </div>
        <div style={{ ...S.zone, flex: 1 }}>
          <ZoomImg src={IMG.rightBottom} alt="Mode grossiste" />
          <MiniOverlay title="Mode & Accessoires" sub="Collections printemps 2025" />
        </div>
      </div>

    </div>
  )
}