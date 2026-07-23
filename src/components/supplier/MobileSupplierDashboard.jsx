// src/components/supplier/MobileSupplierDashboard.jsx — GROSHOP.tn
// Version téléphone du dashboard fournisseur, layout SellRecord.
// Reprend toutes les cartes du desktop :
//   - KPI 2×2       ← KPIRow desktop
//   - Ventes        ← CustomerGrowthChart
//   - Visiteurs     ← VisitorsChart
//   - Vues produits ← ProductViewsChart
//   - Activité      ← OrdersList

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { orders as ordersApi, products as productsApi, analytics as analyticsApi } from '../../lib/api'

/* Seule teinte orange du projet. */
const ORANGE      = '#ff5e20'
const ORANGE_TINT = 'rgba(255, 94, 32, .10)'
const ORANGE_SOFT = 'rgba(255, 94, 32, .28)'   // barres secondaires

const INK='#0F1419', MUTE='#6B7280', FAINT='#9AA3AE', LINE='#F0EDE5'
const GREEN='#059669', RED='#DC2626'
const FONT='"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const fmt    = (n) => Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })
const fmtDec = (n) => Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 3 })
const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

function pctChange(cur, prev) {
  if (!prev) return cur ? 100 : 0
  return ((cur - prev) / prev) * 100
}
function fmtTrend(v) {
  const r = Math.round(v * 10) / 10
  return `${r > 0 ? '+' : ''}${r.toLocaleString('fr-FR')}%`
}

function Skel({ h = 14, w = '100%', style }) {
  return <div style={{ height: h, width: w, background: '#EFECE4', borderRadius: 6, animation: 'gs-pulse 1.4s infinite', ...style }} />
}

if (typeof document !== 'undefined' && !document.getElementById('gs-dash-pulse')) {
  const s = document.createElement('style')
  s.id = 'gs-dash-pulse'
  s.textContent = `@keyframes gs-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }`
  document.head.appendChild(s)
}

// ═══════════════════════════════════════════════════════════════════
export default function MobileSupplierDashboard() {
  const [subOrders, setSubOrders] = useState([])
  const [prods, setProds]         = useState([])
  const [stats, setStats]         = useState(null)

  const [loadOrders, setLoadOrders] = useState(true)
  const [loadProds,  setLoadProds]  = useState(true)
  const [loadStats,  setLoadStats]  = useState(true)

  useEffect(() => {
    let alive = true
    const go = (p, set, done) => p
      .then(d => { if (alive) set(d) })
      .catch(() => {})
      .finally(() => { if (alive) done(false) })

    go(ordersApi.supplier(),         d => setSubOrders(d?.results || (Array.isArray(d) ? d : [])), setLoadOrders)
    go(productsApi.mine(),           d => setProds(Array.isArray(d) ? d : (d?.results || [])),     setLoadProds)
    go(analyticsApi.supplierStats(), setStats, setLoadStats)
    return () => { alive = false }
  }, [])

  return (
    <div style={{ fontFamily: FONT }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
        Dashboard
      </h1>
      <p style={{ margin: '0 0 16px', fontSize: 12.5, color: MUTE }}>
        Suivez vos ventes et vos produits.
      </p>

      <KPIGrid subOrders={subOrders} prods={prods} loadOrders={loadOrders} loadProds={loadProds} />
      <SalesChart subOrders={subOrders} loading={loadOrders} />
      <VisitorsCard stats={stats} loading={loadStats} />
      <ProductViewsCard stats={stats} loading={loadStats} />
      <RecentActivity subOrders={subOrders} loading={loadOrders} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// KPI — grille 2×2
// ═══════════════════════════════════════════════════════════════════
function KPIGrid({ subOrders, prods, loadOrders, loadProds }) {
  const k = useMemo(() => {
    const paid = subOrders.filter(o => o.status !== 'cancelled')
    const now  = new Date()
    const mS   = new Date(now.getFullYear(), now.getMonth(), 1)
    const pS   = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const inR  = (o, a, b) => { const d = new Date(o.created_at); return d >= a && (!b || d < b) }
    const sum  = (a) => a.reduce((s, o) => s + Number(o.subtotal_tnd || 0), 0)

    const curM = paid.filter(o => inR(o, mS, null))
    const prvM = paid.filter(o => inR(o, pS, mS))

    const buyersAll  = new Set(paid.map(o => o.buyer_name).filter(Boolean))
    const buyersCur  = new Set(curM.map(o => o.buyer_name).filter(Boolean))
    const buyersPrev = new Set(prvM.map(o => o.buyer_name).filter(Boolean))

    return {
      revenue:      sum(paid),
      revenueTrend: pctChange(sum(curM), sum(prvM)),
      orders:       subOrders.length,
      ordersTrend:  pctChange(curM.length, prvM.length),
      clients:      buyersAll.size,
      clientsTrend: pctChange(buyersCur.size, buyersPrev.size),
    }
  }, [subOrders])

  const activeProds = useMemo(() => prods.filter(p => p.status === 'approved').length, [prods])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
      <KPICard label="Chiffre d'affaires" value={fmt(k.revenue)} unit="TND"
               trend={fmtTrend(k.revenueTrend)} trendUp={k.revenueTrend >= 0}
               subtitle="ce mois" loading={loadOrders} to="/supplier/stats" />
      <KPICard label="Commandes" value={fmt(k.orders)}
               trend={fmtTrend(k.ordersTrend)} trendUp={k.ordersTrend >= 0}
               subtitle="ce mois" loading={loadOrders} to="/supplier/orders" />
      <KPICard label="Clients" value={fmt(k.clients)}
               trend={fmtTrend(k.clientsTrend)} trendUp={k.clientsTrend >= 0}
               subtitle="uniques" loading={loadOrders} to="/supplier/orders" />
      <KPICard label="Produits actifs" value={fmt(activeProds)}
               note={`${prods.length} au total`}
               loading={loadProds} to="/supplier/products" />
    </div>
  )
}

function KPICard({ label, value, unit, trend, trendUp, subtitle, note, loading, to }) {
  /* La valeur rétrécit quand elle s'allonge : sur 2 colonnes de téléphone,
     un CA à 6 chiffres déborderait sinon. */
  const len = String(value).replace(/\s/g, '').length
  const size = len <= 3 ? 26 : len <= 5 ? 22 : 18

  return (
    <Link to={to} style={{
      background: '#fff', borderRadius: 16, padding: 13,
      textDecoration: 'none', display: 'block',
      border: '1px solid #EFECE4',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ flex: 1, fontSize: 11, color: MUTE, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <Icons.MoreHorizontal size={14} color="#C7CBD1" strokeWidth={2.2} style={{ flexShrink: 0 }} />
      </div>

      {loading ? (
        <div style={{ margin: '10px 0 8px' }}><Skel h={22} w="65%" /></div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8,
          fontSize: size, fontWeight: 800, color: INK, letterSpacing: '-0.035em', lineHeight: 1,
        }}>
          {value}
          {unit && <span style={{ fontSize: Math.round(size * 0.42), color: FAINT, fontWeight: 500 }}>{unit}</span>}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, minHeight: 14 }}>
        {loading ? <Skel h={12} w={60} /> : trend ? (
          <>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 700, color: trendUp ? GREEN : RED }}>
              {trendUp ? <Icons.TrendingUp size={10} strokeWidth={2.6} /> : <Icons.TrendingDown size={10} strokeWidth={2.6} />}
              {trend}
            </span>
            {subtitle && <span style={{ fontSize: 10, color: FAINT }}>{subtitle}</span>}
          </>
        ) : (
          <span style={{ fontSize: 10, color: FAINT }}>{note}</span>
        )}
      </div>
    </Link>
  )
}

// ═══════════════════════════════════════════════════════════════════
// VENTES — courbe lissée
// ═══════════════════════════════════════════════════════════════════
function SalesChart({ subOrders, loading }) {
  const [period, setPeriod] = useState('Mensuel')
  const [hovered, setHovered] = useState(null)

  const data = useMemo(() => {
    const out = []
    const now = new Date()
    const bucket = (s, e, label) => ({
      month: label,
      value: subOrders
        .filter(o => { const d = new Date(o.created_at); return d >= s && d < e && o.status !== 'cancelled' })
        .reduce((a, o) => a + Number(o.subtotal_tnd || 0), 0),
    })
    if (period === 'Mensuel') {
      for (let i = 5; i >= 0; i--) {
        const s = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        out.push(bucket(s, e, s.toLocaleDateString('fr-FR', { month: 'short' })))
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const e = new Date(now); e.setDate(e.getDate() - i * 7 + 1); e.setHours(0, 0, 0, 0)
        const s = new Date(e);   s.setDate(s.getDate() - 7)
        out.push(bucket(s, e, s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })))
      }
    }
    return out
  }, [subOrders, period])

  const trend = useMemo(() => {
    if (data.length < 2) return 0
    return pctChange(data[data.length - 1].value, data[data.length - 2].value)
  }, [data])

  const hasData = data.some(d => d.value > 0)

  const W = 320, H = 130
  const pad = { top: 10, right: 10, bottom: 22, left: 34 }
  const cw = W - pad.left - pad.right
  const ch = H - pad.top - pad.bottom
  const rawMax = Math.max(...data.map(d => d.value), 1)
  const maxValue = Math.ceil(rawMax / 4 / 100) * 100 * 4 || 4

  const pts = data.map((d, i) => ({
    x: pad.left + (data.length === 1 ? cw / 2 : (i / (data.length - 1)) * cw),
    y: pad.top + ch - (d.value / maxValue) * ch,
  }))

  const smooth = (p) => {
    if (p.length < 2) return ''
    let path = `M ${p[0].x} ${p[0].y}`
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2
      path += ` C ${p1.x + (p2.x - p0.x) / 6},${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6},${p2.y - (p3.y - p1.y) / 6} ${p2.x},${p2.y}`
    }
    return path
  }
  const line = smooth(pts)
  const baseY = pad.top + ch
  const area = hasData ? line + ` L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z` : ''
  const yTicks = [0, 0.5, 1].map(t => Math.round(maxValue * t))

  const onMove = (e) => {
    if (!hasData) return
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * W
    const step = cw / Math.max(data.length - 1, 1)
    setHovered(Math.max(0, Math.min(data.length - 1, Math.round((mx - pad.left) / step))))
  }

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>Ventes</span>
        {!loading && hasData && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10.5, fontWeight: 700, color: trend >= 0 ? GREEN : RED }}>
            {trend >= 0 ? <Icons.TrendingUp size={10} strokeWidth={2.6} /> : <Icons.TrendingDown size={10} strokeWidth={2.6} />}
            {fmtTrend(trend)}
          </span>
        )}
        <span style={{ flex: 1 }} />
        <button onClick={() => setPeriod(p => p === 'Mensuel' ? 'Hebdo' : 'Mensuel')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            border: '1px solid #EAE7DF', background: '#fff', borderRadius: 20,
            padding: '5px 11px', fontSize: 10.5, color: MUTE, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
          <Icons.Calendar size={11} strokeWidth={2} />
          {period}
        </button>
      </div>

      {loading ? <Skel h={110} />
        : !hasData ? <Empty icon="LineChart" text="Aucune vente enregistrée." />
        : (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet"
               style={{ display: 'block', cursor: 'crosshair' }}
               onMouseMove={onMove} onMouseLeave={() => setHovered(null)}>
            <defs>
              <linearGradient id="msArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ORANGE} stopOpacity="0.20" />
                <stop offset="100%" stopColor={ORANGE} stopOpacity="0" />
              </linearGradient>
            </defs>

            {yTicks.map(v => {
              const y = pad.top + ch - (v / maxValue) * ch
              return (
                <g key={v}>
                  <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke={LINE} strokeWidth="1" />
                  <text x={pad.left - 6} y={y + 3} textAnchor="end" fontSize="8.5" fill={FAINT} fontFamily="DM Sans" fontWeight="500">
                    {v === 0 ? '0' : v >= 1000 ? `${(v / 1000).toLocaleString('fr-FR')}k` : v}
                  </text>
                </g>
              )
            })}

            <path d={area} fill="url(#msArea)" style={{ pointerEvents: 'none' }} />
            <path d={line} stroke={ORANGE} strokeWidth="2.4" fill="none" strokeLinecap="round" style={{ pointerEvents: 'none' }} />

            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i === hovered ? 4.5 : 3}
                fill={ORANGE} stroke="#fff" strokeWidth={i === hovered ? 2 : 1.5}
                style={{ pointerEvents: 'none' }} />
            ))}

            {hovered !== null && pts[hovered] && (
              <g style={{ pointerEvents: 'none' }}>
                <rect x={Math.min(Math.max(pts[hovered].x - 38, 2), W - 78)} y={Math.max(pts[hovered].y - 30, 2)}
                      width="76" height="22" rx="11" fill={INK} />
                <text x={Math.min(Math.max(pts[hovered].x, 40), W - 40)} y={Math.max(pts[hovered].y - 15, 17)}
                      textAnchor="middle" fontSize="10" fill="#fff" fontWeight="600" fontFamily="DM Sans">
                  {fmt(data[hovered].value)} TND
                </text>
              </g>
            )}

            {data.map((d, i) => (
              <text key={i} x={pts[i].x} y={H - 6} textAnchor="middle" fontSize="9.5"
                    fill={i === hovered ? INK : FAINT} fontWeight={i === hovered ? 600 : 500}
                    fontFamily="DM Sans" style={{ pointerEvents: 'none' }}>
                {d.month}
              </text>
            ))}
          </svg>
        )}
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// VISITEURS — barres 7 jours
// ═══════════════════════════════════════════════════════════════════
function VisitorsCard({ stats, loading }) {
  const [hovered, setHovered] = useState(null)

  const { data, total, trend } = useMemo(() => {
    const src = stats?.views_by_day || []
    const map = Object.fromEntries(src.map(r => [r.date, r]))
    const now = new Date()
    const build = (offset) => {
      const out = []
      for (let i = 6 + offset; i >= offset; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        out.push({ day: DAY_LABELS[d.getDay()], visitors: map[key]?.uniques ?? 0, views: map[key]?.views ?? 0 })
      }
      return out
    }
    const cur = build(0), prev = build(7)
    const sum = (a) => a.reduce((s, d) => s + d.visitors, 0)
    return { data: cur, total: sum(cur), trend: pctChange(sum(cur), sum(prev)) }
  }, [stats])

  const hasData = data.some(d => d.visitors > 0)
  const W = 320, H = 120
  const pad = { top: 22, bottom: 20, left: 4, right: 4 }
  const cw = W - pad.left - pad.right
  const ch = H - pad.top - pad.bottom
  const barW = 22
  const maxValue = Math.max(...data.map(d => d.visitors), 1)

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>Visiteurs</span>
        <span style={{ flex: 1 }} />
        <Link to="/supplier/stats" style={{ fontSize: 11.5, color: ORANGE, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          Voir plus <Icons.ArrowRight size={11} strokeWidth={2.4} />
        </Link>
      </div>

      {loading ? <div style={{ marginTop: 10 }}><Skel h={100} /></div>
        : !hasData ? <Empty icon="Users" text="Aucune visite enregistrée." />
        : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: INK, letterSpacing: '-0.03em' }}>{fmt(total)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10.5, fontWeight: 700, color: trend >= 0 ? GREEN : RED }}>
                {trend >= 0 ? <Icons.TrendingUp size={10} strokeWidth={2.6} /> : <Icons.TrendingDown size={10} strokeWidth={2.6} />}
                {fmtTrend(trend)}
              </span>
              <span style={{ fontSize: 10.5, color: FAINT }}>uniques · 7 j</span>
            </div>

            <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
              {data.map((d, i) => {
                const x = pad.left + (i + 0.5) * (cw / data.length) - barW / 2
                const h = d.visitors > 0 ? Math.max((d.visitors / maxValue) * ch, 4) : 0
                const y = pad.top + ch - h
                const on = i === hovered
                const tipX = Math.min(Math.max(x + barW / 2, 34), W - 34)

                return (
                  <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                    <rect x={x - 5} y={pad.top} width={barW + 10} height={ch} fill="transparent" />
                    <rect x={x} y={y} width={barW} height={h} rx={9}
                          fill={on ? ORANGE : ORANGE_TINT} style={{ transition: 'fill .15s' }} />
                    {on && (
                      <g style={{ pointerEvents: 'none' }}>
                        <rect x={tipX - 30} y={Math.max(y - 26, 2)} width="60" height="20" rx="10" fill={INK} />
                        <text x={tipX} y={Math.max(y - 12, 16)} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700" fontFamily="DM Sans">
                          {d.visitors} · {d.views} v
                        </text>
                      </g>
                    )}
                    <text x={x + barW / 2} y={H - 5} textAnchor="middle" fontSize="9.5"
                          fill={on ? INK : FAINT} fontWeight={on ? 600 : 500}
                          fontFamily="DM Sans" style={{ pointerEvents: 'none' }}>
                      {d.day}
                    </text>
                  </g>
                )
              })}
            </svg>
          </>
        )}
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// VUES PRODUITS — 7 jours, cette semaine vs semaine dernière
// Sur 320 px, 7 groupes × 2 barres tient si les barres sont fines (8 px).
// ═══════════════════════════════════════════════════════════════════
function ProductViewsCard({ stats, loading }) {
  const [hovered, setHovered] = useState(null)

  const data = useMemo(() => {
    const src = stats?.product_views_by_day || []
    const map = Object.fromEntries(src.map(r => [r.date, r.views]))
    const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const now = new Date()
    const out = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i)
      const p = new Date(now); p.setDate(p.getDate() - i - 7)
      out.push({ day: DAY_LABELS[d.getDay()], thisWeek: map[key(d)] ?? 0, lastWeek: map[key(p)] ?? 0 })
    }
    return out
  }, [stats])

  const totals = useMemo(() => {
    const sum = (k) => data.reduce((s, d) => s + d[k], 0)
    return { cur: sum('thisWeek'), prev: sum('lastWeek') }
  }, [data])

  const trend = pctChange(totals.cur, totals.prev)
  const hasData = totals.cur > 0 || totals.prev > 0

  const W = 320, H = 140
  const pad = { top: 10, bottom: 22, left: 30, right: 6 }
  const cw = W - pad.left - pad.right
  const ch = H - pad.top - pad.bottom
  const barW = 8, gap = 3
  const rawMax = Math.max(...data.map(d => Math.max(d.thisWeek, d.lastWeek)), 1)
  const maxValue = Math.ceil(rawMax / 4 / 10) * 10 * 4 || 4
  const yTicks = [0, 0.5, 1].map(t => Math.round(maxValue * t))

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>Vues produits</span>
        <span style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: MUTE }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: ORANGE }} /> Cette sem.
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: MUTE }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: ORANGE_SOFT }} /> Sem. dern.
          </span>
        </div>
      </div>

      {loading ? <div style={{ marginTop: 10 }}><Skel h={110} /></div>
        : !hasData ? <Empty icon="Eye" text="Aucune vue produit." />
        : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: INK, letterSpacing: '-0.03em' }}>{fmt(totals.cur)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10.5, fontWeight: 700, color: trend >= 0 ? GREEN : RED }}>
                {trend >= 0 ? <Icons.TrendingUp size={10} strokeWidth={2.6} /> : <Icons.TrendingDown size={10} strokeWidth={2.6} />}
                {fmtTrend(trend)}
              </span>
              <span style={{ fontSize: 10.5, color: FAINT }}>vues · 7 j</span>
            </div>

            <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
              {yTicks.map(v => {
                const y = pad.top + ch - (v / maxValue) * ch
                return (
                  <g key={v}>
                    <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke={LINE} strokeWidth="1" />
                    <text x={pad.left - 4} y={y + 3} textAnchor="end" fontSize="8.5" fill={FAINT} fontFamily="DM Sans" fontWeight="500">
                      {v === 0 ? '0' : v >= 1000 ? `${(v / 1000).toLocaleString('fr-FR')}k` : v}
                    </text>
                  </g>
                )
              })}

              {data.map((d, i) => {
                const groupW = cw / data.length
                const groupCenter = pad.left + (i + 0.5) * groupW
                const x1 = groupCenter - barW - gap / 2
                const x2 = groupCenter + gap / 2
                const h1 = (d.thisWeek / maxValue) * ch
                const h2 = (d.lastWeek / maxValue) * ch
                const on = i === hovered
                const tipX = Math.min(Math.max(groupCenter, 42), W - 42)

                return (
                  <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                    <rect x={groupCenter - groupW / 2} y={pad.top} width={groupW} height={ch} fill="transparent" />
                    <rect x={x1} y={pad.top + ch - h1} width={barW} height={h1} rx={3} fill={ORANGE} opacity={on ? 1 : 0.9} />
                    <rect x={x2} y={pad.top + ch - h2} width={barW} height={h2} rx={3} fill={ORANGE_SOFT} opacity={on ? 1 : 0.85} />

                    {on && (
                      <g style={{ pointerEvents: 'none' }}>
                        <rect x={tipX - 40} y={2} width="80" height="30" rx="8" fill={INK} />
                        <text x={tipX} y="14" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700" fontFamily="DM Sans">
                          {d.thisWeek} vs {d.lastWeek}
                        </text>
                        <text x={tipX} y="26" textAnchor="middle" fontSize="8" fill="#fff" opacity="0.7" fontFamily="DM Sans">
                          {d.day}
                        </text>
                      </g>
                    )}

                    <text x={groupCenter} y={H - 6} textAnchor="middle" fontSize="9.5"
                          fill={on ? INK : FAINT} fontWeight={on ? 600 : 500}
                          fontFamily="DM Sans" style={{ pointerEvents: 'none' }}>
                      {d.day}
                    </text>
                  </g>
                )
              })}
            </svg>
          </>
        )}
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ACTIVITÉ RÉCENTE
// ═══════════════════════════════════════════════════════════════════
const STATUS_STYLES = {
  pending:       { bg: '#FEF3C7', color: '#D97706', text: 'En attente' },
  confirmed:     { bg: '#ECFDF5', color: GREEN,     text: 'Confirmée' },
  in_production: { bg: '#EFF6FF', color: '#3B82F6', text: 'En production' },
  shipped:       { bg: '#EDE9FE', color: '#8B5CF6', text: 'Expédiée' },
  delivered:     { bg: '#ECFDF5', color: GREEN,     text: 'Livrée' },
  cancelled:     { bg: '#F5F3EE', color: MUTE,      text: 'Annulée' },
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 3600)  return `${Math.max(1, Math.round(diff / 60))} min`
  if (diff < 86400) return `${Math.round(diff / 3600)} h`
  const d = Math.round(diff / 86400)
  return d < 30 ? `${d} j` : new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function RecentActivity({ subOrders, loading }) {
  const rows = useMemo(() => (
    [...subOrders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6)
  ), [subOrders])

  return (
    <Card style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>Activité récente</span>
        <span style={{ flex: 1 }} />
        <Link to="/supplier/orders" style={{ fontSize: 11.5, color: ORANGE, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          Tout voir <Icons.ChevronRight size={12} strokeWidth={2.4} />
        </Link>
      </div>

      {loading ? (
        [...Array(4)].map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
            <Skel h={36} w={36} style={{ borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}><Skel h={11} w="60%" /><div style={{ height: 5 }} /><Skel h={9} w="40%" /></div>
            <Skel h={12} w={54} />
          </div>
        ))
      ) : rows.length === 0 ? (
        <Empty icon="Inbox" text="Aucune commande pour l'instant." />
      ) : rows.map((o, i) => {
        const status = STATUS_STYLES[o.status] || STATUS_STYLES.pending
        const first  = o.items?.[0]
        const label  = first ? first.product_name + (o.items_count > 1 ? ` +${o.items_count - 1}` : '') : '—'

        return (
          <Link key={o.id} to="/supplier/orders" style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '11px 0', textDecoration: 'none',
            borderBottom: i < rows.length - 1 ? `1px solid #F5F3EE` : 'none',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', background: ORANGE_TINT,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, overflow: 'hidden',
            }}>
              {o.primary_image
                ? <img src={o.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Icons.Package size={16} color={ORANGE} strokeWidth={2} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {o.buyer_name || 'Client'}
              </div>
              <div style={{ fontSize: 10.5, color: FAINT, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label} · {timeAgo(o.created_at)}
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, fontVariantNumeric: 'tabular-nums' }}>
                {fmtDec(o.subtotal_tnd)} <span style={{ fontSize: 9.5, color: FAINT, fontWeight: 500 }}>TND</span>
              </div>
              <span style={{
                display: 'inline-block', marginTop: 3,
                background: status.bg, color: status.color,
                padding: '2px 8px', borderRadius: 999,
                fontSize: 9.5, fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                {status.text}
              </span>
            </div>
          </Link>
        )
      })}
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 14,
      border: '1px solid #EFECE4', marginBottom: 14, ...style,
    }}>
      {children}
    </div>
  )
}

function Empty({ icon = 'Inbox', text }) {
  const I = Icons[icon] || Icons.Inbox
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: FAINT, padding: '28px 0' }}>
      <I size={24} strokeWidth={1.5} style={{ opacity: 0.5 }} />
      <div style={{ fontSize: 12 }}>{text}</div>
    </div>
  )
}