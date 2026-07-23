// pages/SupplierOrdersPage.jsx — GROSHOP.tn
// Connecté au backend : /api/orders/supplier/ (via lib/api.js — cookies + CSRF).
// Style Donezo/Recent Activity conservé.

import { useState, useEffect, useMemo, useRef } from 'react'
import * as Icons from 'lucide-react'
import { orders as ordersApi } from '../lib/api'

// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-orders-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-orders-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-orders { font-family: 'DM Sans', -apple-system, sans-serif; color: #0F1419; background: transparent; min-height: 100vh; padding: 24px; }
    .gs-h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-num { font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-card { background: #fff; border-radius: 20px; border: 1px solid #EAE7DF; box-shadow: 0 1px 3px rgba(15, 20, 25, 0.03); }
    .gs-input-clean { border: none; outline: none; background: transparent; font-family: inherit; }
    .gs-section-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 600; color: #0F1419; letter-spacing: -0.01em; }
    .gs-section-icon { color: #FF4500; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .gs-icon-btn { background: transparent; border: none; cursor: pointer; padding: 7px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: #9AA3AE; transition: all 0.15s; }
    .gs-icon-btn:hover { background: #FAFAF7; color: #0F1419; }
    .gs-row { position: relative; transition: background 0.18s ease; }
    .gs-row::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: transparent; transition: background 0.18s ease; border-radius: 0 2px 2px 0; }
    .gs-row:hover { background: #FAFAF7; }
    .gs-row:hover::before { background: #FF4500; }
    .gs-pill-outline { display: inline-flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #EAE7DF; padding: 8px 14px; border-radius: 999px; font-size: 12.5px; font-weight: 500; color: #0F1419; cursor: pointer; font-family: inherit; transition: all 0.15s; }
    .gs-pill-outline:hover { border-color: #0F1419; }
    .gs-pill-outline:disabled { opacity: 0.4; cursor: not-allowed; }
    .gs-pill-outline:disabled:hover { border-color: #EAE7DF; }
    .gs-mini-stat { transition: transform 0.18s ease, box-shadow 0.18s ease; }
    .gs-mini-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -6px rgba(15, 20, 25, 0.10); }
    .gs-tab { padding: 8px 16px; border: none; background: transparent; color: #9AA3AE; font-weight: 500; font-size: 13px; cursor: pointer; border-radius: 999px; font-family: inherit; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; white-space: nowrap; }
    .gs-tab:hover { color: #0F1419; }
    .gs-tab--active { background: #FFF3EE; color: #FF4500; font-weight: 600; }
    .gs-menu-item { display: block; width: 100%; text-align: left; padding: 8px 12px; font-size: 12.5px; color: #3D4853; background: none; border: none; cursor: pointer; border-radius: 7px; font-family: inherit; }
    .gs-menu-item:hover { background: #F7F6F3; }
    @keyframes gs-spin { to { transform: rotate(360deg); } }
    .gs-spin { animation: gs-spin 0.8s linear infinite; }
  `
  document.head.appendChild(s)
}

// ── Statuts réels (SubOrder.STATUS) ────────────────────────────────
const STATUS_STYLES = {
  pending:       { label: 'En attente',    bg: '#FEF3C7', color: '#D97706' },
  confirmed:     { label: 'Confirmée',     bg: '#ECFDF5', color: '#059669' },
  in_production: { label: 'En production', bg: '#EFF6FF', color: '#3B82F6' },
  shipped:       { label: 'Expédiée',      bg: '#EDE9FE', color: '#8B5CF6' },
  delivered:     { label: 'Livrée',        bg: '#ECFDF5', color: '#059669' },
  cancelled:     { label: 'Annulée',       bg: '#F5F3EE', color: '#6B7280' },
}
const STATUS_ORDER = ['pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled']

// ── Paiements réels (Order.PAYMENT_METHODS) ────────────────────────
const PAYMENT_STYLES = {
  cod:      { label: 'Paiement livraison', icon: 'Banknote' },
  d17:      { label: 'D17',                icon: 'Smartphone' },
  flouci:   { label: 'Flouci',             icon: 'Wallet' },
  sobflous: { label: 'Sobflous',           icon: 'Wallet' },
  virement: { label: 'Virement',           icon: 'Landmark' },
}

const TABS_DEF = [
  { key: 'all',           label: 'Toutes' },
  { key: 'pending',       label: 'En attente' },
  { key: 'confirmed',     label: 'Confirmées' },
  { key: 'in_production', label: 'En production' },
  { key: 'shipped',       label: 'Expédiées' },
  { key: 'delivered',     label: 'Livrées' },
  { key: 'cancelled',     label: 'Annulées' },
]

const PER_PAGE = 10
const fmtTND = (v) => Number(v || 0).toLocaleString('fr-FR', { maximumFractionDigits: 3 })
function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// ═══════════════════════════════════════════════════════════════════
export default function DesktopSupplierOrdersPage() {
  const [all, setAll]         = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [activeTab, setTab]   = useState('all')
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)

  useEffect(() => {
    let alive = true
    setLoading(true)
    ordersApi.supplier()
      .then((d) => { if (alive) setAll(Array.isArray(d) ? d : (d?.results || [])) })
      .catch((e) => { if (alive) setError(e.message || 'Erreur de chargement') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  useEffect(() => { setPage(1) }, [activeTab, search])

  const counts = useMemo(() => {
    const c = { all: all.length }
    all.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1 })
    return c
  }, [all])

  const filtered = useMemo(() => all.filter((o) => {
    if (activeTab !== 'all' && o.status !== activeTab) return false
    if (search) {
      const q = search.toLowerCase()
      const prod = (o.items?.[0]?.product_name) || ''
      if (!(o.buyer_name || '').toLowerCase().includes(q) &&
          !prod.toLowerCase().includes(q) &&
          !String(o.id).toLowerCase().includes(q)) return false
    }
    return true
  }), [all, activeTab, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const stats = useMemo(() => {
    const total = all.length
    const ca    = all.reduce((s, o) => s + Number(o.subtotal_tnd || 0), 0)
    const avg   = total ? ca / total : 0
    return [
      { label: 'Commandes',    value: String(total),                       sub: 'reçues',    color: '#FF4500', icon: 'ShoppingBag' },
      { label: 'CA total',     value: fmtTND(ca),                          sub: 'TND',       color: '#059669', icon: 'DollarSign' },
      { label: 'En attente',   value: String(counts.pending || 0),         sub: 'à traiter', color: '#D97706', icon: 'Clock' },
      { label: 'En production',value: String(counts.in_production || 0),    sub: 'en cours',  color: '#3B82F6', icon: 'Factory' },
      { label: 'Expédiées',    value: String(counts.shipped || 0),         sub: 'en route',  color: '#8B5CF6', icon: 'Truck' },
      { label: 'Panier moyen', value: fmtTND(avg),                         sub: 'TND',       color: '#EC4899', icon: 'ShoppingCart' },
    ]
  }, [all, counts])

  async function changeStatus(id, newStatus) {
    // maj optimiste
    setAll((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
    try {
      await ordersApi.updateSubOrderStatus(id, newStatus)
    } catch (e) {
      alert('Erreur : ' + e.message)
      // rechargement en cas d'échec
      ordersApi.supplier().then((d) => setAll(Array.isArray(d) ? d : (d?.results || []))).catch(() => {})
    }
  }

  const tabs = TABS_DEF.map((t) => ({ ...t, count: counts[t.key] || 0 }))

  return (
    <div className="gs-orders">
      <PageHeader />
      <StatsRow stats={stats} />
      <OrdersCard
        loading={loading} error={error}
        orders={pageItems} totalFiltered={filtered.length}
        tabs={tabs} activeTab={activeTab} setActiveTab={setTab}
        search={search} setSearch={setSearch}
        page={page} setPage={setPage} totalPages={totalPages}
        onChangeStatus={changeStatus}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="gs-section-title">
      <span className="gs-section-icon"><Icon size={20} strokeWidth={2.2} /></span>
      {title}
    </div>
  )
}

function PageHeader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 20, flexWrap: 'wrap' }}>
      <div>
        <h1 className="gs-h1" style={{ fontSize: 42, margin: 0, color: '#0F1419', lineHeight: 1.05, letterSpacing: '-0.03em' }}>Commandes</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#6B7280', fontWeight: 400 }}>
          Suivez et gérez toutes vos commandes clients en temps réel.
        </p>
      </div>
      <button className="gs-pill-outline" style={{ flexShrink: 0 }}>
        <Icons.Download size={13} strokeWidth={2.2} /> Exporter
      </button>
    </div>
  )
}

function StatsRow({ stats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 16 }}>
      {stats.map((s, i) => <MiniStat key={i} {...s} />)}
    </div>
  )
}

function MiniStat({ label, value, sub, color, icon }) {
  const Icon = Icons[icon] || Icons.Circle
  return (
    <div className="gs-mini-stat gs-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={15} color={color} strokeWidth={2.2} />
      </div>
      <div>
        <div className="gs-num" style={{ fontSize: 22, color: '#0F1419', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 4 }}>
          {value}
          <span style={{ fontSize: 11, color: '#9AA3AE', fontWeight: 500 }}>{sub}</span>
        </div>
        <div style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 6 }}>{label}</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function OrdersCard({ loading, error, orders, totalFiltered, tabs, activeTab, setActiveTab, search, setSearch, page, setPage, totalPages, onChangeStatus }) {
  const cols = '1.7fr 2fr 1.1fr 1fr 1.1fr 0.6fr'

  return (
    <div className="gs-card" style={{ overflow: 'hidden' }}>
      {/* Tools bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px', borderBottom: '1px solid #F0EDE5', flexWrap: 'wrap' }}>
        <SectionTitle icon={Icons.Package2} title="Liste des commandes" />
        <div style={{ flex: 1, minWidth: 20 }} />
        <div style={{ background: '#fff', border: '1px solid #EAE7DF', borderRadius: 999, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 7, width: 260 }}>
          <Icons.Search size={13} color="#9AA3AE" strokeWidth={2} />
          <input type="text" placeholder="Client, produit, n°..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="gs-input-clean" style={{ fontSize: 12.5, width: '100%', color: '#0F1419' }} />
        </div>
        <button className="gs-pill-outline"><Icons.ArrowUpDown size={12} strokeWidth={2.2} /> Trier</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 22px', borderBottom: '1px solid #F0EDE5', overflowX: 'auto' }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`gs-tab ${t.key === activeTab ? 'gs-tab--active' : ''}`}>
            {t.label}
            <span style={{ fontSize: 10.5, padding: '1px 7px', borderRadius: 999, background: t.key === activeTab ? 'rgba(255,69,0,0.15)' : '#F5F3EE', color: t.key === activeTab ? '#FF4500' : '#9AA3AE', fontWeight: 700 }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '14px 22px', borderBottom: '1px solid #F0EDE5', fontSize: 10.5, color: '#9AA3AE', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', gap: 16 }}>
        <div>N° · Date</div>
        <div>Client · Produit</div>
        <div>Montant</div>
        <div>Paiement</div>
        <div>Statut</div>
        <div style={{ textAlign: 'right' }}>Actions</div>
      </div>

      {/* Body */}
      {loading ? (
        <LoadingRows cols={cols} />
      ) : error ? (
        <StateBox icon="AlertTriangle" title="Erreur de chargement" sub={error} />
      ) : orders.length === 0 ? (
        totalFiltered === 0
          ? <StateBox icon="PackageSearch" title="Aucune commande pour l'instant" sub="Tes commandes clients apparaîtront ici." />
          : <StateBox icon="PackageSearch" title="Aucune commande trouvée" sub="Essaie d'autres filtres ou recherche." />
      ) : (
        orders.map((o, i) => (
          <OrderRow key={o.id} order={o} cols={cols} isLast={i === orders.length - 1} onChangeStatus={onChangeStatus} />
        ))
      )}

      {!loading && !error && orders.length > 0 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </div>
  )
}

function OrderRow({ order, cols, isLast, onChangeStatus }) {
  const status  = STATUS_STYLES[order.status] || STATUS_STYLES.pending
  const payment = PAYMENT_STYLES[order.payment_method] || { label: order.payment_method || '—', icon: 'CreditCard' }
  const PayIcon = Icons[payment.icon] || Icons.CreditCard

  const firstItem = order.items?.[0]
  const productLabel = firstItem
    ? firstItem.product_name + (order.items_count > 1 ? ` +${order.items_count - 1}` : '')
    : '—'
  const shortId = '#' + String(order.id).slice(0, 8).toUpperCase()

  return (
    <div className="gs-row" style={{ display: 'grid', gridTemplateColumns: cols, padding: '14px 22px', alignItems: 'center', borderBottom: isLast ? 'none' : '1px solid #F5F3EE', gap: 16 }}>
      <div>
        <div style={{ fontSize: 13, color: '#0F1419', fontWeight: 600 }}>{shortId}</div>
        <div style={{ fontSize: 10.5, color: '#9AA3AE', marginTop: 2 }}>{fmtDate(order.created_at)}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F5F3EE', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {order.primary_image
            ? <img src={order.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Icons.Package size={16} color="#B8BCC4" strokeWidth={1.8} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0F1419', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {order.buyer_name || 'Client'}
          </div>
          <div style={{ fontSize: 11, color: '#9AA3AE', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {productLabel}
          </div>
        </div>
      </div>

      <div>
        <div className="gs-num" style={{ fontSize: 15, color: '#0F1419' }}>
          {fmtTND(order.subtotal_tnd)}
          <span style={{ fontSize: 10.5, color: '#9AA3AE', marginLeft: 3, fontWeight: 500 }}>TND</span>
        </div>
        <div style={{ fontSize: 10.5, color: '#9AA3AE', marginTop: 2 }}>{order.items_count} article{order.items_count > 1 ? 's' : ''}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <PayIcon size={14} color="#6B7280" strokeWidth={2} />
        <span style={{ fontSize: 12, color: '#0F1419', fontWeight: 500 }}>{payment.label}</span>
      </div>

      <div>
        <span style={{ background: status.bg, color: status.color, padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block' }}>
          {status.label}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
        <button className="gs-icon-btn" title="Message"><Icons.MessageCircle size={14} strokeWidth={1.8} /></button>
        <StatusMenu current={order.status} onPick={(st) => onChangeStatus(order.id, st)} />
      </div>
    </div>
  )
}

// Menu de changement de statut (kebab)
function StatusMenu({ current, onPick }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="gs-icon-btn" title="Changer le statut" onClick={() => setOpen((o) => !o)}>
        <Icons.MoreHorizontal size={14} strokeWidth={1.8} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: '#fff', border: '1px solid #ECEEF2', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.12)', minWidth: 172, padding: 6, zIndex: 100 }}>
          <div style={{ fontSize: 10, color: '#9AA3AE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, padding: '4px 12px 6px' }}>Changer le statut</div>
          {STATUS_ORDER.map((st) => (
            <button key={st} className="gs-menu-item"
              onClick={() => { setOpen(false); if (st !== current) onPick(st) }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: st === current ? 700 : 500, color: st === current ? STATUS_STYLES[st].color : '#3D4853' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_STYLES[st].color, flexShrink: 0 }} />
              {STATUS_STYLES[st].label}
              {st === current && <Icons.Check size={13} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

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

function LoadingRows({ cols }) {
  return (
    <div>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: cols, padding: '14px 22px', alignItems: 'center', borderBottom: '1px solid #F5F3EE', gap: 16 }}>
          <div><div style={{ height: 12, width: 70, background: '#F1EFE9', borderRadius: 4, marginBottom: 6 }} /><div style={{ height: 8, width: 100, background: '#F5F3EE', borderRadius: 4 }} /></div>
          <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}><div style={{ width: 38, height: 38, borderRadius: 10, background: '#F1EFE9' }} /><div style={{ flex: 1 }}><div style={{ height: 12, width: '60%', background: '#F1EFE9', borderRadius: 4, marginBottom: 6 }} /><div style={{ height: 8, width: '40%', background: '#F5F3EE', borderRadius: 4 }} /></div></div>
          <div style={{ height: 14, width: 60, background: '#F1EFE9', borderRadius: 4 }} />
          <div style={{ height: 14, width: 80, background: '#F1EFE9', borderRadius: 4 }} />
          <div style={{ height: 20, width: 70, background: '#F1EFE9', borderRadius: 999 }} />
          <div />
        </div>
      ))}
    </div>
  )
}

function StateBox({ icon, title, sub }) {
  const Icon = Icons[icon] || Icons.Package
  return (
    <div style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: '#9AA3AE' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#FFF3EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={26} color="#FF4500" strokeWidth={1.8} />
      </div>
      <div className="gs-h1" style={{ fontSize: 18, color: '#0F1419' }}>{title}</div>
      <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 340 }}>{sub}</div>
    </div>
  )
}