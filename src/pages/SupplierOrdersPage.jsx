// pages/SupplierOrdersPage.jsx — GROSHOP.tn
// Style Donezo/Recent Activity : header Fraunces + KPIs + tabs + table uppercase

import { useState, useMemo } from 'react'
import * as Icons from 'lucide-react'

// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-orders-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-orders-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-orders {
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

    .gs-icon-btn {
      background: transparent; border: none; cursor: pointer; padding: 7px;
      border-radius: 8px; display: inline-flex; align-items: center;
      justify-content: center; color: #9AA3AE; transition: all 0.15s;
    }
    .gs-icon-btn:hover { background: #FAFAF7; color: #0F1419; }

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

    .gs-btn-primary {
      background: #FF4500; color: #fff; border: none;
      padding: 11px 20px; border-radius: 999px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      font-family: inherit;
      display: inline-flex; align-items: center; gap: 7px;
      transition: background 0.15s, transform 0.1s, box-shadow 0.2s;
      box-shadow: 0 6px 18px -6px rgba(255, 69, 0, 0.5);
    }
    .gs-btn-primary:hover { background: #E03D00; box-shadow: 0 10px 22px -8px rgba(255, 69, 0, 0.6); }
    .gs-btn-primary:active { transform: scale(0.97); }

    .gs-mini-stat { transition: transform 0.18s ease, box-shadow 0.18s ease; }
    .gs-mini-stat:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -6px rgba(15, 20, 25, 0.10);
    }

    /* Tab pills */
    .gs-tab {
      padding: 8px 16px;
      border: none;
      background: transparent;
      color: #9AA3AE;
      font-weight: 500;
      font-size: 13px;
      cursor: pointer;
      border-radius: 999px;
      font-family: inherit;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .gs-tab:hover { color: #0F1419; }
    .gs-tab--active { background: #FFF3EE; color: #FF4500; font-weight: 600; }
  `
  document.head.appendChild(s)
}

// ── Data ───────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:   { label: 'En attente', bg: '#FEF3C7', color: '#D97706' },
  accepted:  { label: 'Acceptée',   bg: '#ECFDF5', color: '#059669' },
  processing:{ label: 'En cours',   bg: '#EFF6FF', color: '#3B82F6' },
  shipped:   { label: 'Expédiée',   bg: '#EDE9FE', color: '#8B5CF6' },
  delivered: { label: 'Livrée',     bg: '#ECFDF5', color: '#059669' },
  cancelled: { label: 'Annulée',    bg: '#F5F3EE', color: '#6B7280' },
  rejected:  { label: 'Rejetée',    bg: '#FEF2F2', color: '#DC2626' },
}

const PAYMENT_STYLES = {
  card:  { label: 'Carte bancaire',  icon: 'CreditCard' },
  cash:  { label: 'Cash livraison',  icon: 'Banknote' },
  bank:  { label: 'Virement',        icon: 'Landmark' },
}

const ORDERS = [
  { id: '#GS-8421', customer: 'Amel Ben Salem', city: 'Tunis',    items: 4, product: 'Huile d\'olive 5L',       amount: 1250, status: 'pending',    payment: 'card', date: '13 Juin 2026 · 14:32', icon: 'Wine',   iconBg: '#FFF3EE', iconColor: '#FF4500' },
  { id: '#GS-8420', customer: 'Karim Trabelsi', city: 'Sfax',     items: 3, product: 'Café moulu 1kg',           amount: 420,  status: 'accepted',   payment: 'cash', date: '13 Juin 2026 · 12:18', icon: 'Coffee', iconBg: '#E8F5E9', iconColor: '#059669' },
  { id: '#GS-8419', customer: 'Sonia Mansour',  city: 'Sousse',   items: 3, product: 'T-shirt coton',            amount: 180,  status: 'processing', payment: 'card', date: '13 Juin 2026 · 10:45', icon: 'Shirt',  iconBg: '#EFF6FF', iconColor: '#3B82F6' },
  { id: '#GS-8418', customer: 'Nabil Hamdi',    city: 'Bizerte',  items: 4, product: 'Pâtes spaghetti',          amount: 95,   status: 'shipped',    payment: 'cash', date: '12 Juin 2026 · 18:22', icon: 'Wheat',  iconBg: '#FEF3C7', iconColor: '#D97706' },
  { id: '#GS-8417', customer: 'Leila Fekih',    city: 'Ariana',   items: 2, product: 'Crevettes 1kg',            amount: 320,  status: 'delivered',  payment: 'card', date: '12 Juin 2026 · 15:10', icon: 'Fish',   iconBg: '#FCE7F3', iconColor: '#EC4899' },
  { id: '#GS-8416', customer: 'Mehdi Louhichi', city: 'Nabeul',   items: 4, product: 'Moutarde 250g',            amount: 45,   status: 'delivered',  payment: 'card', date: '12 Juin 2026 · 09:33', icon: 'Soup',   iconBg: '#FEF9C3', iconColor: '#CA8A04' },
  { id: '#GS-8415', customer: 'Rania Chaker',   city: 'Monastir', items: 2, product: 'Biscuits',                 amount: 85,   status: 'cancelled',  payment: 'cash', date: '11 Juin 2026 · 20:55', icon: 'Cookie', iconBg: '#F5F3EE', iconColor: '#6B7280' },
  { id: '#GS-8414', customer: 'Omar Guiga',     city: 'Gabès',    items: 5, product: 'Miel de fleurs',           amount: 275,  status: 'rejected',   payment: 'bank', date: '11 Juin 2026 · 16:12', icon: 'Cherry', iconBg: '#FEF2F2', iconColor: '#DC2626' },
]

const TABS = [
  { key: 'all',        label: 'Toutes',      count: 342 },
  { key: 'pending',    label: 'En attente',  count: 24 },
  { key: 'accepted',   label: 'Acceptées',   count: 18 },
  { key: 'processing', label: 'En cours',    count: 46 },
  { key: 'shipped',    label: 'Expédiées',   count: 62 },
  { key: 'delivered',  label: 'Livrées',     count: 156 },
  { key: 'cancelled',  label: 'Annulées',    count: 12 },
  { key: 'rejected',   label: 'Rejetées',    count: 24 },
]

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function SupplierOrdersPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const totalPages = 15

  const filtered = useMemo(() => {
    return ORDERS.filter(o => {
      if (activeTab !== 'all' && o.status !== activeTab) return false
      if (search && !o.product.toLowerCase().includes(search.toLowerCase())
          && !o.customer.toLowerCase().includes(search.toLowerCase())
          && !o.id.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [activeTab, search])

  return (
    <div className="gs-orders">
      <PageHeader />
      <StatsRow />
      <OrdersCard
        orders={filtered}
        tabs={TABS}
        activeTab={activeTab} setActiveTab={setActiveTab}
        search={search} setSearch={setSearch}
        page={page} setPage={setPage}
        totalPages={totalPages}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SECTION TITLE
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
// PAGE HEADER
// ═══════════════════════════════════════════════════════════════════
function PageHeader() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: 24, gap: 20, flexWrap: 'wrap',
    }}>
      <div>
        <h1 className="gs-h1" style={{
          fontSize: 42, margin: 0, color: '#0F1419',
          lineHeight: 1.05, letterSpacing: '-0.03em',
        }}>
          Commandes
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#6B7280', fontWeight: 400 }}>
          Suivez et gérez toutes vos commandes clients en temps réel.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button className="gs-pill-outline">
          <Icons.Download size={13} strokeWidth={2.2} />
          Exporter
        </button>
        <button className="gs-btn-primary">
          <Icons.Plus size={15} strokeWidth={2.5} />
          Nouvelle commande
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STATS ROW — 6 mini-stats
// ═══════════════════════════════════════════════════════════════════
function StatsRow() {
  const stats = [
    { label: 'Total du jour',    value: '48',      sub: 'commandes', color: '#FF4500', icon: 'ShoppingBag',   trend: '+12%' },
    { label: 'CA du jour',       value: '12 340',  sub: 'TND',       color: '#059669', icon: 'DollarSign',    trend: '+8%' },
    { label: 'En attente',       value: '24',      sub: 'à traiter', color: '#D97706', icon: 'Clock',         trend: '' },
    { label: 'En livraison',     value: '62',      sub: 'en cours',  color: '#8B5CF6', icon: 'Truck',         trend: '' },
    { label: 'Taux livraison',   value: '94',      sub: '% sur 7j',  color: '#3B82F6', icon: 'CheckCircle2',  trend: '+2%' },
    { label: 'Panier moyen',     value: '257',     sub: 'TND',       color: '#EC4899', icon: 'ShoppingCart',  trend: '-3%' },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: 12,
      marginBottom: 16,
    }}>
      {stats.map((s, i) => <MiniStat key={i} {...s} />)}
    </div>
  )
}

function MiniStat({ label, value, sub, color, icon, trend }) {
  const Icon = Icons[icon] || Icons.Circle
  const trendUp = trend && trend.startsWith('+')

  return (
    <div className="gs-mini-stat gs-card" style={{
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: `${color}14`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} color={color} strokeWidth={2.2} />
        </div>
        {trend && (
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: trendUp ? '#059669' : '#DC2626',
            background: trendUp ? '#ECFDF5' : '#FEF2F2',
            padding: '2px 6px',
            borderRadius: 999,
          }}>
            {trend}
          </span>
        )}
      </div>

      <div>
        <div className="gs-num" style={{
          fontSize: 22, color: '#0F1419', lineHeight: 1,
          display: 'flex', alignItems: 'baseline', gap: 4,
        }}>
          {value}
          <span style={{ fontSize: 11, color: '#9AA3AE', fontWeight: 500 }}>{sub}</span>
        </div>
        <div style={{
          fontSize: 10.5, color: '#6B7280',
          fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4,
          marginTop: 6,
        }}>
          {label}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ORDERS CARD
// ═══════════════════════════════════════════════════════════════════
function OrdersCard({ orders, tabs, activeTab, setActiveTab, search, setSearch, page, setPage, totalPages }) {
  const cols = '1.8fr 2fr 1.1fr 0.9fr 1.1fr 0.6fr'

  return (
    <div className="gs-card" style={{ overflow: 'hidden' }}>
      {/* ── Tools bar : titre + search + filtres ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '16px 22px',
        borderBottom: '1px solid #F0EDE5',
        flexWrap: 'wrap',
      }}>
        <SectionTitle icon={Icons.Package2} title="Liste des commandes" />
        <div style={{ flex: 1, minWidth: 20 }} />

        <div style={{
          background: '#fff',
          border: '1px solid #EAE7DF',
          borderRadius: 999,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          width: 260,
        }}>
          <Icons.Search size={13} color="#9AA3AE" strokeWidth={2} />
          <input
            type="text"
            placeholder="ID, client, produit..."
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

      {/* ── Tabs status ── */}
      <div style={{
        display: 'flex',
        gap: 4,
        padding: '12px 22px',
        borderBottom: '1px solid #F0EDE5',
        overflowX: 'auto',
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`gs-tab ${t.key === activeTab ? 'gs-tab--active' : ''}`}
          >
            {t.label}
            <span style={{
              fontSize: 10.5,
              padding: '1px 7px',
              borderRadius: 999,
              background: t.key === activeTab ? 'rgba(255,69,0,0.15)' : '#F5F3EE',
              color: t.key === activeTab ? '#FF4500' : '#9AA3AE',
              fontWeight: 700,
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Table header ── */}
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
        <div>ID · Date</div>
        <div>Client · Produit</div>
        <div>Montant</div>
        <div>Paiement</div>
        <div>Statut</div>
        <div style={{ textAlign: 'right' }}>Actions</div>
      </div>

      {/* ── Rows ── */}
      {orders.length === 0 ? (
        <EmptyRow />
      ) : (
        orders.map((o, i) => (
          <OrderRow key={o.id} order={o} cols={cols} isLast={i === orders.length - 1} />
        ))
      )}

      {orders.length > 0 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </div>
  )
}

function OrderRow({ order, cols, isLast }) {
  const Icon = Icons[order.icon] || Icons.Package
  const status = STATUS_STYLES[order.status]
  const payment = PAYMENT_STYLES[order.payment]
  const PayIcon = Icons[payment.icon] || Icons.CreditCard

  return (
    <div className="gs-row" style={{
      display: 'grid',
      gridTemplateColumns: cols,
      padding: '14px 22px',
      alignItems: 'center',
      borderBottom: isLast ? 'none' : '1px solid #F5F3EE',
      gap: 16,
    }}>
      <div>
        <div style={{ fontSize: 13, color: '#0F1419', fontWeight: 600 }}>{order.id}</div>
        <div style={{ fontSize: 10.5, color: '#9AA3AE', marginTop: 2 }}>{order.date}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: order.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={17} strokeWidth={2} color={order.iconColor} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: '#0F1419',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {order.customer}
          </div>
          <div style={{ fontSize: 11, color: '#9AA3AE', marginTop: 2 }}>
            {order.product} · {order.items} article{order.items > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div>
        <div className="gs-num" style={{ fontSize: 15, color: '#0F1419' }}>
          {order.amount}
          <span style={{ fontSize: 10.5, color: '#9AA3AE', marginLeft: 3, fontWeight: 500 }}>TND</span>
        </div>
        <div style={{ fontSize: 10.5, color: '#9AA3AE', marginTop: 2 }}>{order.city}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <PayIcon size={14} color="#6B7280" strokeWidth={2} />
        <span style={{ fontSize: 12, color: '#0F1419', fontWeight: 500 }}>{payment.label}</span>
      </div>

      <div>
        <span style={{
          background: status.bg, color: status.color,
          padding: '4px 11px', borderRadius: 999,
          fontSize: 11, fontWeight: 600,
          whiteSpace: 'nowrap', display: 'inline-block',
        }}>
          {status.label}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
        <button className="gs-icon-btn" title="Voir">
          <Icons.Eye size={14} strokeWidth={1.8} />
        </button>
        <button className="gs-icon-btn" title="Message">
          <Icons.MessageCircle size={14} strokeWidth={1.8} />
        </button>
        <button className="gs-icon-btn" title="Plus">
          <Icons.MoreHorizontal size={14} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════════
function Pagination({ page, totalPages, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 22px', borderTop: '1px solid #F0EDE5',
    }}>
      <button onClick={() => page > 1 && onChange(page - 1)} disabled={page === 1} className="gs-pill-outline">
        <Icons.ArrowLeft size={13} strokeWidth={2.2} />
        Précédent
      </button>
      <div style={{ fontSize: 12.5, color: '#6B7280' }}>
        Page <span style={{ color: '#0F1419', fontWeight: 700 }}>{page}</span>
        <span style={{ color: '#9AA3AE' }}> sur {totalPages}</span>
      </div>
      <button onClick={() => page < totalPages && onChange(page + 1)} disabled={page === totalPages} className="gs-pill-outline">
        Suivant
        <Icons.ArrowRight size={13} strokeWidth={2.2} />
      </button>
    </div>
  )
}

function EmptyRow() {
  return (
    <div style={{
      padding: 60,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
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
        Aucune commande trouvée
      </div>
      <div style={{ fontSize: 13 }}>Essayez d'autres filtres ou recherche.</div>
    </div>
  )
}