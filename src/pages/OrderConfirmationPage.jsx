// src/pages/OrderConfirmationPage.jsx — GROSHOP.tn
// Reçoit la commande via location.state (venant de CheckoutPage quand payment_method='cod')
// ou la recharge via /commande/:id/confirmation.
// Design inspiré des mails de confirmation carparts.com : bannière image en haut,
// stepper orange qui reflète le vrai statut backend, carte blanche centrée sur fond gris.

import { useState, useEffect } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { Check, ChevronRight } from 'lucide-react'
import { orders as ordersApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useIsMobile } from '../hooks/useIsMobile'
import BANNER_SRC from '../assets/order-confirmation-banner.jpg'

const ORANGE = '#FF5E00'
const ORANGE_SOFT = '#FFF0E8'
const INK    = '#1A1A1A'
const MUTE   = '#6B7280'
const FAINT  = '#9CA3AF'
const LINE   = '#E5E7EB'
const BG     = '#F3F4F6'
const FONT   = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const fmt = (n) => `${(Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TND`
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

// Doit rester aligné avec shortRef() dans CommandesPage.jsx
const shortRef = (o) => o.reference ? String(o.reference).toUpperCase() : String(o.id).slice(0, 8).toUpperCase()

// Statuts backend : pending, call_confirmed, in_production, shipped, delivered, cancelled
const STEP_FOR_STATUS = (status) => {
  if (status === 'shipped') return 'in_transit'
  if (status === 'delivered') return 'delivered'
  return 'confirmed'
}
const STEPS = [
  { key: 'confirmed',  label: 'Confirmée' },
  { key: 'in_transit', label: 'En transit' },
  { key: 'delivered',  label: 'Livrée' },
]

const PAYMENT_LABELS = {
  cod: 'Paiement à la livraison',
  d17: 'D17',
  flouci: 'Flouci',
  sobflous: 'Sobflous',
  virement: 'Virement bancaire',
}

// ─── STYLES (animations + responsive) ──────────────────────────
const CSS = `
@keyframes ocp-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 94, 0, 0.35) }
  50%      { box-shadow: 0 0 0 8px rgba(255, 94, 0, 0) }
}
@keyframes ocp-fadeUp {
  from { opacity: 0; transform: translateY(6px) }
  to   { opacity: 1; transform: translateY(0) }
}
@keyframes ocp-lineFill {
  from { transform: scaleX(0) }
  to   { transform: scaleX(1) }
}

.ocp-fade { animation: ocp-fadeUp .45s ease both }
.ocp-fade-1 { animation-delay: .05s }
.ocp-fade-2 { animation-delay: .12s }
.ocp-fade-3 { animation-delay: .2s }

.ocp-step-active { animation: ocp-pulse 2s ease-in-out infinite }
.ocp-line-fill  { transform-origin: left center; animation: ocp-lineFill .8s ease-out .3s both }

.ocp-btn-primary:hover  { background: #E85400 !important }
.ocp-btn-outline:hover  { background: ${ORANGE_SOFT} !important }

/* Desktop : carte pleine largeur (bornée) */
@media (min-width: 768px) {
  .ocp-shell    { padding: 28px 24px 60px }
  .ocp-card     { border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,.06) }
  .ocp-body     { padding: 40px 56px 48px }
  .ocp-h1       { font-size: 28px }
  .ocp-info-grid{ grid-template-columns: repeat(3, 1fr); gap: 32px }
  .ocp-item     { padding: 20px 0 }
  .ocp-item-img { width: 92px; height: 92px }
  .ocp-totals   { padding: 20px 0 }
}

/* Mobile */
@media (max-width: 767px) {
  .ocp-shell    { padding: 0 0 40px }
  .ocp-card     { border-radius: 0; box-shadow: none }
  .ocp-body     { padding: 24px 20px 32px }
  .ocp-h1       { font-size: 20px }
  .ocp-info-grid{ grid-template-columns: 1fr; gap: 16px }
  .ocp-item     { padding: 16px 0 }
  .ocp-item-img { width: 72px; height: 72px }
  .ocp-totals   { padding: 16px 0 }
}
`

// ─── BANNIÈRE ───────────────────────────────────────────────────
function Banner() {
  return (
    <div style={{ width: '100%', maxHeight: '40vh', overflow: 'hidden' }}>
      <img
        src={BANNER_SRC}
        alt="Merci pour votre commande"
        style={{ width: '100%', height: '100%', maxHeight: '40vh', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )
}

// ─── STEPPER animé (reflète le status backend) ─────────────────
function Stepper({ status }) {
  const current = STEP_FOR_STATUS(status)
  const idx = STEPS.findIndex(s => s.key === current)

  if (status === 'cancelled') {
    return (
      <div style={{ textAlign: 'center', padding: '28px 24px 4px' }}>
        <span style={{
          display: 'inline-block', background: '#FEE2E2', color: '#991B1B',
          fontSize: 12.5, fontWeight: 700, padding: '6px 16px', borderRadius: 999,
        }}>Commande annulée</span>
      </div>
    )
  }

  return (
    <div className="ocp-fade" style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '32px 24px 8px', maxWidth: 520, margin: '0 auto',
    }}>
      {STEPS.map((s, i) => {
        const done   = i < idx
        const active = i === idx
        const pending = i > idx

        return (
          <div key={s.key} style={{
            display: 'flex', alignItems: 'flex-start',
            flex: i < STEPS.length - 1 ? 1 : '0 0 auto',
          }}>
            {/* Pastille + label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 60 }}>
              <span
                className={active ? 'ocp-step-active' : ''}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done || active ? ORANGE : '#fff',
                  border: `2px solid ${done || active ? ORANGE : LINE}`,
                  transition: 'all .3s ease',
                }}
              >
                {done ? (
                  <Check size={16} color="#fff" strokeWidth={3} />
                ) : (
                  <span style={{
                    width: 9, height: 9, borderRadius: '50%',
                    background: active ? '#fff' : LINE,
                  }} />
                )}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                color: done || active ? ORANGE : FAINT,
                transition: 'color .3s ease',
              }}>
                {s.label}
              </span>
            </div>

            {/* Ligne de progression */}
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, background: LINE,
                margin: '15px 4px 0', position: 'relative', overflow: 'hidden', borderRadius: 2,
              }}>
                {i < idx && (
                  <div
                    className="ocp-line-fill"
                    style={{
                      position: 'absolute', inset: 0, background: ORANGE, borderRadius: 2,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── ENCART INFOS ──────────────────────────────────────────────
function InfoBox({ order, email }) {
  return (
    <div className="ocp-fade ocp-fade-2" style={{
      background: '#F9FAFB', border: `1px solid ${LINE}`, borderRadius: 12,
      padding: 22, margin: '26px 0 0',
    }}>
      <div style={{ fontSize: 11.5, color: MUTE, marginBottom: 4, fontWeight: 500 }}>Numéro de commande</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: INK, marginBottom: 20, letterSpacing: 0.3 }}>
        #{shortRef(order)}
      </div>

      <div className="ocp-info-grid" style={{ display: 'grid' }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: INK, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
            Date
          </div>
          <div style={{ fontSize: 13, color: MUTE }}>{fmtDate(order.created_at)}</div>
        </div>

        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: INK, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
            Paiement
          </div>
          <div style={{ fontSize: 13, color: MUTE }}>
            {PAYMENT_LABELS[order.payment_method] || order.payment_method}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: INK, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
            Livraison
          </div>
          <div style={{ fontSize: 13, color: MUTE, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
            {order.shipping_address}
          </div>
          {email && <div style={{ fontSize: 13, color: MUTE, marginTop: 4 }}>{email}</div>}
        </div>
      </div>
    </div>
  )
}

// ─── LIGNE ARTICLE ─────────────────────────────────────────────
function ItemRow({ item, supplierName, isLast }) {
  return (
    <div className="ocp-item" style={{
      display: 'flex', gap: 16, alignItems: 'flex-start',
      borderBottom: isLast ? 'none' : `1px solid ${LINE}`,
    }}>
      <div className="ocp-item-img" style={{
        borderRadius: 10, background: '#F4F5F7', flexShrink: 0, overflow: 'hidden',
      }}>
        {item.product_image
          ? <img src={item.product_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>📦</div>}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: INK, lineHeight: 1.35 }}>
          {item.product_name}
        </div>
        {item.product_category && (
          <div style={{ fontSize: 12, color: MUTE, marginTop: 4 }}>{item.product_category}</div>
        )}
        <div style={{ fontSize: 12.5, color: MUTE, marginTop: 6 }}>
          Qté : <strong style={{ color: INK, fontWeight: 700 }}>{item.quantity}</strong>
          <span style={{ color: FAINT }}> · </span>
          {fmt(item.unit_price_tnd)} / unité
        </div>
        <div style={{
          display: 'inline-block', marginTop: 8, fontSize: 11.5, fontWeight: 700,
          color: ORANGE, background: ORANGE_SOFT, padding: '3px 10px', borderRadius: 999,
        }}>
          Expédié par {supplierName}
        </div>
      </div>

      <div style={{ fontSize: 15, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>
        {fmt(item.total_tnd)}
      </div>
    </div>
  )
}

// ─── TOTAUX ────────────────────────────────────────────────────
function Totals({ order }) {
  const subtotal = Number(order.total_tnd || 0) + Number(order.discount_tnd || 0)
  return (
    <div className="ocp-totals">
      <Row label="Sous-total" value={fmt(subtotal)} />
      {Number(order.discount_tnd) > 0 && (
        <Row label="Remise" value={`− ${fmt(order.discount_tnd)}`} color={ORANGE} />
      )}
      <Row label="Livraison" value="Gratuite" color="#059669" />
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 17, fontWeight: 800, color: INK,
        paddingTop: 14, marginTop: 10, borderTop: `2px solid ${INK}`,
      }}>
        <span>Total</span><span>{fmt(order.total_tnd)}</span>
      </div>
    </div>
  )
}

function Row({ label, value, color = MUTE }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '5px 0' }}>
      <span style={{ color: MUTE }}>{label}</span>
      <span style={{ color, fontWeight: color === MUTE ? 500 : 700 }}>{value}</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
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
    ordersApi.detail(id)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, order])

  if (loading) return (
    <div style={{ padding: 80, textAlign: 'center', color: MUTE, fontFamily: FONT }}>
      Chargement de votre commande…
    </div>
  )
  if (!order) return (
    <div style={{ padding: 80, textAlign: 'center', color: MUTE, fontFamily: FONT }}>
      Commande introuvable.
    </div>
  )

  const allItems = (order.sub_orders || []).flatMap(so =>
    (so.items || []).map(it => ({ ...it, supplierName: so.supplier_name }))
  )

  const isCancelled = order.status === 'cancelled'

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: FONT }}>
      <style>{CSS}</style>

      <Banner />

      <div className="ocp-shell">
        <div className="ocp-card" style={{
          background: '#fff', overflow: 'hidden',
          marginTop: isMobile ? 0 : '-40px', position: 'relative',
        }}>
          <Stepper status={order.status} />

          <div className="ocp-body">

            {/* Titre + CTA */}
            <div className="ocp-fade ocp-fade-1" style={{ textAlign: 'center' }}>
              <h1 className="ocp-h1" style={{
                fontWeight: 800, color: INK, margin: '0 0 12px', letterSpacing: -0.3,
              }}>
                {isCancelled ? 'Commande annulée' : 'Votre commande est confirmée !'}
              </h1>
              <p style={{
                fontSize: 14, color: MUTE, lineHeight: 1.6, margin: '0 auto', maxWidth: 480,
              }}>
                {isCancelled
                  ? 'Cette commande a été annulée. Contactez-nous si vous avez besoin d\'aide.'
                  : <>Nous vous tiendrons informé dès qu'elle sera prête à prendre la route.<br />Vous pouvez consulter les détails ci-dessous.</>
                }
              </p>

              <Link
                to="/dashboard/commandes"
                className="ocp-btn-outline"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 22,
                  border: `2px solid ${ORANGE}`, color: ORANGE, borderRadius: 10,
                  padding: '12px 26px', fontSize: 14, fontWeight: 800, textDecoration: 'none',
                  transition: 'background .15s',
                }}
              >
                Voir ma commande <ChevronRight size={16} />
              </Link>

              <p style={{ fontSize: 11.5, color: FAINT, marginTop: 16, lineHeight: 1.5 }}>
                Note : vos articles peuvent arriver en plusieurs colis selon le fournisseur.
              </p>
            </div>

            <InfoBox order={order} email={user?.email} />

            {/* Articles */}
            <div className="ocp-fade ocp-fade-3" style={{ marginTop: 28 }}>
              {allItems.map((it, i) => (
                <ItemRow
                  key={it.id}
                  item={it}
                  supplierName={it.supplierName}
                  isLast={i === allItems.length - 1}
                />
              ))}
            </div>

            <Totals order={order} />

            {/* Signature */}
            <div style={{
              borderTop: `1px solid ${LINE}`, paddingTop: 22, marginTop: 8, textAlign: 'center',
            }}>
              <p style={{ fontSize: 13, color: MUTE, lineHeight: 1.6, margin: '0 0 8px', maxWidth: 480, marginInline: 'auto' }}>
                Merci d'avoir choisi GROSHOP pour vos besoins professionnels.
                Pour toute question ou assistance, notre équipe reste à un clic.
              </p>
              <p style={{ fontSize: 13, fontWeight: 800, color: INK, margin: 0 }}>
                L'équipe GROSHOP
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}