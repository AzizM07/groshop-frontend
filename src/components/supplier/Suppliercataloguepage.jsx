import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

/* ⚠️ PROFONDEUR DES IMPORTS
   Ce fichier importe `../Footer`, donc il vit dans src/components/<dossier>/.
   Depuis là, lib/ est à deux niveaux. Si tu déplaces le fichier dans
   src/pages/, ces deux lignes deviennent '../lib/api' et '../components/Footer'. */
import { suppliers as suppliersApi, cart as cartApi } from '../../lib/api';
import Footer from '../Footer';

/**
 * Page Catalogue d'un fournisseur — Style Stuffsus (full width)
 * URL : /fournisseur/:slug/catalogue
 */

/* ══════════════════════════════════════════════════════════════
   POINTS DE BRANCHEMENT — les 3 seuls appels réseau de la page,
   pris tels quels dans src/lib/api.js :

     GET  /api/auth/suppliers/<slug>/            → suppliers.profile
     GET  /api/auth/suppliers/<slug>/products/   → suppliers.products
     POST /api/cart/                             → cart.add

   Le catalogue est chargé EN ENTIER une fois, puis filtré/trié/paginé
   côté client : un fournisseur a des dizaines à quelques centaines de
   références, pas des millions. Le jour où ça ne tient plus, c'est
   `api.products` qui prend les filtres en paramètres et la pagination
   qui repasse côté serveur.
   ══════════════════════════════════════════════════════════════ */
const api = {
  supplier: (slug) => suppliersApi.profile(slug),
  products: (slug) => suppliersApi.products(slug, { page_size: 200 }),
};

/* request() renvoie déjà le JSON parsé : soit {results:[…]}, soit un
   tableau nu selon l'endpoint — et `null` si la session a expiré. */
const unwrap = (res) => (Array.isArray(res) ? res : (res?.results ?? []));

/* ══════════════════════════════════════════════════════════════
   PALETTE — un seul orange pour toute la page
   ══════════════════════════════════════════════════════════════ */
const ORANGE      = '#ff5e20';
const ORANGE_DARK = '#e54a10';
const ORANGE_SOFT = 'rgba(255,94,32,0.08)';

const INK      = '#141414';
const MUTED    = '#9a9a9a';
const LINE     = '#ededed';

/* Étoiles : seul accent non-orange de la page — convention des blocs
   d'avis. Mets STAR_ON = ORANGE pour revenir à une teinte unique. */
const STAR_ON  = '#ffb800';
const STAR_OFF = '#e3e0dc';

const PLACEHOLDER = 'https://placehold.co/600x600/f5f4f2/9AA3AE?text=Produit';
const HERO_FALLBACK = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1800&q=80';

const MOQ_BUCKETS = [
  { k: 'low',  label: 'MOQ ≤ 20',    test: (m) => m <= 20 },
  { k: 'mid',  label: 'MOQ 21 à 50', test: (m) => m > 20 && m <= 50 },
  { k: 'high', label: 'MOQ > 50',    test: (m) => m > 50 },
];

const fmtPrice = (n) =>
  Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── Django → props carte ─────────────────────────────────────── */

/* Même logique que computePrice() de HomePage : les paliers priment
   sur le prix de base ; sans palier, la fourchette est un point. */
function priceRange(p) {
  const base = parseFloat(p.base_price_tnd) || 0;
  const tiers = (p.price_tiers || [])
    .map((t) => parseFloat(t.price_tnd))
    .filter((n) => !isNaN(n));

  if (!tiers.length) return [base, base];
  return [Math.min(...tiers), Math.max(...tiers)];
}

function mapProduct(p) {
  const [priceMin, priceMax] = priceRange(p);
  const old = p.old_price_tnd ? parseFloat(p.old_price_tnd) : null;

  return {
    id:          p.id,
    name:        p.name,
    /* La catégorie sert de clé de facette ET de libellé : pas besoin
       d'appeler /api/products/categories/ (qui fait du N+1). */
    category:    p.category_name || p.category?.name || 'Autre',
    price:       priceMin,
    priceMax,
    was:         old,
    discount:    old && priceMin ? Math.round((1 - priceMin / old) * 100) : null,
    rating:      p.rating_avg ? parseFloat(p.rating_avg) : 0,
    reviewCount: p.review_count ?? 0,
    soldCount:   p.sold_count || 0,
    moq:         p.moq || 1,
    unit:        p.unit || 'unités',
    /* null = le back ne renvoie pas l'info → la facette Disponibilité
       se masque d'elle-même (voir hasStockData). */
    inStock:     typeof p.in_stock === 'boolean' ? p.in_stock : null,
    isBestSeller: (p.sold_count || 0) > 1000,
    createdAt:   p.created_at ? new Date(p.created_at).getTime() : 0,
    image:       p.primary_image || p.images?.[0]?.url || PLACEHOLDER,
  };
}

export default function SupplierCataloguePage() {
  const { slug } = useParams();

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [store, setStore]       = useState(null);
  const [products, setProducts] = useState([]);

  /* ── Filtres ── */
  const [selectedCats, setSelectedCats] = useState([]);
  const [moqBuckets, setMoqBuckets]     = useState([]);
  const [priceRangeSel, setPriceRange]  = useState(null);
  const [minRating, setMinRating]       = useState(null);
  const [flags, setFlags]               = useState({ nouveau: false, best: false, promo: false });
  const [stock, setStock]               = useState({ in: false, out: false });

  const [sortBy, setSortBy]           = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  const recoRef = useRef(null);

  /* ── Chargement ── */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [sup, prods] = await Promise.all([api.supplier(slug), api.products(slug)]);
        if (cancelled) return;

        /* request() renvoie null si la session a expiré sur un endpoint
           protégé — ici ça vaut « pas de fournisseur à afficher ». */
        if (!sup) {
          setError('Fournisseur introuvable.');
          return;
        }

        /* Selon la forme renvoyée par /auth/suppliers/<slug>/, les champs
           du SupplierStore sont soit imbriqués, soit à plat. */
        setSupplier(sup);
        setStore(sup.store ?? sup.supplier_store ?? sup);
        setProducts(unwrap(prods).map(mapProduct));
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        /* request() lève une Error portant le message du back : DRF
           renvoie « Not found. » sur un slug inconnu. */
        setError(
          /not found|introuvable/i.test(err?.message || '')
            ? 'Fournisseur introuvable.'
            : 'Erreur de chargement du catalogue.',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  /* ── Facettes dérivées du catalogue réel ── */
  const categories = useMemo(() => {
    const m = new Map();
    products.forEach((p) => m.set(p.category, (m.get(p.category) || 0) + 1));
    return [...m.entries()]
      .map(([name, count]) => ({ id: name, name, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  /* Nouveautés = les 8 références les plus récentes */
  const newIds = useMemo(
    () => [...products].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8).map((p) => p.id),
    [products],
  );

  const hasStockData = useMemo(() => products.some((p) => p.inStock !== null), [products]);

  const promoCounts = useMemo(() => ({
    nouveau: products.filter((p) => newIds.includes(p.id)).length,
    best:    products.filter((p) => p.isBestSeller).length,
    promo:   products.filter((p) => p.discount).length,
  }), [products, newIds]);

  const bounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 100 };
    return {
      min: Math.floor(Math.min(...products.map((p) => p.price))),
      max: Math.ceil(Math.max(...products.map((p) => p.priceMax))),
    };
  }, [products]);

  useEffect(() => {
    if (products.length) setPriceRange([bounds.min, bounds.max]);
  }, [bounds.min, bounds.max, products.length]);

  /* ── Filtrage ── */
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCats.length) list = list.filter((p) => selectedCats.includes(p.category));

    if (moqBuckets.length) {
      list = list.filter((p) =>
        moqBuckets.some((k) => MOQ_BUCKETS.find((b) => b.k === k)?.test(p.moq)),
      );
    }

    if (priceRangeSel) {
      list = list.filter(
        (p) => p.priceMax >= priceRangeSel[0] && p.price <= priceRangeSel[1],
      );
    }

    if (minRating) list = list.filter((p) => p.rating >= minRating);

    if (flags.best)    list = list.filter((p) => p.isBestSeller);
    if (flags.promo)   list = list.filter((p) => p.discount);
    if (flags.nouveau) list = list.filter((p) => newIds.includes(p.id));

    if (stock.in !== stock.out) list = list.filter((p) => (stock.in ? p.inStock : p.inStock === false));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (sortBy === 'price_asc')       list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'popular')    list.sort((a, b) => b.soldCount - a.soldCount);
    else if (sortBy === 'newest')     list.sort((a, b) => b.createdAt - a.createdAt);

    return list;
  }, [products, selectedCats, moqBuckets, priceRangeSel, minRating, flags, stock, searchQuery, sortBy, newIds]);

  useEffect(() => {
    setPage(1);
  }, [selectedCats, moqBuckets, priceRangeSel, minRating, flags, stock, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  const pageItems  = filteredProducts.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const firstShown = filteredProducts.length ? (page - 1) * PER_PAGE + 1 : 0;
  const lastShown  = Math.min(page * PER_PAGE, filteredProducts.length);

  const recoItems = useMemo(
    () => [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 6),
    [products],
  );

  /* ── Handlers ── */
  const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const toggleCat = (id) => setSelectedCats((a) => toggleIn(a, id));
  const toggleMoq = (k) => setMoqBuckets((a) => toggleIn(a, k));
  const toggleFlag = (k) => setFlags((f) => ({ ...f, [k]: !f[k] }));
  const toggleStock = (k) => setStock((s) => ({ ...s, [k]: !s[k] }));
  const toggleRating = (n) => setMinRating((r) => (r === n ? null : n));

  const filtersActive =
    selectedCats.length > 0 ||
    moqBuckets.length > 0 ||
    minRating !== null ||
    flags.nouveau || flags.best || flags.promo ||
    stock.in || stock.out ||
    (priceRangeSel && (priceRangeSel[0] !== bounds.min || priceRangeSel[1] !== bounds.max));

  const resetFilters = () => {
    setSelectedCats([]);
    setMoqBuckets([]);
    setMinRating(null);
    setFlags({ nouveau: false, best: false, promo: false });
    setStock({ in: false, out: false });
    setPriceRange([bounds.min, bounds.max]);
  };

  const scrollReco = (dir) => {
    if (recoRef.current) recoRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  const PROMOS = [
    { k: 'nouveau', label: 'Nouveautés' },
    { k: 'best',    label: 'Meilleures ventes' },
    { k: 'promo',   label: 'En promotion' },
  ].filter((f) => promoCounts[f.k] > 0);

  const pct = (v) => ((v - bounds.min) / Math.max(1, bounds.max - bounds.min)) * 100;

  /* ── Données d'affichage ── */
  const companyName = supplier?.company_name || 'Fournisseur';
  const logoUrl     = store?.brand_logo_url || store?.logo || null;
  const heroUrl     = store?.banner_url || store?.banner || HERO_FALLBACK;

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={S.fatal}>
          <p style={{ fontSize: 15, color: '#555', marginBottom: 16 }}>{error}</p>
          <Link to="/" style={S.fatalLink}>Retour à l'accueil</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={pageStyle}>

      {/* ═══════════════ HERO FULL-BLEED + NAV FLOTTANTE ═══════════════ */}
      <div style={S.heroWrap} className="cat-hero-wrap">
        <div
          style={{
            ...S.heroBg,
            backgroundImage: `linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.42)), url('${heroUrl}')`,
          }}
          aria-hidden="true"
        />
        <div style={S.heroWord} className="cat-hero-word">Catalogue</div>

        <div style={{ ...S.band, ...S.navRow }} className="cat-band">
          <nav style={S.nav}>
            <Link to={`/fournisseur/${slug}`} style={S.logo}>
              {logoUrl
                ? <img src={logoUrl} alt={companyName} style={{ height: 30, width: 'auto', display: 'block' }} />
                : <span style={S.logoText}>{companyName}</span>}
            </Link>

            <div style={S.navLinks} className="cat-nav-links">
              <Link to={`/fournisseur/${slug}`} style={S.navLink}>Accueil</Link>
              <Link to={`/fournisseur/${slug}/catalogue`} style={{ ...S.navLink, color: INK, fontWeight: 700 }}>Catalogue</Link>
              <Link to={`/fournisseur/${slug}/contact`} style={S.navLink}>Contact us</Link>
            </div>
          </nav>
        </div>
      </div>

      {/* ═══════════════ STRIP ═══════════════ */}
      <div style={{ ...S.band, ...S.stripRow }} className="cat-band">
        <div style={S.strip} className="cat-strip">
          <h1 style={S.stripTitle}>Tout ce qu'il vous faut</h1>
          <div style={S.stripSearch}>
            <SearchIcon />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Rechercher chez ${companyName}`}
              style={S.stripInput}
            />
            <button style={S.stripBtn} className="cat-buy">Rechercher</button>
          </div>
        </div>
      </div>

      {/* ═══════════════ CONTENU ═══════════════ */}
      <div style={{ ...S.contain, ...S.contentRow }} className="cat-contain">

        <div style={S.grid} className="cat-grid">

          {/* ═══════ SIDEBAR ═══════ */}
          <aside style={S.sidebar}>
            <div style={S.filterHead}>
              <h2 style={S.filterTitle}>Filtres</h2>
              {filtersActive && (
                <button style={S.clearBtn} onClick={resetFilters}>Tout effacer</button>
              )}
            </div>

            {loading ? (
              <SkeletonSidebar />
            ) : (
              <>
                {categories.length > 1 && (
                  <FilterSection title="Par catégorie">
                    {categories.map((c) => (
                      <CheckRow
                        key={c.id}
                        label={c.name}
                        count={c.count}
                        checked={selectedCats.includes(c.id)}
                        onToggle={() => toggleCat(c.id)}
                      />
                    ))}
                  </FilterSection>
                )}

                <FilterSection title="Par quantité minimum">
                  {MOQ_BUCKETS.map((b) => (
                    <CheckRow
                      key={b.k}
                      label={b.label}
                      checked={moqBuckets.includes(b.k)}
                      onToggle={() => toggleMoq(b.k)}
                    />
                  ))}
                </FilterSection>

                <FilterSection title="Prix">
                  <div style={S.priceValue}>
                    {priceRangeSel ? `${priceRangeSel[0]} TND – ${priceRangeSel[1]} TND` : '—'}
                  </div>
                  {priceRangeSel && (
                    <div style={S.sliderWrap}>
                      <span style={S.sliderTrack} aria-hidden="true" />
                      <span
                        style={{
                          ...S.sliderFill,
                          left: `${pct(priceRangeSel[0])}%`,
                          width: `${pct(priceRangeSel[1]) - pct(priceRangeSel[0])}%`,
                        }}
                        aria-hidden="true"
                      />
                      <input
                        type="range"
                        className="cat-range"
                        aria-label="Prix minimum"
                        min={bounds.min}
                        max={bounds.max}
                        value={priceRangeSel[0]}
                        onChange={(e) =>
                          setPriceRange(([, hi]) => [Math.min(Number(e.target.value), hi - 1), hi])
                        }
                        style={{ zIndex: 4 }}
                      />
                      <input
                        type="range"
                        className="cat-range"
                        aria-label="Prix maximum"
                        min={bounds.min}
                        max={bounds.max}
                        value={priceRangeSel[1]}
                        onChange={(e) =>
                          setPriceRange(([lo]) => [lo, Math.max(Number(e.target.value), lo + 1)])
                        }
                        style={{ zIndex: 5 }}
                      />
                    </div>
                  )}
                </FilterSection>

                <FilterSection title="Note">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <button
                      key={n}
                      style={S.checkRow}
                      className="cat-check-row"
                      onClick={() => toggleRating(n)}
                    >
                      <Box checked={minRating === n} />
                      <Stars value={n} size={14} />
                      <span style={S.starLabel}>{n === 5 ? '5 étoiles' : `${n} et plus`}</span>
                    </button>
                  ))}
                </FilterSection>

                {PROMOS.length > 0 && (
                  <FilterSection title="Promotions" last={!hasStockData}>
                    {PROMOS.map(({ k, label }) => (
                      <CheckRow
                        key={k}
                        label={label}
                        count={promoCounts[k]}
                        checked={flags[k]}
                        onToggle={() => toggleFlag(k)}
                      />
                    ))}
                  </FilterSection>
                )}

                {/* Masquée tant que le back ne renvoie pas `in_stock` */}
                {hasStockData && (
                  <FilterSection title="Disponibilité" last>
                    <CheckRow label="En stock" checked={stock.in} onToggle={() => toggleStock('in')} />
                    <CheckRow label="Rupture de stock" checked={stock.out} onToggle={() => toggleStock('out')} />
                  </FilterSection>
                )}
              </>
            )}
          </aside>

          {/* ═══════ PRODUITS ═══════ */}
          <main style={{ minWidth: 0 }}>

            <div style={S.resultsBar} className="cat-results-bar">
              <p style={S.resultsText}>
                {loading
                  ? 'Chargement du catalogue…'
                  : `Affichage ${firstShown}–${lastShown} sur ${filteredProducts.length} résultat${filteredProducts.length > 1 ? 's' : ''}`}
              </p>
              <div style={S.sortGroup}>
                <span style={S.sortLabel}>Trier par :</span>
                <div style={S.sortWrap}>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={S.sortSelect}>
                    <option value="popular">Populaires</option>
                    <option value="newest">Nouveautés</option>
                    <option value="price_asc">Prix croissant</option>
                    <option value="price_desc">Prix décroissant</option>
                  </select>
                  <ChevronIcon style={S.sortChevron} />
                </div>
              </div>
            </div>

            {loading ? (
              <div style={S.prods} className="cat-prods">
                {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : pageItems.length > 0 ? (
              <div style={S.prods} className="cat-prods">
                {pageItems.map((p) => <ProductCardStuffsus key={p.id} p={p} />)}
              </div>
            ) : (
              <div style={S.empty}>
                <p style={{ color: '#888', fontSize: 14, marginBottom: 14 }}>
                  {products.length === 0
                    ? 'Ce fournisseur n\'a pas encore publié de produit.'
                    : 'Aucun produit ne correspond à ces filtres.'}
                </p>
                {filtersActive && (
                  <button style={S.emptyBtn} className="cat-buy" onClick={resetFilters}>Effacer les filtres</button>
                )}
              </div>
            )}

            {!loading && filteredProducts.length > 0 && (
              <div style={S.pager}>
                <button
                  style={{ ...S.pagerSide, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'default' : 'pointer' }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ArrowIcon dir="left" /> Précédent
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
                  Suivant <ArrowIcon dir="right" />
                </button>
              </div>
            )}
          </main>
        </div>

        {/* RECO */}
        {!loading && recoItems.length > 0 && (
          <section style={S.reco}>
            <div style={S.recoHead}>
              <h2 style={S.recoTitle}>Nos recommandations</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={S.circleBtnLine} onClick={() => scrollReco(-1)} aria-label="Précédent"><ArrowIcon dir="left" /></button>
                <button style={S.circleBtnLine} onClick={() => scrollReco(1)} aria-label="Suivant"><ArrowIcon dir="right" /></button>
              </div>
            </div>
            <div ref={recoRef} style={S.recoScroll} className="cat-reco-scroll">
              {recoItems.map((p) => (
                <div key={p.id} style={{ minWidth: 260 }}>
                  <ProductCardStuffsus p={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />

      <style>{`
        @media (max-width: 1200px) { .cat-band { width: 88% !important; } }
        @media (max-width: 1300px) { .cat-prods { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 1100px) {
          .cat-grid { grid-template-columns: 1fr !important; }
          .cat-hero-word { font-size: 130px !important; }
        }
        @media (max-width: 900px) { .cat-prods { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 680px) {
          .cat-band { width: 94% !important; }
          .cat-contain { padding-left: 18px !important; padding-right: 18px !important; }
          .cat-prods { grid-template-columns: 1fr !important; }
          .cat-nav-links { gap: 18px !important; }
          .cat-strip { flex-direction: column; align-items: flex-start !important; }
          .cat-hero-word { font-size: 80px !important; }
          .cat-hero-wrap { min-height: 340px !important; }
          .cat-results-bar { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
        }
        .cat-reco-scroll::-webkit-scrollbar { display: none; }
        .cat-thumb-img { transition: transform 0.35s ease; }
        .cat-card { transition: border-color 0.18s, box-shadow 0.18s; }
        .cat-card:hover { border-color: #e3e0dc !important; box-shadow: 0 8px 26px rgba(0,0,0,0.07); }
        .cat-card:hover .cat-thumb-img { transform: scale(1.05); }
        .cat-buy:hover { background: ${ORANGE_DARK} !important; }
        .cat-check-row:hover { background: #faf9f7 !important; }
        .cat-skeleton { animation: cat-pulse 1.5s ease-in-out infinite; }
        @keyframes cat-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }

        .cat-range {
          position: absolute; left: 0; top: 0;
          width: 100%; height: 4px; margin: 0;
          background: transparent; pointer-events: none;
          -webkit-appearance: none; appearance: none;
        }
        .cat-range:focus { outline: none; }
        .cat-range::-webkit-slider-thumb {
          -webkit-appearance: none; pointer-events: auto;
          width: 16px; height: 16px; border-radius: 50%;
          background: ${ORANGE}; border: 2px solid #fff;
          box-shadow: 0 1px 5px rgba(0,0,0,0.25); cursor: pointer;
        }
        .cat-range::-moz-range-thumb {
          pointer-events: auto;
          width: 16px; height: 16px; border-radius: 50%;
          background: ${ORANGE}; border: 2px solid #fff;
          box-shadow: 0 1px 5px rgba(0,0,0,0.25); cursor: pointer;
        }
        .cat-range:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 4px ${ORANGE_SOFT}; }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ICÔNES — SVG inline. La webfont Tabler n'est pas chargée sur
   cette page : les <i className="ti …"> sortaient vides.
   ══════════════════════════════════════════════════════════════ */
const STAR_D = 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';

function Stars({ value = 0, size = 14 }) {
  const gap = 2;
  const total = size * 5 + gap * 4;
  const ratio = Math.max(0, Math.min(1, value / 5));

  const row = (color) => (
    <span style={{ display: 'inline-flex', gap, width: total, flexShrink: 0 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }} aria-hidden="true">
          <path d={STAR_D} fill={color} />
        </svg>
      ))}
    </span>
  );

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', width: total, height: size, flexShrink: 0 }}
      role="img"
      aria-label={`${value} sur 5`}
    >
      {row(STAR_OFF)}
      <span style={{ position: 'absolute', top: 0, left: 0, width: `${ratio * 100}%`, height: size, overflow: 'hidden' }}>
        {row(STAR_ON)}
      </span>
    </span>
  );
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" style={{ marginRight: 10, flexShrink: 0 }} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="M20 20l-4.5-4.5" />
    </svg>
  );
}

function ChevronIcon({ style }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ArrowIcon({ dir = 'right' }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: dir === 'left' ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M3 4h2.2l2.4 12.1a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3L21 8H6" />
    </svg>
  );
}

/* ─────────── Skeletons ─────────── */
function SkeletonCard() {
  return (
    <div style={C.card} className="cat-skeleton">
      <div style={{ ...C.thumb, background: '#f0efed' }} />
      <div style={{ ...C.body, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ height: 10, width: '35%', borderRadius: 4, background: '#f0efed' }} />
        <div style={{ height: 13, width: '85%', borderRadius: 4, background: '#f0efed' }} />
        <div style={{ height: 13, width: '45%', borderRadius: 4, background: '#f0efed' }} />
        <div style={{ height: 18, width: '60%', borderRadius: 4, background: '#f0efed' }} />
        <div style={{ height: 40, width: '100%', borderRadius: 30, background: '#f0efed', marginTop: 4 }} />
      </div>
    </div>
  );
}

function SkeletonSidebar() {
  return (
    <div className="cat-skeleton" style={{ paddingTop: 18 }}>
      {[...Array(4)].map((_, s) => (
        <div key={s} style={{ marginBottom: 26 }}>
          <div style={{ height: 12, width: '45%', borderRadius: 4, background: '#f0efed', marginBottom: 14 }} />
          {[...Array(3)].map((__, r) => (
            <div key={r} style={{ height: 11, width: '75%', borderRadius: 4, background: '#f4f3f1', marginBottom: 11 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─────────── Sidebar ─────────── */
function FilterSection({ title, children, last }) {
  return (
    <div style={{ ...S.section, ...(last ? { borderBottom: 'none' } : null) }}>
      <div style={S.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function Box({ checked }) {
  return (
    <span style={{ ...S.box, ...(checked ? S.boxOn : null) }}>
      {checked && <CheckIcon />}
    </span>
  );
}

function CheckRow({ label, count, checked, onToggle }) {
  return (
    <button style={S.checkRow} className="cat-check-row" onClick={onToggle}>
      <Box checked={checked} />
      <span style={{ color: checked ? INK : '#555', fontWeight: checked ? 600 : 500 }}>{label}</span>
      {count !== undefined && <span style={S.rowCount}>{count}</span>}
    </button>
  );
}

/* ─────────── Carte produit ─────────── */
function ProductCardStuffsus({ p }) {
  const min = p.price;
  const max = p.priceMax;

  /* 'idle' | 'loading' | 'done' | 'auth' | 'error' */
  const [cartState, setCartState] = useState('idle');

  const addToCart = async (e) => {
    /* La carte est un <Link> : sans ça, le clic naviguerait vers la fiche. */
    e.preventDefault();
    e.stopPropagation();
    if (cartState === 'loading') return;

    setCartState('loading');
    try {
      /* Quantité = MOQ : en B2B, ajouter moins n'a pas de sens.
         Les produits à variantes se règlent sur la fiche produit —
         cart.add accepte un 3ᵉ argument variantId. */
      const res = await cartApi.add(p.id, p.moq);
      /* request() renvoie null quand la session a expiré. */
      setCartState(res === null ? 'auth' : 'done');
    } catch (err) {
      console.error(err);
      setCartState('error');
    }
    setTimeout(() => setCartState('idle'), 2600);
  };

  const cartLabel = {
    idle:    'Ajouter au panier',
    loading: 'Ajout…',
    done:    'Ajouté au panier',
    auth:    'Connectez-vous',
    error:   'Réessayer',
  }[cartState];

  const cartIdle = cartState === 'idle' || cartState === 'loading';

  return (
    <Link to={`/produit/${p.id}`} style={C.card} className="cat-card">
      <div style={C.thumb}>
        <img src={p.image} alt={p.name} style={C.thumbImg} className="cat-thumb-img" loading="lazy" />
      </div>

      <div style={C.body}>
        {p.category && <div style={C.cat}>{p.category}</div>}

        <h3 style={C.name}>{p.name}</h3>

        <div style={C.rating}>
          <Stars value={p.rating} size={17} />
          <span style={C.ratingValue}>
            {p.rating.toFixed(1).replace('.', ',')} / 5
          </span>
          <span style={C.ratingLink}>{p.reviewCount} avis</span>
        </div>

        <div style={C.price}>
          {min === max ? fmtPrice(min) : `${fmtPrice(min)}–${fmtPrice(max)}`}
          <span style={C.priceUnit}>TND</span>
        </div>

        <div style={C.meta}>
          MOQ {p.moq} {p.unit}
          {p.soldCount ? <span style={C.dot}>•</span> : null}
          {p.soldCount ? `${p.soldCount} vendus` : null}
        </div>

        <button
          style={{ ...C.btnCart, ...(cartIdle ? null : C.btnCartAlt) }}
          className={cartIdle ? 'cat-buy' : undefined}
          onClick={addToCart}
          disabled={cartState === 'loading'}
        >
          {cartState === 'done' ? <CheckIcon /> : <CartIcon />}
          {cartLabel}
        </button>
      </div>
    </Link>
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

const pageStyle = { minHeight: '100vh', background: '#fff', fontFamily: FONT, color: INK, width: '100%', overflowX: 'hidden' };

const BAND    = { width: '60%', marginLeft: 'auto', marginRight: 'auto', boxSizing: 'border-box' };
const CONTAIN = { maxWidth: 1600, marginLeft: 'auto', marginRight: 'auto', paddingLeft: 40, paddingRight: 40, boxSizing: 'border-box' };

const S = {
  band: BAND,
  contain: CONTAIN,

  fatal: {
    minHeight: '60vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40,
  },
  fatalLink: { color: ORANGE, fontSize: 14, fontWeight: 600, textDecoration: 'none' },

  /* HERO */
  heroWrap: { position: 'relative', width: '100%', minHeight: 470 },
  heroBg: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 440, overflow: 'hidden',
    backgroundSize: 'cover', backgroundPosition: 'center',
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
    boxShadow: '0 8px 30px rgba(0,0,0,0.10)', boxSizing: 'border-box', minHeight: 56,
  },
  logo: { display: 'flex', alignItems: 'center', textDecoration: 'none' },
  logoText: { fontSize: 16, fontWeight: 700, color: INK, letterSpacing: -0.3 },
  navLinks: { display: 'flex', gap: 34, fontSize: 14, position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  navLink: { textDecoration: 'none', color: '#666', fontWeight: 500 },

  /* STRIP */
  stripRow: { position: 'relative', zIndex: 4, marginTop: -58 },
  strip: {
    background: '#fff', borderRadius: 24, padding: '24px 32px', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
    boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
  },
  stripTitle: { fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 30, letterSpacing: -0.5, margin: 0 },
  stripSearch: { display: 'flex', alignItems: 'center', background: '#f6f5f3', border: `1px solid ${LINE}`, borderRadius: 40, padding: '6px 6px 6px 22px', width: 400, maxWidth: '100%', boxSizing: 'border-box' },
  stripInput: { border: 'none', background: 'transparent', outline: 'none', flex: 1, fontFamily: FONT, fontSize: 14, color: INK, minWidth: 0 },
  stripBtn: { background: ORANGE, color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 32, fontFamily: FONT, fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'background 0.15s', flexShrink: 0 },

  /* CONTENU */
  contentRow: { marginTop: 40, paddingBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: '250px 1fr', gap: 40, alignItems: 'start' },

  /* SIDEBAR */
  sidebar: { paddingRight: 4 },
  filterHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 },
  filterTitle: { fontSize: 17, fontWeight: 700, color: INK, margin: 0, fontFamily: FONT },
  clearBtn: {
    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
    fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: ORANGE,
  },

  section: { borderBottom: '1px solid #f2f1ef', padding: '16px 0 14px' },
  sectionTitle: { fontSize: 13.5, fontWeight: 700, color: INK, marginBottom: 8, fontFamily: FONT },

  checkRow: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px',
    background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer',
    fontFamily: FONT, fontSize: 13.5, textAlign: 'left', transition: 'background 0.15s',
  },
  box: {
    width: 16, height: 16, borderRadius: 4, border: '1px solid #d6d4d0', background: '#fff',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    transition: 'background 0.15s, border-color 0.15s',
  },
  boxOn: { background: ORANGE, borderColor: ORANGE },
  rowCount: { marginLeft: 'auto', fontSize: 12, color: MUTED, fontWeight: 500 },
  starLabel: { fontSize: 12.5, color: '#666', fontWeight: 500 },

  priceValue: { fontSize: 13, fontWeight: 600, color: '#555', margin: '2px 0 16px' },
  sliderWrap: { position: 'relative', height: 16, margin: '0 8px 6px' },
  sliderTrack: { position: 'absolute', left: 0, right: 0, top: 6, height: 4, borderRadius: 2, background: '#eceae7' },
  sliderFill: { position: 'absolute', top: 6, height: 4, borderRadius: 2, background: ORANGE },

  /* BARRE DE RÉSULTATS */
  resultsBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    paddingBottom: 16, marginBottom: 26, borderBottom: '1px solid #f2f1ef', flexWrap: 'wrap',
  },
  resultsText: { fontSize: 13.5, color: '#6b6b6b', margin: 0 },
  sortGroup: { display: 'flex', alignItems: 'center', gap: 12 },
  sortLabel: { fontSize: 13.5, color: '#6b6b6b' },
  sortWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  sortSelect: {
    appearance: 'none', WebkitAppearance: 'none', padding: '10px 40px 10px 16px', background: '#fff',
    border: `1px solid ${LINE}`, borderRadius: 10, fontSize: 13, color: INK, fontWeight: 600,
    cursor: 'pointer', fontFamily: FONT, outline: 'none', minWidth: 170,
  },
  sortChevron: { position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },

  prods: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 },
  empty: { padding: 60, textAlign: 'center', background: '#faf9f7', borderRadius: 16 },
  emptyBtn: {
    background: ORANGE, color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 30,
    fontFamily: FONT, fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'background 0.15s',
  },

  /* PAGINATION */
  pager: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '36px 0 10px', flexWrap: 'wrap', gap: 12 },
  pagerSide: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: '#555', background: 'transparent', border: 'none', fontFamily: FONT, cursor: 'pointer' },
  pagerNums: { display: 'flex', alignItems: 'center', gap: 6 },
  pg: { minWidth: 34, height: 34, borderRadius: 9, border: `1px solid ${LINE}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#555', cursor: 'pointer', fontFamily: FONT },
  pgActive: { background: ORANGE, color: '#fff', borderColor: ORANGE },
  pgGhost: { border: 'none', color: MUTED, cursor: 'default' },

  /* RECO */
  reco: { margin: '60px 0 40px' },
  recoHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  recoTitle: { fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 24, letterSpacing: -0.4, margin: 0 },
  recoScroll: { display: 'flex', gap: 22, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' },
  circleBtnLine: { width: 38, height: 38, borderRadius: '50%', border: `1px solid ${LINE}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#333' },
};

/* ─────────── Styles carte ─────────── */
const C = {
  card: {
    background: '#fff', border: `1px solid ${LINE}`, borderRadius: 18, padding: 12,
    display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit',
  },
  thumb: { position: 'relative', width: '100%', aspectRatio: '1 / 1', background: '#f5f4f2', borderRadius: 12, overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },

  /* ⚠️ Une seule graisse forte sur la carte : le PRIX (700).
     Tout le reste plafonne à 500. */
  body: { padding: '13px 4px 2px' },
  cat: { fontSize: 11.5, color: MUTED, fontWeight: 400, marginBottom: 5 },
  name: { fontWeight: 500, fontSize: 14.5, lineHeight: 1.35, margin: '0 0 9px', color: INK },

  rating: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  ratingValue: { fontSize: 13.5, fontWeight: 500, color: INK },
  ratingLink: {
    fontSize: 12.5, fontWeight: 400, color: '#5b5b5b',
    textDecoration: 'underline', textUnderlineOffset: 2,
  },

  price: { fontWeight: 700, fontSize: 18, letterSpacing: -0.4, color: INK, marginBottom: 6 },
  priceUnit: { fontWeight: 500, fontSize: 11, color: MUTED, marginLeft: 5, letterSpacing: 0 },

  meta: { fontSize: 11.5, color: MUTED, margin: '0 0 14px' },
  dot: { margin: '0 6px' },

  btnCart: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '12px 0', borderRadius: 30, border: 'none', background: ORANGE, color: '#fff',
    fontFamily: FONT, fontWeight: 500, fontSize: 13, cursor: 'pointer', transition: 'background 0.15s',
  },
  /* Confirmation / erreur : on sort de l'orange pour que l'état se voie. */
  btnCartAlt: { background: INK },
};