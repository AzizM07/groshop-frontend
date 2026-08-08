// src/pages/OrderConfirmationPage.jsx — GROSHOP.tn
// Reçoit la commande via location.state (venant de CheckoutPage quand payment_method='cod',
// donc pas de paiement en ligne) ou la recharge via l'API si on arrive sur /commande/:id/confirmation.
// Forme attendue = OrderDetailSerializer (orders/serializers.py) :
//   { id, status, payment_status, payment_method, total_tnd, discount_tnd,
//     shipping_address (texte déjà formaté), shipping_address_id, notes, created_at,
//     sub_orders: [{ id, supplier_name, supplier_slug, status, subtotal_tnd, delivery_type,
//                    items: [{ id, product_id, product_name, product_slug, product_category,
//                              product_image, quantity, unit_price_tnd, total_tnd }] }] }
import { useState, useEffect } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { Check, ChevronRight } from 'lucide-react'
import { orders as ordersApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useIsMobile } from '../hooks/useIsMobile'
import LOGO_SRC from '../assets/logo2.png'

const ORANGE = '#FF5E00', INK = '#1A1A1A', MUTE = '#7A7A7A', FAINT = '#A0A0A0', LINE = '#EAEAEA'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const fmt = (n) => `${(Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TND`
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

// order.status backend ∈ pending, call_confirmed, in_production, shipped, delivered, cancelled
const STEP_FOR_STATUS = (status) => {
  if (status === 'shipped') return 'in_transit'
  if (status === 'delivered') return 'delivered'
  return 'confirmed' // pending, call_confirmed, in_production
}
const STEPS = [
  { key: 'confirmed', label: 'Confirmée' },
  { key: 'in_transit', label: 'En transit' },
  { key: 'delivered', label: 'Livrée' },
]

// ─── BANNIÈRE (CSS/SVG, pas d'image externe) ───
function Banner() {
  return (
    <div style={{ position: 'relative', height: 190, background: 'linear-gradient(120deg,#FFB088 0%,#FF5E00 55%,#E24B00 100%)', overflow: 'hidden' }}>
      <svg viewBox="0 0 700 190" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35 }}>
        <path d="M420,190 C480,110 560,150 620,40 C650,-10 690,10 700,-20 L700,190 Z" fill="#fff" opacity="0.15" />
        <path d="M470,190 C520,130 590,160 640,70 C665,25 690,35 700,10 L700,190 Z" fill="#fff" opacity="0.12" />
      </svg>
      <svg width="120" height="120" viewBox="0 0 100 100" style={{ position: 'absolute', right: 24, top: 20, opacity: 0.9 }} aria-hidden="true">
        <rect x="18" y="38" width="64" height="44" rx="4" fill="#fff" opacity="0.9" />
        <path d="M18 38 L50 18 L82 38" stroke="#fff" strokeWidth="4" fill="none" opacity="0.9" />
        <rect x="42" y="55" width="16" height="27" fill="#FF5E00" opacity="0.9" />
      </svg>
      <div style={{ position: 'relative', height: '100%', padding: '20px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <img src={LOGO_SRC} alt="GROSHOP.tn" style={{ height: 30, filter: 'brightness(0) invert(1)' }} onError={e => { e.currentTarget.style.display = 'none' }} />
        <div>
          <div style={{ color: '#fff', fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>Merci pour</div>
          <div style={{ color: '#fff', fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>votre commande !</div>
        </div>
      </div>
    </div>
  )
}

function Stepper({ status }) {
  const current = STEP_FOR_STATUS(status)
  const idx = STEPS.findIndex(s => s.key === current)
  if (status === 'cancelled') {
    return (
      <div style={{ textAlign: 'center', padding: '24px 24px 4px' }}>
        <span style={{ display: 'inline-block', background: '#FCEBEB', color: '#791F1F', fontSize: 12.5, fontWeight: 700, padding: '5px 14px', borderRadius: 20 }}>Commande annulée</span>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 24px 4px' }}>
      {STEPS.map((s, i) => (
        <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i <= idx ? ORANGE : '#fff', border: `2px solid ${i <= idx ? ORANGE : LINE}`,
            }}>
              {i < idx ? <Check size={15} color="#fff" strokeWidth={3} /> : (
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: i === idx ? '#fff' : LINE }} />
              )}
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: i <= idx ? ORANGE : FAINT, whiteSpace: 'nowrap' }}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < idx ? ORANGE : LINE, margin: '0 8px 18px' }} />}
        </div>
      ))}
    </div>
  )
}

const PAYMENT_LABELS = { cod: 'Paiement à la livraison', d17: 'D17', flouci: 'Flouci', sobflous: 'Sobflous', virement: 'Virement bancaire' }

function InfoBox({ order, email }) {
  return (
    <div style={{ background: '#F7F7F7', border: `1px solid ${LINE}`, borderRadius: 10, padding: 18, margin: '22px 24px 0' }}>
      <div style={{ fontSize: 12, color: MUTE, marginBottom: 3 }}>Numéro de commande</div>
      <div style={{ fontSize: 14.5, fontWeight: 800, color: INK, marginBottom: 16 }}>#{String(order.id).slice(0, 8).toUpperCase()}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 6 }}>Date de commande :</div>
          <div style={{ fontSize: 12.5, color: MUTE, marginBottom: 12 }}>{fmtDate(order.created_at)}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 6 }}>Paiement :</div>
          <div style={{ fontSize: 12.5, color: MUTE }}>{PAYMENT_LABELS[order.payment_method] || order.payment_method}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 6 }}>Livraison :</div>
          <div style={{ fontSize: 12.5, color: MUTE, marginBottom: 8, whiteSpace: 'pre-line' }}>{order.shipping_address}</div>
          {email && <div style={{ fontSize: 12.5, color: MUTE }}>{email}</div>}
        </div>
      </div>
    </div>
  )
}

function ItemRow({ item, supplierName }) {
  return (
    <div style={{ display: 'flex', gap: 14, padding: '18px 24px', borderBottom: `1px solid ${LINE}` }}>
      <div style={{ width: 64, height: 64, borderRadius: 8, background: '#F4F5F7', flexShrink: 0, overflow: 'hidden' }}>
        {item.product_image ? <img src={item.product_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: INK }}>{item.product_name}</div>
        {item.product_category && <div style={{ fontSize: 12, color: MUTE, marginTop: 4 }}>{item.product_category}</div>}
        <div style={{ fontSize: 12, color: MUTE, marginTop: 2 }}>Qté : {item.quantity} · {fmt(item.unit_price_tnd)} / unité</div>
        <div style={{ fontSize: 12, color: ORANGE, fontWeight: 700, marginTop: 2 }}>Expédié par {supplierName}</div>
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{fmt(item.total_tnd)}</div>
    </div>
  )
}

function Totals({ order }) {
  const subtotal = Number(order.total_tnd || 0) + Number(order.discount_tnd || 0)
  return (
    <div style={{ padding: '18px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: MUTE, padding: '4px 0' }}>
        <span>Sous-total</span><span>{fmt(subtotal)}</span>
      </div>
      {Number(order.discount_tnd) > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: MUTE, padding: '4px 0' }}>
          <span>Remise</span><span>-{fmt(order.discount_tnd)}</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15.5, fontWeight: 800, color: INK, paddingTop: 10, marginTop: 6, borderTop: `1px solid ${LINE}` }}>
        <span>Total</span><span>{fmt(order.total_tnd)}</span>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  const isMobile = useIsMobile()
  const location = useLocation()
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(location.state?.order || null)
  const [loading, setLoading] = useState(!location.state?.order)

useEffect(() => {
  if (order) return
  if (!id) { setLoading(false); return }
  ordersApi.detail(id).then(setOrder).catch(() => {}).finally(() => setLoading(false))
}, [id, order])

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: MUTE, fontFamily: FONT }}>Chargement de votre commande…</div>
  if (!order) return <div style={{ padding: 60, textAlign: 'center', color: MUTE, fontFamily: FONT }}>Commande introuvable.</div>

  const allItems = (order.sub_orders || []).flatMap(so => (so.items || []).map(it => ({ ...it, supplierName: so.supplier_name })))

  return (
    <div style={{ background: '#F4F5F7', minHeight: '100vh', fontFamily: FONT, padding: isMobile ? 0 : '32px 0' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', background: '#fff', borderRadius: isMobile ? 0 : 14, overflow: 'hidden', boxShadow: isMobile ? 'none' : '0 8px 30px rgba(0,0,0,.06)' }}>
        <Banner />
        <Stepper status={order.status} />

        <div style={{ textAlign: 'center', padding: '4px 24px 0' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: '0 0 10px' }}>
            {order.status === 'cancelled' ? 'Commande annulée' : 'Votre commande est confirmée !'}
          </h1>
          <p style={{ fontSize: 13.5, color: MUTE, lineHeight: 1.6, margin: 0 }}>
            Nous vous tiendrons informé dès qu'elle sera prête à prendre la route.<br />Vous pouvez consulter les détails ci-dessous.
          </p>
          <Link to={`/dashboard/commandes`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 18, border: `1.5px solid ${ORANGE}`, color: ORANGE, borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
            Voir ma commande <ChevronRight size={16} />
          </Link>
          <p style={{ fontSize: 11.5, color: FAINT, marginTop: 14 }}>Note : vos articles peuvent arriver en plusieurs colis selon le fournisseur.</p>
        </div>

        <InfoBox order={order} email={user?.email} />

        <div style={{ marginTop: 22 }}>
          {allItems.map((it) => <ItemRow key={it.id} item={it} supplierName={it.supplierName} />)}
        </div>

        <Totals order={order} />

        <div style={{ borderTop: `1px solid ${LINE}`, padding: '18px 24px 28px' }}>
          <p style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.6, margin: '0 0 10px' }}>
            Merci d'avoir choisi GROSHOP pour vos besoins professionnels. Pour toute question ou assistance, notre équipe reste à un clic.
          </p>
          <p style={{ fontSize: 12.5, fontWeight: 800, color: INK, margin: 0 }}>L'équipe GROSHOP</p>
        </div>
      </div>
    </div>
  )
}