import React, { useState, useRef } from 'react';
import { Star } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import MobileTrending from './MobileTrending';

// ── Étoiles (pleines/vides selon l'arrondi) ──
function Stars({ value = 0, size = 13 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size} fill={s <= Math.round(value) ? '#FFB800' : '#E3E6EA'} stroke="none" />
      ))}
    </span>
  )
}

const DesktopTrending = ({ products = [] }) => {
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [hoveredCard, setHoveredCard] = useState(null);
  const scrollRef = useRef(null);

  const displayProducts = products;
  const categories = ['Tout', ...new Set(displayProducts.map(p => p.category).filter(Boolean))];

  const filteredProducts = activeCategory === 'Tout'
    ? displayProducts
    : displayProducts.filter(p => p.category === activeCategory);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };
  const ORANGE_DEEP = '#ff8820'
const ORANGE = '#ff5e20'
  // ===== STYLES =====
  const styles = {
    section: {
      width: '100%',
      padding: '48px 24px',
      backgroundColor: 'transparent',
      fontFamily: "'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      boxSizing: 'border-box',
      overflow: 'hidden',
    },
    container: { maxWidth: '1400px', margin: '0 auto' },

    // ═══════════ HEADER — titre seul, ligne orange en dessous du titre ═══════════
    headerRow: {
      marginBottom: '32px',
    },
    title: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '32px',
      fontWeight: 400,
      color: '#0F1419',
      letterSpacing: '-0.3px',
      margin: 0,
      lineHeight: 1.1,
      display: 'inline-block',
      paddingBottom: '14px',
      borderBottom: `3px solid ${ORANGE}`,
    },
    titleNum: { color: '#0F1419', fontWeight: 400 },

    // ═══════════ Rangée tabs + flèches — juste au-dessus des cartes produits ═══════════
    tabsAboveCards: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      gap: '16px',
      flexWrap: 'wrap',
      marginBottom: '14px',
    },
    tabs: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '20px',
    },
    tab: (active) => ({
      background: 'none', border: 'none',
      fontSize: '13px',
      fontWeight: active ? 700 : 500,
      color: active ? '#0F1419' : '#9AA3AE',
      cursor: 'pointer',
      padding: '0',
      transition: 'all 0.2s',
      fontFamily: 'inherit',
      whiteSpace: 'nowrap',
    }),

    headerArrows: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexShrink: 0,
      position: 'absolute',
      right: 0,
      top: '50%',
      transform: 'translateY(-50%)',
    },
    headerArrowBtn: {
      width: '30px', height: '30px',
      borderRadius: '50%',
      background: '#fff',
      border: '1px solid #E3E6EA',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.2s',
      fontSize: '14px', color: '#0F1419', fontWeight: 700,
      flexShrink: 0,
    },

    content: {
      display: 'grid',
      gridTemplateColumns: '300px minmax(0, 1fr)',
      gap: '24px',
      alignItems: 'stretch',
    },

    promoBanner: {
      position: 'relative',
      borderRadius: '20px',
      overflow: 'hidden',
      minHeight: '440px',
      background: 'linear-gradient(135deg, #1a1aff 0%, #6B35FF 50%, #FF4580 100%)',
      padding: '34px 26px',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(107, 53, 255, 0.25)',
    },
    promoDecoration: {
      position: 'absolute', top: '-50px', right: '-50px',
      width: '180px', height: '180px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.08)',
      pointerEvents: 'none',
    },
    promoLabel: { fontSize: '13px', fontWeight: 600, letterSpacing: '2px', opacity: 0.9, position: 'relative', zIndex: 2 },
    promoPercent: { fontSize: '80px', fontWeight: 900, lineHeight: 1, margin: '10px 0 24px 0', position: 'relative', zIndex: 2 },
    promoTitle: { fontSize: '22px', fontWeight: 800, letterSpacing: '1px', margin: 0, lineHeight: 1.3, position: 'relative', zIndex: 2 },
    promoSubtitle: { fontSize: '13px', opacity: 0.9, margin: '10px 0 0 0', position: 'relative', zIndex: 2 },
    promoButton: {
      background: '#fff', color: '#0F1419', border: 'none',
      padding: '14px 26px', borderRadius: '10px',
      fontSize: '13px', fontWeight: 700,
      cursor: 'pointer', alignSelf: 'flex-start',
      letterSpacing: '1px',
      transition: 'transform 0.2s',
      marginTop: '24px',
      position: 'relative', zIndex: 2,
    },

    rightColumn: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minWidth: 0,
      width: '100%',
    },
    scrollWrapper: { position: 'relative', width: '100%', minWidth: 0 },
    scrollContainer: {
      display: 'flex',
      gap: '16px',
      overflowX: 'auto',
      overflowY: 'hidden',
      scrollBehavior: 'smooth',
      scrollSnapType: 'x mandatory',
      padding: '6px 4px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    },

    productCard: (hovered) => ({
      flex: '0 0 220px',
      scrollSnapAlign: 'start',
      background: '#fff',
      border: '1px solid #EDF0F2',
      borderRadius: '14px',
      overflow: 'hidden',
      transition: 'all 0.25s ease',
      cursor: 'pointer',
      transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      display: 'flex',
      flexDirection: 'column',
      textDecoration: 'none',
    }),
    productImageWrap: {
      position: 'relative',
      aspectRatio: '1',
      background: '#FAFAFB',
      overflow: 'hidden',
    },
    productImage: (hovered) => ({
      width: '100%', height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.4s ease',
      transform: hovered ? 'scale(1.05)' : 'scale(1)',
    }),
    trendingBadge: {
      position: 'absolute',
      top: '10px', left: '10px',
      background: `linear-gradient(135deg, ${ORANGE_DEEP} 0%, ${ORANGE} 100%)`, 
      color: '#fff',
      padding: '4px 9px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.6px',
      textTransform: 'uppercase',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      lineHeight: 1,
    },
    productInfo: {
      padding: '12px 13px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '7px',
    },
    productName: {
      fontSize: '14.5px',
      fontWeight: 600,
      color: '#0F1419',
      margin: 0,
      minHeight: '38px',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      lineHeight: 1.3,
      letterSpacing: '-0.1px',
    },
    priceRow: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '6px',
      flexWrap: 'wrap',
    },
    newPrice: { fontSize: '19px', fontWeight: 800, color: '#0F1419', lineHeight: 1 },
    oldPrice: { fontSize: '12px', color: '#9AA3AE', textDecoration: 'line-through' },
    discountTag: { fontSize: '12px', color: '#ff5e20', fontWeight: 700 },
    ratingRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      flexWrap: 'wrap',
    },
    ratingValue: { fontSize: '12px', color: '#6B7785', fontWeight: 600 },
    reviewsCount: { fontSize: '12px', color: '#9AA3AE' },
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          .trending-scroll::-webkit-scrollbar { display: none; }
        `}</style>

        {/* === HEADER — titre seul, souligné en orange === */}
      {/* ══ En-tête — titre gras centré + petit trait, comme "Deals Of The Day" ══ */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 style={{
          fontSize: 'clamp(18px, 1.8vw, 22px)',
          fontWeight: 700,
          color: '#424141',
          margin: '0 0 10px',
          letterSpacing: '0.2px',
        }}>
          Best Sellers
        </h2>

        <div style={{
          width: '46px',
          height: '3px',
          background: ORANGE,
          borderRadius: '2px',
          margin: '0 auto',
        }} />
      </div>

        {/* === CONTENT === */}
        <div style={styles.content}>

          <div style={styles.promoBanner}>
            <div style={styles.promoDecoration} />
            <div>
              <div style={styles.promoLabel}>JUSQU'À</div>
              <div style={styles.promoPercent}>55%</div>
              <h3 style={styles.promoTitle}>QUALITÉ &<br />EXCLUSIVITÉ</h3>
              <p style={styles.promoSubtitle}>Prix grossiste Tunisie</p>
            </div>
            <button
              style={styles.promoButton}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              VOIR L'OFFRE →
            </button>
          </div>

          <div style={styles.rightColumn}>

            {/* Tabs + flèches — juste au-dessus des cartes produits */}
            <div style={styles.tabsAboveCards}>
              <div style={styles.tabs}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={styles.tab(activeCategory === cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={styles.headerArrows}>
                <button
                  onClick={() => scroll('left')}
                  style={styles.headerArrowBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F5F6F8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                  }}
                  aria-label="Précédent"
                >
                  ←
                </button>
                <button
                  onClick={() => scroll('right')}
                  style={styles.headerArrowBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F5F6F8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                  }}
                  aria-label="Suivant"
                >
                  →
                </button>
              </div>
            </div>

            <div style={styles.scrollWrapper}>
              <div
                ref={scrollRef}
                className="trending-scroll"
                style={styles.scrollContainer}
              >
                {filteredProducts.map(product => {
                  const hov = hoveredCard === product.id;
                  return (
                    <a
                      key={product.id}
                      href={`/produit/${product.id}`}
                      style={styles.productCard(hov)}
                      onMouseEnter={() => setHoveredCard(product.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div style={styles.productImageWrap}>
                        <img
                          src={product.image}
                          alt={product.name}
                          style={styles.productImage(hov)}
                          onError={e => { e.target.src = 'https://placehold.co/300x300/FAFAFB/9AA3AE?text=Produit'; }}
                        />
                        <div style={styles.trendingBadge}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="3"
                            strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                            <polyline points="17 6 23 6 23 12"/>
                          </svg>
                          Tendance
                        </div>
                      </div>

                      <div style={styles.productInfo}>
                        <h4 style={styles.productName}>{product.name}</h4>

                        <div style={styles.priceRow}>
                          <span style={styles.newPrice}>{Number(product.newPrice).toFixed(2)} TND</span>
                          {product.discount > 0 && (
                            <>
                              <span style={styles.oldPrice}>{Number(product.oldPrice).toFixed(2)} TND</span>
                              <span style={styles.discountTag}>-{product.discount}%</span>
                            </>
                          )}
                        </div>

                        <div style={styles.ratingRow}>
                          <Stars value={product.rating} size={13} />
                          <span style={styles.ratingValue}>{Number(product.rating).toFixed(1)}</span>
                          <span style={styles.reviewsCount}>
                            · {product.reviews >= 1000 ? (product.reviews / 1000).toFixed(1) + 'k' : product.reviews} avis
                          </span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

function CategorySection({ products = [] }) {
  const isMobile = useIsMobile();
  if (!products || products.length === 0) return null;
  return isMobile
    ? <MobileTrending products={products} />
    : <DesktopTrending products={products} />;
}

export default CategorySection;