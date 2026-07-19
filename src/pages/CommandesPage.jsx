// pages/CommandesPage.jsx — GROSHOP.tn
// Liste des commandes acheteur (style AliExpress « Mes commandes »).
// Rendu dans DashboardLayout via <Outlet /> → /dashboard/commandes.
//
// Endpoints utilisés (tous réels dans lib/api.js) :
//   orders.list()            -> liste des commandes
//   orders.cancel(id)        -> annuler (statuts pending / call_confirmed)
//   messaging.startConversation(slug) -> ouvrir/obtenir la conversation fournisseur
//
// ⚠️ « Confirmer la réception » : AUCUN endpoint acheteur n'existe encore.
//    En attendant, le bouton ouvre le détail. Crée p.ex.
//    orders.confirmReception = (id) => request(`/orders/${id}/confirm/`, { method:'POST' })
//    puis remplace le fallback ci-dessous.

import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, ChevronRight, Package, Copy, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { orders as ordersApi, messaging } from '../lib/api'

const ORANGE = '#FF4500'
const INK    = '#0F1419'
const MUTE   = '#6B7785'
const FAINT  = '#9AA3AE'
const LINE   = '#E8EAED'
const FONT   = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const STATUS_LABELS = {
  pending: 'En attente', call_confirmed: 'Confirmée', in_production: 'En production',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
}
const STATUS_COLORS = {
  pending:        { fg: '#92600A', bg: '#FEF3C7' },
  call_confirmed: { fg: '#1E40AF', bg: '#DBEAFE' },
  in_production:  { fg: '#5B21B6', bg: '#EDE9FE' },
  shipped:        { fg: '#155E75', bg: '#CFFAFE' },
  delivered:      { fg: '#166534', bg: '#DCFCE7' },
  cancelled:      { fg: '#991B1B', bg: '#FEE2E2' },
}

const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return isNaN(date) ? '' : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
const normalize = (d) => Array.isArray(d) ? d : (d?.results || d?.orders || [])

// Groupes { supplier, items } quelle que soit la forme reçue
const groupsOf = (o) => {
  if (Array.isArray(o.sub_orders) && o.sub_orders.length) {
    return o.sub_orders.map(s => ({ supplier: s.supplier || { name: s.supplier_name }, items: s.items || [] }))
  }
  return [{ supplier: o.supplier || { name: o.supplier_name || 'Fournisseur' }, items: o.items || [] }]
}
const hasItems = (o) => groupsOf(o).some(g => g.items && g.items.length)

const TABS = [
  { id: 'all',           label: 'Toutes les commandes' },
  { id: 'pending',       label: 'En attente' },
  { id: 'in_production', label: 'En production' },
  { id: 'shipped',       label: 'Expédiées' },
  { id: 'delivered',     label: 'Livrées' },
]

// ═══════════════════════════════════════════════════════════════════
export default function CommandesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState(null)
  const [tab, setTab]       = useState('all')
  const [copied, setCopied] = useState(null)
  const [busy, setBusy]     = useState(null)

  const load = useCallback(() => {
    ordersApi.list().then(d => setOrders(normalize(d))).catch(() => setOrders([]))
  }, [])
  useEffect(() => { if (user) load() }, [user, load])

  const filtered = (orders || []).filter(o => {
    if (tab === 'all') return true
    if (tab === 'pending') return o.status === 'pending' || o.status === 'call_confirmed'
    return o.status === tab
  })

  const copyRef = (ref) => {
    if (!ref) return
    navigator.clipboard?.writeText(String(ref)).then(() => {
      setCopied(ref); setTimeout(() => setCopied(c => c === ref ? null : c), 1500)
    }).catch(() => {})
  }

  // Ouvre la conversation du fournisseur (endpoint réel)
  const openChat = async (slug) => {
    if (!slug) { navigate('/dashboard/messages'); return }
    try {
      const conv = await messaging.startConversation(slug)
      navigate(conv?.id ? `/dashboard/messages/${conv.id}` : '/dashboard/messages')
    } catch { navigate('/dashboard/messages') }
  }

  // Annulation (endpoint réel)
  const cancelOrder = async (id) => {
    if (!window.confirm('Annuler cette commande ?')) return
    setBusy(id)
    try { await ordersApi.cancel(id); load() } catch {} finally { setBusy(null) }
  }

  // ⚠️ pas d'endpoint « confirmer réception » → on ouvre le détail en attendant
  const confirmReception = (id) => navigate(`/dashboard/commandes/${id}`)

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
      case 'call_confirmed':
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
      <h1 style={{ margin: '0 0 18px', fontSize: 24, fontWeight: 800 }}>Commandes</h1>

      {/* Onglets de statut */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 18px', borderRadius: 30, cursor: 'pointer', fontFamily: FONT,
            border: `1px solid ${tab === t.id ? INK : LINE}`, background: '#fff',
            fontSize: 13, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? INK : MUTE, whiteSpace: 'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      {orders === null && <OrderSkeleton />}

      {orders !== null && filtered.length === 0 && (
        <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, padding: '48px 22px', textAlign: 'center' }}>
          <div style={{ fontSize: 54, marginBottom: 12 }}>📄</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Aucune commande dans cette catégorie</div>
          <Link to="/" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 30, border: `1px solid ${INK}`, color: INK, textDecoration: 'none', fontSize: 13.5, fontWeight: 700 }}>
            Commencez à vous approvisionner
          </Link>
        </div>
      )}

      {orders !== null && filtered.map(o => {
        const sc = STATUS_COLORS[o.status] || { fg: MUTE, bg: '#F4F5F7' }
        const ref = o.reference || o.id
        const nSub = o.sub_orders_count || groupsOf(o).length
        const acts = actionsFor(o)

        return (
          <div key={o.id} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>

            {/* En-tête */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: `1px solid ${LINE}`, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: sc.fg, background: sc.bg }}>
                {STATUS_LABELS[o.status] || o.status}
              </span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 12.5, color: MUTE }}>{fmtDate(o.created_at)}</span>
              <span style={{ fontSize: 12.5, color: MUTE }}>
                Réf. {String(ref).slice(0, 16)}
                <button onClick={() => copyRef(ref)} style={{
                  marginLeft: 6, border: 'none', background: 'none', cursor: 'pointer',
                  color: copied === ref ? '#0E9F6E' : '#185FA5', fontSize: 12.5, fontFamily: FONT,
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                }}>
                  {copied === ref ? <><Check size={13} /> Copié</> : <><Copy size={13} /> Copier</>}
                </button>
              </span>
              <Link to={`/dashboard/commandes/${o.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 13, fontWeight: 600, color: INK, textDecoration: 'none' }}>
                Détails <ChevronRight size={15} />
              </Link>
            </div>

            {/* Corps : articles si dispo, sinon résumé */}
            {hasItems(o) ? groupsOf(o).map((g, gi) => (
              <div key={gi}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 20px 4px', fontSize: 14, fontWeight: 700 }}>
                  {g.supplier?.is_choice && (
                    <span style={{ fontSize: 11, fontWeight: 800, color: ORANGE, border: `1px solid ${ORANGE}`, borderRadius: 4, padding: '0 5px' }}>Choice</span>
                  )}
                  {g.supplier?.slug
                    ? <Link to={`/fournisseur/${g.supplier.slug}`} style={{ color: INK, textDecoration: 'none' }}>{g.supplier?.name || 'Fournisseur'}</Link>
                    : <span>{g.supplier?.name || 'Fournisseur'}</span>}
                  <ChevronRight size={15} color={FAINT} />
                  <button onClick={() => openChat(g.supplier?.slug)} title="Contacter" style={{ border: 'none', background: 'none', cursor: 'pointer', color: FAINT, display: 'inline-flex' }}>
                    <MessageSquare size={16} />
                  </button>
                </div>
                {g.items.map((it, ii) => (
                  <div key={ii} style={{ display: 'flex', gap: 16, padding: '12px 20px', alignItems: 'flex-start' }}>
                    <div style={{ width: 72, height: 72, borderRadius: 8, background: '#F4F5F7', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {it?.image_url ? <img src={it.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={22} color={FAINT} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, lineHeight: 1.4 }}>
                        {it?.product_id
                          ? <Link to={`/produit/${it.product_id}`} style={{ color: INK, textDecoration: 'none' }}>{it?.title || 'Article'}</Link>
                          : (it?.title || 'Article')}
                      </div>
                      {it?.variant && <div style={{ fontSize: 12.5, color: MUTE, marginTop: 4 }}>{it.variant}</div>}
                      <div style={{ fontSize: 13, color: MUTE, marginTop: 6 }}>{fmt(it?.unit_price_tnd)} TND&nbsp;&nbsp;×{it?.quantity || 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            )) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
                <div style={{ width: 52, height: 52, borderRadius: 8, background: '#F4F5F7', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} color={FAINT} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>Commande #{String(o.id).slice(0, 8).toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: MUTE, marginTop: 3 }}>{fmtDate(o.created_at)} · {nSub} fournisseur{nSub > 1 ? 's' : ''}</div>
                </div>
              </div>
            )}

            {/* Pied : total + actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderTop: `1px solid ${LINE}`, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 14 }}>Total : <span style={{ fontWeight: 800, color: ORANGE }}>{fmt(o.total_tnd)} TND</span></div>
              <div style={{ flex: 1 }} />
              {acts.map((a, ai) => (
                <button key={ai} onClick={a.onClick} disabled={busy === o.id} style={{
                  padding: '9px 18px', borderRadius: 30, cursor: busy === o.id ? 'default' : 'pointer', fontFamily: FONT,
                  fontSize: 13, fontWeight: a.primary ? 700 : 500,
                  border: a.primary ? 'none' : `1px solid ${a.danger ? '#F0999522' : LINE}`,
                  background: a.primary ? ORANGE : '#fff',
                  color: a.primary ? '#fff' : (a.danger ? '#B91C1C' : INK),
                  opacity: busy === o.id ? 0.6 : 1,
                }}>{a.label}</button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function OrderSkeleton() {
  return (
    <div>
      {[0, 1].map(i => (
        <div key={i} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, marginBottom: 16, padding: 20 }}>
          <div style={{ height: 14, width: '30%', background: '#F4F5F7', borderRadius: 4, marginBottom: 18 }} />
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 8, background: '#F4F5F7', flexShrink: 0 }} />
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