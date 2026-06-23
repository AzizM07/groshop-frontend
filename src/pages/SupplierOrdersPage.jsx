// pages/SupplierOrdersPage.jsx — GROSHOP.tn

import { useState, useMemo } from 'react'
import * as Icons from 'lucide-react'

// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-orders-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-orders-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-orders { font-family: 'DM Sans', -apple-system, sans-serif; color: #0F1419; }
    .gs-h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-num { font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-card { background: #fff; border-radius: 18px; padding: 22px; border: none; box-shadow: 0 1px 3px rgba(15, 20, 25, 0.04); }
    .gs-row-hover:hover { background: #FAFBFC; }
    .gs-input-clean { border: none; outline: none; background: transparent; font-family: inherit; }
  `
  document.head.appendChild(s)
}

// ── Data ───────────────────────────────────────────────────────────
const ICON_GRADIENTS = {
  orange: 'linear-gradient(135deg, #FFB088 0%, #FF6B3D 100%)',
  amber:  'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
  green:  'linear-gradient(135deg, #86EFAC 0%, #22C55E 100%)',
  red:    'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)',
}

const STATUS_STYLES = {
  accepted:   { bg: '#D1FAE5', color: '#059669', text: 'Acceptée' },
  pending:    { bg: '#FEF3C7', color: '#D97706', text: 'En attente' },
  processing: { bg: '#DBEAFE', color: '#2563EB', text: 'En traitement' },
  shipping:   { bg: '#EDE9FE', color: '#7C3AED', text: 'En livraison' },
  delivered:  { bg: '#D1FAE5', color: '#059669', text: 'Livrée' },
  rejected:   { bg: '#FEE2E2', color: '#DC2626', text: 'Rejetée' },
}

const TABS = [
  { key: 'all',        label: 'Toutes' },
  { key: 'pending',    label: 'En attente' },
  { key: 'processing', label: 'En traitement' },
  { key: 'shipping',   label: 'En livraison' },
  { key: 'delivered',  label: 'Livrées' },
]

const ORDERS = [
  { id: '#GS-7842', product: "Huile d'olive extra vierge 5L", items: 4,  status: 'accepted',   date: '12 Juin 2026', amount: '1 250', payment: 'Carte bancaire',     icon: 'Wine',     bg: '#FFE5D6' },
  { id: '#GS-7841', product: 'Café arabica moulu 1kg',         items: 3,  status: 'accepted',   date: '12 Juin 2026', amount: '420',   payment: 'Cash à la livraison', icon: 'Coffee',   bg: '#E8DCC9' },
  { id: '#GS-7840', product: 'T-shirt coton bio col rond',     items: 3,  status: 'pending',    date: '11 Juin 2026', amount: '180',   payment: 'Carte bancaire',     icon: 'Shirt',    bg: '#D9E8FF' },
  { id: '#GS-7839', product: 'Pâtes spaghetti premium 500g',   items: 4,  status: 'processing', date: '11 Juin 2026', amount: '95',    payment: 'Cash à la livraison', icon: 'Wheat',    bg: '#FEF3C7' },
  { id: '#GS-7838', product: 'Crevettes royales 1kg',          items: 2,  status: 'shipping',   date: '10 Juin 2026', amount: '320',   payment: 'Cash à la livraison', icon: 'Fish',     bg: '#FFE0E8' },
  { id: '#GS-7837', product: 'Moutarde de Dijon 250g',         items: 4,  status: 'delivered',  date: '10 Juin 2026', amount: '45',    payment: 'Carte bancaire',     icon: 'Soup',     bg: '#FFF3CD' },
  { id: '#GS-7836', product: 'Biscuits chocolat artisan 200g', items: 4,  status: 'rejected',   date: '9 Juin 2026',  amount: '85',    payment: 'Cash à la livraison', icon: 'Cookie',   bg: '#F5E6D8' },
  { id: '#GS-7835', product: "Savon bio à l'huile d'argan",    items: 6,  status: 'accepted',   date: '9 Juin 2026',  amount: '210',   payment: 'Carte bancaire',     icon: 'Sparkles', bg: '#EDE9FE' },
  { id: '#GS-7834', product: "Huile d'olive 1L",               items: 12, status: 'delivered',  date: '8 Juin 2026',  amount: '480',   payment: 'Carte bancaire',     icon: 'Wine',     bg: '#FFE5D6' },
  { id: '#GS-7833', product: 'Pain artisanal complet',          items: 8,  status: 'pending',    date: '8 Juin 2026',  amount: '120',   payment: 'Cash à la livraison', icon: 'Wheat',    bg: '#FEF3C7' },
  { id: '#GS-7832', product: 'Eau minérale 1.5L pack',         items: 24, status: 'shipping',   date: '7 Juin 2026',  amount: '180',   payment: 'Carte bancaire',     icon: 'Droplet',  bg: '#D9E8FF' },
  { id: '#GS-7831', product: 'Thon entier en boîte 400g',      items: 6,  status: 'delivered',  date: '7 Juin 2026',  amount: '150',   payment: 'Carte bancaire',     icon: 'Fish',     bg: '#FFE0E8' },
]

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function SupplierOrdersPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filteredOrders = useMemo(() => {
    return ORDERS.filter(o => {
      const matchTab = activeTab === 'all' || o.status === activeTab
      const matchSearch = !search
        || o.product.toLowerCase().includes(search.toLowerCase())
        || o.id.toLowerCase().includes(search.toLowerCase())
      return matchTab && matchSearch
    })
  }, [activeTab, search])

  return (
    <div className="gs-orders">
      <StatsRow />
      <OrdersCard
        orders={filteredOrders}
        activeTab={activeTab} setActiveTab={setActiveTab}
        search={search} setSearch={setSearch}
        page={page} setPage={setPage}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STATS ROW — 4 KPIs
// ═══════════════════════════════════════════════════════════════════
function StatsRow() {
  const stats = [
    { label: 'Nouvelles commandes', value: '3 842', icon: 'Inbox',       gradient: ICON_GRADIENTS.orange, trend: '+54%',  trendUp: true  },
    { label: 'En attente',          value: '124',   icon: 'Clock',       gradient: ICON_GRADIENTS.amber,  trend: '-10%',  trendUp: true  },
    { label: 'Terminées',           value: '3 487', icon: 'CheckCircle2', gradient: ICON_GRADIENTS.green,  trend: '+54%',  trendUp: true  },
    { label: 'Annulées',            value: '231',   icon: 'XCircle',     gradient: ICON_GRADIENTS.red,    trend: '-12%',  trendUp: true  },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 14, marginBottom: 16,
    }}>
      {stats.map((s, i) => <KPICard key={i} {...s} />)}
    </div>
  )
}

function KPICard({ label, value, icon, gradient, trend, trendUp }) {
  const Icon = Icons[icon] || Icons.Circle
  const TrendIcon = trendUp ? Icons.TrendingUp : Icons.TrendingDown

  return (
    <div className="gs-card" style={{ padding: 18 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 11.5, color: '#6B7280', fontWeight: 500 }}>
          {label}
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          flexShrink: 0,
          boxShadow: '0 6px 14px -4px rgba(15, 20, 25, 0.15)',
        }}>
          <Icon size={17} strokeWidth={2} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span className="gs-num" style={{ fontSize: 24, color: '#0F1419', lineHeight: 1 }}>
          {value}
        </span>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 2,
          background: trendUp ? '#D1FAE5' : '#FEE2E2',
          color: trendUp ? '#059669' : '#DC2626',
          padding: '2px 7px',
          borderRadius: 10,
          fontSize: 10.5, fontWeight: 600,
        }}>
          <TrendIcon size={10} strokeWidth={2.4} />{trend}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ORDERS CARD
// ═══════════════════════════════════════════════════════════════════
function OrdersCard({ orders, activeTab, setActiveTab, search, setSearch, page, setPage }) {
  // Sans colonne client : Produit | ID | Montant | Statut | Action
  const cols = '3fr 1.2fr 1.4fr 1fr 0.3fr'

  return (
    <div className="gs-card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
      }}>
        <div className="gs-h1" style={{ fontSize: 20 }}>Liste des commandes</div>
        <button style={{
          background: '#FF4500',
          color: '#fff',
          border: 'none',
          padding: '9px 16px',
          borderRadius: 20,
          fontSize: 12.5,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'inherit',
          boxShadow: '0 4px 12px -2px rgba(255, 69, 0, 0.4)',
        }}>
          <Icons.Plus size={14} strokeWidth={2.4} />
          Nouvelle commande
        </button>
      </div>

      {/* Tabs + Search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1) }}
              style={{
                background: tab.key === activeTab ? '#FFE5D6' : 'transparent',
                color: tab.key === activeTab ? '#FF4500' : '#9AA3AE',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: tab.key === activeTab ? 600 : 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            background: '#F5F6F8',
            borderRadius: 20,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: 220,
          }}>
            <Icons.Search size={13} color="#9AA3AE" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="gs-input-clean"
              style={{ fontSize: 12, width: '100%' }}
            />
          </div>
          <button style={{
            background: '#F5F6F8', border: 'none',
            borderRadius: '50%', width: 34, height: 34,
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Icons.SlidersHorizontal size={14} color="#6B7280" />
          </button>
          <button style={{
            background: '#F5F6F8', border: 'none',
            borderRadius: '50%', width: 34, height: 34,
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Icons.Filter size={14} color="#6B7280" />
          </button>
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: cols,
        padding: '12px 8px',
        fontSize: 11,
        color: '#9AA3AE',
        fontWeight: 500,
        borderBottom: '1px solid #F1F2F4',
      }}>
        <div>Produit</div>
        <div>ID Commande</div>
        <div>Montant</div>
        <div>Statut</div>
        <div></div>
      </div>

      {/* Rows */}
      {orders.length === 0 ? (
        <EmptyState />
      ) : (
        orders.map((order, i) => {
          const status = STATUS_STYLES[order.status]
          const ProductIcon = Icons[order.icon] || Icons.Package

          return (
            <div
              key={order.id}
              className="gs-row-hover"
              style={{
                display: 'grid',
                gridTemplateColumns: cols,
                padding: '14px 8px',
                fontSize: 12.5,
                color: '#0F1419',
                borderBottom: i < orders.length - 1 ? '1px solid #F1F2F4' : 'none',
                alignItems: 'center',
                borderRadius: 10,
                transition: 'background 0.15s',
              }}
            >
              {/* Produit */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: order.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0F1419', flexShrink: 0,
                }}>
                  <ProductIcon size={18} strokeWidth={1.8} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {order.product}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#9AA3AE', marginTop: 2 }}>
                    {order.items} article{order.items > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* ID */}
              <div>
                <div style={{ fontWeight: 500 }}>{order.id}</div>
                <div style={{ fontSize: 10.5, color: '#9AA3AE', marginTop: 2 }}>
                  {order.date}
                </div>
              </div>

              {/* Montant */}
              <div>
                <div className="gs-num" style={{ fontSize: 14, color: '#FF4500' }}>
                  {order.amount}
                  <span style={{ fontSize: 10, color: '#9AA3AE', marginLeft: 3, fontWeight: 500 }}>TND</span>
                </div>
                <div style={{ fontSize: 10.5, color: '#9AA3AE', marginTop: 2 }}>
                  {order.payment}
                </div>
              </div>

              {/* Statut */}
              <div>
                <span style={{
                  background: status.bg,
                  color: status.color,
                  padding: '4px 11px',
                  borderRadius: 14,
                  fontSize: 10.5,
                  fontWeight: 600,
                  border: `1px solid ${status.color}33`,
                  whiteSpace: 'nowrap',
                }}>
                  {status.text}
                </span>
              </div>

              {/* Action */}
              <div style={{ textAlign: 'right' }}>
                <button style={{
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', color: '#9AA3AE', padding: 4,
                }}>
                  <Icons.MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          )
        })
      )}

      {/* Pagination */}
      {orders.length > 0 && (
        <Pagination
          totalItems={orders.length}
          page={page}
          setPage={setPage}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════════
function Pagination({ totalItems, page, setPage }) {
  // Mock : on simule plusieurs pages (1, 2 ... 10, 11, 12, 13, 14)
  const pages = [1, 2, '...', 10, 12, 13, 14]
  const totalPages = 14

  const PageBtn = ({ children, active, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: active ? '#FF4500' : 'transparent',
        color: active ? '#fff' : disabled ? '#D1D5DB' : '#6B7280',
        border: 'none',
        minWidth: 30,
        height: 30,
        borderRadius: '50%',
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {children}
    </button>
  )

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 22,
      paddingTop: 16,
      borderTop: '1px solid #F1F2F4',
    }}>
      <button
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
        style={{
          background: '#F5F6F8',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 16,
          fontSize: 12,
          fontWeight: 500,
          color: page === 1 ? '#D1D5DB' : '#0F1419',
          cursor: page === 1 ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'inherit',
        }}>
        <Icons.ArrowLeft size={13} />
        Précédent
      </button>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {pages.map((p, i) => p === '...' ? (
          <span key={i} style={{ color: '#9AA3AE', padding: '0 4px' }}>...</span>
        ) : (
          <PageBtn
            key={i}
            active={p === page}
            onClick={() => setPage(p)}
          >
            {p}
          </PageBtn>
        ))}
      </div>

      <button
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        style={{
          background: '#F5F6F8',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 16,
          fontSize: 12,
          fontWeight: 500,
          color: page === totalPages ? '#D1D5DB' : '#0F1419',
          cursor: page === totalPages ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'inherit',
        }}>
        Suivant
        <Icons.ArrowRight size={13} />
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════
function EmptyState() {
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
        width: 64, height: 64,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #FFE5D6, #FFB088)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icons.PackageSearch size={28} color="#FF4500" strokeWidth={1.8} />
      </div>
      <div className="gs-h1" style={{ fontSize: 18, color: '#0F1419' }}>
        Aucune commande
      </div>
      <div style={{ fontSize: 12.5 }}>
        Aucune commande ne correspond à ta recherche.
      </div>
    </div>
  )
}