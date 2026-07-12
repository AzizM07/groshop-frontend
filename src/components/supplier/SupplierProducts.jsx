/**
 * SupplierProducts — Aperçu produits (style image 1)
 * Emplacement : src/components/supplier/SupplierProducts.jsx
 *
 * Affiche 6 produits en aperçu + bouton "Voir tous les produits"
 * Layout : grille 3 colonnes (responsive)
 * Card : image sur fond gris clair + nom + sous-titre + prix dans pill
 *
 * Props :
 *  - products: [{ id, name, subtitle, price, image_url, currency }]
 *  - supplierSlug: string  (pour le lien vers la page produits complète)
 *  - onSeeAll?: () => void  (override du bouton, sinon navigation par défaut)
 */
export default function SupplierProducts({
  products = [],
  supplierSlug = '',
  onSeeAll,
}) {
  // Limiter à 6 produits pour l'aperçu
  const previewProducts = products.slice(0, 6);

  // Si pas de produits, on ne rend rien
  if (previewProducts.length === 0) {
    return (
      <section style={S.section}>
        <div style={S.empty}>
          <i className="ti ti-package-off" style={{ fontSize: 36, color: '#ccc', marginBottom: 12 }} />
          <p style={{ color: '#888', fontSize: 14 }}>
            Aucun produit disponible pour le moment.
          </p>
        </div>
      </section>
    );
  }

  const handleSeeAll = () => {
    if (onSeeAll) {
      onSeeAll();
    } else {
      // TODO : naviguer vers la page complète /fournisseur/:slug/produits
      console.log(`Navigation vers /fournisseur/${supplierSlug}/produits`);
      alert(`Cette page sera bientôt disponible : /fournisseur/${supplierSlug}/produits`);
    }
  };

  return (
    <section style={S.section}>
      <div style={S.inner}>

        {/* Grille 3 colonnes */}
        <div style={S.grid} className="supplier-products-grid">
          {previewProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bouton "Voir tous les produits" */}
        <div style={S.ctaWrap}>
          <button
            style={S.ctaBtn}
            onClick={handleSeeAll}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FF4500';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = '#FF4500';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#111';
              e.currentTarget.style.borderColor = '#111';
            }}
          >
            Voir tous les produits
            <i className="ti ti-arrow-right" style={{ fontSize: 16 }} aria-hidden="true" />
          </button>
        </div>

      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .supplier-products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 540px) {
          .supplier-products-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────
 *  Card produit (style image 1)
 * ───────────────────────────────────────────── */
function ProductCard({ product }) {
  const {
    name = 'Produit sans nom',
    subtitle = '',
    price = 0,
    image_url = null,
    currency = 'TND',
  } = product;

  return (
    <div style={S.card}>
      {/* Image avec fond gris clair */}
      <div style={S.imageWrap}>
        {image_url ? (
          <img src={image_url} alt={name} style={S.image} />
        ) : (
          <div style={S.imageFallback}>
            <i className="ti ti-photo" style={{ fontSize: 32, color: '#ccc' }} aria-hidden="true" />
          </div>
        )}

        {/* Pill prix en haut à droite */}
        <div style={S.pricePill}>
          {price} {currency}
        </div>
      </div>

      {/* Infos sous l'image */}
      <div style={S.info}>
        <h3 style={S.name}>{name}</h3>
        {subtitle && <p style={S.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Styles
 * ───────────────────────────────────────────── */
const S = {
  section: {
    padding: '20px 32px 80px',
    background: '#fff',
    fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
  },

  /* grille */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 28,
  },

  /* card produit */
  card: {
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: '1 / 1',
    background: '#F4F5FA',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
},
  imageFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* pill prix */
  pricePill: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: '5px 11px',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    color: '#0a0a2a',
    letterSpacing: -0.2,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },

  /* infos sous l'image */
  info: {
    padding: '14px 4px 0',
  },
  name: {
    fontSize: 15,
    fontWeight: 600,
    color: '#0a0a2a',
    letterSpacing: -0.2,
    lineHeight: 1.3,
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: 400,
    color: '#9a9a9a',
    lineHeight: 1.4,
    margin: '4px 0 0',
    letterSpacing: -0.1,
  },

  /* bouton voir tout */
  ctaWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 50,
  },
  ctaBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '13px 28px',
    background: 'transparent',
    color: '#111',
    border: '1.5px solid #111',
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },

  /* empty state */
  empty: {
    maxWidth: 600,
    margin: '40px auto',
    padding: 60,
    textAlign: 'center',
    background: '#FAFAFC',
    borderRadius: 16,
  },
};
