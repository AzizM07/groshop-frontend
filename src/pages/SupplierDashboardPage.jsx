// pages/SupplierDashboardPage.jsx — GROSHOP.tn
// Style Donezo — 100% connecté au backend.
//   /orders/supplier/            → CA, commandes, clients, activité récente
//   /products/mine/              → produits actifs
//   /analytics/supplier/stats/   → visiteurs, vues produits (séries journalières)

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { orders as ordersApi, products as productsApi, analytics as analyticsApi } from '../lib/api'
import './SupplierDashboardPage.css'

const ROW2_HEIGHT = 360
const ROW3_HEIGHT = 400

/* ── Utils ── */
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
  return <div style={{ height: h, width: w, background: '#F1EFE9', borderRadius: 6, animation: 'gs-pulse 1.4s infinite', ...style }} />
}

if (typeof document !== 'undefined' && !document.getElementById('gs-dash-pulse')) {
  const s = document.createElement('style')
  s.id = 'gs-dash-pulse'
  s.textContent = `@keyframes gs-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }`
  document.head.appendChild(s)
}

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function SupplierDashboardPage() {
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
    <div className="gs-dash">
      <DashboardHeader />
      <KPIRow subOrders={subOrders} prods={prods}
              loadOrders={loadOrders} loadProds={loadProds} />

      <div style={{
        display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 16,
        marginTop: 16, marginBottom: 16, height: ROW2_HEIGHT,
      }}>
        <CustomerGrowthChart subOrders={subOrders} loading={loadOrders} />
        <VisitorsChart stats={stats} loading={loadStats} />
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '4fr 7fr', gap: 16,
        height: ROW3_HEIGHT,
      }}>
        <ProductViewsChart stats={stats} loading={loadStats} />
        <OrdersList subOrders={subOrders} loading={loadOrders} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD HEADER
// ═══════════════════════════════════════════════════════════════════
function DashboardHeader() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: 24, gap: 20, flexWrap: 'wrap',
    }}>
      <div>
        <h1 className="gs-h1" style={{
          fontSize: 42, margin: 0, color: '#0F1419',
          lineHeight: 1.05, letterSpacing: '-0.03em',
        }}>
          Dashboard
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#6B7280', fontWeight: 400 }}>
          Suivez vos ventes, gérez vos produits et développez votre présence.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <Link to="/supplier/products/new" className="gs-btn-primary" style={{ textDecoration: 'none' }}>
          <Icons.Plus size={15} strokeWidth={2.5} />
          Ajouter produit
        </Link>
        <Link to="/supplier/products" className="gs-btn-outline" style={{ textDecoration: 'none' }}>
          <Icons.Package size={14} strokeWidth={2.2} />
          Mes produits
        </Link>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// KPI ROW — calculé depuis le backend
// ═══════════════════════════════════════════════════════════════════
function KPIRow({ subOrders, prods, loadOrders, loadProds }) {
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
      <KPICard filled label="Chiffre d'affaires" value={fmt(k.revenue)} unit="TND"
               trend={fmtTrend(k.revenueTrend)} trendUp={k.revenueTrend >= 0}
               subtitle="vs mois dernier" loading={loadOrders} />
      <KPICard label="Commandes" value={fmt(k.orders)}
               trend={fmtTrend(k.ordersTrend)} trendUp={k.ordersTrend >= 0}
               subtitle="vs mois dernier" loading={loadOrders} />
      <KPICard label="Clients" value={fmt(k.clients)}
               trend={fmtTrend(k.clientsTrend)} trendUp={k.clientsTrend >= 0}
               subtitle="vs mois dernier" loading={loadOrders} />
      <KPICard label="Produits actifs" value={fmt(activeProds)}
               trend={`${prods.length} au total`} trendUp
               subtitle="en ligne" loading={loadProds} />
    </div>
  )
}

function KPICard({ label, value, unit, trend, trendUp, subtitle, filled = false, loading }) {
  const p = filled
    ? {
        cardBg: '#ff5e00', cardBorder: 'none', cardShadow: '0 12px 28px -12px rgba(255, 69, 0, 0.5)',
        labelColor: 'rgba(255,255,255,0.85)', valueColor: '#fff', unitColor: 'rgba(255,255,255,0.75)',
        arrowBg: 'rgba(255,255,255,0.18)', arrowColor: '#fff',
        trendColor: trendUp ? '#ffffff' : '#FECACA',
        trendBg: 'rgba(255,255,255,0.15)', subtitleColor: 'rgba(255,255,255,0.75)',
        skel: 'rgba(255,255,255,0.25)',
      }
    : {
        cardBg: '#fff', cardBorder: '1px solid #EAE7DF', cardShadow: 'none',
        labelColor: '#6B7280', valueColor: '#0F1419', unitColor: '#9AA3AE',
        arrowBg: '#F5F3EE', arrowColor: '#0F1419',
        trendColor: trendUp ? '#059669' : '#DC2626',
        trendBg: trendUp ? '#ECFDF5' : '#FEF2F2', subtitleColor: '#9AA3AE',
        skel: '#F1EFE9',
      }

  const valueLength = String(value).replace(/\s/g, '').length
  const valueSize = valueLength <= 3 ? 52 : valueLength <= 4 ? 46 : valueLength <= 5 ? 40 : 36

  return (
    <div
      className={`gs-kpi-card ${filled ? 'gs-kpi-card--filled' : 'gs-kpi-card--white'}`}
      style={{ background: p.cardBg, border: p.cardBorder, boxShadow: p.cardShadow }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12.5, color: p.labelColor, fontWeight: 500 }}>{label}</div>
        <div className="gs-kpi-arrow-btn" style={{
          width: 30, height: 30, borderRadius: '50%', background: p.arrowBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icons.ArrowUpRight size={14} color={p.arrowColor} strokeWidth={2.4} />
        </div>
      </div>

      {loading ? (
        <div style={{ margin: '14px 0 10px' }}><Skel h={34} w="70%" style={{ background: p.skel }} /></div>
      ) : (
        <div className="gs-num" style={{
          fontSize: valueSize, color: p.valueColor,
          letterSpacing: '-0.035em', lineHeight: 1, fontWeight: 700,
          display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8,
        }}>
          {value}
          {unit && (
            <span style={{
              fontSize: Math.round(valueSize * 0.32), color: p.unitColor,
              fontWeight: 500, letterSpacing: '-0.01em',
            }}>
              {unit}
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {loading ? <Skel h={18} w={70} style={{ background: p.skel, borderRadius: 999 }} /> : (
          <>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: p.trendBg, color: p.trendColor,
              padding: '3px 9px', borderRadius: 999,
              fontSize: 11, fontWeight: 700,
            }}>
              {trendUp
                ? <Icons.TrendingUp size={11} strokeWidth={2.6} />
                : <Icons.TrendingDown size={11} strokeWidth={2.6} />}
              {trend}
            </div>
            {subtitle && (
              <span style={{ fontSize: 11, color: p.subtitleColor, fontWeight: 500 }}>{subtitle}</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SECTION TITLE
// ═══════════════════════════════════════════════════════════════════
function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="gs-section-title">
      <span className="gs-section-icon">
        <Icon size={16} strokeWidth={2.2} />
      </span>
      {title}
    </div>
  )
}

function EmptyBox({ icon = 'Inbox', text }) {
  const I = Icons[icon] || Icons.Inbox
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#9AA3AE' }}>
      <I size={26} strokeWidth={1.5} style={{ opacity: 0.5 }} />
      <div style={{ fontSize: 12 }}>{text}</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ÉVOLUTION DU CA — série réelle
// ═══════════════════════════════════════════════════════════════════
function CustomerGrowthChart({ subOrders, loading }) {
  const [period, setPeriod] = useState('Mensuel')
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const data = useMemo(() => {
    const out = []
    const now = new Date()
    const bucket = (s, e, label) => {
      const inB = subOrders.filter(o => { const d = new Date(o.created_at); return d >= s && d < e })
      return {
        month:     label,
        primary:   inB.filter(o => o.status !== 'cancelled').reduce((a, o) => a + Number(o.subtotal_tnd || 0), 0),
        secondary: inB.filter(o => o.status === 'delivered').reduce((a, o) => a + Number(o.subtotal_tnd || 0), 0),
      }
    }
    if (period === 'Mensuel') {
      for (let i = 6; i >= 0; i--) {
        const s = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        out.push(bucket(s, e, s.toLocaleDateString('fr-FR', { month: 'short' })))
      }
    } else {
      for (let i = 7; i >= 0; i--) {
        const e = new Date(now); e.setDate(e.getDate() - i * 7 + 1); e.setHours(0, 0, 0, 0)
        const s = new Date(e);   s.setDate(s.getDate() - 7)
        out.push(bucket(s, e, s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })))
      }
    }
    return out
  }, [subOrders, period])

  const totalCA = useMemo(
    () => subOrders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + Number(o.subtotal_tnd || 0), 0),
    [subOrders],
  )
  const trend = useMemo(() => {
    if (data.length < 2) return 0
    return pctChange(data[data.length - 1].primary, data[data.length - 2].primary)
  }, [data])

  const hasData = data.some(d => d.primary > 0)

  const W = 720, H = 240
  const padding = { top: 12, right: 20, bottom: 30, left: 52 }
  const chartW = W - padding.left - padding.right
  const chartH = H - padding.top - padding.bottom

  const rawMax   = Math.max(...data.map(d => Math.max(d.primary, d.secondary)), 1)
  const maxValue = Math.ceil(rawMax / 4 / 100) * 100 * 4 || 4

  const toPoints = (key) => data.map((d, i) => ({
    x: padding.left + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
    y: padding.top + chartH - (d[key] / maxValue) * chartH,
  }))
  const primaryPts   = toPoints('primary')
  const secondaryPts = toPoints('secondary')

  const smooth = (pts) => {
    if (pts.length < 2) return ''
    let path = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
      path += ` C ${p1.x + (p2.x - p0.x) / 6},${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6},${p2.y - (p3.y - p1.y) / 6} ${p2.x},${p2.y}`
    }
    return path
  }

  const primaryPath   = smooth(primaryPts)
  const secondaryPath = smooth(secondaryPts)
  const baselineY = padding.top + chartH
  const areaPath = hasData
    ? primaryPath + ` L ${primaryPts[primaryPts.length - 1].x} ${baselineY} L ${primaryPts[0].x} ${baselineY} Z`
    : ''

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(maxValue * t))

  const handleMouseMove = (e) => {
    if (!hasData) return
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * W
    const stepX = chartW / Math.max(data.length - 1, 1)
    setHoveredIndex(Math.max(0, Math.min(data.length - 1, Math.round((mouseX - padding.left) / stepX))))
  }

  const renderHoverIndicator = () => {
    if (hoveredIndex === null || !primaryPts[hoveredIndex]) return null
    const sel = primaryPts[hoveredIndex]
    const tipW = 104, tipGap = 18
    const goLeft = sel.x + tipGap + tipW > W - padding.right
    const tipX = goLeft ? sel.x - tipGap - tipW : sel.x + tipGap
    return (
      <g style={{ pointerEvents: 'none' }}>
        <line x1={sel.x} y1={sel.y} x2={sel.x} y2={baselineY + 8} stroke="#FF4500" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx={sel.x} cy={sel.y} r="10" fill="#FF4500" opacity="0.22" />
        <circle cx={sel.x} cy={sel.y} r="5" fill="#FF4500" stroke="#fff" strokeWidth="2.5" />
        <g transform={`translate(${tipX}, ${sel.y - 2})`}>
          <rect x="0" y="-13" width={tipW} height="26" rx="13" fill="#0F1419" />
          <text x={tipW / 2} y="4" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="600" fontFamily="DM Sans">
            {fmt(data[hoveredIndex].primary)} TND
          </text>
        </g>
      </g>
    )
  }

  return (
    <div className="gs-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <SectionTitle icon={Icons.TrendingUp} title="Évolution du CA" />
          {loading ? (
            <div style={{ paddingLeft: 42, marginTop: 14 }}><Skel h={28} w={180} /></div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 14, paddingLeft: 42 }}>
                <span className="gs-num" style={{ fontSize: 28, color: '#0F1419' }}>
                  {fmt(totalCA)}
                  <span style={{ fontSize: 14, color: '#9AA3AE', marginLeft: 5, fontWeight: 500 }}>TND</span>
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  background: trend >= 0 ? '#ECFDF5' : '#FEF2F2',
                  color: trend >= 0 ? '#059669' : '#DC2626',
                  padding: '2px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 700,
                }}>
                  {trend >= 0 ? <Icons.TrendingUp size={11} strokeWidth={2.6} /> : <Icons.TrendingDown size={11} strokeWidth={2.6} />}
                  {fmtTrend(trend)}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: '#9AA3AE', marginTop: 4, paddingLeft: 42 }}>
                vs période précédente
              </div>
            </>
          )}
        </div>

        <button className="gs-pill-outline" onClick={() => setPeriod(p => p === 'Mensuel' ? 'Hebdo' : 'Mensuel')}>
          {period}
          <Icons.ChevronDown size={12} color="#6B7280" strokeWidth={2} />
        </button>
      </div>

      {loading ? (
        <div style={{ flex: 1, marginTop: 16 }}><Skel h="100%" /></div>
      ) : !hasData ? (
        <EmptyBox icon="LineChart" text="Aucune vente enregistrée." />
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet"
             style={{ flex: 1, display: 'block', marginTop: 16, cursor: 'crosshair', minHeight: 0 }}
             onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredIndex(null)}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF4500" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
            </linearGradient>
          </defs>

          {yTicks.map(val => {
            const y = padding.top + chartH - (val / maxValue) * chartH
            return (
              <g key={val}>
                <line x1={padding.left} y1={y} x2={W - padding.right} y2={y} stroke="#F0EDE5" strokeWidth="1" />
                <text x={padding.left - 8} y={y + 4} textAnchor="end"
                      fontSize="10.5" fill="#9AA3AE" fontFamily="DM Sans" fontWeight="500">
                  {val === 0 ? '0' : val >= 1000 ? `${(val / 1000).toLocaleString('fr-FR')}k` : val}
                </text>
              </g>
            )
          })}

          <rect x={padding.left} y={padding.top} width={chartW} height={chartH} fill="transparent" />

          <path d={areaPath} fill="url(#areaGrad)" style={{ pointerEvents: 'none' }} />
          <path d={secondaryPath} stroke="#FFB088" strokeWidth="2" fill="none" strokeLinecap="round" style={{ pointerEvents: 'none' }} />
          <path d={primaryPath} stroke="#FF4500" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ pointerEvents: 'none' }} />

          {renderHoverIndicator()}

          {data.map((d, i) => (
            <text key={i} x={primaryPts[i].x} y={H - 8} textAnchor="middle"
                  fontSize="11"
                  fill={i === hoveredIndex ? '#0F1419' : '#9AA3AE'}
                  fontWeight={i === hoveredIndex ? 600 : 500}
                  fontFamily="DM Sans" style={{ pointerEvents: 'none' }}>
              {d.month}
            </text>
          ))}
        </svg>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// VISITEURS — 7 derniers jours réels
// ═══════════════════════════════════════════════════════════════════
function VisitorsChart({ stats, loading }) {
  const [hoveredDay, setHoveredDay] = useState(null)

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
    const cur  = build(0)
    const prev = build(7)
    const sum  = (a) => a.reduce((s, d) => s + d.visitors, 0)
    return { data: cur, total: sum(cur), trend: pctChange(sum(cur), sum(prev)) }
  }, [stats])

  const hasData = data.some(d => d.visitors > 0)
  const W = 400, H = 200
  const padding = { top: 10, bottom: 26, left: 8, right: 8 }
  const chartW = W - padding.left - padding.right
  const chartH = H - padding.top - padding.bottom
  const barWidth = 20
  const maxValue = Math.max(...data.map(d => d.visitors), 1)

  return (
    <div className="gs-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <SectionTitle icon={Icons.Users} title="Visiteurs" />
          {loading ? (
            <div style={{ paddingLeft: 42, marginTop: 14 }}><Skel h={26} w={140} /></div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 14, paddingLeft: 42 }}>
                <span className="gs-num" style={{ fontSize: 26, color: '#0F1419' }}>{fmt(total)}</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  background: trend >= 0 ? '#ECFDF5' : '#FEF2F2',
                  color: trend >= 0 ? '#059669' : '#DC2626',
                  padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                }}>
                  {trend >= 0 ? <Icons.TrendingUp size={10} strokeWidth={2.6} /> : <Icons.TrendingDown size={10} strokeWidth={2.6} />}
                  {fmtTrend(trend)}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: '#9AA3AE', marginTop: 3, paddingLeft: 42 }}>
                uniques · vs semaine dernière
              </div>
            </>
          )}
        </div>
        <Link to="/supplier/stats" style={{
          background: 'transparent', border: 'none',
          fontSize: 12, color: '#FF4500', fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 3,
        }}>
          Voir plus <Icons.ArrowRight size={12} strokeWidth={2.4} />
        </Link>
      </div>

      {loading ? (
        <div style={{ flex: 1, marginTop: 20 }}><Skel h="100%" /></div>
      ) : !hasData ? (
        <EmptyBox icon="Users" text="Aucune visite enregistrée." />
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet"
             style={{ flex: 1, display: 'block', minHeight: 0, marginTop: 20 }}>
          {data.map((d, i) => {
            const x = padding.left + (i + 0.5) * (chartW / data.length) - barWidth / 2
            const height = d.visitors > 0 ? Math.max((d.visitors / maxValue) * chartH, 4) : 0
            const y = padding.top + chartH - height
            const isHovered = i === hoveredDay
            const tipX = Math.min(Math.max(x + barWidth / 2, 42), W - 42)

            return (
              <g key={i}
                 onMouseEnter={() => setHoveredDay(i)}
                 onMouseLeave={() => setHoveredDay(null)}
                 style={{ cursor: 'pointer' }}>
                <rect x={x - 6} y={padding.top} width={barWidth + 12} height={chartH} fill="transparent" />
                <rect x={x} y={y} width={barWidth} height={height} rx={10}
                      fill={isHovered ? '#FF4500' : '#FFCFB8'} style={{ transition: 'fill 0.15s' }} />

                {isHovered && (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect x={tipX - 40} y={Math.max(y - 46, 2)} width="80" height="34" rx="8" fill="#0F1419" />
                    <text x={tipX} y={Math.max(y - 28, 20)} textAnchor="middle"
                          fontSize="12" fill="#fff" fontWeight="700" fontFamily="DM Sans">
                      {d.visitors}
                    </text>
                    <text x={tipX} y={Math.max(y - 16, 32)} textAnchor="middle"
                          fontSize="9" fill="#fff" opacity="0.7" fontFamily="DM Sans">
                      {d.views} vues
                    </text>
                  </g>
                )}

                <text x={x + barWidth / 2} y={H - 8} textAnchor="middle"
                      fontSize="10.5"
                      fill={isHovered ? '#0F1419' : '#9AA3AE'}
                      fontWeight={isHovered ? 600 : 500}
                      fontFamily="DM Sans" style={{ pointerEvents: 'none' }}>
                  {d.day}
                </text>
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// VUES PRODUITS — cette semaine vs semaine dernière (réel)
// ═══════════════════════════════════════════════════════════════════
function ProductViewsChart({ stats, loading }) {
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

  const hasData = data.some(d => d.thisWeek > 0 || d.lastWeek > 0)
  const W = 380, H = 240
  const padding = { top: 20, bottom: 30, left: 40, right: 12 }
  const chartW = W - padding.left - padding.right
  const chartH = H - padding.top - padding.bottom
  const barWidth = 9, barGap = 3

  const rawMax   = Math.max(...data.map(d => Math.max(d.thisWeek, d.lastWeek)), 1)
  const maxValue = Math.ceil(rawMax / 5 / 10) * 10 * 5 || 5
  const yTicks   = [0, 0.2, 0.4, 0.6, 0.8, 1].map(t => Math.round(maxValue * t))

  return (
    <div className="gs-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <SectionTitle icon={Icons.Eye} title="Vues produits" />
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6B7280' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF4500' }} />
            Cette sem.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6B7280' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFCFB8' }} />
            Sem. dern.
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, marginTop: 10 }}><Skel h="100%" /></div>
      ) : !hasData ? (
        <EmptyBox icon="Eye" text="Aucune vue produit." />
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet"
             style={{ flex: 1, display: 'block', minHeight: 0, marginTop: 4 }}>
          {yTicks.map(val => {
            const y = padding.top + chartH - (val / maxValue) * chartH
            return (
              <g key={val}>
                <line x1={padding.left} y1={y} x2={W - padding.right} y2={y} stroke="#F0EDE5" strokeWidth="1" />
                <text x={padding.left - 8} y={y + 3} textAnchor="end"
                      fontSize="9.5" fill="#9AA3AE" fontFamily="DM Sans" fontWeight="500">
                  {val === 0 ? '0' : val >= 1000 ? `${(val / 1000).toLocaleString('fr-FR')}k` : val}
                </text>
              </g>
            )
          })}

          {data.map((d, i) => {
            const groupCenter = padding.left + (i + 0.5) * (chartW / data.length)
            const x1 = groupCenter - barWidth - barGap / 2
            const x2 = groupCenter + barGap / 2
            const h1 = (d.thisWeek / maxValue) * chartH
            const h2 = (d.lastWeek / maxValue) * chartH

            return (
              <g key={i}>
                <rect x={x1} y={padding.top + chartH - h1} width={barWidth} height={h1} rx={4} fill="#FF4500" />
                <rect x={x2} y={padding.top + chartH - h2} width={barWidth} height={h2} rx={4} fill="#FFCFB8" />
                <text x={groupCenter} y={H - 10} textAnchor="middle"
                      fontSize="10.5" fill="#9AA3AE" fontFamily="DM Sans" fontWeight="500">
                  {d.day}
                </text>
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ACTIVITÉ RÉCENTE — vraies commandes
// ═══════════════════════════════════════════════════════════════════
const STATUS_STYLES = {
  pending:       { bg: '#FEF3C7', color: '#D97706', text: 'En attente' },
  confirmed:     { bg: '#ECFDF5', color: '#059669', text: 'Confirmée' },
  in_production: { bg: '#EFF6FF', color: '#3B82F6', text: 'En production' },
  shipped:       { bg: '#EDE9FE', color: '#8B5CF6', text: 'Expédiée' },
  delivered:     { bg: '#ECFDF5', color: '#059669', text: 'Livrée' },
  cancelled:     { bg: '#F5F3EE', color: '#6B7280', text: 'Annulée' },
}
const PAYMENT_LABELS = {
  cod: 'Paiement livraison', d17: 'D17', flouci: 'Flouci',
  sobflous: 'Sobflous', virement: 'Virement bancaire',
}

function OrdersList({ subOrders, loading }) {
  const [sortDesc, setSortDesc] = useState(true)
  const cols = '1.9fr 1.1fr 0.9fr 1.1fr 0.2fr'

  const rows = useMemo(() => (
    [...subOrders]
      .sort((a, b) => sortDesc
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.created_at) - new Date(b.created_at))
      .slice(0, 8)
  ), [subOrders, sortDesc])

  return (
    <div className="gs-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <SectionTitle icon={Icons.Activity} title="Activité récente" />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="gs-pill-outline" onClick={() => setSortDesc(s => !s)}>
            <Icons.ArrowUpDown size={12} strokeWidth={2.2} />
            {sortDesc ? 'Récent' : 'Ancien'}
          </button>
          <Link to="/supplier/orders" className="gs-pill-outline" style={{ textDecoration: 'none' }}>
            Tout voir
            <Icons.ArrowRight size={12} strokeWidth={2.2} />
          </Link>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: cols,
        padding: '0 0 14px', fontSize: 10.5,
        color: '#9AA3AE', fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        borderBottom: '1px solid #F0EDE5', flexShrink: 0,
      }}>
        <div>Client · Produit</div>
        <div>N°</div>
        <div>Montant</div>
        <div>Statut</div>
        <div></div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: cols, padding: '14px 6px', gap: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
                <Skel h={36} w={36} style={{ borderRadius: '50%', flexShrink: 0 }} />
                <Skel h={12} w="70%" />
              </div>
              <Skel h={12} /><Skel h={12} />
              <Skel h={20} w={70} style={{ borderRadius: 999 }} /><div />
            </div>
          ))
        ) : rows.length === 0 ? (
          <EmptyBox icon="Inbox" text="Aucune commande pour l'instant." />
        ) : rows.map((o, i) => {
          const status  = STATUS_STYLES[o.status] || STATUS_STYLES.pending
          const first   = o.items?.[0]
          const label   = first ? first.product_name + (o.items_count > 1 ? ` +${o.items_count - 1}` : '') : '—'
          const shortId = '#' + String(o.id).slice(0, 8).toUpperCase()
          const date    = new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

          return (
            <div key={o.id} className="gs-tr" style={{
              display: 'grid', gridTemplateColumns: cols,
              padding: '14px 6px', fontSize: 12.5, color: '#0F1419',
              borderBottom: i < rows.length - 1 ? '1px solid #F5F3EE' : 'none',
              alignItems: 'center', transition: 'background 0.12s',
              borderRadius: 8, margin: '0 -6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#F5F3EE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, overflow: 'hidden',
                }}>
                  {o.primary_image
                    ? <img src={o.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Icons.Package size={16} color="#B8BCC4" strokeWidth={2} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#0F1419', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.buyer_name || 'Client'}
                  </div>
                  <div style={{ fontSize: 11, color: '#9AA3AE', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {label} · {date}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 500, color: '#0F1419' }}>{shortId}</div>
                <div style={{ fontSize: 10.5, color: '#9AA3AE', marginTop: 1 }}>
                  {o.items_count} article{o.items_count > 1 ? 's' : ''}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: '#0F1419', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtDec(o.subtotal_tnd)} <span style={{ fontSize: 10.5, color: '#9AA3AE', fontWeight: 500 }}>TND</span>
                </div>
                <div style={{ fontSize: 10.5, color: '#9AA3AE', marginTop: 1 }}>
                  {PAYMENT_LABELS[o.payment_method] || '—'}
                </div>
              </div>

              <div>
                <span style={{
                  background: status.bg, color: status.color,
                  padding: '4px 11px', borderRadius: 999,
                  fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block',
                }}>
                  {status.text}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <Link to="/supplier/orders" style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#9AA3AE', padding: 4, borderRadius: 6, display: 'inline-flex',
                }}>
                  <Icons.MoreHorizontal size={16} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}