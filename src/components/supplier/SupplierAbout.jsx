import EditableField from './EditableField';
import EditableImage from './EditableImage';

/**
 * SupplierAbout — Layout style "DaDa"
 * Emplacement : src/components/supplier/SupplierAbout.jsx
 *
 * Props :
 *  - supplier:       { company_name }
 *  - store:          { about_title_main, about_title_accent, description, founded_year, mission, about_images[0..3] }
 *  - onContact:      () => void
 *  - editable:       bool
 *  - onUpdateField:  (field, value) => Promise
 *  - onUploadImage:  (field, file)  => Promise
 */
export default function SupplierAbout({
  supplier = {},
  store = {},
  onContact = () => {},
  editable = false,
  onUpdateField = () => {},
  onUploadImage = () => {},
}) {
  const { company_name = 'Ce fournisseur' } = supplier;
  const {
    description = null,
    founded_year = null,
    mission = null,
    about_images = [],
    about_title_main = 'Un fournisseur de confiance.',
    about_title_accent = 'Une vision claire.',
  } = store;

  const yearsActive = founded_year ? new Date().getFullYear() - founded_year : 0;

  // 4 images : 3 petites en haut + 1 grande en bas
  const img1   = about_images[0] || null;
  const img2   = about_images[1] || null;
  const img3   = about_images[2] || null;
  const imgBig = about_images[3] || about_images[0] || null;

  /* ── styles ── */
  const S = {
    section: {
      padding: '40px 32px 80px',
      background: '#fff',
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 60,
      maxWidth: 1200,
      margin: '0 auto',
      alignItems: 'center',
    },
    leftCol: { display: 'flex', flexDirection: 'column', gap: 24 },

    overline: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 12,
      fontWeight: 600,
      color: '#FF4500',
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    overlineLine: { width: 28, height: 2, background: '#FF4500', borderRadius: 2 },

    title: {
      fontSize: 38,
      fontWeight: 700,
      color: '#0a0a2a',
      letterSpacing: -1.2,
      lineHeight: 1.15,
      margin: 0,
    },
    titleAccent: { color: '#FF4500' },

    description: {
      fontSize: 15,
      fontWeight: 400,
      color: '#5a5a6a',
      lineHeight: 1.75,
      margin: 0,
      letterSpacing: -0.1,
    },

    metaRow: { display: 'flex', gap: 32, paddingTop: 8 },
    metaItem: { display: 'flex', flexDirection: 'column', gap: 4 },
    metaValue: {
      fontSize: 24,
      fontWeight: 400,
      color: '#0a0a2a',
      letterSpacing: -0.8,
      lineHeight: 1,
      display: 'flex',
      alignItems: 'baseline',
    },
    metaSuffix: { color: '#FF4500', marginLeft: 2 },
    metaLabel: {
      fontSize: 11,
      fontWeight: 500,
      color: '#9a9a9a',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },

    missionBlock: {
      padding: '20px 24px',
      background: '#FAFAFC',
      borderLeft: '3px solid #FF4500',
      borderRadius: 0,
      marginTop: 4,
    },
    missionLabel: {
      fontSize: 10,
      fontWeight: 600,
      color: '#FF4500',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: 6,
      display: 'block',
    },
    missionText: {
      fontSize: 14,
      fontWeight: 400,
      color: '#1a1a1a',
      lineHeight: 1.6,
      fontStyle: 'italic',
      letterSpacing: -0.1,
      margin: 0,
    },

    ctaBtn: {
      alignSelf: 'flex-start',
      background: '#111',
      color: '#fff',
      border: 'none',
      padding: '13px 28px',
      borderRadius: 999,
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      transition: 'background 0.15s,transform 0.1s',
      fontFamily: 'inherit',
      marginTop: 8,
    },

    rightCol: { display: 'flex', flexDirection: 'column', gap: 14 },

    smallGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 12,
      height: 130,
    },
    smallImg: {
      borderRadius: 14,
      overflow: 'hidden',
      background: '#f0f0f0',
      height: '100%',
    },
    bigImg: {
      width: '100%',
      height: 320,
      borderRadius: 20,
      overflow: 'hidden',
      background: '#f0f0f0',
    },
    img: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    },
    imgFallback: (variant) => ({
      width: '100%',
      height: '100%',
      background: variant === 'a'
        ? 'linear-gradient(135deg,#FFD0C0,#FFAA8A)'
        : variant === 'b'
        ? 'linear-gradient(135deg,#F4F5FA,#D8DAE5)'
        : variant === 'c'
        ? 'linear-gradient(135deg,#FFE5D8,#FFB59A)'
        : 'linear-gradient(135deg,#FFE5D8,#FF8866)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: variant === 'b' ? '#5a5a7a' : '#BF3200',
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: 1,
      textTransform: 'uppercase',
    }),
  };

  /* ── Helper : rend une image éditable ou non, à index donné ── */
  const renderImage = (index, wrapStyle, fallbackVariant, label) => {
    const src = about_images[index];
    const field = `about_image_${index}`;

    if (editable) {
      return (
        <div style={wrapStyle}>
          <EditableImage
            src={src}
            onUpload={(file) => onUploadImage(field, file)}
            hint={`Photo ${index + 1}`}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: wrapStyle.borderRadius || 14,
            }}
            fallback={<div style={S.imgFallback(fallbackVariant)}>{label}</div>}
          />
        </div>
      );
    }
    return (
      <div style={wrapStyle}>
        {src
          ? <img src={src} alt="" style={S.img} />
          : <div style={S.imgFallback(fallbackVariant)}>{label}</div>}
      </div>
    );
  };

  return (
    <section style={S.section}>
      <div style={S.grid} className="supplier-about-grid">

        {/* ─────── GAUCHE ─────── */}
        <div style={S.leftCol}>

          {/* Pré-titre — read-only */}
          <div style={S.overline}>
            <span style={S.overlineLine} />
            Notre histoire
          </div>

          {/* ⭐ TITRE — éditable (2 parties : main + accent orange) */}
          {editable ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <EditableField
                value={about_title_main}
                onSave={(v) => onUpdateField('about_title_main', v)}
                maxLength={60}
                placeholder="Première partie du titre…"
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                  color: '#0a0a2a',
                  letterSpacing: -1.2,
                  lineHeight: 1.15,
                }}
              />
              <EditableField
                value={about_title_accent}
                onSave={(v) => onUpdateField('about_title_accent', v)}
                maxLength={60}
                placeholder="Deuxième partie (orange)…"
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                  color: '#FF4500',
                  letterSpacing: -1.2,
                  lineHeight: 1.15,
                }}
              />
            </div>
          ) : (
            <h2 style={S.title}>
              {about_title_main}
              <br />
              <span style={S.titleAccent}>{about_title_accent}</span>
            </h2>
          )}

          {/* ⭐ DESCRIPTION — éditable */}
          {editable ? (
            <EditableField
              value={description}
              onSave={(v) => onUpdateField('description', v)}
              multiline
              maxLength={600}
              placeholder="Décrivez votre entreprise…"
              style={{
                fontSize: 15,
                color: '#5a5a6a',
                lineHeight: 1.75,
                width: '100%',
              }}
            />
          ) : (
            <p style={S.description}>
              {description || `${company_name} est un fournisseur grossiste de confiance sur GROSHOP. La description détaillée de l'entreprise sera bientôt disponible.`}
            </p>
          )}

          {/* Méta-infos — read-only */}
          {founded_year && (
            <div style={S.metaRow}>
              <div style={S.metaItem}>
                <div style={S.metaValue}><span>{founded_year}</span></div>
                <span style={S.metaLabel}>Fondée en</span>
              </div>
              {yearsActive > 0 && (
                <div style={S.metaItem}>
                  <div style={S.metaValue}>
                    <span>{yearsActive}</span>
                    <span style={S.metaSuffix}>+</span>
                  </div>
                  <span style={S.metaLabel}>Années d'expérience</span>
                </div>
              )}
            </div>
          )}

          {/* ⭐ MISSION — éditable
              En mode editable on affiche TOUJOURS le bloc (même vide) pour permettre l'édition */}
          {(editable || mission) && (
            <div style={S.missionBlock}>
              <span style={S.missionLabel}>Notre mission</span>
              {editable ? (
                <EditableField
                  value={mission}
                  onSave={(v) => onUpdateField('mission', v)}
                  multiline
                  maxLength={300}
                  placeholder="Quelle est votre mission ?"
                  style={{
                    fontSize: 14,
                    color: '#1a1a1a',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                    width: '100%',
                  }}
                />
              ) : (
                <p style={S.missionText}>« {mission} »</p>
              )}
            </div>
          )}

          {/* CTA — non éditable */}
          <button
            style={S.ctaBtn}
            onClick={onContact}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#333')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#111')}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Contacter le fournisseur
            <i className="ti ti-arrow-right" style={{ fontSize: 16 }} aria-hidden="true" />
          </button>

        </div>

        {/* ─────── DROITE — 4 images éditables ─────── */}
        <div style={S.rightCol}>

          {/* 3 petites en haut */}
          <div style={S.smallGrid}>
            {renderImage(0, S.smallImg, 'a', 'Photo 1')}
            {renderImage(1, S.smallImg, 'b', 'Photo 2')}
            {renderImage(2, S.smallImg, 'c', 'Photo 3')}
          </div>

          {/* 1 grande en bas */}
          {renderImage(3, S.bigImg, 'd', 'Photo principale')}

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .supplier-about-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}