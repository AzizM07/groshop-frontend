// src/components/ParticlesBg.jsx
//
// Fond de particules animées — canvas, zéro dépendance.
// Usage : le mettre dans un conteneur `position: relative`, et mettre le CONTENU
// de ce conteneur en `position: relative; zIndex: 1` pour qu'il passe au-dessus.
//
//   <div style={{ position: 'relative' }}>
//     <ParticlesBg links={false} direction="bottom-left" />
//     <div style={{ position: 'relative', zIndex: 1 }}> …tes blocs… </div>
//   </div>
//
// Les réglages ci-dessous = les mêmes boutons que le panneau particles.js.

import { useRef, useEffect } from 'react'

// Vecteurs de dérive (repère écran : y vers le bas), comme move.direction de particles.js
const DIRECTIONS = {
  none:           [0, 0],
  top:            [0, -1],
  'top-right':    [1, -1],
  right:          [1, 0],
  'bottom-right': [1, 1],
  bottom:         [0, 1],
  'bottom-left':  [-1, 1],
  left:           [-1, 0],
  'top-left':     [-1, -1],
}

export default function ParticlesBg({
  color        = '255, 94, 32', // rgb des particules (orange GROSHOP #ff5e20)
  count        = 0,             // nombre fixe ; 0 = auto selon la surface
  density      = 13000,         // px² par particule quand count = 0 (plus petit = plus dense)
  maxCount     = 90,            // plafond de sécurité (perf)
  linkDistance = 130,           // distance max pour relier deux points (px)
  links        = true,          // false = juste les cercles, sans les traits reliés
  direction    = 'none',        // 'none' | 'bottom-left' | 'top' | … (voir DIRECTIONS)
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

    // Direction de dérive (0,0 = aucune → mouvement aléatoire avec rebond)
    const dir = DIRECTIONS[direction] || [0, 0]
    const directed = dir[0] !== 0 || dir[1] !== 0
    const norm = (dir[0] !== 0 && dir[1] !== 0) ? Math.SQRT1_2 : 1  // diagonale pas plus rapide

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
      parts = Array.from({ length: n }, () => {
        if (directed) {
          // dérive commune + léger jitter pour que ce ne soit pas parfaitement uniforme
          const j = speed * 0.35
          return {
            x: Math.random() * W,
            y: Math.random() * H,
            vx: dir[0] * norm * speed + (Math.random() - 0.5) * j,
            vy: dir[1] * norm * speed + (Math.random() - 0.5) * j,
          }
        }
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
        }
      })
    }

    const frame = () => {
      const m = dotSize + 1
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy
        if (directed) {
          // wrap-around : ressort du côté opposé (comme particles.js en mode direction)
          if (p.x < -m) p.x = W + m; else if (p.x > W + m) p.x = -m
          if (p.y < -m) p.y = H + m; else if (p.y > H + m) p.y = -m
        } else {
          // rebond sur les bords
          if (p.x < 0 || p.x > W) p.vx *= -1
          if (p.y < 0 || p.y > H) p.vy *= -1
        }
      }

      ctx.clearRect(0, 0, W, H)

      if (links) {
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
      }

      for (const p of parts) {
        ctx.fillStyle = `rgba(${color}, ${dotOpacity})`
        ctx.beginPath(); ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2); ctx.fill()
      }

      if (!reduce) raf = requestAnimationFrame(frame)
    }

    size(); seed(); frame()  // reduce-motion : une seule frame, pas de boucle

    const ro = new ResizeObserver(() => {
      size(); seed()
      if (reduce) frame()
    })
    ro.observe(parent)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [color, count, density, maxCount, linkDistance, links, direction, speed, dotSize, lineOpacity, dotOpacity])

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