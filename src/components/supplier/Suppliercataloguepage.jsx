import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

import Footer from '../Footer';

/**
 * Page Catalogue d'un fournisseur — Style Stuffsus (full width)
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
  const [sortBy, setSortBy]                 = useState('popular');
  const [searchQuery, setSearchQuery]       = useState('');
  const [flags, setFlags]                   = useState({ nouveau: false, best: false, promo: false });

  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  const recoRef = useRef(null);

  /* ── Fetch data ── */
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 200));

        setSupplier({
          company_name: 'Sfax Textile Co.',
          slug,
          verification_status: 'verified',
        });

        setStore({
          brand_logo_url: 'https://www.livinx.com/img/livinx-logo-1738657124.jpg',
        });

        setCategories([
          { id: 'vetements', name: 'Vêtements homme', icon: 'ti-shirt' },
          { id: 'femme',     name: 'Vêtements femme', icon: 'ti-dress' },
          { id: 'tissus',    name: 'Tissus & rouleaux', icon: 'ti-needle-thread' },
          { id: 'linge',     name: 'Linge de maison',  icon: 'ti-bed' },
        ]);

        setProducts([
          { id: 1,  category: 'vetements', name: 'T-shirt coton premium 180g',  price: 84,  was: 110, discount: 24, rating: 4.7, soldCount: 320, moq: 50,  verified: true, isFreeShipping: true,  isBestSeller: true,  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
          { id: 2,  category: 'vetements', name: 'Chemise Oxford homme',         price: 138, rating: 4.5, soldCount: 215, moq: 30,  verified: true, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80' },
          { id: 3,  category: 'vetements', name: 'Polo piqué bicolore unisexe',  price: 108, was: 130, discount: 17, rating: 4.6, soldCount: 412, moq: 50,  verified: true, isBestSeller: true,  image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80' },
          { id: 4,  category: 'vetements', name: 'Jean slim stretch indigo',     price: 192, rating: 4.4, soldCount: 142, moq: 20,  verified: true, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' },
          { id: 5,  category: 'vetements', name: 'Hoodie zippé molleton 320g',   price: 174, rating: 4.8, soldCount: 198, moq: 25,  verified: true, isFreeShipping: true, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80' },
          { id: 6,  category: 'vetements', name: 'Veste coupe-vent imperméable', price: 236, rating: 4.3, soldCount: 87,  moq: 15,  verified: true, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80' },
          { id: 7,  category: 'tissus',    name: 'Tissu jersey premium 220g',    price: 145, rating: 4.6, soldCount: 180, moq: 1,   verified: true, isFreeShipping: true, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
          { id: 8,  category: 'tissus',    name: 'Tissu coton sergé naturel',    price: 118, rating: 4.5, soldCount: 98,  moq: 1,   verified: true, image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80' },
          { id: 9,  category: 'linge',     name: 'Drap percale 200 fils blanc',  price: 96,  was: 120, discount: 20, rating: 4.7, soldCount: 145, moq: 20,  verified: true, image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80' },
          { id: 10, category: 'linge',     name: 'Serviettes éponge 600g',       price: 74,  rating: 4.6, soldCount: 167, moq: 30,  verified: true, isBestSeller: true, image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80' },
          { id: 11, category: 'femme',     name: 'Tee-shirt oversize femme',     price: 90,  rating: 4.5, soldCount: 280, moq: 50,  verified: true, isFreeShipping: true, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80' },
          { id: 12, category: 'femme',     name: 'Short sportif microfibre',     price: 78,  rating: 4.4, soldCount: 156, moq: 30,  verified: true, image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  const catLabel = useMemo(() => {
    const m = { all: 'Tous' };
    categories.forEach((c) => { m[c.id] = c.name.split(' ')[0]; });
    return m;
  }, [categories]);

  const counts = useMemo(() => {
    const c = { all: products.length };
    products.forEach((p) => { c[p.category] = (c[p.category] || 0) + 1; });
    return c;
  }, [products]);

  const newIds = useMemo(
    () => [...products].sort((a, b) => b.id - a.id).slice(0, 4).map((p) => p.id),
    [products],
  );

  const filteredProducts = useMemo(() => {
    let list = activeCategory === 'all'
      ? [...products]
      : products.filter((p) => p.category === activeCategory);

    if (flags.best)    list = list.filter((p) => p.isBestSeller);
    if (flags.promo)   list = list.filter((p) => p.discount);
    if (flags.nouveau) list = list.filter((p) => newIds.includes(p.id));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (sortBy === 'price_asc')       list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'popular')    list.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    else if (sortBy === 'newest')     list.sort((a, b) => b.id - a.id);

    return list;
  }, [products, activeCategory, sortBy, searchQuery, flags, newIds]);

  useEffect(() => { setPage(1); }, [activeCategory, sortBy, searchQuery, flags]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  const pageItems  = filteredProducts.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const recoItems  = useMemo(
    () => [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 6),
    [products],
  );

  const toggleFlag = (k) => setFlags((f) => ({ ...f, [k]: !f[k] }));
  const scrollReco = (dir) => {
    if (recoRef.current) recoRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  const pageTitle = activeCategory === 'all'
    ? 'Tous les produits'
    : (categories.find((c) => c.id === activeCategory)?.name || 'Catalogue');

  const FILTERS = [
    { k: 'nouveau', label: 'Nouveautés',        icon: 'ti-search' },
    { k: 'best',    label: 'Meilleures ventes',  icon: 'ti-sparkles' },
    { k: 'promo',   label: 'En promotion',       icon: 'ti-rosette-discount' },
  ];

  if (loading) return <div style={loadingStyle}>Chargement du catalogue…</div>;

  return (
    <div style={pageStyle}>

      {/* ═══════════════ HERO FULL-BLEED + NAV FLOTTANTE ═══════════════ */}
      <div style={S.heroWrap} className="cat-hero-wrap">
        <div style={S.heroBg} aria-hidden="true" />
        <div style={S.heroWord} className="cat-hero-word">Catalogue</div>

        <div style={{ ...S.band, ...S.navRow }} className="cat-band">
          <nav style={S.nav}>
            <Link to={`/fournisseur/${slug}`} style={S.logo}>
              <img src={store.brand_logo_url} alt={supplier.company_name} style={{ height: 30, width: 'auto', display: 'block' }} />
            </Link>

            <div style={S.navLinks} className="cat-nav-links">
              <Link to={`/fournisseur/${slug}`} style={S.navLink}>Accueil</Link>
              <Link to={`/fournisseur/${slug}/catalogue`} style={{ ...S.navLink, color: '#141414', fontWeight: 700 }}>Catalogue</Link>
              <Link to={`/fournisseur/${slug}/contact`} style={S.navLink}>Contact us</Link>
            </div>
          </nav>
        </div>
      </div>

      {/* ═══════════════ STRIP « Tout ce qu'il vous faut » (image 3) ═══════════════ */}
      <div style={{ ...S.band, ...S.stripRow }} className="cat-band">
        <div style={S.strip} className="cat-strip">
          <h1 style={S.stripTitle}>Tout ce qu'il vous faut</h1>
          <div style={S.stripSearch}>
            <i className="ti ti-search" style={{ fontSize: 16, color: '#9a9a9a', marginRight: 10 }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Rechercher chez ${supplier.company_name}`}
              style={S.stripInput}
            />
            <button style={S.stripBtn}>Rechercher</button>
          </div>
        </div>
      </div>

      {/* ═══════════════ CONTENU (grid + reco) ═══════════════ */}
      <div style={{ ...S.contain, ...S.contentRow }} className="cat-contain">

        {/* GRID */}
        <div style={S.grid} className="cat-grid">

          {/* ── SIDEBAR (image 1) ── */}
          <aside style={S.sidebar}>
            <div style={S.sideTitle}>Catégorie</div>

            {/* Tous les produits — boîte */}
            <button
              style={{ ...S.allBox, ...(activeCategory === 'all' ? S.allBoxActive : null) }}
              onClick={() => setActiveCategory('all')}
            >
              <i className="ti ti-folder" style={{ fontSize: 17, color: activeCategory === 'all' ? '#FF4500' : '#555' }} />
              <span style={S.allLabel}>Tous les produits</span>
              <span style={S.allBadge}>{counts.all || 0}</span>
              <i className="ti ti-chevron-down" style={{ fontSize: 15, color: '#bbb', marginLeft: 6 }} />
            </button>

            {/* Arbre des catégories */}
            <div style={S.tree}>
              {categories.map((cat, idx) => {
                const isLast = idx === categories.length - 1;
                const on = activeCategory === cat.id;
                return (
                  <button key={cat.id} style={S.treeItem} className="cat-tree-item" onClick={() => setActiveCategory(cat.id)}>
                    <span style={{ ...S.vSeg, height: isLast ? '50%' : '100%' }} aria-hidden="true" />
                    <span style={S.hSeg} aria-hidden="true" />
                    <span style={{ ...S.treeIcon, ...(on ? S.treeIconOn : null) }}>
                      <i className={`ti ${cat.icon}`} style={{ fontSize: 13 }} />
                    </span>
                    <span style={{ color: on ? '#FF4500' : '#4a4a4a', fontWeight: on ? 600 : 500 }}>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Filtres */}
            <div style={{ marginTop: 10 }}>
              {FILTERS.map(({ k, label, icon }) => {
                const on = flags[k];
                return (
                  <button key={k} style={S.filterRow} className="cat-filter-row" onClick={() => toggleFlag(k)}>
                    <i className={`ti ${icon}`} style={{ fontSize: 17, color: on ? '#FF4500' : '#555' }} />
                    <span style={{ color: on ? '#FF4500' : '#333', fontWeight: on ? 600 : 500 }}>{label}</span>
                    <i
                      className="ti ti-chevron-down"
                      style={{ marginLeft: 'auto', fontSize: 15, color: '#bbb', transform: on ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}
                    />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── PRODUITS ── */}
          <main style={{ minWidth: 0 }}>

            <div style={S.prodHead}>
              <div>
                <h2 style={S.prodTitle}>{pageTitle}</h2>
                <p style={S.prodCount}>{filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}</p>
              </div>
              <div style={S.sortWrap}>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={S.sortSelect}>
                  <option value="popular">Populaires</option>
                  <option value="newest">Nouveautés</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                </select>
                <i className="ti ti-chevron-down" style={S.sortChevron} aria-hidden="true" />
              </div>
            </div>

            {pageItems.length > 0 ? (
              <div style={S.prods} className="cat-prods">
                {pageItems.map((p) => (
                  <ProductCardStuffsus key={p.id} p={p} tag={catLabel[p.category]} />
                ))}
              </div>
            ) : (
              <div style={S.empty}>
                <i className="ti ti-package-off" style={{ fontSize: 34, color: '#ccc', marginBottom: 10 }} />
                <p style={{ color: '#888', fontSize: 14 }}>Aucun produit trouvé.</p>
              </div>
            )}

            {/* ── PAGINATION ── */}
            {filteredProducts.length > 0 && (
              <div style={S.pager}>
                <button
                  style={{ ...S.pagerSide, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'default' : 'pointer' }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <i className="ti ti-arrow-left" /> Précédent
                </button>

                <div style={S.pagerNums}>
                  {buildPages(page, totalPages).map((n, i) =>
                    n === '…'
                      ? <span key={`e${i}`} style={{ ...S.pg, ...S.pgGhost }}>…</span>
                      : (
                        <button
                          key={n}
                          style={{ ...S.pg, ...(n === page ? S.pgActive : null) }}
                          onClick={() => setPage(n)}
                        >
                          {n}
                        </button>
                      ),
                  )}
                </div>

                <button
                  style={{ ...S.pagerSide, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? 'default' : 'pointer' }}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Suivant <i className="ti ti-arrow-right" />
                </button>
              </div>
            )}
          </main>
        </div>

        {/* RECO */}
        <section style={S.reco}>
          <div style={S.recoHead}>
            <h2 style={S.recoTitle}>Nos recommandations</h2>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={S.circleBtnLine} onClick={() => scrollReco(-1)} aria-label="Précédent"><i className="ti ti-arrow-left" /></button>
              <button style={S.circleBtnLine} onClick={() => scrollReco(1)} aria-label="Suivant"><i className="ti ti-arrow-right" /></button>
            </div>
          </div>
          <div ref={recoRef} style={S.recoScroll} className="cat-reco-scroll">
            {recoItems.map((p) => (
              <div key={p.id} style={{ minWidth: 260 }}>
                <ProductCardStuffsus p={p} tag={catLabel[p.category]} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 1200px) {
          .cat-band { width: 88% !important; }
        }
        @media (max-width: 1300px) {
          .cat-prods { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 1100px) {
          .cat-grid { grid-template-columns: 1fr !important; }
          .cat-hero-word { font-size: 130px !important; }
        }
        @media (max-width: 900px) {
          .cat-prods { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 680px) {
          .cat-band { width: 94% !important; }
          .cat-contain { padding-left: 18px !important; padding-right: 18px !important; }
          .cat-prods { grid-template-columns: 1fr !important; }
          .cat-nav-links { gap: 18px !important; }
          .cat-strip { flex-direction: column; align-items: flex-start !important; }
          .cat-hero-word { font-size: 80px !important; }
          .cat-hero-wrap { min-height: 340px !important; }
        }
        .cat-reco-scroll::-webkit-scrollbar { display: none; }
        .cat-thumb-img { transition: transform 0.3s ease; }
        .cat-card:hover .cat-thumb-img { transform: scale(1.05); }
        .cat-buy:hover { background: #E63E00 !important; }
        .cat-add:hover { background: #ececea !important; }
        .cat-tree-item:hover { background: #faf9f7 !important; }
        .cat-filter-row:hover { background: #faf9f7 !important; }
      `}</style>
    </div>
  );
}

/* ─────────── Carte produit (image 2) ─────────── */
function ProductCardStuffsus({ p, tag }) {
  return (
    <div style={C.card} className="cat-card">
      <div style={C.thumb}>
        <img src={p.image} alt={p.name} style={C.thumbImg} className="cat-thumb-img" loading="lazy" />
        <span style={C.tag}>{tag}</span>
      </div>

      <h3 style={C.name}>{p.name}</h3>

      <div style={C.meta}>
        <div style={C.rating}>
          <i className="ti ti-star-filled" style={{ color: '#FF4500', fontSize: 14 }} />
          <span style={{ fontWeight: 600, fontSize: 13, color: '#141414' }}>{(p.rating || 0).toFixed(1)}</span>
          <span style={{ color: '#9a9a9a', fontSize: 12.5 }}>({p.soldCount} avis)</span>
        </div>
        <div style={C.price}>
          {p.price} <span style={{ fontWeight: 500, fontSize: 11, color: '#9a9a9a' }}>TND</span>
        </div>
      </div>

      <div style={C.moq}>MOQ {p.moq} unité{p.moq > 1 ? 's' : ''}</div>

      <div style={C.btns}>
        <button style={{ ...C.btn, ...C.btnGhost }} className="cat-add">Ajouter</button>
        <button style={{ ...C.btn, ...C.btnOrange }} className="cat-buy">Commander</button>
      </div>
    </div>
  );
}

function buildPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const arr = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  arr.forEach((n, i) => {
    if (i && n - arr[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
}

/* ─────────── Styles page ─────────── */
const FONT = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif";

const pageStyle = { minHeight: '100vh', background: '#fff', fontFamily: FONT, color: '#141414', width: '100%', overflowX: 'hidden' };
const loadingStyle = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#fff', color: '#666', fontSize: 14, fontFamily: FONT,
};

const BAND    = { width: '60%', marginLeft: 'auto', marginRight: 'auto', boxSizing: 'border-box' };
const CONTAIN = { maxWidth: 1600, marginLeft: 'auto', marginRight: 'auto', paddingLeft: 40, paddingRight: 40, boxSizing: 'border-box' };

const S = {
  band: BAND,
  contain: CONTAIN,

  /* HERO */
  heroWrap: { position: 'relative', width: '100%', minHeight: 470 },
  heroBg: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 440, overflow: 'hidden',
    background: "linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.42)), url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1800&q=80') center/cover",
  },
  heroWord: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 440, display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
    fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 200, color: 'rgba(255,255,255,0.94)',
    letterSpacing: -6, textShadow: '0 8px 50px rgba(0,0,0,0.14)', pointerEvents: 'none',
  },

  /* NAV */
  navRow: { position: 'relative', zIndex: 3, paddingTop: 20 },
  nav: {
    position: 'relative', width: '100%', background: '#fff', borderRadius: 22,
    padding: '13px 26px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
    boxShadow: '0 8px 30px rgba(0,0,0,0.10)', boxSizing: 'border-box',
  },
  logo: { display: 'flex', alignItems: 'center', textDecoration: 'none' },
  navLinks: { display: 'flex', gap: 34, fontSize: 14, position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  navLink: { textDecoration: 'none', color: '#666', fontWeight: 500 },

  /* STRIP (image 3) */
  stripRow: { position: 'relative', zIndex: 4, marginTop: -58 },
  strip: {
    background: '#fff', borderRadius: 24, padding: '24px 32px', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
    boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
  },
  stripTitle: { fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 30, letterSpacing: -0.5, margin: 0 },
  stripSearch: { display: 'flex', alignItems: 'center', background: '#f6f5f3', border: '1px solid #ededed', borderRadius: 40, padding: '6px 6px 6px 22px', width: 400, maxWidth: '100%', boxSizing: 'border-box' },
  stripInput: { border: 'none', background: 'transparent', outline: 'none', flex: 1, fontFamily: FONT, fontSize: 14, color: '#141414' },
  stripBtn: { background: '#FF4500', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 32, fontFamily: FONT, fontWeight: 600, fontSize: 13, cursor: 'pointer' },

  /* CONTENU */
  contentRow: { marginTop: 40, paddingBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: '250px 1fr', gap: 32, alignItems: 'start' },

  /* ─── SIDEBAR (image 1) ─── */
  sidebar: { paddingRight: 4 },
  sideTitle: { fontSize: 18, fontWeight: 700, color: '#141414', marginBottom: 16, fontFamily: FONT },

  allBox: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px',
    borderRadius: 12, border: '1px solid #ededed', background: '#fff', cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)', fontFamily: FONT, marginBottom: 4,
  },
  allBoxActive: { border: '1px solid #FFD4BF', background: '#FFF8F4' },
  allLabel: { fontSize: 14, fontWeight: 600, color: '#141414' },
  allBadge: { marginLeft: 'auto', background: '#FF4500', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7 },

  /* Arbre */
  tree: { position: 'relative', paddingTop: 2 },
  treeItem: {
    position: 'relative', width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '7px 8px 7px 34px', background: 'transparent', border: 'none', cursor: 'pointer',
    fontFamily: FONT, fontSize: 13.5, textAlign: 'left', borderRadius: 8,
  },
  vSeg: { position: 'absolute', left: 12, top: 0, width: 1.5, background: '#e4e4e4' },
  hSeg: { position: 'absolute', left: 12, top: '50%', width: 15, height: 1.5, background: '#e4e4e4' },
  treeIcon: {
    width: 24, height: 24, borderRadius: 7, border: '1px solid #ececec', background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', flexShrink: 0,
  },
  treeIconOn: { border: '1px solid #FFD4BF', background: '#FFF3EC', color: '#FF4500' },

  /* Filtres */
  filterRow: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px',
    background: 'transparent', border: 'none', borderTop: '1px solid #f0f0f0', cursor: 'pointer',
    fontFamily: FONT, fontSize: 14, textAlign: 'left',
  },

  /* PRODUCTS HEADER */
  prodHead: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' },
  prodTitle: { fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 26, letterSpacing: -0.4, margin: '0 0 4px' },
  prodCount: { fontSize: 13, color: '#9a9a9a', margin: 0 },
  sortWrap: { position: 'relative' },
  sortSelect: {
    appearance: 'none', WebkitAppearance: 'none', padding: '10px 40px 10px 16px', background: '#fff',
    border: '1px solid #ededed', borderRadius: 12, fontSize: 13, color: '#141414', fontWeight: 600,
    cursor: 'pointer', fontFamily: FONT, outline: 'none', minWidth: 170,
  },
  sortChevron: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#9a9a9a', fontSize: 16, pointerEvents: 'none' },

  prods: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 },
  empty: { padding: 60, textAlign: 'center', background: '#faf9f7', borderRadius: 16 },

  /* PAGINATION */
  pager: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '36px 0 10px', flexWrap: 'wrap', gap: 12 },
  pagerSide: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: '#555', background: 'transparent', border: 'none', fontFamily: FONT },
  pagerNums: { display: 'flex', alignItems: 'center', gap: 6 },
  pg: { minWidth: 34, height: 34, borderRadius: 9, border: '1px solid #ededed', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#555', cursor: 'pointer', fontFamily: FONT },
  pgActive: { background: '#FF4500', color: '#fff', borderColor: '#FF4500' },
  pgGhost: { border: 'none', color: '#9a9a9a', cursor: 'default' },

  /* RECO */
  reco: { margin: '60px 0 40px' },
  recoHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  recoTitle: { fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 24, letterSpacing: -0.4, margin: 0 },
  recoScroll: { display: 'flex', gap: 22, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' },
  circleBtnLine: { width: 38, height: 38, borderRadius: '50%', border: '1px solid #ededed', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#333', fontSize: 16 },
};

/* ─────────── Styles carte (image 2) ─────────── */
const C = {
  card: { background: 'transparent' },
  thumb: { position: 'relative', width: '100%', aspectRatio: '1 / 1', background: '#f5f4f2', borderRadius: 16, overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  tag: { position: 'absolute', top: 12, right: 12, background: '#fff', color: '#333', fontSize: 11, fontWeight: 600, padding: '6px 13px', borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' },
  name: { fontWeight: 700, fontSize: 15, margin: '13px 2px 9px' },
  meta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 2px 8px' },
  rating: { display: 'flex', alignItems: 'center', gap: 5 },
  price: { fontWeight: 700, fontSize: 16 },
  moq: { fontSize: 11.5, color: '#9a9a9a', margin: '0 2px 13px' },
  btns: { display: 'flex', gap: 9 },
  btn: { flex: 1, textAlign: 'center', padding: '11px 0', borderRadius: 30, fontFamily: FONT, fontWeight: 600, fontSize: 12.5, cursor: 'pointer', border: 'none', transition: 'background 0.15s' },
  btnGhost: { background: '#f2f1ef', color: '#333' },
  btnOrange: { background: '#FF4500', color: '#fff' },
};