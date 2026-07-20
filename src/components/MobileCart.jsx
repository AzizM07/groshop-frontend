// src/components/MobileCart.jsx
import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Heart, Trash2, Minus, Plus, Store, Check, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const ORANGE = '#FF4500'
const INK = '#1A1A1A', MUTE = '#7A7A7A', FAINT = '#A0A0A0', LINE = '#EDEDED', SOFT = '#FFF0E8', GREEN = '#0E9F6E', RED = '#DC2626'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function Checkbox({ checked, size = 22, onClick }) {
  return (
    <span onClick={onClick} style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: checked ? ORANGE : 'transparent',
      border: `2px solid ${checked ? ORANGE : '#CCC'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    }}>{checked && <Check size={size * 0.6} color="#fff" strokeWidth={3} />}</span>
  )
}

export default function MobileCart() {
  const { user, loading: authLoading } = useAuth()
  const { items, loading, setQty, remove, clear } = useCart()
  const navigate = useNavigate()

  const [selected, setSelected] = useState(new Set())
  const [confirmClear, setConfirmClear] = useState(false)

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

  const { total, selCount, unitCount } = useMemo(() => {
    let t = 0, n = 0, u = 0
    items.forEach(i => {
      if (!selected.has(i.id)) return
      t += (parseFloat(i.unit_price_tnd) || 0) * (Number(i.quantity) || 0); n++; u += Number(i.quantity) || 0
    })
    return { total: t, selCount: n, unitCount: u }
  }, [items, selected])

  const allSelected = items.length > 0 && selected.size === items.length
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map(i => i.id)))

  // ── États ──
  if (authLoading || (loading && !items.length)) return <Screen><Spinner /></Screen>
  if (!user) return <Screen><Prompt emoji="🔒" title="Connectez-vous" sub="pour voir votre panier" to="/login" cta="Se connecter" /></Screen>
  if (!items.length) return <Screen><Prompt emoji="🛒" title="Panier vide" sub="Ajoutez des produits pour commander" to="/" cta="Découvrir les produits" /></Screen>

  return (
    <div style={{ fontFamily: FONT, color: INK, background: '#F4F5F7', minHeight: '100%' }}>

      {/* Barre titre */}
      <div style={{ position: 'sticky', top: 56, zIndex: 40, background: '#fff', borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
        <span style={{ fontSize: 20, fontWeight: 800 }}>Panier ({items.length})</span>
        <div style={{ flex: 1 }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12.5, color: MUTE }}><MapPin size={14} /> Tunisie</span>
        <Link to="/dashboard/favoris" style={{ color: INK, display: 'flex' }}><Heart size={20} /></Link>
        <button onClick={() => setConfirmClear(true)} style={{ background: 'none', border: 'none', color: INK, cursor: 'pointer', display: 'flex', padding: 0 }}><Trash2 size={20} /></button>
      </div>

      {/* Liste par fournisseur */}
      <div style={{ padding: '10px 10px 96px' }}>
        {groups.map(({ supplier, items: gItems }) => {
          const gIds = gItems.map(i => i.id)
          const gAll = gIds.every(id => selected.has(id))
          return (
            <div key={supplier?.id || 'unknown'} style={{ background: '#fff', borderRadius: 12, marginBottom: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                <Checkbox checked={gAll} onClick={() => setSelected(s => { const n = new Set(s); gAll ? gIds.forEach(id => n.delete(id)) : gIds.forEach(id => n.add(id)); return n })} />
                <div style={{ width: 24, height: 24, borderRadius: 6, background: SOFT, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {supplier?.logo_url ? <img src={supplier.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Store size={13} color={ORANGE} />}
                </div>
                <Link to={supplier?.slug ? `/fournisseur/${supplier.slug}` : '#'} style={{ fontSize: 14, fontWeight: 700, color: INK, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {supplier?.name || 'Fournisseur'}
                </Link>
              </div>

              {gItems.map(item => {
                const p = item.product || {}
                const qty = Number(item.quantity) || 0
                const unit = parseFloat(item.unit_price_tnd) || 0
                const old = parseFloat(p.old_price_tnd) || 0
                const moq = Number(p.moq) || 1
                return (
                  <div key={item.id} style={{ display: 'flex', gap: 10, padding: '12px 14px', borderTop: `1px solid #F4F4F4`, alignItems: 'flex-start' }}>
                    <div style={{ paddingTop: 26 }}><Checkbox checked={selected.has(item.id)} onClick={() => toggle(item.id)} /></div>
                    <Link to={`/produit/${p.id}`} style={{ flexShrink: 0 }}>
                      <div style={{ width: 82, height: 82, borderRadius: 10, overflow: 'hidden', background: '#F6F6F6' }}>
                        {p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>📦</div>}
                      </div>
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={`/produit/${p.id}`} style={{ fontSize: 13.5, fontWeight: 500, color: INK, lineHeight: 1.3, textDecoration: 'none', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</Link>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: ORANGE }}>{fmt(unit)} <span style={{ fontSize: 11, color: MUTE, fontWeight: 400 }}>TND</span></span>
                        {old > unit && <span style={{ fontSize: 11.5, color: '#BBB', textDecoration: 'line-through' }}>{fmt(old)}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
                        {qty <= moq && <span style={{ fontSize: 11, color: FAINT }}>MOQ {moq}</span>}
                        <div style={{ flex: 1 }} />
                        <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${LINE}`, borderRadius: 20 }}>
                          <button onClick={() => setQty(item.id, qty - 1)} disabled={qty <= moq} style={step(qty <= moq)}><Minus size={14} /></button>
                          <span style={{ minWidth: 30, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{qty}</span>
                          <button onClick={() => setQty(item.id, qty + 1)} style={step(false)}><Plus size={14} /></button>
                        </div>
                        <button onClick={() => remove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4C4C4', padding: '0 0 0 12px', display: 'flex' }}><Trash2 size={17} /></button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Barre d'action fixe (au-dessus du bottom nav) */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 'calc(56px + env(safe-area-inset-bottom))', zIndex: 950, background: '#fff', borderTop: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
        <div onClick={toggleAll} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
          <Checkbox checked={allSelected} size={20} />
          <span style={{ fontSize: 12.5, color: INK }}>Tout</span>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: INK }}>{fmt(total)} <span style={{ fontSize: 12, fontWeight: 400, color: MUTE }}>TND</span></div>
        </div>
        <button onClick={() => navigate('/checkout', { state: { itemIds: [...selected] } })} disabled={selCount === 0}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 22px', borderRadius: 26, border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: selCount ? 'pointer' : 'default', background: selCount ? 'linear-gradient(135deg,#FF6B35,#FF4500)' : '#DDD' }}>
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