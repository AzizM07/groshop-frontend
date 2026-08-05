// src/components/supplier/MobileSupplierStats.jsx — GROSHOP.tn
// Version TÉLÉPHONE alignée sur le dashboard desktop.
//   Mêmes 5 endpoints, mêmes calculs :
//     /orders/supplier/            → revenus, commandes, statuts, catégories
//     /products/mine/              → top produits
//     /analytics/supplier/stats/   → visiteurs, canaux, conversion, funnel
//     /analytics/supplier/active-users/ → DAU / WAU / MAU
//     /analytics/supplier/regions/ → carte Tunisie
//   Tout est calculé côté client depuis les vraies commandes (comme le desktop),
//   plus de champs `stats.total_*` supposés.

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { orders as ordersApi, products as productsApi, analytics as analyticsApi } from '../../lib/api'

// ═══════════════════════════════════════════════════════════════════
// PALETTE  (teintes mobile — cream + échelle orange comme le desktop)
// ═══════════════════════════════════════════════════════════════════
const C = {
  orange:     '#ff5e20',
  orange600:  '#e65200',
  orange400:  '#ff8b5c',
  orange300:  '#ffb088',
  orange200:  '#ffd9c5',
  orangeSoft: '#FFF3E8',
  orangeTint: 'rgba(255, 94, 32, .10)',
  ink:        '#0F1419',
  muted:      '#6B7280',
  faint:      '#9AA3AE',
  line:       '#EFECE4',
  line2:      '#F5F3EE',
  green:      '#059669',
  red:        '#DC2626',
}
const FONT = '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

// ── Styles injectés (animation + segments) ─────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-mstats-styles-v1')) {
  const s = document.createElement('style')
  s.id = 'gs-mstats-styles-v1'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
    @keyframes gs-pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }
    .gsm-num { font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
    .gsm-seg { display: inline-flex; background: #F2EFE8; border-radius: 11px; padding: 3px; gap: 2px; }
    .gsm-seg button {
      border: none; background: transparent; font-family: inherit; cursor: pointer;
      font-size: 11px; font-weight: 600; color: ${C.muted};
      padding: 5px 10px; border-radius: 8px; transition: all .15s;
    }
    .gsm-seg button.on { background: #fff; color: ${C.orange}; box-shadow: 0 1px 3px rgba(15,20,25,.10); }
  `
  document.head.appendChild(s)
}

// ── Utils ──────────────────────────────────────────────────────────
const fmt    = (n) => Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })
const fmtDec = (n) => Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 3 })
const fmtPct = (v, d = 1) => `${(Number(v) || 0).toLocaleString('fr-FR', { maximumFractionDigits: d })}%`
const norm   = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

function pctChange(cur, prev) {
  if (!prev) return cur ? 100 : 0
  return ((cur - prev) / prev) * 100
}

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function MobileSupplierStats() {
  const [subOrders, setSubOrders] = useState([])
  const [prods, setProds]         = useState([])
  const [stats, setStats]         = useState(null)
  const [active, setActive]       = useState(null)
  const [regions, setRegions]     = useState([])
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

  /* ── Dérivés (identiques au desktop) ── */
  const paid = useMemo(() => subOrders.filter(o => o.status !== 'cancelled'), [subOrders])

  const kpis = useMemo(() => {
    const now    = new Date()
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const pStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const inRange = (o, a, b) => { const d = new Date(o.created_at); return d >= a && (!b || d < b) }
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
      conversion:   stats?.conversion_rate ?? null,
    }
  }, [paid, subOrders, stats])

  return (
    <div style={{ fontFamily: FONT, paddingBottom: 6 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
        Statistiques
      </h1>
      <p style={{ margin: '0 0 14px', fontSize: 12.5, color: C.muted }}>
        Mêmes données que le dashboard : revenus, trafic, régions et conversions.
      </p>

      <KPIGrid k={kpis} loading={loading} />
      <RevenueChart subOrders={paid} loading={loading} />
      <ActiveUsers active={active} loading={loading} />
      <RegionsMap regions={regions} loading={loading} />
      <ConversionFunnel stats={stats} loading={loading} />
      <TopCategories subOrders={paid} loading={loading} />
      <ChannelPerformance stats={stats} loading={loading} />
      <TopProducts products={prods} loading={loading} />
      <OrdersByStatus subOrders={subOrders} loading={loading} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════
function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 14, border: `1px solid ${C.line}`, marginBottom: 14, ...style }}>
      {children}
    </div>
  )
}

function CardHead({ title, sub, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: sub ? 4 : 0 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>{title}</div>
        {sub && <div style={{ fontSize: 10.5, color: C.faint, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  )
}

function Seg({ value, options, onChange }) {
  return (
    <div className="gsm-seg">
      {options.map(o => (
        <button key={o.key} className={value === o.key ? 'on' : ''} onClick={() => onChange(o.key)}>{o.label}</button>
      ))}
    </div>
  )
}

function Skel({ h = 14, w = '100%', style }) {
  return <div style={{ height: h, width: w, background: '#EFECE4', borderRadius: 6, animation: 'gs-pulse 1.4s infinite', ...style }} />
}

function Empty({ icon = 'Inbox', text }) {
  const I = Icons[icon] || Icons.Inbox
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: C.faint, padding: '26px 0' }}>
      <I size={24} strokeWidth={1.5} style={{ opacity: 0.5 }} />
      <div style={{ fontSize: 12 }}>{text}</div>
    </div>
  )
}

function Trend({ value }) {
  if (value === null || value === undefined || !isFinite(value)) return null
  const r = Math.round(value * 10) / 10
  if (r === 0) return <span style={{ fontSize: 10, fontWeight: 700, color: C.faint }}>0%</span>
  const up = r > 0
  const I = up ? Icons.TrendingUp : Icons.TrendingDown
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 700, color: up ? C.green : C.red }}>
      <I size={10} strokeWidth={2.6} />{up ? '+' : ''}{r.toLocaleString('fr-FR')}%
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════
// KPI 2×2  — revenus & commandes calculés depuis les vraies commandes
// ═══════════════════════════════════════════════════════════════════
function KPIGrid({ k, loading }) {
  const cards = [
    { label: 'Ventes totales', value: fmt(k.revenue), unit: 'TND', trend: k.revenueTrend, icon: 'DollarSign', hi: true },
    { label: 'Commandes',      value: fmt(k.orders),  trend: k.ordersTrend, icon: 'ShoppingCart' },
    { label: 'Visiteurs',      value: k.visitors === null ? '—' : fmt(k.visitors),
      sub: k.uniques !== null ? `${fmt(k.uniques)} uniques` : 'ce mois', icon: 'UserCircle2' },
    { label: 'Conversion',     value: k.conversion === null ? '—' : fmtPct(k.conversion, 2), sub: 'taux', icon: 'Target' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
      {cards.map((c, i) => <KPICard key={i} {...c} loading={loading} />)}
    </div>
  )
}

function KPICard({ label, value, unit, sub, trend, icon, hi, loading }) {
  const Icon = Icons[icon] || Icons.Circle
  const len  = String(value).replace(/\s/g, '').length
  const size = len <= 4 ? 23 : len <= 6 ? 19 : 16
  const hasTrend = trend !== undefined && trend !== null && isFinite(trend)
  return (
    <div style={{ background: hi ? C.orangeSoft : '#fff', borderRadius: 16, padding: 13, border: `1px solid ${hi ? C.orange200 : C.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: C.muted, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <div style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          background: hi ? C.orange : 'transparent', border: hi ? 'none' : `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={13} color={hi ? '#fff' : C.faint} strokeWidth={hi ? 2.2 : 1.8} />
        </div>
      </div>

      {loading ? (
        <div style={{ margin: '6px 0' }}><Skel h={22} w="65%" /></div>
      ) : (
        <div className="gsm-num" style={{ fontSize: size, fontWeight: 800, color: C.ink, lineHeight: 1 }}>
          {value}{unit && <span style={{ fontSize: 11, color: C.faint, fontWeight: 600, marginLeft: 3 }}>{unit}</span>}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, minHeight: 14 }}>
        {loading ? <Skel h={12} w={60} /> : (
          <>
            <Trend value={trend} />
            <span style={{ fontSize: 10, color: C.faint }}>{hasTrend ? 'vs mois préc.' : (sub || '')}</span>
          </>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ANALYSE DES REVENUS — série réelle, toggle 7/30/90 j
// ═══════════════════════════════════════════════════════════════════
const RANGES = [{ key: 7, label: '7 j' }, { key: 30, label: '30 j' }, { key: 90, label: '90 j' }]

function RevenueChart({ subOrders, loading }) {
  const [days, setDays]   = useState(30)
  const [hover, setHover] = useState(null)

  const data = useMemo(() => {
    const buckets = []
    const now  = new Date()
    const step = days <= 7 ? 1 : days <= 30 ? 3 : 9
    for (let i = days; i >= 0; i -= step) {
      const end   = new Date(now); end.setDate(end.getDate() - i); end.setHours(23, 59, 59)
      const start = new Date(end); start.setDate(start.getDate() - step + 1); start.setHours(0, 0, 0)
      const inB = subOrders.filter(o => { const d = new Date(o.created_at); return d >= start && d <= end })
      buckets.push({
        label:   end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        revenue: inB.reduce((s, o) => s + Number(o.subtotal_tnd || 0), 0),
        orders:  inB.length,
      })
    }
    return buckets
  }, [subOrders, days])

  const hasData = data.some(d => d.revenue > 0)
  const W = 330, H = 185
  const pad = { top: 14, right: 10, bottom: 26, left: 42 }
  const cw = W - pad.left - pad.right
  const ch = H - pad.top - pad.bottom

  const maxRev  = Math.max(...data.map(d => d.revenue), 1)
  const maxOrd  = Math.max(...data.map(d => d.orders), 1)
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

  const yTicks = [0, 0.5, 1].map(t => Math.round(niceMax * t))

  const onMove = (e) => {
    if (!hasData) return
    const r = e.currentTarget.getBoundingClientRect()
    const mx = ((e.clientX - r.left) / r.width) * W
    const step = cw / Math.max(data.length - 1, 1)
    setHover(Math.max(0, Math.min(data.length - 1, Math.round((mx - pad.left) / step))))
  }

  const total = data.reduce((s, d) => s + d.revenue, 0)

  return (
    <Card>
      <CardHead
        title="Analyse des revenus"
        sub={loading ? null : `${fmtDec(total)} TND sur la période`}
        right={<Seg value={days} options={RANGES} onChange={setDays} />}
      />

      <div style={{ display: 'flex', gap: 14, marginTop: 8, marginBottom: 2 }}>
        <Legend color={C.orange} label="Revenus (TND)" />
        <Legend color={C.orange300} label="Commandes" dashed />
      </div>

      {loading ? <Skel h={150} style={{ marginTop: 8 }} />
        : !hasData ? <Empty icon="LineChart" text="Aucune vente sur cette période." />
        : (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet"
               style={{ display: 'block', cursor: 'crosshair', marginTop: 6 }}
               onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
            <defs>
              <linearGradient id="mRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.orange} stopOpacity="0.18" />
                <stop offset="100%" stopColor={C.orange} stopOpacity="0" />
              </linearGradient>
            </defs>

            {yTicks.map(val => {
              const y = pad.top + ch - (val / niceMax) * ch
              return (
                <g key={val}>
                  <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke={C.line} strokeWidth="1" strokeDasharray="3 5" />
                  <text x={pad.left - 6} y={y + 3} textAnchor="end" fontSize="9" fill={C.faint} fontFamily="DM Sans">
                    {val >= 1000 ? `${(val / 1000).toLocaleString('fr-FR')}k` : val}
                  </text>
                </g>
              )
            })}

            <path d={smooth(revPts) + ` L ${revPts[revPts.length - 1].x} ${pad.top + ch} L ${revPts[0].x} ${pad.top + ch} Z`}
                  fill="url(#mRevGrad)" style={{ pointerEvents: 'none' }} />
            <path d={smooth(ordPts)} stroke={C.orange300} strokeWidth="2" fill="none" strokeDasharray="5 4" strokeLinecap="round" style={{ pointerEvents: 'none' }} />
            <path d={smooth(revPts)} stroke={C.orange} strokeWidth="2.4" fill="none" strokeLinecap="round" style={{ pointerEvents: 'none' }} />

            {hover !== null && revPts[hover] && (
              <g style={{ pointerEvents: 'none' }}>
                <line x1={revPts[hover].x} y1={pad.top} x2={revPts[hover].x} y2={pad.top + ch} stroke={C.orange} strokeWidth="1.1" strokeDasharray="3 3" opacity="0.5" />
                <circle cx={revPts[hover].x} cy={revPts[hover].y} r="4.5" fill={C.orange} stroke="#fff" strokeWidth="2.2" />
                <g transform={`translate(${Math.min(Math.max(revPts[hover].x - 52, 4), W - 108)}, ${Math.max(revPts[hover].y - 52, 4)})`}>
                  <rect x="0" y="0" width="104" height="44" rx="8" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
                  <text x="52" y="14" textAnchor="middle" fontSize="9" fill={C.faint} fontFamily="DM Sans">{data[hover].label}</text>
                  <text x="52" y="28" textAnchor="middle" fontSize="11.5" fill={C.ink} fontWeight="700" fontFamily="DM Sans">
                    {fmtDec(data[hover].revenue)} TND
                  </text>
                  <text x="52" y="39" textAnchor="middle" fontSize="9" fill={C.orange} fontWeight="600" fontFamily="DM Sans">
                    {data[hover].orders} commande{data[hover].orders > 1 ? 's' : ''}
                  </text>
                </g>
              </g>
            )}

            {data.map((d, i) => (
              (data.length <= 8 || i % 2 === 0) && (
                <text key={i} x={revPts[i].x} y={H - 8} textAnchor="middle" fontSize="9" fill={C.faint} fontFamily="DM Sans" style={{ pointerEvents: 'none' }}>
                  {d.label}
                </text>
              )
            ))}
          </svg>
        )}
    </Card>
  )
}

function Legend({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: C.muted }}>
      <div style={{
        width: 14, height: 2.5, borderRadius: 1,
        background: dashed ? `repeating-linear-gradient(to right, ${color} 0 4px, transparent 4px 7px)` : color,
      }} />
      {label}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// UTILISATEURS ACTIFS — DAU / WAU / MAU + fidélité
// ═══════════════════════════════════════════════════════════════════
function ActiveUsers({ active, loading }) {
  const [mode, setMode] = useState('visitors')
  const src = mode === 'visitors' ? active?.unique_visitors : active?.authenticated_users
  const rows = [
    { key: 'dau', label: "Aujourd'hui",   sub: '24 dernières heures', icon: 'Zap' },
    { key: 'wau', label: 'Cette semaine', sub: '7 derniers jours',    icon: 'CalendarDays' },
    { key: 'mau', label: 'Ce mois',       sub: '30 derniers jours',   icon: 'CalendarRange' },
  ]
  const maxVal = src ? Math.max(src.dau || 0, src.wau || 0, src.mau || 0, 1) : 1
  const stick  = active?.stickiness_ratio ?? 0

  return (
    <Card>
      <CardHead
        title="Utilisateurs actifs"
        sub="Fenêtres glissantes"
        right={<Seg value={mode} options={[{ key: 'visitors', label: 'Visiteurs' }, { key: 'users', label: 'Connectés' }]} onChange={setMode} />}
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
          {[0, 1, 2].map(i => <Skel key={i} h={48} />)}
        </div>
      ) : !active ? <Empty icon="Users" text="Tracking non disponible." />
        : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
              {rows.map(r => {
                const val = src?.[r.key] ?? 0
                const Icon = Icons[r.icon] || Icons.Circle
                const dau = r.key === 'dau'
                return (
                  <div key={r.key} style={{
                    background: dau ? C.orangeSoft : C.line2,
                    border: `1px solid ${dau ? C.orange200 : 'transparent'}`,
                    borderRadius: 12, padding: '10px 12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={13} color={dau ? C.orange : C.faint} strokeWidth={2.2} />
                      <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 500, flex: 1 }}>{r.label}</span>
                      <span className="gsm-num" style={{ fontSize: 16, fontWeight: 800, color: dau ? C.orange : C.ink }}>{fmt(val)}</span>
                    </div>
                    <div style={{ height: 4, background: '#fff', borderRadius: 999, marginTop: 7, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(val / maxVal) * 100}%`, background: dau ? C.orange : C.orange300, borderRadius: 999, transition: 'width .4s ease' }} />
                    </div>
                    <div style={{ fontSize: 9.5, color: C.faint, marginTop: 5 }}>{r.sub}</div>
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: 10.5, color: C.faint, fontWeight: 500 }}>Fidélité (DAU/MAU)</div>
                <div style={{ fontSize: 9.5, color: C.faint, marginTop: 2 }}>
                  {stick >= 20 ? 'Bon retour des visiteurs' : 'Peu de visiteurs récurrents'}
                </div>
              </div>
              <span className="gsm-num" style={{
                fontSize: 15, fontWeight: 800, color: stick >= 20 ? C.green : C.orange,
                background: stick >= 20 ? '#D1FAE5' : C.orangeSoft, padding: '4px 10px', borderRadius: 10,
              }}>
                {stick}%
              </span>
            </div>
          </>
        )}
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// RÉPARTITION GÉOGRAPHIQUE — carte Tunisie + top gouvernorats
// ═══════════════════════════════════════════════════════════════════
const TUN_GEO_URL = 'https://cdn.jsdelivr.net/npm/datamaps@0.5.9/src/js/data/tun.topo.json'

function RegionsMap({ regions, loading }) {
  const [metric, setMetric] = useState('revenue')

  const byName = useMemo(() => {
    const m = {}
    regions.forEach(r => { m[norm(r.label)] = r })
    return m
  }, [regions])

  const sorted = useMemo(
    () => [...regions].sort((a, b) => (metric === 'revenue' ? b.revenue - a.revenue : b.orders_count - a.orders_count)).slice(0, 6),
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
    <Card>
      <CardHead
        title="Répartition géographique"
        sub={loading ? null : `${regions.length} gouvernorat${regions.length > 1 ? 's' : ''} actif${regions.length > 1 ? 's' : ''}`}
        right={<Seg value={metric} options={[{ key: 'revenue', label: 'CA' }, { key: 'orders', label: 'Cmd' }]} onChange={setMetric} />}
      />

      {loading ? <Skel h={180} style={{ marginTop: 12 }} />
        : regions.length === 0 ? <Empty icon="MapPin" text="Aucune commande géolocalisée." />
        : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
              {sorted.map(g => {
                const v = metric === 'revenue' ? g.revenue : g.orders_count
                const share = total ? Math.round((v / total) * 100) : 0
                return (
                  <div key={g.gouvernorat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: fillFor(g.label), flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: C.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.label}</span>
                    </div>
                    <span className="gsm-num" style={{ fontSize: 12, fontWeight: 700, color: C.ink, flexShrink: 0 }}>
                      {metric === 'revenue' ? `${fmt(v)} TND` : fmt(v)}
                      <span style={{ color: C.faint, fontWeight: 500, marginLeft: 4, fontSize: 10.5 }}>{share}%</span>
                    </span>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <ComposableMap projection="geoMercator" projectionConfig={{ center: [9.5, 34], scale: 1400 }}
                             width={150} height={200} style={{ width: 150, height: 'auto', display: 'block' }}>
                <Geographies geography={TUN_GEO_URL}>
                  {({ geographies }) =>
                    geographies.map(geo => {
                      const raw  = geo.properties.name || geo.properties.NAME || ''
                      const fill = fillFor(raw)
                      return (
                        <Geography key={geo.rsmKey} geography={geo}
                          style={{
                            default: { fill, stroke: '#fff', strokeWidth: 0.6, outline: 'none' },
                            hover:   { fill, stroke: C.orange, strokeWidth: 1.2, outline: 'none' },
                            pressed: { fill, outline: 'none' },
                          }} />
                      )
                    })
                  }
                </Geographies>
              </ComposableMap>
            </div>
          </>
        )}
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ENTONNOIR DE CONVERSION
// ═══════════════════════════════════════════════════════════════════
function ConversionFunnel({ stats, loading }) {
  const steps = useMemo(() => {
    if (!stats) return []
    const views    = stats.views_month || 0
    const uniques  = stats.unique_visitors || 0
    const sessions = stats.sessions_count || 0
    const conv     = stats.converted_count || 0
    const base     = Math.max(views, 1)
    return [
      { label: 'Pages vues',        value: views,    pct: 100,                     icon: 'Eye' },
      { label: 'Visiteurs uniques', value: uniques,  pct: (uniques / base) * 100,  icon: 'Users' },
      { label: 'Sessions',          value: sessions, pct: (sessions / base) * 100, icon: 'MousePointerClick' },
      { label: 'Commandes',         value: conv,     pct: (conv / base) * 100,     icon: 'ShoppingBag' },
    ]
  }, [stats])

  const rate = stats?.conversion_rate ?? 0

  return (
    <Card>
      <CardHead
        title="Entonnoir de conversion"
        sub="Mois en cours"
        right={!loading && stats ? (
          <span className="gsm-num" style={{ fontSize: 13, fontWeight: 800, color: C.orange, background: C.orangeSoft, padding: '5px 10px', borderRadius: 12 }}>
            {rate}% <span style={{ fontSize: 9.5, color: C.muted, fontWeight: 500 }}>conv.</span>
          </span>
        ) : null}
      />

      {loading ? <Skel h={120} style={{ marginTop: 12 }} />
        : !stats || !steps.length ? <Empty icon="Filter" text="Tracking non disponible." />
        : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
              {steps.map((s, i) => {
                const Icon = Icons[s.icon] || Icons.Circle
                const drop = i > 0 && steps[i - 1].value ? Math.round((1 - s.value / steps[i - 1].value) * 100) : null
                return (
                  <div key={i} style={{ background: C.line2, borderRadius: 12, padding: '10px 11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Icon size={12} color={i === 3 ? C.orange : C.faint} strokeWidth={2} />
                      <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</div>
                    </div>
                    <div className="gsm-num" style={{ fontSize: 18, fontWeight: 800, color: i === 3 ? C.orange : C.ink, lineHeight: 1 }}>{fmt(s.value)}</div>
                    {drop !== null && <div style={{ marginTop: 6, fontSize: 9.5, color: C.faint }}>−{drop}% vs étape préc.</div>}
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12, height: 54, alignItems: 'flex-end' }}>
              {steps.map((s, i) => (
                <div key={i} style={{
                  height: `${Math.max(s.pct, 3)}%`,
                  background: i === 3 ? C.orange : i === 0 ? C.orange300 : '#FFE5D6',
                  borderRadius: '6px 6px 0 0', transition: 'height .35s ease',
                }} />
              ))}
            </div>
          </>
        )}
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CATÉGORIES DE VENTES — donut depuis les items de commande
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
      .map(([name, rev]) => ({ name, rev, pct: t ? (rev / t) * 100 : 0 }))
      .sort((a, b) => b.rev - a.rev)
      .slice(0, 8)
      .map((c, i) => ({ ...c, color: CAT_COLORS[i % CAT_COLORS.length] }))
    return { cats: list, total: t }
  }, [subOrders])

  const R = 56, cx = 80, cy = 80, strokeW = 20
  const circ = 2 * Math.PI * R
  let offset = 0

  return (
    <Card>
      <CardHead title="Catégories de ventes" sub={loading ? null : `${cats.length} catégorie${cats.length > 1 ? 's' : ''}`} />

      {loading ? <Skel h={160} style={{ marginTop: 12, borderRadius: '50%', width: 160, marginLeft: 'auto', marginRight: 'auto' }} />
        : cats.length === 0 ? <Empty icon="PieChart" text="Aucune vente enregistrée." />
        : (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, position: 'relative' }}>
              <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
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
                <div style={{ fontSize: 10, color: C.faint, fontWeight: 500 }}>Total ventes</div>
                <div className="gsm-num" style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginTop: 2 }}>
                  {total >= 1000 ? `${(total / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}k` : fmt(total)}
                  <span style={{ fontSize: 9.5, color: C.faint, fontWeight: 500, marginLeft: 3 }}>TND</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {cats.map((c, i) => (
                <div key={i} style={{ background: `${c.color}12`, border: `1px solid ${c.color}1F`, padding: '7px 9px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 11, color: C.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                    {c.name} <span style={{ color: c.color, fontWeight: 700 }}>· {Math.round(c.pct)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PERFORMANCE PAR CANAL — demi-donut
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
      key: c.channel,
      name: CHANNEL_LABELS[c.channel] || c.channel,
      views: c.count,
      rate: convMap[c.channel]?.rate ?? null,
      color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
    }))
  }, [stats])

  const totalViews = channels.reduce((s, c) => s + c.views, 0)

  const W = 260, H = 140, cx = W / 2, cy = 126, r = 82, strokeW = 20
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
    <Card>
      <CardHead title="Performance par canal" sub="Mois en cours" />

      {loading ? <Skel h={140} style={{ marginTop: 12 }} />
        : channels.length === 0 ? <Empty icon="Radio" text="Aucune donnée de trafic." />
        : (
          <>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 10 }}>Pages vues :</div>
            <div className="gsm-num" style={{ fontSize: 22, fontWeight: 800, color: C.ink, lineHeight: 1 }}>{fmt(totalViews)}</div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 240, display: 'block' }}>
                {segments.map((s, i) => (
                  <path key={i} d={arcPath(s.start, s.end)} stroke={s.color} strokeWidth={strokeW} fill="none" strokeLinecap="round" />
                ))}
                <text x={cx} y={cy - 24} textAnchor="middle" fontSize="10" fill={C.faint} fontFamily="DM Sans">Canal principal :</text>
                <text x={cx} y={cy - 6} textAnchor="middle" fontSize="14" fontWeight="700" fill={C.ink} fontFamily="DM Sans">
                  {channels[0]?.name || '—'}
                </text>
              </svg>
            </div>

            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {channels.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11.5, color: C.ink, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  <span className="gsm-num" style={{ fontSize: 11.5, color: C.muted }}>{fmt(c.views)}</span>
                  {c.rate !== null && (
                    <span style={{ fontSize: 10, color: C.orange, background: C.orangeSoft, padding: '2px 6px', borderRadius: 8, fontWeight: 700 }}>{c.rate}%</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TOP PRODUITS — recherche + filtre catégorie + tri (adapté mobile)
// ═══════════════════════════════════════════════════════════════════
const SORTS = [
  { key: 'sold_count',     label: 'Vendus' },
  { key: 'base_price_tnd', label: 'Prix' },
  { key: 'rating_avg',     label: 'Note' },
]

function TopProducts({ products, loading }) {
  const [query, setQuery]         = useState('')
  const [catFilter, setCatFilter] = useState(null)
  const [sortKey, setSortKey]     = useState('sold_count')

  const categories = useMemo(
    () => [...new Set(products.map(p => p.category_name).filter(Boolean))],
    [products],
  )

  const rows = useMemo(() => {
    const r = products.filter(p => {
      if (query && !`${p.name} ${p.category_name || ''}`.toLowerCase().includes(query.toLowerCase())) return false
      if (catFilter && p.category_name !== catFilter) return false
      return true
    })
    return [...r].sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0)).slice(0, 8)
  }, [products, query, catFilter, sortKey])

  const cycleCat = () => {
    const i = catFilter ? categories.indexOf(catFilter) : -1
    setCatFilter(categories[i + 1] || null)
  }

  return (
    <Card>
      <CardHead title="Top produits" sub={loading ? null : `${products.length} produit${products.length > 1 ? 's' : ''} au catalogue`} />

      {/* Recherche */}
      <div style={{ background: C.line2, borderRadius: 14, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <Icons.Search size={13} color={C.faint} />
        <input type="text" placeholder="Rechercher un produit..." value={query} onChange={e => setQuery(e.target.value)}
               style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 12.5, width: '100%', color: C.ink }} />
        {query && <button onClick={() => setQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, color: C.faint, display: 'flex' }}><Icons.X size={13} /></button>}
      </div>

      {/* Filtre catégorie + tri */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
        <button onClick={cycleCat} style={{
          background: catFilter ? C.orangeSoft : C.line2, color: catFilter ? C.orange : C.ink,
          border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5, fontWeight: catFilter ? 700 : 500,
          padding: '7px 11px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          {catFilter || 'Catégorie'}<Icons.ChevronDown size={11} strokeWidth={2.4} />
        </button>
        <span style={{ flex: 1 }} />
        <Seg value={sortKey} options={SORTS} onChange={setSortKey} />
      </div>

      {/* Liste */}
      <div style={{ marginTop: 12 }}>
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0' }}>
              <Skel h={40} w={40} style={{ borderRadius: 11, flexShrink: 0 }} />
              <div style={{ flex: 1 }}><Skel h={11} w="70%" /><div style={{ height: 5 }} /><Skel h={8} w="45%" /></div>
            </div>
          ))
        ) : rows.length === 0 ? (
          <Empty icon="PackageSearch" text={products.length ? 'Aucun produit ne correspond.' : 'Aucun produit au catalogue.'} />
        ) : rows.map((p, i) => (
          <Link key={p.id || i} to={`/supplier/products/${p.id}/edit`} style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', textDecoration: 'none',
            borderBottom: i < rows.length - 1 ? `1px solid ${C.line2}` : 'none',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: C.orangeTint, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {p.primary_image
                ? <img src={p.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                : <Icons.Package size={17} color={C.orange} strokeWidth={1.8} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div style={{ fontSize: 10.5, color: C.faint, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.category_name || '—'} · Stock <span style={{ color: Number(p.stock_qty) > 0 ? C.muted : C.red, fontWeight: 600 }}>{fmt(p.stock_qty)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="gsm-num" style={{ fontSize: 14, fontWeight: 800, color: C.orange, lineHeight: 1 }}>
                {fmt(p.sold_count)}<span style={{ fontSize: 9, color: C.faint, fontWeight: 500, marginLeft: 2 }}>vendus</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: C.muted, marginTop: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  <Icons.Star size={10} fill="#FFB800" stroke="#FFB800" />{Number(p.rating_avg || 0).toFixed(1)}
                </span>
                · {fmtDec(p.base_price_tnd)} TND
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// VENTES & COMMANDES PAR STATUT
// ═══════════════════════════════════════════════════════════════════
const STATUS_LABELS = {
  pending: 'En attente', confirmed: 'Confirmées', in_production: 'En production',
  shipped: 'Expédiées', delivered: 'Livrées', cancelled: 'Annulées',
}
const STATUS_COLORS = {
  pending: C.orange300, confirmed: C.orange400, in_production: '#FF6B35',
  shipped: C.orange, delivered: C.green, cancelled: '#D1D5DB',
}

function OrdersByStatus({ subOrders, loading }) {
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
        label:   STATUS_LABELS[status] || status,
        color:   STATUS_COLORS[status] || C.orange300,
        value:   v.count,
        revenue: v.revenue,
        share:   total ? ((v.count / total) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value)
  }, [subOrders])

  const total    = subOrders.length
  const maxValue = rows.length ? rows[0].value : 1

  return (
    <Card style={{ marginBottom: 4 }}>
      <CardHead title="Ventes & commandes" sub="Par statut" />

      {loading ? <Skel h={140} style={{ marginTop: 12 }} />
        : rows.length === 0 ? <Empty icon="ClipboardList" text="Aucune commande." />
        : (
          <>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 12 }}>Total commandes :</div>
            <div className="gsm-num" style={{ fontSize: 24, fontWeight: 800, color: C.ink, lineHeight: 1, marginBottom: 14 }}>{fmt(total)}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rows.map(o => (
                <div key={o.status} style={{ display: 'grid', gridTemplateColumns: '76px 1fr auto', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.label}</span>
                  <div style={{ height: 12, background: C.line2, borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(o.value / maxValue) * 100}%`, background: o.color, borderRadius: 999, transition: 'width .4s ease' }} />
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="gsm-num" style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, lineHeight: 1 }}>{fmt(o.value)}</div>
                    <div style={{ fontSize: 9.5, color: C.faint, marginTop: 2 }}>{fmt(o.revenue)} TND</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
    </Card>
  )
}