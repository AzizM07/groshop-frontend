import { useState, useEffect, useRef } from 'react';

/**
 * SupplierReviews — Carousel d'avis
 *
 * Ordre :
 *  1. Carousel d'avis (en haut)
 *  2. Résumé : note moyenne + distribution (en bas)
 *
 * Palette :
 *  ★ JAUNE (#FFB800) → étoiles uniquement
 *  ● NOIR  (#0a0a2a) → "4.6", barres de distribution
 *  ● ORANGE (#FF4500) → boutons d'action (next, progress)
 */
export default function SupplierReviews({ reviews = [] }) {
  const [currentIndex, setCurrentIndex]   = useState(0);
  const [isPaused, setIsPaused]           = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [progress, setProgress]           = useState(0);
  const timerRef    = useRef(null);
  const progressRef = useRef(null);

  const AUTOPLAY_DURATION = 5000;

  // ── Note moyenne ──
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // ── Distribution ──
  const distribution = [5, 4, 3, 2, 1].map((n) => ({
    rating: n,
    count: reviews.filter((r) => r.rating === n).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === n).length / reviews.length) * 100 : 0,
  }));

  /* ── Auto-play ── */
  useEffect(() => {
    if (isPaused || reviews.length <= 1) {
      clearInterval(progressRef.current);
      clearTimeout(timerRef.current);
      return;
    }
    setProgress(0);
    const startTime = Date.now();

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / AUTOPLAY_DURATION) * 100, 100));
    }, 30);

    timerRef.current = setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % reviews.length);
    }, AUTOPLAY_DURATION);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [isPaused, reviews.length, currentIndex]);

  /* ── Navigation clavier ── */
  useEffect(() => {
    const handler = (e) => {
      if (lightboxImage) return;
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line
  }, [lightboxImage, reviews.length]);

  if (reviews.length === 0) {
    return (
      <section style={S.section}>
        <div style={S.empty}>
          <IconChat />
          <p style={{ color: '#888', fontSize: 14, marginTop: 12 }}>
            Aucun avis disponible pour le moment.
          </p>
        </div>
      </section>
    );
  }

  const goPrev = () => setCurrentIndex((i) => (i - 1 + reviews.length) % reviews.length);
  const goNext = () => setCurrentIndex((i) => (i + 1) % reviews.length);

  const prevIndex = (currentIndex - 1 + reviews.length) % reviews.length;
  const nextIndex = (currentIndex + 1) % reviews.length;

  const current  = reviews[currentIndex];
  const previous = reviews[prevIndex];
  const next     = reviews[nextIndex];

  const renderStars = (rating, size = 22, animate = false) => (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          filled={n <= rating}
          size={size}
          animate={animate && n <= rating}
          delay={animate ? n * 0.08 : 0}
        />
      ))}
    </div>
  );

  return (
    <section style={S.section}>
      {/* ═══════════ CAROUSEL (EN HAUT) ═══════════ */}
      <div style={S.stage}>

        {reviews.length > 1 && (
          <div style={S.previewLeft}>
            <ReviewPreview review={previous} side="left" renderStars={renderStars} />
          </div>
        )}

        <div
          key={currentIndex}
          style={{ ...S.centralCard, animation: 'reviewIn 0.5s cubic-bezier(0.22, 1, 0.36, 1)' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div style={S.quoteMark}>
            <IconQuote />
          </div>

          <div style={S.starsWrap}>{renderStars(current.rating, 26, true)}</div>

          <p style={S.quote}>{current.text}</p>

          <div style={S.cardFooter}>
            <div style={S.author}>
              <div style={S.avatarRing}>
                <div style={S.avatar}>
                  {current.avatar_url ? (
                    <img src={current.avatar_url} alt={current.author_name} style={S.avatarImg} />
                  ) : (
                    <div style={S.avatarFallback}>
                      {current.author_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div style={S.authorName}>{current.author_name}</div>
                <div style={S.authorMeta}>
                  <IconCheck />
                  <span style={{ marginLeft: 4 }}>Acheteur vérifié · {current.city}</span>
                </div>
              </div>
            </div>

            {current.attached_images && current.attached_images.length > 0 && (
              <div style={S.imagesRow}>
                {current.attached_images.slice(0, 2).map((img, i) => (
                  <button
                    key={i}
                    style={S.attachedImg}
                    onClick={() => setLightboxImage({ src: img, all: current.attached_images, index: i })}
                    aria-label="Voir l'image en grand"
                    onMouseEnter={(e) => {
                      const overlay = e.currentTarget.querySelector('.atch-overlay');
                      if (overlay) overlay.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      const overlay = e.currentTarget.querySelector('.atch-overlay');
                      if (overlay) overlay.style.opacity = '0';
                    }}
                  >
                    <img src={img} alt="" style={S.attachedImgInner} />
                    <div className="atch-overlay" style={S.attachedOverlay}>
                      <IconZoom />
                    </div>
                  </button>
                ))}
                {current.attached_images.length > 2 && (
                  <button
                    style={{ ...S.moreBadge, cursor: 'pointer', border: 'none' }}
                    onClick={() => setLightboxImage({ src: current.attached_images[2], all: current.attached_images, index: 2 })}
                    aria-label="Voir plus d'images"
                  >
                    +{current.attached_images.length - 2}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {reviews.length > 1 && (
          <div style={S.previewRight}>
            <ReviewPreview review={next} side="right" renderStars={renderStars} />
          </div>
        )}
      </div>

      {/* ═══════════ CONTROLS ═══════════ */}
      {reviews.length > 1 && (
        <div style={S.controls}>
          <button
            style={S.arrowBtn}
            onClick={goPrev}
            aria-label="Avis précédent"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF4500';
              e.currentTarget.style.color = '#FF4500';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e5e5';
              e.currentTarget.style.color = '#0a0a2a';
            }}
          >
            <IconArrow direction="left" />
          </button>

          <div style={S.progressWrap}>
            <div style={S.progressTrack}>
              <div style={{ ...S.progressFill, width: `${progress}%` }} />
            </div>
            <div style={S.dots}>
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  style={{
                    ...S.dot,
                    width: i === currentIndex ? 24 : 6,
                    background: i === currentIndex ? '#FF4500' : '#d8d8d8',
                  }}
                  aria-label={`Aller à l'avis ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <button
            style={S.arrowBtnActive}
            onClick={goNext}
            aria-label="Avis suivant"
            onMouseEnter={(e) => (e.currentTarget.style.background = '#e03d00')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FF4500')}
          >
            <IconArrow direction="right" color="#fff" />
          </button>
        </div>
      )}

      {/* ═══════════ RÉSUMÉ (EN BAS) ═══════════ */}
      <div style={S.summary} className="review-summary">
        <div style={S.summaryLeft}>
          <div style={S.summaryRating}>{avgRating.toFixed(1)}</div>
          <div>
            {renderStars(Math.round(avgRating), 22)}
            <div style={S.summaryCount}>
              Basé sur <strong style={{ color: '#0a0a2a' }}>{reviews.length}</strong> avis vérifiés
            </div>
          </div>
        </div>

        <div style={S.summaryRight}>
          {distribution.map((d) => (
            <div key={d.rating} style={S.distRow}>
              <span style={S.distLabel}>
                {d.rating}
                <Star filled={true} size={12} />
              </span>
              <div style={S.distBarBg}>
                <div style={{ ...S.distBarFill, width: `${d.pct}%` }} />
              </div>
              <span style={S.distCount}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {lightboxImage && (
        <Lightbox data={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}

      <style>{`
        @keyframes reviewIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes starPop {
          0%   { opacity: 0; transform: scale(0) rotate(-30deg); }
          60%  { opacity: 1; transform: scale(1.3) rotate(10deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes lightboxFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lightboxImgIn {
          from { opacity: 0; transform: scale(0.93); }
          to   { opacity: 1; transform: scale(1);    }
        }
        @media (max-width: 900px) {
          .review-preview-left,
          .review-preview-right { display: none !important; }
        }
        @media (max-width: 700px) {
          .review-summary {
            flex-direction: column !important;
            gap: 28px !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
 *  ICÔNES SVG INLINE
 * ═══════════════════════════════════════════════════ */
function Star({ filled, size = 22, animate = false, delay = 0 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#FFB800' : 'none'}
      stroke={filled ? '#FFB800' : '#D8D8D8'}
      strokeWidth="1.5"
      style={{
        filter: filled ? 'drop-shadow(0 1px 3px rgba(255, 184, 0, 0.45))' : 'none',
        animation: animate ? `starPop 0.5s ease-out ${delay}s both` : 'none',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrow({ direction = 'right', color = '#0a0a2a' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {direction === 'left' ? (
        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function IconQuote() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#0a0a2a" aria-hidden="true">
      <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#2E7D32" style={{ verticalAlign: -2, flexShrink: 0 }} aria-hidden="true">
      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 14L7 12.06l1.41-1.41L10.94 13l4.65-4.65L17 9.76 10.94 16z" />
    </svg>
  );
}

function IconZoom() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
 *  Lightbox
 * ───────────────────────────────────────────── */
function Lightbox({ data, onClose }) {
  const [idx, setIdx] = useState(data.index || 0);
  const all = data.all || [data.src];

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + all.length) % all.length);
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % all.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [all.length, onClose]);

  return (
    <div
      style={S.lightboxOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <img
        src={all[idx]}
        alt=""
        style={S.lightboxImg}
        onClick={(e) => e.stopPropagation()}
        key={idx}
      />

      {all.length > 1 && (
        <>
          <button
            style={{ ...S.lightboxNav, left: 20 }}
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + all.length) % all.length); }}
            aria-label="Précédent"
          >
            <IconArrow direction="left" color="#fff" />
          </button>
          <button
            style={{ ...S.lightboxNav, right: 20 }}
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % all.length); }}
            aria-label="Suivant"
          >
            <IconArrow direction="right" color="#fff" />
          </button>
          <div style={S.lightboxCounter}>{idx + 1} / {all.length}</div>
        </>
      )}

      <button
        style={S.lightboxClose}
        onClick={onClose}
        aria-label="Fermer"
      >
        <IconClose />
      </button>
      <div style={S.lightboxHint}>Échap pour fermer · ← → pour naviguer</div>
    </div>
  );
}

function ReviewPreview({ review, side, renderStars }) {
  return (
    <div className={`review-preview-${side}`} style={S.preview}>
      <div style={S.previewStars}>{renderStars(review.rating, 18)}</div>
      <p style={S.previewText}>{review.text}</p>
      <div style={S.previewAuthor}>{review.author_name}</div>
      <div style={S.previewMeta}>Acheteur vérifié · {review.city}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
 *  STYLES
 * ═══════════════════════════════════════════════════ */
const S = {
  section: {
    padding: '20px 32px 80px',
    background: 'transparent',
    fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
    overflow: 'hidden',
  },

  // ── STAGE ──
  stage: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 1400,
    margin: '0 auto',
    minHeight: 400,
  },
  previewLeft: {
    position: 'absolute',
    left: 'calc(50% - 460px)',
    width: 320,
    opacity: 0.4,
    filter: 'blur(2px)',
    transform: 'scale(0.88)',
    pointerEvents: 'none',
    transition: 'all 0.4s',
  },
  previewRight: {
    position: 'absolute',
    right: 'calc(50% - 460px)',
    width: 320,
    opacity: 0.4,
    filter: 'blur(2px)',
    transform: 'scale(0.88)',
    pointerEvents: 'none',
    transition: 'all 0.4s',
  },
  preview: { padding: '32px 28px' },
  previewStars: { marginBottom: 14 },
  previewText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 1.5,
    margin: 0,
    marginBottom: 20,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  previewAuthor: { fontSize: 15, fontWeight: 600, color: '#0a0a2a' },
  previewMeta: { fontSize: 12, color: '#9a9a9a', marginTop: 2 },

  // ── CARD CENTRALE ──
  centralCard: {
    position: 'relative',
    width: '100%',
    maxWidth: 640,
    background: '#fff',
    borderRadius: 20,
    padding: '48px 48px 32px',
    boxShadow: '0 16px 48px rgba(10,10,42,0.10), 0 2px 6px rgba(10,10,42,0.04)',
    zIndex: 2,
    border: '1px solid #f0f0f0',
  },
  quoteMark: {
    position: 'absolute',
    top: 20,
    right: 24,
    opacity: 0.35,
  },
  starsWrap: { display: 'flex', justifyContent: 'center', marginBottom: 24 },
  quote: {
    fontSize: 18,
    fontWeight: 500,
    color: '#0a0a2a',
    lineHeight: 1.65,
    textAlign: 'center',
    margin: 0,
    marginBottom: 40,
    letterSpacing: -0.3,
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    paddingTop: 24,
    borderTop: '1px solid #f5f5f5',
  },
  author: { display: 'flex', alignItems: 'center', gap: 14 },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    padding: 2.5,
    background: 'linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)',
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#fff',
    padding: 2,
    boxSizing: 'border-box',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    borderRadius: '50%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#FF4500,#FF6B35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 18,
  },
  authorName: { fontSize: 15, fontWeight: 700, color: '#0a0a2a', letterSpacing: -0.2 },
  authorMeta: { fontSize: 12, color: '#888', marginTop: 3, display: 'flex', alignItems: 'center' },

  imagesRow: { display: 'flex', gap: 6, alignItems: 'center' },
  attachedImg: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    background: '#f0f0f0',
    flexShrink: 0,
    cursor: 'pointer',
    padding: 0,
    border: 'none',
    display: 'block',
  },
  attachedImgInner: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.3s ease',
  },
  attachedOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  moreBadge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    background: '#0a0a2a',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },

  // ── CONTROLS ──
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 40,
    marginBottom: 56,
    maxWidth: 500,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  arrowBtn: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: '1.5px solid #e5e5e5',
    background: '#fff',
    color: '#0a0a2a',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  arrowBtnActive: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: 'none',
    background: '#FF4500',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    fontFamily: 'inherit',
    flexShrink: 0,
    boxShadow: '0 6px 18px rgba(255,69,0,0.35)',
  },
  progressWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
  },
  progressTrack: {
    width: '100%',
    maxWidth: 220,
    height: 3,
    background: '#f0f0f0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#FF4500',
    borderRadius: 999,
    transition: 'width 30ms linear',
  },
  dots: { display: 'flex', gap: 6 },
  dot: {
    height: 6,
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.3s',
  },

  // ═══════════ RÉSUMÉ (EN BAS) ═══════════
  summary: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: '36px 48px',
    background: '#fff',
    border: '1px solid #f0f0f0',
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 56,
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  },
  summaryLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 28,
    flexShrink: 0,
  },
  // ⭐ Note moyenne — NOIR (au lieu d'orange)
  summaryRating: {
    fontSize: 76,
    fontWeight: 800,
    color: '#0a0a2a',
    letterSpacing: -4,
    lineHeight: 0.95,
    fontVariantNumeric: 'tabular-nums',
  },
  summaryCount: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
  summaryRight: {
    flex: 1,
    maxWidth: 480,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  distRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  distLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: '#0a0a2a',
    width: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  distBarBg: {
    flex: 1,
    height: 8,
    background: '#EFEFEF',
    borderRadius: 999,
    overflow: 'hidden',
  },
  // ⭐ Barre de distribution — NOIR (au lieu d'orange)
  distBarFill: {
    height: '100%',
    background: '#0a0a2a',
    borderRadius: 999,
    transition: 'width 1s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  distCount: {
    fontSize: 13,
    color: '#888',
    width: 22,
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  },

  // ── LIGHTBOX ──
  lightboxOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 24,
    animation: 'lightboxFadeIn 0.25s ease',
    cursor: 'zoom-out',
  },
  lightboxImg: {
    maxWidth: '90vw',
    maxHeight: '85vh',
    borderRadius: 14,
    objectFit: 'contain',
    display: 'block',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
    animation: 'lightboxImgIn 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    cursor: 'default',
  },
  lightboxNav: {
    position: 'fixed',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
    transition: 'background 0.2s',
  },
  lightboxCounter: {
    position: 'fixed',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(8px)',
    padding: '6px 14px',
    borderRadius: 999,
    fontVariantNumeric: 'tabular-nums',
  },
  lightboxClose: {
    position: 'fixed',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    backdropFilter: 'blur(8px)',
    fontFamily: 'inherit',
  },
  lightboxHint: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.3,
    pointerEvents: 'none',
  },

  empty: {
    maxWidth: 600,
    margin: '40px auto',
    padding: 60,
    textAlign: 'center',
    background: '#FAFAFC',
    borderRadius: 16,
  },
};