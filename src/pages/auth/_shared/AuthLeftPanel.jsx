import { useState, useEffect } from 'react'
import { C, SLIDES } from './constants'

export default function AuthLeftPanel() {
  // Supprime la première image
  const slides = SLIDES.slice(0)

  const [slide, setSlide] = useState(0)

  // Défilement automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setSlide(prev => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <>
      {/* ── PANNEAU GAUCHE ── */}
      <div
        className="lg-left"
        style={{
          width: '50%',
          flexShrink: 0,
          position: 'relative',
          display: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${slides[slide].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'all 0.7s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)',
            }}
          />
        </div>

        {/* Logo */}
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: 28,
            right: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          <span
            style={{
              color: '#fff',
              fontWeight: 900,
              fontSize: 20,
            }}
          >
            GROSHOP<span style={{ color: '#fb923c' }}>.tn</span>
          </span>
        </div>

        {/* Infos fournisseur */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0 32px 32px',
            zIndex: 10,
          }}
        >
          
          {/* Indicateurs */}
          <div
            style={{
              display: 'flex',
              gap: 7,
            }}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                style={{
                  height: 5,
                  borderRadius: 3,
                  border: 'none',
                  cursor: 'pointer',
                  width: i === slide ? 22 : 7,
                  background:
                    i === slide
                      ? C.primary
                      : 'rgba(255,255,255,0.30)',
                  transition: 'all 0.3s',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── WAVE SÉPARATEUR ── */}
      <div
        className="lg-wave"
        style={{
          display: 'none',
          position: 'absolute',
          top: 0,
          left: 'calc(50% - 200px)',
          width: 360,
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 360 1000"
          preserveAspectRatio="none"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        >
          <path
            d="M150,0 C180,80 190,150 190,230 C190,420 80,540 60,680 C50,800 100,930 130,1000 L360,1000 L360,0 Z"
            fill="white"
          />
        </svg>
      </div>
    </>
  )
}