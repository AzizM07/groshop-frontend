/**
 * ProductCard — Composant card produit réutilisable
 * Emplacement : src/components/supplier/ProductCard.jsx
 *
 * Style minimal premium : image sur fond gris clair + nom + sous-titre + pill prix
 * Réutilisable partout (aperçu profil, page catalogue, résultats recherche...)
 *
 * Props :
 *  - product: {
 *      id, name, subtitle, price, currency, image_url
 *    }
 *  - onClick?: (product) => void   — callback au clic sur la card
 *  - size?: 'sm' | 'md' | 'lg'     — taille (défaut: 'md')
 */
export default function ProductCard({ product, onClick, size = 'md' }) {
  const {
    name = 'Produit sans nom',
    subtitle = '',
    price = 0,
    image_url = null,
    currency = 'TND',
  } = product;

  /* ── Tailles selon size ── */
  const sizes = {
    sm: { radius: 12, nameSize: 13, subtitleSize: 11, pillSize: 11 },
    md: { radius: 16, nameSize: 15, subtitleSize: 13, pillSize: 12 },
    lg: { radius: 20, nameSize: 17, subtitleSize: 14, pillSize: 13 },
  };
  const s = sizes[size] || sizes.md;

  const handleClick = () => {
    if (onClick) onClick(product);
  };

  return (
    <div
      style={{ ...S.card, cursor: onClick ? 'pointer' : 'default' }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Image */}
      <div style={{ ...S.imageWrap, borderRadius: s.radius }}>
        {image_url ? (
          <img src={image_url} alt={name} style={S.image} />
        ) : (
          <div style={S.imageFallback}>
            <i className="ti ti-photo" style={{ fontSize: 32, color: '#ccc' }} aria-hidden="true" />
          </div>
        )}

        {/* Pill prix */}
        <div style={{ ...S.pricePill, fontSize: s.pillSize }}>
          {price} {currency}
        </div>
      </div>

      {/* Infos */}
      <div style={S.info}>
        <h3 style={{ ...S.name, fontSize: s.nameSize }}>{name}</h3>
        {subtitle && (
          <p style={{ ...S.subtitle, fontSize: s.subtitleSize }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

const S = {
  card: {
    transition: 'transform 0.2s ease',
    fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
  },
  imageWrap: {
    width: '100%',
    aspectRatio: '1 / 1',
    background: '#F4F5FA',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '85%',
    height: '85%',
    objectFit: 'contain',
    display: 'block',
    mixBlendMode: 'multiply',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pricePill: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: '5px 11px',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: 999,
    fontWeight: 600,
    color: '#0a0a2a',
    letterSpacing: -0.2,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  info: {
    padding: '14px 4px 0',
  },
  name: {
    fontWeight: 600,
    color: '#0a0a2a',
    letterSpacing: -0.2,
    lineHeight: 1.3,
    margin: 0,
  },
  subtitle: {
    fontWeight: 400,
    color: '#9a9a9a',
    lineHeight: 1.4,
    margin: '4px 0 0',
    letterSpacing: -0.1,
  },
};