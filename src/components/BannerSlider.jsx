// BannerSlider.jsx — GROSHOP.tn
//
// Barre du bas : slides pilotés depuis l'admin (zone "bottom_slider").
// Disposition figée. Aucun fallback — n'affiche QUE ce qui est configuré.

import { useState, useEffect, useRef } from 'react'

const BOTTOM_ZONE = 'bottom_slider'
const API_BASE = import.meta.env.VITE_API_URL || ''

export default function BannerSlider() {
  const [banners, setBanners] = useState([])
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [imageRatios, setImageRatios] = useState({}) // { bannerId: width/height }
  const timerRef = useRef(null)

  // ── Charge les slides depuis l'admin (endpoint public) ──
  useEffect(() => {
    let alive = true
    fetch(`${API_BASE}/api/banners/active/`)
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || [])
        const slides = list
          .filter(b => b.zone === BOTTOM_ZONE && b.is_active && b.image_url)
          .sort((a, b) => a.position - b.position)
          .map(b => ({ id: b.id, image: b.image_url, ctaHref: b.link || '' }))
        if (alive) { setBanners(slides); setCurrent(0) }
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

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
      setCurrent((idx + banners.length) % banners.length)
      setAnimating(false)
    }, 200)
  }

  useEffect(() => {
    if (banners.length <= 1) return
    timerRef.current = setInterval(() => go(current + 1), 5000)
    return () => clearInterval(timerRef.current)
  }, [current, banners.length])

  // Rien de configuré → on n'affiche pas la barre
  if (!banners.length) return null

  const b = banners[current]
  const ratio = imageRatios[b.id]

  // Hauteur dynamique : si on connaît le ratio réel de l'image,
  // on calcule la hauteur exacte pour une largeur de référence ~1456px.
  const REF_WIDTH = 1456
  const dynamicHeight = ratio
    ? `clamp(160px, ${(REF_WIDTH / ratio / REF_WIDTH * 100).toFixed(2)}vw, ${Math.round(REF_WIDTH / ratio)}px)`
    : 'clamp(160px, 18vw, 240px)'

  return (
    <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      <div style={{
        position: 'relative',
        height: dynamicHeight,
        borderRadius: '14px', overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1aff 0%, #6B35FF 50%, #FF4580 100%)',
        opacity: animating ? 0 : 1,
        transform: animating ? 'scale(0.99)' : 'scale(1)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        display: 'flex', alignItems: 'center',
      }}>

        {/* Image du slide */}
        <img
          src={b.image}
          alt=""
          onLoad={e => handleImageLoad(b.id, e)}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', zIndex: 0,
          }}
        />

        {/* Lien cliquable sur toute la surface */}
        {b.ctaHref && (
          <a
            href={b.ctaHref}
            aria-label="Ouvrir la bannière"
            style={{ position: 'absolute', inset: 0, zIndex: 3 }}
          />
        )}
      </div>

      {/* Flèches — seulement s'il y a plus d'un slide */}
      {banners.length > 1 && ['<', '>'].map((arrow, i) => (
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
      {banners.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
          {banners.map((_, i) => (
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
      )}
    </div>
  )
}