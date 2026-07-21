// src/components/MobileCart.jsx
import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin, Trash2, Minus, Plus, Store, ChevronRight, ChevronDown,
  Truck, RotateCcw, AlertCircle, Tag, Lock, ArrowRight, Check,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const ORANGE='#FF4500', INK='#1A1A1A', MUTE='#7A7A7A', FAINT='#A0A0A0', LINE='#EDEDED', SOFT='#FFF0E8', GREEN='#0E9F6E', RED='#DC2626'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function Checkbox({ checked, size = 22, onClick }) {
  return (
    <span onClick={onClick} style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: checked ? ORANGE : 'transparent', border: `2px solid ${checked ? ORANGE : '#CCC'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      {checked && <Check size={size * 0.6} color="#fff" strokeWidth={3} />}
    </span>
  )
}

export default function MobileCart() {
  const { user, loading: authLoading } = useAuth()
  const { items, loading, setQty, remove, clear } = useCart()
  const navigate = useNavigate()

  const [selected, setSelected] = useState(new Set())
  const [confirmClear, setConfirmClear] = useState(false)
  const [promoOpen, setPromoOpen] = useState(false)
  const [promo, setPromo] = useState('')

  useEffect(() => { setSelected(new Set(items.map(i => i.id))) }, [items.length])

  const toggle = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const groups = useMemo(() => {
    const m = new Map()
    items.forEach(item => {
      const sup = item.product?.supplier
      const key = sup?.id || 'unknown'
      if (!m.has(key)) m.set(key, { supplier: sup, items: [] })
      m.get(key).items.push(item)
    })
    return [...m.values()]
  }, [items])

  const { total, savings, selCount, unitCount } = useMemo(() => {
    let t = 0, s = 0, n = 0, u = 0
    items.forEach(i => {
      if (!selected.has(i.id)) return
      const unit = parseFloat(i.unit_price_tnd) || 0
      const qty = Number(i.quantity) || 0
      const old = parseFloat(i.product?.old_price_tnd) || 0
      t += unit * qty
      if (old > unit) s += (old - unit) * qty
      n++; u += qty
    })
    return { total: t, savings: s, selCount: n, unitCount: u }
  }, [items, selected])

  const allSelected = items.length > 0 && selected.size === items.length
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map(i => i.id)))

  if (authLoading || (loading && !items.length)) return <Screen><Spinner /></Screen>
  if (!user) return <Screen><Prompt emoji="🔒" title="Connectez-vous" sub="pour voir votre panier" to="/login" cta="Se connecter" /></Screen>
  if (!items.length) return <Screen><Prompt emoji="🛒" title="Panier vide" sub="Ajoutez des produits pour commander" to="/" cta="Découvrir les produits" /></Screen>

  return (
    <div style={{ fontFamily: FONT, color: INK, background: '#F4F5F7', minHeight: '100%' }}>

      {/* Barre titre */}
      <div style={{ position: 'sticky', top: 56, zIndex: 40, background: '#fff', borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
        <span style={{ fontSize: 20, fontWeight: 800 }}>Panier ({items.length})</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 500, background: SOFT, color: ORANGE, padding: '3px 9px', borderRadius: 999 }}><MapPin size={12} /> Tunisie</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setConfirmClear(true)} style={{ background: 'none', border: 'none', color: MUTE, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, padding: 0 }}><Trash2 size={16} /> Vider</button>
      </div>

      {/* Sélection globale */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px 4px' }}>
        <div onClick={toggleAll} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <Checkbox checked={allSelected} size={20} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Tout sélectionner</span>
        </div>
      </div>

      {/* Liste par fournisseur */}
      <div style={{ padding: '6px 10px 0' }}>
        {groups.map(({ supplier, items: gItems }) => {
          const gIds = gItems.map(i => i.id)
          const gAll = gIds.every(id => selected.has(id))
          return (
            <div key={supplier?.id || 'unknown'} style={{ background: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden', border: `1px solid ${LINE}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                <Checkbox checked={gAll} onClick={() => setSelected(s => { const n = new Set(s); gAll ? gIds.forEach(id => n.delete(id)) : gIds.forEach(id => n.add(id)); return n })} />
                <div style={{ width: 24, height: 24, borderRadius: 6, background: SOFT, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {supplier?.logo_url ? <img src={supplier.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Store size={13} color={ORANGE} />}
                </div>
                <Link to={supplier?.slug ? `/fournisseur/${supplier.slug}` : '#'} style={{ fontSize: 14, fontWeight: 600, color: INK, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, minWidth: 0 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{supplier?.name || 'Fournisseur'}</span>
                  <ChevronRight size={15} color={FAINT} />
                </Link>
              </div>

              {gItems.map(item => (
                <div key={item.id}>
                  <div style={{ height: 1, background: '#F2F2F2', margin: '0 14px' }} />
                  <MobileRow item={item} selected={selected.has(item.id)} onToggle={() => toggle(item.id)} onQty={q => setQty(item.id, q)} onRemove={() => remove(item.id)} />
                </div>
              ))}
            </div>
          )
        })}

        {/* Récapitulatif */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${LINE}`, padding: 18, marginTop: 4, marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Récapitulatif</div>

          {/* Code promo */}
          <div style={{ border: `1px solid ${LINE}`, borderRadius: 10, marginBottom: 16, overflow: 'hidden' }}>
            <div onClick={() => setPromoOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 12px', cursor: 'pointer' }}>
              <Tag size={14} color={FAINT} />
              <span style={{ fontSize: 12.5, color: MUTE, flex: 1 }}>Vous avez un code promo ?</span>
              <ChevronDown size={15} color={FAINT} style={{ transform: promoOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </div>
            {promoOpen && (
              <div style={{ display: 'flex', gap: 6, padding: '0 12px 12px' }}>
                <input value={promo} onChange={e => setPromo(e.target.value.toUpperCase())} placeholder="CODE" style={{ flex: 1, minWidth: 0, border: `1px solid ${LINE}`, borderRadius: 8, padding: '9px 10px', fontSize: 12.5, fontFamily: FONT, outline: 'none', letterSpacing: .5, color: INK }} />
                <button style={{ background: INK, color: '#fff', border: 'none', borderRadius: 8, padding: '0 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Appliquer</button>
              </div>
            )}
          </div>

          <Line label={`Sous-total (${unitCount} ${unitCount > 1 ? 'articles' : 'article'})`} value={`${fmt(total)} TND`} />
          <Line label="Livraison" value="Gratuite" valueColor={GREEN} />
          {savings > 0 && <Line label="Économies" value={`− ${fmt(savings)} TND`} valueColor={ORANGE} />}

          {savings > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, background: '#F0FDF4', color: '#166534', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
              <Check size={14} strokeWidth={3} color={GREEN} /> Livraison standard offerte
            </div>
          )}

          <div style={{ height: 1, background: LINE, margin: '16px 0' }} />
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Total <span style={{ fontSize: 12, fontWeight: 400, color: FAINT }}>TVA incluse</span></span>
            <span style={{ fontSize: 19, fontWeight: 700 }}>{fmt(total)} TND</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 11.5, color: MUTE }}>
            <AlertCircle size={14} color={FAINT} style={{ flexShrink: 0 }} />
            Les articles ne sont pas réservés tant que la commande n'est pas validée.
          </div>
        </div>
      </div>

      {/* Espace pour la barre fixe + bottom nav */}
      <div style={{ height: 76 }} />

      {/* Barre d'action fixe */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 'calc(56px + env(safe-area-inset-bottom))', zIndex: 950, background: '#fff', borderTop: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
        <div onClick={toggleAll} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
          <Checkbox checked={allSelected} size={20} />
          <span style={{ fontSize: 12.5 }}>Tout</span>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          {savings > 0 && <div style={{ fontSize: 10.5, color: ORANGE, fontWeight: 600 }}>Économie {fmt(savings)} TND</div>}
          <div style={{ fontSize: 17, fontWeight: 800 }}>{fmt(total)} <span style={{ fontSize: 12, fontWeight: 400, color: MUTE }}>TND</span></div>
        </div>
        <button onClick={() => navigate('/checkout', { state: { itemIds: [...selected] } })} disabled={selCount === 0}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 22px', borderRadius: 26, border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: selCount ? 'pointer' : 'default', background: selCount ? 'linear-gradient(135deg,#FF6B35,#FF4500)' : '#DDD', boxShadow: selCount ? '0 4px 12px rgba(255,69,0,.28)' : 'none' }}>
          Commander ({selCount}) <ArrowRight size={16} />
        </button>
      </div>

      {confirmClear && (
        <div onClick={() => setConfirmClear(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 22, maxWidth: 320, width: '100%' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Vider le panier ?</div>
            <div style={{ fontSize: 13.5, color: MUTE, marginBottom: 20 }}>Tous les articles seront supprimés.</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setConfirmClear(false)} style={{ background: 'none', border: 'none', color: MUTE, fontWeight: 500, fontSize: 14, padding: '8px 14px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => { clear(); setConfirmClear(false) }} style={{ background: 'none', border: 'none', color: RED, fontWeight: 600, fontSize: 14, padding: '8px 14px', cursor: 'pointer' }}>Vider</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Ligne article (riche, comme le desktop) ──
function MobileRow({ item, selected, onToggle, onQty, onRemove }) {
  const p = item.product || {}
  const qty = Number(item.quantity) || 0
  const unit = parseFloat(item.unit_price_tnd) || 0
  const old = parseFloat(p.old_price_tnd) || 0
  const moq = Number(p.moq) || 1
  const stock = p.stock_qty != null ? Number(p.stock_qty) : null
  const lowStock = stock != null && stock > 0 && stock <= 5

  return (
    <div style={{ display: 'flex', gap: 10, padding: '14px', alignItems: 'flex-start' }}>
      <div style={{ paddingTop: 28 }}><Checkbox checked={selected} onClick={onToggle} size={20} /></div>
      <Link to={`/produit/${p.id}`} style={{ flexShrink: 0 }}>
        <div style={{ width: 84, height: 84, borderRadius: 10, overflow: 'hidden', background: '#F6F6F6' }}>
          {p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>📦</div>}
        </div>
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link to={`/produit/${p.id}`} style={{ fontSize: 13.5, fontWeight: 500, color: INK, lineHeight: 1.3, textDecoration: 'none', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</Link>

        {item.variant_data?.name && <div style={{ fontSize: 12, color: FAINT, marginTop: 3 }}>{item.variant_data.name}</div>}

        {lowStock && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FEF2F2', color: RED, borderRadius: 6, padding: '5px 9px', fontSize: 11, marginTop: 6, width: 'fit-content' }}>
            <AlertCircle size={12} /> Plus que {stock} en stock
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 7 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: GREEN }}><Truck size={12} /> Livraison sous {p.delivery_days || '2–5'} jours</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: MUTE }}><RotateCcw size={12} /> Retours acceptés sous 7 jours</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: INK }}>{fmt(unit * qty)} TND</span>
              {old > unit && <span style={{ fontSize: 11, color: '#BBB', textDecoration: 'line-through' }}>{fmt(old)}</span>}
            </div>
            <div style={{ fontSize: 11, color: FAINT, marginTop: 1 }}>{fmt(unit)} / {p.unit || 'pièce'}{qty <= moq ? ` · MOQ ${moq}` : ''}</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${LINE}`, borderRadius: 22 }}>
            <button onClick={() => onQty(qty - 1)} disabled={qty <= moq} style={step(qty <= moq)}><Minus size={14} /></button>
            <span style={{ minWidth: 30, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{qty}</span>
            <button onClick={() => onQty(qty + 1)} style={step(false)}><Plus size={14} /></button>
          </div>
          <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4C4C4', padding: 4, display: 'flex' }}><Trash2 size={16} /></button>
        </div>
      </div>
    </div>
  )
}

function Line({ label, value, valueColor = INK }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <span style={{ fontSize: 12.5, color: MUTE }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: valueColor }}>{value}</span>
    </div>
  )
}

const step = (disabled) => ({ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: disabled ? '#DDD' : INK, cursor: disabled ? 'default' : 'pointer' })

function Screen({ children }) {
  return <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>{children}</div>
}
function Spinner() {
  return <div style={{ width: 30, height: 30, border: `4px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gs-spin .8s linear infinite' }} />
}
function Prompt({ emoji, title, sub, to, cta }) {
  return (
    <div style={{ textAlign: 'center', padding: 24 }}>
      <div style={{ width: 96, height: 96, borderRadius: 26, background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, margin: '0 auto' }}>{emoji}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 18 }}>{title}</div>
      <div style={{ fontSize: 13, color: FAINT, marginTop: 6, marginBottom: 22 }}>{sub}</div>
      <Link to={to} style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 28, background: 'linear-gradient(135deg,#FF6B35,#FF4500)', color: '#fff', fontSize: 13.5, fontWeight: 700, textDecoration: 'none' }}>{cta}</Link>
    </div>
  )
}