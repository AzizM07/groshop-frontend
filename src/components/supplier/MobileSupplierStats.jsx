// src/components/supplier/MobileSupplierStats.jsx — GROSHOP.tn
// Version téléphone de la page Statistiques. Sélecteur de période en haut,
// KPI 2×2, courbe des vues, top produits, sources de trafic.
// Suppose `analyticsApi.supplierStats({ period })` — adapte à ta signature.

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { analytics as analyticsApi, products as productsApi } from '../../lib/api'

/* Seule teinte orange du projet. */
const ORANGE      = '#ff5e20'
const ORANGE_TINT = 'rgba(255, 94, 32, .10)'

const INK='#0F1419', MUTE='#6B7280', FAINT='#9AA3AE', LINE='#F0EDE5'
const GREEN='#059669', RED='#DC2626'
const FONT='"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const PERIODS = [
  { key: '7d',  label: '7 j',  days: 7 },
  { key: '30d', label: '30 j', days: 30 },
  { key: '90d', label: '90 j', days: 90 },
]

const fmt = (n) => Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })
const fmtPct = (v, d = 1) => `${(Number(v) || 0).toLocaleString('fr-FR', { maximumFractionDigits: d })}%`

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

// ═══════════════════════════════════════════════════════════════════
export default function MobileSupplierStats() {
  const [period, setPeriod] = useState('30d')
  const [stats, setStats]   = useState(null)
  const [prods, setProds]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    Promise.all([
      analyticsApi.supplierStats?.({ period }).catch(() => null),
      productsApi.mine?.().catch(() => []),
    ]).then(([s, p]) => {
      if (!alive) return
      setStats(s)
      setProds(Array.isArray(p) ? p : (p?.results || []))
    }).finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [period])

  const kpi = useMemo(() => ({
    views:      stats?.total_views    ?? stats?.views    ?? 0,
    uniques:    stats?.total_uniques  ?? stats?.uniques  ?? 0,
    orders:     stats?.total_orders   ?? stats?.orders   ?? 0,
    conversion: stats?.conversion_rate ?? 0,
    viewsTrend:      stats?.views_trend      ?? 0,
    uniquesTrend:    stats?.uniques_trend    ?? 0,
    ordersTrend:     stats?.orders_trend     ?? 0,
    conversionTrend: stats?.conversion_trend ?? 0,
  }), [stats])

  return (
    <div style={{ fontFamily: FONT }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
        Statistiques
      </h1>
      <p style={{ margin: '0 0 14px', fontSize: 12.5, color: MUTE }}>
        Trafic, conversions et top produits.
      </p>

      {/* Sélecteur de période */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {PERIODS.map(p => {
          const on = p.key === period
          return (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              style={{
                flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: on ? ORANGE_TINT : '#fff',
                color: on ? ORANGE : FAINT,
                fontWeight: on ? 700 : 500, fontSize: 12,
                padding: '9px 0', borderRadius: 12,
                boxShadow: on ? 'none' : 'inset 0 0 0 1px #EFECE4',
              }}>
              {p.label}
            </button>
          )
        })}
      </div>

      {/* KPI 2×2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <KPICard label="Vues" value={fmt(kpi.views)}
                 trend={fmtTrend(kpi.viewsTrend)} trendUp={kpi.viewsTrend >= 0}
                 subtitle="vs période préc." loading={loading} />
        <KPICard label="Visiteurs" value={fmt(kpi.uniques)}
                 trend={fmtTrend(kpi.uniquesTrend)} trendUp={kpi.uniquesTrend >= 0}
                 subtitle="uniques" loading={loading} />
        <KPICard label="Commandes" value={fmt(kpi.orders)}
                 trend={fmtTrend(kpi.ordersTrend)} trendUp={kpi.ordersTrend >= 0}
                 subtitle="passées" loading={loading} />
        <KPICard label="Conversion" value={fmtPct(kpi.conversion, 2)}
                 trend={fmtTrend(kpi.conversionTrend)} trendUp={kpi.conversionTrend >= 0}
                 subtitle="taux" loading={loading} />
      </div>

      <ViewsChart stats={stats} period={period} loading={loading} />
      <TopProducts stats={stats} prods={prods} loading={loading} />
      <TrafficSources stats={stats} loading={loading} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function KPICard({ label, value, trend, trendUp, subtitle, loading }) {
  const len = String(value).replace(/\s/g, '').length
  const size = len <= 3 ? 26 : len <= 5 ? 22 : 18

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 13,
      border: '1px solid #EFECE4',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ flex: 1, fontSize: 11, color: MUTE, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      </div>

      {loading ? (
        <div style={{ margin: '10px 0 8px' }}><Skel h={22} w="65%" /></div>
      ) : (
        <div style={{
          fontSize: size, fontWeight: 800, color: INK, letterSpacing: '-0.035em', lineHeight: 1, marginTop: 8,
        }}>
          {value}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, minHeight: 14 }}>
        {loading ? <Skel h={12} w={60} /> : (
          <>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 700, color: trendUp ? GREEN : RED }}>
              {trendUp ? <Icons.TrendingUp size={10} strokeWidth={2.6} /> : <Icons.TrendingDown size={10} strokeWidth={2.6} />}
              {trend}
            </span>
            {subtitle && <span style={{ fontSize: 10, color: FAINT }}>{subtitle}</span>}
          </>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Vues sur la période
// ═══════════════════════════════════════════════════════════════════
function ViewsChart({ stats, period, loading }) {
  const [hovered, setHovered] = useState(null)

  const data = useMemo(() => {
    const src = stats?.views_by_day || []
    const map = Object.fromEntries(src.map(r => [r.date, r]))
    const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const days = PERIODS.find(p => p.key === period)?.days || 30
    /* Sur 30 ou 90 jours, on regroupe pour ne pas tasser les barres.
       7 → journalier, 30 → 6 points de 5j, 90 → 9 points de 10j. */
    const step  = days <= 7 ? 1 : days <= 30 ? 5 : 10
    const out = []
    const now = new Date()
    for (let end = days; end > 0; end -= step) {
      let sum = 0
      for (let i = 0; i < step && end - i > 0; i++) {
        const d = new Date(now); d.setDate(d.getDate() - (end - i - 1))
        sum += map[key(d)]?.views ?? 0
      }
      const start = new Date(now); start.setDate(start.getDate() - end + 1)
      out.push({
        label: start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        value: sum,
      })
    }
    return out
  }, [stats, period])

  const hasData = data.some(d => d.value > 0)
  const W = 320, H = 130
  const pad = { top: 10, right: 6, bottom: 22, left: 30 }
  const cw = W - pad.left - pad.right
  const ch = H - pad.top - pad.bottom
  const rawMax = Math.max(...data.map(d => d.value), 1)
  const maxValue = Math.ceil(rawMax / 4 / 10) * 10 * 4 || 4
  const yTicks = [0, 0.5, 1].map(t => Math.round(maxValue * t))

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
  const area = hasData ? line + ` L ${pts[pts.length - 1].x} ${pad.top + ch} L ${pts[0].x} ${pad.top + ch} Z` : ''

  const onMove = (e) => {
    if (!hasData) return
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * W
    const step = cw / Math.max(data.length - 1, 1)
    setHovered(Math.max(0, Math.min(data.length - 1, Math.round((mx - pad.left) / step))))
  }

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>Vues sur la période</span>
        <span style={{ flex: 1 }} />
      </div>

      {loading ? <Skel h={110} />
        : !hasData ? <Empty icon="Eye" text="Aucune donnée sur cette période." />
        : (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet"
               style={{ display: 'block', cursor: 'crosshair' }}
               onMouseMove={onMove} onMouseLeave={() => setHovered(null)}>
            <defs>
              <linearGradient id="stArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ORANGE} stopOpacity="0.20" />
                <stop offset="100%" stopColor={ORANGE} stopOpacity="0" />
              </linearGradient>
            </defs>

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

            <path d={area} fill="url(#stArea)" style={{ pointerEvents: 'none' }} />
            <path d={line} stroke={ORANGE} strokeWidth="2.4" fill="none" strokeLinecap="round" style={{ pointerEvents: 'none' }} />

            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i === hovered ? 4.5 : 3}
                fill={ORANGE} stroke="#fff" strokeWidth={i === hovered ? 2 : 1.5}
                style={{ pointerEvents: 'none' }} />
            ))}

            {hovered !== null && pts[hovered] && (
              <g style={{ pointerEvents: 'none' }}>
                <rect x={Math.min(Math.max(pts[hovered].x - 40, 2), W - 82)} y={Math.max(pts[hovered].y - 32, 2)}
                      width="80" height="24" rx="12" fill={INK} />
                <text x={Math.min(Math.max(pts[hovered].x, 42), W - 42)} y={Math.max(pts[hovered].y - 16, 18)}
                      textAnchor="middle" fontSize="10" fill="#fff" fontWeight="600" fontFamily="DM Sans">
                  {fmt(data[hovered].value)} vues
                </text>
              </g>
            )}

            {data.map((d, i) => (
              (i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) && (
                <text key={i} x={pts[i].x} y={H - 6} textAnchor="middle" fontSize="9.5"
                      fill={i === hovered ? INK : FAINT} fontWeight={i === hovered ? 600 : 500}
                      fontFamily="DM Sans" style={{ pointerEvents: 'none' }}>
                  {d.label}
                </text>
              )
            ))}
          </svg>
        )}
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Top produits
// ═══════════════════════════════════════════════════════════════════
function TopProducts({ stats, prods, loading }) {
  const rows = useMemo(() => {
    /* Le backend renvoie idéalement `top_products` avec vues et conversions.
       En secours, on classe les produits par nombre de vues stocké sur eux. */
    if (stats?.top_products?.length) return stats.top_products.slice(0, 5)
    return [...prods]
      .filter(p => p.status === 'approved')
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        image: p.primary_image,
        views: p.views_count || 0,
        orders: p.sold_count || 0,
      }))
  }, [stats, prods])

  const max = Math.max(...rows.map(r => r.views || 0), 1)

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>Top produits</span>
        <span style={{ flex: 1 }} />
        <Link to="/supplier/products" style={{ fontSize: 11.5, color: ORANGE, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          Tout voir <Icons.ChevronRight size={12} strokeWidth={2.4} />
        </Link>
      </div>

      {loading ? (
        [...Array(4)].map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
            <Skel h={36} w={36} style={{ borderRadius: 10, flexShrink: 0 }} />
            <div style={{ flex: 1 }}><Skel h={11} w="70%" /><div style={{ height: 4 }} /><Skel h={6} w="90%" /></div>
          </div>
        ))
      ) : rows.length === 0 ? (
        <Empty icon="Package" text="Aucun produit sur la période." />
      ) : rows.map((p, i) => (
        <Link key={p.id || i} to={`/supplier/products/${p.id}/edit`}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 0', textDecoration: 'none',
            borderBottom: i < rows.length - 1 ? '1px solid #F5F3EE' : 'none',
          }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: ORANGE_TINT,
            flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {p.image
              ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Icons.Package size={15} color={ORANGE} strokeWidth={2} />}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: INK, flexShrink: 0 }}>
                {fmt(p.views)}
                <span style={{ fontSize: 9, color: FAINT, fontWeight: 500, marginLeft: 2 }}>vues</span>
              </span>
            </div>
            <div style={{ height: 4, background: '#F5F3EE', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(p.views / max) * 100}%`, background: ORANGE, borderRadius: 2 }} />
            </div>
            {p.orders > 0 && (
              <div style={{ fontSize: 10, color: FAINT, marginTop: 4 }}>
                {fmt(p.orders)} commande{p.orders > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </Link>
      ))}
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Sources de trafic
// ═══════════════════════════════════════════════════════════════════
const SOURCE_ICONS = {
  direct:   'MousePointer',
  search:   'Search',
  social:   'Share2',
  referral: 'Link',
  other:    'Globe',
}
const SOURCE_LABELS = {
  direct:   'Direct',
  search:   'Recherche',
  social:   'Réseaux sociaux',
  referral: 'Sites référents',
  other:    'Autres',
}

function TrafficSources({ stats, loading }) {
  const rows = useMemo(() => {
    const src = stats?.traffic_sources || []
    if (!src.length) return []
    const total = src.reduce((s, r) => s + Number(r.count || 0), 0) || 1
    return [...src]
      .sort((a, b) => Number(b.count) - Number(a.count))
      .map(r => ({
        key: r.source || 'other',
        label: SOURCE_LABELS[r.source] || r.source || 'Autres',
        icon: SOURCE_ICONS[r.source] || 'Globe',
        count: Number(r.count || 0),
        pct: (Number(r.count || 0) / total) * 100,
      }))
  }, [stats])

  return (
    <Card style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>Sources de trafic</span>
      </div>

      {loading ? (
        [...Array(3)].map((_, i) => (
          <div key={i} style={{ padding: '8px 0' }}><Skel h={10} w="90%" /><div style={{ height: 5 }} /><Skel h={5} w="70%" /></div>
        ))
      ) : rows.length === 0 ? (
        <Empty icon="BarChart3" text="Pas encore de données sur les sources." />
      ) : rows.map((r, i) => {
        const I = Icons[r.icon] || Icons.Globe
        return (
          <div key={r.key} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 0',
            borderBottom: i < rows.length - 1 ? '1px solid #F5F3EE' : 'none',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: ORANGE_TINT,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <I size={15} color={ORANGE} strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: INK, flexShrink: 0 }}>
                  {fmtPct(r.pct)}
                </span>
              </div>
              <div style={{ height: 4, background: '#F5F3EE', borderRadius: 2, marginTop: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${r.pct}%`, background: ORANGE, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 10, color: FAINT, marginTop: 3 }}>{fmt(r.count)} visiteurs</div>
            </div>
          </div>
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