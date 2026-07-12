// src/pages/SupplierProfilePage.jsx
// GROSHOP.tn — Public Supplier Profile Page
// Style Fraunces + orange #FF4500 · Palette cohérente

import { useState } from 'react'
import SupplierBanner from '../components/supplier/SupplierBanner'
import SupplierStats from '../components/supplier/SupplierStats'
import SupplierReviews from '../components/supplier/SupplierReviews'
import SectionTitle from '../components/supplier/SectionTitle'

// ═══════════════════════════════════════════════════════════════════
// Inject Fraunces
// ═══════════════════════════════════════════════════════════════════
if (typeof document !== 'undefined' && !document.getElementById('gs-supplier-profile-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-supplier-profile-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;0,900;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-supplier-page {
      font-family: 'DM Sans', -apple-system, sans-serif;
      background: #FDFCF9;
      min-height: 100vh;
    }
    .gs-fraunces { font-family: 'Fraunces', Georgia, serif; }
  `
  document.head.appendChild(s)
}

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════
const SUPPLIER = {
  name: 'Boutique Aziz',
  slug: 'boutique-aziz',
  logo: null,
  banner: null,
  city: 'Tunis',
  country: 'Tunisie',
  memberSince: 'Depuis 2023',
  verified: true,
  premium: true,
  categories: ['Alimentaire', 'Cosmétique', 'Textile'],
  rating: 4.8,
  ratingCount: 234,
  responseRate: 95,
  responseTime: '< 2h',
  totalSales: 12340,
  productCount: 256,
  followerCount: 1200,
  description: `Fournisseur de confiance depuis 2023, nous proposons une sélection soignée
  de produits en gros pour vos revendeurs, commerces et projets professionnels.
  Livraison sous 48h à travers la Tunisie.`,
  socials: [
    { name: 'facebook', url: '#' },
    { name: 'instagram', url: '#' },
    { name: 'whatsapp', url: '#' },
  ],
  location: {
    address: 'Avenue Habib Bourguiba, 1000 Tunis',
    coords: { lat: 36.8065, lng: 10.1815 },
  },
}

const PRODUCTS = [
  { id: 1, name: "Huile d'olive 5L", price: 45, moq: 12, image: '🫒', category: 'Alimentaire', rating: 4.9, sales: 342 },
  { id: 2, name: 'Café moulu 1kg', price: 18, moq: 24, image: '☕', category: 'Alimentaire', rating: 4.8, sales: 289 },
  { id: 3, name: 'T-shirt coton bio', price: 12, moq: 50, image: '👕', category: 'Textile', rating: 4.7, sales: 178 },
  { id: 4, name: 'Savon artisanal', price: 4, moq: 100, image: '🧼', category: 'Cosmétique', rating: 4.9, sales: 456 },
  { id: 5, name: 'Miel de fleurs 500g', price: 22, moq: 20, image: '🍯', category: 'Alimentaire', rating: 5.0, sales: 123 },
  { id: 6, name: 'Crème hydratante', price: 15, moq: 30, image: '🧴', category: 'Cosmétique', rating: 4.6, sales: 89 },
]

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function SupplierProfilePage() {
  const [activeTab, setActiveTab] = useState('products')

  return (
    <div className="gs-supplier-page">
      <SupplierBanner supplier={SUPPLIER} />

      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '32px 24px 80px',
      }}>
        <SupplierStats supplier={SUPPLIER} />

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginTop: 40,
          marginBottom: 24,
          borderBottom: '1px solid #EAE7DF',
        }}>
          {[
            { key: 'products', label: 'Produits', icon: '🛍️' },
            { key: 'about', label: 'À propos', icon: 'ℹ️' },
            { key: 'reviews', label: 'Avis clients', icon: '⭐' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #FF4500' : '2px solid transparent',
                color: activeTab === tab.key ? '#0F1419' : '#6B7280',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginBottom: -1,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ marginRight: 6 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'products' && <ProductsGrid products={PRODUCTS} />}
        {activeTab === 'about' && <AboutSection supplier={SUPPLIER} />}
        {activeTab === 'reviews' && <SupplierReviews supplierId={SUPPLIER.slug} />}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PRODUCTS GRID
// ═══════════════════════════════════════════════════════════════════
function ProductsGrid({ products }) {
  return (
    <section>
      <SectionTitle
        title={`${products.length} produits`}
        subtitle="Voir tous les produits de ce fournisseur"
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 20,
        marginTop: 24,
      }}>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function ProductCard({ product }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #EAE7DF',
      borderRadius: 16,
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(15, 20, 25, 0.15)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'none'
    }}
    >
      <div style={{
        height: 180,
        background: '#F5F3EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 72,
      }}>
        {product.image}
      </div>

      <div style={{ padding: 16 }}>
        <div style={{
          fontSize: 11,
          color: '#9AA3AE',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}>
          {product.category}
        </div>
        <div style={{
          fontSize: 15,
          fontWeight: 600,
          color: '#0F1419',
          marginTop: 4,
          lineHeight: 1.3,
        }}>
          {product.name}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#FF4500' }}>
              {product.price} TND
            </span>
            <div style={{ fontSize: 11, color: '#9AA3AE', marginTop: 2 }}>
              MOQ: {product.moq} pcs
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#0F1419', fontWeight: 600 }}>
              ⭐ {product.rating}
            </div>
            <div style={{ fontSize: 10, color: '#9AA3AE' }}>
              {product.sales} ventes
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ABOUT SECTION
// ═══════════════════════════════════════════════════════════════════
function AboutSection({ supplier }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 32,
    }}>
      {/* Description */}
      <div style={{
        background: '#fff',
        border: '1px solid #EAE7DF',
        borderRadius: 20,
        padding: 32,
      }}>
        <h3 className="gs-fraunces" style={{
          fontSize: 22,
          fontWeight: 700,
          margin: 0,
          color: '#0F1419',
        }}>
          À propos de {supplier.name}
        </h3>
        <p style={{
          fontSize: 14,
          color: '#6B7280',
          lineHeight: 1.7,
          marginTop: 16,
          whiteSpace: 'pre-line',
        }}>
          {supplier.description}
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 20,
        }}>
          {supplier.categories.map(cat => (
            <span key={cat} style={{
              background: '#FFF3EE',
              color: '#FF4500',
              padding: '5px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
            }}>
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Info sidebar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        <InfoCard
          title="Localisation"
          icon="📍"
          content={supplier.location.address}
        />
        <InfoCard
          title="Statut"
          icon={supplier.verified ? '✅' : '⏳'}
          content={supplier.verified ? 'Fournisseur vérifié' : 'En attente de vérification'}
        />
        <InfoCard
          title="Membre depuis"
          icon="📅"
          content={supplier.memberSince}
        />
        <InfoCard
          title="Temps de réponse"
          icon="⚡"
          content={`${supplier.responseTime} en moyenne`}
        />
      </div>
    </div>
  )
}

function InfoCard({ title, icon, content }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #EAE7DF',
      borderRadius: 12,
      padding: 16,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{
          fontSize: 11,
          color: '#9AA3AE',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}>
          {title}
        </span>
      </div>
      <div style={{
        fontSize: 13,
        color: '#0F1419',
        fontWeight: 500,
      }}>
        {content}
      </div>
    </div>
  )
}
