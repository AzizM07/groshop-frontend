// src/components/supplier/SupplierBanner.jsx — GROSHOP.tn

import { useRef } from 'react'
import * as Icons from 'lucide-react'
import EditableField from './EditableField'

/**
 * SupplierBanner — Hero centré avec gros texte + 2 CTA
 *
 * Props :
 *  - supplier:       { company_name, verification_status }
 *  - store:          { brand_logo_url, banner_url, description }
 *  - activeTab:      'home' | 'products' | 'profile' | 'avis'
 *  - onContact:      () => void
 *  - editable:       bool   → active le mode édition (dashboard /supplier/shop)
 *  - onUpdateField:  (field, value) => Promise
 *  - onUploadImage:  (field, file)  => Promise
 */
export default function SupplierBanner({
  supplier = {},
  store = {},
  activeTab = 'home',
  onContact = () => {},
  editable = false,
  onUpdateField = () => {},
  onUploadImage = () => {},
}) {
  const { company_name = 'Nom du fournisseur' } = supplier
  const {
    banner_url = null,
    brand_logo_url = null,
    hero_title = 'Un fournisseur de confiance\nsur lequel vous pouvez compter.',
    description = "Nous rendons l'achat en gros simple. Acteur reconnu du marché tunisien, nous vous connectons à un réseau de fournisseurs fiables pour un approvisionnement de qualité. Considérez-nous comme votre partenaire pour développer votre activité.",
  } = store

  const initials = company_name
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  // ── Refs pour les inputs file ────────────────────────────────────
  const bannerInputRef = useRef(null)
  const logoInputRef = useRef(null)

  const handleBannerFile = async (e) => {
    const file = e.target.files?.[0]
    if (file) await onUploadImage('banner_url', file)
    e.target.value = ''
  }

  const handleLogoFile = async (e) => {
    const file = e.target.files?.[0]
    if (file) await onUploadImage('brand_logo_url', file)
    e.target.value = ''
  }

  // Scroll vers une section
  const scrollToSection = (sectionId) => {
    const el = document.getElementById(`section-${sectionId}`)
    if (el) {
      const offset = 80
      const top = el.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const TABS = [
    { id: 'home',     label: 'Accueil' },
    { id: 'products', label: 'Produits' },
    { id: 'profile',  label: "Profil de l'entreprise" },
    { id: 'avis',     label: 'Avis' },
  ]

  /* ── styles ── */
  const S = {
    wrap: {
      position: 'relative',
      width: '100%',
      minHeight: '92vh',
      overflow: 'hidden',
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
      background: '#0a0e1a',
      display: 'flex',
      flexDirection: 'column',
    },

    bgImg: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: 0,
    },

    overlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, rgba(10,14,26,0.45) 0%, rgba(10,14,26,0.55) 100%)',
      zIndex: 1,
    },

    // ⭐ Bouton flottant "Changer la bannière" (editable only)
    editBannerBtn: {
      position: 'absolute',
      top: 92,
      right: 28,
      zIndex: 20,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      background: 'rgba(15, 20, 25, 0.7)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.2)',
      padding: '9px 16px',
      borderRadius: 999,
      fontSize: 12.5,
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'background 0.15s, transform 0.1s',
      letterSpacing: 0.2,
    },

    // NAV TRANSPARENTE
    nav: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 48px',
      gap: 16,
    },
    navLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
      cursor: editable ? 'default' : 'pointer',
      position: 'relative', // pour le bouton crayon absolu
    },
    brandLogoImg: {
      height: 40,
      width: 'auto',
      objectFit: 'contain',
      display: 'block',
      background: 'rgba(255,255,255,0.95)',
      padding: '6px 12px',
      borderRadius: 10,
    },
    // ⭐ Petit bouton crayon orange sur le coin du logo (editable only)
    editLogoBtn: {
      position: 'absolute',
      top: -7,
      right: -9,
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: '#FF4500',
      color: '#fff',
      border: '2px solid #fff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontFamily: 'inherit',
      padding: 0,
      boxShadow: '0 3px 10px rgba(0,0,0,0.35)',
      zIndex: 11,
      transition: 'background 0.15s, transform 0.1s',
    },
    fallbackBrand: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    fallbackLogoBox: {
      width: 36,
      height: 36,
      borderRadius: 8,
      background: 'linear-gradient(135deg,#FF6B1E,#FF8A3D)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 800,
      fontSize: 13,
      letterSpacing: -0.5,
    },
    fallbackName: {
      fontSize: 18,
      fontWeight: 700,
      color: '#fff',
      letterSpacing: 0.3,
    },

    navCenter: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    menuItem: (active) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '10px 18px',
      fontSize: 14.5,
      fontWeight: active ? 700 : 500,
      color: active ? '#fff' : 'rgba(255,255,255,0.78)',
      cursor: 'pointer',
      border: 'none',
      background: 'transparent',
      borderRadius: 8,
      transition: 'color 0.18s',
      fontFamily: 'inherit',
      whiteSpace: 'nowrap',
      position: 'relative',
    }),
    activeDot: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: '#FF6B1E',
    },

    btnContact: {
      background: '#FF6B1E',
      color: '#fff',
      border: 'none',
      padding: '12px 24px',
      borderRadius: 999,
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      transition: 'background 0.15s, transform 0.1s',
      fontFamily: 'inherit',
      flexShrink: 0,
      boxShadow: '0 4px 14px rgba(255,107,30,0.4)',
    },

    // HERO CENTRÉ
    hero: {
      position: 'relative',
      zIndex: 5,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 24px 80px',
      maxWidth: 1100,
      margin: '0 auto',
      width: '100%',
    },
    heroTitle: {
      fontSize: 'clamp(38px, 6vw, 72px)',
      fontWeight: 700,
      color: '#fff',
      lineHeight: 1.1,
      letterSpacing: -1,
      margin: 0,
      maxWidth: 900,
    },
    heroDesc: {
      fontSize: 'clamp(14px, 1.3vw, 17px)',
      color: 'rgba(255,255,255,0.88)',
      lineHeight: 1.7,
      marginTop: 28,
      maxWidth: 720,
      fontWeight: 400,
    },
    // Wrapper pour EditableField dans le hero
    heroDescEditable: {
      marginTop: 28,
      maxWidth: 720,
      width: '100%',
    },
    ctaRow: {
      display: 'flex',
      gap: 14,
      marginTop: 40,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    ctaPrimary: {
      background: '#111',
      color: '#fff',
      border: 'none',
      padding: '14px 36px',
      borderRadius: 999,
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background 0.15s, transform 0.1s',
      fontFamily: 'inherit',
      boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
    },
    ctaSecondary: {
      background: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(8px)',
      color: '#fff',
      border: '1.5px solid rgba(255,255,255,0.5)',
      padding: '12.5px 36px',
      borderRadius: 999,
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
      fontFamily: 'inherit',
    },
  }

  return (
    <>
      <style>{`
        @keyframes sb-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        html { scroll-behavior: smooth; }
        .sb-hero-title { animation: sb-fade-up 0.7s ease-out 0.1s both; }
        .sb-hero-desc  { animation: sb-fade-up 0.7s ease-out 0.25s both; }
        .sb-hero-cta   { animation: sb-fade-up 0.7s ease-out 0.4s both; }

        @media (max-width: 768px) {
          .sb-nav { padding: 16px 20px !important; }
          .sb-nav-center { display: none !important; }
          .sb-hero { padding: 30px 20px 60px !important; }
          .sb-edit-banner-btn { top: 76px !important; right: 14px !important; padding: 8px 12px !important; font-size: 11.5px !important; }
        }
      `}</style>

      <section style={S.wrap}>
        {/* IMAGE DE FOND */}
        {banner_url ? (
          <img src={banner_url} alt={`Bannière ${company_name}`} style={S.bgImg} />
        ) : (
          <div style={{ ...S.bgImg, background: 'linear-gradient(135deg,#FF6B1E 0%,#1a1a1a 100%)' }} />
        )}

        {/* OVERLAY */}
        <div style={S.overlay} />

        {/* ⭐ EDIT BANNER BUTTON */}
        {editable && (
          <>
            <button
              type="button"
              className="sb-edit-banner-btn"
              style={S.editBannerBtn}
              onClick={() => bannerInputRef.current?.click()}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,69,0,0.85)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(15,20,25,0.7)')}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Icons.Camera size={14} strokeWidth={2} />
              Changer la bannière
            </button>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerFile}
              style={{ display: 'none' }}
            />
          </>
        )}

        {/* NAV */}
        <div className="sb-nav" style={S.nav}>
          <div
            style={S.navLeft}
            onClick={editable ? undefined : () => scrollToSection('home')}
          >
            {brand_logo_url ? (
              <img src={brand_logo_url} alt={company_name} style={S.brandLogoImg} />
            ) : (
              <div style={S.fallbackBrand}>
                <div style={S.fallbackLogoBox}>{initials}</div>
                <span style={S.fallbackName}>{company_name}</span>
              </div>
            )}

            {/* ⭐ Petit crayon sur le logo */}
            {editable && (
              <>
                <button
                  type="button"
                  title="Changer le logo"
                  style={S.editLogoBtn}
                  onClick={(e) => { e.stopPropagation(); logoInputRef.current?.click() }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FF6B1E')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FF4500')}
                  onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                  onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Icons.Camera size={11} strokeWidth={2.4} />
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFile}
                  style={{ display: 'none' }}
                />
              </>
            )}
          </div>

          <nav className="sb-nav-center" style={S.navCenter}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  style={S.menuItem(active)}
                  onClick={() => scrollToSection(tab.id)}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.78)' }}
                >
                  {tab.label}
                  {active && <span style={S.activeDot} />}
                </button>
              )
            })}
          </nav>

          <button
            style={S.btnContact}
            onClick={onContact}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FF8A3D')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FF6B1E')}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Contacter
          </button>
        </div>

        {/* HERO CENTRÉ */}
        <div className="sb-hero" style={S.hero}>
          {editable ? (
  <div className="sb-hero-title" style={{ width: '100%', maxWidth: 900 }}>
    <EditableField
      value={hero_title}
      onSave={(v) => onUpdateField('hero_title', v)}
      multiline
      maxLength={120}
      placeholder="Votre titre principal…"
      style={{
        width: '100%',
        fontSize: 'clamp(38px, 6vw, 72px)',
        fontWeight: 700,
        color: '#fff',
        lineHeight: 1.1,
        letterSpacing: -1,
        textAlign: 'center',
        justifyContent: 'center',
      }}
    />
  </div>
) : (
  <h1 className="sb-hero-title" style={S.heroTitle}>
    {hero_title.split('\n').map((line, i, arr) => (
      <span key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </span>
    ))}
  </h1>
)}

          {editable ? (
            <div className="sb-hero-desc" style={S.heroDescEditable}>
              <EditableField
                value={description}
                onSave={(v) => onUpdateField('description', v)}
                multiline
                placeholder="Décrivez votre entreprise…"
                style={{
                  width: '100%',
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: 'clamp(14px, 1.3vw, 17px)',
                  lineHeight: 1.7,
                  fontWeight: 400,
                  textAlign: 'center',
                  justifyContent: 'center',
                }}
              />
            </div>
          ) : (
            <p className="sb-hero-desc" style={S.heroDesc}>
              {description}
            </p>
          )}

          <div className="sb-hero-cta" style={S.ctaRow}>
            <button
              style={S.ctaPrimary}
              onClick={onContact}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#333')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#111')}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Contacter
            </button>

            <button
              style={S.ctaSecondary}
              onClick={() => scrollToSection('products')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.18)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Nos produits
            </button>
          </div>
        </div>
      </section>
    </>
  )
}