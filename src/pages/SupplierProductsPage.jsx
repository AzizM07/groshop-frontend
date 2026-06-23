// pages/SupplierProductsPage.jsx — GROSHOP.tn
// Layout: header + collapsible stat panel (mini-cards colorées) + products card (tools + table + pagination)

import { useState, useMemo } from 'react'
import * as Icons from 'lucide-react'

// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-products-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-products-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-products { font-family: 'DM Sans', -apple-system, sans-serif; color: #0F1419; }
    .gs-h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-num { font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-card { background: #fff; border-radius: 18px; border: none; box-shadow: 0 1px 3px rgba(15, 20, 25, 0.04); }

    .gs-input-clean { border: none; outline: none; background: transparent; font-family: inherit; }

    /* Icon button (Edit, View, More) */
    .gs-icon-btn {
      background: transparent; border: none; cursor: pointer; padding: 7px;
      border-radius: 8px; display: inline-flex; align-items: center;
      justify-content: center; color: #9AA3AE; transition: all 0.15s;
    }
    .gs-icon-btn:hover { background: #F5F6F8; color: #0F1419; }

    /* Table row — hover background + left orange accent */
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
    .gs-row:hover { background: #FAFBFC; }
    .gs-row:hover::before { background: #FF4500; }

    /* Pill button (Trier, Filtres) */
    .gs-pill-btn {
      background: #fff;
      border: 1px solid #F1F2F4;
      border-radius: 10px;
      padding: 8px 14px;
      font-size: 12.5px;
      font-weight: 500;
      color: #0F1419;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: inherit;
      transition: all 0.15s;
    }
    .gs-pill-btn:hover { border-color: #D9DDE3; background: #FAFAFA; }

    /* Orange CTA — gradient + lift on hover */
    .gs-cta-orange {
      background: linear-gradient(135deg, #FF6B3D 0%, #FF4500 100%);
      color: #fff;
      border: none;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-family: inherit;
      box-shadow: 0 6px 14px -4px rgba(255, 69, 0, 0.45);
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .gs-cta-orange:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 20px -4px rgba(255, 69, 0, 0.55);
    }

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
  excellent: { label: 'Excellent', color: '#22C55E', fill: 9 },
  good:      { label: 'Bon',       color: '#22C55E', fill: 6 },
  bad:       { label: 'Faible',    color: '#F59E0B', fill: 3 },
}

const STAT_COLORS = {
  orange: '#FF4500',
  pink:   '#EC4899',
  green:  '#22C55E',
  purple: '#8B5CF6',
  red:    '#EF4444',
}

const PRODUCTS = [
  { id: 1, name: 'Étagère 4 niveaux',          rating: 4.5, perf: 'excellent', perfNum: 994, perfMax: '12,4k', stock: 92,  price: 'custom',  visible: true,  icon: 'Library',     bg: '#FFE5D6', spark: [3,5,4,6,5,7,8,7,9] },
  { id: 2, name: 'Porte-encens artisanal',     rating: 4.5, perf: 'good',      perfNum: 123, perfMax: '12,4k', stock: 594, price: 66.00,     visible: true,  icon: 'Flame',       bg: '#FFE0E8', spark: [2,3,4,3,5,4,6,5,7] },
  { id: 3, name: 'Cendrier minimaliste',       rating: 4.5, perf: 'good',      perfNum: 637, perfMax: '12,4k', stock: 362, price: 81.00,     visible: false, icon: 'CircleDot',   bg: '#F1F2F4', spark: [4,3,5,4,6,5,7,6,8] },
  { id: 4, name: 'Table basse en bois',        rating: 4.5, perf: 'excellent', perfNum: 148, perfMax: '12,4k', stock: 746, price: 'custom',  visible: false, icon: 'Table2',      bg: '#E8DCC9', spark: [5,4,6,5,7,8,7,9,10] },
  { id: 5, name: 'Canapé 3 places',            rating: 4.5, perf: 'bad',       perfNum: 817, perfMax: '12,4k', stock: 909, price: 'custom',  visible: true,  icon: 'Sofa',        bg: '#FFE5D6', spark: [3,4,5,4,3,4,5,4,3] },
  { id: 6, name: 'Photophore design',          rating: 4.5, perf: 'bad',       perfNum: 926, perfMax: '12,4k', stock: 333, price: 50.00,     visible: true,  icon: 'Lightbulb',   bg: '#FFF3CD', spark: [4,5,4,3,4,3,4,3,4] },
  { id: 7, name: 'Lampe de table',             rating: 4.5, perf: 'good',      perfNum: 71,  perfMax: '12,4k', stock: 530, price: 318.00,    visible: true,  icon: 'Lamp',        bg: '#EDE9FE', spark: [3,4,5,4,6,5,6,7,6] },
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
// PAGE HEADER — title + count + CTA
// ═══════════════════════════════════════════════════════════════════
function PageHeader({ productsCount }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18,
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div>
        <h1 className="gs-h1" style={{ fontSize: 24, margin: 0, color: '#0F1419' }}>
          Liste des produits
        </h1>
        <p style={{ fontSize: 12.5, color: '#6B7280', margin: '4px 0 0 0' }}>
          {productsCount} produits dans ton catalogue
        </p>
      </div>

      <button className="gs-cta-orange">
        <Icons.Plus size={15} strokeWidth={2.4} />
        Nouveau produit
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STATS PANEL — collapsible avec 5 mini-cartes colorées
// ═══════════════════════════════════════════════════════════════════
function StatsPanel({ open, setOpen }) {
  const stats = [
    { label: 'Produits actifs',     value: '352',     sub: 'produits',      color: STAT_COLORS.orange, icon: 'Package' },
    { label: 'Produit phare',       value: 'Canapé',  sub: '3 places',      color: STAT_COLORS.pink,   icon: 'Sofa' },
    { label: 'Performance moy.',    value: 'Bon !',   sub: '74 / 100',      color: STAT_COLORS.green,  icon: 'TrendingUp' },
    { label: 'Produits vendus',     value: '12 340',  sub: 'unités',        color: STAT_COLORS.purple, icon: 'ShoppingCart' },
    { label: 'Produits retournés',  value: '420',     sub: 'unités',        color: STAT_COLORS.red,    icon: 'CornerUpLeft' },
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
          padding: '14px 20px',
          cursor: 'pointer',
          borderBottom: open ? '1px solid #F1F2F4' : 'none',
          transition: 'background 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icons.BarChart3 size={15} color="#6B7280" strokeWidth={2} />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0F1419' }}>
            Statistiques produits
          </span>
        </div>
        <Icons.ChevronUp
          size={16}
          color="#9AA3AE"
          style={{
            transition: 'transform 0.25s',
            transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        />
      </div>

      {/* Mini-cartes colorées */}
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
      background: `linear-gradient(135deg, #ffffff 0%, ${color}08 100%)`,
      border: `1px solid ${color}18`,
      borderRadius: 14,
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      cursor: 'default',
    }}>
      {/* Icon carré */}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `linear-gradient(135deg, ${color}26 0%, ${color}12 100%)`,
        border: `1px solid ${color}24`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 10px -4px ${color}40`,
      }}>
        <Icon size={16} color={color} strokeWidth={2.2} />
      </div>

      {/* Value + sub */}
      <div>
        <div className="gs-num" style={{
          fontSize: 19,
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

      {/* Label */}
      <div style={{
        fontSize: 10.5,
        color: '#6B7280',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        marginTop: 'auto',
      }}>
        {label}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PRODUCTS CARD — tools + table + pagination dans UNE carte
// ═══════════════════════════════════════════════════════════════════
function ProductsCard({ products, search, setSearch, page, setPage, totalPages }) {
  // 6 columns clean (sans les borderLeft visuellement bruyants)
  const cols = '2.4fr 1.8fr 0.8fr 1.1fr 0.8fr 0.9fr'

  return (
    <div className="gs-card" style={{ marginBottom: 16, overflow: 'hidden' }}>
      {/* ── Tools bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 20px',
        borderBottom: '1px solid #F1F2F4',
        flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{
          background: '#F5F6F8',
          borderRadius: 10,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          flex: 1,
          minWidth: 220,
          maxWidth: 320,
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

        <button className="gs-pill-btn">
          <Icons.ArrowUpDown size={13} strokeWidth={2} />
          Trier
        </button>

        <button className="gs-pill-btn">
          <Icons.SlidersHorizontal size={13} strokeWidth={2} />
          Filtres
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11.5, color: '#9AA3AE' }}>
            {products.length} résultat{products.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Table header ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: cols,
        padding: '12px 20px',
        background: '#FAFAFB',
        borderBottom: '1px solid #F1F2F4',
        fontSize: 10.5,
        color: '#9AA3AE',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
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
      padding: '14px 20px',
      alignItems: 'center',
      borderBottom: isLast ? 'none' : '1px solid #F5F6F8',
      gap: 16,
    }}>
      {/* Product thumb + name + rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 11,
          background: product.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={22} strokeWidth={1.6} color="#0F1419" style={{ opacity: 0.8 }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: '#0F1419',
            marginBottom: 4,
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

      {/* Performance: chip + sparkline + numbers */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{
            background: `${perf.color}18`,
            color: perf.color,
            padding: '2px 8px',
            borderRadius: 8,
            fontSize: 10.5,
            fontWeight: 700,
            border: `1px solid ${perf.color}33`,
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

      {/* Price */}
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

      {/* Visibility toggle */}
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
            stroke={isFilled ? color : '#E5E7EB'}
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
function Sparkline({ values, color = '#22C55E', width = 50, height = 18 }) {
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
        background: on ? '#FF4500' : '#E5E7EB',
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
// PAGINATION (inside the card)
// ═══════════════════════════════════════════════════════════════════
function Pagination({ page, totalPages, onChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 20px',
      borderTop: '1px solid #F1F2F4',
    }}>
      <button
        onClick={() => page > 1 && onChange(page - 1)}
        disabled={page === 1}
        className="gs-pill-btn"
        style={{
          color: page === 1 ? '#C5CBD3' : '#0F1419',
          cursor: page === 1 ? 'not-allowed' : 'pointer',
        }}
      >
        <Icons.ArrowLeft size={13} />
        Précédent
      </button>

      <div style={{ fontSize: 12.5, color: '#6B7280' }}>
        Page <span style={{ color: '#0F1419', fontWeight: 700 }}>{page}</span>
        <span style={{ color: '#9AA3AE' }}> sur {totalPages}</span>
      </div>

      <button
        onClick={() => page < totalPages && onChange(page + 1)}
        disabled={page === totalPages}
        className="gs-pill-btn"
        style={{
          color: page === totalPages ? '#C5CBD3' : '#0F1419',
          cursor: page === totalPages ? 'not-allowed' : 'pointer',
        }}
      >
        Suivant
        <Icons.ArrowRight size={13} />
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
      gap: 12,
      color: '#9AA3AE',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'linear-gradient(135deg, #FFE5D6, #FFB088)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icons.PackageSearch size={28} color="#FF4500" strokeWidth={1.8} />
      </div>
      <div className="gs-h1" style={{ fontSize: 18, color: '#0F1419' }}>
        Aucun produit trouvé
      </div>
      <div style={{ fontSize: 13 }}>Essaye une autre recherche.</div>
    </div>
  )
}