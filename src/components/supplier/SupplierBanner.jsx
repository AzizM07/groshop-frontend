// src/components/supplier/SupplierBanner.jsx — GROSHOP.tn

import { useRef } from 'react'
import * as Icons from 'lucide-react'
import EditableField from './EditableField'

/**
 * SupplierBanner — Hero inset, coins arrondis, encoche concave en bas
 *
 * Props :
 *  - supplier:       { company_name, verification_status }
 *  - store:          { brand_logo_url, banner_url, hero_title, description }
 *  - activeTab:      'home' | 'products' | 'profile' | 'reviews'
 *  - onContact:      () => void
 *  - editable:       bool   → active le mode édition (dashboard /supplier/shop)
 *  - onUpdateField:  (field, value) => Promise
 *  - onUploadImage:  (field, file)  => Promise
 */

/* ══════════════════════════════════════════════════════════════
   ⚠️ À FAIRE DANS DesktopSupplierProfilePage.jsx

   Le liseré clair autour du bouton vient d'un conflit de couleurs :
   l'encoche est peinte en une couleur PLEINE alors que la page est en
   dégradé (#FFFFFF → #F8F8FB). Impossible de faire coïncider les deux.

   Remplace, dans les DEUX <div> de la page (loading + rendu) :

     background: 'linear-gradient(180deg,#FFFFFF 0%,#F8F8FB 100%)'
   par
     background: '#F6F6F8'

   ...et garde PAGE_BG ci-dessous identique. Le raccord devient invisible.
   ══════════════════════════════════════════════════════════════ */
const PAGE_BG  = '#F6F6F8'   // ← doit être EXACTEMENT le fond de la page
const INSET    = 16
const RADIUS   = 36
const HEIGHT   = '70vh'
const OVERLAY  = 'none'      // image nette ; remets un dégradé ici si besoin

/* ── Encoche ── */
const NOTCH_W  = 'clamp(300px, 34%, 460px)'
const NOTCH_H  = 78
const NOTCH_R  = 30
const CORNER_R = 34
const BTN_H    = 56

/* ══════════════════════════════════════════════════════════════
   PALETTE — un seul endroit à toucher

   ORANGE / ORANGE_DARK pilotent TOUT l'orange du composant :
   le bouton « Consulter les produits » (dégradé + halo + pulsation),
   le bouton « Contacter », l'onglet actif et les survols.

   Le dégradé du bouton du bas va de ORANGE (haut-gauche) vers
   ORANGE_DARK (bas-droite). Pour un bouton PLAT, mets les deux
   constantes à la même valeur.

   Exemples :
     vert    → const ORANGE = '#12B76A' ; const ORANGE_DARK = '#0E9355'
     bleu    → const ORANGE = '#2E7DF6' ; const ORANGE_DARK = '#1B5FD0'
     noir    → const ORANGE = '#1A1A1A' ; const ORANGE_DARK = '#000000'
   ══════════════════════════════════════════════════════════════ */
const ORANGE      = '#FF6B1E'
const ORANGE_DARK = '#FF6B1E'
const INK         = '#111111'
const NAV_INK     = '#3A3A44'   // texte des onglets inactifs sur la capsule blanche

/* Composantes RVB de ORANGE → utilisées par l'animation de pulsation.
   Calculées automatiquement : rien à mettre à jour à la main. */
const rgbOf = (hex) => {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',')
}

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
    description = "Nous rendons l'achat en gros simple. Acteur reconnu du marché tunisien, nous vous connectons à un réseau de fournisseurs fiables pour un approvisionnement de qualité.",
  } = store

  const initials = company_name
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

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

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(`section-${sectionId}`)
    if (el) {
      const offset = 80
      const top = el.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  /* id corrigé : 'avis' → 'reviews' (la page rend <section id="section-reviews">) */
  const TABS = [
    { id: 'home',     label: 'Accueil' },
    { id: 'products', label: 'Produits' },
    { id: 'profile',  label: "Profil de l'entreprise" },
    { id: 'reviews',  label: 'Avis' },
  ]

  /* ── styles ── */
  const S = {
    page: {
      position: 'relative',
      background: PAGE_BG,
      padding: INSET,
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
    },

    wrap: {
      position: 'relative',
      width: '100%',
      height: HEIGHT,
      borderRadius: RADIUS,
      overflow: 'hidden',
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
      background: OVERLAY,
      zIndex: 1,
      pointerEvents: 'none',
    },

    editBannerBtn: {
      position: 'absolute',
      top: 104,
      right: 30,
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

    /* ══ BARRE DU HAUT ══ */
    nav: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '22px 26px',
      gap: 16,
    },
    navLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexShrink: 0,
      cursor: editable ? 'default' : 'pointer',
      position: 'relative',
    },
    /* Logo : plus grand, sans fond blanc.
       L'ombre portée remplace la pastille pour tenir sur une image claire. */
    brandLogoImg: {
      height: 58,
      width: 'auto',
      maxWidth: 210,
      objectFit: 'contain',
      display: 'block',
      filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.40))',
      transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1)',
    },
    editLogoBtn: {
      position: 'absolute',
      top: -6,
      right: -10,
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: ORANGE,
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
    fallbackBrand: { display: 'flex', alignItems: 'center', gap: 12 },
    fallbackLogoBox: {
      width: 52,
      height: 52,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${ORANGE}, #FF9A4D)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 800,
      fontSize: 17,
      letterSpacing: -0.5,
      boxShadow: '0 6px 22px rgba(255,107,30,0.45)',
    },
    fallbackName: {
      fontSize: 19,
      fontWeight: 700,
      color: '#fff',
      letterSpacing: 0.3,
      textShadow: '0 2px 12px rgba(0,0,0,0.5)',
    },

    /* ══ CAPSULE D'ONGLETS — fond BLANC opaque ══
       Le blanc étant plein, le backdrop-filter ne sert plus à rien :
       il est retiré (gain de perf). La séparation d'avec la photo est
       assurée par l'ombre portée, pas par une bordure claire. */
    navPill: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      padding: 5,
      borderRadius: 999,
      background: '#FFFFFF',
      border: '1px solid rgba(17,17,17,0.05)',
      boxShadow: '0 12px 32px rgba(0,0,0,0.20), 0 2px 6px rgba(0,0,0,0.08)',
    },
    /* Onglet actif = pastille ORANGE ; inactifs = texte sombre lisible sur blanc */
    menuItem: (active) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '9px 18px',
      fontSize: 14,
      fontWeight: active ? 700 : 600,
      color: active ? '#fff' : NAV_INK,
      background: active ? ORANGE : 'transparent',
      boxShadow: active ? `0 4px 14px ${ORANGE}59` : 'none',
      cursor: 'pointer',
      border: 'none',
      borderRadius: 999,
      transition: 'background 0.22s, color 0.22s, box-shadow 0.22s',
      fontFamily: 'inherit',
      whiteSpace: 'nowrap',
      textShadow: 'none',
    }),
    navDivider: {
      width: 1,
      height: 16,
      background: 'rgba(17,17,17,0.12)',
      flexShrink: 0,
    },

    navRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
    /* CTA orange + bouton flèche noir */
    btnContact: {
      background: ORANGE,
      color: '#fff',
      border: 'none',
      height: 48,
      padding: '0 26px',
      borderRadius: 999,
      fontSize: 14.5,
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'background 0.18s, box-shadow 0.18s, transform 0.12s',
      fontFamily: 'inherit',
      whiteSpace: 'nowrap',
      boxShadow: `0 8px 26px ${ORANGE}66`,
    },
    btnArrow: {
      width: 48,
      height: 48,
      borderRadius: '50%',
      background: INK,
      color: '#fff',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background 0.18s, transform 0.28s cubic-bezier(.34,1.56,.64,1)',
      flexShrink: 0,
      padding: 0,
      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
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
      padding: `20px 24px ${NOTCH_H + 30}px`,
      maxWidth: 1100,
      margin: '0 auto',
      width: '100%',
      minHeight: 0,
    },
    heroTitle: {
      fontSize: 'clamp(32px, 4.6vw, 64px)',
      fontWeight: 700,
      color: '#fff',
      lineHeight: 1.1,
      letterSpacing: -1,
      margin: 0,
      maxWidth: 900,
      textShadow: '0 2px 30px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.3)',
    },
    heroDesc: {
      fontSize: 'clamp(14px, 1.3vw, 17px)',
      color: '#fff',
      lineHeight: 1.7,
      marginTop: 22,
      maxWidth: 700,
      fontWeight: 400,
      textShadow: '0 1px 16px rgba(0,0,0,0.5)',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    heroDescEditable: { marginTop: 22, maxWidth: 700, width: '100%' },

    /* ══ L'ENCOCHE ══
       `farthest-side` est obligatoire : sans lui, CSS applique
       `farthest-corner` et le rayon vaut largeur × √2, donc le disque
       transparent déborde du carré et aucune courbe n'est peinte.

       ⚠️ Le centrage repose sur translateX(-50%). L'animation d'entrée
       DOIT donc réécrire ce translateX dans ses keyframes (voir
       @keyframes sb-notch-in) : une animation qui ne pose que
       translateY écrase la transform en ligne et décale l'encoche
       vers la droite d'une demi-largeur. */
    notch: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 8,
      width: NOTCH_W,
      height: NOTCH_H,
      background: PAGE_BG,
      borderRadius: `${NOTCH_R}px ${NOTCH_R}px 0 0`,
    },
    cornerLeft: {
      position: 'absolute',
      bottom: 0,
      left: -CORNER_R,
      width: CORNER_R,
      height: CORNER_R,
      background: `radial-gradient(farthest-side ellipse at top left, transparent 99%, ${PAGE_BG} 100%)`,
    },
    cornerRight: {
      position: 'absolute',
      bottom: 0,
      left: '100%',
      width: CORNER_R,
      height: CORNER_R,
      background: `radial-gradient(farthest-side ellipse at top right, transparent 99%, ${PAGE_BG} 100%)`,
    },
    notchBtn: {
      position: 'absolute',
      left: '50%',
      top: (NOTCH_H - BTN_H) / 2,
      transform: 'translateX(-50%)',
      width: 'calc(100% - 28px)',
      height: BTN_H,
      borderRadius: BTN_H / 2,
      border: 'none',
      background: `linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%)`,
      color: '#fff',
      fontSize: 15.5,
      fontWeight: 700,
      letterSpacing: 0.2,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      fontFamily: 'inherit',
      boxShadow: `0 10px 30px ${ORANGE}59`,
      transition: 'box-shadow 0.22s, transform 0.22s cubic-bezier(.34,1.56,.64,1)',
      overflow: 'hidden',
    },
  }

  return (
    <>
      <style>{`
        /* Variables dérivées de la palette JS — l'animation de pulsation
           les consomme, donc changer ORANGE suffit à tout recolorer. */
        .sb-page {
          --sb-orange: ${ORANGE};
          --sb-orange-dark: ${ORANGE_DARK};
          --sb-glow: ${rgbOf(ORANGE)};
        }

        @keyframes sb-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Variante réservée à l'encoche : conserve le centrage horizontal */
        @keyframes sb-notch-in {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        /* Reflet qui balaie le bouton principal */
        @keyframes sb-shine {
          0%        { left: -150%; }
          55%, 100% { left: 150%; }
        }
        /* Respiration très légère du halo */
        @keyframes sb-pulse {
          0%, 100% { box-shadow: 0 10px 30px rgba(var(--sb-glow), 0.35); }
          50%      { box-shadow: 0 12px 40px rgba(var(--sb-glow), 0.60); }
        }

        html { scroll-behavior: smooth; }
        .sb-hero-title { animation: sb-fade-up 0.7s ease-out 0.1s both; }
        .sb-hero-desc  { animation: sb-fade-up 0.7s ease-out 0.25s both; }
        .sb-notch      { animation: sb-notch-in 0.7s ease-out 0.4s both; }

        .sb-notch-btn { position: absolute; animation: sb-pulse 3.4s ease-in-out infinite; }
        .sb-notch-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -150%;
          width: 55%; height: 100%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.38), transparent);
          transform: skewX(-18deg);
          animation: sb-shine 3.8s ease-in-out infinite;
          pointer-events: none;
        }
        .sb-logo:hover { transform: scale(1.06); }

        @media (prefers-reduced-motion: reduce) {
          .sb-hero-title, .sb-hero-desc { animation: none !important; }
          .sb-notch { animation: none !important; }
          .sb-notch-btn, .sb-notch-btn::after { animation: none !important; }
        }

        @media (max-width: 900px) {
          .sb-nav-pill { display: none !important; }
          .sb-nav-label { display: none !important; }
        }

        @media (max-width: 768px) {
          .sb-page { padding: 10px !important; }
          .sb-wrap { height: 70dvh !important; border-radius: 22px !important; }
          .sb-nav { padding: 14px !important; }
          .sb-hero { padding: 16px 18px 92px !important; }
          .sb-logo { height: 44px !important; }
          .sb-edit-banner-btn { top: 74px !important; right: 14px !important; padding: 8px 12px !important; font-size: 11.5px !important; }
          .sb-cta-label { display: none !important; }

          .sb-notch { width: min(82%, 320px) !important; height: 62px !important; border-radius: 22px 22px 0 0 !important; }
          .sb-corner { width: 24px !important; height: 24px !important; }
          .sb-corner-left { left: -24px !important; }
          .sb-notch-btn { height: 46px !important; top: 8px !important; border-radius: 23px !important; font-size: 14px !important; width: calc(100% - 20px) !important; }
        }
      `}</style>

      <section className="sb-page" style={S.page}>
        <div className="sb-wrap" style={S.wrap}>

          {/* IMAGE DE FOND — aucun voile */}
          {banner_url ? (
            <img src={banner_url} alt={`Bannière ${company_name}`} style={S.bgImg} />
          ) : (
            <div style={{ ...S.bgImg, background: `linear-gradient(135deg, ${ORANGE} 0%, #1a1a1a 100%)` }} />
          )}

          {OVERLAY !== 'none' && <div style={S.overlay} />}

          {/* ⭐ EDIT BANNER BUTTON */}
          {editable && (
            <>
              <button
                type="button"
                className="sb-edit-banner-btn"
                style={S.editBannerBtn}
                onClick={() => bannerInputRef.current?.click()}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,107,30,0.88)')}
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

          {/* ══════════ BARRE DU HAUT ══════════ */}
          <div className="sb-nav" style={S.nav}>

            {/* Logo — grand, sans fond */}
            <div
              style={S.navLeft}
              onClick={editable ? undefined : () => scrollToSection('home')}
            >
              {brand_logo_url ? (
                <img className="sb-logo" src={brand_logo_url} alt={company_name} style={S.brandLogoImg} />
              ) : (
                <div style={S.fallbackBrand}>
                  <div className="sb-logo" style={S.fallbackLogoBox}>{initials}</div>
                  <span className="sb-nav-label" style={S.fallbackName}>{company_name}</span>
                </div>
              )}

              {editable && (
                <>
                  <button
                    type="button"
                    title="Changer le logo"
                    style={S.editLogoBtn}
                    onClick={(e) => { e.stopPropagation(); logoInputRef.current?.click() }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = ORANGE_DARK)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = ORANGE)}
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

            {/* Capsule d'onglets — fond blanc, actif en orange */}
            <nav className="sb-nav-pill" style={S.navPill}>
              {TABS.map((tab, i) => {
                const active = activeTab === tab.id
                const prevActive = activeTab === TABS[i - 1]?.id
                return (
                  <span key={tab.id} style={{ display: 'flex', alignItems: 'center' }}>
                    {i > 0 && (
                      <span
                        style={{
                          ...S.navDivider,
                          opacity: active || prevActive ? 0 : 1,
                          transition: 'opacity 0.2s',
                        }}
                      />
                    )}
                    <button
                      style={S.menuItem(active)}
                      onClick={() => scrollToSection(tab.id)}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = `${ORANGE}14`
                          e.currentTarget.style.color = ORANGE
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = NAV_INK
                        }
                      }}
                    >
                      {tab.label}
                    </button>
                  </span>
                )
              })}
            </nav>

            {/* CTA orange + flèche noire */}
            <div style={S.navRight}>
              <button
                className="sb-cta-label"
                style={S.btnContact}
                onClick={onContact}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = ORANGE_DARK
                  e.currentTarget.style.boxShadow = `0 12px 34px ${ORANGE}99`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = ORANGE
                  e.currentTarget.style.boxShadow = `0 8px 26px ${ORANGE}66`
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Contacter
              </button>
              <button
                aria-label="Contacter le fournisseur"
                style={S.btnArrow}
                onClick={onContact}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(45deg)'
                  e.currentTarget.style.background = ORANGE
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(0deg)'
                  e.currentTarget.style.background = INK
                }}
              >
                <Icons.ArrowUpRight size={21} strokeWidth={2.2} />
              </button>
            </div>
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
                    fontSize: 'clamp(32px, 4.6vw, 64px)',
                    fontWeight: 700,
                    color: '#fff',
                    lineHeight: 1.1,
                    letterSpacing: -1,
                    textAlign: 'center',
                    justifyContent: 'center',
                    textShadow: '0 2px 30px rgba(0,0,0,0.45)',
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
                    color: '#fff',
                    fontSize: 'clamp(14px, 1.3vw, 17px)',
                    lineHeight: 1.7,
                    fontWeight: 400,
                    textAlign: 'center',
                    justifyContent: 'center',
                    textShadow: '0 1px 16px rgba(0,0,0,0.5)',
                  }}
                />
              </div>
            ) : (
              <p className="sb-hero-desc" style={S.heroDesc}>
                {description}
              </p>
            )}
          </div>

          {/* ═══════════ L'ENCOCHE + LE BOUTON ═══════════ */}
          <div className="sb-notch" style={S.notch}>
            <span className="sb-corner sb-corner-left"  style={S.cornerLeft} />
            <span className="sb-corner sb-corner-right" style={S.cornerRight} />

            <button
              className="sb-notch-btn"
              style={S.notchBtn}
              onClick={() => scrollToSection('products')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-50%) translateY(-3px)'
                e.currentTarget.style.boxShadow = `0 16px 40px ${ORANGE}80`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(-50%)'
                e.currentTarget.style.boxShadow = `0 10px 30px ${ORANGE}59`
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'translateX(-50%) scale(0.97)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'translateX(-50%) translateY(-3px)')}
            >
              Consulter les produits
            </button>
          </div>
        </div>
      </section>
    </>
  )
}