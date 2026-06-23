// HeroRow.jsx — GROSHOP.tn
// Layout ManoMano exact : slider gauche + 2 mini cards droite + 2 bannières bas
// Images à placer dans src/assets/ :
//   hero-banner.jpg     → image de fond pleine page
//   slide1.jpg          → image slide 1 (droite du slider)
//   slide2.jpg          → image slide 2
//   slide3.jpg          → image slide 3
//   mini1.jpg           → image mini card 1
//   mini2.jpg           → image mini card 2
//   bottom1.jpg         → image bannière bas gauche
//   bottom2.jpg         → image bannière bas droite

import { useState, useEffect, useRef } from 'react'
import heroBanner from '../assets/hero-banner.jpg'

// ── Remplace les src par tes images locales ───────────────────
const SLIDES = [
  {
    bg: '#6B0F1A',
    title: 'Les meilleures\noffres en gros !',
    sub: 'Livraison directe depuis les fournisseurs tunisiens vérifiés',
    cta: 'Découvrir',
    href: '/produits',
    image: heroBanner, // remplace par import slide1 from '../assets/slide1.jpg'
  },
  {
    bg: '#0F2A6B',
    title: 'Textile\n& Mode',
    sub: 'T-shirts, jeans, robes — directement du fabricant tunisien',
    cta: 'Voir les offres',
    href: '/categorie/1',
    image: heroBanner,
  },
  {
    bg: '#0F4C2A',
    title: 'Électronique\n& High-Tech',
    sub: 'Smartphones, accessoires, audio — prix de gros garantis',
    cta: 'Commander',
    href: '/categorie/3',
    image: heroBanner,
  },
]

const MINI_CARDS = [
  {
    price: '24.50 TND',
    tag: '-35% en remise',
    tagBg: '#e53935',
    brand: 'GROSHOP',
    name: "Huile d'olive extra vierge 5L · palette x80",
    image: heroBanner, // remplace par import mini1 from '../assets/mini1.jpg'
    imageBg: '#E3F2FD',
    href: '/produit/1',
  },
  {
    title: 'Super Deals',
    tag: 'Meilleur prix',
    tagBg: '#FF4500',
    name: 'Des prix taillés pour votre commerce en gros',
    image: heroBanner, // remplace par import mini2 from '../assets/mini2.jpg'
    imageBg: '#E3F2FD',
    href: '/offres',
  },
]

const BOTTOM_BANNERS = [
  {
    bg: '#fff',
    tags: ['🎉 Super Offres'],
    title: "Jusqu'à 50% de remise !",
    sub: 'Les meilleures offres de la semaine sur tous les rayons',
    image: heroBanner, // remplace par import bottom1 from '../assets/bottom1.jpg'
    href: '/offres',
  },
  {
    bg: '#fff',
    tags: ['Textile', 'Alimentaire', 'Électronique'],
    title: 'Votre commerce en gros',
    sub: 'Tout pour approvisionner votre stock',
    image: heroBanner, // remplace par import bottom2 from '../assets/bottom2.jpg'
    href: '/categories',
  },
]

export default function HeroRow() {
  const [current, setCurrent]   = useState(0)
  const [animating, setAnimating] = useState(false)
  const timer = useRef(null)

  const go = (idx) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => { setCurrent((idx + SLIDES.length) % SLIDES.length); setAnimating(false) }, 180)
  }

  useEffect(() => {
    timer.current = setInterval(() => go(current + 1), 5000)
    return () => clearInterval(timer.current)
  }, [current])

  const s = SLIDES[current]

  return (
    <div style={{ width: '100%', position: 'relative', fontFamily: 'inherit' }}>

      {/* ══ IMAGE DE FOND PLEINE LARGEUR ══ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, borderRadius: '16px', overflow: 'hidden' }}>
        <img src={heroBanner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(244,245,247,0.82)' }} />
      </div>

      {/* ══ CONTENU ══ */}
      <div style={{ position: 'relative', zIndex: 1, padding: '16px' }}>

        {/* Row 1 — Slider + 2 mini cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '12px', marginBottom: '12px' }}>

          {/* ── Slider ── */}
          <div style={{
            position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '300px',
            opacity: animating ? 0 : 1, transform: animating ? 'scale(0.99)' : 'scale(1)',
            transition: 'opacity 0.18s, transform 0.18s',
          }}>
            {/* Image droite du slide */}
            <img src={s.image} alt="" style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '55%', objectFit: 'cover', objectPosition: 'center top' }} />
            {/* Fond couleur gauche */}
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${s.bg} 0%, ${s.bg} 48%, transparent 72%)` }} />

            {/* Contenu texte */}
            <div style={{ position: 'relative', zIndex: 2, padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', maxWidth: '55%' }}>
              <div>
                <div style={{ fontSize: 'clamp(26px, 3.2vw, 40px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-1px', whiteSpace: 'pre-line', textShadow: '0 2px 10px rgba(0,0,0,0.3)', marginBottom: '12px' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                  {s.sub}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <a href={s.href} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', color: s.bg, textDecoration: 'none', fontSize: '13px', fontWeight: 800, padding: '10px 22px', borderRadius: '9px', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', transition: 'transform 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  {s.cta} →
                </a>
                {/* Dots */}
                <div style={{ display: 'flex', gap: '5px' }}>
                  {SLIDES.map((_, i) => (
                    <button key={i} onClick={() => go(i)} style={{ width: i === current ? '18px' : '7px', height: '7px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: i === current ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.25s', padding: 0 }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Flèches */}
            {['‹', '›'].map((a, i) => (
              <button key={i} onClick={() => go(current + (i === 0 ? -1 : 1))}
                style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [i === 0 ? 'left' : 'right']: '12px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.45)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              >{a}</button>
            ))}
          </div>

          {/* ── 2 mini cards droite ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {MINI_CARDS.map((card, i) => <MiniCard key={i} card={card} />)}
          </div>
        </div>

        {/* Row 2 — 2 bannières bas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {BOTTOM_BANNERS.map((b, i) => <BottomBanner key={i} b={b} />)}
        </div>

      </div>
    </div>
  )
}

// ── MiniCard ──────────────────────────────────────────────────────
function MiniCard({ card }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={card.href} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ flex: 1, borderRadius: '14px', background: '#fff', border: `1px solid ${hov ? '#ddd' : '#eee'}`, boxShadow: hov ? '0 6px 20px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.06)', textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '16px 18px', gap: '14px', transition: 'all 0.18s', overflow: 'hidden' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {card.tag && <div style={{ display: 'inline-block', background: card.tagBg, color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 9px', borderRadius: '5px', marginBottom: '7px' }}>{card.tag}</div>}
        {card.price && <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F1419', lineHeight: 1, marginBottom: '3px' }}>{card.price}</div>}
        {card.title && <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F1419', marginBottom: '4px' }}>{card.title}</div>}
        {card.brand && <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F1419', marginBottom: '3px' }}>{card.brand}</div>}
        <div style={{ fontSize: '12px', color: '#6B7785', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{card.name}</div>
      </div>
      <div style={{ width: '90px', height: '90px', borderRadius: '10px', background: card.imageBg || '#F4F5F7', flexShrink: 0, overflow: 'hidden', transform: hov ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.2s' }}>
        <img src={card.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </a>
  )
}

// ── BottomBanner ──────────────────────────────────────────────────
function BottomBanner({ b }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={b.href} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderRadius: '14px', background: b.bg, border: `1px solid ${hov ? '#ddd' : '#eee'}`, boxShadow: hov ? '0 6px 20px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.05)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', gap: '16px', transition: 'all 0.18s', overflow: 'hidden', height: '115px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {b.tags.map((t, i) => (
            <span key={i} style={{ display: 'inline-block', background: '#FFF3EE', color: '#FF4500', border: '1px solid #FFD0BC', fontSize: '10px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px' }}>{t}</span>
          ))}
        </div>
        <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F1419', lineHeight: 1.2, letterSpacing: '-0.3px', marginBottom: '4px' }}>{b.title}</div>
        <div style={{ fontSize: '12px', color: '#6B7785', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{b.sub}</div>
      </div>
      <div style={{ width: '110px', height: '85px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, transform: hov ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.25s' }}>
        <img src={b.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </a>
  )
}