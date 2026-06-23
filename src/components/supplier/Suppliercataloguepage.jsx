import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';

import ProductCard from '../ProductCard';
import Footer      from '../Footer';

/**
 * Page Catalogue d'un fournisseur — Style Styleco
 * URL : /fournisseur/:slug/catalogue
 */
export default function SupplierCataloguePage() {
  const { slug } = useParams();

  const [loading, setLoading]       = useState(true);
  const [supplier, setSupplier]     = useState(null);
  const [store, setStore]           = useState(null);
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(300);

  const [openSections, setOpenSections] = useState({
    categories: false,
    price: true,
  });

  /* ── Fetch data ── */
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 200));

        setSupplier({
          company_name: 'Sfax Textile Co.',
          slug: slug,
          verification_status: 'verified',
        });

        setStore({
          brand_logo_url: 'https://www.livinx.com/img/livinx-logo-1738657124.jpg',
        });

        setCategories([
          { id: 'vetements', name: 'Vêtements homme' },
          { id: 'femme',     name: 'Vêtements femme' },
          { id: 'tissus',    name: 'Tissus & rouleaux' },
          { id: 'linge',     name: 'Linge de maison' },
        ]);

        setProducts([
          { id: 1,  category: 'vetements', name: 'T-shirt coton premium 180g',  price: 84,  was: 110, discount: 24, rating: 4.7, soldCount: 320, moq: 50,  verified: true, years: 8,  country: 'TN', isFreeShipping: true,  isBestSeller: true,  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
          { id: 2,  category: 'vetements', name: 'Chemise Oxford homme',         price: 138, rating: 4.5, soldCount: 215, moq: 30,  verified: true, years: 8,  country: 'TN', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80' },
          { id: 3,  category: 'vetements', name: 'Polo piqué bicolore unisexe',  price: 108, was: 130, discount: 17, rating: 4.6, soldCount: 412, moq: 50,  verified: true, years: 8,  country: 'TN', isBestSeller: true,  image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80' },
          { id: 4,  category: 'vetements', name: 'Jean slim stretch indigo',     price: 192, rating: 4.4, soldCount: 142, moq: 20,  verified: true, years: 8,  country: 'TN', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' },
          { id: 5,  category: 'vetements', name: 'Hoodie zippé molleton 320g',   price: 174, rating: 4.8, soldCount: 198, moq: 25,  verified: true, years: 8,  country: 'TN', isFreeShipping: true, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80' },
          { id: 6,  category: 'vetements', name: 'Veste coupe-vent imperméable', price: 236, rating: 4.3, soldCount: 87,  moq: 15,  verified: true, years: 8,  country: 'TN', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80' },
          { id: 7,  category: 'tissus',    name: 'Tissu jersey premium 220g',    price: 145, rating: 4.6, soldCount: 180, moq: 1,   verified: true, years: 8,  country: 'TN', isFreeShipping: true, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
          { id: 8,  category: 'tissus',    name: 'Tissu coton sergé naturel',    price: 118, rating: 4.5, soldCount: 98,  moq: 1,   verified: true, years: 8,  country: 'TN', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80' },
          { id: 9,  category: 'linge',     name: 'Drap percale 200 fils blanc',  price: 96,  was: 120, discount: 20, rating: 4.7, soldCount: 145, moq: 20,  verified: true, years: 8,  country: 'TN', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80' },
          { id: 10, category: 'linge',     name: 'Serviettes éponge 600g',       price: 74,  rating: 4.6, soldCount: 167, moq: 30,  verified: true, years: 8,  country: 'TN', isBestSeller: true, image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80' },
          { id: 11, category: 'femme',     name: 'Tee-shirt oversize femme',     price: 90,  rating: 4.5, soldCount: 280, moq: 50,  verified: true, years: 8,  country: 'TN', isFreeShipping: true, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80' },
          { id: 12, category: 'femme',     name: 'Short sportif microfibre',     price: 78,  rating: 4.4, soldCount: 156, moq: 30,  verified: true, years: 8,  country: 'TN', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  const PRICE_RANGE = useMemo(() => {
    if (!products.length) return { min: 0, max: 300 };
    const prices = products.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices) / 10) * 10,
      max: Math.ceil(Math.max(...prices) / 10) * 10,
    };
  }, [products]);

  useEffect(() => {
    if (products.length) {
      setPriceMin(PRICE_RANGE.min);
      setPriceMax(PRICE_RANGE.max);
    }
  }, [PRICE_RANGE.min, PRICE_RANGE.max, products.length]);

  const filteredProducts = useMemo(() => {
    let list = activeCategory === 'all'
      ? [...products]
      : products.filter((p) => p.category === activeCategory);

    list = list.filter((p) => p.price >= priceMin && p.price <= priceMax);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (sortBy === 'price_asc')       list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'popular')    list.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    else if (sortBy === 'newest')     list.sort((a, b) => b.id - a.id);

    return list;
  }, [products, activeCategory, sortBy, searchQuery, priceMin, priceMax]);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const pageTitle = useMemo(() => {
    if (activeCategory === 'all') return 'Tous les produits';
    const cat = categories.find((c) => c.id === activeCategory);
    return cat ? cat.name : 'Catalogue';
  }, [activeCategory, categories]);

  const span = PRICE_RANGE.max - PRICE_RANGE.min || 1;
  const minPercent = ((priceMin - PRICE_RANGE.min) / span) * 100;
  const maxPercent = ((priceMax - PRICE_RANGE.min) / span) * 100;

  if (loading) {
    return <div style={loadingStyle}>Chargement du catalogue…</div>;
  }

  return (
    <div style={pageStyle}>

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <header style={S.header}>
        <div style={S.headerDecor} aria-hidden="true" />

        <div style={S.headerInner} className="catalogue-header-inner">
          <div style={S.headerLeft} aria-hidden="true" />

          <Link to={`/fournisseur/${slug}`} style={S.headerLogo}>
            <img
              src={store.brand_logo_url}
              alt={supplier.company_name}
              style={{ height: 64, width: 'auto', display: 'block' }}
            />
          </Link>

          <div style={S.headerRight}>
            <div style={S.searchWrap}>
              <input
                type="text"
                placeholder="Rechercher un produit…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={S.searchInput}
                className="search-input"
              />
              <button
                type="button"
                style={S.searchBtn}
                aria-label="Rechercher"
                className="search-btn"
              >
                {/* SVG inline pour garantir le rendu, même sans Tabler Icons */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.5" y2="16.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════ BODY ═══════════════════ */}
      <div style={S.body}>
        <div style={S.bodyInner} className="catalogue-body-inner">

          {/* ─── SIDEBAR ─── */}
          <aside style={S.sidebar}>

            <div style={S.filterCard}>
              <button
                style={S.filterCardHeader}
                onClick={() => toggleSection('categories')}
              >
                <span style={S.filterCardTitle}>Catégories</span>
                <i
                  className={openSections.categories ? 'ti ti-chevron-up' : 'ti ti-chevron-down'}
                  style={{ fontSize: 16, color: '#9a9a9a' }}
                  aria-hidden="true"
                />
              </button>

              {openSections.categories && (
                <div style={S.filterCardBody}>
                  <button
                    style={{
                      ...S.categoryRow,
                      color: activeCategory === 'all' ? '#FF4500' : '#444',
                      fontWeight: activeCategory === 'all' ? 600 : 500,
                    }}
                    onClick={() => setActiveCategory('all')}
                  >
                    <span>Tous les produits</span>
                    <i className="ti ti-chevron-right" style={{ fontSize: 14, color: '#bbb' }} aria-hidden="true" />
                  </button>

                  {categories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        style={{
                          ...S.categoryRow,
                          color: isActive ? '#FF4500' : '#444',
                          fontWeight: isActive ? 600 : 500,
                        }}
                        onClick={() => setActiveCategory(cat.id)}
                      >
                        <span>{cat.name}</span>
                        <i className="ti ti-chevron-right" style={{ fontSize: 14, color: '#bbb' }} aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={S.filterCard}>
              <button
                style={S.filterCardHeader}
                onClick={() => toggleSection('price')}
              >
                <span style={S.filterCardTitle}>Prix</span>
                <i
                  className={openSections.price ? 'ti ti-chevron-up' : 'ti ti-chevron-down'}
                  style={{ fontSize: 16, color: '#9a9a9a' }}
                  aria-hidden="true"
                />
              </button>

              {openSections.price && (
                <div style={S.filterCardBody}>
                  <div style={S.rangeContainer} className="price-range">
                    <div style={S.rangeTrack}>
                      <div
                        style={{
                          ...S.rangeFill,
                          left: `${minPercent}%`,
                          right: `${100 - maxPercent}%`,
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min={PRICE_RANGE.min}
                      max={PRICE_RANGE.max}
                      step={1}
                      value={priceMin}
                      onChange={(e) => {
                        const v = Math.min(Number(e.target.value), priceMax - 1);
                        setPriceMin(v);
                      }}
                      className="price-range-input"
                    />
                    <input
                      type="range"
                      min={PRICE_RANGE.min}
                      max={PRICE_RANGE.max}
                      step={1}
                      value={priceMax}
                      onChange={(e) => {
                        const v = Math.max(Number(e.target.value), priceMin + 1);
                        setPriceMax(v);
                      }}
                      className="price-range-input"
                    />
                  </div>

                  <div style={S.priceInputs}>
                    <div style={S.priceInputWrap}>
                      <input
                        type="number"
                        value={priceMin}
                        min={PRICE_RANGE.min}
                        max={priceMax - 1}
                        onChange={(e) => setPriceMin(Number(e.target.value) || 0)}
                        style={S.priceInput}
                      />
                      <span style={S.priceCurrency}>TND</span>
                    </div>
                    <div style={S.priceInputWrap}>
                      <input
                        type="number"
                        value={priceMax}
                        min={priceMin + 1}
                        max={PRICE_RANGE.max}
                        onChange={(e) => setPriceMax(Number(e.target.value) || 0)}
                        style={S.priceInput}
                      />
                      <span style={S.priceCurrency}>TND</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </aside>

          {/* ─── COLONNE PRODUITS ─── */}
          <main style={S.productsCol}>

            <div style={S.productsHeader}>
              <div>
                <h1 style={S.pageTitle}>{pageTitle}</h1>
                <p style={S.productCount}>
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                </p>
              </div>

              <div style={S.sortWrap}>
                <label style={S.sortLabel}>Trier par</label>
                <div style={S.sortSelectWrap}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={S.sortSelect}
                  >
                    <option value="popular">Populaires</option>
                    <option value="newest">Nouveautés</option>
                    <option value="price_asc">Prix croissant</option>
                    <option value="price_desc">Prix décroissant</option>
                  </select>
                  <i
                    className="ti ti-chevron-down"
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#9a9a9a', fontSize: 16, pointerEvents: 'none' }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div style={S.productsGrid} className="catalogue-products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div style={S.empty}>
                <i className="ti ti-package-off" style={{ fontSize: 36, color: '#ccc', marginBottom: 12 }} />
                <p style={{ color: '#888', fontSize: 14 }}>
                  Aucun produit trouvé.
                </p>
              </div>
            )}
          </main>

        </div>
      </div>

      <Footer />

      <style>{`
        /* ── Responsive grille produits ── */
        @media (max-width: 1400px) {
          .catalogue-products-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 1000px) {
          .catalogue-body-inner {
            grid-template-columns: 1fr !important;
          }
          .catalogue-header-inner {
            grid-template-columns: 1fr !important;
            justify-items: center;
            gap: 20px !important;
          }
        }
        @media (max-width: 700px) {
          .catalogue-products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* ── Search focus + hover ── */
        .search-input:focus {
          border-color: #FF4500 !important;
          box-shadow: 0 0 0 4px rgba(255, 69, 0, 0.12) !important;
        }
        .search-btn:hover {
          background: #E63E00 !important;
          transform: scale(1.05);
        }

        /* ── Double range slider ── */
        .price-range {
          position: relative;
          height: 28px;
          margin: 8px 0 18px;
        }
        .price-range-input {
          position: absolute;
          left: 0;
          right: 0;
          top: 12px;
          width: 100%;
          height: 4px;
          background: none;
          pointer-events: none;
          -webkit-appearance: none;
          appearance: none;
          outline: none;
          margin: 0;
        }
        .price-range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #FF4500;
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          pointer-events: auto;
          position: relative;
          z-index: 2;
        }
        .price-range-input::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #FF4500;
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          pointer-events: auto;
        }
        .price-range-input::-webkit-slider-runnable-track {
          background: transparent;
        }
        .price-range-input::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}

/* ─── Styles ─── */
const pageStyle = {
  minHeight: '100vh',
  background: '#fff',
  fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
};

const loadingStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#fff',
  color: '#666',
  fontSize: 14,
  fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
};

const S = {
  /* HEADER — full width */
  header: {
    background: 'linear-gradient(180deg, #FFF6F0 0%, #FFEFE3 100%)',
    borderBottom: '1px solid #F5DCC8',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute',
    top: -120,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,69,0,0.08) 0%, rgba(255,69,0,0) 70%)',
    pointerEvents: 'none',
  },
  headerInner: {
    width: '100%',
    padding: '28px 48px',
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: 32,
    position: 'relative',
    boxSizing: 'border-box',
  },
  headerLeft: {},
  headerLogo: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    justifySelf: 'center',
  },
  headerRight: {
    display: 'flex',
    justifyContent: 'flex-end',
  },

  /* SEARCH BAR — bouton orange contient l'icône loupe */
  searchWrap: {
    position: 'relative',
    width: '100%',
    maxWidth: 420,
  },
  searchInput: {
    width: '100%',
    height: 52,
    padding: '0 64px 0 24px',    // padding-right pour laisser place au bouton
    background: '#fff',
    border: '2px solid #FFB89A',
    borderRadius: 28,
    fontSize: 14,
    color: '#0a0a2a',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'all 0.18s',
    boxShadow: '0 2px 8px rgba(255,69,0,0.06)',
  },
  searchBtn: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#FF4500',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s, transform 0.15s',
    boxShadow: '0 2px 6px rgba(255,69,0,0.3)',
    padding: 0,
  },

  /* BODY — full width */
  body: {
    padding: '32px 48px 80px',
  },
  bodyInner: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: 32,
    boxSizing: 'border-box',
  },

  /* SIDEBAR */
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  filterCard: {
    background: '#fff',
    border: '1px solid #ececec',
    borderRadius: 16,
    overflow: 'hidden',
  },
  filterCardHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 20px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  filterCardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#0a0a2a',
    fontFamily: "'Fraunces',serif",
  },
  filterCardBody: {
    padding: '4px 12px 16px',
  },
  categoryRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s',
    textAlign: 'left',
  },

  /* PRICE */
  rangeContainer: {
    position: 'relative',
    height: 28,
  },
  rangeTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 12,
    height: 4,
    background: '#ececec',
    borderRadius: 2,
  },
  rangeFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    background: '#FF4500',
    borderRadius: 2,
  },
  priceInputs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  priceInputWrap: {
    position: 'relative',
  },
  priceInput: {
    width: '100%',
    height: 38,
    padding: '0 44px 0 12px',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    fontSize: 13,
    color: '#0a0a2a',
    fontWeight: 600,
    textAlign: 'center',
    background: '#fff',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
  },
  priceCurrency: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: 11,
    color: '#9a9a9a',
    fontWeight: 600,
    pointerEvents: 'none',
  },

  /* PRODUCTS HEADER */
  productsCol: {
    minWidth: 0,
  },
  productsHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: '#0a0a2a',
    margin: 0,
    marginBottom: 4,
    fontFamily: "'Fraunces',serif",
    letterSpacing: -0.5,
  },
  productCount: {
    fontSize: 13,
    color: '#9a9a9a',
    margin: 0,
  },
  sortWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  sortLabel: {
    fontSize: 13,
    color: '#7a7a7a',
    fontWeight: 500,
  },
  sortSelectWrap: {
    position: 'relative',
  },
  sortSelect: {
    appearance: 'none',
    WebkitAppearance: 'none',
    padding: '10px 40px 10px 16px',
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 10,
    fontSize: 13,
    color: '#0a0a2a',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    outline: 'none',
    minWidth: 180,
  },

  /* GRID — 4 colonnes par défaut */
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 20,
  },
  empty: {
    padding: 60,
    textAlign: 'center',
    background: '#FAFAFC',
    borderRadius: 16,
  },
};