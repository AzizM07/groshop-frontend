// pages/CommandesPage.jsx — GROSHOP.tn
// Liste des commandes acheteur. Chaque carte : entête (n° + date + statut + Détails),
// article(s), politique de retour, puis "Suivi d'expédition" repliable (tous statuts sauf annulée).
// Polling 30 s + rafraîchissement manuel.
// Statuts backend : pending, confirmed, in_production, shipped, delivered, cancelled.
// ⭐ Détails → /commande/:id/confirmation
// ⭐ Bouton Annuler : bordure + texte rouge vif, fond blanc

import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MessageSquare, ChevronRight, ChevronDown, Package, Copy, Check,
  Truck, CheckCircle2, RefreshCw, Printer,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { orders as ordersApi, messaging } from '../lib/api'

/* ═══════════════════════ CONSTANTES ═══════════════════════ */
const BLUE       = '#1F8EFF'
const BLUE_SOFT  = '#EAF4FF'
const GREEN      = '#00ce4c'
const GREEN_SOFT = '#DCFCE7'
const RED        = '#EF4444'
const RED_DARK   = '#DC2626'
const INK        = '#0F1419'
const MUTE       = '#6B7785'
const FAINT      = '#9AA3AE'
const LINE       = '#E5E7EB'
const BG         = '#F9FAFB'
const FONT       = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const RETURN_WINDOW_DAYS = 7

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  in_production: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}
const STATUS_PILL = {
  pending:       { bg: '#1F8EFF', fg: '#ffffff' },
  confirmed:     { bg: '#1F8EFF', fg: '#ffffff' },
  in_production: { bg: '#1F8EFF', fg: '#ffffff'},
  shipped:       { bg: '#1F8EFF', fg: '#ffffff' },
  delivered:     { bg: '#1F8EFF', fg: '#ffffff' },
  cancelled:     { bg: '#1F8EFF', fg: '#ffffff' },
}

const DELIVERY_LABELS = {
  standard: 'Livraison standard',
  express:  'Livraison express',
  premium:  'Livraison premium',
}

const TABS = [
  { id: 'all',           label: 'Toutes les commandes' },
  { id: 'pending',       label: 'En attente' },
  { id: 'in_production', label: 'En préparation' },
  { id: 'shipped',       label: 'Expédiées' },
  { id: 'delivered',     label: 'Livrées' },
]

const TRACK_STEPS = [
  { key: 'pending',       label: 'Commandée' },
  { key: 'confirmed',     label: 'Confirmée' },
  { key: 'in_production', label: 'Préparée' },
  { key: 'shipped',       label: 'Expédiée' },
  { key: 'delivered',     label: 'Livrée' },
]
const trackIndex = (status) => {
  const i = TRACK_STEPS.findIndex(s => s.key === status)
  return i === -1 ? 0 : i
}
const TRACK_DATE_FIELDS = {
  pending:       'created_at',
  confirmed:     'confirmed_at',
  in_production: 'production_at',
  shipped:       'shipped_at',
  delivered:     'delivered_at',
}
const TRACKER_MESSAGES = {
  pending:       { title: 'Commande reçue',           desc: 'Votre commande a été enregistrée. Le fournisseur va la confirmer sous peu.' },
  confirmed:     { title: 'Commande confirmée',       desc: 'Le fournisseur a confirmé votre commande et prépare vos articles.' },
  in_production: { title: 'Commande en préparation',  desc: 'Vos articles sont en cours de préparation avant expédition.' },
  shipped:       { title: 'Colis en transit',         desc: 'Votre colis a quitté l\'entrepôt et est en route vers votre adresse de livraison.' },
  delivered:     { title: 'Colis livré avec succès',  desc: 'Votre commande a été livrée. Nous espérons qu\'elle vous donne entière satisfaction.' },
}

/* ═══════════════════════ HELPERS ═══════════════════════ */
const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return isNaN(date) ? '' : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
const fmtDateShort = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return isNaN(date) ? '' : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
const fmtTime = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return isNaN(date) ? '' : date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
const addDays = (d, n) => {
  const date = new Date(d)
  if (isNaN(date)) return null
  date.setDate(date.getDate() + n)
  return date
}
const normalize = (d) => Array.isArray(d) ? d : (d?.results || d?.orders || [])
const shortRef = (o) => o.reference ? String(o.reference).toUpperCase() : String(o.id).slice(0, 8).toUpperCase()

const groupsOf = (o) => {
  if (Array.isArray(o.sub_orders) && o.sub_orders.length) {
    return o.sub_orders.map(s => ({
      supplier: { name: s.supplier_name, slug: s.supplier_slug },
      deliveryType: s.delivery_type || 'standard',
      items: s.items || [],
    }))
  }
  return [{ supplier: o.supplier || { name: o.supplier_name || 'Fournisseur' }, deliveryType: 'standard', items: o.items || [] }]
}
const hasItems = (o) => groupsOf(o).some(g => g.items && g.items.length)

/* ═══════════════════════ CSS (animations) ═══════════════════════ */
const CSS = `
@keyframes cmd-spin { to { transform: rotate(360deg); } }
@keyframes cmd-slide { from { opacity: 0; max-height: 0 } to { opacity: 1; max-height: 800px } }
@keyframes cmd-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(31,142,255,.35) } 50% { box-shadow: 0 0 0 6px rgba(31,142,255,0) } }
.cmd-spin { animation: cmd-spin .8s linear infinite; }
.cmd-slide { animation: cmd-slide .35s ease-out both; overflow: hidden; }
.cmd-pulse { animation: cmd-pulse 2s ease-in-out infinite; }
.cmd-btn-outline:hover { background: #F9FAFB }
.cmd-btn-primary:hover { filter: brightness(.94) }
.cmd-btn-danger:hover  { background: #FEF2F2 !important; border-color: ${RED_DARK} !important; color: ${RED_DARK} !important }
`

/* ═══════════════════════ PILL ═══════════════════════ */
function Pill({ fg, bg, children, size = 'md' }) {
  const pad = size === 'sm' ? '3px 10px' : '6px 14px'
  const fs  = size === 'sm' ? 11.5 : 12.5
  return (
    <span style={{
      display: 'inline-block', fontSize: fs, fontWeight: 700, color: fg, background: bg,
      borderRadius: 999, padding: pad, lineHeight: 1.2, whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

/* ═══════════════════════ TRACKER (dépliable) ═══════════════════════ */
function ShipmentTracker({ order }) {
  const idx = trackIndex(order.status)
  const msg = TRACKER_MESSAGES[order.status] || TRACKER_MESSAGES.pending
  const pill = STATUS_PILL[order.status] || STATUS_PILL.pending

  return (
    <div className="cmd-slide" style={{
      background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14,
      padding: '22px 22px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
    }}>
      {/* Ligne titre + statut */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: INK }}>Suivi d'expédition</span>
        <Pill fg={pill.fg} bg={pill.bg}>{STATUS_LABELS[order.status] || order.status}</Pill>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 24 }}>
        {TRACK_STEPS.map((s, i) => {
          const done    = i < idx
          const current = i === idx
          const dateVal = order[TRACK_DATE_FIELDS[s.key]]
          const dateStr = dateVal ? `${fmtDateShort(dateVal)}, ${fmtTime(dateVal)}` : (current ? 'En cours' : '—')

          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'flex-start', flex: i < TRACK_STEPS.length - 1 ? 1 : '0 0 auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 72 }}>
                <span
                  className={current ? 'cmd-pulse' : ''}
                  style={{
                    width: 30, height: 30, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? BLUE : '#fff',
                    border: `2.5px solid ${(done || current) ? BLUE : '#E5E9EF'}`,
                    transition: 'all .3s ease',
                  }}
                >
                  {done && <Check size={15} color="#fff" strokeWidth={3} />}
                  {current && <span style={{ width: 9, height: 9, borderRadius: '50%', background: BLUE }} />}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: (done || current) ? INK : FAINT, textAlign: 'center', whiteSpace: 'nowrap' }}>{s.label}</span>
                <span style={{ fontSize: 10.5, color: FAINT, textAlign: 'center', whiteSpace: 'nowrap' }}>{dateStr}</span>
              </div>
              {i < TRACK_STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i < idx ? BLUE : '#E5E9EF',
                  margin: '13px 4px 34px',
                  transition: 'background .4s ease',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Bloc statut */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: BG, borderRadius: 10, padding: 14 }}>
        <span style={{
          width: 32, height: 32, borderRadius: 9, background: BLUE_SOFT,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {order.status === 'delivered' ? <CheckCircle2 size={17} color={BLUE} /> : <Truck size={17} color={BLUE} />}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{msg.title}</div>
          <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.6, marginTop: 3 }}>{msg.desc}</div>
          {(order.carrier_name || order.tracking_number) && (
            <div style={{ fontSize: 12, color: MUTE, marginTop: 10 }}>
              {order.carrier_name && <>Transporteur : <strong style={{ color: INK }}>{order.carrier_name}</strong></>}
              {order.carrier_name && order.tracking_number && <span style={{ margin: '0 8px', color: '#D3D8DF' }}>|</span>}
              {order.tracking_number && <>Suivi : <strong style={{ color: INK }}>{order.tracking_number}</strong></>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════ LIGNE ARTICLE ═══════════════════════ */
function ProductRow({ item, deliveryType, supplier, onContact }) {
  const deliveryLabel = DELIVERY_LABELS[deliveryType] || 'Livraison standard'
  return (
    <div style={{ display: 'flex', gap: 16, padding: '18px 22px', alignItems: 'flex-start' }}>
      <div style={{
        width: 72, height: 72, borderRadius: 10, background: BG, flexShrink: 0,
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item?.product_image
          ? <img src={item.product_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          : <Package size={22} color={FAINT} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: INK, lineHeight: 1.3 }}>
            {item?.product_id
              ? <Link to={`/produit/${item.product_id}`} style={{ color: INK, textDecoration: 'none' }}>{item?.product_name || 'Article'}</Link>
              : (item?.product_name || 'Article')}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>
            {fmt(item?.total_tnd ?? (Number(item?.unit_price_tnd || 0) * Number(item?.quantity || 1)))} TND
          </div>
        </div>

        <div style={{ fontSize: 12.5, color: MUTE, marginTop: 4 }}>
          {item?.variant && <>{item.variant}<span style={{ margin: '0 8px', color: '#D3D8DF' }}>|</span></>}
          Qté : <strong style={{ color: INK, fontWeight: 600 }}>{item?.quantity || 1}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
          <Pill fg={GREEN} bg={GREEN_SOFT} size="sm">{deliveryLabel}</Pill>
          {supplier?.name && (
            <button onClick={onContact} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none',
              background: 'none', cursor: 'pointer', color: FAINT, fontFamily: FONT, fontSize: 11.5,
            }}>
              <MessageSquare size={12} />
              {supplier?.slug
                ? <Link to={`/fournisseur/${supplier.slug}`} onClick={e => e.stopPropagation()} style={{ color: FAINT, textDecoration: 'none' }}>{supplier.name}</Link>
                : <span>{supplier.name}</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════ PAGE ═══════════════════════ */
export default function CommandesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders]         = useState(null)
  const [tab, setTab]               = useState('all')
  const [copied, setCopied]         = useState(null)
  const [busy, setBusy]             = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [openTracker, setOpenTracker] = useState({})  // { [orderId]: true }
  const intervalRef = useRef(null)

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) setRefreshing(true)
    try {
      const data = await ordersApi.list()
      setOrders(normalize(data))
    } catch (err) {
      console.error('Erreur chargement commandes :', err)
    } finally {
      if (showLoading) setRefreshing(false)
    }
  }, [])

  useEffect(() => { if (user) load(true) }, [user, load])

  useEffect(() => {
    if (!user) return
    intervalRef.current = setInterval(() => load(false), 30000)
    return () => clearInterval(intervalRef.current)
  }, [user, load])

  const filtered = (orders || []).filter(o => {
    if (tab === 'all') return true
    if (tab === 'pending') return o.status === 'pending' || o.status === 'confirmed'
    return o.status === tab
  })

  const copyRef = (ref) => {
    if (!ref) return
    navigator.clipboard?.writeText(String(ref)).then(() => {
      setCopied(ref); setTimeout(() => setCopied(c => c === ref ? null : c), 1500)
    }).catch(() => {})
  }

  const openChat = async (slug) => {
    if (!slug) { navigate('/dashboard/messages'); return }
    try {
      const conv = await messaging.startConversation(slug)
      navigate(conv?.id ? `/dashboard/messages/${conv.id}` : '/dashboard/messages')
    } catch { navigate('/dashboard/messages') }
  }

  const cancelOrder = async (id) => {
    if (!window.confirm('Annuler cette commande ?')) return
    setBusy(id)
    try {
      await ordersApi.cancel(id)
      await load(false)
    } catch (err) {
      alert('Erreur lors de l\'annulation : ' + (err.message || 'Veuillez réessayer'))
    } finally {
      setBusy(null)
    }
  }

  const confirmReception = (id) => navigate(`/commande/${id}/confirmation`)

  /* ⭐ "Détails" mène à la page de confirmation de CETTE commande. */
  const actionsFor = (o) => {
    const detail = () => navigate(`/commande/${o.id}/confirmation`)
    switch (o.status) {
      case 'shipped':
        return [
          { label: 'Détails', onClick: detail },
          { label: 'Confirmer la réception', primary: true, onClick: () => confirmReception(o.id) },
        ]
      case 'delivered':
        return [
          { label: 'Détails', onClick: detail },
          { label: 'Laisser un avis', primary: true, onClick: () => navigate(`/commande/${o.id}/confirmation?avis=1`) },
        ]
      case 'pending':
      case 'confirmed':
      case 'in_production':
        return [
          { label: 'Détails', onClick: detail },
          { label: 'Annuler', danger: true, onClick: () => cancelOrder(o.id) },
        ]
      case 'cancelled':
        return [
          { label: 'Détails', onClick: detail },
          { label: 'Racheter', onClick: detail },
        ]
      default:
        return [{ label: 'Détails', onClick: detail }]
    }
  }

  const toggleTracker = (id) => setOpenTracker(s => ({ ...s, [id]: !s[id] }))

  return (
    <div style={{ padding: '24px clamp(16px, 2vw, 32px) 48px', fontFamily: FONT, color: INK, maxWidth: 1000 }}>
      <style>{CSS}</style>

      {/* ── EN-TÊTE ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 16, marginBottom: 24, flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: INK, letterSpacing: -0.3 }}>Mes commandes</h1>
          <div style={{ fontSize: 13.5, color: MUTE, marginTop: 4 }}>
            Suivez vos expéditions et gérez vos commandes
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => window.print()}
            className="cmd-btn-outline"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 10, border: `1px solid ${LINE}`,
              background: '#fff', fontSize: 13, fontWeight: 600, color: INK,
              cursor: 'pointer', fontFamily: FONT, transition: 'background .15s',
            }}
          >
            <Printer size={14} /> Imprimer
          </button>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="cmd-btn-primary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 10, border: 'none',
              background: BLUE, color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: refreshing ? 'default' : 'pointer', opacity: refreshing ? 0.6 : 1,
              fontFamily: FONT, transition: 'filter .15s',
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'cmd-spin' : ''} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* ── Onglets ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {TABS.map(t => {
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '9px 18px', borderRadius: 30, cursor: 'pointer', fontFamily: FONT,
              border: `1.5px solid ${active ? BLUE : LINE}`,
              background: '#fff',
              fontSize: 13, fontWeight: active ? 700 : 500, color: active ? BLUE : MUTE, whiteSpace: 'nowrap',
              transition: 'all .15s',
            }}>{t.label}</button>
          )
        })}
      </div>

      {orders === null && <OrderSkeleton />}

      {orders !== null && filtered.length === 0 && (
        <div style={{
          background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14,
          padding: '56px 22px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 54, marginBottom: 12 }}>📄</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Aucune commande dans cette catégorie</div>
          <Link to="/" style={{
            display: 'inline-block', padding: '12px 28px', borderRadius: 30,
            border: `1.5px solid ${BLUE}`, color: BLUE, textDecoration: 'none',
            fontSize: 13.5, fontWeight: 700,
          }}>
            Commencez à vous approvisionner
          </Link>
        </div>
      )}

      {orders !== null && filtered.map(o => {
        const ref = shortRef(o)
        const acts = actionsFor(o)
        const canTrack = o.status !== 'cancelled'
        const isOpen = !!openTracker[o.id]
        const returnUntil = o.status === 'delivered'
          ? addDays(o.delivered_at || o.updated_at || o.created_at, RETURN_WINDOW_DAYS) : null
        const pill = STATUS_PILL[o.status] || STATUS_PILL.pending

        return (
          <div key={o.id} style={{ marginBottom: 18 }}>

            {/* ═══ CARTE COMMANDE ═══ */}
            <div style={{
              background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14,
              overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.03)',
            }}>
              {/* En-tête */}
              <div style={{ padding: '20px 22px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16.5, fontWeight: 800, color: INK }}>Commande #{ref}</span>
                    <Pill fg={pill.fg} bg={pill.bg} size="sm">{STATUS_LABELS[o.status] || o.status}</Pill>
                  </div>
                  <div style={{ fontSize: 12.5, color: MUTE }}>
                    Passée le : <span style={{ color: INK, fontWeight: 600 }}>{fmtDate(o.created_at)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: FAINT }}>
                    Réf. {ref}
                    <button onClick={() => copyRef(ref)} style={{
                      marginLeft: 6, border: 'none', background: 'none', cursor: 'pointer',
                      color: copied === ref ? GREEN : BLUE, fontSize: 12, fontFamily: FONT,
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                    }}>
                      {copied === ref ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
                    </button>
                  </span>
                  <Link to={`/commande/${o.id}/confirmation`} style={{
                    marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 2,
                    fontSize: 12.5, fontWeight: 700, color: INK, textDecoration: 'none',
                  }}>
                    Détails <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Articles */}
              {hasItems(o) ? groupsOf(o).map((g, gi) => (
                <div key={gi}>
                  {g.items.map((it, ii) => (
                    <div key={ii} style={{ borderTop: `1px solid ${LINE}` }}>
                      <ProductRow
                        item={it}
                        deliveryType={g.deliveryType}
                        supplier={g.supplier}
                        onContact={() => openChat(g.supplier?.slug)}
                      />
                    </div>
                  ))}
                </div>
              )) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', borderTop: `1px solid ${LINE}` }}>
                  <div style={{ width: 52, height: 52, borderRadius: 10, background: BG, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={20} color={FAINT} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>Commande #{ref}</div>
                    <div style={{ fontSize: 12, color: MUTE, marginTop: 3 }}>{fmtDate(o.created_at)}</div>
                  </div>
                </div>
              )}

              {/* Politique de retour */}
              {returnUntil && (
                <div style={{ padding: '16px 22px', borderTop: `1px solid ${LINE}`, background: BG }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>Politique de retour</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: GREEN, whiteSpace: 'nowrap' }}>
                      Éligible jusqu'au {fmtDate(returnUntil)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: MUTE, lineHeight: 1.6, marginTop: 6 }}>
                    Cet article peut être retourné sous {RETURN_WINDOW_DAYS} jours après livraison. Merci de conserver l'emballage d'origine.
                  </div>
                </div>
              )}

              {/* ─── Pied : actions à GAUCHE, tracker au milieu, Total à DROITE ─── */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 22px', borderTop: `1px solid ${LINE}`, flexWrap: 'wrap',
              }}>
                {/* Actions à gauche */}
                {acts.map((a, ai) => (
                  <button
                    key={ai}
                    onClick={a.onClick}
                    disabled={busy === o.id}
                    className={a.danger ? 'cmd-btn-danger' : ''}
                    style={{
                      padding: '9px 20px', borderRadius: 30,
                      cursor: busy === o.id ? 'default' : 'pointer',
                      fontFamily: FONT, fontSize: 13, fontWeight: 700,
                      border: a.primary
                        ? 'none'
                        : (a.danger ? `1.5px solid ${RED}` : `1.5px solid ${LINE}`),
                      background: a.primary ? BLUE : '#fff',
                      color: a.primary ? '#fff' : (a.danger ? RED : INK),
                      opacity: busy === o.id ? 0.6 : 1,
                      transition: 'all .15s',
                    }}
                  >
                    {a.label}
                  </button>
                ))}

                {/* Toggle tracker au milieu */}
                {canTrack && (
                  <button
                    onClick={() => toggleTracker(o.id)}
                    className="cmd-btn-outline"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '8px 14px', borderRadius: 20, border: `1.5px solid ${LINE}`,
                      background: isOpen ? BLUE_SOFT : '#fff',
                      fontSize: 12.5, fontWeight: 600, color: isOpen ? BLUE : INK,
                      cursor: 'pointer', fontFamily: FONT, transition: 'all .15s',
                    }}
                  >
                    <Truck size={13} />
                    {isOpen ? 'Masquer le suivi' : 'Suivi d\'expédition'}
                    <ChevronDown size={13} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                  </button>
                )}

                <div style={{ flex: 1 }} />

                {/* Total à droite */}
                <div style={{ fontWeight: 800,fontSize: 14 }}>
                  Total : <span style={{ fontWeight: 700, color: BLUE, fontSize: 15 }}>{fmt(o.total_tnd)} TND</span>
                </div>
              </div>
            </div>

            {/* ═══ TRACKER DÉPLIABLE ═══ */}
            {canTrack && isOpen && (
              <div style={{ marginTop: 12 }}>
                <ShipmentTracker order={o} />
              </div>
            )}

          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════ SKELETON ═══════════════════════ */
function OrderSkeleton() {
  return (
    <div>
      {[0, 1].map(i => (
        <div key={i} style={{
          background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14,
          marginBottom: 16, padding: 20,
        }}>
          <div style={{ height: 14, width: '30%', background: BG, borderRadius: 4, marginBottom: 18 }} />
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 10, background: BG, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, width: '55%', background: BG, borderRadius: 4, marginBottom: 10 }} />
              <div style={{ height: 12, width: '25%', background: BG, borderRadius: 4 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}