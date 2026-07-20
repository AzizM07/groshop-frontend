// pages/CartPage.jsx — GROSHOP.tn
// Layout 2 colonnes : liste d'articles (groupés par fournisseur) + récap sticky centré verticalement.
// Section "Vous aimerez aussi" pleine largeur en bas.
// Logique conservée : sélection par cases, groupement fournisseur, MOQ, économies, checkout.
import { products as productsApi } from '../lib/api'
import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin, Trash2, Minus, Plus, Store, ChevronRight, ChevronDown,
  Truck, RotateCcw, AlertCircle, Tag, Lock, ArrowRight, Check,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'
import { useIsMobile } from '../hooks/useIsMobile'
import MobileCart from '../components/MobileCart'
/* ⚠️ Adapte cette ligne à ton endpoint réel de suggestions */
const RECO_URL = `${import.meta.env.VITE_API_URL || ''}/api/products/?ordering=-created_at&page_size=8`

const ORANGE = '#FF4500'
const INK    = '#1A1A1A'
const MUTE   = '#7A7A7A'
const FAINT  = '#A0A0A0'
const LINE   = '#E8E8E8'
const SOFT   = '#FFF0E8'
const GREEN  = '#0E9F6E'
const RED    = '#DC2626'
const BG     = '#FFFFFF'

const DISPLAY = "'Fraunces', Georgia, serif"
const BODY    = "'DM Sans', -apple-system, system-ui, sans-serif"

const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const CSS = `
.gs-grid {
  display: grid;
  grid-template-columns: minmax(0,1fr) 380px;
  gap: 32px;
  padding-top: 32px;
}
/* colonne droite : collée sous le header global et centrée verticalement dès le chargement */
.gs-sticky {
  position: sticky;
  top: var(--gs-off, 16px);
  height: calc(100vh - var(--gs-off, 16px) - 16px);
  display: flex;
  align-items: center;
}
.gs-sticky > div {
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
}
.gs-summary {
  min-height: min(56vh, 470px);
  display: flex;
  flex-direction: column;
}
/* en-tête colonne gauche : figé, seules les cartes produits défilent dessous.
   top = hauteur exacte du header global (--gs-off moins sa marge de 16px)
   pour qu'aucun pixel de carte ne passe entre les deux. */
.gs-head {
  position: sticky;
  top: calc(var(--gs-off, 16px) - 16px);
  z-index: 5;
  background: #fff;
  margin-top: -32px;
  padding-top: 32px;
}
.gs-reco {
  display: grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 16px;
}
@media (max-width: 900px) {
  .gs-grid { grid-template-columns: minmax(0,1fr); gap: 20px; }
  .gs-sticky { position: static; height: auto; display: block; }
  .gs-sticky > div { max-height: none; overflow: visible; }
  .gs-summary { min-height: 0; }
  .gs-head { position: static; margin-top: 0; padding-top: 0; }
  .gs-reco { grid-template-columns: repeat(2, minmax(0,1fr)); }
}
@keyframes gs-spin { to { transform: rotate(360deg) } }
`

/* Mesure la hauteur du header global sticky/fixed pour caler la colonne droite dessous.
   Si ton header n'est pas un <header>/<nav>, remplace le sélecteur ci-dessous. */
function useStickyOffset() {
  const [off, setOff] = useState(16)
  useEffect(() => {
    const calc = () => {
      let h = 0
      document.querySelectorAll('header, nav').forEach(el => {
        const pos = getComputedStyle(el).position
        const r = el.getBoundingClientRect()
        if ((pos === 'sticky' || pos === 'fixed') && r.top <= 1 && r.height > h) h = r.height
      })
      setOff(Math.round(h) + 16)
    }
    calc()
    const t = setTimeout(calc, 300)
    window.addEventListener('resize', calc)
    return () => { clearTimeout(t); window.removeEventListener('resize', calc) }
  }, [])
  return off
}

/* ── Case à cocher ronde ── */
function Checkbox({ checked, size = 20, onClick }) {
  return (
    <span
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: checked ? ORANGE : 'transparent',
        border: `2px solid ${checked ? ORANGE : '#CCCCCC'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'background .18s, border-color .18s',
      }}
    >
      {checked && <Check size={size * 0.6} color="#fff" strokeWidth={3} />}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════
function CartPageDesktop() {
  const { user, loading: authLoading } = useAuth()
  const { items, loading, setQty, remove, clear } = useCart()
  const navigate = useNavigate()

  const [selected, setSelected] = useState(new Set())
  const [confirmClear, setConfirmClear] = useState(false)
  const [promoOpen, setPromoOpen] = useState(false)
  const [promo, setPromo] = useState('')
  const stickyOff = useStickyOffset()

  /* Tout sélectionné par défaut, suit les ajouts/suppressions */
  useEffect(() => {
    setSelected(new Set(items.map(i => i.id)))
  }, [items.length])   // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id) => setSelected(s => {
    const n = new Set(s)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })

  /* ── Groupement par fournisseur ── */
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

  /* ── Totaux sur la sélection ── */
  const { total, savings, selCount, unitCount } = useMemo(() => {
    let t = 0, s = 0, n = 0, u = 0
    items.forEach(i => {
      if (!selected.has(i.id)) return
      const unit = parseFloat(i.unit_price_tnd) || 0
      const qty  = Number(i.quantity) || 0
      const old  = parseFloat(i.product?.old_price_tnd) || 0
      t += unit * qty
      if (old > unit) s += (old - unit) * qty
      n++
      u += qty
    })
    return { total: t, savings: s, selCount: n, unitCount: u }
  }, [items, selected])

  const allSelected = items.length > 0 && selected.size === items.length
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map(i => i.id)))

  const goCheckout = () => navigate('/checkout', { state: { itemIds: [...selected] } })

  /* ── États ── */
  if (authLoading) return <Shell><Center><Spinner /></Center></Shell>
  if (!user)       return <Shell><LoginPrompt /></Shell>
  if (loading && !items.length) return <Shell><Center><Spinner /></Center></Shell>
  if (!items.length) return <Shell><EmptyCart /></Shell>

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: BODY, color: INK }}>
      <style>{CSS}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 40px' }}>

        <div className="gs-grid" style={{ '--gs-off': `${stickyOff}px` }}>

          {/* ═══ Colonne gauche : titre + articles ═══ */}
          <div>
            {/* ── En-tête figé ── */}
            <div className="gs-head">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '0 2px 18px', flexWrap: 'wrap',
            }}>
              <h1 style={{
                margin: 0, fontFamily: BODY, fontSize: 34, fontWeight: 700,
                color: '#000', letterSpacing: -.6, lineHeight: 1.1,
              }}>
                Mon panier ({items.length})
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: SOFT, color: ORANGE, padding: '4px 10px',
                borderRadius: 999, fontSize: 11.5, fontWeight: 500,
              }}>
                <MapPin size={12} /> Tunisie
              </span>
              <div style={{ flex: 1 }} />
              <Link to="/" style={{
                fontSize: 13.5, fontWeight: 500, color: INK, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                Continuer mes achats <ArrowRight size={15} />
              </Link>
            </div>

            {/* Barre de sélection */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 2px 12px' }}>
              <div onClick={toggleAll} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Checkbox checked={allSelected} />
                <span style={{ fontSize: 13, fontWeight: 500, color: INK }}>Tout sélectionner</span>
              </div>
              <div style={{ flex: 1 }} />
              <button onClick={() => setConfirmClear(true)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: MUTE,
                  fontSize: 12.5, fontWeight: 500, fontFamily: BODY,
                  display: 'inline-flex', alignItems: 'center', gap: 5, padding: 4,
                }}>
                <Trash2 size={15} /> Vider le panier
              </button>
            </div>
            </div>
            {/* ── fin en-tête figé ── */}

            {groups.map(({ supplier, items: gItems }) => {
              const gIds = gItems.map(i => i.id)
              const gAll = gIds.every(id => selected.has(id))
              return (
                <div key={supplier?.id || 'unknown'} style={{
                  background: '#fff', borderRadius: 14, marginBottom: 14, overflow: 'hidden',
                  border: `1px solid ${LINE}`,
                }}>
                  {/* En-tête fournisseur */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px' }}>
                    <Checkbox checked={gAll} onClick={() => setSelected(s => {
                      const n = new Set(s)
                      gAll ? gIds.forEach(id => n.delete(id)) : gIds.forEach(id => n.add(id))
                      return n
                    })} />
                    <div style={{
                      width: 26, height: 26, borderRadius: 7, background: SOFT, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    }}>
                      {supplier?.logo_url
                        ? <img src={supplier.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <Store size={14} color={ORANGE} />}
                    </div>
                    <Link to={supplier?.slug ? `/fournisseur/${supplier.slug}` : '#'}
                      style={{
                        fontSize: 13.5, fontWeight: 600, color: INK, textDecoration: 'none',
                        display: 'flex', alignItems: 'center', gap: 3, minWidth: 0,
                      }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {supplier?.name || 'Fournisseur'}
                      </span>
                      <ChevronRight size={15} color={FAINT} />
                    </Link>
                  </div>

                  {gItems.map((item) => (
                    <div key={item.id}>
                      <div style={{ height: 1, background: '#F2F2F2', margin: '0 18px' }} />
                      <CartRow
                        item={item}
                        selected={selected.has(item.id)}
                        onToggle={() => toggle(item.id)}
                        onQty={(q) => setQty(item.id, q)}
                        onRemove={() => remove(item.id)}
                      />
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          {/* ═══ Colonne droite : récap sticky centré ═══ */}
          <aside>
            <div className="gs-sticky">
              <div>
                <div className="gs-summary" style={{
                  background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 24,
                }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 18, letterSpacing: .2 }}>
                    Récapitulatif
                  </div>

                  {/* Code promo */}
                  <div style={{ border: `1px solid ${LINE}`, borderRadius: 10, marginBottom: 16, overflow: 'hidden' }}>
                    <div onClick={() => setPromoOpen(o => !o)} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '11px 12px', cursor: 'pointer',
                    }}>
                      <Tag size={14} color={FAINT} />
                      <span style={{ fontSize: 12.5, color: MUTE, flex: 1 }}>Vous avez un code promo ?</span>
                      <ChevronDown size={15} color={FAINT} style={{
                        transform: promoOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s',
                      }} />
                    </div>
                    {promoOpen && (
                      <div style={{ display: 'flex', gap: 6, padding: '0 12px 12px' }}>
                        <input
                          value={promo}
                          onChange={e => setPromo(e.target.value.toUpperCase())}
                          placeholder="CODE"
                          style={{
                            flex: 1, minWidth: 0, border: `1px solid ${LINE}`, borderRadius: 8,
                            padding: '9px 10px', fontSize: 12.5, fontFamily: BODY, outline: 'none',
                            letterSpacing: .5, color: INK,
                          }}
                        />
                        <button style={{
                          background: INK, color: '#fff', border: 'none', borderRadius: 8,
                          padding: '0 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: BODY,
                        }}>
                          Appliquer
                        </button>
                      </div>
                    )}
                  </div>

                  <Line label={`Sous-total (${unitCount} ${unitCount > 1 ? 'articles' : 'article'})`} value={`${fmt(total)} TND`} />
                  <Line label="Livraison" value="Gratuite" valueColor={GREEN} />
                  {savings > 0 && <Line label="Économies" value={`− ${fmt(savings)} TND`} valueColor={ORANGE} />}

                  {savings > 0 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginTop: 14,
                      background: '#F0FDF4', color: '#166534', borderRadius: 8,
                      padding: '10px 12px', fontSize: 12,
                    }}>
                      <Check size={14} strokeWidth={3} color={GREEN} /> Livraison standard offerte
                    </div>
                  )}

                  <div style={{ flex: 1, minHeight: 16 }} />

                  <div style={{ height: 1, background: LINE, margin: '0 0 16px' }} />

                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>
                      Total <span style={{ fontSize: 12, fontWeight: 400, color: FAINT }}>TVA incluse</span>
                    </span>
                    <span style={{ fontSize: 19, fontWeight: 600, color: INK }}>{fmt(total)} TND</span>
                  </div>

                  <button
                    onClick={goCheckout}
                    disabled={selCount === 0}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      padding: '14px 18px', borderRadius: 12, border: 'none',
                      background: selCount ? 'linear-gradient(135deg,#FF6B35,#FF4500)' : '#DDDDDD',
                      color: '#fff', fontSize: 13.5, fontWeight: 700, letterSpacing: .3,
                      cursor: selCount ? 'pointer' : 'default',
                      boxShadow: selCount ? '0 4px 12px rgba(255,69,0,.28)' : 'none',
                      fontFamily: BODY, marginBottom: 8,
                    }}>
                    Commander ({selCount}) <ArrowRight size={16} />
                  </button>

                  <Link to="/" style={{
                    display: 'block', textAlign: 'center', padding: '12px 18px',
                    borderRadius: 12, border: `1px solid ${LINE}`,
                    fontSize: 13, fontWeight: 500, color: INK, textDecoration: 'none',
                  }}>
                    Continuer mes achats
                  </Link>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    marginTop: 14, fontSize: 11, color: FAINT,
                  }}>
                    <Lock size={12} /> Paiement sécurisé
                  </div>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 4px 0', fontSize: 11.5, color: MUTE,
                }}>
                  <AlertCircle size={14} color={FAINT} style={{ flexShrink: 0 }} />
                  Les articles ne sont pas réservés tant que la commande n'est pas validée.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ═══ Vous aimerez aussi — pleine largeur ═══ */}
      <RecoSection items={items} />

      {/* ── Confirmation vider ── */}
      {confirmClear && (
        <div onClick={() => setConfirmClear(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 18, padding: 24, maxWidth: 340, width: '100%',
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: INK, marginBottom: 8 }}>Vider le panier ?</div>
            <div style={{ fontSize: 13.5, color: MUTE, marginBottom: 22 }}>Tous les articles seront supprimés.</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setConfirmClear(false)} style={dialogBtn(MUTE)}>Annuler</button>
              <button onClick={() => { clear(); setConfirmClear(false) }} style={dialogBtn(RED, true)}>Vider</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function Line({ label, value, valueColor = INK }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <span style={{ fontSize: 12.5, fontWeight: 400, color: MUTE }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: valueColor }}>{value}</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function CartRow({ item, selected, onToggle, onQty, onRemove }) {
  const p    = item.product || {}
  const qty  = Number(item.quantity) || 0
  const unit = parseFloat(item.unit_price_tnd) || 0
  const old  = parseFloat(p.old_price_tnd) || 0
  const moq  = Number(p.moq) || 1
  const stock = p.stock_qty != null ? Number(p.stock_qty) : null
  const lowStock = stock != null && stock > 0 && stock <= 5

  return (
    <div style={{ display: 'flex', gap: 14, padding: 18, alignItems: 'flex-start' }}>
      <div style={{ paddingTop: 30 }}>
        <Checkbox checked={selected} onClick={onToggle} />
      </div>

      <Link to={`/produit/${p.id}`} style={{ flexShrink: 0 }}>
        <div style={{ width: 88, height: 88, borderRadius: 10, overflow: 'hidden', background: '#F6F6F6' }}>
          {p.image_url
            ? <img src={p.image_url} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📦</div>}
        </div>
      </Link>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Link to={`/produit/${p.id}`} style={{
          fontSize: 14.5, fontWeight: 500, color: INK, lineHeight: 1.35, textDecoration: 'none',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {p.name}
        </Link>

        {item.variant_data?.name && (
          <div style={{ fontSize: 12.5, fontWeight: 400, color: FAINT, marginTop: 4 }}>{item.variant_data.name}</div>
        )}

        {lowStock && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#FEF2F2', color: RED, borderRadius: 6,
            padding: '6px 10px', fontSize: 11.5, fontWeight: 400, marginTop: 8,
          }}>
            <AlertCircle size={12} /> Plus que {stock} en stock
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: GREEN }}>
            <Truck size={13} /> Livraison sous {p.delivery_days || '2–5'} jours
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: MUTE }}>
            <RotateCcw size={13} /> Retours acceptés sous 7 jours
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: INK }}>{fmt(unit * qty)} TND</span>
            <span style={{ fontSize: 11.5, color: FAINT }}>{fmt(unit)} / {p.unit || 'pièce'}</span>
            {old > unit && <span style={{ fontSize: 11.5, color: '#BBBBBB', textDecoration: 'line-through' }}>{fmt(old)}</span>}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center',
            background: '#fff', border: `1px solid ${LINE}`, borderRadius: 22,
          }}>
            <button onClick={() => onQty(qty - 1)} disabled={qty <= moq} style={stepBtn(qty <= moq)}>
              <Minus size={14} />
            </button>
            <span style={{ minWidth: 32, textAlign: 'center', fontSize: 13, fontWeight: 500, color: INK }}>{qty}</span>
            <button onClick={() => onQty(qty + 1)} style={stepBtn(false)}>
              <Plus size={14} />
            </button>
          </div>

          {qty <= moq && <span style={{ fontSize: 11, color: FAINT }}>MOQ {moq}</span>}

          <div style={{ flex: 1 }} />

          <button onClick={onRemove} title="Retirer"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4C4C4', padding: 4, display: 'flex' }}>
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Vous aimerez aussi — produits des fournisseurs du panier (même livraison),
// complétés par les recommandations personnalisées.
function RecoSection({ items }) {
  const [list, setList] = useState([])

  const supplierSlugs = useMemo(
    () => [...new Set(items.map(i => i.product?.supplier?.slug).filter(Boolean))],
    [items],
  )
  const inCartIds = useMemo(
    () => new Set(items.map(i => i.product?.id).filter(Boolean)),
    [items],
  )

  useEffect(() => {
    let alive = true

    async function load() {
      const seen = new Set()
      const out  = []

      const push = (arr) => {
        for (const p of arr || []) {
          if (out.length >= 4) return
          if (inCartIds.has(p.id) || seen.has(p.id)) continue
          seen.add(p.id)
          out.push(p)
        }
      }

      // 1. Même fournisseur → même livraison
      for (const slug of supplierSlugs.slice(0, 3)) {
        if (out.length >= 4) break
        try {
          const d = await productsApi.list({ supplier: slug, limit: 8 })
          push(d?.results)
        } catch { /* silencieux */ }
      }

      // 2. Complément : recommandations personnalisées
      if (out.length < 4) {
        try {
          const d = await productsApi.recommended()
          push(d?.results)
        } catch { /* silencieux */ }
      }

      if (alive) setList(out)
    }

    load()
    return () => { alive = false }
  }, [supplierSlugs, inCartIds])

  if (!list.length) return null

  return (
    <div style={{ borderTop: `1px solid ${LINE}`, background: '#FAFAFA' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 20px 44px' }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: INK }}>Vous aimerez aussi</div>
          {supplierSlugs.length > 0 && (
            <div style={{ fontSize: 12, color: MUTE, marginTop: 3 }}>
              Chez vos fournisseurs — ajoutés à la même livraison
            </div>
          )}
        </div>
        <div className="gs-reco">
          {list.map(p => <RecoCard key={p.id} p={p} />)}
        </div>
      </div>
    </div>
  )
}

function RecoCard({ p }) {
  // ⚡ champs réels de ProductListSerializer
  const price = parseFloat(p.base_price_tnd) || 0
  const old   = p.old_price_tnd ? parseFloat(p.old_price_tnd) : null

  return (
    <Link to={`/produit/${p.id}`} style={{
      display: 'block', background: '#fff', border: `1px solid ${LINE}`,
      borderRadius: 12, overflow: 'hidden', textDecoration: 'none',
    }}>
      <div style={{ aspectRatio: '1 / 1', background: '#F6F6F6' }}>
        {p.primary_image
          ? <img src={p.primary_image} alt={p.name} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📦</div>}
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{
          fontSize: 13.5, fontWeight: 500, color: INK, lineHeight: 1.35, minHeight: 36,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {p.name}
        </div>
        <div style={{
          fontSize: 11.5, color: FAINT, marginTop: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {p.supplier_name || ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: INK }}>{fmt(price)} TND</span>
          {old && old > price && (
            <span style={{ fontSize: 11.5, color: '#BBBBBB', textDecoration: 'line-through' }}>{fmt(old)}</span>
          )}
        </div>
        {p.moq && (
          <div style={{ fontSize: 11, color: FAINT, marginTop: 3 }}>MOQ {p.moq} {p.unit || ''}</div>
        )}
      </div>
    </Link>
  )
}

// ═══════════════════════════════════════════════════════════════════
const stepBtn = (disabled) => ({
  width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'none', border: 'none', color: disabled ? '#DDD' : INK,
  cursor: disabled ? 'default' : 'pointer',
})

const dialogBtn = (color, bold) => ({
  background: 'none', border: 'none', cursor: 'pointer',
  color, fontWeight: bold ? 600 : 500, fontSize: 14,
  padding: '8px 14px', borderRadius: 8, fontFamily: BODY,
})

function Shell({ children }) {
  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: BODY, display: 'flex', flexDirection: 'column' }}>
      <style>{CSS}</style>
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
    </div>
  )
}

function Center({ children }) {
  return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
}

function Spinner() {
  return (
    <div style={{
      width: 32, height: 32, border: `4px solid ${ORANGE}`, borderTopColor: 'transparent',
      borderRadius: '50%', animation: 'gs-spin .8s linear infinite',
    }} />
  )
}

function Bubble({ emoji }) {
  return (
    <div style={{
      width: 100, height: 100, borderRadius: 28, background: SOFT,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44,
    }}>{emoji}</div>
  )
}

function CtaButton({ to, children }) {
  return (
    <Link to={to} style={{
      display: 'inline-block', padding: '13px 30px', borderRadius: 30,
      background: 'linear-gradient(135deg,#FF6B35,#FF4500)', color: '#fff',
      fontSize: 13.5, fontWeight: 700, textDecoration: 'none',
      boxShadow: '0 4px 12px rgba(255,69,0,.28)', fontFamily: BODY,
    }}>{children}</Link>
  )
}

function EmptyCart() {
  return (
    <Center>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Bubble emoji="🛒" /></div>
        <div style={{ fontSize: 19, fontWeight: 600, color: INK, marginTop: 20 }}>Panier vide</div>
        <div style={{ fontSize: 13, color: FAINT, marginTop: 6, marginBottom: 24 }}>Ajoutez des produits pour commander</div>
        <CtaButton to="/">Découvrir les produits</CtaButton>
      </div>
    </Center>
  )
}

function LoginPrompt() {
  return (
    <Center>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Bubble emoji="🔒" /></div>
        <div style={{ fontSize: 19, fontWeight: 600, color: INK, marginTop: 20 }}>Connectez-vous</div>
        <div style={{ fontSize: 13, color: FAINT, marginTop: 6, marginBottom: 24 }}>pour voir votre panier</div>
        <CtaButton to="/login">Se connecter</CtaButton>
      </div>
    </Center>
  )
}
export default function CartPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileCart /> : <CartPageDesktop />
}