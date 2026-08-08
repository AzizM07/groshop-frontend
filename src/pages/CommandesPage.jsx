// pages/CommandesPage.jsx — GROSHOP.tn
// Liste des commandes acheteur — version corrigée avec polling et statuts harmonisés.
// Endpoints utilisés :
//   orders.list()            -> liste des commandes
//   orders.cancel(id)        -> annuler
//   messaging.startConversation(slug) -> ouvrir chat
//
// Le statut des commandes est rafraîchi automatiquement toutes les 30 secondes.
// Les clés de statut sont désormais alignées sur le backend (confirmed au lieu de call_confirmed).
// ⭐ CORRIGÉ : shortRef() n'écrase plus le numéro séquentiel de la référence
// (avant : .slice(0,8) coupait "ORD-2026-0001" en "ORD-2026", identique pour
// toutes les commandes de l'année → numéro incohérent avec la page fournisseur).

import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, ChevronRight, Package, Copy, Check, Truck, CheckCircle2, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { orders as ordersApi, messaging } from '../lib/api'

const BLUE       = '#1F8EFF'
const BLUE_SOFT  = '#EAF4FF'
const INK        = '#0F1419'
const MUTE       = '#6B7785'
const FAINT      = '#9AA3AE'
const LINE       = '#E8EAED'
const FONT       = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const RETURN_WINDOW_DAYS = 7

// Clés harmonisées avec le backend (confirmed, shipped, delivered, cancelled, pending, in_production)
const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  in_production: 'En production',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}
const STATUS_TEXT_COLORS = {
  pending: '#92600A',
  confirmed: BLUE,
  in_production: '#5B21B6',
  shipped: BLUE,
  delivered: '#166534',
  cancelled: '#991B1B',
}

const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return isNaN(date) ? '' : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
const fmtDateTime = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return isNaN(date) ? '' : date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
const addDays = (d, n) => {
  const date = new Date(d)
  if (isNaN(date)) return null
  date.setDate(date.getDate() + n)
  return date
}
const normalize = (d) => Array.isArray(d) ? d : (d?.results || d?.orders || [])

// ⭐ CORRIGÉ : on affiche la référence complète (ex: "ORD-2026-0001").
// Le fallback sur o.id (tronqué) ne sert que si reference est absente.
const shortRef = (o) => {
  if (o.reference) return String(o.reference).toUpperCase()
  return String(o.id).slice(0, 8).toUpperCase()
}

const DELIVERY_LABELS = {
  standard: 'Livraison standard',
  express: 'Livraison express',
  premium: 'Livraison premium',
}

const groupsOf = (o) => {
  if (Array.isArray(o.sub_orders) && o.sub_orders.length) {
    return o.sub_orders.map(s => ({
      supplier: { name: s.supplier_name, slug: s.supplier_slug },
      deliveryType: s.delivery_type || null,
      items: s.items || [],
    }))
  }
  return [{ supplier: o.supplier || { name: o.supplier_name || 'Fournisseur' }, deliveryType: null, items: o.items || [] }]
}
const hasItems = (o) => groupsOf(o).some(g => g.items && g.items.length)

const TABS = [
  { id: 'all',           label: 'Toutes les commandes' },
  { id: 'pending',       label: 'En attente' },
  { id: 'in_production', label: 'En production' },
  { id: 'shipped',       label: 'Expédiées' },
  { id: 'delivered',     label: 'Livrées' },
]

// Suivi d'expédition – étapes harmonisées
const TRACK_STEPS = [
  { key: 'pending',        label: 'Commandée' },
  { key: 'confirmed',      label: 'Confirmée' },
  { key: 'in_production',  label: 'Préparée' },
  { key: 'shipped',        label: 'Expédiée' },
  { key: 'delivered',      label: 'Livrée' },
]
const trackIndex = (status) => {
  const i = TRACK_STEPS.findIndex(s => s.key === status)
  return i === -1 ? 0 : i
}
const TRACK_DATE_FIELDS = {
  pending: 'created_at',
  confirmed: 'confirmed_at',
  in_production: 'production_at',
  shipped: 'shipped_at',
  delivered: 'delivered_at',
}

const TRACKER_MESSAGES = {
  pending:        { title: 'Commande reçue',                         desc: 'Votre commande a bien été enregistrée. Le fournisseur va la confirmer sous peu.' },
  confirmed:      { title: 'Commande confirmée',                     desc: 'Le fournisseur a confirmé votre commande et prépare vos articles.' },
  in_production:  { title: 'Commande en préparation',                desc: 'Vos articles sont en cours de préparation avant expédition.' },
  shipped:        { title: 'Colis en transit',                       desc: 'Votre colis a quitté l’entrepôt et est en route vers votre adresse de livraison.' },
  delivered:      { title: 'Colis livré avec succès',                desc: 'Votre commande a été livrée. Nous espérons qu’elle vous donne entière satisfaction.' },
}

function Pill({ fg, bg, bd, children }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 12, fontWeight: 700, color: fg, background: bg,
      border: bd ? `1.5px solid ${bd}` : 'none', borderRadius: 999, padding: '5px 14px', lineHeight: 1.2, whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

function ShipmentTracker({ order }) {
  const idx = trackIndex(order.status)
  const msg = TRACKER_MESSAGES[order.status] || TRACKER_MESSAGES.pending

  return (
    <div style={{ margin: '0 22px 20px', border: `1px solid ${LINE}`, background: '#fff', borderRadius: 16, padding: '22px 22px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
        <span style={{ fontSize: 17, fontWeight: 800, color: INK }}>Suivi de l'expédition</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: BLUE, background: BLUE_SOFT, borderRadius: 999, padding: '6px 16px' }}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 24 }}>
        {TRACK_STEPS.map((s, i) => {
          const done = i < idx
          const current = i === idx
          const dateVal = order[TRACK_DATE_FIELDS[s.key]]
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < TRACK_STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 68 }}>
                <span style={{
                  width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? BLUE : '#fff',
                  border: `2.5px solid ${(done || current) ? BLUE : '#D9DEE5'}`,
                }}>
                  {done && <Check size={16} color="#fff" strokeWidth={3} />}
                  {current && <span style={{ width: 10, height: 10, borderRadius: '50%', background: BLUE }} />}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: INK, textAlign: 'center', whiteSpace: 'nowrap' }}>{s.label}</span>
                <span style={{ fontSize: 11, color: FAINT, textAlign: 'center', whiteSpace: 'nowrap' }}>{dateVal ? fmtDateTime(dateVal) : '—'}</span>
              </div>
              {i < TRACK_STEPS.length - 1 && (
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: i < idx ? BLUE : '#E5E9EF', margin: '0 4px 34px' }} />
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#F4F5F7', borderRadius: 12, padding: 16 }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: BLUE_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {order.status === 'delivered' ? <CheckCircle2 size={17} color={BLUE} /> : <Truck size={17} color={BLUE} />}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{msg.title}</div>
          <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.6, marginTop: 4 }}>{msg.desc}</div>
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

function ProductRow({ item, deliveryType, supplier, onContact }) {
  const deliveryLabel = DELIVERY_LABELS[deliveryType] || 'Livraison standard'
  return (
    <div style={{ display: 'flex', gap: 16, padding: '18px 22px', alignItems: 'flex-start' }}>
      <div style={{ width: 56, height: 56, borderRadius: 10, background: '#F4F5F7', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item?.product_image ? <img src={item.product_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <Package size={20} color={FAINT} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: INK, lineHeight: 1.3 }}>
            {item?.product_id
              ? <Link to={`/produit/${item.product_id}`} style={{ color: INK, textDecoration: 'none' }}>{item?.product_name || 'Article'}</Link>
              : (item?.product_name || 'Article')}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>
            {fmt(item?.total_tnd ?? (Number(item?.unit_price_tnd || 0) * Number(item?.quantity || 1)))} TND
          </div>
        </div>

        <div style={{ fontSize: 13, color: MUTE, marginTop: 4 }}>
          {item?.variant ? <>{item.variant}&nbsp;&nbsp;|&nbsp;&nbsp;</> : null}
          Qté : {item?.quantity || 1}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 9, flexWrap: 'wrap' }}>
          <Pill fg="#166534" bg="#DCFCE7">{deliveryLabel}</Pill>
          {supplier?.name && (
            <button onClick={onContact} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', color: FAINT, fontFamily: FONT, fontSize: 11.5 }}>
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

// ─── Composant principal ──────────────────────────────────────────
export default function CommandesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState(null)
  const [tab, setTab]       = useState('all')
  const [copied, setCopied] = useState(null)
  const [busy, setBusy]     = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef(null)

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) setRefreshing(true)
    try {
      const data = await ordersApi.list()
      setOrders(normalize(data))
    } catch (err) {
      console.error('Erreur chargement commandes :', err)
      // Optionnel : afficher une notification
    } finally {
      if (showLoading) setRefreshing(false)
    }
  }, [])

  // Chargement initial
  useEffect(() => {
    if (user) load(true)
  }, [user, load])

  // Polling toutes les 30 secondes
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
      await load(false) // rechargement après annulation
    } catch (err) {
      alert('Erreur lors de l’annulation : ' + (err.message || 'Veuillez réessayer'))
    } finally {
      setBusy(null)
    }
  }

  // Placeholder pour "Confirmer la réception" (endpoint à créer côté backend)
  const confirmReception = (id) => {
    // À remplacer par un appel API réel quand il existera
    // Exemple : ordersApi.confirmReception(id).then(() => load(false))
    navigate(`/dashboard/commandes/${id}`)
  }

  const actionsFor = (o) => {
    const detail = () => navigate(`/dashboard/commandes/${o.id}`)
    switch (o.status) {
      case 'shipped':
        return [
          { label: 'Confirmer la réception', primary: true, onClick: () => confirmReception(o.id) },
          { label: 'Suivi du statut', onClick: detail },
        ]
      case 'delivered':
        return [
          { label: 'Laisser un avis', primary: true, onClick: () => navigate(`/dashboard/commandes/${o.id}?avis=1`) },
          { label: 'Racheter', onClick: detail },
        ]
      case 'pending':
      case 'confirmed':
        return [
          { label: 'Suivi du statut', onClick: detail },
          { label: 'Annuler', danger: true, onClick: () => cancelOrder(o.id) },
        ]
      case 'cancelled':
        return [{ label: 'Racheter', onClick: detail }]
      default:
        return [{ label: 'Suivi du statut', onClick: detail }]
    }
  }

  return (
    <div style={{ padding: '20px clamp(16px, 2vw, 32px) 48px', fontFamily: FONT, color: INK, maxWidth: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Commandes</h1>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 30, border: `1px solid ${LINE}`,
            background: '#fff', fontSize: 13, fontWeight: 600, color: INK,
            cursor: refreshing ? 'default' : 'pointer', opacity: refreshing ? 0.6 : 1,
            fontFamily: FONT,
          }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          Rafraîchir
        </button>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {TABS.map(t => {
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '9px 18px', borderRadius: 30, cursor: 'pointer', fontFamily: FONT,
              border: `1.5px solid ${active ? BLUE : LINE}`,
              background: '#fff',
              fontSize: 13, fontWeight: active ? 700 : 500, color: active ? BLUE : MUTE, whiteSpace: 'nowrap',
            }}>{t.label}</button>
          )
        })}
      </div>

      {orders === null && <OrderSkeleton />}

      {orders !== null && filtered.length === 0 && (
        <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, padding: '48px 22px', textAlign: 'center' }}>
          <div style={{ fontSize: 54, marginBottom: 12 }}>📄</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Aucune commande dans cette catégorie</div>
          <Link to="/" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 30, border: `1.5px solid ${BLUE}`, color: BLUE, textDecoration: 'none', fontSize: 13.5, fontWeight: 700 }}>
            Commencez à vous approvisionner
          </Link>
        </div>
      )}

      {orders !== null && filtered.map(o => {
        const ref = shortRef(o)
        const acts = actionsFor(o)
        const showTracker = o.status === 'shipped' || o.status === 'delivered'|| o.status === 'in_production'
        const returnUntil = o.status === 'delivered' ? addDays(o.delivered_at || o.updated_at || o.created_at, RETURN_WINDOW_DAYS) : null

        return (
          <div key={o.id} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, marginBottom: 16, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '20px 22px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 16.5, fontWeight: 800, color: INK }}>Commande #{ref}</span>
                <span style={{ fontSize: 13, color: MUTE }}>Passée le : <span style={{ color: INK, fontWeight: 600 }}>{fmtDate(o.created_at)}</span></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_TEXT_COLORS[o.status] || MUTE }}>
                  {STATUS_LABELS[o.status] || o.status}
                </span>
                <span style={{ fontSize: 12, color: FAINT }}>
                  Réf. {ref}
                  <button onClick={() => copyRef(ref)} style={{
                    marginLeft: 6, border: 'none', background: 'none', cursor: 'pointer',
                    color: copied === ref ? '#0E9F6E' : BLUE, fontSize: 12, fontFamily: FONT,
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                  }}>
                    {copied === ref ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
                  </button>
                </span>
                <Link to={`/dashboard/commandes/${o.id}`} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 12.5, fontWeight: 700, color: INK, textDecoration: 'none' }}>
                  Détails <ChevronRight size={14} />
                </Link>
              </div>
              <div style={{ borderTop: `1px solid ${LINE}`, marginTop: 16 }} />
            </div>

            {/* Articles */}
            {hasItems(o) ? groupsOf(o).map((g, gi) => (
              <div key={gi}>
                {g.items.map((it, ii) => (
                  <div key={ii} style={{ borderTop: (gi === 0 && ii === 0) ? 'none' : `1px solid ${LINE}` }}>
                    <ProductRow item={it} deliveryType={g.deliveryType} supplier={g.supplier} onContact={() => openChat(g.supplier?.slug)} />
                  </div>
                ))}
              </div>
            )) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px' }}>
                <div style={{ width: 52, height: 52, borderRadius: 10, background: '#F4F5F7', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              <div style={{ padding: '4px 22px 4px' }}>
                <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontSize: 13.5, color: MUTE }}>Politique de retour</span>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>Éligible jusqu'au {fmtDate(returnUntil)}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.6, marginTop: 8 }}>
                    Cet article peut être retourné sous {RETURN_WINDOW_DAYS} jours après livraison. Merci de conserver l'emballage d'origine.
                  </div>
                </div>
              </div>
            )}

            {/* Tracker */}
            {showTracker && <div style={{ paddingTop: 18 }}><ShipmentTracker order={o} /></div>}

            {/* Pied : total + actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px', borderTop: `1px solid ${LINE}`, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 14 }}>Total : <span style={{ fontWeight: 800, color: BLUE }}>{fmt(o.total_tnd)} TND</span></div>
              <div style={{ flex: 1 }} />
              {acts.map((a, ai) => (
                <button key={ai} onClick={a.onClick} disabled={busy === o.id} style={{
                  padding: '9px 18px', borderRadius: 30, cursor: busy === o.id ? 'default' : 'pointer', fontFamily: FONT,
                  fontSize: 13, fontWeight: a.primary ? 700 : 500,
                  border: a.primary ? 'none' : `1.5px solid ${a.danger ? '#F0999522' : LINE}`,
                  background: a.primary ? BLUE : '#fff',
                  color: a.primary ? '#fff' : (a.danger ? '#B91C1C' : INK),
                  opacity: busy === o.id ? 0.6 : 1,
                }}>{a.label}</button>
              ))}
            </div>
          </div>
        )
      })}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  )
}

function OrderSkeleton() {
  return (
    <div>
      {[0, 1].map(i => (
        <div key={i} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, marginBottom: 16, padding: 20 }}>
          <div style={{ height: 14, width: '30%', background: '#F4F5F7', borderRadius: 4, marginBottom: 18 }} />
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 10, background: '#F4F5F7', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, width: '55%', background: '#F4F5F7', borderRadius: 4, marginBottom: 10 }} />
              <div style={{ height: 12, width: '25%', background: '#F4F5F7', borderRadius: 4 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}