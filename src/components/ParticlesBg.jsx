// src/components/ParticlesBg.jsx
//
// Fond de particules animées (points reliés) — canvas, zéro dépendance.
// Usage : le mettre dans un conteneur `position: relative`, et mettre le CONTENU
// de ce conteneur en `position: relative; zIndex: 1` pour qu'il passe au-dessus.
//
//   <div style={{ position: 'relative' }}>
//     <ParticlesBg />
//     <div style={{ position: 'relative', zIndex: 1 }}> …tes blocs… </div>
//   </div>
//
// Les réglages ci-dessous = les mêmes boutons que le panneau particles.js.

import { useRef, useEffect } from 'react'

export default function ParticlesBg({
  color        = '255, 94, 32', // rgb des particules (orange GROSHOP #ff5e20)
  count        = 0,             // nombre fixe ; 0 = auto selon la surface
  density      = 13000,         // px² par particule quand count = 0 (plus petit = plus dense)
  maxCount     = 90,            // plafond de sécurité (perf)
  linkDistance = 130,           // distance max pour relier deux points (px)
  speed        = 0.5,           // vitesse de déplacement
  dotSize      = 2.2,           // rayon des points (px)
  lineOpacity  = 0.32,          // opacité max des liens
  dotOpacity   = 0.75,          // opacité des points
  style,
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let W = 0, H = 0, parts = [], raf = 0

    const size = () => {
      W = parent.clientWidth
      H = parent.clientHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const seed = () => {
      const n = count > 0
        ? count
        : Math.max(20, Math.min(maxCount, Math.round((W * H) / density)))
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
      }))
    }

    const frame = () => {
      // déplacement + rebond sur les bords
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
      }
      // rendu
      ctx.clearRect(0, 0, W, H)
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i], b = parts[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < linkDistance) {
            ctx.strokeStyle = `rgba(${color}, ${(1 - d / linkDistance) * lineOpacity})`
            ctx.lineWidth = 1
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          }
        }
      }
      for (const p of parts) {
        ctx.fillStyle = `rgba(${color}, ${dotOpacity})`
        ctx.beginPath(); ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2); ctx.fill()
      }
      if (!reduce) raf = requestAnimationFrame(frame)
    }

    size(); seed(); frame()  // reduce-motion : une seule frame, pas de boucle

    // suit la taille de la bande (le contenu grandit/rétrécit selon l'écran)
    const ro = new ResizeObserver(() => {
      size(); seed()
      if (reduce) frame()
    })
    ro.observe(parent)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [color, count, density, maxCount, linkDistance, speed, dotSize, lineOpacity, dotOpacity])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    />
  )
}