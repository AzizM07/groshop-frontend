// pages/SupplierDashboardPage.jsx — GROSHOP.tn
// EzMart-style dashboard — upgrade : orange unifié #FF5E00 (centralisé),
// micro-interactions (hover/ombres), tableau interactif (recherche/tri/filtres), responsive.
// Layout, positions et contenu des cartes : INCHANGÉS.

import { useState, useMemo } from 'react'
import * as Icons from 'lucide-react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

// ═══════════════════════════════════════════════════════════════════
// PALETTE — un seul endroit pour l'orange de marque
// ═══════════════════════════════════════════════════════════════════
const C = {
  orange:   '#FF5E00',
  orange600:'#E65400',
  orange400:'#FF8B5C',
  orange300:'#FFB088',
  orange200:'#FFD9C5',
  orangeSoft:'#FFF3E8',   // fond très clair (cartes highlight, chips)
  orangeGhost:'#FFF1EA',  // hover léger
  ink:      '#0F1419',
  muted:    '#6B7280',
  faint:    '#9AA3AE',
  line:     '#F1F2F4',
  line2:    '#F5F6F8',
}

// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-dashboard-styles-v2')) {
  document.querySelectorAll('style[id^="gs-dashboard-styles"]').forEach(el => el.remove())
  const s = document.createElement('style')
  s.id = 'gs-dashboard-styles-v2'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-dash { font-family: 'DM Sans', -apple-system, sans-serif; color: ${C.ink}; }
    .gs-h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-num { font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: -0.02em; }

    .gs-card {
      background: #fff; border-radius: 18px; padding: 22px; border: none;
      box-shadow: 0 1px 3px rgba(15,20,25,0.04);
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }
    .gs-card--hover:hover {
      box-shadow: 0 6px 20px -6px rgba(15,20,25,0.12);
      transform: translateY(-2px);
    }

    .gs-trend-up   { background: #D1FAE5; color: #059669; padding: 3px 9px; border-radius: 10px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px; }
    .gs-trend-down { background: #FEE2E2; color: #DC2626; padding: 3px 9px; border-radius: 10px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px; }

    .gs-filter-btn {
      background: ${C.orange}; color: #fff; border: none;
      padding: 6px 12px; border-radius: 14px; font-size: 11.5px; font-weight: 600;
      cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-family: inherit;
      transition: background 0.15s, transform 0.1s;
    }
    .gs-filter-btn:hover { background: ${C.orange600}; }
    .gs-filter-btn:active { transform: scale(0.97); }

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

    @media (max-width: 1100px) {
      .gs-grid-main { grid-template-columns: 1fr !important; }
      .gs-grid-2 { grid-template-columns: 1fr !important; }
      .gs-grid-21 { grid-template-columns: 1fr !important; }
      .gs-grid-12 { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 720px) {
      .gs-grid-3 { grid-template-columns: 1fr !important; }
      .gs-conv-cols { grid-template-columns: 1.6fr 0.9fr 0.9fr !important; }
    }
  `
  document.head.appendChild(s)
}

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function SupplierDashboardPage() {
  return (
    <div className="gs-dash gs-grid-main" style={{
      display: 'grid',
      gridTemplateColumns: '3fr 1.1fr',
      gap: 16,
    }}>
      {/* ── LEFT column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

        {/* Row 1 : 3 KPI cards */}
        <div className="gs-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <KPICard label="Ventes totales" value="983 410" unit="TND" trend="+3,34%" trendUp icon="DollarSign" highlighted />
          <KPICard label="Commandes totales" value="58 375" trend="-2,89%" trendUp={false} icon="ShoppingCart" />
          <KPICard label="Visiteurs totaux" value="237 782" trend="+8,02%" trendUp icon="UserCircle2" />
        </div>

        {/* Row 2 : Revenue Analytics + Monthly Target */}
        <div className="gs-grid-21" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <RevenueAnalytics />
          <MonthlyTarget />
        </div>

        {/* Row 3 : Active User + Conversion Rate */}
        <div className="gs-grid-12" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
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
// KPI CARD
// ═══════════════════════════════════════════════════════════════════
function KPICard({ label, value, unit, trend, trendUp, icon, highlighted }) {
  const Icon = Icons[icon] || Icons.Circle
  const TrendIcon = trendUp ? Icons.TrendingUp : Icons.TrendingDown

  return (
    <div className="gs-card--hover" style={{
      background: highlighted ? C.orangeSoft : '#fff',
      borderRadius: 18, padding: 20,
      boxShadow: '0 1px 3px rgba(15, 20, 25, 0.04)',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
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

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span className="gs-num" style={{ fontSize: 26, color: C.ink, lineHeight: 1 }}>
          {value}
          {unit && <span style={{ fontSize: 12, color: C.faint, marginLeft: 4, fontWeight: 500 }}>{unit}</span>}
        </span>
        <span className={trendUp ? 'gs-trend-up' : 'gs-trend-down'}>
          <TrendIcon size={10} strokeWidth={2.6} />{trend}
        </span>
      </div>
      <div style={{ fontSize: 10.5, color: C.faint, marginTop: 6 }}>vs semaine dernière</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// REVENUE ANALYTICS
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="gs-h1" style={{ fontSize: 17 }}>Analyse des revenus</div>
        <button className="gs-filter-btn">8 derniers jours<Icons.ChevronDown size={12} strokeWidth={2.4} /></button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <Legend color={C.orange} label="Revenus" />
        <Legend color={C.orange300} label="Commandes" dashed />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet"
           style={{ display: 'block', cursor: 'crosshair', marginTop: 8 }}
           onMouseMove={handleMove} onMouseLeave={() => setHoveredIndex(null)}>
        <defs>
          <linearGradient id="revGradEz" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.orange} stopOpacity="0.18" />
            <stop offset="100%" stopColor={C.orange} stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map(val => {
          const y = padding.top + chartH - (val / maxValue) * chartH
          return (
            <g key={val}>
              <line x1={padding.left} y1={y} x2={W - padding.right} y2={y} stroke={C.line} strokeWidth="1" strokeDasharray="3 5" />
              <text x={padding.left - 8} y={y + 3} textAnchor="end" fontSize="10" fill={C.faint} fontFamily="DM Sans">
                {val === 0 ? '0' : `${val / 1000}K`}
              </text>
            </g>
          )
        })}

        <path d={smooth(revPts) + ` L ${revPts[revPts.length-1].x} ${padding.top + chartH} L ${revPts[0].x} ${padding.top + chartH} Z`}
              fill="url(#revGradEz)" style={{ pointerEvents: 'none' }} />
        <path d={smooth(ordPts)} stroke={C.orange300} strokeWidth="2.2" fill="none" strokeDasharray="5 4" strokeLinecap="round" style={{ pointerEvents: 'none' }} />
        <path d={smooth(revPts)} stroke={C.orange} strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ pointerEvents: 'none' }} />

        {hoveredIndex !== null && sel && (
          <g style={{ pointerEvents: 'none' }}>
            <line x1={sel.x} y1={padding.top} x2={sel.x} y2={padding.top + chartH} stroke={C.orange} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.5" />
            <circle cx={sel.x} cy={sel.y} r="5" fill={C.orange} stroke="#fff" strokeWidth="2.5" />
            <g transform={`translate(${sel.x - 50}, ${sel.y - 48})`}>
              <rect x="0" y="0" width="100" height="36" rx="8" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
              <text x="50" y="14" textAnchor="middle" fontSize="9.5" fill={C.faint} fontFamily="DM Sans">Revenus</text>
              <text x="50" y="29" textAnchor="middle" fontSize="12" fill={C.ink} fontWeight="700" fontFamily="DM Sans">
                {selValue.toLocaleString('fr-FR')} TND
              </text>
            </g>
          </g>
        )}

        {data.map((d, i) => {
          const x = padding.left + (i / (data.length - 1)) * chartW
          return (
            <text key={i} x={x} y={H - 8} textAnchor="middle" fontSize="10" fill={C.faint} fontFamily="DM Sans" style={{ pointerEvents: 'none' }}>
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
// MONTHLY TARGET
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
        <button className="gs-icon-btn-sm"><Icons.MoreHorizontal size={16} /></button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 240, display: 'block' }}>
          <defs>
            <linearGradient id="gaugeGradEz" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={C.orange400} />
              <stop offset="100%" stopColor={C.orange} />
            </linearGradient>
          </defs>
          <path d={arcPath(startAngle, startAngle + Math.PI)} stroke="#FFE5D6" strokeWidth={strokeW} fill="none" strokeLinecap="round" />
          <path d={arcPath(startAngle, endAngle)} stroke="url(#gaugeGradEz)" strokeWidth={strokeW} fill="none" strokeLinecap="round" />
          <text x={cx} y={cy - 18} textAnchor="middle" fontSize="28" fontWeight="700" fill={C.ink} fontFamily="DM Sans">{pct}%</text>
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize="9.5" fill="#059669" fontFamily="DM Sans" fontWeight="600">+8,02% vs mois dernier</text>
        </svg>
      </div>

      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Excellent rythme ! <span style={{ marginLeft: 2 }}>🎉</span></div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>
          Tes ventes ont augmenté de <span style={{ color: C.orange, fontWeight: 600 }}>200 000 TND</span>,<br />
          plus que <strong>15%</strong> pour atteindre 100%.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
        <div style={{ background: C.orangeSoft, padding: '8px 12px', borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: C.faint, fontWeight: 500 }}>Objectif</div>
          <div className="gs-num" style={{ fontSize: 13, color: C.ink, marginTop: 3 }}>
            600 000 <span style={{ fontSize: 9, color: C.faint, fontWeight: 500 }}>TND</span>
          </div>
        </div>
        <div style={{ background: C.orangeSoft, padding: '8px 12px', borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: C.faint, fontWeight: 500 }}>Réalisé</div>
          <div className="gs-num" style={{ fontSize: 13, color: C.orange, marginTop: 3 }}>
            510 000 <span style={{ fontSize: 9, color: C.faint, fontWeight: 500 }}>TND</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ACTIVE USER — map Tunisie
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

  const fillFor = (name) => {
    const pct = dataMap[name]
    if (!pct) return C.line
    const t = pct / maxPct
    if (t >= 0.80) return C.orange
    if (t >= 0.60) return '#FF6B35'
    if (t >= 0.45) return C.orange400
    if (t >= 0.30) return C.orange300
    return '#FFD9C5'
  }

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="gs-h1" style={{ fontSize: 16 }}>Utilisateurs actifs</div>
        <button className="gs-icon-btn-sm"><Icons.MoreHorizontal size={16} /></button>
      </div>
      <div style={{ fontSize: 11, color: C.faint, marginTop: 4, marginBottom: 16 }}>Top 8 gouvernorats</div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ flex: 1.4, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          {govData.map(g => (
            <div key={g.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: fillFor(g.name), flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
              </div>
              <span className="gs-num" style={{ fontSize: 12.5, color: C.ink, flexShrink: 0 }}>{g.pct}%</span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0, marginTop: -8 }}>
          <ComposableMap projection="geoMercator" projectionConfig={{ center: [9.5, 34], scale: 1400 }}
                         width={140} height={210} style={{ width: '100%', height: 'auto', display: 'block' }}>
            <Geographies geography={TUN_GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const raw = geo.properties.name || geo.properties.NAME || ''
                  const name = TUN_NAME_MAP[raw] || raw
                  const fill = fillFor(name)
                  return (
                    <Geography key={geo.rsmKey} geography={geo}
                      style={{
                        default: { fill, stroke: '#fff', strokeWidth: 0.6, outline: 'none' },
                        hover: { fill, stroke: C.orange, strokeWidth: 1.2, outline: 'none', cursor: 'pointer' },
                        pressed: { fill, outline: 'none' },
                      }} />
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
    { label: 'Vues produits',        value: '25 000', trend: '+9%', trendUp: true,  pct: 100 },
    { label: 'Ajoutés au panier',    value: '12 000', trend: '+6%', trendUp: true,  pct: 48 },
    { label: 'Procédés au paiement', value: '8 500',  trend: '+4%', trendUp: true,  pct: 34 },
    { label: 'Achats complétés',     value: '6 200',  trend: '+7%', trendUp: true,  pct: 25 },
    { label: 'Paniers abandonnés',   value: '3 000',  trend: '-5%', trendUp: false, pct: 12 },
  ]

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div className="gs-h1" style={{ fontSize: 17 }}>Taux de conversion</div>
        <button className="gs-filter-btn">Cette semaine<Icons.ChevronDown size={12} strokeWidth={2.4} /></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {steps.map((step, i) => (
          <div key={i}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginBottom: 8, minHeight: 28 }}>{step.label}</div>
            <div className="gs-num" style={{ fontSize: 19, color: C.ink, lineHeight: 1 }}>{step.value}</div>
            <div style={{ marginTop: 8 }}>
              <span className={step.trendUp ? 'gs-trend-up' : 'gs-trend-down'}>{step.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginTop: 16, height: 90, alignItems: 'flex-end' }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            height: `${step.pct}%`,
            background: i === 0 ? C.orange300 : i === steps.length - 1 ? C.orange : '#FFE5D6',
            borderRadius: '8px 8px 0 0',
            transition: 'height 0.3s, opacity 0.15s',
          }} />
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PRODUCT CONVERSION TABLE — recherche + tri + filtres BRANCHÉS
// ═══════════════════════════════════════════════════════════════════
const ALL_PRODUCTS = [
  { name: "Huile d'olive extra vierge 5L", sku: 'GS-1042', category: 'Alimentation', icon: 'Wine', bg: '#FFE5D6', views: 8240, cart: 4120, checkout: 2850, purchased: 2180, abandoned: 670, conv: 26, demand: 'high' },
  { name: 'Café arabica moulu 1kg',        sku: 'GS-1088', category: 'Alimentation', icon: 'Coffee', bg: '#E8DCC9', views: 5890, cart: 2350, checkout: 1670, purchased: 1320, abandoned: 480, conv: 22, demand: 'high' },
  { name: "Savon bio à l'huile d'argan",   sku: 'GS-2210', category: 'Beauté',       icon: 'Sparkles', bg: '#EDE9FE', views: 3120, cart: 1870, checkout: 1340, purchased: 1050, abandoned: 290, conv: 33, demand: 'high' },
  { name: 'T-shirt coton bio col rond',    sku: 'GS-3401', category: 'Mode',         icon: 'Shirt', bg: '#D9E8FF', views: 4210, cart: 1680, checkout: 920, purchased: 610, abandoned: 310, conv: 14, demand: 'medium' },
  { name: 'Crevettes royales 1kg',         sku: 'GS-1156', category: 'Alimentation', icon: 'Fish', bg: '#FFE0E8', views: 2840, cart: 920, checkout: 510, purchased: 320, abandoned: 240, conv: 11, demand: 'low' },
]

const DEMAND = {
  high:   { bg: '#FCE7F3', color: '#BE185D', label: 'Forte' },
  medium: { bg: C.orangeSoft, color: C.orange, label: 'Moyenne' },
  low:    { bg: '#EDE9FE', color: '#7C3AED', label: 'Faible' },
}

function ProductConversionTable() {
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState(null)
  const [demandFilter, setDemandFilter] = useState(null)
  const [sort, setSort] = useState({ key: 'views', dir: 'desc' })

  const categories = [...new Set(ALL_PRODUCTS.map(p => p.category))]
  const fmt = (n) => n.toLocaleString('fr-FR')

  const rows = useMemo(() => {
    let r = ALL_PRODUCTS.filter(p => {
      if (query) {
        const q = query.toLowerCase()
        if (!`${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(q)) return false
      }
      if (catFilter && p.category !== catFilter) return false
      if (demandFilter && p.demand !== demandFilter) return false
      return true
    })
    const { key, dir } = sort
    r = [...r].sort((a, b) => {
      const av = a[key], bv = b[key]
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return dir === 'asc' ? cmp : -cmp
    })
    return r
  }, [query, catFilter, demandFilter, sort])

  const toggleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' })
  }

  const cols = '32px 2.2fr 1fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.9fr 0.9fr 32px'

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div className="gs-h1" style={{ fontSize: 17 }}>Conversion par produit</div>
        <div style={{ fontSize: 11.5, color: C.faint }}>
          Funnel de {rows.length} produit{rows.length > 1 ? 's' : ''}{catFilter || demandFilter || query ? ' (filtré)' : ' les plus consultés'}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180, background: C.line2, borderRadius: 18, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icons.Search size={13} color={C.faint} />
          <input type="text" placeholder="Rechercher un produit..." value={query} onChange={e => setQuery(e.target.value)}
                 className="gs-input-clean" style={{ fontSize: 12, width: '100%' }} />
          {query && (
            <button className="gs-icon-btn-sm" style={{ padding: 2 }} onClick={() => setQuery('')} title="Effacer">
              <Icons.X size={13} />
            </button>
          )}
        </div>

        {/* Filtre catégorie (cycle) */}
        <button className={`gs-filter-btn-ghost ${catFilter ? 'is-active' : ''}`}
                onClick={() => {
                  const idx = catFilter ? categories.indexOf(catFilter) : -1
                  const next = categories[idx + 1] || null
                  setCatFilter(next)
                }}>
          {catFilter || 'Catégorie'}<Icons.ChevronDown size={11} strokeWidth={2.4} />
        </button>

        {/* Filtre demande (cycle) */}
        <button className={`gs-filter-btn-ghost ${demandFilter ? 'is-active' : ''}`}
                onClick={() => {
                  const order = ['high', 'medium', 'low']
                  const idx = demandFilter ? order.indexOf(demandFilter) : -1
                  const next = order[idx + 1] || null
                  setDemandFilter(next)
                }}>
          {demandFilter ? DEMAND[demandFilter].label : 'Demande'}<Icons.ChevronDown size={11} strokeWidth={2.4} />
        </button>

        {(catFilter || demandFilter || query) && (
          <button className="gs-filter-btn-ghost" onClick={() => { setCatFilter(null); setDemandFilter(null); setQuery('') }} title="Réinitialiser">
            <Icons.RotateCcw size={12} strokeWidth={2.2} /> Réinitialiser
          </button>
        )}
        <button className="gs-filter-btn-ghost" title="Exporter"><Icons.Upload size={12} strokeWidth={2.2} /></button>
        <button className="gs-filter-btn"><Icons.Package size={12} strokeWidth={2.4} /></button>
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '10px 12px', fontSize: 10.5, color: C.faint, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase', borderBottom: `1px solid ${C.line2}` }}>
        <div><input type="checkbox" style={{ accentColor: C.orange }} /></div>
        <SortTh label="Produit" col="name" sort={sort} onSort={toggleSort} />
        <SortTh label="Catégorie" col="category" sort={sort} onSort={toggleSort} />
        <SortTh label="Vues" col="views" sort={sort} onSort={toggleSort} align="right" />
        <SortTh label="Panier" col="cart" sort={sort} onSort={toggleSort} align="right" />
        <SortTh label="Paiement" col="checkout" sort={sort} onSort={toggleSort} align="right" />
        <SortTh label="Achats" col="purchased" sort={sort} onSort={toggleSort} align="right" />
        <SortTh label="Abandons" col="abandoned" sort={sort} onSort={toggleSort} align="right" />
        <SortTh label="Conv." col="conv" sort={sort} onSort={toggleSort} align="right" />
        <div style={{ textAlign: 'center' }}>Demande</div>
        <div></div>
      </div>

      {/* Rows */}
      {rows.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: C.faint, fontSize: 12.5 }}>Aucun produit ne correspond aux filtres.</div>
      ) : rows.map((p, i) => {
        const Icon = Icons[p.icon] || Icons.Package
        const demand = DEMAND[p.demand]
        return (
          <div key={p.sku} className="gs-row" style={{
            display: 'grid', gridTemplateColumns: cols, padding: '14px 12px', fontSize: 12.5,
            alignItems: 'center', borderBottom: i < rows.length - 1 ? `1px solid ${C.line2}` : 'none', borderRadius: 8,
          }}>
            <div><input type="checkbox" style={{ accentColor: C.orange }} /></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} strokeWidth={1.6} color={C.ink} style={{ opacity: 0.75 }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: 10.5, color: C.faint, marginTop: 2 }}>SKU: {p.sku}</div>
              </div>
            </div>

            <div style={{ color: C.muted, fontSize: 12 }}>{p.category}</div>
            <div style={{ textAlign: 'right', color: C.ink, fontWeight: 500 }}>{fmt(p.views)}</div>
            <div style={{ textAlign: 'right', color: C.ink, fontWeight: 500 }}>{fmt(p.cart)}</div>
            <div style={{ textAlign: 'right', color: C.ink, fontWeight: 500 }}>{fmt(p.checkout)}</div>
            <div style={{ textAlign: 'right' }}><span className="gs-num" style={{ color: C.orange, fontSize: 13 }}>{fmt(p.purchased)}</span></div>
            <div style={{ textAlign: 'right', color: '#DC2626', fontWeight: 500 }}>{fmt(p.abandoned)}</div>

            <div style={{ textAlign: 'right' }}>
              <span style={{
                background: p.conv >= 25 ? '#D1FAE5' : p.conv >= 15 ? '#FEF3C7' : '#FEE2E2',
                color:      p.conv >= 25 ? '#059669' : p.conv >= 15 ? '#D97706' : '#DC2626',
                padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3,
              }}>{p.conv}%</span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ background: demand.bg, color: demand.color, padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icons.Zap size={10} strokeWidth={2.6} fill={demand.color} />{demand.label}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button className="gs-icon-btn-sm"><Icons.MoreVertical size={14} /></button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// En-tête de colonne triable
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
// TOP CATEGORIES
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

  const R = 62
  const cx = 90, cy = 90
  const strokeW = 22
  const circumference = 2 * Math.PI * R
  let offset = 0

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="gs-h1" style={{ fontSize: 16 }}>Catégories de ventes</div>
        <span style={{ fontSize: 11.5, color: C.orange, fontWeight: 600, cursor: 'pointer' }}>Voir tout</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, position: 'relative' }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
          {categories.map((c, i) => {
            const dash = (c.pct / 100) * circumference
            const seg = (
              <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={c.color} strokeWidth={strokeW}
                      strokeDasharray={`${dash - 3} ${circumference}`} strokeDashoffset={-offset} strokeLinecap="butt" />
            )
            offset += dash
            return seg
          })}
        </svg>

        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 10.5, color: C.faint, fontWeight: 500 }}>Total ventes</div>
          <div className="gs-num" style={{ fontSize: 17, color: C.ink, marginTop: 2 }}>
            3,4M <span style={{ fontSize: 10, color: C.faint, fontWeight: 500 }}>TND</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {categories.map((c, i) => {
          const Icon = Icons[c.icon] || Icons.Circle
          return (
            <div key={i} style={{ background: `${c.color}12`, border: `1px solid ${c.color}1F`, padding: '7px 9px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 2px 6px -1px ${c.color}66` }}>
                <Icon size={11} color="#fff" strokeWidth={2.4} />
              </div>
              <div style={{ fontSize: 11.5, color: C.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
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
// CHANNEL PERFORMANCE
// ═══════════════════════════════════════════════════════════════════
function ChannelPerformance() {
  const channels = [
    { name: 'App Android', revenue: 393364, orders: 23350, color: C.orange },
    { name: 'Web Desktop', revenue: 275355, orders: 16345, color: C.orange400 },
    { name: 'Web Mobile',  revenue: 216350, orders: 12842, color: C.orange300 },
    { name: 'App iOS',     revenue: 98341,  orders: 5838,  color: '#FFD9C5' },
  ]

  const totalRevenue = channels.reduce((s, c) => s + c.revenue, 0)
  const totalOrders  = channels.reduce((s, c) => s + c.orders,  0)

  const W = 280, H = 165
  const cx = W / 2
  const cy = 148
  const r = 92
  const strokeW = 22
  const gapRad = (5 * Math.PI) / 180

  const arcPath = (start, end) => {
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
  }

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="gs-h1" style={{ fontSize: 16 }}>Performance par canal</div>
        <button className="gs-icon-btn-sm"><Icons.MoreHorizontal size={16} /></button>
      </div>

      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 14, marginBottom: 4 }}>Revenus totaux par canal :</div>
      <div className="gs-num" style={{ fontSize: 24, color: C.ink, lineHeight: 1 }}>
        {totalRevenue.toLocaleString('fr-FR')}
        <span style={{ fontSize: 12, color: C.faint, marginLeft: 4, fontWeight: 500 }}>TND</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 260, display: 'block' }}>
          {segments.map((s, i) => (
            <path key={i} d={arcPath(s.start, s.end)} stroke={s.color} strokeWidth={strokeW} fill="none" strokeLinecap="round" />
          ))}
          <text x={cx} y={cy - 26} textAnchor="middle" fontSize="10.5" fill={C.faint} fontFamily="DM Sans">Commandes totales :</text>
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill={C.ink} fontFamily="DM Sans">
            {totalOrders.toLocaleString('fr-FR')}
          </text>
        </svg>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {channels.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: C.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SALES & ORDERS ANALYTICS
// ═══════════════════════════════════════════════════════════════════
function SalesOrdersAnalytics() {
  const [hoveredIndex, setHoveredIndex] = useState(1)

  const orders = [
    { status: 'Livrées',    value: 1020, share: '78,2', change: '+8%',  revenue: '168 400', color: C.orange },
    { status: 'En cours',   value: 200,  share: '15,3', change: '+11%', revenue: '6 900',   color: C.orange400 },
    { status: 'Annulées',   value: 69,   share: '5,3',  change: '-3%',  revenue: '0',       color: C.orange300 },
    { status: 'Retournées', value: 16,   share: '1,2',  change: '-1%',  revenue: '540',     color: '#FFD9C5' },
  ]

  const total = orders.reduce((s, o) => s + o.value, 0)
  const maxValue = orders[0].value
  const ROW_HEIGHT = 34

  return (
    <div className="gs-card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div className="gs-h1" style={{ fontSize: 15.5, lineHeight: 1.2 }}>Analyse Ventes & Commandes</div>
        <button className="gs-filter-btn-ghost" style={{ flexShrink: 0 }}>Juin<Icons.ChevronDown size={11} strokeWidth={2.4} /></button>
      </div>

      <div style={{ fontSize: 11, color: C.faint, marginTop: 16, marginBottom: 6 }}>Total commandes :</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <span className="gs-num" style={{ fontSize: 26, color: C.ink, lineHeight: 1 }}>{total.toLocaleString('fr-FR')}</span>
        <span className="gs-trend-up">+6% <Icons.TrendingUp size={10} strokeWidth={2.6} /></span>
        <span style={{ fontSize: 10.5, color: C.faint }}>vs 1 230 mois dernier</span>
      </div>

      <div style={{ position: 'relative', overflow: 'visible' }}>
        {orders.map((o, i) => {
          const widthPct = (o.value / maxValue) * 100
          const isHovered = hoveredIndex === i
          return (
            <div key={i} onMouseEnter={() => setHoveredIndex(i)}
                 style={{ display: 'grid', gridTemplateColumns: '80px 1fr 50px', alignItems: 'center', gap: 10, height: ROW_HEIGHT, cursor: 'pointer' }}>
              <span style={{ fontSize: 11.5, color: isHovered ? C.ink : C.muted, fontWeight: isHovered ? 600 : 500, transition: 'color 0.15s' }}>{o.status}</span>
              <div style={{ height: 22, position: 'relative' }}>
                <div style={{
                  height: '100%', width: `${widthPct}%`, background: o.color, borderRadius: 999,
                  opacity: isHovered ? 1 : 0.88, transition: 'opacity 0.18s, transform 0.18s',
                  transform: isHovered ? 'scaleY(1.08)' : 'scaleY(1)', transformOrigin: 'left center',
                }} />
              </div>
              <span className="gs-num" style={{ fontSize: 12, color: C.ink, textAlign: 'right' }}>{o.value.toLocaleString('fr-FR')}</span>
            </div>
          )
        })}

        {hoveredIndex !== null && (
          <div style={{
            position: 'absolute', top: hoveredIndex * ROW_HEIGHT + 6, right: 0, background: '#fff',
            borderRadius: 12, padding: '12px 14px',
            boxShadow: '0 12px 28px -8px rgba(15, 20, 25, 0.20), 0 0 0 1px rgba(15, 20, 25, 0.06)',
            zIndex: 10, width: 160, pointerEvents: 'none',
          }}>
            <div className="gs-num" style={{ fontSize: 14, color: C.ink, marginBottom: 10 }}>
              {orders[hoveredIndex].value.toLocaleString('fr-FR')} Commandes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SOATipRow color="#E5E7EB" label="Part" value={`${orders[hoveredIndex].share}%`} />
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
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ flex: 1, color: C.faint }}>{label} :</span>
      <span style={{ color: C.ink, fontWeight: bold ? 700 : 600 }}>{value}</span>
    </div>
  )
}