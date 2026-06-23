// BannerSlider.jsx — GROSHOP.tn

import { useState, useEffect, useRef } from 'react'
import bannerGrossiste from '../assets/banner-grossiste1.png'
const BANNERS = [
  {
    id: 1,
    bg: 'linear-gradient(135deg, #1a1aff 0%, #6B35FF 50%, #FF4580 100%)',
    tag: 'NOUVEAUTÉ',
    title: 'COMMANDEZ\nEN GROS !',
    sub: 'Livraison directe depuis les fournisseurs tunisiens',
    cta: 'Découvrir',
    ctaHref: '/produits',
    
    deco: ['#ffffff22', '#ffffff11'],
    tagColor: '#fff',
    tagBg: 'rgba(255,255,255,0.2)',
  },
  {
    id: 2,
    bg: 'linear-gradient(135deg, #FF4500 0%, #FF8C00 60%, #FFD700 100%)',
    tag: 'TOP VENTES',
    title: 'TEXTILE\n& MODE',
    sub: 'T-shirts, jeans, robes — directement du fabricant',
    cta: 'Voir les offres',
    ctaHref: '/categorie/1',
    
    deco: ['#ffffff22', '#ffffff11'],
    tagColor: '#fff',
    tagBg: 'rgba(255,255,255,0.25)',
  },
  {
  id: 3,
  bg: 'linear-gradient(135deg, #1a1aff 0%, #6B35FF 50%, #FF4580 100%)',
  tag: 'GROSHOP',
  title: 'ACHETEZ\nMOINS CHER !',
  sub: 'Des milliers de produits en gros pour les commerçants tunisiens',
  cta: 'Commander',
  ctaHref: '/produits',
  image: bannerGrossiste,
  deco: ['#ffffff22', '#ffffff11'],
  tagColor: '#fff',
  tagBg: 'rgba(255,255,255,0.2)',
}
  
  
]

export default function BannerSlider() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [imageRatios, setImageRatios] = useState({}) // { bannerId: width/height }
  const timerRef = useRef(null)

  const handleImageLoad = (bannerId, e) => {
    const { naturalWidth, naturalHeight } = e.target
    if (naturalHeight > 0) {
      setImageRatios(prev => ({ ...prev, [bannerId]: naturalWidth / naturalHeight }))
    }
  }

  const go = (idx) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent((idx + BANNERS.length) % BANNERS.length)
      setAnimating(false)
    }, 200)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => go(current + 1), 5000)
    return () => clearInterval(timerRef.current)
  }, [current])

  const b = BANNERS[current]
  const ratio = imageRatios[b.id]

  // Hauteur dynamique : si on connaît le ratio réel de l'image,
  // on calcule la hauteur exacte pour une largeur de référence ~1456px
  // (max-width courant du conteneur), bornée par les mêmes limites
  // que le slider standard pour éviter un saut trop brutal.
  const REF_WIDTH = 1456
  const dynamicHeight = ratio
    ? `clamp(160px, ${(REF_WIDTH / ratio / REF_WIDTH * 100).toFixed(2)}vw, ${Math.round(REF_WIDTH / ratio)}px)`
    : 'clamp(160px, 18vw, 240px)'

  return (
    <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      <div style={{
        position: 'relative',
        height: b.image ? dynamicHeight : 'clamp(160px, 18vw, 240px)',
        borderRadius: '14px', overflow: 'hidden',
        background: b.image ? 'linear-gradient(135deg, #1a1aff 0%, #6B35FF 50%, #FF4580 100%)' : b.bg,
        transition: 'background 0.4s ease',
        opacity: animating ? 0 : 1,
        transform: animating ? 'scale(0.99)' : 'scale(1)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        display: 'flex', alignItems: 'center',
      }}>

        {/* Image de fond — si la banner a un champ "image" */}
        {b.image && (
          <img
            src={b.image}
            alt={b.title}
            onLoad={e => handleImageLoad(b.id, e)}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', zIndex: 0,
            }}
          />
        )}

        {/* Déco géométrique fond — seulement si pas d'image */}
        {!b.image && (
          <>
            <div style={{
              position: 'absolute', top: '-40px', right: '35%',
              width: '200px', height: '200px',
              background: b.deco[0],
              transform: 'rotate(25deg)', borderRadius: '20px',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: '-60px', right: '30%',
              width: '180px', height: '180px',
              background: b.deco[1],
              transform: 'rotate(-15deg)', borderRadius: '20px',
              pointerEvents: 'none',
            }} />
          </>
        )}

        {/* Texte gauche — masqué si la banner est une image autonome */}
        {!b.image && (
        <div style={{ padding: '0 0 0 clamp(24px, 4vw, 56px)', zIndex: 2, flex: '0 0 auto', maxWidth: '38%' }}>
          <div style={{
            display: 'inline-block',
            background: b.tagBg, color: b.tagColor,
            fontSize: '10px', fontWeight: 800,
            padding: '3px 10px', borderRadius: '20px',
            letterSpacing: '1.5px', marginBottom: '10px',
            border: `1px solid ${b.tagColor}33`,
          }}>
            {b.tag}
          </div>
          <div style={{
            fontSize: 'clamp(20px, 3.5vw, 42px)',
            fontWeight: 900, color: '#fff',
            lineHeight: 1.05, letterSpacing: '-0.5px',
            whiteSpace: 'pre-line',
            textShadow: '0 2px 12px rgba(0,0,0,0.2)',
            marginBottom: '10px',
          }}>
            {b.title}
          </div>
          <div style={{
            fontSize: 'clamp(11px, 1.2vw, 14px)', color: 'rgba(255,255,255,0.82)',
            lineHeight: 1.4, marginBottom: '16px', maxWidth: '280px',
          }}>
            {b.sub}
          </div>
          <a href={b.ctaHref} style={{
            display: 'inline-block',
            background: '#fff', color: '#0F1419',
            textDecoration: 'none', fontSize: 'clamp(11px, 1.1vw, 13px)',
            fontWeight: 800, padding: 'clamp(7px, 1vw, 10px) clamp(16px, 2vw, 24px)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            {b.cta} →
          </a>
        </div>
        )}


        {/* Texte droit optionnel — seulement si pas d'image (sinon ça surcharge visuellement) */}
        {!b.image && (
          <div style={{ padding: '0 clamp(24px, 4vw, 56px) 0 0', zIndex: 2, flex: '0 0 auto', maxWidth: '26%', textAlign: 'right' }}>
            <div style={{ fontSize: 'clamp(13px, 1.6vw, 20px)', fontWeight: 700, color: '#fff', lineHeight: 1.3, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              Tout pour votre<br/>commerce en gros
            </div>
          </div>
        )}
      </div>

      {/* Flèches */}
      {['<', '>'].map((arrow, i) => (
        <button key={i} onClick={() => go(current + (i === 0 ? -1 : 1))}
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            [i === 0 ? 'left' : 'right']: '-18px',
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#fff', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: 700, color: '#0F1419',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)' }}
        >
          {arrow}
        </button>
      ))}

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => go(i)}
            style={{
              width: i === current ? '20px' : '7px', height: '7px',
              borderRadius: '4px', border: 'none', cursor: 'pointer',
              background: i === current ? '#FF4500' : '#C0C6CC',
              transition: 'all 0.25s', padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}