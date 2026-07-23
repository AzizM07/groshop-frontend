// src/components/supplier/MobileSupplierOrders.jsx — GROSHOP.tn
// Version téléphone de la page Commandes. Le tableau desktop à 6 colonnes
// devient une pile de cartes ; le changement de statut passe par une
// feuille modale au lieu d'un menu déroulant.
// La topbar et la nav basse vivent dans SupplierDashboardLayout.

import { useState, useEffect, useMemo } from 'react'
import * as Icons from 'lucide-react'
import { orders as ordersApi } from '../../lib/api'

/* Seule teinte orange du projet. */
const ORANGE      = '#ff5e20'
const ORANGE_TINT = 'rgba(255, 94, 32, .12)'

const INK='#0F1419', MUTE='#6B7280', FAINT='#9AA3AE'
const FONT='"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const STATUS_STYLES = {
  pending:       { label: 'En attente',    bg: '#FEF3C7', color: '#D97706' },
  confirmed:     { label: 'Confirmée',     bg: '#ECFDF5', color: '#059669' },
  in_production: { label: 'En production', bg: '#EFF6FF', color: '#3B82F6' },
  shipped:       { label: 'Expédiée',      bg: '#EDE9FE', color: '#8B5CF6' },
  delivered:     { label: 'Livrée',        bg: '#ECFDF5', color: '#059669' },
  cancelled:     { label: 'Annulée',       bg: '#F5F3EE', color: MUTE },
}
const STATUS_ORDER = ['pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled']

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
  { key: 'in_production', label: 'Production' },
  { key: 'shipped',       label: 'Expédiées' },
  { key: 'delivered',     label: 'Livrées' },
  { key: 'cancelled',     label: 'Annulées' },
]

const PAGE_SIZE = 12
const fmtTND = (v) => Number(v || 0).toLocaleString('fr-FR', { maximumFractionDigits: 3 })
const fmtK   = (v) => {
  const n = Number(v || 0)
  return n >= 1000 ? `${(n / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}k` : n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
}
function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 3600)  return `${Math.max(1, Math.round(diff / 60))} min`
  if (diff < 86400) return `${Math.round(diff / 3600)} h`
  const d = Math.round(diff / 86400)
  return d < 30 ? `${d} j` : new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ═══════════════════════════════════════════════════════════════════
export default function MobileSupplierOrders() {
  const [all, setAll]         = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [tab, setTab]         = useState('all')
  const [search, setSearch]   = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [sheet, setSheet]     = useState(null)   // commande dont on change le statut

  useEffect(() => {
    let alive = true
    setLoading(true)
    ordersApi.supplier()
      .then((d) => { if (alive) setAll(Array.isArray(d) ? d : (d?.results || [])) })
      .catch((e) => { if (alive) setError(e.message || 'Erreur de chargement') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  useEffect(() => { setVisible(PAGE_SIZE) }, [tab, search])

  const counts = useMemo(() => {
    const c = { all: all.length }
    all.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1 })
    return c
  }, [all])

  const filtered = useMemo(() => all.filter((o) => {
    if (tab !== 'all' && o.status !== tab) return false
    if (search) {
      const q = search.toLowerCase()
      const prod = o.items?.[0]?.product_name || ''
      if (!(o.buyer_name || '').toLowerCase().includes(q) &&
          !prod.toLowerCase().includes(q) &&
          !String(o.id).toLowerCase().includes(q)) return false
    }
    return true
  }), [all, tab, search])

  const rows = filtered.slice(0, visible)

  const stats = useMemo(() => {
    const ca = all.reduce((s, o) => s + Number(o.subtotal_tnd || 0), 0)
    return [
      { label: 'Commandes',  value: String(all.length),               sub: 'reçues' },
      { label: 'CA total',   value: fmtK(ca),                         sub: 'TND' },
      { label: 'En attente', value: String(counts.pending || 0),      sub: 'à traiter' },
      { label: 'Expédiées',  value: String(counts.shipped || 0),      sub: 'en route' },
    ]
  }, [all, counts])

  async function changeStatus(id, newStatus) {
    setSheet(null)
    setAll((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
    try {
      await ordersApi.updateSubOrderStatus(id, newStatus)
    } catch (e) {
      alert('Erreur : ' + e.message)
      ordersApi.supplier().then((d) => setAll(Array.isArray(d) ? d : (d?.results || []))).catch(() => {})
    }
  }

  return (
    <div style={{ fontFamily: FONT }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
        Commandes
      </h1>
      <p style={{ margin: '0 0 16px', fontSize: 12.5, color: MUTE }}>
        {all.length} commande{all.length > 1 ? 's' : ''} · suivi en temps réel.
      </p>

      {/* KPI 2×2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {stats.map((s, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ fontSize: 11, color: MUTE, fontWeight: 500 }}>{s.label}</div>
            {loading ? <div style={{ marginTop: 8 }}><Skel h={20} w="55%" /></div> : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: INK, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 10, color: FAINT, fontWeight: 500 }}>{s.sub}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recherche */}
      <div style={searchStyle}>
        <Icons.Search size={14} color={FAINT} strokeWidth={2} />
        <input type="text" placeholder="Client, produit, n°…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, width: '100%', color: INK }} />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', cursor: 'pointer' }}><Icons.X size={14} color={FAINT} /></button>}
      </div>

      {/* Filtres — rangée défilante */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 12, scrollbarWidth: 'none' }}>
        {TABS_DEF.map((t) => {
          const on = t.key === tab
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: on ? ORANGE_TINT : '#fff',
                color: on ? ORANGE : FAINT,
                fontWeight: on ? 700 : 500, fontSize: 11.5,
                padding: '7px 13px', borderRadius: 20,
                boxShadow: on ? 'none' : 'inset 0 0 0 1px #EFECE4',
              }}>
              {t.label}
              <span style={{ fontSize: 10, fontWeight: 700, opacity: on ? 1 : 0.7 }}>{counts[t.key] || 0}</span>
            </button>
          )
        })}
      </div>

      {/* Liste */}
      {loading ? (
        [...Array(5)].map((_, i) => (
          <div key={i} style={{ ...cardStyle, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Skel h={38} w={38} style={{ borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}><Skel h={11} w="55%" /><div style={{ height: 5 }} /><Skel h={9} w="35%" /></div>
            </div>
          </div>
        ))
      ) : error ? (
        <StateBox icon="AlertTriangle" title="Erreur de chargement" sub={error} />
      ) : rows.length === 0 ? (
        all.length === 0
          ? <StateBox icon="PackageSearch" title="Aucune commande" sub="Tes commandes clients apparaîtront ici." />
          : <StateBox icon="PackageSearch" title="Aucun résultat" sub="Essaie d'autres filtres." />
      ) : (
        <>
          {rows.map((o) => <OrderCard key={o.id} order={o} onEdit={() => setSheet(o)} />)}

          {visible < filtered.length && (
            <button onClick={() => setVisible(v => v + PAGE_SIZE)}
              style={{
                width: '100%', padding: '12px', marginTop: 4,
                background: '#fff', border: '1px solid #EFECE4', borderRadius: 14,
                fontSize: 12.5, fontWeight: 600, color: INK, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              Charger plus ({filtered.length - visible} restantes)
            </button>
          )}
        </>
      )}

      {/* Feuille de changement de statut */}
      {sheet && (
        <StatusSheet order={sheet} onClose={() => setSheet(null)} onPick={(st) => changeStatus(sheet.id, st)} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function OrderCard({ order, onEdit }) {
  const status  = STATUS_STYLES[order.status] || STATUS_STYLES.pending
  const payment = PAYMENT_STYLES[order.payment_method] || { label: order.payment_method || '—', icon: 'CreditCard' }
  const PayIcon = Icons[payment.icon] || Icons.CreditCard
  const first   = order.items?.[0]
  const label   = first ? first.product_name + (order.items_count > 1 ? ` +${order.items_count - 1}` : '') : '—'
  const shortId = '#' + String(order.id).slice(0, 8).toUpperCase()

  return (
    <div style={{ ...cardStyle, marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: ORANGE_TINT,
          flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {order.primary_image
            ? <img src={order.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Icons.Package size={16} color={ORANGE} strokeWidth={1.8} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {order.buyer_name || 'Client'}
          </div>
          <div style={{ fontSize: 10.5, color: FAINT, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {shortId} · {timeAgo(order.created_at)}
          </div>
        </div>

        <button onClick={onEdit} aria-label="Changer le statut"
          style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', display: 'flex', color: FAINT, flexShrink: 0 }}>
          <Icons.MoreVertical size={16} strokeWidth={2} />
        </button>
      </div>

      <div style={{ fontSize: 11, color: MUTE, marginTop: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label} · {order.items_count} article{order.items_count > 1 ? 's' : ''}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 9, borderTop: '1px solid #F5F3EE' }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: INK, fontVariantNumeric: 'tabular-nums' }}>
          {fmtTND(order.subtotal_tnd)} <span style={{ fontSize: 9.5, color: FAINT, fontWeight: 500 }}>TND</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: FAINT }}>
          <PayIcon size={11} strokeWidth={2} /> {payment.label}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{
          background: status.bg, color: status.color,
          padding: '3px 9px', borderRadius: 999,
          fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
        }}>
          {status.label}
        </span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Feuille modale : sur téléphone, un menu déroulant ancré sortirait
// de l'écran. Une feuille qui monte du bas est la convention native.
// ═══════════════════════════════════════════════════════════════════
function StatusSheet({ order, onClose, onPick }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(15,20,25,.45)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: '#fff',
        borderRadius: '20px 20px 0 0',
        padding: '8px 0 calc(14px + env(safe-area-inset-bottom))',
        fontFamily: FONT,
        maxHeight: '80dvh', overflowY: 'auto',
      }}>
        <div style={{ width: 38, height: 4, borderRadius: 3, background: '#E0DDD5', margin: '6px auto 14px' }} />

        <div style={{ padding: '0 18px 12px' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: INK }}>Changer le statut</div>
          <div style={{ fontSize: 11.5, color: FAINT, marginTop: 3 }}>
            {order.buyer_name || 'Client'} · #{String(order.id).slice(0, 8).toUpperCase()}
          </div>
        </div>

        {STATUS_ORDER.map((st) => {
          const s = STATUS_STYLES[st]
          const on = st === order.status
          return (
            <button key={st} onClick={() => { if (!on) onPick(st); else onClose() }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                padding: '14px 18px', background: on ? '#FAFAF7' : 'none',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: on ? 700 : 500, color: on ? s.color : '#3D4853' }}>
                {s.label}
              </span>
              {on && <Icons.Check size={16} color={s.color} strokeWidth={2.4} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
const cardStyle = {
  background: '#fff', borderRadius: 16, padding: 13,
  border: '1px solid #EFECE4',
}
const searchStyle = {
  background: '#fff', border: '1px solid #EFECE4', borderRadius: 20,
  padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8,
  marginBottom: 12,
}

function Skel({ h = 14, w = '100%', style }) {
  return <div style={{ height: h, width: w, background: '#EFECE4', borderRadius: 6, animation: 'gs-pulse 1.4s infinite', ...style }} />
}

function StateBox({ icon, title, sub }) {
  const Icon = Icons[icon] || Icons.Package
  return (
    <div style={{ padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: FAINT }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: ORANGE_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={23} color={ORANGE} strokeWidth={1.8} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{title}</div>
      <div style={{ fontSize: 12.5, textAlign: 'center', maxWidth: 260 }}>{sub}</div>
    </div>
  )
}