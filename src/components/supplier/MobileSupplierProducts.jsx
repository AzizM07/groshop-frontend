// src/components/supplier/MobileSupplierProducts.jsx — GROSHOP.tn
// Version téléphone de la page Produits. Le tableau devient une liste de
// cartes ; le bouton « Nouveau produit » disparaît au profit du FAB de la
// nav basse, qui pointe déjà vers /supplier/products/new.

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { products as productsApi } from '../../lib/api'

/* Seule teinte orange du projet. */
const ORANGE      = '#ff5e20'
const ORANGE_TINT = 'rgba(255, 94, 32, .12)'

const INK='#0F1419', MUTE='#6B7280', FAINT='#9AA3AE', RED='#EF4444'
const FONT='"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const STATUS_STYLES = {
  draft:          { label: 'Brouillon',  color: MUTE,      bg: '#F3F4F6', icon: 'FileEdit' },
  pending_review: { label: 'En attente', color: '#D97706', bg: '#FEF3C7', icon: 'Clock' },
  approved:       { label: 'Approuvé',   color: '#059669', bg: '#D1FAE5', icon: 'CheckCircle2' },
  rejected:       { label: 'Rejeté',     color: RED,       bg: '#FEE2E2', icon: 'XCircle' },
}

const FILTERS = [
  { key: 'all',            label: 'Tous' },
  { key: 'approved',       label: 'Approuvés' },
  { key: 'pending_review', label: 'En attente' },
  { key: 'draft',          label: 'Brouillons' },
  { key: 'rejected',       label: 'Rejetés' },
]

const PAGE_SIZE = 12
const fmt = (n) => Number(n || 0).toLocaleString('fr-FR')

// ═══════════════════════════════════════════════════════════════════
export default function MobileSupplierProducts() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    let alive = true
    setLoading(true)
    productsApi.mine()
      .then((data) => { if (alive) setItems(Array.isArray(data) ? data : (data?.results || [])) })
      .catch((e) => { if (alive) setError(e.message || 'Erreur de chargement') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  useEffect(() => { setVisible(PAGE_SIZE) }, [search, filter])

  const counts = useMemo(() => {
    const c = { all: items.length }
    items.forEach((p) => { c[p.status] = (c[p.status] || 0) + 1 })
    return c
  }, [items])

  const filtered = useMemo(() => items.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false
    if (search && !(p.name || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [items, search, filter])

  const rows = filtered.slice(0, visible)

  const stats = useMemo(() => {
    const inStock = items.reduce((s, p) => s + (Number(p.stock_qty) || 0), 0)
    const sold    = items.reduce((s, p) => s + (Number(p.sold_count) || 0), 0)
    return [
      { label: 'Produits',   value: String(items.length),        sub: 'au total' },
      { label: 'Approuvés',  value: String(counts.approved || 0), sub: 'en ligne' },
      { label: 'Stock',      value: fmt(inStock),                 sub: 'unités' },
      { label: 'Ventes',     value: fmt(sold),                    sub: 'vendues' },
    ]
  }, [items, counts])

  return (
    <div style={{ fontFamily: FONT }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
        Produits
      </h1>
      <p style={{ margin: '0 0 16px', fontSize: 12.5, color: MUTE }}>
        {items.length} produit{items.length > 1 ? 's' : ''} dans votre catalogue.
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
        <input type="text" placeholder="Rechercher un produit…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, width: '100%', color: INK }} />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', cursor: 'pointer' }}><Icons.X size={14} color={FAINT} /></button>}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 12, scrollbarWidth: 'none' }}>
        {FILTERS.map((f) => {
          const on = f.key === filter
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: on ? ORANGE_TINT : '#fff',
                color: on ? ORANGE : FAINT,
                fontWeight: on ? 700 : 500, fontSize: 11.5,
                padding: '7px 13px', borderRadius: 20,
                boxShadow: on ? 'none' : 'inset 0 0 0 1px #EFECE4',
              }}>
              {f.label}
              <span style={{ fontSize: 10, fontWeight: 700, opacity: on ? 1 : 0.7 }}>{counts[f.key] || 0}</span>
            </button>
          )
        })}
      </div>

      {/* Liste */}
      {loading ? (
        [...Array(5)].map((_, i) => (
          <div key={i} style={{ ...cardStyle, marginBottom: 8, display: 'flex', gap: 10 }}>
            <Skel h={48} w={48} style={{ borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}><Skel h={11} w="60%" /><div style={{ height: 6 }} /><Skel h={9} w="40%" /></div>
          </div>
        ))
      ) : error ? (
        <StateBox icon="AlertTriangle" title="Erreur de chargement" sub={error} />
      ) : rows.length === 0 ? (
        items.length === 0
          ? <StateBox icon="PackagePlus" title="Aucun produit" sub="Utilise le bouton + pour en ajouter un." />
          : <StateBox icon="PackageSearch" title="Aucun résultat" sub="Essaie une autre recherche." />
      ) : (
        <>
          {rows.map((p) => <ProductCard key={p.id} product={p} />)}

          {visible < filtered.length && (
            <button onClick={() => setVisible(v => v + PAGE_SIZE)}
              style={{
                width: '100%', padding: '12px', marginTop: 4,
                background: '#fff', border: '1px solid #EFECE4', borderRadius: 14,
                fontSize: 12.5, fontWeight: 600, color: INK, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              Charger plus ({filtered.length - visible} restants)
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function ProductCard({ product }) {
  const st = STATUS_STYLES[product.status] || STATUS_STYLES.draft
  const StIcon = Icons[st.icon] || Icons.Circle
  const stock = Number(product.stock_qty) || 0

  return (
    <Link to={`/supplier/products/${product.id}/edit`}
      style={{ ...cardStyle, marginBottom: 8, display: 'flex', gap: 11, textDecoration: 'none' }}>

      <div style={{
        width: 52, height: 52, borderRadius: 12, background: '#F5F3EE',
        flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {product.primary_image
          ? <img src={product.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Icons.Package size={20} color="#B8BCC4" strokeWidth={1.8} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </div>

        <div style={{ fontSize: 10.5, color: FAINT, marginTop: 3, display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <Icons.Star size={10} fill="#FFB800" stroke="#FFB800" />
          <span style={{ color: INK, fontWeight: 600 }}>{Number(product.rating_avg || 0).toFixed(1)}</span>
          <span>· {product.rating_count || 0} avis</span>
          {product.category_name && <><span>·</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.category_name}</span></>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 7, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: ORANGE, fontVariantNumeric: 'tabular-nums' }}>
            {Number(product.base_price_tnd || 0).toFixed(3)}
            <span style={{ fontSize: 9, color: FAINT, marginLeft: 3, fontWeight: 500 }}>TND</span>
          </span>

          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: st.bg, color: st.color,
            padding: '2px 8px', borderRadius: 999, fontSize: 9.5, fontWeight: 700,
          }}>
            <StIcon size={10} strokeWidth={2.4} />
            {st.label}
          </span>

          <span style={{ fontSize: 10, color: stock > 0 ? FAINT : RED, fontWeight: stock > 0 ? 500 : 700 }}>
            {stock > 0 ? `${fmt(stock)} en stock` : 'Épuisé'}
          </span>
        </div>
      </div>

      <Icons.ChevronRight size={16} color="#C7CBD1" strokeWidth={2} style={{ flexShrink: 0, alignSelf: 'center' }} />
    </Link>
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