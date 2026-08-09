import React, { useState, useRef, useMemo } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import MobileTrending from './MobileTrending';
import ProductCard from './ProductCard';

const ORANGE_DEEP = '#ff8820'
const ORANGE = '#ff5e20'

// ── Prix : gère une fourchette via price_tiers, sinon base_price_tnd ──
function computePrice(p) {
  const base = parseFloat(p.base_price_tnd) || 0
  const tiers = p.price_tiers || []
  if (tiers.length === 0) return base

  const prices = tiers.map(t => parseFloat(t.price_tnd)).filter(n => !isNaN(n))
  if (prices.length === 0) return base

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? min : [min, max]
}

// ── Mapper Django API (ProductListSerializer) → props ProductCard ──
// Mêmes champs et mêmes noms que mapRecoProduct() dans CartPage.jsx,
// pour un rendu et un comportement identiques partout dans l'app.
function mapTrendingProduct(p) {
  return {
    id:             p.id,
    name:           p.name,
    price:          computePrice(p),
    was:            p.old_price_tnd ? parseFloat(p.old_price_tnd) : null,
    rating:         p.rating_avg ? parseFloat(p.rating_avg) : null,
    reviewCount:    p.review_count ?? null,
    soldCount:      p.sold_count,
    moq:            p.moq,
    moqUnit:        p.unit || 'pcs',
    isBestSeller:   (p.sold_count || 0) > 1000,
    isFreeShipping: p.is_free_shipping || false,
    image:          p.primary_image,
    category:       p.category_name || 'Autre',
    // supplier, verified, medals, years volontairement omis
  }
}

const DesktopTrending = ({ products = [] }) => {
  const [activeCategory, setActiveCategory] = useState('Tout');
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
    cardSlot: {
      flex: '0 0 220px',
      scrollSnapAlign: 'start',
    },
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          .trending-scroll::-webkit-scrollbar { display: none; }
        `}</style>

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
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                  aria-label="Précédent"
                >
                  ←
                </button>
                <button
                  onClick={() => scroll('right')}
                  style={styles.headerArrowBtn}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
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
                {filteredProducts.map(product => (
                  <div key={product.id} style={styles.cardSlot}>
                    {/* Cards Trending : badge Tendance, price tiers, MOQ + vendus —
                        pas de bouton "Commander". */}
                    <ProductCard
                      product={{ ...product, isTrending: true }}
                      variant="trending"
                      hideButton
                    />
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// products = données BRUTES de l'API (ex: trendingRaw), mappées ici une seule
// fois, en amont du split mobile/desktop, pour que les deux rendus reçoivent
// exactement les mêmes props ProductCard.
function CategorySection({ products = [] }) {
  const isMobile = useIsMobile();
  const mapped = useMemo(() => products.map(mapTrendingProduct), [products]);

  if (!mapped.length) return null;
  return isMobile
    ? <MobileTrending products={mapped} />
    : <DesktopTrending products={mapped} />;
}

export default CategorySection;