// pages/SupplierDashboardPage.jsx — GROSHOP.tn
// Dashboard 100% connecté au backend :
//   /orders/supplier/            → revenus, commandes, statuts, catégories
//   /products/mine/              → table produits
//   /analytics/supplier/stats/   → visiteurs, canaux, conversion
//   /analytics/supplier/active-users/ → DAU / WAU / MAU
//   /analytics/supplier/regions/ → carte Tunisie

import { useState, useEffect, useMemo } from 'react'
import * as Icons from 'lucide-react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { orders as ordersApi, products as productsApi, analytics as analyticsApi } from '../lib/api'

// ═══════════════════════════════════════════════════════════════════
// PALETTE
// ═══════════════════════════════════════════════════════════════════
const C = {
  orange:    '#FF5E00',
  orange600: '#E65400',
  orange400: '#FF8B5C',
  orange300: '#FFB088',
  orange200: '#FFD9C5',
  orangeSoft:'#FFF3E8',
  orangeGhost:'#FFF1EA',
  ink:       '#0F1419',
  muted:     '#6B7280',
  faint:     '#9AA3AE',
  line:      '#F1F2F4',
  line2:     '#F5F6F8',
  green:     '#059669',
  red:       '#DC2626',
}

// ── Styles ─────────────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-dashboard-styles-v3')) {
  document.querySelectorAll('style[id^="gs-dashboard-styles"]').forEach(el => el.remove())
  const s = document.createElement('style')
  s.id = 'gs-dashboard-styles-v3'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-dash { font-family: 'DM Sans', -apple-system, sans-serif; color: ${C.ink}; }
    .gs-h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-num { font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }

    .gs-card {
      background: #fff; border-radius: 18px; padding: 22px; border: 1px solid ${C.line};
      box-shadow: 0 1px 2px rgba(15,20,25,0.03);
      transition: box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease;
    }
    .gs-card--hover:hover {
      box-shadow: 0 10px 28px -10px rgba(15,20,25,0.16);
      transform: translateY(-3px);
      border-color: ${C.orange200};
    }

    .gs-trend-up   { background: #D1FAE5; color: ${C.green}; padding: 3px 9px; border-radius: 10px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px; }
    .gs-trend-down { background: #FEE2E2; color: ${C.red};   padding: 3px 9px; border-radius: 10px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px; }
    .gs-trend-flat { background: ${C.line2}; color: ${C.faint}; padding: 3px 9px; border-radius: 10px; font-size: 10.5px; font-weight: 700; }

    .gs-filter-btn {
      background: ${C.orange}; color: #fff; border: none;
      padding: 6px 12px; border-radius: 14px; font-size: 11.5px; font-weight: 600;
      cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-family: inherit;
      transition: background 0.15s, transform 0.1s;
    }
    .gs-filter-btn:hover { background: ${C.orange600}; }
    .gs-filter-btn:active { transform: scale(0.97); }

    .gs-seg { display: inline-flex; background: ${C.line2}; border-radius: 12px; padding: 3px; gap: 2px; }
    .gs-seg button {
      border: none; background: transparent; cursor: pointer; font-family: inherit;
      font-size: 11px; font-weight: 600; color: ${C.muted};
      padding: 5px 11px; border-radius: 9px; transition: all 0.15s;
    }
    .gs-seg button:hover { color: ${C.ink}; }
    .gs-seg button.is-on { background: #fff; color: ${C.orange}; box-shadow: 0 1px 3px rgba(15,20,25,0.10); }

    .gs-filter-btn-ghost {
      background: ${C.line2}; color: ${C.ink}; border: none;
      padding: 6px 12px; border-radius: 14px; font-size: 11.5px; font-weight: 500;
      cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-family: inherit;
      transition: background 0.15s, color 0.15s;
    }
    .gs-filter-btn-ghost:hover { background: #ECEEF1; }
    .gs-filter-btn-ghost.is-active { background: ${C.orangeSoft}; color: ${C.orange}; font-weight: 600; }

    .gs-input-clean { border: none; outline: none; background: transparent; font-family: inherit; }
    .gs-icon-btn-sm { background: transparent; border: none; cursor: pointer; padding: 4px; color: ${C.faint}; border-radius: 8px; transition: color 0.15s, background 0.15s; }
    .gs-icon-btn-sm:hover { color: ${C.ink}; background: ${C.line2}; }

    .gs-row { transition: background 0.15s; }
    .gs-row:hover { background: ${C.orangeGhost}; }

    .gs-sort { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; user-select: none; transition: color 0.15s; }
    .gs-sort:hover { color: ${C.ink}; }

    @keyframes gs-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }
    .gs-skel { background: ${C.line2}; border-radius: 6px; animation: gs-pulse 1.4s ease-in-out infinite; }

    @media (max-width: 1100px) {
      .gs-grid-main, .gs-grid-2, .gs-grid-21, .gs-grid-12 { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 720px) {
      .gs-grid-3 { grid-template-columns: 1fr !important; }
      .gs-funnel { grid-template-columns: repeat(2, 1fr) !important; }
    }
  `
  document.head.appendChild(s)
}

// ── Utils ──────────────────────────────────────────────────────────
const fmt    = (n) => Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })
const fmtDec = (n) => Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 3 })
const norm   = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

function pctChange(cur, prev) {
  if (!prev) return cur ? 100 : 0
  return ((cur - prev) / prev) * 100
}

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function DesktopSupplierDashboardPage() {
  const [subOrders, setSubOrders] = useState([])
  const [prods, setProds]         = useState([])
  const [stats, setStats]         = useState(null)   // analytics/supplier/stats
  const [active, setActive]       = useState(null)   // analytics/supplier/active-users
  const [regions, setRegions]     = useState([])     // analytics/supplier/regions
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    let alive = true
    Promise.allSettled([
      ordersApi.supplier(),
      productsApi.mine(),
      analyticsApi.supplierStats(),
      analyticsApi.activeUsers(),
      analyticsApi.regions(),
    ]).then(([o, p, s, a, r]) => {
      if (!alive) return
      if (o.status === 'fulfilled') setSubOrders(o.value?.results || (Array.isArray(o.value) ? o.value : []))
      if (p.status === 'fulfilled') setProds(Array.isArray(p.value) ? p.value : (p.value?.results || []))
      if (s.status === 'fulfilled') setStats(s.value)
      if (a.status === 'fulfilled') setActive(a.value)
      if (r.status === 'fulfilled') setRegions(r.value?.by_region || [])
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  /* ── Dérivés ── */
  const paid = useMemo(() => subOrders.filter(o => o.status !== 'cancelled'), [subOrders])

  const kpis = useMemo(() => {
    const now   = new Date()
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const pStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const inRange = (o, a, b) => {
      const d = new Date(o.created_at)
      return d >= a && (!b || d < b)
    }
    const sum = (arr) => arr.reduce((s, o) => s + Number(o.subtotal_tnd || 0), 0)

    const curM  = paid.filter(o => inRange(o, mStart, null))
    const prevM = paid.filter(o => inRange(o, pStart, mStart))

    return {
      revenue:      sum(paid),
      revenueTrend: pctChange(sum(curM), sum(prevM)),
      orders:       subOrders.length,
      ordersTrend:  pctChange(curM.length, prevM.length),
      visitors:     stats?.views_month ?? null,
      uniques:      stats?.unique_visitors ?? null,
    }
  }, [paid, subOrders, stats])

  return (
    <div className="gs-dash gs-grid-main" style={{ display: 'grid', gridTemplateColumns: '3fr 1.1fr', gap: 16 }}>
      {/* ── LEFT ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

        <div className="gs-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <KPICard label="Ventes totales" value={fmt(kpis.revenue)} unit="TND"
                   trend={kpis.revenueTrend} icon="DollarSign" highlighted loading={loading} />
          <KPICard label="Commandes totales" value={fmt(kpis.orders)}
                   trend={kpis.ordersTrend} icon="ShoppingCart" loading={loading} />
          <KPICard label="Visiteurs (ce mois)" value={kpis.visitors === null ? '—' : fmt(kpis.visitors)}
                   sub={kpis.uniques !== null ? `${fmt(kpis.uniques)} uniques` : null}
                   icon="UserCircle2" loading={loading} />
        </div>

        <RevenueAnalytics subOrders={paid} loading={loading} />

        <div className="gs-grid-12" style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: 16 }}>
          <ActiveUsersZone active={active} stats={stats} loading={loading} />
          <RegionsMap regions={regions} loading={loading} />
        </div>

        <ConversionFunnel stats={stats} ordersCount={subOrders.length} loading={loading} />

        <TopProductsTable products={prods} loading={loading} />
      </div>

      {/* ── RIGHT ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TopCategories subOrders={paid} loading={loading} />
        <ChannelPerformance stats={stats} loading={loading} />
        <SalesOrdersAnalytics subOrders={subOrders} loading={loading} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════
function CardHead({ title, right, sub }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: sub ? 2 : 0 }}>
      <div>
        <div className="gs-h1" style={{ fontSize: 16 }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: C.faint, marginTop: 3 }}>{sub}</div>}
      </div>
      {right}
    </div>
  )
}

function Trend({ value }) {
  if (value === null || value === undefined || !isFinite(value)) return null
  const rounded = Math.round(value * 10) / 10
  if (rounded === 0) return <span className="gs-trend-flat">0%</span>
  const up = rounded > 0
  const I = up ? Icons.TrendingUp : Icons.TrendingDown
  return (
    <span className={up ? 'gs-trend-up' : 'gs-trend-down'}>
      <I size={10} strokeWidth={2.6} />{up ? '+' : ''}{rounded.toLocaleString('fr-FR')}%
    </span>
  )
}

function Empty({ icon = 'Inbox', text }) {
  const I = Icons[icon] || Icons.Inbox
  return (
    <div style={{ padding: '28px 12px', textAlign: 'center', color: C.faint }}>
      <I size={26} strokeWidth={1.6} style={{ opacity: 0.5 }} />
      <div style={{ fontSize: 12, marginTop: 8 }}>{text}</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// KPI CARD
// ═══════════════════════════════════════════════════════════════════
function KPICard({ label, value, unit, sub, trend, icon, highlighted, loading }) {
  const Icon = Icons[icon] || Icons.Circle
  return (
    <div className="gs-card gs-card--hover" style={{
      background: highlighted ? C.orangeSoft : '#fff',
      borderColor: highlighted ? C.orange200 : C.line,
      padding: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 500 }}>{label}</div>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: highlighted ? C.orange : 'transparent',
          border: highlighted ? 'none' : `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={17} color={highlighted ? '#fff' : C.faint} strokeWidth={highlighted ? 2.2 : 1.8} />
        </div>
      </div>

      {loading ? (
        <div className="gs-skel" style={{ height: 26, width: '65%' }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span className="gs-num" style={{ fontSize: 26, color: C.ink, lineHeight: 1 }}>
            {value}
            {unit && <span style={{ fontSize: 12, color: C.faint, marginLeft: 4, fontWeight: 500 }}>{unit}</span>}
          </span>
          <Trend value={trend} />
        </div>
      )}
      <div style={{ fontSize: 10.5, color: C.faint, marginTop: 6 }}>
        {sub || (trend !== undefined && trend !== null ? 'vs mois dernier' : ' ')}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// REVENUE ANALYTICS — série réelle
// ═══════════════════════════════════════════════════════════════════
const RANGES = [
  { key: 7,  label: '7 j' },
  { key: 30, label: '30 j' },
  { key: 90, label: '90 j' },
]

function RevenueAnalytics({ subOrders, loading }) {
  const [days, setDays] = useState(30)
  const [hover, setHover] = useState(null)

  const data = useMemo(() => {
    const buckets = []
    const now = new Date()
    const step = days <= 7 ? 1 : days <= 30 ? 3 : 9
    for (let i = days; i >= 0; i -= step) {
      const end   = new Date(now); end.setDate(end.getDate() - i); end.setHours(23, 59, 59)
      const start = new Date(end); start.setDate(start.getDate() - step + 1); start.setHours(0, 0, 0)
      const inB = subOrders.filter(o => { const d = new Date(o.created_at); return d >= start && d <= end })
      buckets.push({
        label: end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        revenue: inB.reduce((s, o) => s + Number(o.subtotal_tnd || 0), 0),
        orders:  inB.length,
      })
    }
    return buckets
  }, [subOrders, days])

  const hasData = data.some(d => d.revenue > 0)
  const W = 700, H = 240
  const pad = { top: 20, right: 16, bottom: 30, left: 52 }
  const cw = W - pad.left - pad.right
  const ch = H - pad.top - pad.bottom

  const maxRev = Math.max(...data.map(d => d.revenue), 1)
  const maxOrd = Math.max(...data.map(d => d.orders), 1)
  const niceMax = Math.ceil(maxRev / 4 / 100) * 100 * 4 || 4

  const pts = (key, max) => data.map((d, i) => ({
    x: pad.left + (data.length === 1 ? cw / 2 : (i / (data.length - 1)) * cw),
    y: pad.top + ch - (d[key] / max) * ch,
  }))
  const revPts = pts('revenue', niceMax)
  const ordPts = pts('orders', maxOrd)

  const smooth = (p) => {
    if (p.length < 2) return ''
    let path = `M ${p[0].x} ${p[0].y}`
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2
      path += ` C ${p1.x + (p2.x - p0.x) / 6},${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6},${p2.y - (p3.y - p1.y) / 6} ${p2.x},${p2.y}`
    }
    return path
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(niceMax * t))

  const onMove = (e) => {
    if (!hasData) return
    const r = e.currentTarget.getBoundingClientRect()
    const mx = ((e.clientX - r.left) / r.width) * W
    const step = cw / Math.max(data.length - 1, 1)
    setHover(Math.max(0, Math.min(data.length - 1, Math.round((mx - pad.left) / step))))
  }

  const total = data.reduce((s, d) => s + d.revenue, 0)

  return (
    <div className="gs-card" style={{ padding: '22px 24px' }}>
      <CardHead
        title="Analyse des revenus"
        sub={loading ? null : `${fmtDec(total)} TND sur la période`}
        right={
          <div className="gs-seg">
            {RANGES.map(r => (
              <button key={r.key} className={days === r.key ? 'is-on' : ''} onClick={() => setDays(r.key)}>{r.label}</button>
            ))}
          </div>
        }
      />

      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <Legend color={C.orange} label="Revenus (TND)" />
        <Legend color={C.orange300} label="Commandes" dashed />
      </div>

      {loading ? (
        <div className="gs-skel" style={{ height: 200, marginTop: 12 }} />
      ) : !hasData ? (
        <Empty icon="LineChart" text="Aucune vente sur cette période." />
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet"
             style={{ display: 'block', cursor: 'crosshair', marginTop: 8 }}
             onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          <defs>
            <linearGradient id="revGradEz" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.orange} stopOpacity="0.18" />
              <stop offset="100%" stopColor={C.orange} stopOpacity="0" />
            </linearGradient>
          </defs>

          {yTicks.map(val => {
            const y = pad.top + ch - (val / niceMax) * ch
            return (
              <g key={val}>
                <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke={C.line} strokeWidth="1" strokeDasharray="3 5" />
                <text x={pad.left - 8} y={y + 3} textAnchor="end" fontSize="10" fill={C.faint} fontFamily="DM Sans">
                  {val >= 1000 ? `${(val / 1000).toLocaleString('fr-FR')}K` : val}
                </text>
              </g>
            )
          })}

          <path d={smooth(revPts) + ` L ${revPts[revPts.length - 1].x} ${pad.top + ch} L ${revPts[0].x} ${pad.top + ch} Z`}
                fill="url(#revGradEz)" style={{ pointerEvents: 'none' }} />
          <path d={smooth(ordPts)} stroke={C.orange300} strokeWidth="2.2" fill="none" strokeDasharray="5 4" strokeLinecap="round" style={{ pointerEvents: 'none' }} />
          <path d={smooth(revPts)} stroke={C.orange} strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ pointerEvents: 'none' }} />

          {hover !== null && revPts[hover] && (
            <g style={{ pointerEvents: 'none' }}>
              <line x1={revPts[hover].x} y1={pad.top} x2={revPts[hover].x} y2={pad.top + ch} stroke={C.orange} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.5" />
              <circle cx={revPts[hover].x} cy={revPts[hover].y} r="5" fill={C.orange} stroke="#fff" strokeWidth="2.5" />
              <g transform={`translate(${Math.min(Math.max(revPts[hover].x - 56, 4), W - 116)}, ${Math.max(revPts[hover].y - 56, 4)})`}>
                <rect x="0" y="0" width="112" height="46" rx="8" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
                <text x="56" y="15" textAnchor="middle" fontSize="9.5" fill={C.faint} fontFamily="DM Sans">{data[hover].label}</text>
                <text x="56" y="29" textAnchor="middle" fontSize="12" fill={C.ink} fontWeight="700" fontFamily="DM Sans">
                  {fmtDec(data[hover].revenue)} TND
                </text>
                <text x="56" y="41" textAnchor="middle" fontSize="9.5" fill={C.orange} fontFamily="DM Sans" fontWeight="600">
                  {data[hover].orders} commande{data[hover].orders > 1 ? 's' : ''}
                </text>
              </g>
            </g>
          )}

          {data.map((d, i) => (
            (data.length <= 12 || i % 2 === 0) && (
              <text key={i} x={revPts[i].x} y={H - 8} textAnchor="middle" fontSize="10" fill={C.faint} fontFamily="DM Sans" style={{ pointerEvents: 'none' }}>
                {d.label}
              </text>
            )
          ))}
        </svg>
      )}
    </div>
  )
}

function Legend({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.muted }}>
      <div style={{
        width: 14, height: 2.5,
        background: dashed ? `repeating-linear-gradient(to right, ${color} 0 4px, transparent 4px 7px)` : color,
        borderRadius: 1,
      }} />
      {label}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ZONE UTILISATEURS ACTIFS — DAU / WAU / MAU
// ═══════════════════════════════════════════════════════════════════
function ActiveUsersZone({ active, stats, loading }) {
  const [mode, setMode] = useState('visitors')   // visitors | users

  const src = mode === 'visitors' ? active?.unique_visitors : active?.authenticated_users
  const rows = [
    { key: 'dau', label: "Aujourd'hui", sub: '24 dernières heures', icon: 'Zap' },
    { key: 'wau', label: 'Cette semaine', sub: '7 derniers jours',  icon: 'CalendarDays' },
    { key: 'mau', label: 'Ce mois',       sub: '30 derniers jours', icon: 'CalendarRange' },
  ]
  const maxVal = src ? Math.max(src.dau || 0, src.wau || 0, src.mau || 0, 1) : 1
  const stick  = active?.stickiness_ratio ?? 0

  return (
    <div className="gs-card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
      <CardHead
        title="Utilisateurs actifs"
        sub="Fenêtres glissantes"
        right={
          <div className="gs-seg">
            <button className={mode === 'visitors' ? 'is-on' : ''} onClick={() => setMode('visitors')}>Visiteurs</button>
            <button className={mode === 'users' ? 'is-on' : ''} onClick={() => setMode('users')}>Connectés</button>
          </div>
        }
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
          {[0, 1, 2].map(i => <div key={i} className="gs-skel" style={{ height: 52 }} />)}
        </div>
      ) : !active ? (
        <Empty icon="Users" text="Tracking non disponible." />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 16 }}>
            {rows.map(r => {
              const val = src?.[r.key] ?? 0
              const Icon = Icons[r.icon] || Icons.Circle
              return (
                <div key={r.key} style={{
                  background: r.key === 'dau' ? C.orangeSoft : C.line2,
                  border: `1px solid ${r.key === 'dau' ? C.orange200 : 'transparent'}`,
                  borderRadius: 12, padding: '11px 13px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <Icon size={14} color={r.key === 'dau' ? C.orange : C.faint} strokeWidth={2.2} />
                    <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 500, flex: 1 }}>{r.label}</span>
                    <span className="gs-num" style={{ fontSize: 17, color: r.key === 'dau' ? C.orange : C.ink }}>{fmt(val)}</span>
                  </div>
                  <div style={{ height: 4, background: '#fff', borderRadius: 999, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${(val / maxVal) * 100}%`,
                      background: r.key === 'dau' ? C.orange : C.orange300,
                      borderRadius: 999, transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: 9.5, color: C.faint, marginTop: 5 }}>{r.sub}</div>
                </div>
              )
            })}
          </div>

          <div style={{
            marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          }}>
            <div>
              <div style={{ fontSize: 10.5, color: C.faint, fontWeight: 500 }}>Fidélité (DAU/MAU)</div>
              <div style={{ fontSize: 9.5, color: C.faint, marginTop: 2 }}>
                {stick >= 20 ? 'Bon retour des visiteurs' : 'Peu de visiteurs récurrents'}
              </div>
            </div>
            <span className="gs-num" style={{
              fontSize: 15, color: stick >= 20 ? C.green : C.orange,
              background: stick >= 20 ? '#D1FAE5' : C.orangeSoft,
              padding: '4px 10px', borderRadius: 10,
            }}>
              {stick}%
            </span>
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CARTE TUNISIE — régions réelles
// ═══════════════════════════════════════════════════════════════════
const TUN_GEO_URL = 'https://cdn.jsdelivr.net/npm/datamaps@0.5.9/src/js/data/tun.topo.json'

function RegionsMap({ regions, loading }) {
  const [metric, setMetric] = useState('revenue')  // revenue | orders

  const byName = useMemo(() => {
    const m = {}
    regions.forEach(r => { m[norm(r.label)] = r })
    return m
  }, [regions])

  const sorted = useMemo(
    () => [...regions].sort((a, b) => (metric === 'revenue' ? b.revenue - a.revenue : b.orders_count - a.orders_count)).slice(0, 8),
    [regions, metric],
  )
  const maxVal = sorted.length ? (metric === 'revenue' ? sorted[0].revenue : sorted[0].orders_count) : 1

  const fillFor = (geoName) => {
    const r = byName[norm(geoName)]
    if (!r) return C.line
    const v = metric === 'revenue' ? r.revenue : r.orders_count
    const t = v / (maxVal || 1)
    if (t >= 0.80) return C.orange
    if (t >= 0.60) return '#FF6B35'
    if (t >= 0.45) return C.orange400
    if (t >= 0.30) return C.orange300
    return C.orange200
  }

  const total = regions.reduce((s, r) => s + (metric === 'revenue' ? r.revenue : r.orders_count), 0)

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      <CardHead
        title="Répartition géographique"
        sub={loading ? null : `${regions.length} gouvernorat${regions.length > 1 ? 's' : ''} actif${regions.length > 1 ? 's' : ''}`}
        right={
          <div className="gs-seg">
            <button className={metric === 'revenue' ? 'is-on' : ''} onClick={() => setMetric('revenue')}>CA</button>
            <button className={metric === 'orders' ? 'is-on' : ''} onClick={() => setMetric('orders')}>Cmd</button>
          </div>
        }
      />

      {loading ? (
        <div className="gs-skel" style={{ height: 200, marginTop: 16 }} />
      ) : regions.length === 0 ? (
        <Empty icon="MapPin" text="Aucune commande géolocalisée pour l'instant." />
      ) : (
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginTop: 14 }}>
          <div style={{ flex: 1.3, display: 'flex', flexDirection: 'column', gap: 9, minWidth: 0 }}>
            {sorted.map(g => {
              const v = metric === 'revenue' ? g.revenue : g.orders_count
              const share = total ? Math.round((v / total) * 100) : 0
              return (
                <div key={g.gouvernorat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: fillFor(g.label), flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: C.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.label}
                    </span>
                  </div>
                  <span className="gs-num" style={{ fontSize: 12, color: C.ink, flexShrink: 0 }}>
                    {metric === 'revenue' ? `${fmt(v)} TND` : fmt(v)}
                    <span style={{ color: C.faint, fontWeight: 500, marginLeft: 4, fontSize: 10.5 }}>{share}%</span>
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ flex: 0.9, minWidth: 0 }}>
            <ComposableMap projection="geoMercator" projectionConfig={{ center: [9.5, 34], scale: 1400 }}
                           width={140} height={210} style={{ width: '100%', height: 'auto', display: 'block' }}>
              <Geographies geography={TUN_GEO_URL}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const raw  = geo.properties.name || geo.properties.NAME || ''
                    const fill = fillFor(raw)
                    return (
                      <Geography key={geo.rsmKey} geography={geo}
                        style={{
                          default: { fill, stroke: '#fff', strokeWidth: 0.6, outline: 'none' },
                          hover:   { fill, stroke: C.orange, strokeWidth: 1.2, outline: 'none', cursor: 'pointer' },
                          pressed: { fill, outline: 'none' },
                        }} />
                    )
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// FUNNEL DE CONVERSION — réel
// ═══════════════════════════════════════════════════════════════════
function ConversionFunnel({ stats, ordersCount, loading }) {
  const steps = useMemo(() => {
    if (!stats) return []
    const views    = stats.views_month || 0
    const uniques  = stats.unique_visitors || 0
    const sessions = stats.sessions_count || 0
    const conv     = stats.converted_count || 0
    const base     = Math.max(views, 1)
    return [
      { label: 'Pages vues',       value: views,    pct: 100, icon: 'Eye' },
      { label: 'Visiteurs uniques',value: uniques,  pct: (uniques / base) * 100, icon: 'Users' },
      { label: 'Sessions',         value: sessions, pct: (sessions / base) * 100, icon: 'MousePointerClick' },
      { label: 'Commandes',        value: conv,     pct: (conv / base) * 100, icon: 'ShoppingBag' },
    ]
  }, [stats])

  const rate = stats?.conversion_rate ?? 0

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      <CardHead
        title="Entonnoir de conversion"
        sub="Mois en cours"
        right={
          !loading && stats ? (
            <span className="gs-num" style={{
              fontSize: 15, color: C.orange, background: C.orangeSoft,
              padding: '5px 12px', borderRadius: 12,
            }}>
              {rate}% <span style={{ fontSize: 10, color: C.muted, fontWeight: 500 }}>conversion</span>
            </span>
          ) : null
        }
      />

      {loading ? (
        <div className="gs-skel" style={{ height: 120, marginTop: 16 }} />
      ) : !stats || !steps.length ? (
        <Empty icon="Filter" text="Tracking non disponible." />
      ) : (
        <>
          <div className="gs-funnel" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16 }}>
            {steps.map((s, i) => {
              const Icon = Icons[s.icon] || Icons.Circle
              const drop = i > 0 && steps[i - 1].value
                ? Math.round((1 - s.value / steps[i - 1].value) * 100) : null
              return (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Icon size={13} color={C.faint} strokeWidth={2} />
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{s.label}</div>
                  </div>
                  <div className="gs-num" style={{ fontSize: 19, color: i === 3 ? C.orange : C.ink, lineHeight: 1 }}>
                    {fmt(s.value)}
                  </div>
                  {drop !== null && (
                    <div style={{ marginTop: 8, fontSize: 10, color: C.faint }}>
                      −{drop}% <span style={{ opacity: 0.7 }}>vs étape préc.</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="gs-funnel" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16, height: 80, alignItems: 'flex-end' }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                height: `${Math.max(s.pct, 3)}%`,
                background: i === 3 ? C.orange : i === 0 ? C.orange300 : '#FFE5D6',
                borderRadius: '8px 8px 0 0',
                transition: 'height 0.35s ease',
              }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TOP PRODUITS — depuis /products/mine/
// ═══════════════════════════════════════════════════════════════════
function TopProductsTable({ products, loading }) {
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState(null)
  const [sort, setSort] = useState({ key: 'sold_count', dir: 'desc' })

  const categories = useMemo(
    () => [...new Set(products.map(p => p.category_name).filter(Boolean))],
    [products],
  )

  const rows = useMemo(() => {
    let r = products.filter(p => {
      if (query && !`${p.name} ${p.category_name || ''}`.toLowerCase().includes(query.toLowerCase())) return false
      if (catFilter && p.category_name !== catFilter) return false
      return true
    })
    const { key, dir } = sort
    return [...r].sort((a, b) => {
      const av = a[key] ?? 0, bv = b[key] ?? 0
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return dir === 'asc' ? cmp : -cmp
    }).slice(0, 8)
  }, [products, query, catFilter, sort])

  const toggleSort = (key) =>
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' })

  const cols = '2.4fr 1fr 0.8fr 0.8fr 0.9fr 0.9fr'

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      <CardHead title="Top produits" sub={loading ? null : `${products.length} produit${products.length > 1 ? 's' : ''} au catalogue`} />

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180, background: C.line2, borderRadius: 18, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icons.Search size={13} color={C.faint} />
          <input type="text" placeholder="Rechercher un produit..." value={query} onChange={e => setQuery(e.target.value)}
                 className="gs-input-clean" style={{ fontSize: 12, width: '100%' }} />
          {query && <button className="gs-icon-btn-sm" style={{ padding: 2 }} onClick={() => setQuery('')}><Icons.X size={13} /></button>}
        </div>
        <button className={`gs-filter-btn-ghost ${catFilter ? 'is-active' : ''}`}
                onClick={() => {
                  const i = catFilter ? categories.indexOf(catFilter) : -1
                  setCatFilter(categories[i + 1] || null)
                }}>
          {catFilter || 'Catégorie'}<Icons.ChevronDown size={11} strokeWidth={2.4} />
        </button>
        {(catFilter || query) && (
          <button className="gs-filter-btn-ghost" onClick={() => { setCatFilter(null); setQuery('') }}>
            <Icons.RotateCcw size={12} strokeWidth={2.2} /> Réinitialiser
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '10px 12px', fontSize: 10.5, color: C.faint, fontWeight: 600, textTransform: 'uppercase', borderBottom: `1px solid ${C.line2}` }}>
        <SortTh label="Produit" col="name" sort={sort} onSort={toggleSort} />
        <SortTh label="Catégorie" col="category_name" sort={sort} onSort={toggleSort} />
        <SortTh label="Vendus" col="sold_count" sort={sort} onSort={toggleSort} align="right" />
        <SortTh label="Stock" col="stock_qty" sort={sort} onSort={toggleSort} align="right" />
        <SortTh label="Prix" col="base_price_tnd" sort={sort} onSort={toggleSort} align="right" />
        <SortTh label="Note" col="rating_avg" sort={sort} onSort={toggleSort} align="right" />
      </div>

      {loading ? (
        [...Array(4)].map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: cols, padding: '14px 12px', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="gs-skel" style={{ width: 42, height: 42, borderRadius: 11 }} />
              <div className="gs-skel" style={{ height: 12, flex: 1 }} />
            </div>
            {[...Array(5)].map((_, j) => <div key={j} className="gs-skel" style={{ height: 12 }} />)}
          </div>
        ))
      ) : rows.length === 0 ? (
        <Empty icon="PackageSearch" text={products.length ? 'Aucun produit ne correspond aux filtres.' : 'Aucun produit au catalogue.'} />
      ) : rows.map((p, i) => (
        <div key={p.id} className="gs-row" style={{
          display: 'grid', gridTemplateColumns: cols, padding: '14px 12px', fontSize: 12.5,
          alignItems: 'center', borderBottom: i < rows.length - 1 ? `1px solid ${C.line2}` : 'none', borderRadius: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: C.line2, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {p.primary_image
                ? <img src={p.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Icons.Package size={18} color={C.faint} strokeWidth={1.6} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div style={{ fontSize: 10.5, color: C.faint, marginTop: 2 }}>MOQ {p.moq} · {p.unit || 'unité'}</div>
            </div>
          </div>
          <div style={{ color: C.muted, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.category_name || '—'}</div>
          <div style={{ textAlign: 'right' }}><span className="gs-num" style={{ color: C.orange, fontSize: 13 }}>{fmt(p.sold_count)}</span></div>
          <div style={{ textAlign: 'right', color: Number(p.stock_qty) > 0 ? C.ink : C.red, fontWeight: 500 }}>{fmt(p.stock_qty)}</div>
          <div style={{ textAlign: 'right', color: C.ink, fontWeight: 500 }}>{fmtDec(p.base_price_tnd)}</div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: C.ink, fontWeight: 600 }}>
              <Icons.Star size={11} fill="#FFB800" stroke="#FFB800" />
              {Number(p.rating_avg || 0).toFixed(1)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SortTh({ label, col, sort, onSort, align = 'left' }) {
  const active = sort.key === col
  const Arrow = !active ? Icons.ChevronsUpDown : sort.dir === 'asc' ? Icons.ChevronUp : Icons.ChevronDown
  return (
    <div style={{ textAlign: align }}>
      <span className="gs-sort" style={{ color: active ? C.orange : 'inherit', justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}
            onClick={() => onSort(col)}>
        {label}
        <Arrow size={11} color={active ? C.orange : C.faint} strokeWidth={2} />
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TOP CATÉGORIES — depuis les items de commande
// ═══════════════════════════════════════════════════════════════════
const CAT_COLORS = ['#A855F7', '#3B82F6', '#06B6D4', '#6366F1', '#EC4899', '#EF4444', '#22C55E', '#84CC16', '#F59E0B', '#F97316']

function TopCategories({ subOrders, loading }) {
  const { cats, total } = useMemo(() => {
    const map = {}
    subOrders.forEach(o => (o.items || []).forEach(it => {
      const name = it.product_category || 'Autre'
      map[name] = (map[name] || 0) + Number(it.total_tnd || 0)
    }))
    const t = Object.values(map).reduce((s, v) => s + v, 0)
    const list = Object.entries(map)
      .map(([name, rev], i) => ({ name, rev, pct: t ? (rev / t) * 100 : 0 }))
      .sort((a, b) => b.rev - a.rev)
      .slice(0, 10)
      .map((c, i) => ({ ...c, color: CAT_COLORS[i % CAT_COLORS.length] }))
    return { cats: list, total: t }
  }, [subOrders])

  const R = 62, cx = 90, cy = 90, strokeW = 22
  const circ = 2 * Math.PI * R
  let offset = 0

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      <CardHead title="Catégories de ventes" sub={loading ? null : `${cats.length} catégorie${cats.length > 1 ? 's' : ''}`} />

      {loading ? (
        <div className="gs-skel" style={{ height: 180, marginTop: 16, borderRadius: '50%' }} />
      ) : cats.length === 0 ? (
        <Empty icon="PieChart" text="Aucune vente enregistrée." />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, position: 'relative' }}>
            <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
              {cats.map((c, i) => {
                const dash = (c.pct / 100) * circ
                const seg = (
                  <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={c.color} strokeWidth={strokeW}
                          strokeDasharray={`${Math.max(dash - 3, 0)} ${circ}`} strokeDashoffset={-offset} strokeLinecap="butt" />
                )
                offset += dash
                return seg
              })}
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 10.5, color: C.faint, fontWeight: 500 }}>Total ventes</div>
              <div className="gs-num" style={{ fontSize: 17, color: C.ink, marginTop: 2 }}>
                {total >= 1000 ? `${(total / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}K` : fmt(total)}
                <span style={{ fontSize: 10, color: C.faint, fontWeight: 500, marginLeft: 3 }}>TND</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {cats.map((c, i) => (
              <div key={i} style={{ background: `${c.color}12`, border: `1px solid ${c.color}1F`, padding: '7px 9px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                <div style={{ fontSize: 11.5, color: C.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                  {c.name} <span style={{ color: c.color, fontWeight: 700 }}>· {Math.round(c.pct)}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PERFORMANCE PAR CANAL — depuis analytics
// ═══════════════════════════════════════════════════════════════════
const CHANNEL_LABELS = {
  direct: 'Direct', search: 'Recherche', social: 'Réseaux sociaux', email: 'Email',
  referral: 'Référence', app_ios: 'App iOS', app_android: 'App Android', unknown: 'Inconnu',
}
const CHANNEL_COLORS = [C.orange, C.orange400, C.orange300, '#FFD9C5', '#FFEBDF']

function ChannelPerformance({ stats, loading }) {
  const channels = useMemo(() => {
    const src = stats?.by_channel || []
    const convMap = Object.fromEntries((stats?.conversion_by_channel || []).map(c => [c.channel, c]))
    return src.slice(0, 5).map((c, i) => ({
      key:   c.channel,
      name:  CHANNEL_LABELS[c.channel] || c.channel,
      views: c.count,
      rate:  convMap[c.channel]?.rate ?? null,
      color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
    }))
  }, [stats])

  const totalViews = channels.reduce((s, c) => s + c.views, 0)

  const W = 280, H = 165, cx = W / 2, cy = 148, r = 92, strokeW = 22
  const gapRad = (5 * Math.PI) / 180
  const arcPath = (start, end) => {
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end)
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
  }
  const totalSpan = Math.PI - gapRad * Math.max(channels.length - 1, 0)
  let cursor = Math.PI
  const segments = channels.map(c => {
    const span = (c.views / (totalViews || 1)) * totalSpan
    const seg = { ...c, start: cursor, end: cursor + span }
    cursor += span + gapRad
    return seg
  })

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      <CardHead title="Performance par canal" sub="Mois en cours" />

      {loading ? (
        <div className="gs-skel" style={{ height: 150, marginTop: 16 }} />
      ) : channels.length === 0 ? (
        <Empty icon="Radio" text="Aucune donnée de trafic." />
      ) : (
        <>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 14, marginBottom: 4 }}>Pages vues :</div>
          <div className="gs-num" style={{ fontSize: 24, color: C.ink, lineHeight: 1 }}>{fmt(totalViews)}</div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 260, display: 'block' }}>
              {segments.map((s, i) => (
                <path key={i} d={arcPath(s.start, s.end)} stroke={s.color} strokeWidth={strokeW} fill="none" strokeLinecap="round" />
              ))}
              <text x={cx} y={cy - 26} textAnchor="middle" fontSize="10.5" fill={C.faint} fontFamily="DM Sans">Canal principal :</text>
              <text x={cx} y={cy - 6} textAnchor="middle" fontSize="15" fontWeight="700" fill={C.ink} fontFamily="DM Sans">
                {channels[0]?.name || '—'}
              </text>
            </svg>
          </div>

          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {channels.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: C.ink, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                <span className="gs-num" style={{ fontSize: 11.5, color: C.muted }}>{fmt(c.views)}</span>
                {c.rate !== null && (
                  <span style={{ fontSize: 10, color: C.orange, background: C.orangeSoft, padding: '2px 6px', borderRadius: 8, fontWeight: 700 }}>
                    {c.rate}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// VENTES & COMMANDES PAR STATUT — réel
// ═══════════════════════════════════════════════════════════════════
const STATUS_LABELS = {
  pending: 'En attente', confirmed: 'Confirmées', in_production: 'En production',
  shipped: 'Expédiées', delivered: 'Livrées', cancelled: 'Annulées',
}
const STATUS_COLORS = {
  pending: C.orange300, confirmed: C.orange400, in_production: '#FF6B35',
  shipped: C.orange, delivered: C.green, cancelled: '#D1D5DB',
}

function SalesOrdersAnalytics({ subOrders, loading }) {
  const [hover, setHover] = useState(null)

  const rows = useMemo(() => {
    const map = {}
    subOrders.forEach(o => {
      if (!map[o.status]) map[o.status] = { count: 0, revenue: 0 }
      map[o.status].count   += 1
      map[o.status].revenue += Number(o.subtotal_tnd || 0)
    })
    const total = subOrders.length
    return Object.entries(map)
      .map(([status, v]) => ({
        status,
        label:  STATUS_LABELS[status] || status,
        color:  STATUS_COLORS[status] || C.orange300,
        value:  v.count,
        revenue: v.revenue,
        share:  total ? ((v.count / total) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value)
  }, [subOrders])

  const total = subOrders.length
  const maxValue = rows.length ? rows[0].value : 1
  const ROW_H = 34

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      <CardHead title="Ventes & commandes" sub="Par statut" />

      {loading ? (
        <div className="gs-skel" style={{ height: 140, marginTop: 16 }} />
      ) : rows.length === 0 ? (
        <Empty icon="ClipboardList" text="Aucune commande." />
      ) : (
        <>
          <div style={{ fontSize: 11, color: C.faint, marginTop: 16, marginBottom: 6 }}>Total commandes :</div>
          <div style={{ marginBottom: 18 }}>
            <span className="gs-num" style={{ fontSize: 26, color: C.ink, lineHeight: 1 }}>{fmt(total)}</span>
          </div>

          <div style={{ position: 'relative', overflow: 'visible' }} onMouseLeave={() => setHover(null)}>
            {rows.map((o, i) => {
              const isH = hover === i
              return (
                <div key={o.status} onMouseEnter={() => setHover(i)}
                     style={{ display: 'grid', gridTemplateColumns: '86px 1fr 42px', alignItems: 'center', gap: 10, height: ROW_H, cursor: 'pointer' }}>
                  <span style={{ fontSize: 11.5, color: isH ? C.ink : C.muted, fontWeight: isH ? 600 : 500, transition: 'color 0.15s', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.label}
                  </span>
                  <div style={{ height: 22, position: 'relative' }}>
                    <div style={{
                      height: '100%', width: `${(o.value / maxValue) * 100}%`, background: o.color, borderRadius: 999,
                      opacity: isH ? 1 : 0.88, transition: 'opacity 0.18s, transform 0.18s',
                      transform: isH ? 'scaleY(1.08)' : 'scaleY(1)', transformOrigin: 'left center',
                    }} />
                  </div>
                  <span className="gs-num" style={{ fontSize: 12, color: C.ink, textAlign: 'right' }}>{fmt(o.value)}</span>
                </div>
              )
            })}

            {hover !== null && rows[hover] && (
              <div style={{
                position: 'absolute', top: hover * ROW_H + 6, right: 0, background: '#fff',
                borderRadius: 12, padding: '12px 14px',
                boxShadow: '0 12px 28px -8px rgba(15,20,25,0.20), 0 0 0 1px rgba(15,20,25,0.06)',
                zIndex: 10, width: 168, pointerEvents: 'none',
              }}>
                <div className="gs-num" style={{ fontSize: 14, color: C.ink, marginBottom: 10 }}>
                  {fmt(rows[hover].value)} commande{rows[hover].value > 1 ? 's' : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <SOATipRow color="#E5E7EB" label="Part" value={`${rows[hover].share}%`} />
                  <SOATipRow color={rows[hover].color} label="Revenus" value={`${fmt(rows[hover].revenue)} TND`} bold />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function SOATipRow({ color, label, value, bold }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ flex: 1, color: C.faint }}>{label} :</span>
      <span style={{ color: C.ink, fontWeight: bold ? 700 : 600 }}>{value}</span>
    </div>
  )
}