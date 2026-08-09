// HomePage.jsx — GROSHOP.tn

import { useQuery } from '@tanstack/react-query'
import { products as productsApi } from '../lib/api'
import ProductCard from '../components/ProductCard'
import BannerSlider  from '../components/BannerSlider'
import HeroGrid      from '../components/HeroGrid'
import HeroSearch    from '../components/HeroSearch'
import CategorySection from '../components/CategorySection'
import Footer from '../components/Footer'
import AdSlot from '../components/AdSlot'
import { Fragment } from 'react'
import { usePageTracking } from '../hooks/usePageTracking'
import { useIsMobile } from '../hooks/useIsMobile'
import MobileHome from './MobileHome'
import PopularCategories from '../components/PopularCategories'

const LAYOUT = {
  maxWidth: '1500px',
  padding:  '0 2%',
}

function Container({ children, style = {} }) {
  return (
    <div style={{
      maxWidth: LAYOUT.maxWidth,
      margin: '0 auto',
      padding: LAYOUT.padding,
      ...style,
    }}>
      {children}
    </div>
  )
}

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

// ── Mapper Django API → props ProductCard (grille "recommandés") ──
function mapProduct(p) {
  return {
    id:            p.id,
    name:          p.name,
    price:         computePrice(p),
    was:           p.old_price_tnd ? parseFloat(p.old_price_tnd) : null,
    discount:      p.old_price_tnd
                     ? Math.round((1 - parseFloat(p.base_price_tnd) / parseFloat(p.old_price_tnd)) * 100)
                     : null,
    rating:        p.rating_avg ? parseFloat(p.rating_avg) : null,
    reviewCount:   p.review_count ?? null,
    soldCount:     p.sold_count,
    moq:           p.moq,
    moqUnit:       'pcs',
    isFlash:       p.badge_flash,
    isChoice:      p.badge_choice,
    isBestSeller:  (p.sold_count || 0) > 1000,
    isFreeShipping:p.is_free_shipping || false,
    verified:      p.supplier_verified === 'approved',
    medals:        p.supplier_medals || 0,
    years:         p.years_active || null,
    flag:          p.supplier_flag || '🇹🇳',
    image:         p.primary_image,
    supplier:      p.supplier_name,
    supplierSlug:  p.supplier_slug,
  }
}

// ── Skeleton ────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: '#fff', borderRadius: '10px',
      border: '1px solid #E8EAED', overflow: 'hidden',
      animation: 'skeleton-pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ aspectRatio: '1/1', background: '#F0F0F0' }} />
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ height: '12px', background: '#F0F0F0', borderRadius: '4px', width: '90%' }} />
        <div style={{ height: '12px', background: '#F0F0F0', borderRadius: '4px', width: '60%' }} />
        <div style={{ height: '16px', background: '#F0F0F0', borderRadius: '4px', width: '45%' }} />
        <div style={{ height: '10px', background: '#F0F0F0', borderRadius: '4px', width: '70%' }} />
      </div>
    </div>
  )
}

if (typeof document !== 'undefined' && !document.getElementById('skeleton-anim')) {
  const s = document.createElement('style')
  s.id = 'skeleton-anim'
  s.textContent = '@keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }'
  document.head.appendChild(s)
}

export default function HomePage() {
  const isMobile = useIsMobile()

  const {
    data: recommendedData,
    isLoading: loadingRecommended,
    isError: errorRecommended,
  } = useQuery({
    queryKey: ['products', 'recommended'],
    queryFn: () => productsApi.recommended(),
  })

  const {
    data: trendingRaw,
    isLoading: loadingTrending,
  } = useQuery({
    queryKey: ['products', 'trending'],
    queryFn: () => productsApi.trending(),
  })

  const products         = recommendedData?.results || []
  const isPersonalized    = recommendedData?.personalized || false
  // ⚠️ IMPORTANT : on ne mappe PAS ici. Les données restent brutes (API Django).
  // C'est CategorySection.jsx qui fait le mapping vers les props ProductCard,
  // en une seule fois, pour éviter tout double mapping incohérent.
  const trendingProducts  = trendingRaw || []
  const loading           = loadingRecommended || loadingTrending
  const error              = errorRecommended ? 'Erreur de chargement des produits.' : null

  usePageTracking({ pageType: 'home' })

  if (isMobile) {
    return (
      <MobileHome
        items={loading ? [] : products.map(mapProduct)}
        trending={trendingProducts}
        loading={loading}
        error={error}
        isPersonalized={isPersonalized}
      />
    )
  }

  return (
    <div>
      <HeroSearch />

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>

          <div>
            <CategorySection products={trendingProducts} />
          </div>

          <div>
            <Container style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
              <HeroGrid />
            </Container>
          </div>

          <PopularCategories />

          <Container style={{ paddingTop: '1.5rem' }}>
            <BannerSlider />
          </Container>
        </div>
      </div>

      <Container style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(14px,1.5vw,17px)', fontWeight: 700, color: '#0F1419' }}>
            {isPersonalized ? 'Recommandé pour vous' : 'Produits recommandés'}
          </h2>
          <a href="/produits" style={{
            fontSize: 'clamp(11px,1.2vw,13px)',
            color: '#FF4500', textDecoration: 'none', fontWeight: 500,
          }}>
            Voir tout →
          </a>
        </div>

        {error && (
          <div style={{ color: '#D32F2F', fontSize: '13px', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <style>{`
          .groshop-product-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 10px 14px;
          }
          @media (max-width: 1280px) {
            .groshop-product-grid { grid-template-columns: repeat(5, 1fr); }
          }
          @media (max-width: 1024px) {
            .groshop-product-grid { grid-template-columns: repeat(4, 1fr); }
          }
          @media (max-width: 768px) {
            .groshop-product-grid { grid-template-columns: repeat(3, 1fr); gap: 8px 10px; }
          }
          @media (max-width: 480px) {
            .groshop-product-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          }
        `}</style>

        <div className="groshop-product-grid">
          {loading
            ? [...Array(30)].map((_, i) => <SkeletonCard key={i} />)
            : products.map((p, i) => (
                <Fragment key={p.id}>
                  <ProductCard product={mapProduct(p)} />
                  {(i + 1) % 12 === 0 && <AdSlot index={i} />}
                </Fragment>
              ))
          }
        </div>
      </Container>

      <Footer />
    </div>
  )
}