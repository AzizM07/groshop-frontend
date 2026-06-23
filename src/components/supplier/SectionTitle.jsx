import { useEffect, useRef, useState } from 'react';

/**
 * SectionTitle — Avec backgrounds magnifiques
 * Emplacement : src/components/supplier/SectionTitle.jsx
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  BACKGROUNDS DISPONIBLES (prop `bg`)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 *   bg="mesh"    → Mesh gradient avec blobs colorés (premium, soft)  ⭐ recommandé
 *   bg="aurora"  → Dégradé animé en mouvement lent (moderne, vivant)
 *   bg="grid"    → Grille architecturale + glow accent (tech B2B)
 *   bg="dots"    → Pattern de points avec halo radial (sobre)
 *   bg="glow"    → Spotlight radial accent depuis le haut (élégant)
 *   bg="waves"   → Vagues SVG en haut et en bas (organique)
 *   bg="dark"    → Version sombre avec mesh subtil (rupture visuelle)
 *   bg="white"   → Blanc pur sans décoration
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  AUTRES PROPS (inchangées)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  title, subtitle, small, accentWord, icon, badge,
 *  align, variant, showLine, action, accent
 */
export default function SectionTitle({
  title,
  subtitle,
  small,
  accentWord,
  icon,
  badge,
  align = 'center',
  variant = 'default',
  bg = 'waves',
  showLine = true,
  action,
  accent = '#FF6B1E',
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  /* ── PALETTE selon bg ── */
  const isDark = bg === 'dark';
  const INK = isDark ? '#FFFFFF' : '#0A0E1A';
  const MUTED = isDark ? 'rgba(255,255,255,0.7)' : '#6B7280';
  const ACCENT = accent;
  const ACCENT_LIGHT = isDark ? 'rgba(255,107,30,0.18)' : '#FFF1EA';

  /* ── Padding selon variant ── */
  const padding = variant === 'hero'
    ? '120px 32px 80px'
    : variant === 'minimal'
      ? '60px 32px 32px'
      : '100px 32px 70px';

  /* ── Parse accent word ── */
  const renderTitle = () => {
    if (!accentWord || !title) return title;
    const regex = new RegExp(`(${accentWord})`, 'i');
    const parts = title.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === accentWord.toLowerCase()
        ? <span key={i} style={{ color: ACCENT, fontStyle: 'italic', fontWeight: 600 }}>{part}</span>
        : part
    );
  };

  const titleSize = variant === 'hero'
    ? 'clamp(40px, 5.5vw, 72px)'
    : variant === 'minimal'
      ? 'clamp(26px, 3.5vw, 38px)'
      : 'clamp(32px, 4.5vw, 52px)';

  /* ── styles ── */
  const S = {
    section: {
      padding,
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
      position: 'relative',
      overflow: 'hidden',
      background: isDark ? '#0A0E1A' : '#FAFAFA',
    },
    inner: {
      maxWidth: variant === 'split' ? 1200 : variant === 'hero' ? 1100 : 760,
      margin: '0 auto',
      textAlign: variant === 'split' ? 'left' : align,
      position: 'relative',
      zIndex: 2,
      display: variant === 'split' ? 'grid' : 'block',
      gridTemplateColumns: variant === 'split' ? '1fr 1fr' : '1fr',
      gap: variant === 'split' ? 48 : 0,
      alignItems: variant === 'split' ? 'start' : 'center',
    },
    rightCol: { paddingTop: 12 },

    eyebrowWrap: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      background: isDark ? 'rgba(255,255,255,0.08)' : ACCENT_LIGHT,
      backdropFilter: 'blur(8px)',
      padding: '7px 16px 7px 12px',
      borderRadius: 999,
      marginBottom: 22,
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : ACCENT + '22'}`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity .5s ease-out, transform .5s ease-out',
    },
    eyebrowDotWrap: { position: 'relative', width: 7, height: 7, flexShrink: 0 },
    eyebrowDot: { position: 'absolute', inset: 0, borderRadius: '50%', background: ACCENT },
    eyebrowDotPing: { position: 'absolute', inset: 0, borderRadius: '50%', background: ACCENT, animation: 'st-ping 2s cubic-bezier(0,0,0.2,1) infinite' },
    eyebrowIcon: { fontSize: 13, color: ACCENT, lineHeight: 1 },
    eyebrowText: { fontSize: 11.5, fontWeight: 700, color: ACCENT, letterSpacing: 1.5, textTransform: 'uppercase' },

    titleWrap: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      justifyContent: variant === 'split' ? 'flex-start' : (align === 'center' ? 'center' : 'flex-start'),
      flexWrap: 'wrap',
      marginBottom: showLine ? 20 : 16,
    },
    title: {
      fontSize: titleSize,
      fontWeight: 700,
      color: INK,
      letterSpacing: variant === 'hero' ? -2 : -1.5,
      lineHeight: variant === 'hero' ? 1.05 : 1.1,
      margin: 0,
      whiteSpace: 'pre-line',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity .6s ease-out .1s, transform .6s ease-out .1s',
    },
    titleBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      background: isDark ? 'rgba(255,255,255,0.1)' : '#0A0E1A0A',
      color: INK,
      fontSize: 13,
      fontWeight: 600,
      padding: '6px 12px',
      borderRadius: 8,
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1)' : 'scale(0.85)',
      transition: 'opacity .5s ease-out .3s, transform .5s ease-out .3s',
    },

    accentLineWrap: {
      display: 'flex',
      justifyContent: variant === 'split' ? 'flex-start' : (align === 'center' ? 'center' : 'flex-start'),
      marginBottom: 24,
    },
    accentLine: {
      width: visible ? 56 : 0,
      height: 3,
      background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT}66 100%)`,
      borderRadius: 999,
      transition: 'width .7s ease-out .25s',
    },

    subtitle: {
      fontSize: variant === 'hero' ? 18 : 16,
      fontWeight: 400,
      color: MUTED,
      lineHeight: 1.7,
      margin: 0,
      maxWidth: variant === 'split' ? '100%' : variant === 'hero' ? 640 : 560,
      marginLeft: variant === 'split' ? 0 : (align === 'center' ? 'auto' : 0),
      marginRight: variant === 'split' ? 0 : (align === 'center' ? 'auto' : 0),
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity .6s ease-out .3s, transform .6s ease-out .3s',
    },

    actionWrap: {
      marginTop: 32,
      display: 'flex',
      justifyContent: variant === 'split' ? 'flex-start' : (align === 'center' ? 'center' : 'flex-start'),
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity .6s ease-out .45s, transform .6s ease-out .45s',
    },
    actionPrimary: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      background: isDark ? '#fff' : INK,
      color: isDark ? INK : '#fff',
      border: 'none',
      padding: '14px 26px',
      borderRadius: 999,
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'transform .15s, box-shadow .2s',
      boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
    },
    actionArrow: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: ACCENT,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
    },
    actionLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      background: 'transparent',
      color: ACCENT,
      border: 'none',
      padding: 0,
      fontSize: 14.5,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'gap .2s',
    },
  };

  /* ── SUB-COMPONENTS ── */
  const Eyebrow = () => !small ? null : (
    <div style={S.eyebrowWrap}>
      <span style={S.eyebrowDotWrap}>
        <span style={S.eyebrowDotPing} />
        <span style={S.eyebrowDot} />
      </span>
      {icon && (icon.startsWith('ti ')
        ? <i className={icon} style={S.eyebrowIcon} />
        : <span style={S.eyebrowIcon}>{icon}</span>)}
      <span style={S.eyebrowText}>{small}</span>
    </div>
  );

  const Title = () => (
    <div style={S.titleWrap}>
      <h2 style={S.title}>{renderTitle()}</h2>
      {badge && <span style={S.titleBadge}>{badge}</span>}
    </div>
  );

  const AccentLine = () => !showLine ? null : (
    <div style={S.accentLineWrap}><div style={S.accentLine} /></div>
  );

  const Action = () => {
    if (!action) return null;
    const isPrimary = action.variant === 'primary';
    return (
      <div style={S.actionWrap}>
        {isPrimary ? (
          <button
            style={S.actionPrimary}
            onClick={action.onClick}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 22px rgba(0,0,0,0.28)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.18)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {action.label}
            <span style={S.actionArrow}>›</span>
          </button>
        ) : (
          <button
            style={S.actionLink}
            onClick={action.onClick}
            onMouseEnter={(e) => (e.currentTarget.style.gap = '12px')}
            onMouseLeave={(e) => (e.currentTarget.style.gap = '8px')}
          >
            {action.label}<span>→</span>
          </button>
        )}
      </div>
    );
  };

  /* ── RENDU CONTENU selon variant ── */
  const Content = () => {
    if (variant === 'split') {
      return (
        <div style={S.inner}>
          <div><Eyebrow /><Title /><AccentLine /></div>
          <div style={S.rightCol}>
            {subtitle && <p style={S.subtitle}>{subtitle}</p>}
            <Action />
          </div>
        </div>
      );
    }
    if (variant === 'minimal') {
      return (
        <div style={S.inner}>
          <Title />
          {subtitle && <p style={S.subtitle}>{subtitle}</p>}
          <Action />
        </div>
      );
    }
    return (
      <div style={S.inner}>
        <Eyebrow /><Title /><AccentLine />
        {subtitle && <p style={S.subtitle}>{subtitle}</p>}
        <Action />
      </div>
    );
  };

  return (
    <section ref={ref} style={S.section}>
      <Background type={bg} accent={ACCENT} visible={visible} />
      <Content />
      <GlobalAnimations />
    </section>
  );
}

/* ════════════════════════════════════════════════════════════ */
/* ── COMPOSANT BACKGROUND : 8 variantes ── */
/* ════════════════════════════════════════════════════════════ */
function Background({ type, accent, visible }) {
  const baseStyle = {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    pointerEvents: 'none',
    opacity: visible ? 1 : 0,
    transition: 'opacity 1.2s ease-out',
  };

  /* ── MESH GRADIENT (premium, soft, recommandé) ── */
  if (type === 'mesh') {
    return (
      <>
        <div style={{
          ...baseStyle,
          background: `
            radial-gradient(at 20% 25%, ${accent}28 0px, transparent 50%),
            radial-gradient(at 80% 20%, #5B9BD533 0px, transparent 50%),
            radial-gradient(at 70% 80%, ${accent}18 0px, transparent 50%),
            radial-gradient(at 25% 85%, #C084FC22 0px, transparent 50%),
            linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)
          `,
        }} />
        {/* Grain noise overlay */}
        <div style={{
          ...baseStyle,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          opacity: 0.4,
          mixBlendMode: 'multiply',
        }} />
      </>
    );
  }

  /* ── AURORA (animé, vivant) ── */
  if (type === 'aurora') {
    return (
      <div style={{
        ...baseStyle,
        background: `
          conic-gradient(from 90deg at 50% 50%,
            ${accent}1A 0deg,
            #5B9BD51A 90deg,
            #C084FC15 180deg,
            ${accent}1A 270deg,
            ${accent}1A 360deg)
        `,
        animation: 'st-aurora 18s linear infinite',
        filter: 'blur(40px)',
      }} />
    );
  }

  /* ── GRID architecturale + glow ── */
  if (type === 'grid') {
    return (
      <>
        <div style={{
          ...baseStyle,
          backgroundImage: `
            linear-gradient(${accent}10 1px, transparent 1px),
            linear-gradient(90deg, ${accent}10 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 70% 60% at center, #000 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at center, #000 30%, transparent 80%)',
        }} />
        <div style={{
          ...baseStyle,
          background: `radial-gradient(ellipse 60% 40% at center, ${accent}14 0%, transparent 70%)`,
        }} />
      </>
    );
  }

  /* ── DOTS avec halo central ── */
  if (type === 'dots') {
    return (
      <>
        <div style={{
          ...baseStyle,
          backgroundImage: `radial-gradient(circle, #0A0E1A10 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 80% 60% at center, #000 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at center, #000 30%, transparent 80%)',
        }} />
        <div style={{
          ...baseStyle,
          background: `radial-gradient(ellipse 50% 40% at center, ${accent}1A 0%, transparent 70%)`,
        }} />
      </>
    );
  }

  /* ── GLOW radial depuis le haut ── */
  if (type === 'glow') {
    return (
      <div style={{
        ...baseStyle,
        background: `
          radial-gradient(ellipse 80% 60% at 50% 0%, ${accent}28 0%, transparent 60%),
          linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)
        `,
      }} />
    );
  }

  /* ── WAVES SVG ── */
  if (type === 'waves') {
    return (
      <>
        <div style={{ ...baseStyle, background: 'linear-gradient(180deg, #FFF8F3 0%, #FAFAFA 100%)' }} />
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 120, zIndex: 1, opacity: visible ? 1 : 0, transition: 'opacity 1s' }}
          viewBox="0 0 1200 120" preserveAspectRatio="none"
        >
          <path d="M0,0 Q300,100 600,40 T1200,60 L1200,0 Z" fill={`${accent}10`} />
          <path d="M0,0 Q400,80 800,30 T1200,50 L1200,0 Z" fill={`${accent}18`} />
        </svg>
        <svg
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 120, zIndex: 1, opacity: visible ? 1 : 0, transition: 'opacity 1s', transform: 'rotate(180deg)' }}
          viewBox="0 0 1200 120" preserveAspectRatio="none"
        >
          <path d="M0,0 Q300,100 600,40 T1200,60 L1200,0 Z" fill={`${accent}08`} />
        </svg>
      </>
    );
  }

  /* ── DARK avec mesh subtil ── */
  if (type === 'dark') {
    return (
      <>
        <div style={{
          ...baseStyle,
          background: `
            radial-gradient(at 25% 30%, ${accent}33 0px, transparent 50%),
            radial-gradient(at 80% 70%, #5B9BD525 0px, transparent 50%),
            linear-gradient(180deg, #0A0E1A 0%, #131825 100%)
          `,
        }} />
        {/* Grille discrète */}
        <div style={{
          ...baseStyle,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 70% 60% at center, #000 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at center, #000 30%, transparent 80%)',
        }} />
      </>
    );
  }

  /* ── WHITE pur ── */
  if (type === 'white') {
    return <div style={{ ...baseStyle, background: '#FFFFFF' }} />;
  }

  return null;
}

/* ── Animations globales ── */
function GlobalAnimations() {
  return (
    <style>{`
      @keyframes st-ping {
        75%, 100% { transform: scale(2.5); opacity: 0; }
      }
      @keyframes st-aurora {
        0%   { transform: rotate(0deg) scale(1.5); }
        50%  { transform: rotate(180deg) scale(1.8); }
        100% { transform: rotate(360deg) scale(1.5); }
      }
    `}</style>
  );
}