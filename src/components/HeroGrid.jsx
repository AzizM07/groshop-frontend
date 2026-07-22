// HeroGrid.jsx — GROSHOP.tn

import { useState, useEffect, useRef } from 'react'

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  orange: '#ff5e20',
  blue:   '#1a1aff',
  purple: '#6B35FF',
  pink:   '#FF4580',
}

// ── Images ────────────────────────────────────────────────────────────────────
// Visuels Unsplash choisis pour leur dominante chromatique (licence libre).
// Pour les héberger toi-même : télécharge-les et remplace par
//   import heroElectro from '../assets/hero-electro.jpg'
const U = (id, w) => `https://images.unsplash.com/photo-${id}?w=${w}&q=85&auto=format&fit=crop`

const IMG = {
  slides: [
    {
      // LED bleues et violettes
      image: U('1546640646-89b557854b23', 1600),
      tag:   'Électronique',
      title: 'High-Tech en gros',
      sub:   'Fournisseurs vérifiés · Prix grossiste',
      cta:   'Voir le catalogue',
      href:  '/produits/electronique',
      tint:  [C.blue, C.purple],
    },
    {
      // Particules néon roses et violettes
      image: U('1563089145-599997674d42', 1600),
      tag:   'Promo −40%',
      title: 'Mode & Textile',
      sub:   'Cartons complets · Livraison Tunisie',
      cta:   'Voir les offres',
      href:  '/produits/textile',
      tint:  [C.purple, C.pink],
    },
    {
      // Fond orange abstrait à vagues
      image: U('1707324148764-99647364afa3', 1600),
      tag:   'Nouveautés',
      title: 'Alimentaire & Épicerie',
      sub:   '+2 000 références · Prix usine direct',
      cta:   'Explorer',
      href:  '/produits',
      tint:  [C.orange, C.pink],
    },
  ],

  cards: [
    {
      // Enseigne néon rose
      image: U('1572314961011-aece24e1cc48', 900),
      tag:   'Nouveautés',
      title: 'Beauté & soin',
      href:  '/produits/beaute',
      tint:  [C.purple, C.pink],
    },
    {
      // Dégradé orange et rouge ondulé
      image: U('1530669244764-0909211cd8e8', 900),
      tag:   'Nouveautés',
      title: 'Papeterie & bureau',
      href:  '/produits/papeterie',
      tint:  [C.orange, C.pink],
    },
  ],
}

function hexA(hex, alpha) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

// Voile léger : les photos étant déjà dans la palette, il sert uniquement
// à garantir la lisibilité du texte à gauche.
const scrim = ([from, to]) =>
  `linear-gradient(100deg, ${hexA(from, 0.86)} 0%, ${hexA(from, 0.58)} 32%, ${hexA(to, 0.24)} 60%, ${hexA(to, 0)} 100%)`

const S = {
  zone: {
    position: 'relative',
    borderRadius: '14px',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  img: {
    position: 'absolute',
    inset: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.6s cubic-bezier(.25,.46,.45,.94)',
  },
  veil: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
}

const ArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

// ── Carte de la colonne droite ────────────────────────────────────────────────
function SideCard({ data }) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={data.href}
      style={{ ...S.zone, display: 'block', textDecoration: 'none' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <img
        src={data.image}
        alt={data.title}
        style={{ ...S.img, transform: hov ? 'scale(1.06)' : 'scale(1)' }}
      />
      <div style={{ ...S.veil, background: scrim(data.tint) }} />

      <div style={{
        position: 'absolute',
        left: '26px', top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        maxWidth: '70%',
      }}>
        <div style={{
          fontSize: '10px',
          letterSpacing: '1.8px',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: '#fff',
          opacity: 0.9,
        }}>
          {data.tag}
        </div>
        <div style={{
          fontSize: '19px',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '-0.2px',
          marginTop: '7px',
          lineHeight: 1.2,
          textShadow: '0 1px 12px rgba(0,0,0,.25)',
        }}>
          {data.title}
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11.5px',
          color: '#fff',
          marginTop: '14px',
          opacity: hov ? 1 : 0.85,
          transition: 'opacity .2s',
        }}>
          Découvrir <ArrowRight />
        </div>
      </div>
    </a>
  )
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function HeroGrid() {
  const [current, setCurrent] = useState(0)
  const [anim, setAnim] = useState(false)
  const [hovHero, setHovHero] = useState(false)
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
      gridTemplateColumns: '2fr 1fr',
      gap: '10px',
      width: '100%',
      height: '540px',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    }}>

      {/* ── Hero slider gauche ── */}
      <div
        style={S.zone}
        onMouseEnter={() => setHovHero(true)}
        onMouseLeave={() => setHovHero(false)}
      >
        <img
          src={slide.image}
          alt={slide.title}
          style={{
            ...S.img,
            transform: hovHero ? 'scale(1.04)' : 'scale(1)',
            opacity: anim ? 0 : 1,
            transition: 'transform .6s cubic-bezier(.25,.46,.45,.94), opacity .2s',
          }}
        />
        <div style={{
          ...S.veil,
          background: scrim(slide.tint),
          opacity: anim ? 0.6 : 1,
          transition: 'opacity .2s',
        }} />

        <div style={{
          position: 'absolute',
          left: '48px', top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          maxWidth: '52%',
          opacity: anim ? 0 : 1,
          transition: 'opacity .2s',
        }}>
          <div style={{
            fontSize: '11px',
            letterSpacing: '2.4px',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: '#fff',
            opacity: 0.85,
          }}>
            {slide.tag}
          </div>

          <h1 style={{
            fontSize: '40px',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.8px',
            lineHeight: 1.12,
            margin: '10px 0 0 0',
            textShadow: '0 2px 18px rgba(0,0,0,.22)',
          }}>
            {slide.title}
          </h1>

          <p style={{
            fontSize: '13.5px',
            color: 'rgba(255,255,255,.85)',
            margin: '12px 0 0 0',
          }}>
            {slide.sub}
          </p>

          <a
            href={slide.href}
            style={{
              display: 'inline-block',
              marginTop: '26px',
              background: '#fff',
              color: '#0F1419',
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '1.6px',
              textTransform: 'uppercase',
              padding: '14px 26px',
              borderRadius: '4px',
              textDecoration: 'none',
              transition: 'transform .2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {slide.cta}
          </a>
        </div>

        {/* Pastille de navigation — bas centre */}
        <div style={{
          position: 'absolute',
          bottom: '22px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#fff',
          borderRadius: '24px',
          padding: '9px 16px',
          boxShadow: '0 4px 16px rgba(0,0,0,.14)',
        }}>
          <button
            onClick={() => go(current - 1)}
            aria-label="Précédent"
            style={{ background: 'none', border: 'none', color: '#6B7785', fontSize: '17px', cursor: 'pointer', padding: 0, lineHeight: 1 }}
          >
            ‹
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {IMG.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === current ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === current ? C.orange : '#D3D6DA',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'width .25s, background .2s',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => go(current + 1)}
            aria-label="Suivant"
            style={{ background: 'none', border: 'none', color: '#6B7785', fontSize: '17px', cursor: 'pointer', padding: 0, lineHeight: 1 }}
          >
            ›
          </button>
        </div>
      </div>

      {/* ── Colonne droite : deux cartes empilées ── */}
      <div style={{
        display: 'grid',
        gridTemplateRows: '1fr 1fr',
        gap: '10px',
        minHeight: 0,
      }}>
        {IMG.cards.map((card, i) => (
          <SideCard key={i} data={card} />
        ))}
      </div>

    </div>
  )
}