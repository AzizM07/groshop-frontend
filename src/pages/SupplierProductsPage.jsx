// pages/SupplierProductsPage.jsx — GROSHOP.tn
// Connecté au backend : /api/products/mine/ (via lib/api.js — cookies + CSRF).
// Style Donezo/Recent Activity conservé.

import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { products as productsApi } from '../lib/api'

// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-products-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-products-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-products { font-family: 'DM Sans', -apple-system, sans-serif; color: #0F1419; background: transparent; min-height: 100vh; padding: 24px; }
    .gs-h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-num { font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-card { background: #fff; border-radius: 20px; border: 1px solid #EAE7DF; box-shadow: 0 1px 3px rgba(15, 20, 25, 0.03); }
    .gs-input-clean { border: none; outline: none; background: transparent; font-family: inherit; }
    .gs-section-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 600; color: #0F1419; letter-spacing: -0.01em; }
    .gs-section-icon { color: #FF4500; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .gs-icon-btn { background: transparent; border: none; cursor: pointer; padding: 7px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: #9AA3AE; transition: all 0.15s; text-decoration: none; }
    .gs-icon-btn:hover { background: #FAFAF7; color: #0F1419; }
    .gs-row { position: relative; transition: background 0.18s ease; }
    .gs-row::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: transparent; transition: background 0.18s ease; border-radius: 0 2px 2px 0; }
    .gs-row:hover { background: #FAFAF7; }
    .gs-row:hover::before { background: #FF4500; }
    .gs-pill-outline { display: inline-flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #EAE7DF; padding: 8px 14px; border-radius: 999px; font-size: 12.5px; font-weight: 500; color: #0F1419; cursor: pointer; font-family: inherit; transition: all 0.15s; }
    .gs-pill-outline:hover { border-color: #0F1419; }
    .gs-pill-outline:disabled { opacity: 0.4; cursor: not-allowed; }
    .gs-pill-outline:disabled:hover { border-color: #EAE7DF; }
    .gs-btn-primary { background: #FF4500; color: #fff; border: none; padding: 11px 20px; border-radius: 999px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; gap: 7px; transition: background 0.15s, transform 0.1s, box-shadow 0.2s; box-shadow: 0 6px 18px -6px rgba(255, 69, 0, 0.5); text-decoration: none; }
    .gs-btn-primary:hover { background: #E03D00; box-shadow: 0 10px 22px -8px rgba(255, 69, 0, 0.6); }
    .gs-btn-primary:active { transform: scale(0.97); }
    .gs-mini-stat { transition: transform 0.18s ease, box-shadow 0.18s ease; }
    .gs-mini-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -6px rgba(15, 20, 25, 0.10); }
    @keyframes gs-fade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    .gs-collapse { animation: gs-fade 0.25s ease; }
    @keyframes gs-spin { to { transform: rotate(360deg); } }
    .gs-spin { animation: gs-spin 0.8s linear infinite; }
  `
  document.head.appendChild(s)
}

// ── Statuts (mappés sur ton modèle Product.STATUS) ─────────────────
const STATUS_STYLES = {
  draft:          { label: 'Brouillon',    color: '#6B7280', bg: '#F3F4F6', icon: 'FileEdit' },
  pending_review: { label: 'En attente',   color: '#D97706', bg: '#FEF3C7', icon: 'Clock' },
  approved:       { label: 'Approuvé',     color: '#059669', bg: '#D1FAE5', icon: 'CheckCircle2' },
  rejected:       { label: 'Rejeté',       color: '#EF4444', bg: '#FEE2E2', icon: 'XCircle' },
}
const STAT_COLORS = { orange: '#FF4500', amber: '#D97706', green: '#059669', purple: '#8B5CF6', red: '#EF4444' }
const PER_PAGE = 10

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function SupplierProductsPage() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')
  const [statsOpen, setStatsOpen] = useState(true)
  const [page, setPage]       = useState(1)

  useEffect(() => {
    let alive = true
    setLoading(true)
    productsApi.mine()
      .then((data) => { if (alive) setItems(Array.isArray(data) ? data : (data?.results || [])) })
      .catch((e) => { if (alive) setError(e.message || 'Erreur de chargement') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const filtered = useMemo(
    () => items.filter((p) => (p.name || '').toLowerCase().includes(search.toLowerCase())),
    [items, search],
  )
  useEffect(() => { setPage(1) }, [search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const stats = useMemo(() => computeStats(items), [items])

  return (
    <div className="gs-products">
      <PageHeader productsCount={items.length} />

      <StatsPanel open={statsOpen} setOpen={setStatsOpen} stats={stats} />

      <ProductsCard
        loading={loading}
        error={error}
        products={pageItems}
        totalFiltered={filtered.length}
        search={search}
        setSearch={setSearch}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
    </div>
  )
}

// ── Stats calculées depuis les vrais produits ──────────────────────
function computeStats(items) {
  const total    = items.length
  const inStock  = items.reduce((s, p) => s + (Number(p.stock_qty) || 0), 0)
  const sold     = items.reduce((s, p) => s + (Number(p.sold_count) || 0), 0)
  const pending  = items.filter((p) => p.status === 'pending_review').length
  const approved = items.filter((p) => p.status === 'approved').length
  return [
    { label: 'Produits',      value: String(total),     sub: 'au total',      color: STAT_COLORS.orange, icon: 'Package' },
    { label: 'Approuvés',     value: String(approved),  sub: 'en ligne',      color: STAT_COLORS.green,  icon: 'CheckCircle2' },
    { label: 'En attente',    value: String(pending),   sub: 'à valider',     color: STAT_COLORS.amber,  icon: 'Clock' },
    { label: 'Stock cumulé',  value: fmt(inStock),      sub: 'unités',        color: STAT_COLORS.purple, icon: 'Boxes' },
    { label: 'Ventes',        value: fmt(sold),         sub: 'unités vendues', color: STAT_COLORS.red,   icon: 'ShoppingCart' },
  ]
}
const fmt = (n) => n.toLocaleString('fr-FR')

// ═══════════════════════════════════════════════════════════════════
function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="gs-section-title">
      <span className="gs-section-icon"><Icon size={20} strokeWidth={2.2} /></span>
      {title}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function PageHeader({ productsCount }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 20, flexWrap: 'wrap' }}>
      <div>
        <h1 className="gs-h1" style={{ fontSize: 42, margin: 0, color: '#0F1419', lineHeight: 1.05, letterSpacing: '-0.03em' }}>Produits</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#6B7280', fontWeight: 400 }}>
          {productsCount} produit{productsCount > 1 ? 's' : ''} dans votre catalogue · gérez, éditez, publiez.
        </p>
      </div>
      <Link to="/supplier/products/new" className="gs-btn-primary">
        <Icons.Plus size={15} strokeWidth={2.5} />
        Nouveau produit
      </Link>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function StatsPanel({ open, setOpen, stats }) {
  return (
    <div className="gs-card" style={{ marginBottom: 16, overflow: 'hidden' }}>
      <div onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', cursor: 'pointer', borderBottom: open ? '1px solid #F0EDE5' : 'none' }}>
        <SectionTitle icon={Icons.BarChart3} title="Statistiques produits" />
        <Icons.ChevronUp size={16} color="#9AA3AE" style={{ transition: 'transform 0.25s', transform: open ? 'rotate(0deg)' : 'rotate(180deg)' }} />
      </div>
      {open && (
        <div className="gs-collapse" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, padding: 16 }}>
          {stats.map((stat, i) => <MiniStat key={i} {...stat} />)}
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value, sub, color, icon }) {
  const Icon = Icons[icon] || Icons.Circle
  return (
    <div className="gs-mini-stat" style={{ background: '#fff', border: '1px solid #EAE7DF', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, cursor: 'default' }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={17} color={color} strokeWidth={2.2} />
      </div>
      <div>
        <div className="gs-num" style={{ fontSize: 20, color: '#0F1419', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 10.5, color: '#9AA3AE', marginTop: 4, fontWeight: 500 }}>{sub}</div>
      </div>
      <div style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 'auto' }}>{label}</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function ProductsCard({ loading, error, products, totalFiltered, search, setSearch, page, setPage, totalPages }) {
  const cols = '2.6fr 1.2fr 0.9fr 1.1fr 0.9fr'

  return (
    <div className="gs-card" style={{ marginBottom: 16, overflow: 'hidden' }}>
      {/* Tools bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px', borderBottom: '1px solid #F0EDE5', flexWrap: 'wrap' }}>
        <SectionTitle icon={Icons.Package} title="Catalogue" />
        <div style={{ flex: 1, minWidth: 20 }} />
        <div style={{ background: '#fff', border: '1px solid #EAE7DF', borderRadius: 999, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 7, width: 260 }}>
          <Icons.Search size={13} color="#9AA3AE" strokeWidth={2} />
          <input type="text" placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="gs-input-clean" style={{ fontSize: 12.5, width: '100%', color: '#0F1419' }} />
        </div>
        <button className="gs-pill-outline"><Icons.ArrowUpDown size={12} strokeWidth={2.2} /> Trier</button>
        <button className="gs-pill-outline"><Icons.SlidersHorizontal size={12} strokeWidth={2.2} /> Filtres</button>
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '14px 22px', borderBottom: '1px solid #F0EDE5', fontSize: 10.5, color: '#9AA3AE', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', gap: 16 }}>
        <div>Produit</div>
        <div>Statut</div>
        <div>Stock</div>
        <div>Prix</div>
        <div style={{ textAlign: 'right' }}>Actions</div>
      </div>

      {/* Body */}
      {loading ? (
        <LoadingRows cols={cols} />
      ) : error ? (
        <StateBox icon="AlertTriangle" title="Erreur de chargement" sub={error} />
      ) : products.length === 0 ? (
        totalFiltered === 0
          ? <StateBox icon="PackagePlus" title="Aucun produit pour l'instant" sub="Clique sur « Nouveau produit » pour en ajouter un." />
          : <StateBox icon="PackageSearch" title="Aucun produit trouvé" sub="Essaie une autre recherche." />
      ) : (
        products.map((p, i) => <ProductRow key={p.id} product={p} cols={cols} isLast={i === products.length - 1} />)
      )}

      {/* Pagination */}
      {!loading && !error && products.length > 0 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
    </div>
  )
}

function ProductRow({ product, cols, isLast }) {
  const navigate = useNavigate()
  const st = STATUS_STYLES[product.status] || STATUS_STYLES.draft
  const StIcon = Icons[st.icon] || Icons.Circle

  return (
    <div className="gs-row" style={{ display: 'grid', gridTemplateColumns: cols, padding: '14px 22px', alignItems: 'center', borderBottom: isLast ? 'none' : '1px solid #F5F3EE', gap: 16 }}>
      {/* Produit : image réelle + nom + rating/catégorie */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F5F3EE', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {product.primary_image
            ? <img src={product.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Icons.Package size={18} color="#B8BCC4" strokeWidth={1.8} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F1419', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </div>
          <div style={{ fontSize: 11, color: '#9AA3AE', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icons.Star size={11} fill="#FFB800" stroke="#FFB800" />
            <span style={{ color: '#0F1419', fontWeight: 600 }}>{Number(product.rating_avg || 0).toFixed(1)}</span>
            <span>· {product.rating_count || 0} avis</span>
            {product.category_name && <span style={{ color: '#C7CCD3' }}>·</span>}
            {product.category_name && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.category_name}</span>}
          </div>
        </div>
      </div>

      {/* Statut */}
      <div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: st.bg, color: st.color, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
          <StIcon size={12} strokeWidth={2.4} />
          {st.label}
        </span>
      </div>

      {/* Stock */}
      <div>
        <div className="gs-num" style={{ fontSize: 15, color: Number(product.stock_qty) > 0 ? '#0F1419' : '#EF4444' }}>{product.stock_qty ?? 0}</div>
        <div style={{ fontSize: 10, color: '#9AA3AE', marginTop: 2 }}>{Number(product.stock_qty) > 0 ? 'en stock' : 'épuisé'}</div>
      </div>

      {/* Prix */}
      <div>
        <div className="gs-num" style={{ fontSize: 15, color: '#FF4500' }}>
          {Number(product.base_price_tnd).toFixed(3)}
          <span style={{ fontSize: 10, color: '#9AA3AE', marginLeft: 3, fontWeight: 500 }}>TND</span>
        </div>
        <div style={{ fontSize: 10, color: '#9AA3AE', marginTop: 2 }}>MOQ {product.moq} · {product.unit || 'unité'}</div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
        <Link to={`/supplier/products/${product.id}/edit`} className="gs-icon-btn" title="Modifier">
          <Icons.Pencil size={14} strokeWidth={1.8} />
        </Link>
        <Link to={`/produit/${product.slug || product.id}`} className="gs-icon-btn" title="Voir">
          <Icons.Eye size={14} strokeWidth={1.8} />
        </Link>
        <button className="gs-icon-btn" title="Plus" onClick={() => navigate(`/supplier/products/${product.id}/edit`)}>
          <Icons.MoreHorizontal size={14} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function Pagination({ page, totalPages, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderTop: '1px solid #F0EDE5' }}>
      <button onClick={() => page > 1 && onChange(page - 1)} disabled={page === 1} className="gs-pill-outline">
        <Icons.ArrowLeft size={13} strokeWidth={2.2} /> Précédent
      </button>
      <div style={{ fontSize: 12.5, color: '#6B7280' }}>
        Page <span style={{ color: '#0F1419', fontWeight: 700 }}>{page}</span>
        <span style={{ color: '#9AA3AE' }}> sur {totalPages}</span>
      </div>
      <button onClick={() => page < totalPages && onChange(page + 1)} disabled={page === totalPages} className="gs-pill-outline">
        Suivant <Icons.ArrowRight size={13} strokeWidth={2.2} />
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function LoadingRows({ cols }) {
  return (
    <div>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: cols, padding: '14px 22px', alignItems: 'center', borderBottom: '1px solid #F5F3EE', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F1EFE9' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, width: '60%', background: '#F1EFE9', borderRadius: 4, marginBottom: 7 }} />
              <div style={{ height: 9, width: '40%', background: '#F5F3EE', borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ height: 20, width: 80, background: '#F1EFE9', borderRadius: 999 }} />
          <div style={{ height: 14, width: 40, background: '#F1EFE9', borderRadius: 4 }} />
          <div style={{ height: 14, width: 70, background: '#F1EFE9', borderRadius: 4 }} />
          <div />
        </div>
      ))}
    </div>
  )
}

function StateBox({ icon, title, sub }) {
  const Icon = Icons[icon] || Icons.Package
  return (
    <div style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#9AA3AE' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#FFF3EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={26} color="#FF4500" strokeWidth={1.8} />
      </div>
      <div className="gs-h1" style={{ fontSize: 18, color: '#0F1419' }}>{title}</div>
      <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 340 }}>{sub}</div>
    </div>
  )
}