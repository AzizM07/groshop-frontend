import React, { useState, useRef } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import MobileTrending from './MobileTrending';

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

    // ═══════════ HEADER — centré, minimal ═══════════
    header: {
      textAlign: 'center',
      marginBottom: '26px',
    },
    eyebrow: {
      fontSize: '11px',
      fontWeight: 500,
      letterSpacing: '2.4px',
      textTransform: 'uppercase',
      color: '#9AA3AE',
      margin: '0 0 10px 0',
    },
    title: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '42px',
      fontWeight: 700,
      color: '#0F1419',
      letterSpacing: '-1px',
      margin: 0,
      lineHeight: 1.1,
    },
    titleNum: { color: '#ff5e20' },
    subtitle: {
      fontSize: '13.5px',
      color: '#6B7785',
      margin: '10px 0 0 0',
      fontWeight: 400,
    },

    // ═══════════ TABS — centrés ═══════════
    tabsRow: {
      borderTop: '1px solid #EDF0F2',
      paddingTop: '16px',
      marginBottom: '32px',
    },
    tabs: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '22px',
    },
    tab: (active) => ({
      background: 'none', border: 'none',
      fontSize: '11.5px',
      fontWeight: active ? 700 : 500,
      color: active ? '#ff5e20' : '#9AA3AE',
      cursor: 'pointer',
      padding: '0 0 6px 0',
      letterSpacing: '1px',
      transition: 'all 0.2s',
      borderBottom: active ? '2px solid #ff5e20' : '2px solid transparent',
      textTransform: 'uppercase',
      fontFamily: 'inherit',
    }),

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
      alignItems: 'center',
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
    scrollArrow: (side) => ({
      position: 'absolute',
      [side]: '-14px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '40px', height: '40px',
      borderRadius: '50%',
      background: '#fff',
      border: '1px solid #f0f0f0',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10,
      transition: 'all 0.2s',
      fontSize: '16px', color: '#6B35FF', fontWeight: 700,
    }),

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
      boxShadow: hovered ? '0 14px 30px rgba(107, 53, 255, 0.13)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
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
      background: '#ff5e20',
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
    starsWrap: { display: 'flex', gap: '1px' },
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

        {/* === HEADER — centré minimal === */}
        <div style={styles.header}>
          <p style={styles.eyebrow}>Actualisé toutes les heures</p>
          <h2 style={styles.title}>
            Tendances des <span style={styles.titleNum}>48H</span>
          </h2>
          <p style={styles.subtitle}>
            Produits les plus commandés cette semaine
          </p>
        </div>

        {/* === TABS === */}
        <div style={styles.tabsRow}>
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
            <div style={styles.scrollWrapper}>

              <button
                onClick={() => scroll('left')}
                style={styles.scrollArrow('left')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1a1aff, #6B35FF)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#6B35FF';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
                aria-label="Précédent"
              >
                ←
              </button>

              <button
                onClick={() => scroll('right')}
                style={styles.scrollArrow('right')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1a1aff, #6B35FF)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#6B35FF';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
                aria-label="Suivant"
              >
                →
              </button>

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
                          <div style={styles.starsWrap}>
                            {[1,2,3,4,5].map(star => (
                              <svg key={star} width="13" height="13" viewBox="0 0 24 24"
                                fill={star <= Math.round(product.rating) ? '#ff5e20' : '#E8EAED'}
                                stroke={star <= Math.round(product.rating) ? '#ff5e20' : '#E8EAED'}
                                strokeWidth="1">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            ))}
                          </div>
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