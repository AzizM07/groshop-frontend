// src/components/MobileHome.jsx
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { products as productsApi } from '../lib/api'
import ProductCard from '../components/ProductCard'
import CategorySection from '../components/CategorySection'
import PopularCategories from '../components/PopularCategories'
import Footer from '../components/Footer'
import AdSlot from '../components/AdSlot'
import PopularCategoriesMobile from '../components/PopularCategoriesMobile'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const HEADER_H = 56  // hauteur du MobileHeader fixe — les onglets se collent dessous
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/* ══════════════ Grille MASONRY 2 colonnes (façon Flutter left/right) ══════════════ */
// Deux colonnes flex INDÉPENDANTES : chaque carte s'empile sous la précédente
// dans sa colonne, sans s'aligner sur l'autre colonne (pas de rangées CSS).
// Items répartis en alternance (pair → gauche, impair → droite), pubs insérées
// tous les 6 produits comme dans ProductsSection.dart.
function MasonryProducts({ items = [], loading = false, adEvery = 6, gap = 8 }) {
  // Skeletons pendant le chargement, eux aussi en 2 colonnes
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

  // 1) flux produits + pubs entrelacées
  const stream = []
  items.forEach((p, i) => {
    stream.push({ kind: 'product', data: p })
    if (adEvery && (i + 1) % adEvery === 0) stream.push({ kind: 'ad', at: i })
  })
  // 2) répartition alternée gauche/droite (comme i % 2 en Flutter)
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

/* ══════════════ Onglets sticky sous la barre de recherche ══════════════ */
function StickyTabs({ cats }) {
  const [params] = useSearchParams()
  const active = params.get('cat')  // null sur "Pour vous"

  const tabs = [
    { id: null, name: 'Pour vous', to: '/' },
    ...cats.map(c => ({ id: String(c.id), name: c.name, to: `/?cat=${c.id}` })),
  ]

  return (
    <div style={{
      position: 'sticky', top: HEADER_H, zIndex: 900,
      background: '#fff', borderBottom: '1px solid #F0F0F0',
      display: 'flex', gap: 20, overflowX: 'auto', padding: '0 14px',
      WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
    }}>
      {tabs.map(t => {
        const on = active === t.id
        return (
          <Link key={t.id ?? 'all'} to={t.to}
            style={{
              flexShrink: 0, textDecoration: 'none', whiteSpace: 'nowrap',
              padding: '13px 2px', position: 'relative',
              fontSize: 15, fontWeight: on ? 800 : 500,
              color: on ? '#0F1419' : '#8A94A0',
            }}>
            {t.name}
            {on && <span style={{ position: 'absolute', left: 0, right: 0, bottom: 6, height: 3, borderRadius: 3, background: '#FF4500' }} />}
          </Link>
        )
      })}
    </div>
  )
}

/* ══════════════ HeroGrid — version mobile (slider d'images) ══════════════ */
// Prend les mêmes images que le HeroGrid desktop : bannières des zones
// hero_slider + side_card (via /api/banners/active/). Aucun fallback codé en dur.
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
            <span key={k} style={{ width: k === i ? 16 : 6, height: 6, borderRadius: 3, background: k === i ? '#FF4500' : 'rgba(255,255,255,.7)', transition: 'width .25s' }} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ margin: '10px 12px 0', borderRadius: 14, overflow: 'hidden' }}>
      {s.link ? <a href={s.link} style={{ display: 'block', textDecoration: 'none' }}>{inner}</a> : inner}
    </div>
  )
}

/* ══════════════════════ VUE CATÉGORIE (?cat=<id>) ══════════════════════ */
function MobileCategory({ cats, catId, items, loading }) {
  const selected = cats.find(c => String(c.id) === String(catId))
  const subs = selected?.children || []
  const [activeSub, setActiveSub] = useState('all')

  return (
    <div>
      {/* Rangée d'icônes rondes de sous-catégories */}
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '14px 12px 8px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        <SubIcon active label="Tout" onClick={() => setActiveSub('all')} heart />
        {subs.map(s => (
          <SubIcon key={s.id} label={s.name} img={s.image_url} emoji={s.emoji}
            active={activeSub === String(s.id)} onClick={() => setActiveSub(String(s.id))} />
        ))}
      </div>

      {/* Bannière de catégorie */}
      <div style={{ margin: '4px 12px 0', height: 140, borderRadius: 14, overflow: 'hidden', position: 'relative', background: 'linear-gradient(120deg, #FF6A2B, #FF4500)' }}>
        {selected?.image_url && (
          <img src={selected.image_url} alt="" style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '55%', objectFit: 'cover', opacity: 0.9 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.15), transparent 65%)' }} />
        <div style={{ position: 'absolute', left: 18, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.1, maxWidth: 200 }}>{selected?.name || 'Catégorie'}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.9)', marginTop: 6 }}>Prix de gros · Fournisseurs vérifiés</span>
        </div>
      </div>

      {/* Titre "Offres du jour" */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '18px 12px 12px' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F1419' }}>Offres du jour</h2>
        <span style={{ color: '#8A94A0', fontSize: 18 }}>›</span>
      </div>

      {/* Chips de filtres (All + sous-catégories) */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 12px 14px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        <FilterChip label="Tout" active={activeSub === 'all'} onClick={() => setActiveSub('all')} />
        {subs.map(s => (
          <FilterChip key={s.id} label={s.name} active={activeSub === String(s.id)} onClick={() => setActiveSub(String(s.id))} />
        ))}
      </div>

      {/* Grille produits — MASONRY 2 colonnes */}
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
        border: active ? '2px solid #FF4500' : '2px solid transparent',
      }}>
        {heart ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#FF4500" stroke="none"><path d="M12 21s-8-4.5-8-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-8 10-8 10z"/></svg>
        ) : img ? (
          <img src={img} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <span style={{ fontSize: 26 }}>{emoji || (label && label[0])}</span>
        )}
      </span>
      <span style={{ fontSize: 11, color: active ? '#FF4500' : '#3D4853', textAlign: 'center', lineHeight: 1.15, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{label}</span>
    </button>
  )
}

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, whiteSpace: 'nowrap', cursor: 'pointer',
      fontSize: 14, fontWeight: active ? 700 : 600,
      color: active ? '#fff' : '#3D4853',
      background: active ? '#FF4500' : '#fff',
      border: active ? '1px solid #FF4500' : '1px solid #E5E7EB',
      padding: '9px 18px', borderRadius: 24,
    }}>{label}</button>
  )
}

/* ═══════════════════════ FEED "POUR VOUS" (accueil) ═══════════════════════ */
const ICONS = {
  tag:   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  new:   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 14.2 8.6 21 9 15.5 13.2 17.5 20 12 16 6.5 20 8.5 13.2 3 9 9.8 8.6 12 2"/></svg>,
  quote: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>,
  shield:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
}
const SHORTCUTS = [
  { label: 'Meilleures offres', to: '/produits', bg: '#FFF0E9', color: '#FF4500', icon: 'tag' },
  { label: 'Nouveautés',        to: '/produits', bg: '#EAF7F0', color: '#0F9D58', icon: 'new' },
  { label: 'Demander un devis', to: '/devis',    bg: '#EAF0FE', color: '#1668FF', icon: 'quote' },
  { label: 'Vérifiés',          to: '/produits', bg: '#F3EAFE', color: '#7C3AED', icon: 'shield' },
]
function Shortcuts() {
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '14px 12px 4px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
      {SHORTCUTS.map(s => (
        <Link key={s.label} to={s.to} style={{ flex: '0 0 72px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <span style={{ width: 48, height: 48, borderRadius: '50%', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ICONS[s.icon]}</span>
          <span style={{ fontSize: 11, color: '#3D4853', textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
        </Link>
      ))}
    </div>
  )
}

/* ── Feed accueil : calqué sur le desktop, sections en version mobile ── */
function HomeFeed({ items, trending, loading, error, isPersonalized }) {
  return (
    <>
      {/*<Shortcuts />*/}

      {/* HeroGrid mobile (images du hero) */}
      <MobileHeroGrid />

      {/* Catégories populaires — comme desktop */}
      <PopularCategoriesMobile />

      {/* Tendances 48h — CategorySection choisit la variante mobile via useIsMobile */}
      {trending.length > 0 && (
        <div style={{ padding: '8px 0 0' }}>
          <CategorySection products={trending} />
        </div>
      )}

      {/* Produits recommandés — MASONRY 2 colonnes */}
      <div style={{ padding: '16px 12px 24px' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#0F1419' }}>
          {isPersonalized ? 'Recommandé pour vous' : 'Produits recommandés'}
        </h2>
        {error && <div style={{ color: '#D32F2F', fontSize: 13, marginBottom: 12 }}>{error}</div>}
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
    <div style={{ fontFamily: FONT, background: '#fff' }}>
      <StickyTabs cats={cats} />
      {activeCat
        ? <MobileCategory cats={cats} catId={activeCat} items={items} loading={loading} />
        : <HomeFeed items={items} trending={trending} loading={loading} error={error} isPersonalized={isPersonalized} />}
    </div>
  )
}