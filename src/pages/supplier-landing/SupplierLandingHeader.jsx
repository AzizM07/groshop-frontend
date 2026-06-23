// src/pages/supplier-landing/SupplierLandingHeader.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../auth/_shared/constants'

import LOGO_SRC from '../../assets/logo2.png'

export default function SupplierLandingHeader() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(hash) {
    const el = document.querySelector(hash)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <style>{`
        .sh-nav {
          transition: color 0.18s ease;
          cursor: pointer;
          position: relative;
        }
        .sh-nav:hover { color: #fff !important; }
        .sh-nav::after {
          content: '';
          position: absolute;
          bottom: -22px;
          left: 0;
          right: 0;
          height: 2px;
          background: ${C.primary};
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.25s ease;
        }
        .sh-nav:hover::after { transform: scaleX(1); }

        .sh-underline { transition: opacity 0.18s ease; cursor: pointer; }
        .sh-underline:hover { opacity: 0.75; }

        .sh-login { transition: color 0.18s ease; cursor: pointer; }
        .sh-login:hover { color: ${C.primary} !important; }

        .sh-cta {
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .sh-cta::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          transition: left 0.6s ease;
        }
        .sh-cta:hover {
          background: ${C.primaryDark} !important;
        }
        .sh-cta:hover::before { left: 100%; }

        .sh-lang {
          transition: all 0.18s ease;
          cursor: pointer;
        }
        .sh-lang:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.60) !important;
        }

        .sh-logo { transition: transform 0.25s ease; }
        .sh-logo:hover { transform: scale(1.04); }
      `}</style>

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(0,0,0,0.80)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        height: 64,
        display: 'flex', alignItems: 'stretch',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease',
      }}>
        {/* ── BLOC PRINCIPAL ── */}
        <div style={{
          flex: 1,
          display: 'flex', alignItems: 'center',
          padding: '0 32px',
          gap: 44,
        }}>
          {/* ── Logo ── */}
          <button
            onClick={() => navigate('/')}
            className="sh-logo"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, height: 36,
              display: 'flex', alignItems: 'center',
              flexShrink: 0,
            }}>
            <img
              src={LOGO_SRC}
              alt="GROSHOP.tn"
              style={{
                height: 36, width: 'auto', display: 'block',
                filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.45))',
              }}
            />
          </button>

          {/* ── Nav ── */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <button
              onClick={() => {/* TODO: dropdown Solutions */}}
              className="sh-nav"
              style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
                color: 'rgba(255,255,255,0.88)',
                fontSize: 14, fontWeight: 500,
                textShadow: '0 1px 3px rgba(0,0,0,0.35)',
                letterSpacing: '0.01em',
              }}>
              Solutions
              <ChevronDown size={11} />
            </button>

            <button
              onClick={() => {/* TODO: dropdown Ressources */}}
              className="sh-nav"
              style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
                color: 'rgba(255,255,255,0.88)',
                fontSize: 14, fontWeight: 500,
                textShadow: '0 1px 3px rgba(0,0,0,0.35)',
                letterSpacing: '0.01em',
              }}>
              Ressources
              <ChevronDown size={11} />
            </button>

            <button
              onClick={() => scrollTo('#tarifs')}
              className="sh-nav"
              style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                color: 'rgba(255,255,255,0.88)',
                fontSize: 14, fontWeight: 500,
                textShadow: '0 1px 3px rgba(0,0,0,0.35)',
                letterSpacing: '0.01em',
              }}>
              Tarification
            </button>
          </nav>

          {/* ── Lien souligné ── */}
          <button
            onClick={() => scrollTo('#avantages')}
            className="sh-underline"
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: '#fff',
              fontSize: 13, fontWeight: 700,
              textDecoration: 'underline',
              textUnderlineOffset: 4,
              textDecorationThickness: '1.5px',
              textAlign: 'left',
              maxWidth: 220, lineHeight: 1.3,
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}>
            Découvrez les opportunités<br />pour votre activité
          </button>

          <div style={{ flex: 1 }} />

          {/* ── Sélecteur langue ── */}
          <button
            className="sh-lang"
            onClick={() => {/* TODO: dropdown langues */}}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.30)',
              padding: '5px 9px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              borderRadius: 5,
            }}>
            <span style={{
              background: '#fff', color: '#000',
              fontSize: 10, fontWeight: 800,
              padding: '2px 5px', borderRadius: 2,
              letterSpacing: '0.03em',
              lineHeight: 1,
            }}>FR</span>
            <ChevronDown color="rgba(255,255,255,0.95)" size={10} />
          </button>

          {/* ── S'inscrire / Se connecter ── */}
          <button
            onClick={() => navigate('/login')}
            className="sh-login"
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: '#fff',
              fontSize: 13, fontWeight: 600,
              textAlign: 'left', lineHeight: 1.25,
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}>
            S'inscrire/Se<br />connecter
          </button>
        </div>

        {/* ── CTA orange pleine hauteur ── */}
        <button
          onClick={() => navigate('/devenir-fournisseur/inscription')}
          className="sh-cta"
          style={{
            background: `linear-gradient(135deg, ${C.primary} 0%, #FF8557 100%)`,
            color: '#fff',
            fontWeight: 700, fontSize: 14,
            padding: '0 32px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 18px rgba(255,107,53,0.45)',
            letterSpacing: '0.01em',
            lineHeight: 1.25,
            textAlign: 'center',
            flexShrink: 0,
            minWidth: 200,
          }}>
          Commencez à vendre<br />maintenant
        </button>
      </header>
    </>
  )
}

function ChevronDown({ color = 'rgba(255,255,255,0.95)', size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9L12 15L18 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}