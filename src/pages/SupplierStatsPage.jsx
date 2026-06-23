// pages/SupplierDashboardPage.jsx — GROSHOP.tn
// EzMart-style dashboard

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-dashboard-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-dashboard-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-dash { font-family: 'DM Sans', -apple-system, sans-serif; color: #0F1419; }
    .gs-h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-num { font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-card { background: #fff; border-radius: 18px; padding: 22px; border: none; box-shadow: 0 1px 3px rgba(15, 20, 25, 0.04); }

    .gs-trend-up   { background: #D1FAE5; color: #059669; padding: 3px 9px; border-radius: 10px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px; }
    .gs-trend-down { background: #FEE2E2; color: #DC2626; padding: 3px 9px; border-radius: 10px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px; }

    .gs-filter-btn {
      background: #FF4500;
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 14px;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: inherit;
    }
    .gs-filter-btn-ghost {
      background: #F5F6F8;
      color: #0F1419;
      border: none;
      padding: 6px 12px;
      border-radius: 14px;
      font-size: 11.5px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: inherit;
    }

    .gs-input-clean { border: none; outline: none; background: transparent; font-family: inherit; }
    .gs-icon-btn-sm { background: transparent; border: none; cursor: pointer; padding: 4px; color: #9AA3AE; }
    .gs-icon-btn-sm:hover { color: #0F1419; }
  `
  document.head.appendChild(s)
}

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function SupplierDashboardPage() {
  return (
    <div className="gs-dash" style={{
      display: 'grid',
      gridTemplateColumns: '3fr 1.1fr',
      gap: 16,
    }}>
      {/* ── LEFT column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

        {/* Row 1 : 3 KPI cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
        }}>
          <KPICard
            label="Ventes totales"
            value="983 410"
            unit="TND"
            trend="+3,34%"
            trendUp
            icon="DollarSign"
            highlighted
          />
          <KPICard
            label="Commandes totales"
            value="58 375"
            trend="-2,89%"
            trendUp={false}
            icon="ShoppingCart"
          />
          <KPICard
            label="Visiteurs totaux"
            value="237 782"
            trend="+8,02%"
            trendUp
            icon="UserCircle2"
          />
        </div>

        {/* Row 2 : Revenue Analytics + Monthly Target */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 16,
        }}>
          <RevenueAnalytics />
          <MonthlyTarget />
        </div>

        {/* Row 3 : Active User + Conversion Rate */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: 16,
        }}>
          <ActiveUser />
          <ConversionRate />
        </div>

        {/* Row 4 : Recent Orders */}
        <ProductConversionTable />
      </div>

      {/* ── RIGHT column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TopCategories />
        <ChannelPerformance />
        <SalesOrdersAnalytics />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// KPI CARD — Total Sales / Orders / Visitors
// ═══════════════════════════════════════════════════════════════════
function KPICard({ label, value, unit, trend, trendUp, icon, highlighted }) {
  const Icon = Icons[icon] || Icons.Circle
  const TrendIcon = trendUp ? Icons.TrendingUp : Icons.TrendingDown

  return (
    <div style={{
      background: highlighted ? '#FFF3E8' : '#fff',
      borderRadius: 18,
      padding: 20,
      boxShadow: '0 1px 3px rgba(15, 20, 25, 0.04)',
    }}>
      {/* Top row: label + icon */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
      }}>
        <div style={{ fontSize: 12.5, color: '#6B7280', fontWeight: 500 }}>
          {label}
        </div>
        <div style={{
          width: 34, height: 34,
          borderRadius: 10,
          background: highlighted ? '#FF4500' : 'transparent',
          border: highlighted ? 'none' : '1px solid #F1F2F4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon
            size={17}
            color={highlighted ? '#fff' : '#9AA3AE'}
            strokeWidth={highlighted ? 2.2 : 1.8}
          />
        </div>
      </div>

      {/* Value + trend */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span className="gs-num" style={{ fontSize: 26, color: '#0F1419', lineHeight: 1 }}>
          {value}
          {unit && (
            <span style={{ fontSize: 12, color: '#9AA3AE', marginLeft: 4, fontWeight: 500 }}>
              {unit}
            </span>
          )}
        </span>
        <span className={trendUp ? 'gs-trend-up' : 'gs-trend-down'}>
          <TrendIcon size={10} strokeWidth={2.6} />{trend}
        </span>
      </div>
      <div style={{ fontSize: 10.5, color: '#9AA3AE', marginTop: 6 }}>
        vs semaine dernière
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// REVENUE ANALYTICS — line chart
// ═══════════════════════════════════════════════════════════════════
function RevenueAnalytics() {
  const [hoveredIndex, setHoveredIndex] = useState(4)

  const data = [
    { day: '12 Août', revenue: 9500,  orders: 5000 },
    { day: '13 Août', revenue: 11000, orders: 6500 },
    { day: '14 Août', revenue: 10000, orders: 5500 },
    { day: '15 Août', revenue: 12500, orders: 7000 },
    { day: '16 Août', revenue: 14521, orders: 8500 },
    { day: '17 Août', revenue: 12000, orders: 6800 },
    { day: '18 Août', revenue: 13500, orders: 7500 },
    { day: '19 Août', revenue: 13000, orders: 7200 },
  ]

  const W = 700, H = 240
  const padding = { top: 20, right: 16, bottom: 30, left: 42 }
  const chartW = W - padding.left - padding.right
  const chartH = H - padding.top - padding.bottom
  const maxValue = 16000

  const toPoints = (key) => data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - (d[key] / maxValue) * chartH,
  }))

  const revPts = toPoints('revenue')
  const ordPts = toPoints('orders')

  const smooth = (pts) => {
    if (pts.length < 2) return ''
    let path = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[i + 2] || p2
      const c1x = p1.x + (p2.x - p0.x) / 6
      const c1y = p1.y + (p2.y - p0.y) / 6
      const c2x = p2.x - (p3.x - p1.x) / 6
      const c2y = p2.y - (p3.y - p1.y) / 6
      path += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`
    }
    return path
  }

  const yTicks = [0, 4000, 8000, 12000, 16000]

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * W
    const stepX = chartW / (data.length - 1)
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((mouseX - padding.left) / stepX)))
    setHoveredIndex(idx)
  }

const sel = hoveredIndex !== null ? revPts[hoveredIndex] : null
const selValue = hoveredIndex !== null ? data[hoveredIndex].revenue : null

  return (
    <div className="gs-card" style={{ padding: '22px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="gs-h1" style={{ fontSize: 17 }}>Analyse des revenus</div>
        <button className="gs-filter-btn">
          8 derniers jours
          <Icons.ChevronDown size={12} strokeWidth={2.4} />
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <Legend color="#FF4500" label="Revenus" />
        <Legend color="#FFB088" label="Commandes" dashed />
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%"
           preserveAspectRatio="xMidYMid meet"
           style={{ display: 'block', cursor: 'crosshair', marginTop: 8 }}
           onMouseMove={handleMove}
           onMouseLeave={() => setHoveredIndex(null)}>
        <defs>
          <linearGradient id="revGradEz" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4500" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y axis ticks */}
        {yTicks.map(val => {
          const y = padding.top + chartH - (val / maxValue) * chartH
          return (
            <g key={val}>
              <line x1={padding.left} y1={y} x2={W - padding.right} y2={y}
                    stroke="#F1F2F4" strokeWidth="1" strokeDasharray="3 5" />
              <text x={padding.left - 8} y={y + 3} textAnchor="end"
                    fontSize="10" fill="#9AA3AE" fontFamily="DM Sans">
                {val === 0 ? '0' : `${val / 1000}K`}
              </text>
            </g>
          )
        })}

        {/* Area + lines */}
        <path d={smooth(revPts) + ` L ${revPts[revPts.length-1].x} ${padding.top + chartH} L ${revPts[0].x} ${padding.top + chartH} Z`}
              fill="url(#revGradEz)" style={{ pointerEvents: 'none' }} />
        <path d={smooth(ordPts)} stroke="#FFB088" strokeWidth="2.2" fill="none"
              strokeDasharray="5 4" strokeLinecap="round" style={{ pointerEvents: 'none' }} />
        <path d={smooth(revPts)} stroke="#FF4500" strokeWidth="2.5" fill="none"
              strokeLinecap="round" style={{ pointerEvents: 'none' }} />

        {/* Hover tooltip */}
        {hoveredIndex !== null && sel && (
          <g style={{ pointerEvents: 'none' }}>
            <line x1={sel.x} y1={padding.top} x2={sel.x} y2={padding.top + chartH}
                  stroke="#FF4500" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.5" />
            <circle cx={sel.x} cy={sel.y} r="5" fill="#FF4500" stroke="#fff" strokeWidth="2.5" />

            {/* Tooltip box */}
            <g transform={`translate(${sel.x - 50}, ${sel.y - 48})`}>
              <rect x="0" y="0" width="100" height="36" rx="8" fill="#fff"
                    stroke="#E5E7EB" strokeWidth="1" />
              <text x="50" y="14" textAnchor="middle"
                    fontSize="9.5" fill="#9AA3AE" fontFamily="DM Sans">
                Revenus
              </text>
              <text x="50" y="29" textAnchor="middle"
                    fontSize="12" fill="#0F1419" fontWeight="700" fontFamily="DM Sans">
                {selValue.toLocaleString('fr-FR')} TND
              </text>
            </g>
          </g>
        )}

        {/* X labels */}
        {data.map((d, i) => {
          const x = padding.left + (i / (data.length - 1)) * chartW
          return (
            <text key={i} x={x} y={H - 8} textAnchor="middle"
                  fontSize="10" fill="#9AA3AE" fontFamily="DM Sans"
                  style={{ pointerEvents: 'none' }}>
              {d.day}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

function Legend({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6B7280' }}>
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
// MONTHLY TARGET — gauge
// ═══════════════════════════════════════════════════════════════════
function MonthlyTarget() {
  const pct = 85
  const W = 240, H = 130
  const cx = W / 2
  const cy = H - 10
  const r = 80
  const strokeW = 20

  const startAngle = Math.PI
  const endAngle = startAngle + (Math.PI * pct / 100)

  const arcPath = (start, end) => {
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    const largeArc = end - start > Math.PI ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  return (
    <div className="gs-card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="gs-h1" style={{ fontSize: 16 }}>Objectif mensuel</div>
        <button className="gs-icon-btn-sm">
          <Icons.MoreHorizontal size={16} />
        </button>
      </div>

      {/* Gauge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 240, display: 'block' }}>
          <defs>
            <linearGradient id="gaugeGradEz" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF8B5C" />
              <stop offset="100%" stopColor="#FF4500" />
            </linearGradient>
          </defs>
          {/* Track */}
          <path d={arcPath(startAngle, startAngle + Math.PI)}
                stroke="#FFE5D6" strokeWidth={strokeW} fill="none" strokeLinecap="round" />
          {/* Progress */}
          <path d={arcPath(startAngle, endAngle)}
                stroke="url(#gaugeGradEz)" strokeWidth={strokeW} fill="none" strokeLinecap="round" />
          {/* Center */}
          <text x={cx} y={cy - 18} textAnchor="middle"
                fontSize="28" fontWeight="700" fill="#0F1419" fontFamily="DM Sans">
            {pct}%
          </text>
          <text x={cx} y={cy - 2} textAnchor="middle"
                fontSize="9.5" fill="#059669" fontFamily="DM Sans" fontWeight="600">
            +8,02% vs mois dernier
          </text>
        </svg>
      </div>

      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1419' }}>
          Excellent rythme ! <span style={{ marginLeft: 2 }}>🎉</span>
        </div>
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4, lineHeight: 1.5 }}>
          Tes ventes ont augmenté de <span style={{ color: '#FF4500', fontWeight: 600 }}>200 000 TND</span>,<br />
          plus que <strong>15%</strong> pour atteindre 100%.
        </div>
      </div>

      {/* Target / Revenue boxes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginTop: 14,
      }}>
        <div style={{
          background: '#FFF3E8',
          padding: '8px 12px',
          borderRadius: 10,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, color: '#9AA3AE', fontWeight: 500 }}>Objectif</div>
          <div className="gs-num" style={{ fontSize: 13, color: '#0F1419', marginTop: 3 }}>
            600 000 <span style={{ fontSize: 9, color: '#9AA3AE', fontWeight: 500 }}>TND</span>
          </div>
        </div>
        <div style={{
          background: '#FFF3E8',
          padding: '8px 12px',
          borderRadius: 10,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, color: '#9AA3AE', fontWeight: 500 }}>Réalisé</div>
          <div className="gs-num" style={{ fontSize: 13, color: '#FF4500', marginTop: 3 }}>
            510 000 <span style={{ fontSize: 9, color: '#9AA3AE', fontWeight: 500 }}>TND</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ACTIVE USER
// ═══════════════════════════════════════════════════════════════════
const TUN_GEO_URL = 'https://cdn.jsdelivr.net/npm/datamaps@0.5.9/src/js/data/tun.topo.json'

const TUN_NAME_MAP = {
  Tunis: 'Tunis', Ariana: 'Ariana', 'Ben Arous': 'Ben Arous',
  'La Manouba': 'Manouba', Manouba: 'Manouba', Nabeul: 'Nabeul',
  Zaghouan: 'Zaghouan', Bizerte: 'Bizerte', Beja: 'Béja', Béja: 'Béja',
  Jendouba: 'Jendouba', 'Le Kef': 'Le Kef', Kef: 'Le Kef',
  Siliana: 'Siliana', Sousse: 'Sousse', Monastir: 'Monastir',
  Mahdia: 'Mahdia', Sfax: 'Sfax', Kairouan: 'Kairouan',
  Kasserine: 'Kasserine', 'Sidi Bouzid': 'Sidi Bouzid',
  Gabes: 'Gabès', Gabès: 'Gabès', Medenine: 'Médenine',
  Médenine: 'Médenine', Tataouine: 'Tataouine', Gafsa: 'Gafsa',
  Tozeur: 'Tozeur', Kebili: 'Kébili', Kébili: 'Kébili',
}
// ═══════════════════════════════════════════════════════════════════
// ACTIVE USER — map Tunisie + liste gouvernorats
// ═══════════════════════════════════════════════════════════════════
function ActiveUser() {
  const govData = [
    { name: 'Tunis',    pct: 22 },
    { name: 'Sfax',     pct: 18 },
    { name: 'Sousse',   pct: 14 },
    { name: 'Ariana',   pct: 11 },
    { name: 'Nabeul',   pct: 9 },
    { name: 'Monastir', pct: 8 },
    { name: 'Bizerte',  pct: 6 },
    { name: 'Gabès',    pct: 5 },
  ]

  const dataMap = Object.fromEntries(govData.map(g => [g.name, g.pct]))
  const maxPct = govData[0].pct

  // Échelle orange basée sur le % du gouvernorat
  const fillFor = (name) => {
    const pct = dataMap[name]
    if (!pct) return '#F1F2F4'                       // pas dans le top 8
    const t = pct / maxPct
    if (t >= 0.80) return '#FF4500'                  // Tunis
    if (t >= 0.60) return '#FF6B35'
    if (t >= 0.45) return '#FF8B5C'
    if (t >= 0.30) return '#FFB088'
    return '#FFD9C5'
  }

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="gs-h1" style={{ fontSize: 16 }}>Utilisateurs actifs</div>
        <button className="gs-icon-btn-sm">
          <Icons.MoreHorizontal size={16} />
        </button>
      </div>
      <div style={{ fontSize: 11, color: '#9AA3AE', marginTop: 4, marginBottom: 16 }}>
        Top 8 gouvernorats
      </div>

      {/* Liste + carte côte à côte */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* LEFT : liste */}
        <div style={{
          flex: 1.4,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          minWidth: 0,
        }}>
          {govData.map(g => (
            <div key={g.name} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: fillFor(g.name),
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 12, color: '#0F1419', fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {g.name}
                </span>
              </div>
              <span className="gs-num" style={{
                fontSize: 12.5, color: '#0F1419',
                flexShrink: 0,
              }}>
                {g.pct}%
              </span>
            </div>
          ))}
        </div>

        {/* RIGHT : carte Tunisie */}
        <div style={{ flex: 1, minWidth: 0, marginTop: -8 }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ center: [9.5, 34], scale: 1400 }}
            width={140}
            height={210}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            <Geographies geography={TUN_GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const raw = geo.properties.name || geo.properties.NAME || ''
                  const name = TUN_NAME_MAP[raw] || raw
                  const fill = fillFor(name)
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill,
                          stroke: '#fff',
                          strokeWidth: 0.6,
                          outline: 'none',
                        },
                        hover: {
                          fill,
                          stroke: '#FF4500',
                          strokeWidth: 1.2,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        pressed: { fill, outline: 'none' },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ComposableMap>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CONVERSION RATE
// ═══════════════════════════════════════════════════════════════════
function ConversionRate() {
  const steps = [
    { label: 'Vues produits',          value: '25 000', trend: '+9%',  trendUp: true,  pct: 100 },
    { label: 'Ajoutés au panier',      value: '12 000', trend: '+6%',  trendUp: true,  pct: 48 },
    { label: 'Procédés au paiement',   value: '8 500',  trend: '+4%',  trendUp: true,  pct: 34 },
    { label: 'Achats complétés',       value: '6 200',  trend: '+7%',  trendUp: true,  pct: 25 },
    { label: 'Paniers abandonnés',     value: '3 000',  trend: '-5%',  trendUp: false, pct: 12 },
  ]

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div className="gs-h1" style={{ fontSize: 17 }}>Taux de conversion</div>
        <button className="gs-filter-btn">
          Cette semaine
          <Icons.ChevronDown size={12} strokeWidth={2.4} />
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 10,
      }}>
        {steps.map((step, i) => (
          <div key={i}>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, marginBottom: 8, minHeight: 28 }}>
              {step.label}
            </div>
            <div className="gs-num" style={{ fontSize: 19, color: '#0F1419', lineHeight: 1 }}>
              {step.value}
            </div>
            <div style={{ marginTop: 8 }}>
              <span className={step.trendUp ? 'gs-trend-up' : 'gs-trend-down'}>
                {step.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart underneath */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 10,
        marginTop: 16,
        height: 90,
        alignItems: 'flex-end',
      }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            height: `${step.pct}%`,
            background: i === 0 ? '#FFB088' : i === steps.length - 1 ? '#FF4500' : '#FFE5D6',
            borderRadius: '8px 8px 0 0',
            transition: 'height 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PRODUCT CONVERSION TABLE — funnel en table (remplace RecentOrders)
// ═══════════════════════════════════════════════════════════════════
function ProductConversionTable() {
  const products = [
    {
      name: "Huile d'olive extra vierge 5L", sku: 'GS-1042', category: 'Alimentation',
      icon: 'Wine', bg: '#FFE5D6',
      views: 8240, cart: 4120, checkout: 2850, purchased: 2180, abandoned: 670,
      conv: 26, demand: 'high',
    },
    {
      name: 'Café arabica moulu 1kg', sku: 'GS-1088', category: 'Alimentation',
      icon: 'Coffee', bg: '#E8DCC9',
      views: 5890, cart: 2350, checkout: 1670, purchased: 1320, abandoned: 480,
      conv: 22, demand: 'high',
    },
    {
      name: 'Savon bio à l\'huile d\'argan', sku: 'GS-2210', category: 'Beauté',
      icon: 'Sparkles', bg: '#EDE9FE',
      views: 3120, cart: 1870, checkout: 1340, purchased: 1050, abandoned: 290,
      conv: 33, demand: 'high',
    },
    {
      name: 'T-shirt coton bio col rond', sku: 'GS-3401', category: 'Mode',
      icon: 'Shirt', bg: '#D9E8FF',
      views: 4210, cart: 1680, checkout: 920, purchased: 610, abandoned: 310,
      conv: 14, demand: 'medium',
    },
    {
      name: 'Crevettes royales 1kg', sku: 'GS-1156', category: 'Alimentation',
      icon: 'Fish', bg: '#FFE0E8',
      views: 2840, cart: 920, checkout: 510, purchased: 320, abandoned: 240,
      conv: 11, demand: 'low',
    },
  ]

  const DEMAND = {
    high:   { bg: '#FCE7F3', color: '#BE185D', label: 'Forte' },
    medium: { bg: '#FFF3E8', color: '#FF4500', label: 'Moyenne' },
    low:    { bg: '#EDE9FE', color: '#7C3AED', label: 'Faible' },
  }

  const fmt = (n) => n.toLocaleString('fr-FR')

  // Colonnes : checkbox | Produit | Catégorie | Vues | Panier | Paiement | Achats | Abandons | Conv. | Demande | Action
  const cols = '32px 2.2fr 1fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.9fr 0.9fr 32px'

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      {/* ── Header section ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
      }}>
        <div className="gs-h1" style={{ fontSize: 17 }}>Conversion par produit</div>
        <div style={{ fontSize: 11.5, color: '#9AA3AE' }}>
          Funnel des {products.length} produits les plus consultés
        </div>
      </div>

      {/* ── Toolbar : search + filtres ── */}
      <div style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 14,
      }}>
        {/* Search */}
        <div style={{
          flex: 1,
          background: '#F5F6F8',
          borderRadius: 18,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <Icons.Search size={13} color="#9AA3AE" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="gs-input-clean"
            style={{ fontSize: 12, width: '100%' }}
          />
        </div>

        {/* Filters */}
        <button className="gs-filter-btn-ghost">
          Catégorie
          <Icons.ChevronDown size={11} strokeWidth={2.4} />
        </button>
        <button className="gs-filter-btn-ghost">
          Demande
          <Icons.ChevronDown size={11} strokeWidth={2.4} />
        </button>
        <button className="gs-filter-btn-ghost" title="Plus de filtres">
          <Icons.SlidersHorizontal size={12} strokeWidth={2.2} />
        </button>
        <button className="gs-filter-btn-ghost" title="Exporter">
          <Icons.Upload size={12} strokeWidth={2.2} />
        </button>
        <button className="gs-filter-btn">
          <Icons.Package size={12} strokeWidth={2.4} />
        </button>
      </div>

      {/* ── Table header ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: cols,
        padding: '10px 12px',
        fontSize: 10.5,
        color: '#9AA3AE',
        fontWeight: 600,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        borderBottom: '1px solid #F5F6F8',
      }}>
        <div>
          <input type="checkbox" style={{ accentColor: '#FF4500' }} />
        </div>
        <div>Produit</div>
        <div>Catégorie</div>
        <div style={{ textAlign: 'right' }}>Vues</div>
        <div style={{ textAlign: 'right' }}>Panier</div>
        <div style={{ textAlign: 'right' }}>Paiement</div>
        <div style={{ textAlign: 'right' }}>Achats</div>
        <div style={{ textAlign: 'right' }}>Abandons</div>
        <div style={{ textAlign: 'right' }}>Conv.</div>
        <div style={{ textAlign: 'center' }}>Demande</div>
        <div></div>
      </div>

      {/* ── Rows ── */}
      {products.map((p, i) => {
        const Icon = Icons[p.icon] || Icons.Package
        const demand = DEMAND[p.demand]
        return (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: cols,
            padding: '14px 12px',
            fontSize: 12.5,
            alignItems: 'center',
            borderBottom: i < products.length - 1 ? '1px solid #F5F6F8' : 'none',
            transition: 'background 0.15s',
          }}>
            {/* Checkbox */}
            <div>
              <input type="checkbox" style={{ accentColor: '#FF4500' }} />
            </div>

            {/* Produit (icon + name + SKU) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 11,
                background: p.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={20} strokeWidth={1.6} color="#0F1419" style={{ opacity: 0.75 }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontWeight: 600,
                  color: '#0F1419',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 10.5, color: '#9AA3AE', marginTop: 2 }}>
                  SKU: {p.sku}
                </div>
              </div>
            </div>

            {/* Catégorie */}
            <div style={{ color: '#6B7280', fontSize: 12 }}>{p.category}</div>

            {/* Funnel cells */}
            <div style={{ textAlign: 'right', color: '#0F1419', fontWeight: 500 }}>
              {fmt(p.views)}
            </div>
            <div style={{ textAlign: 'right', color: '#0F1419', fontWeight: 500 }}>
              {fmt(p.cart)}
            </div>
            <div style={{ textAlign: 'right', color: '#0F1419', fontWeight: 500 }}>
              {fmt(p.checkout)}
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="gs-num" style={{ color: '#FF4500', fontSize: 13 }}>
                {fmt(p.purchased)}
              </span>
            </div>
            <div style={{ textAlign: 'right', color: '#DC2626', fontWeight: 500 }}>
              {fmt(p.abandoned)}
            </div>

            {/* Conv. — badge mini */}
            <div style={{ textAlign: 'right' }}>
              <span style={{
                background: p.conv >= 25 ? '#D1FAE5' : p.conv >= 15 ? '#FEF3C7' : '#FEE2E2',
                color:      p.conv >= 25 ? '#059669' : p.conv >= 15 ? '#D97706' : '#DC2626',
                padding: '3px 9px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
              }}>
                {p.conv}%
              </span>
            </div>

            {/* Demande — badge avec icône éclair */}
            <div style={{ textAlign: 'center' }}>
              <span style={{
                background: demand.bg,
                color: demand.color,
                padding: '4px 11px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Icons.Zap size={10} strokeWidth={2.6} fill={demand.color} />
                {demand.label}
              </span>
            </div>

            {/* Action */}
            <div style={{ textAlign: 'right' }}>
              <button className="gs-icon-btn-sm">
                <Icons.MoreVertical size={14} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SortHeader({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
      {children}
      <Icons.ChevronsUpDown size={11} color="#9AA3AE" strokeWidth={2} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TOP CATEGORIES (RIGHT) — donut + list
// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// TOP CATEGORIES (RIGHT) — donut rainbow + chips legend
// ═══════════════════════════════════════════════════════════════════
function TopCategories() {
  const categories = [
    { name: 'Alimentation',  pct: 22, color: '#A855F7', icon: 'Apple' },
    { name: 'Boissons',      pct: 15, color: '#3B82F6', icon: 'Coffee' },
    { name: 'Hygiène',       pct: 12, color: '#06B6D4', icon: 'Droplets' },
    { name: 'Beauté',        pct: 10, color: '#6366F1', icon: 'Sparkles' },
    { name: 'Mode',          pct: 9,  color: '#EC4899', icon: 'Shirt' },
    { name: 'Maison & Déco', pct: 8,  color: '#EF4444', icon: 'Lamp' },
    { name: 'Cuisine',       pct: 7,  color: '#22C55E', icon: 'ChefHat' },
    { name: 'Électronique',  pct: 6,  color: '#84CC16', icon: 'Smartphone' },
    { name: 'Bureau',        pct: 6,  color: '#F59E0B', icon: 'PenLine' },
    { name: 'Bébé',          pct: 5,  color: '#F97316', icon: 'Baby' },
  ]

  // Donut config
  const R = 62
  const cx = 90, cy = 90
  const strokeW = 22
  const circumference = 2 * Math.PI * R
  let offset = 0

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="gs-h1" style={{ fontSize: 16 }}>Catégories de ventes</div>
        <span style={{ fontSize: 11.5, color: '#FF4500', fontWeight: 600, cursor: 'pointer' }}>
          Voir tout
        </span>
      </div>

      {/* Donut */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, position: 'relative' }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
          {categories.map((c, i) => {
            const dash = (c.pct / 100) * circumference
            const seg = (
              <circle
                key={i}
                cx={cx} cy={cy} r={R}
                fill="none"
                stroke={c.color}
                strokeWidth={strokeW}
                strokeDasharray={`${dash - 3} ${circumference}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            )
            offset += dash
            return seg
          })}
        </svg>

        {/* Centre */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 10.5, color: '#9AA3AE', fontWeight: 500 }}>
            Total ventes
          </div>
          <div className="gs-num" style={{ fontSize: 17, color: '#0F1419', marginTop: 2 }}>
            3,4M <span style={{ fontSize: 10, color: '#9AA3AE', fontWeight: 500 }}>TND</span>
          </div>
        </div>
      </div>

      {/* Legend grid 2 colonnes */}
      <div style={{
        marginTop: 18,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
      }}>
        {categories.map((c, i) => {
          const Icon = Icons[c.icon] || Icons.Circle
          return (
            <div
              key={i}
              style={{
                background: `${c.color}12`,
                border: `1px solid ${c.color}1F`,
                padding: '7px 9px',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                minWidth: 0,
              }}
            >
              <div style={{
                width: 22, height: 22,
                borderRadius: 6,
                background: c.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 2px 6px -1px ${c.color}66`,
              }}>
                <Icon size={11} color="#fff" strokeWidth={2.4} />
              </div>
              <div style={{
                fontSize: 11.5,
                color: '#0F1419',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}>
                {c.name} <span style={{ color: c.color, fontWeight: 700 }}>· {c.pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CHANNEL PERFORMANCE — semi-cercle App / Web (remplace TrafficSources)
// ═══════════════════════════════════════════════════════════════════
function ChannelPerformance() {
  const channels = [
    { name: 'App Android', revenue: 393364, orders: 23350, color: '#FF4500' },
    { name: 'Web Desktop', revenue: 275355, orders: 16345, color: '#FF8B5C' },
    { name: 'Web Mobile',  revenue: 216350, orders: 12842, color: '#FFB088' },
    { name: 'App iOS',     revenue: 98341,  orders: 5838,  color: '#FFD9C5' },
  ]

  const totalRevenue = channels.reduce((s, c) => s + c.revenue, 0)
  const totalOrders  = channels.reduce((s, c) => s + c.orders,  0)

  // Semi-cercle config
  const W = 280, H = 165
  const cx = W / 2
  const cy = 148
  const r = 92
  const strokeW = 22
  const gapRad = (5 * Math.PI) / 180   // 5° gap entre segments

  const arcPath = (start, end) => {
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
  }

  // Construire les segments le long du demi-cercle haut (π → 2π)
  const totalSpan = Math.PI - gapRad * (channels.length - 1)
  let cursor = Math.PI
  const segments = channels.map((c) => {
    const span = (c.revenue / totalRevenue) * totalSpan
    const seg = { ...c, start: cursor, end: cursor + span }
    cursor += span + gapRad
    return seg
  })

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="gs-h1" style={{ fontSize: 16 }}>Performance par canal</div>
        <button className="gs-icon-btn-sm">
          <Icons.MoreHorizontal size={16} />
        </button>
      </div>

      {/* Total revenue */}
      <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 14, marginBottom: 4 }}>
        Revenus totaux par canal :
      </div>
      <div className="gs-num" style={{ fontSize: 24, color: '#0F1419', lineHeight: 1 }}>
        {totalRevenue.toLocaleString('fr-FR')}
        <span style={{ fontSize: 12, color: '#9AA3AE', marginLeft: 4, fontWeight: 500 }}>
          TND
        </span>
      </div>

      {/* Semi-cercle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 260, display: 'block' }}>
          {segments.map((s, i) => (
            <path
              key={i}
              d={arcPath(s.start, s.end)}
              stroke={s.color}
              strokeWidth={strokeW}
              fill="none"
              strokeLinecap="round"
            />
          ))}

          {/* Centre : Total commandes */}
          <text
            x={cx} y={cy - 26}
            textAnchor="middle"
            fontSize="10.5"
            fill="#9AA3AE"
            fontFamily="DM Sans"
          >
            Commandes totales :
          </text>
          <text
            x={cx} y={cy - 6}
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill="#0F1419"
            fontFamily="DM Sans"
          >
            {totalOrders.toLocaleString('fr-FR')}
          </text>
        </svg>
      </div>

      {/* Legend grid 2 colonnes */}
      <div style={{
        marginTop: 12,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
      }}>
        {channels.map((c, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            minWidth: 0,
          }}>
            <span style={{
              width: 9, height: 9,
              borderRadius: '50%',
              background: c.color,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: 11.5,
              color: '#0F1419',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SALES & ORDERS ANALYTICS — bars + tooltip flottant
// ═══════════════════════════════════════════════════════════════════
function SalesOrdersAnalytics() {
  const [hoveredIndex, setHoveredIndex] = useState(1) // par défaut: En cours (comme la ref)

  const orders = [
    { status: 'Livrées',    value: 1020, share: '78,2', change: '+8%',  revenue: '168 400', color: '#FF4500' },
    { status: 'En cours',   value: 200,  share: '15,3', change: '+11%', revenue: '6 900',   color: '#FF8B5C' },
    { status: 'Annulées',   value: 69,   share: '5,3',  change: '-3%',  revenue: '0',       color: '#FFB088' },
    { status: 'Retournées', value: 16,   share: '1,2',  change: '-1%',  revenue: '540',     color: '#FFD9C5' },
  ]

  const total = orders.reduce((s, o) => s + o.value, 0)
  const maxValue = orders[0].value
  const ROW_HEIGHT = 34

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
      }}>
        <div className="gs-h1" style={{ fontSize: 15.5, lineHeight: 1.2 }}>
          Analyse Ventes & Commandes
        </div>
        <button className="gs-filter-btn-ghost" style={{ flexShrink: 0 }}>
          Juin
          <Icons.ChevronDown size={11} strokeWidth={2.4} />
        </button>
      </div>

      {/* Total */}
      <div style={{ fontSize: 11, color: '#9AA3AE', marginTop: 16, marginBottom: 6 }}>
        Total commandes :
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 18,
      }}>
        <span className="gs-num" style={{ fontSize: 26, color: '#0F1419', lineHeight: 1 }}>
          {total.toLocaleString('fr-FR')}
        </span>
        <span className="gs-trend-up">
          +6% <Icons.TrendingUp size={10} strokeWidth={2.6} />
        </span>
        <span style={{ fontSize: 10.5, color: '#9AA3AE' }}>
          vs 1 230 mois dernier
        </span>
      </div>

      {/* Bars container */}
      <div style={{ position: 'relative', overflow: 'visible' }}>
        {orders.map((o, i) => {
          const widthPct = (o.value / maxValue) * 100
          const isHovered = hoveredIndex === i
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 50px',
                alignItems: 'center',
                gap: 10,
                height: ROW_HEIGHT,
                cursor: 'pointer',
              }}
            >
              {/* Label */}
              <span style={{
                fontSize: 11.5,
                color: isHovered ? '#0F1419' : '#6B7280',
                fontWeight: isHovered ? 600 : 500,
                transition: 'color 0.15s',
              }}>
                {o.status}
              </span>

              {/* Bar */}
              <div style={{ height: 22, position: 'relative' }}>
                <div style={{
                  height: '100%',
                  width: `${widthPct}%`,
                  background: o.color,
                  borderRadius: 999,
                  opacity: isHovered ? 1 : 0.88,
                  transition: 'opacity 0.18s, transform 0.18s',
                  transform: isHovered ? 'scaleY(1.08)' : 'scaleY(1)',
                  transformOrigin: 'left center',
                }} />
              </div>

              {/* Value */}
              <span className="gs-num" style={{
                fontSize: 12,
                color: '#0F1419',
                textAlign: 'right',
              }}>
                {o.value.toLocaleString('fr-FR')}
              </span>
            </div>
          )
        })}

        {/* Tooltip flottant */}
        {hoveredIndex !== null && (
          <div style={{
            position: 'absolute',
            top: hoveredIndex * ROW_HEIGHT + 6,
            right: 0,
            background: '#fff',
            borderRadius: 12,
            padding: '12px 14px',
            boxShadow: '0 12px 28px -8px rgba(15, 20, 25, 0.20), 0 0 0 1px rgba(15, 20, 25, 0.06)',
            zIndex: 10,
            width: 160,
            pointerEvents: 'none',
          }}>
            <div className="gs-num" style={{
              fontSize: 14,
              color: '#0F1419',
              marginBottom: 10,
            }}>
              {orders[hoveredIndex].value.toLocaleString('fr-FR')} Commandes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SOATipRow color="#E5E7EB" label="Part"      value={`${orders[hoveredIndex].share}%`} />
              <SOATipRow color="#E5E7EB" label="Évolution" value={orders[hoveredIndex].change} />
              <SOATipRow color={orders[hoveredIndex].color} label="Revenus" value={`${orders[hoveredIndex].revenue} TND`} bold />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SOATipRow({ color, label, value, bold }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5 }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: color, flexShrink: 0,
      }} />
      <span style={{ flex: 1, color: '#9AA3AE' }}>{label} :</span>
      <span style={{
        color: '#0F1419',
        fontWeight: bold ? 700 : 600,
      }}>
        {value}
      </span>
    </div>
  )
}