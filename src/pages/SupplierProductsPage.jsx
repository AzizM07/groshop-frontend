// pages/SupplierProductsPage.jsx — GROSHOP.tn
// Style Donezo/Recent Activity : header géant Fraunces, SectionTitle icon-only, pills outline

import { useState, useMemo } from 'react'
import * as Icons from 'lucide-react'

// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-products-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-products-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-products {
      font-family: 'DM Sans', -apple-system, sans-serif;
      color: #0F1419;
      background: transparent;
      min-height: 100vh;
      padding: 24px;
    }
    .gs-h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-num { font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-card {
      background: #fff;
      border-radius: 20px;
      border: 1px solid #EAE7DF;
      box-shadow: 0 1px 3px rgba(15, 20, 25, 0.03);
    }

    .gs-input-clean { border: none; outline: none; background: transparent; font-family: inherit; }

    /* Section title avec icon orange (sans bg) */
    .gs-section-title {
      display: flex; align-items: center; gap: 10px;
      font-size: 16px; font-weight: 600; color: #0F1419;
      letter-spacing: -0.01em;
    }
    .gs-section-icon {
      color: #FF4500;
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    /* Icon button (Edit, View, More) */
    .gs-icon-btn {
      background: transparent; border: none; cursor: pointer; padding: 7px;
      border-radius: 8px; display: inline-flex; align-items: center;
      justify-content: center; color: #9AA3AE; transition: all 0.15s;
    }
    .gs-icon-btn:hover { background: #FAFAF7; color: #0F1419; }

    /* Table row hover + accent orange à gauche */
    .gs-row {
      position: relative;
      transition: background 0.18s ease;
    }
    .gs-row::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 3px;
      background: transparent;
      transition: background 0.18s ease;
      border-radius: 0 2px 2px 0;
    }
    .gs-row:hover { background: #FAFAF7; }
    .gs-row:hover::before { background: #FF4500; }

    /* Pill outline (Trier, Filtres, Pagination) */
    .gs-pill-outline {
      display: inline-flex; align-items: center; gap: 6px;
      background: #fff;
      border: 1px solid #EAE7DF;
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 12.5px; font-weight: 500;
      color: #0F1419; cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
    }
    .gs-pill-outline:hover { border-color: #0F1419; }
    .gs-pill-outline:disabled { opacity: 0.4; cursor: not-allowed; }
    .gs-pill-outline:disabled:hover { border-color: #EAE7DF; }

    /* Orange primary CTA (matches dashboard style) */
    .gs-btn-primary {
      background: #FF4500; color: #fff; border: none;
      padding: 11px 20px; border-radius: 999px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      font-family: inherit;
      display: inline-flex; align-items: center; gap: 7px;
      transition: background 0.15s, transform 0.1s, box-shadow 0.2s;
      box-shadow: 0 6px 18px -6px rgba(255, 69, 0, 0.5);
    }
    .gs-btn-primary:hover {
      background: #E03D00;
      box-shadow: 0 10px 22px -8px rgba(255, 69, 0, 0.6);
    }
    .gs-btn-primary:active { transform: scale(0.97); }

    /* Mini stat card hover lift */
    .gs-mini-stat {
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .gs-mini-stat:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -6px rgba(15, 20, 25, 0.10);
    }

    @keyframes gs-fade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    .gs-collapse { animation: gs-fade 0.25s ease; }
  `
  document.head.appendChild(s)
}

// ── Data ───────────────────────────────────────────────────────────
const PERF_STYLES = {
  excellent: { label: 'Excellent', color: '#059669', fill: 9 },
  good:      { label: 'Bon',       color: '#059669', fill: 6 },
  bad:       { label: 'Faible',    color: '#D97706', fill: 3 },
}

const STAT_COLORS = {
  orange: '#FF4500',
  pink:   '#EC4899',
  green:  '#059669',
  purple: '#8B5CF6',
  red:    '#EF4444',
}

const PRODUCTS = [
  { id: 1, name: 'Étagère 4 niveaux',          rating: 4.5, perf: 'excellent', perfNum: 994, perfMax: '12,4k', stock: 92,  price: 'custom',  visible: true,  icon: 'Library',     iconBg: '#FFF3EE', iconColor: '#FF4500', spark: [3,5,4,6,5,7,8,7,9] },
  { id: 2, name: 'Porte-encens artisanal',     rating: 4.5, perf: 'good',      perfNum: 123, perfMax: '12,4k', stock: 594, price: 66.00,     visible: true,  icon: 'Flame',       iconBg: '#FCE7F3', iconColor: '#EC4899', spark: [2,3,4,3,5,4,6,5,7] },
  { id: 3, name: 'Cendrier minimaliste',       rating: 4.5, perf: 'good',      perfNum: 637, perfMax: '12,4k', stock: 362, price: 81.00,     visible: false, icon: 'CircleDot',   iconBg: '#F5F3EE', iconColor: '#6B7280', spark: [4,3,5,4,6,5,7,6,8] },
  { id: 4, name: 'Table basse en bois',        rating: 4.5, perf: 'excellent', perfNum: 148, perfMax: '12,4k', stock: 746, price: 'custom',  visible: false, icon: 'Table2',      iconBg: '#FEF3C7', iconColor: '#D97706', spark: [5,4,6,5,7,8,7,9,10] },
  { id: 5, name: 'Canapé 3 places',            rating: 4.5, perf: 'bad',       perfNum: 817, perfMax: '12,4k', stock: 909, price: 'custom',  visible: true,  icon: 'Sofa',        iconBg: '#FFF3EE', iconColor: '#FF4500', spark: [3,4,5,4,3,4,5,4,3] },
  { id: 6, name: 'Photophore design',          rating: 4.5, perf: 'bad',       perfNum: 926, perfMax: '12,4k', stock: 333, price: 50.00,     visible: true,  icon: 'Lightbulb',   iconBg: '#FEF9C3', iconColor: '#CA8A04', spark: [4,5,4,3,4,3,4,3,4] },
  { id: 7, name: 'Lampe de table',             rating: 4.5, perf: 'good',      perfNum: 71,  perfMax: '12,4k', stock: 530, price: 318.00,    visible: true,  icon: 'Lamp',        iconBg: '#EDE9FE', iconColor: '#8B5CF6', spark: [3,4,5,4,6,5,6,7,6] },
]

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function SupplierProductsPage() {
  const [search, setSearch] = useState('')
  const [statsOpen, setStatsOpen] = useState(true)
  const [page, setPage] = useState(1)
  const totalPages = 10

  const filtered = useMemo(
    () => PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  )

  return (
    <div className="gs-products">
      <PageHeader productsCount={PRODUCTS.length} />

      <StatsPanel open={statsOpen} setOpen={setStatsOpen} />

      <ProductsCard
        products={filtered}
        search={search}
        setSearch={setSearch}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SECTION TITLE (helper — icon orange sans fond)
// ═══════════════════════════════════════════════════════════════════
function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="gs-section-title">
      <span className="gs-section-icon">
        <Icon size={20} strokeWidth={2.2} />
      </span>
      {title}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PAGE HEADER — style dashboard (Fraunces 42px + subtitle + CTA)
// ═══════════════════════════════════════════════════════════════════
function PageHeader({ productsCount }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
      gap: 20,
      flexWrap: 'wrap',
    }}>
      <div>
        <h1 className="gs-h1" style={{
          fontSize: 42,
          margin: 0,
          color: '#0F1419',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
        }}>
          Produits
        </h1>
        <p style={{
          margin: '6px 0 0',
          fontSize: 13.5,
          color: '#6B7280',
          fontWeight: 400,
        }}>
          {productsCount} produits dans votre catalogue · gérez, éditez, publiez.
        </p>
      </div>

      <button className="gs-btn-primary">
        <Icons.Plus size={15} strokeWidth={2.5} />
        Nouveau produit
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STATS PANEL — collapsible avec 5 mini-cartes
// ═══════════════════════════════════════════════════════════════════
function StatsPanel({ open, setOpen }) {
  const stats = [
    { label: 'Produits actifs',    value: '352',    sub: 'produits',  color: STAT_COLORS.orange, icon: 'Package' },
    { label: 'Produit phare',      value: 'Canapé', sub: '3 places',  color: STAT_COLORS.pink,   icon: 'Sofa' },
    { label: 'Performance moy.',   value: 'Bon !',  sub: '74 / 100',  color: STAT_COLORS.green,  icon: 'TrendingUp' },
    { label: 'Produits vendus',    value: '12 340', sub: 'unités',    color: STAT_COLORS.purple, icon: 'ShoppingCart' },
    { label: 'Produits retournés', value: '420',    sub: 'unités',    color: STAT_COLORS.red,    icon: 'CornerUpLeft' },
  ]

  return (
    <div className="gs-card" style={{ marginBottom: 16, overflow: 'hidden' }}>
      {/* Header bar */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 22px',
          cursor: 'pointer',
          borderBottom: open ? '1px solid #F0EDE5' : 'none',
          transition: 'background 0.15s',
        }}
      >
        <SectionTitle icon={Icons.BarChart3} title="Statistiques produits" />
        <Icons.ChevronUp
          size={16}
          color="#9AA3AE"
          style={{
            transition: 'transform 0.25s',
            transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        />
      </div>

      {/* Mini-cartes */}
      {open && (
        <div className="gs-collapse" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
          padding: 16,
        }}>
          {stats.map((stat, i) => <MiniStat key={i} {...stat} />)}
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value, sub, color, icon }) {
  const Icon = Icons[icon] || Icons.Circle

  return (
    <div className="gs-mini-stat" style={{
      background: '#fff',
      border: '1px solid #EAE7DF',
      borderRadius: 16,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      cursor: 'default',
    }}>
      {/* Icon dans un cercle coloré léger */}
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: `${color}14`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={17} color={color} strokeWidth={2.2} />
      </div>

      {/* Value + sub */}
      <div>
        <div className="gs-num" style={{
          fontSize: 20,
          color: '#0F1419',
          lineHeight: 1,
        }}>
          {value}
        </div>
        <div style={{
          fontSize: 10.5,
          color: '#9AA3AE',
          marginTop: 4,
          fontWeight: 500,
        }}>
          {sub}
        </div>
      </div>

      {/* Label uppercase */}
      <div style={{
        fontSize: 10.5,
        color: '#6B7280',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginTop: 'auto',
      }}>
        {label}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PRODUCTS CARD — tools + table + pagination
// ═══════════════════════════════════════════════════════════════════
function ProductsCard({ products, search, setSearch, page, setPage, totalPages }) {
  const cols = '2.4fr 1.8fr 0.8fr 1.1fr 0.8fr 0.9fr'

  return (
    <div className="gs-card" style={{ marginBottom: 16, overflow: 'hidden' }}>
      {/* ── Tools bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '16px 22px',
        borderBottom: '1px solid #F0EDE5',
        flexWrap: 'wrap',
      }}>
        <SectionTitle icon={Icons.Package} title="Catalogue" />

        <div style={{ flex: 1, minWidth: 20 }} />

        {/* Search */}
        <div style={{
          background: '#fff',
          border: '1px solid #EAE7DF',
          borderRadius: 999,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          width: 260,
          transition: 'border-color 0.15s',
        }}>
          <Icons.Search size={13} color="#9AA3AE" strokeWidth={2} />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="gs-input-clean"
            style={{ fontSize: 12.5, width: '100%', color: '#0F1419' }}
          />
        </div>

        <button className="gs-pill-outline">
          <Icons.ArrowUpDown size={12} strokeWidth={2.2} />
          Trier
        </button>

        <button className="gs-pill-outline">
          <Icons.SlidersHorizontal size={12} strokeWidth={2.2} />
          Filtres
        </button>
      </div>

      {/* ── Table header UPPERCASE ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: cols,
        padding: '14px 22px',
        borderBottom: '1px solid #F0EDE5',
        fontSize: 10.5,
        color: '#9AA3AE',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        gap: 16,
      }}>
        <div>Produit</div>
        <div>Performance</div>
        <div>Stock</div>
        <div>Prix</div>
        <div>Visible</div>
        <div style={{ textAlign: 'right' }}>Actions</div>
      </div>

      {/* ── Rows ── */}
      {products.length === 0 ? (
        <EmptyRow />
      ) : (
        products.map((p, i) => (
          <ProductRow
            key={p.id}
            product={p}
            cols={cols}
            isLast={i === products.length - 1}
          />
        ))
      )}

      {/* ── Pagination ── */}
      {products.length > 0 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
    </div>
  )
}

function ProductRow({ product, cols, isLast }) {
  const Icon = Icons[product.icon] || Icons.Package
  const perf = PERF_STYLES[product.perf]

  return (
    <div className="gs-row" style={{
      display: 'grid',
      gridTemplateColumns: cols,
      padding: '14px 22px',
      alignItems: 'center',
      borderBottom: isLast ? 'none' : '1px solid #F5F3EE',
      gap: 16,
    }}>
      {/* Produit : icône ronde colorée + nom + rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: product.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={18} strokeWidth={2} color={product.iconColor} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: '#0F1419',
            marginBottom: 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {product.name}
          </div>
          <div style={{
            fontSize: 11,
            color: '#9AA3AE',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <Icons.Star size={11} fill="#FFB800" stroke="#FFB800" />
            <span style={{ color: '#0F1419', fontWeight: 600 }}>{product.rating.toFixed(1)}</span>
            <span>· {Math.floor(Math.random() * 200) + 50} avis</span>
          </div>
        </div>
      </div>

      {/* Performance : chip + gauge + sparkline */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{
            background: `${perf.color}14`,
            color: perf.color,
            padding: '3px 9px',
            borderRadius: 999,
            fontSize: 10.5,
            fontWeight: 700,
          }}>
            {perf.label}
          </span>
          <MiniGauge level={product.perf} size={28} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkline values={product.spark} color={perf.color} />
          <span style={{ fontSize: 10.5, color: '#6B7280' }}>
            <span style={{ color: '#0F1419', fontWeight: 600 }}>{product.perfNum}</span>
            {' / '}{product.perfMax}
          </span>
        </div>
      </div>

      {/* Stock */}
      <div>
        <div className="gs-num" style={{ fontSize: 15, color: '#0F1419' }}>
          {product.stock}
        </div>
        <div style={{ fontSize: 10, color: '#9AA3AE', marginTop: 2 }}>en stock</div>
      </div>

      {/* Prix */}
      <div>
        {product.price === 'custom' ? (
          <>
            <div style={{ fontSize: 13, color: '#0F1419', fontWeight: 600 }}>Sur devis</div>
            <div style={{ fontSize: 10, color: '#9AA3AE', marginTop: 2 }}>négociable</div>
          </>
        ) : (
          <>
            <div className="gs-num" style={{ fontSize: 15, color: '#FF4500' }}>
              {product.price.toFixed(2)}
              <span style={{ fontSize: 10, color: '#9AA3AE', marginLeft: 3, fontWeight: 500 }}>TND</span>
            </div>
            <div style={{ fontSize: 10, color: '#9AA3AE', marginTop: 2 }}>unitaire</div>
          </>
        )}
      </div>

      {/* Visibilité */}
      <div>
        <Toggle initial={product.visible} />
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        justifyContent: 'flex-end',
      }}>
        <button className="gs-icon-btn" title="Modifier">
          <Icons.Pencil size={14} strokeWidth={1.8} />
        </button>
        <button className="gs-icon-btn" title="Voir">
          <Icons.Eye size={14} strokeWidth={1.8} />
        </button>
        <button className="gs-icon-btn" title="Plus">
          <Icons.MoreHorizontal size={14} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MINI GAUGE — semicircle bars
// ═══════════════════════════════════════════════════════════════════
function MiniGauge({ level, size = 56 }) {
  const { color, fill } = PERF_STYLES[level]
  const segments = 11
  const w = size
  const h = size * 0.6
  const cx = w / 2
  const cy = h * 0.95
  const r = w * 0.42

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {Array.from({ length: segments }).map((_, i) => {
        const angle = Math.PI + (Math.PI * i) / (segments - 1)
        const x1 = cx + Math.cos(angle) * (r - w * 0.13)
        const y1 = cy + Math.sin(angle) * (r - w * 0.13)
        const x2 = cx + Math.cos(angle) * r
        const y2 = cy + Math.sin(angle) * r
        const isFilled = i < fill
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={isFilled ? color : '#EAE7DF'}
            strokeWidth={size * 0.06}
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SPARKLINE
// ═══════════════════════════════════════════════════════════════════
function Sparkline({ values, color = '#059669', width = 50, height = 18 }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const step = width / (values.length - 1)

  const points = values
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ flexShrink: 0 }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TOGGLE
// ═══════════════════════════════════════════════════════════════════
function Toggle({ initial = false }) {
  const [on, setOn] = useState(initial)
  return (
    <button
      onClick={() => setOn(!on)}
      style={{
        width: 36, height: 20,
        background: on ? '#FF4500' : '#EAE7DF',
        border: 'none',
        borderRadius: 999,
        position: 'relative',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 0.2s',
        boxShadow: on ? '0 2px 8px -2px rgba(255, 69, 0, 0.4)' : 'none',
      }}
      aria-pressed={on}
    >
      <span style={{
        position: 'absolute',
        top: 2,
        left: on ? 18 : 2,
        width: 16, height: 16,
        background: '#fff',
        borderRadius: '50%',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════════
function Pagination({ page, totalPages, onChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 22px',
      borderTop: '1px solid #F0EDE5',
    }}>
      <button
        onClick={() => page > 1 && onChange(page - 1)}
        disabled={page === 1}
        className="gs-pill-outline"
      >
        <Icons.ArrowLeft size={13} strokeWidth={2.2} />
        Précédent
      </button>

      <div style={{ fontSize: 12.5, color: '#6B7280' }}>
        Page <span style={{ color: '#0F1419', fontWeight: 700 }}>{page}</span>
        <span style={{ color: '#9AA3AE' }}> sur {totalPages}</span>
      </div>

      <button
        onClick={() => page < totalPages && onChange(page + 1)}
        disabled={page === totalPages}
        className="gs-pill-outline"
      >
        Suivant
        <Icons.ArrowRight size={13} strokeWidth={2.2} />
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// EMPTY ROW
// ═══════════════════════════════════════════════════════════════════
function EmptyRow() {
  return (
    <div style={{
      padding: 60,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14,
      color: '#9AA3AE',
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: '50%',
        background: '#FFF3EE',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icons.PackageSearch size={26} color="#FF4500" strokeWidth={1.8} />
      </div>
      <div className="gs-h1" style={{ fontSize: 18, color: '#0F1419' }}>
        Aucun produit trouvé
      </div>
      <div style={{ fontSize: 13 }}>Essayez une autre recherche.</div>
    </div>
  )
}