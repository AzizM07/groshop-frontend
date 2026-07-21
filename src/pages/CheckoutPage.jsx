// src/pages/CheckoutPage.jsx
import { useState, useMemo } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  MapPin, Truck, Ticket, Wallet, Store, Star, Check, ArrowRight,
  ChevronDown, Lock, TrendingUp,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { orders as ordersApi } from '../lib/api'
import { useIsMobile } from '../hooks/useIsMobile'

const ORANGE='#FF4500', INK='#1A1A1A', MUTE='#7A7A7A', FAINT='#A0A0A0', LINE='#EAEAEA', SOFT='#FFF0E8', GREEN='#0E9F6E'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const CITIES = ['Tunis', 'Sfax', 'Sousse', 'Mahdia', 'Nabeul', 'Bizerte', 'Gabès', 'Monastir', 'Ariana', 'Ben Arous']
const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ══════════ Logique partagée ══════════
function useCheckout() {
  const { items, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const ids = location.state?.itemIds
  const selected = useMemo(
    () => (ids ? items.filter(i => ids.includes(i.id)) : items),
    [items, ids],
  )

  const nameParts = (user?.full_name || '').split(' ')
  const [firstName, setFirstName] = useState(nameParts[0] || '')
  const [lastName, setLastName]   = useState(nameParts.slice(1).join(' ') || '')
  const [phone, setPhone]         = useState(user?.phone || '')
  const [city, setCity]           = useState('Tunis')
  const [address, setAddress]     = useState('')
  const [zip, setZip]             = useState('')
  const [notes, setNotes]         = useState('')
  const [shipping, setShipping]   = useState(0)   // 0 standard, 1 express
  const [voucher, setVoucher]     = useState('')
  const [applied, setApplied]     = useState(null)
  const [discount, setDiscount]   = useState(0)
  const [placing, setPlacing]     = useState(false)
  const [error, setError]         = useState('')

  const subtotal = useMemo(
    () => selected.reduce((t, i) => t + (parseFloat(i.unit_price_tnd) || 0) * (Number(i.quantity) || 0), 0),
    [selected],
  )
  const shippingFee = shipping === 1 ? 12 : 0
  const total = Math.max(0, subtotal + shippingFee - discount)
  const estimatedCashback = +(subtotal * 0.005).toFixed(3)

  const applyVoucher = () => {
    const c = voucher.trim().toUpperCase()
    if (!c) return
    // ⚠️ Démo : -10%. Remplace par ta vérif backend.
    setApplied(c)
    setDiscount(+(subtotal * 0.10).toFixed(2))
  }
  const removeVoucher = () => { setApplied(null); setDiscount(0); setVoucher('') }

  const placeOrder = async () => {
    if (!address.trim()) { setError('Veuillez entrer une adresse de livraison'); return }
    setPlacing(true); setError('')
    try {
      // ⚠️ Adapte à ton endpoint réel de création de commande
      await ordersApi.create({
        item_ids: selected.map(i => i.id),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        address: `${address.trim()}, ${city}${zip ? ' ' + zip : ''}`,
        city,
        notes: notes.trim(),
        shipping_method: shipping === 1 ? 'express' : 'standard',
        voucher: applied || null,
      })
      clear()
      navigate('/dashboard/commandes')
    } catch (e) {
      setError("Impossible de passer la commande. Réessayez.")
    } finally {
      setPlacing(false)
    }
  }

  return {
    selected, firstName, setFirstName, lastName, setLastName, phone, setPhone,
    city, setCity, address, setAddress, zip, setZip, notes, setNotes,
    shipping, setShipping, voucher, setVoucher, applied, applyVoucher, removeVoucher,
    subtotal, shippingFee, discount, total, estimatedCashback,
    placing, error, placeOrder, navigate,
  }
}

// ══════════ Petits composants partagés ══════════
function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTE, display: 'block', marginBottom: 6 }}>{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${LINE}`, borderRadius: 10, padding: '11px 13px', fontSize: 14, fontFamily: FONT, outline: 'none', color: INK, background: '#fff' }} />
    </label>
  )
}

function CitySelect({ value, onChange }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTE, display: 'block', marginBottom: 6 }}>Ville</span>
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', appearance: 'none', border: `1px solid ${LINE}`, borderRadius: 10, padding: '11px 13px', fontSize: 14, fontFamily: FONT, outline: 'none', color: INK, background: '#fff' }}>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <ChevronDown size={16} color={MUTE} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </div>
    </label>
  )
}

function ShippingTile({ active, title, sub, price, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, cursor: 'pointer', background: active ? '#FFF7F2' : '#fff', border: `1.5px solid ${active ? ORANGE : LINE}` }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Truck size={20} color={ORANGE} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{title}</div>
        <div style={{ fontSize: 11.5, color: MUTE, marginTop: 2 }}>{sub}</div>
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color: price <= 0 ? GREEN : INK }}>{price <= 0 ? 'Gratuit' : `${fmt(price)} TND`}</span>
      <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, border: `2px solid ${active ? ORANGE : '#CCC'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {active && <span style={{ width: 10, height: 10, borderRadius: '50%', background: ORANGE }} />}
      </span>
    </div>
  )
}

function TotalLine({ label, value, color = INK }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: MUTE }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
    </div>
  )
}

function VoucherRow({ voucher, setVoucher, applied, applyVoucher, removeVoucher }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input value={voucher} onChange={e => setVoucher(e.target.value.toUpperCase())} disabled={!!applied} placeholder="Code promo (ex. GROSHOP10)"
        style={{ flex: 1, minWidth: 0, border: `1px solid ${LINE}`, borderRadius: 10, padding: '11px 13px', fontSize: 13, fontWeight: 600, letterSpacing: '.5px', fontFamily: FONT, outline: 'none', color: INK, background: applied ? '#F8F8F8' : '#fff' }} />
      <button onClick={applied ? removeVoucher : applyVoucher}
        style={{ flexShrink: 0, border: 'none', borderRadius: 10, padding: '0 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer', color: '#fff', background: applied ? GREEN : ORANGE, display: 'flex', alignItems: 'center', gap: 5 }}>
        {applied && <Check size={15} />}{applied ? 'Appliqué' : 'Appliquer'}
      </button>
    </div>
  )
}

function CashbackBanner({ amount }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F0FFF4', border: '1px solid rgba(14,159,110,.25)', borderRadius: 10, padding: '10px 12px' }}>
      <TrendingUp size={16} color={GREEN} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 11.5, fontWeight: 600, color: GREEN }}>Vous gagnerez {fmt(amount)} TND de cashback après livraison confirmée</span>
    </div>
  )
}

// ══════════ DESKTOP (2 colonnes, façon image) ══════════
function DesktopCheckout(c) {
  return (
    <div style={{ fontFamily: FONT, color: INK, background: '#fff', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 60px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 24 }}>
          <Link to="/panier" style={{ color: ORANGE, textDecoration: 'none', fontWeight: 600 }}>Panier</Link>
          <span style={{ color: FAINT }}>›</span>
          <span style={{ color: INK, fontWeight: 700 }}>Livraison</span>
          <span style={{ color: FAINT }}>›</span>
          <span style={{ color: FAINT }}>Paiement</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 400px', gap: 32, alignItems: 'start' }}>

          {/* Colonne gauche : formulaire */}
          <div>
            <h1 style={{ margin: '0 0 20px', fontSize: 26, fontWeight: 800 }}>Adresse de livraison</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Prénom" value={c.firstName} onChange={c.setFirstName} placeholder="Prénom" />
              <Field label="Nom" value={c.lastName} onChange={c.setLastName} placeholder="Nom" />
              <Field label="Téléphone" value={c.phone} onChange={c.setPhone} placeholder="+216 …" />
              <CitySelect value={c.city} onChange={c.setCity} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Adresse" value={c.address} onChange={c.setAddress} placeholder="Rue, numéro, quartier…" />
              </div>
              <Field label="Code postal" value={c.zip} onChange={c.setZip} placeholder="1000" />
            </div>
            <div style={{ marginTop: 16 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTE, display: 'block', marginBottom: 6 }}>Note (optionnel)</span>
              <textarea value={c.notes} onChange={e => c.setNotes(e.target.value)} rows={3} placeholder="Instructions de livraison…"
                style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${LINE}`, borderRadius: 10, padding: '11px 13px', fontSize: 14, fontFamily: FONT, outline: 'none', color: INK, resize: 'vertical' }} />
            </div>

            <h2 style={{ margin: '32px 0 16px', fontSize: 20, fontWeight: 800 }}>Méthode de livraison</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <ShippingTile active={c.shipping === 0} title="Livraison standard" sub="Reçu en 3–5 jours" price={0} onClick={() => c.setShipping(0)} />
              <ShippingTile active={c.shipping === 1} title="Livraison express" sub="Reçu en 24–48 h" price={12} onClick={() => c.setShipping(1)} />
            </div>
          </div>

          {/* Colonne droite : récap sticky */}
          <aside style={{ position: 'sticky', top: 24, border: `1px solid ${LINE}`, borderRadius: 16, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,.04)' }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Votre commande</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 260, overflowY: 'auto', marginBottom: 16 }}>
              {c.selected.map(item => {
                const p = item.product || {}
                const qty = Number(item.quantity) || 0
                const unit = parseFloat(item.unit_price_tnd) || 0
                return (
                  <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: '#F5F5F5', flexShrink: 0 }}>
                      {p.image_url ? <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>}
                      <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, background: INK, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{qty}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
                      <div style={{ fontSize: 11.5, color: FAINT, marginTop: 2 }}>{p.supplier?.name || ''}</div>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, flexShrink: 0 }}>{fmt(unit * qty)}</div>
                  </div>
                )
              })}
            </div>

            <div style={{ marginBottom: 16 }}>
              <VoucherRow voucher={c.voucher} setVoucher={c.setVoucher} applied={c.applied} applyVoucher={c.applyVoucher} removeVoucher={c.removeVoucher} />
            </div>

            <div style={{ height: 1, background: LINE, margin: '0 0 16px' }} />
            <TotalLine label="Sous-total" value={`${fmt(c.subtotal)} TND`} />
            <TotalLine label="Livraison" value={c.shippingFee <= 0 ? 'Gratuite' : `${fmt(c.shippingFee)} TND`} color={c.shippingFee <= 0 ? GREEN : INK} />
            {c.discount > 0 && <TotalLine label={`Promo (${c.applied})`} value={`− ${fmt(c.discount)} TND`} color={GREEN} />}
            <div style={{ height: 1, background: LINE, margin: '8px 0 16px' }} />
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Total <span style={{ fontSize: 11.5, fontWeight: 400, color: FAINT }}>TVA incluse</span></span>
              <span style={{ fontSize: 22, fontWeight: 900, color: ORANGE }}>{fmt(c.total)} TND</span>
            </div>

            <div style={{ marginBottom: 14 }}><CashbackBanner amount={c.estimatedCashback} /></div>
            {c.error && <div style={{ color: '#DC2626', fontSize: 12.5, marginBottom: 12 }}>{c.error}</div>}

            <button onClick={c.placeOrder} disabled={c.placing}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px', borderRadius: 12, border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, cursor: c.placing ? 'default' : 'pointer', opacity: c.placing ? .7 : 1, background: 'linear-gradient(135deg,#FF6B35,#FF4500)', boxShadow: '0 4px 14px rgba(255,69,0,.3)' }}>
              {c.placing ? 'Traitement…' : <>Payer · {fmt(c.total)} TND <ArrowRight size={17} /></>}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 12, fontSize: 11, color: FAINT }}>
              <Lock size={12} /> Paiement sécurisé
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

// ══════════ MOBILE (calque Flutter) ══════════
function SectionHeader({ icon: Icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} color={ORANGE} /></span>
      <span style={{ fontSize: 15, fontWeight: 800 }}>{title}</span>
    </div>
  )
}

function MobileCheckout(c) {
  return (
    <div style={{ fontFamily: FONT, color: INK, background: '#fff', minHeight: '100dvh', paddingBottom: 84 }}>

      {/* AppBar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: `1px solid #F0F0F0`, height: 52, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <button onClick={() => c.navigate(-1)} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', color: INK }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 800 }}>Checkout</span>
        <span style={{ width: 32 }} />
      </div>

      <div style={{ padding: '16px 16px 8px' }}>

        {/* Adresse */}
        <SectionHeader icon={MapPin} title="Adresse de livraison" />
        <div style={{ border: `1.4px solid ${ORANGE}`, borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <CitySelect value={c.city} onChange={c.setCity} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Prénom" value={c.firstName} onChange={c.setFirstName} placeholder="Prénom" />
            <Field label="Nom" value={c.lastName} onChange={c.setLastName} placeholder="Nom" />
          </div>
          <Field label="Téléphone" value={c.phone} onChange={c.setPhone} placeholder="+216 …" />
          <Field label="Adresse" value={c.address} onChange={c.setAddress} placeholder="Rue, numéro, quartier…" />
        </div>

        {/* Articles */}
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Liste des articles</div>
        {c.selected.map(item => {
          const p = item.product || {}
          const qty = Number(item.quantity) || 0
          const unit = parseFloat(item.unit_price_tnd) || 0
          const old = parseFloat(p.old_price_tnd) || 0
          return (
            <div key={item.id} style={{ border: `1px solid #EEE`, borderRadius: 14, padding: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 76, height: 76, borderRadius: 10, overflow: 'hidden', background: '#F5F5F5', flexShrink: 0 }}>
                  {p.image_url ? <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>📦</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: MUTE, marginTop: 3 }}>Quantité : ×{qty}</div>
                  {p.supplier?.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                      <Store size={12} color={MUTE} /><span style={{ fontSize: 11, color: MUTE, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.supplier.name}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <span style={{ border: `1.3px solid ${ORANGE}`, borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 800, color: ORANGE }}>TND {fmt(unit)}</span>
                    {old > unit && <span style={{ fontSize: 12, color: MUTE, textDecoration: 'line-through' }}>TND {fmt(old)}</span>}
                  </div>
                </div>
              </div>
              <div style={{ height: 1, background: '#F0F0F0', margin: '12px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: MUTE }}>Total ({qty} article{qty > 1 ? 's' : ''})</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 15, fontWeight: 900 }}>TND {fmt(unit * qty)}</span>
              </div>
            </div>
          )
        })}

        {/* Livraison */}
        <div style={{ marginTop: 12 }}><SectionHeader icon={Truck} title="Options de livraison" /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <ShippingTile active={c.shipping === 0} title="Livraison standard" sub="Reçu en 3–5 jours" price={0} onClick={() => c.setShipping(0)} />
          <ShippingTile active={c.shipping === 1} title="Livraison express" sub="Reçu en 24–48 h" price={12} onClick={() => c.setShipping(1)} />
        </div>

        {/* Promo */}
        <SectionHeader icon={Ticket} title="Bon & Promo" />
        <div style={{ marginBottom: 24 }}>
          <VoucherRow voucher={c.voucher} setVoucher={c.setVoucher} applied={c.applied} applyVoucher={c.applyVoucher} removeVoucher={c.removeVoucher} />
        </div>

        {/* Cashback */}
        <div style={{ marginBottom: 24 }}><CashbackBanner amount={c.estimatedCashback} /></div>

        {/* Récap */}
        <div style={{ background: '#FAFAFA', border: `1px solid #EEE`, borderRadius: 16, padding: 16 }}>
          <TotalLine label="Sous-total" value={`TND ${fmt(c.subtotal)}`} />
          <TotalLine label="Frais de livraison" value={c.shippingFee <= 0 ? 'Gratuit' : `TND ${fmt(c.shippingFee)}`} color={c.shippingFee <= 0 ? GREEN : INK} />
          {c.discount > 0 && <TotalLine label={`Promo (${c.applied})`} value={`− TND ${fmt(c.discount)}`} color={GREEN} />}
          <div style={{ height: 1, background: '#E5E5E5', margin: '10px 0 14px' }} />
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>Total</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 22, fontWeight: 900, color: ORANGE }}>TND {fmt(c.total)}</span>
          </div>
        </div>

        {c.error && <div style={{ color: '#DC2626', fontSize: 12.5, marginTop: 12 }}>{c.error}</div>}
      </div>

      {/* Bouton Payer fixe */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60, background: '#fff', borderTop: `1px solid ${LINE}`, padding: '10px 16px calc(10px + env(safe-area-inset-bottom))' }}>
        <button onClick={c.placeOrder} disabled={c.placing}
          style={{ width: '100%', height: 52, borderRadius: 14, border: 'none', color: '#fff', fontSize: 16, fontWeight: 800, cursor: c.placing ? 'default' : 'pointer', opacity: c.placing ? .7 : 1, background: 'linear-gradient(135deg,#FF6B35,#FF4500)' }}>
          {c.placing ? 'Traitement…' : `Payer · TND ${fmt(c.total)}`}
        </button>
      </div>
    </div>
  )
}

// ══════════ Wrapper ══════════
export default function CheckoutPage() {
  const isMobile = useIsMobile()
  const checkout = useCheckout()
  return isMobile ? <MobileCheckout {...checkout} /> : <DesktopCheckout {...checkout} />
}