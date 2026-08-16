// src/components/MobileHome.jsx
import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { products as productsApi } from '../lib/api'
import ProductCard from '../components/ProductCard'
import CategorySection from '../components/CategorySection'
import PopularCategories from '../components/PopularCategories'
import Footer from '../components/Footer'
import AdSlot from '../components/AdSlot'
import PopularCategoriesMobile from '../components/PopularCategoriesMobile'
import SearchCategoryBannerMobile from '../components/SearchCategoryBannerMobile'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import heartAnim from '../assets/lottie/heart.json'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/* Orange harmonisé — MÊME valeur que MobileHeader → aucune coupure au raccord */
const ORANGE = '#FF7A00'
/* Dégradé : part du même orange que le header, descend en douceur vers blanc */
const TOP_GRADIENT =
  'linear-gradient(180deg, #FF7A00 0%, #FF8A1F 22%, #FFA85C 48%, #FFD6B0 75%, #FFFFFF 100%)'

/* ══════════════ Grille MASONRY 2 colonnes ══════════════ */
function MasonryProducts({ items = [], loading = false, adEvery = 6, gap = 8 }) {
  if (loading) {
    const cols = [[], []]
    for (let i = 0; i < 8; i++) cols[i % 2].push(i)
    return (
      <div style={{ display: 'flex', gap, alignItems: 'flex-start' }}>
        {cols.map((col, c) => (
          <div key={c} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap }}>
            {col.map(i => <SkeletonCard key={i} />)}
          </div>
        ))}
      </div>
    )
  }

  const stream = []
  items.forEach((p, i) => {
    stream.push({ kind: 'product', data: p })
    if (adEvery && (i + 1) % adEvery === 0) stream.push({ kind: 'ad', at: i })
  })
  const cols = [[], []]
  stream.forEach((it, idx) => cols[idx % 2].push(it))

  return (
    <div style={{ display: 'flex', gap, alignItems: 'flex-start' }}>
      {cols.map((col, c) => (
        <div key={c} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap }}>
          {col.map(it => it.kind === 'ad'
            ? <AdSlot key={`ad-${it.at}`} index={it.at} />
            : <ProductCard key={it.data.id} product={it.data} />)}
        </div>
      ))}
    </div>
  )
}

/* ══════════════ Onglets sticky (fond orange, collent sous le header) ══════════════ */
function StickyTabs({ cats }) {
  const [params] = useSearchParams()
  const active = params.get('cat')

  const tabs = [
    { id: null, name: 'Pour vous', to: '/' },
    ...cats.map(c => ({ id: String(c.id), name: c.name, to: `/?cat=${c.id}` })),
  ]

  return (
    <div style={{
      // Sticky sous le header fixe (56px)
      position: 'sticky', top: 56, zIndex: 900,
      background: ORANGE,
      display: 'flex', gap: 22, overflowX: 'auto', padding: '0 14px',
      WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
    }}>
      {tabs.map(t => {
        const on = active === t.id
        return (
          <Link key={t.id ?? 'all'} to={t.to}
            style={{
              flexShrink: 0, textDecoration: 'none', whiteSpace: 'nowrap',
              padding: '10px 2px 9px', position: 'relative',
              fontSize: 13, fontWeight: on ? 700 : 500,
              color: on ? '#FFFFFF' : 'rgba(255,255,255,.75)',
              transition: 'color .15s',
            }}>
            {t.name}
            {on && (
              <span style={{
                position: 'absolute', left: 0, right: 0, bottom: 0,
                height: 2.5, borderRadius: 2, background: '#FFFFFF',
              }} />
            )}
          </Link>
        )
      })}
    </div>
  )
}

/* ══════════════ HeroGrid mobile ══════════════ */
function MobileHeroGrid() {
  const [slides, setSlides] = useState([])
  const [i, setI] = useState(0)

  useEffect(() => {
    let alive = true
    fetch(`${API_BASE}/api/banners/active/`)
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || [])
        const order = { hero_slider: 0, side_card: 1 }
        const banners = list
          .filter(b => (b.zone === 'hero_slider' || b.zone === 'side_card') && b.is_active)
          .sort((a, b) => (order[a.zone] - order[b.zone]) || (a.position - b.position))
        const out = []
        banners.forEach(b => {
          const imgs = (b.images && b.images.length ? b.images : [b.image_url]).filter(Boolean)
          imgs.forEach(url => out.push({ url, link: b.link || '', title: b.title || '' }))
        })
        if (alive) { setSlides(out); setI(0) }
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setI(p => (p + 1) % slides.length), 4500)
    return () => clearInterval(t)
  }, [slides.length])

  if (!slides.length) return null
  const s = slides[i % slides.length]

  const inner = (
    <div style={{ position: 'relative', height: 180 }}>
      <img src={s.url} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
          {slides.map((_, k) => (
            <span key={k} style={{ width: k === i ? 16 : 6, height: 6, borderRadius: 3, background: k === i ? '#fff' : 'rgba(255,255,255,.7)', transition: 'width .25s' }} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ margin: '12px 12px 0', borderRadius: 14, overflow: 'hidden' }}>
      {s.link ? <a href={s.link} style={{ display: 'block', textDecoration: 'none' }}>{inner}</a> : inner}
    </div>
  )
}

/* ══════════════════════ VUE CATÉGORIE (?cat=<id>) ══════════════════════ */
function MobileCategory({ cats, catId, items, loading }) {
  const navigate = useNavigate()
  const selected = cats.find(c => String(c.id) === String(catId))
  const subs = selected?.children || []
  const [activeSub, setActiveSub] = useState('all')
  const [banner, setBanner] = useState(null)

  const activeSubCat = activeSub !== 'all'
    ? subs.find(s => String(s.id) === String(activeSub))
    : null

  useEffect(() => { setActiveSub('all') }, [catId])

  const target = activeSubCat || selected

  useEffect(() => {
    let alive = true
    setBanner(null)
    if (!target) return

    if (target.banner_url) {
      setBanner({ image_url: target.banner_url, link: target.banner_link || null })
      return
    }
    if (typeof productsApi.categoryBanner !== 'function' || !target.name) return
    productsApi.categoryBanner(target.name)
      .then(d => { if (alive) setBanner(d?.banner || null) })
      .catch(() => { if (alive) setBanner(null) })
    return () => { alive = false }
  }, [target?.id, target?.name, target?.banner_url])

  const goLink = (l) => {
    if (!l) return
    if (/^https?:\/\//i.test(l)) window.open(l, '_blank', 'noopener')
    else navigate(l)
  }

  return (
    <div>
      {activeSubCat && banner?.image_url && (
        <div style={{ padding: '10px 12px 0' }}>
          <SearchCategoryBannerMobile banner={banner} onClick={() => goLink(banner.link)} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '14px 12px 8px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        <SubIcon active={activeSub === 'all'} label="Tout" onClick={() => setActiveSub('all')} heart />
        {subs.map(s => (
          <SubIcon key={s.id} label={s.name} img={s.image_url} emoji={s.emoji}
            active={activeSub === String(s.id)} onClick={() => setActiveSub(String(s.id))} />
        ))}
      </div>

      <div style={{ padding: '4px 12px 0' }}>
        <SearchCategoryBannerMobile banner={banner} onClick={() => goLink(banner.link)} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '18px 12px 12px' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F1419' }}>Offres du jour</h2>
        <span style={{ color: '#8A94A0', fontSize: 18 }}>›</span>
      </div>

      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 12px 14px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        <FilterChip label="Tout" active={activeSub === 'all'} onClick={() => setActiveSub('all')} />
        {subs.map(s => (
          <FilterChip key={s.id} label={s.name} active={activeSub === String(s.id)} onClick={() => setActiveSub(String(s.id))} />
        ))}
      </div>

      <div style={{ padding: '0 12px 24px' }}>
        <MasonryProducts items={items} loading={loading} />
      </div>
    </div>
  )
}

function SubIcon({ label, img, emoji, active, heart, onClick }) {
  return (
    <button onClick={onClick} style={{ flexShrink: 0, width: 64, background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 62, height: 62, borderRadius: '50%', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? '#FFF0E9' : '#F4F5F7',
        border: active ? `2px solid ${ORANGE}` : '2px solid transparent',
      }}>
        {heart ? (
          <DotLottieReact
            src="/src/assets/lottie/heart.json"
            autoplay={active}
            loop={active}
            style={{ width: 34, height: 34 }}
          />
        ) : img ? (
          <img src={img} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <span style={{ fontSize: 26 }}>{emoji || (label && label[0])}</span>
        )}
      </span>
      <span style={{ fontSize: 11, color: active ? ORANGE : '#3D4853', textAlign: 'center', lineHeight: 1.15, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{label}</span>
    </button>
  )
}
function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, whiteSpace: 'nowrap', cursor: 'pointer',
      fontSize: 14, fontWeight: active ? 700 : 600,
      color: active ? '#fff' : '#3D4853',
      background: active ? ORANGE : '#fff',
      border: active ? `1px solid ${ORANGE}` : '1px solid #E5E7EB',
      padding: '9px 18px', borderRadius: 24,
    }}>{label}</button>
  )
}

/* ═══════════════════════ FEED "POUR VOUS" ═══════════════════════ */
function HomeFeed({ items, trending, loading, error, isPersonalized }) {
  return (
    <>
      <MobileHeroGrid />
      <PopularCategoriesMobile />
      {trending.length > 0 && (
        <div style={{ padding: '8px 0 0' }}>
          <CategorySection products={trending} />
        </div>
      )}
      <div style={{ padding: '16px 12px 24px' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#0F1419' }}>
          {isPersonalized ? 'Recommandé pour vous' : 'Produits recommandés'}
        </h2>
        {error && <div style={{ color: ORANGE, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <MasonryProducts items={items} loading={loading} />
      </div>
      <Footer />
    </>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E8EAED', overflow: 'hidden' }}>
      <div style={{ aspectRatio: '1/1', background: '#F0F0F0' }} />
      <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ height: 10, background: '#F0F0F0', borderRadius: 4, width: '90%' }} />
        <div style={{ height: 10, background: '#F0F0F0', borderRadius: 4, width: '55%' }} />
        <div style={{ height: 14, background: '#F0F0F0', borderRadius: 4, width: '45%' }} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════ HOME MOBILE ═══════════════════════════════ */
export default function MobileHome({ items = [], trending = [], loading, error, isPersonalized }) {
  const [params] = useSearchParams()
  const activeCat = params.get('cat')
  const [cats, setCats] = useState([])

  useEffect(() => {
    productsApi.categories().then(d => setCats(d || [])).catch(() => {})
  }, [])

  return (
    <div style={{
      fontFamily: FONT,
      // Le dégradé part du même orange que le header (aucune coupure) et s'étend sur ~460px
      background: `${TOP_GRADIENT} top / 100% 460px no-repeat, #fff`,
      minHeight: '100vh',
    }}>
      {/* ⚠️ Plus de MobileTopBar ici — MobileHeader (fixed) s'en occupe désormais */}
      <StickyTabs cats={cats} />
      {activeCat
        ? <MobileCategory cats={cats} catId={activeCat} items={items} loading={loading} />
        : <HomeFeed items={items} trending={trending} loading={loading} error={error} isPersonalized={isPersonalized} />}
    </div>
  )
}