import { useEffect, useRef, useState } from 'react';
import EditableField from './EditableField';
import EditableImage from './EditableImage';

/**
 * SupplierStats — Layout "Logistics Solutions"
 * Emplacement : src/components/supplier/SupplierStats.jsx
 *
 * Props :
 *  - supplier:       { company_name, created_at }
 *  - store:          { response_rate, response_time_hrs, about_images, stats_title, stats_description }
 *  - productsCount:  number
 *  - title:          string (override — sinon lit store.stats_title)
 *  - description:    string (override — sinon lit store.stats_description)
 *  - ctaLabel:       string (défaut: "Découvrir nos produits") — non éditable
 *  - onCta:          () => void
 *  - highlights:     [{ label, image }] — 2 cards
 *  - editable:       bool   → mode édition
 *  - onUpdateField:  (field, value) => Promise
 *  - onUploadImage:  (field, file)  => Promise
 */
export default function SupplierStats({
  supplier = {},
  store = {},
  productsCount = 0,
  title,
  description,
  ctaLabel = 'Découvrir nos produits',
  onCta = () => {},
  highlights,
  editable = false,
  onUpdateField = () => {},
  onUploadImage = () => {},
}) {
  const { company_name = 'Le fournisseur', created_at = null } = supplier;
  const {
    response_rate = 0,
    response_time_hrs = 0,
    about_images = [],
    stats_title = null,
    stats_description = null,
  } = store;

  // ── Defaults intelligents ──
  // Priorité : prop title > store.stats_title > défaut auto
  const finalTitle = title || stats_title || `${company_name},\nl'expertise grossiste\nau service des pros.`;
  const finalDescription = description || stats_description ||
    "Notre savoir-faire allie production de qualité, logistique fiable et accompagnement personnalisé. À chaque étape, nous garantissons un service à la hauteur des exigences professionnelles.";

  // ── Cards highlights : labels hardcodés, images depuis store ──
  const HIGHLIGHT_LABELS = ['Production & atelier', 'Livraison nationale'];
  const DEFAULT_IMAGES = [
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80',
  ];
  // En mode editable on lit highlight_image_1 / highlight_image_2 dédiés
  // En mode lecture seule on garde le fallback existant (about_images[0..1])
  const card1Image = store.highlight_image_1 || about_images[0] || DEFAULT_IMAGES[0];
  const card2Image = store.highlight_image_2 || about_images[1] || DEFAULT_IMAGES[1];

  const cards = highlights && highlights.length >= 2
    ? highlights.slice(0, 2)
    : [
        { label: HIGHLIGHT_LABELS[0], image: card1Image, field: 'highlight_image_1' },
        { label: HIGHLIGHT_LABELS[1], image: card2Image, field: 'highlight_image_2' },
      ];

  // ── Calcul des années d'activité ──
  const yearsActive = created_at
    ? Math.max(1, Math.floor((Date.now() - new Date(created_at).getTime()) / (365.25 * 24 * 3600 * 1000)))
    : 0;

  const STATS = [
    { target: yearsActive, suffix: '+', label: "Années d'activité" },
    { target: response_rate, suffix: '%', label: "Taux de réponse" },
    {
      target: response_time_hrs,
      suffix: response_time_hrs >= 24 ? 'j' : 'h',
      label: "Temps de réponse",
      transform: (v) => (response_time_hrs >= 24 ? Math.round(v / 24) : v),
    },
    { target: productsCount, suffix: '+', label: "Produits référencés" },
  ];

  /* ── couleurs ── */
  const ACCENT = '#FF6B1E';
  const INK = '#0A0E1A';
  const MUTED = '#6B7280';
  const BORDER = '#EEEEF0';

  // ── Animation au scroll pour la section entière ──
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  /* ── styles ── */
  const S = {
    section: {
      padding: '40px 32px 80px',
      background: '#FAFAFA',
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
    },
    container: { maxWidth: 1200, margin: '0 auto' },
    topGrid: {
      display: 'grid',
      gridTemplateColumns: '1.1fr 1.4fr',
      gap: 48,
      alignItems: 'center',
      marginBottom: 56,
    },
    leftCol: {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-30px)',
      transition: 'opacity .8s ease-out, transform .8s ease-out',
    },
    title: {
      fontSize: 'clamp(32px, 4vw, 48px)',
      fontWeight: 700,
      color: INK,
      letterSpacing: -1.5,
      lineHeight: 1.1,
      margin: 0,
      marginBottom: 20,
      whiteSpace: 'pre-line',
    },
    description: {
      fontSize: 15.5,
      color: MUTED,
      lineHeight: 1.7,
      margin: 0,
      marginBottom: 32,
      maxWidth: 460,
    },
    ctaBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      background: INK,
      color: '#fff',
      border: 'none',
      padding: '14px 26px',
      borderRadius: 999,
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'background .15s, transform .1s, box-shadow .2s',
      boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
    },
    ctaArrow: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: ACCENT,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 700,
    },
    rightCol: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
    },
    statsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 0,
      borderTop: `1px solid ${BORDER}`,
      paddingTop: 40,
    },
    statCell: (i) => ({
      padding: '0 24px',
      borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity .6s ease-out ${0.4 + i * 0.1}s, transform .6s ease-out ${0.4 + i * 0.1}s`,
    }),
    statValue: {
      fontSize: 'clamp(32px, 3.5vw, 44px)',
      fontWeight: 700,
      color: INK,
      letterSpacing: -1.5,
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
      display: 'flex',
      alignItems: 'baseline',
      marginBottom: 12,
    },
    statSuffix: { color: ACCENT, marginLeft: 1 },
    statLabel: {
      fontSize: 13,
      fontWeight: 500,
      color: MUTED,
      lineHeight: 1.4,
    },
  };

  return (
    <section ref={sectionRef} style={S.section}>
      <div style={S.container}>

        {/* ─────────── TOP : Title/CTA + Cards ─────────── */}
        <div style={S.topGrid} className="ss-top-grid">

          {/* GAUCHE — Title + Description + CTA */}
          <div style={S.leftCol}>

            {/* ⭐ TITRE — éditable */}
            {editable ? (
              <div style={{ marginBottom: 20 }}>
                <EditableField
                  value={finalTitle}
                  onSave={(v) => onUpdateField('stats_title', v)}
                  multiline
                  maxLength={150}
                  placeholder="Votre titre principal…"
                  style={{
                    width: '100%',
                    fontSize: 'clamp(32px, 4vw, 48px)',
                    fontWeight: 700,
                    color: INK,
                    letterSpacing: -1.5,
                    lineHeight: 1.1,
                    whiteSpace: 'pre-line',
                  }}
                />
              </div>
            ) : (
              <h2 style={S.title}>{finalTitle}</h2>
            )}

            {/* ⭐ DESCRIPTION — éditable */}
            {editable ? (
              <div style={{ marginBottom: 32, maxWidth: 460 }}>
                <EditableField
                  value={finalDescription}
                  onSave={(v) => onUpdateField('stats_description', v)}
                  multiline
                  maxLength={400}
                  placeholder="Décrivez votre savoir-faire…"
                  style={{
                    width: '100%',
                    fontSize: 15.5,
                    color: MUTED,
                    lineHeight: 1.7,
                  }}
                />
              </div>
            ) : (
              <p style={S.description}>{finalDescription}</p>
            )}

            {/* CTA — non éditable */}
            <button
              style={S.ctaBtn}
              onClick={onCta}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1A2332';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.28)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = INK;
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.18)';
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {ctaLabel}
              <span style={S.ctaArrow}>›</span>
            </button>
          </div>

          {/* DROITE — 2 cards images */}
          <div style={S.rightCol} className="ss-right-col">
            {cards.map((card, i) => (
              <HighlightCard
                key={i}
                card={card}
                index={i}
                visible={visible}
                accent={ACCENT}
                editable={editable}
                onUploadImage={onUploadImage}
              />
            ))}
          </div>
        </div>

        {/* ─────────── STATS ROW — read-only ─────────── */}
        <div style={S.statsRow} className="ss-stats-row">
          {STATS.map((stat, i) => (
            <StatCell key={i} stat={stat} index={i} visible={visible} styles={S} />
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .ss-top-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .ss-stats-row {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px 0 !important;
          }
          .ss-stats-row > div:nth-child(3),
          .ss-stats-row > div:nth-child(4) {
            border-top: 1px solid #EEEEF0;
            padding-top: 24px !important;
          }
        }
        @media (max-width: 500px) {
          .ss-right-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════ */
/* ── HIGHLIGHT CARD ── */
/* ════════════════════════════════════════════════════════════ */
function HighlightCard({ card, index, visible, accent, editable, onUploadImage }) {
  const [hovered, setHovered] = useState(false);

  const S = {
    wrap: {
      position: 'relative',
      aspectRatio: '3 / 4',
      borderRadius: 18,
      overflow: 'hidden',
      cursor: editable ? 'default' : 'pointer',
      background: '#1a1a1a',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(40px)',
      transition: `opacity .8s ease-out ${0.15 + index * 0.12}s, transform .8s ease-out ${0.15 + index * 0.12}s, box-shadow .3s`,
      boxShadow: hovered ? '0 18px 40px rgba(0,0,0,0.25)' : '0 4px 14px rgba(0,0,0,0.1)',
    },
    img: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform .6s cubic-bezier(.2,.8,.2,1)',
      transform: !editable && hovered ? 'scale(1.08)' : 'scale(1)',
    },
    overlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
      pointerEvents: 'none',
    },
    label: {
      position: 'absolute',
      left: 18,
      bottom: 18,
      color: '#fff',
      fontSize: 16,
      fontWeight: 600,
      letterSpacing: -0.3,
      maxWidth: 'calc(100% - 70px)',
      lineHeight: 1.3,
      pointerEvents: 'none',
      zIndex: 2,
    },
    arrow: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: hovered ? accent : 'rgba(255,255,255,0.95)',
      color: hovered ? '#fff' : '#111',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 16,
      fontWeight: 700,
      transition: 'background .25s, transform .3s',
      transform: !editable && hovered ? 'rotate(-45deg)' : 'rotate(0deg)',
      pointerEvents: 'none',
      zIndex: 2,
    },
  };

  // ── MODE ÉDITABLE : on enrobe l'image dans EditableImage ──
  if (editable) {
    return (
      <div
        style={S.wrap}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <EditableImage
          src={card.image}
          onUpload={(file) => onUploadImage(card.field, file)}
          hint="Changer cette photo"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            borderRadius: 18,
          }}
        />
        <div style={S.overlay} />
        <div style={S.arrow}>↗</div>
        <div style={S.label}>{card.label}</div>
      </div>
    );
  }

  // ── MODE LECTURE SEULE ──
  return (
    <div
      style={S.wrap}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img src={card.image} alt={card.label} style={S.img} />
      <div style={S.overlay} />
      <div style={S.arrow}>↗</div>
      <div style={S.label}>{card.label}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/* ── STAT CELL avec count-up ── */
/* ════════════════════════════════════════════════════════════ */
function StatCell({ stat, index, visible, styles }) {
  const ref = useRef(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!visible || hasAnimated) return;
    setHasAnimated(true);

    const duration = 1800;
    const startTime = performance.now();
    const target = Number(stat.target) || 0;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplayValue(target * easeOutCubic(progress));
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplayValue(target);
    };
    requestAnimationFrame(tick);
  }, [visible, hasAnimated, stat.target]);

  const transformed = stat.transform ? stat.transform(displayValue) : displayValue;
  const formatted = Math.round(transformed);

  return (
    <div ref={ref} style={styles.statCell(index)}>
      <div style={styles.statValue}>
        <span>{formatted}</span>
        {stat.suffix && <span style={styles.statSuffix}>{stat.suffix}</span>}
      </div>
      <div style={styles.statLabel}>{stat.label}</div>
    </div>
  );
}