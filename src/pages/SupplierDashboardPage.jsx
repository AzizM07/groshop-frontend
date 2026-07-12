// pages/SupplierDashboardPage.jsx — GROSHOP.tn
// Style Donezo/Recent Activity : cards claires, aérées, table moderne

import { useState } from 'react'
import * as Icons from 'lucide-react'

// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-dashboard-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-dashboard-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;0,900;1,400&family=DM+Sans:wght@400;500;600;700;800&display=swap');
    .gs-dash {
      font-family: 'DM Sans', -apple-system, sans-serif;
      color: #0F1419;
      background: transparent;
      min-height: 100vh;
      padding: 24px;
    }
    .gs-h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-num { font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: -0.02em; }

    /* Card générique */
    .gs-card {
      background: #fff;
      border-radius: 20px;
      padding: 24px 26px;
      border: 1px solid #EAE7DF;
      box-shadow: 0 1px 3px rgba(15, 20, 25, 0.03);
    }

    /* KPI Card style Donezo */
    .gs-kpi-card {
      border-radius: 20px;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 160px;
      position: relative;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      cursor: pointer;
    }
    .gs-kpi-card:hover { transform: translateY(-3px); }
    .gs-kpi-arrow-btn { transition: transform 0.25s ease; }
    .gs-kpi-card:hover .gs-kpi-arrow-btn { transform: rotate(-45deg); }
    .gs-kpi-card--filled {
      background: #ff5e00;
      color: #fff;
      box-shadow: 0 12px 28px -12px rgba(255, 69, 0, 0.5);
    }
    .gs-kpi-card--filled:hover { box-shadow: 0 20px 36px -12px rgba(255, 69, 0, 0.6); }
    .gs-kpi-card--white {
      background: #fff;
      border: 1px solid #EAE7DF;
      color: #0F1419;
    }
    .gs-kpi-card--white:hover {
      box-shadow: 0 12px 28px -12px rgba(15, 20, 25, 0.15);
      border-color: #DBD5C8;
    }

    /* Buttons header */
    .gs-btn-primary {
      background: #FF4500; color: #fff; border: none;
      padding: 11px 20px; border-radius: 999px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      font-family: inherit;
      display: inline-flex; align-items: center; gap: 7px;
      transition: background 0.15s, transform 0.1s, box-shadow 0.2s;
      box-shadow: 0 6px 18px -6px rgba(255, 69, 0, 0.5);
    }
    .gs-btn-primary:hover { background: #E03D00; box-shadow: 0 10px 22px -8px rgba(255, 69, 0, 0.6); }
    .gs-btn-primary:active { transform: scale(0.97); }
    .gs-btn-outline {
      background: transparent; color: #0F1419;
      border: 1.5px solid #DBD5C8;
      padding: 10px 20px; border-radius: 999px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      font-family: inherit;
      display: inline-flex; align-items: center; gap: 7px;
      transition: all 0.15s;
    }
    .gs-btn-outline:hover { border-color: #0F1419; background: #fff; }

    /* Section title avec icon */
    .gs-section-title {
      display: flex; align-items: center; gap: 10px;
      font-size: 16px; font-weight: 600; color: #0F1419;
      letter-spacing: -0.01em;
    }
    .gs-section-icon {
  color: #FF4500;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

    /* Pill outline (Filter, Sort) */
    .gs-pill-outline {
      display: inline-flex; align-items: center; gap: 6px;
      background: #fff;
      border: 1px solid #EAE7DF;
      padding: 7px 14px;
      border-radius: 999px;
      font-size: 12.5px; font-weight: 500;
      color: #0F1419; cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
    }
    .gs-pill-outline:hover { border-color: #0F1419; }

    /* Table row hover */
    .gs-tr:hover { background: #FAFAF7; }
  `
  document.head.appendChild(s)
}

const ROW2_HEIGHT = 360
const ROW3_HEIGHT = 400

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function SupplierDashboardPage() {
  return (
    <div className="gs-dash">
      <DashboardHeader />
      <KPIRow />

      <div style={{
        display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 16,
        marginTop: 16, marginBottom: 16, height: ROW2_HEIGHT,
      }}>
        <CustomerGrowthChart />
        <VisitorsChart />
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '4fr 7fr', gap: 16,
        height: ROW3_HEIGHT,
      }}>
        <ProductViewsChart />
        <OrdersList />
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
        <button className="gs-btn-primary">
          <Icons.Plus size={15} strokeWidth={2.5} />
          Ajouter produit
        </button>
        <button className="gs-btn-outline">
          <Icons.Upload size={14} strokeWidth={2.2} />
          Importer
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// KPI ROW
// ═══════════════════════════════════════════════════════════════════
function KPIRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
      <KPICard filled label="Chiffre d'affaires" value="612 839" unit="TND" trend="+16%" trendUp subtitle="vs mois dernier" />
      <KPICard label="Commandes" value="6 790" trend="+8%" trendUp subtitle="vs mois dernier" />
      <KPICard label="Clients" value="4 345" trend="-0,4%" trendUp={false} subtitle="vs mois dernier" />
      <KPICard label="Produits actifs" value="256" trend="+2%" trendUp subtitle="vs mois dernier" />
    </div>
  )
}

function KPICard({ label, value, unit, trend, trendUp, subtitle, filled = false }) {
const p = filled
  ? {
      cardBg: '#ff5e00', cardBorder: 'none', cardShadow: '0 12px 28px -12px rgba(255, 69, 0, 0.5)',
      labelColor: 'rgba(255,255,255,0.85)', valueColor: '#fff', unitColor: 'rgba(255,255,255,0.75)',
      arrowBg: 'rgba(255,255,255,0.18)', arrowColor: '#fff',
      trendColor: trendUp ? '#ffffff' : '#FECACA',
      trendBg: 'rgba(255,255,255,0.15)', subtitleColor: 'rgba(255,255,255,0.75)',
    }
  : {
      cardBg: '#fff', cardBorder: '1px solid #EAE7DF', cardShadow: 'none',
      labelColor: '#6B7280', valueColor: '#0F1419', unitColor: '#9AA3AE',
      arrowBg: '#F5F3EE', arrowColor: '#0F1419',
      trendColor: trendUp ? '#059669' : '#DC2626',
      trendBg: trendUp ? '#ECFDF5' : '#FEF2F2', subtitleColor: '#9AA3AE',
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SECTION TITLE (helper commun)
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

// ═══════════════════════════════════════════════════════════════════
// CUSTOMER GROWTH CHART (restyled)
// ═══════════════════════════════════════════════════════════════════
function CustomerGrowthChart() {
  const [period, setPeriod] = useState('Mensuel')
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const data = [
    { month: 'Jan',  primary: 5500, secondary: 3500 },
    { month: 'Fév',  primary: 5000, secondary: 2500 },
    { month: 'Mar',  primary: 8000, secondary: 2500 },
    { month: 'Avr',  primary: 8000, secondary: 4000 },
    { month: 'Mai',  primary: 7500, secondary: 4500 },
    { month: 'Juin', primary: 4500, secondary: 4500 },
    { month: 'Juil', primary: 8500, secondary: 4500 },
  ]

  const W = 720, H = 240
  const padding = { top: 12, right: 20, bottom: 30, left: 44 }
  const chartW = W - padding.left - padding.right
  const chartH = H - padding.top - padding.bottom
  const maxValue = 10000

  const toPoints = (key) => data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - (d[key] / maxValue) * chartH,
  }))

  const primaryPts = toPoints('primary')
  const secondaryPts = toPoints('secondary')

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

  const primaryPath = smooth(primaryPts)
  const secondaryPath = smooth(secondaryPts)
  const baselineY = padding.top + chartH
  const areaPath = primaryPath
    + ` L ${primaryPts[primaryPts.length - 1].x} ${baselineY}`
    + ` L ${primaryPts[0].x} ${baselineY} Z`

  const yTicks = [0, 2500, 5000, 7500, 10000]

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * W
    const stepX = chartW / (data.length - 1)
    const rawIdx = (mouseX - padding.left) / stepX
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(rawIdx)))
    setHoveredIndex(idx)
  }
  const handleMouseLeave = () => setHoveredIndex(null)

  const renderHoverIndicator = () => {
    if (hoveredIndex === null) return null
    const sel = primaryPts[hoveredIndex]
    const selValue = data[hoveredIndex].primary
    const tipW = 92, tipGap = 18
    const goLeft = sel.x + tipGap + tipW > W - padding.right
    const tipX = goLeft ? sel.x - tipGap - tipW : sel.x + tipGap

    return (
      <g style={{ pointerEvents: 'none' }}>
        <line x1={sel.x} y1={sel.y} x2={sel.x} y2={baselineY + 8}
              stroke="#FF4500" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx={sel.x} cy={sel.y} r="10" fill="#FF4500" opacity="0.22" />
        <circle cx={sel.x} cy={sel.y} r="5" fill="#FF4500" stroke="#fff" strokeWidth="2.5" />
        <g transform={`translate(${tipX}, ${sel.y - 2})`}>
          <rect x="0" y="-13" width={tipW} height="26" rx="13" fill="#0F1419" />
          <text x={tipW / 2} y="4" textAnchor="middle"
                fontSize="11" fill="#fff" fontWeight="600" fontFamily="DM Sans">
            {selValue.toLocaleString('fr-FR')} TND
          </text>
        </g>
      </g>
    )
  }

  return (
    <div className="gs-card" style={{
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 4,
      }}>
        <div>
          <SectionTitle icon={Icons.TrendingUp} title="Évolution du CA" />
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 14,
            paddingLeft: 42,
          }}>
            <span className="gs-num" style={{ fontSize: 28, color: '#0F1419' }}>
              612 839
              <span style={{ fontSize: 14, color: '#9AA3AE', marginLeft: 5, fontWeight: 500 }}>TND</span>
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              background: '#ECFDF5', color: '#059669',
              padding: '2px 9px', borderRadius: 999,
              fontSize: 11.5, fontWeight: 700,
            }}>
              <Icons.TrendingUp size={11} strokeWidth={2.6} />
              +6,2%
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: '#9AA3AE', marginTop: 4, paddingLeft: 42 }}>
            vs période précédente
          </div>
        </div>

        <button className="gs-pill-outline">
          {period}
          <Icons.ChevronDown size={12} color="#6B7280" strokeWidth={2} />
        </button>
      </div>

      {/* ── Chart ── */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%"
           preserveAspectRatio="xMidYMid meet"
           style={{ flex: 1, display: 'block', marginTop: 16, cursor: 'crosshair', minHeight: 0 }}
           onMouseMove={handleMouseMove}
           onMouseLeave={handleMouseLeave}>
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
              <line x1={padding.left} y1={y} x2={W - padding.right} y2={y}
                    stroke="#F0EDE5" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end"
                    fontSize="10.5" fill="#9AA3AE" fontFamily="DM Sans" fontWeight="500">
                {val === 0 ? '0' : val >= 1000 ? `${val/1000}k` : val}
              </text>
            </g>
          )
        })}

        <rect x={padding.left} y={padding.top} width={chartW} height={chartH} fill="transparent" />

        <path d={areaPath} fill="url(#areaGrad)" style={{ pointerEvents: 'none' }} />
        <path d={secondaryPath} stroke="#FFB088" strokeWidth="2" fill="none"
              strokeLinecap="round" style={{ pointerEvents: 'none' }} />
        <path d={primaryPath} stroke="#FF4500" strokeWidth="2.5" fill="none"
              strokeLinecap="round" style={{ pointerEvents: 'none' }} />

        {renderHoverIndicator()}

        {data.map((d, i) => {
          const x = padding.left + (i / (data.length - 1)) * chartW
          const isActive = i === hoveredIndex
          return (
            <text key={i} x={x} y={H - 8} textAnchor="middle"
                  fontSize="11"
                  fill={isActive ? '#0F1419' : '#9AA3AE'}
                  fontWeight={isActive ? 600 : 500}
                  fontFamily="DM Sans"
                  style={{ pointerEvents: 'none' }}>
              {d.month}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// VISITORS CHART (restyled — style Cash Flow avec dual bars)
// ═══════════════════════════════════════════════════════════════════
function VisitorsChart() {
  const [hoveredDay, setHoveredDay] = useState(null)

  const data = [
    { day: 'Lun', visitors: 612, pct: 14 },
    { day: 'Mar', visitors: 654, pct: 15 },
    { day: 'Mer', visitors: 802, pct: 24 },
    { day: 'Jeu', visitors: 720, pct: 17 },
    { day: 'Ven', visitors: 880, pct: 21 },
    { day: 'Sam', visitors: 950, pct: 22 },
    { day: 'Dim', visitors: 820, pct: 19 },
  ]

  const W = 400, H = 200
  const padding = { top: 10, bottom: 26, left: 8, right: 8 }
  const chartW = W - padding.left - padding.right
  const chartH = H - padding.top - padding.bottom
  const barWidth = 20
  const maxValue = Math.max(...data.map(d => d.visitors))

  return (
    <div className="gs-card" style={{
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          <SectionTitle icon={Icons.Users} title="Visiteurs" />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 14, paddingLeft: 42 }}>
            <span className="gs-num" style={{ fontSize: 26, color: '#0F1419' }}>
              98 425
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              background: '#ECFDF5', color: '#059669',
              padding: '2px 8px', borderRadius: 999,
              fontSize: 11, fontWeight: 700,
            }}>
              <Icons.TrendingUp size={10} strokeWidth={2.6} />
              +0,4%
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: '#9AA3AE', marginTop: 3, paddingLeft: 42 }}>
            vs semaine dernière
          </div>
        </div>
        <button style={{
          background: 'transparent', border: 'none',
          fontSize: 12, color: '#FF4500', fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'inline-flex', alignItems: 'center', gap: 3,
        }}>
          Voir plus <Icons.ArrowRight size={12} strokeWidth={2.4} />
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%"
           preserveAspectRatio="xMidYMid meet"
           style={{ flex: 1, display: 'block', minHeight: 0, marginTop: 20 }}>
        {data.map((d, i) => {
          const x = padding.left + (i + 0.5) * (chartW / data.length) - barWidth / 2
          const height = (d.visitors / maxValue) * chartH
          const y = padding.top + chartH - height
          const isHovered = i === hoveredDay

          return (
            <g key={i}
               onMouseEnter={() => setHoveredDay(i)}
               onMouseLeave={() => setHoveredDay(null)}
               style={{ cursor: 'pointer' }}>
              <rect x={x - 6} y={padding.top} width={barWidth + 12} height={chartH} fill="transparent" />
              <rect x={x} y={y} width={barWidth} height={height}
                    rx={10}
                    fill={isHovered ? '#FF4500' : '#FFCFB8'}
                    style={{ transition: 'fill 0.15s' }} />

              {isHovered && (
                <g style={{ pointerEvents: 'none' }}>
                  <rect x={x + barWidth / 2 - 40} y={y - 46}
                        width="80" height="34" rx="8" fill="#0F1419" />
                  <text x={x + barWidth / 2} y={y - 28} textAnchor="middle"
                        fontSize="12" fill="#fff" fontWeight="700" fontFamily="DM Sans">
                    {d.visitors}
                  </text>
                  <text x={x + barWidth / 2} y={y - 16} textAnchor="middle"
                        fontSize="9" fill="#fff" opacity="0.7" fontFamily="DM Sans">
                    visiteurs
                  </text>
                  <path d={`M ${x + barWidth/2 - 5} ${y - 12} L ${x + barWidth/2} ${y - 5} L ${x + barWidth/2 + 5} ${y - 12} Z`}
                        fill="#0F1419" />
                </g>
              )}

              <text x={x + barWidth / 2} y={H - 8} textAnchor="middle"
                    fontSize="10.5"
                    fill={isHovered ? '#0F1419' : '#9AA3AE'}
                    fontWeight={isHovered ? 600 : 500}
                    fontFamily="DM Sans"
                    style={{ pointerEvents: 'none' }}>
                {d.day}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PRODUCT VIEWS CHART (restyled — dual bars comme Cash Flow)
// ═══════════════════════════════════════════════════════════════════
function ProductViewsChart() {
  const data = [
    { day: 'Dim', thisWeek: 4500, lastWeek: 4800 },
    { day: 'Lun', thisWeek: 4200, lastWeek: 7800 },
    { day: 'Mar', thisWeek: 1500, lastWeek: 4500 },
    { day: 'Mer', thisWeek: 4200, lastWeek: 6500 },
    { day: 'Jeu', thisWeek: 5800, lastWeek: 8000 },
    { day: 'Ven', thisWeek: 4600, lastWeek: 6200 },
    { day: 'Sam', thisWeek: 4200, lastWeek: 5800 },
  ]

  const W = 380, H = 240
  const padding = { top: 20, bottom: 30, left: 34, right: 12 }
  const chartW = W - padding.left - padding.right
  const chartH = H - padding.top - padding.bottom
  const barWidth = 9
  const barGap = 3
  const maxValue = 10000
  const yTicks = [0, 2000, 4000, 6000, 8000, 10000]

  return (
    <div className="gs-card" style={{
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 6,
      }}>
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

      <svg viewBox={`0 0 ${W} ${H}`} width="100%"
           preserveAspectRatio="xMidYMid meet"
           style={{ flex: 1, display: 'block', minHeight: 0, marginTop: 4 }}>
        {yTicks.map(val => {
          const y = padding.top + chartH - (val / maxValue) * chartH
          return (
            <g key={val}>
              <line x1={padding.left} y1={y} x2={W - padding.right} y2={y}
                    stroke="#F0EDE5" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 3} textAnchor="end"
                    fontSize="9.5" fill="#9AA3AE" fontFamily="DM Sans" fontWeight="500">
                {val === 0 ? '0' : `${val / 1000}k`}
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
          const y1 = padding.top + chartH - h1
          const y2 = padding.top + chartH - h2

          return (
            <g key={i}>
              <rect x={x1} y={y1} width={barWidth} height={h1} rx={4} fill="#FF4500" />
              <rect x={x2} y={y2} width={barWidth} height={h2} rx={4} fill="#FFCFB8" />
              <text x={groupCenter} y={H - 10} textAnchor="middle"
                    fontSize="10.5" fill="#9AA3AE" fontFamily="DM Sans" fontWeight="500">
                {d.day}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ORDERS LIST (restyled — style "Recent Activity")
// ═══════════════════════════════════════════════════════════════════
function OrdersList() {
  const orders = [
    { id: '#GS-7842', product: "Huile d'olive 5L",  items: 4, status: 'success',  date: '12 Juin 2026', amount: '1 250', currency: 'TND', payment: 'Carte bancaire',     paymentSub: '**** 3560', icon: 'Wine',   iconBg: '#FFF3EE', iconColor: '#FF4500', type: 'in' },
    { id: '#GS-7841', product: 'Café moulu 1kg',     items: 3, status: 'success',  date: '12 Juin 2026', amount: '420',   currency: 'TND', payment: 'Cash livraison',      paymentSub: 'à la livraison', icon: 'Coffee', iconBg: '#E8F5E9', iconColor: '#059669', type: 'in' },
    { id: '#GS-7840', product: 'T-shirt coton',      items: 3, status: 'pending',  date: '11 Juin 2026', amount: '180',   currency: 'TND', payment: 'Carte bancaire',     paymentSub: '**** 2285', icon: 'Shirt',  iconBg: '#EFF6FF', iconColor: '#3B82F6', type: 'out' },
    { id: '#GS-7839', product: 'Pâtes spaghetti',    items: 4, status: 'success',  date: '11 Juin 2026', amount: '95',    currency: 'TND', payment: 'Cash livraison',      paymentSub: 'à la livraison', icon: 'Wheat',  iconBg: '#FEF3C7', iconColor: '#D97706', type: 'in' },
    { id: '#GS-7838', product: 'Crevettes 1kg',      items: 2, status: 'rejected', date: '10 Juin 2026', amount: '320',   currency: 'TND', payment: 'Cash livraison',      paymentSub: 'à la livraison', icon: 'Fish',   iconBg: '#FCE7F3', iconColor: '#EC4899', type: 'out' },
    { id: '#GS-7837', product: 'Moutarde 250g',      items: 4, status: 'success',  date: '10 Juin 2026', amount: '45',    currency: 'TND', payment: 'Carte bancaire',     paymentSub: '**** 1120', icon: 'Soup',   iconBg: '#FEF9C3', iconColor: '#CA8A04', type: 'in' },
  ]

  const statusStyles = {
    success:  { bg: '#ECFDF5', color: '#059669', text: 'Acceptée' },
    pending:  { bg: '#FEF3C7', color: '#D97706', text: 'En attente' },
    rejected: { bg: '#FEF2F2', color: '#DC2626', text: 'Rejetée' },
  }

  const cols = '1.9fr 1.1fr 0.9fr 1.1fr 0.2fr'

  return (
    <div className="gs-card" style={{
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header : title + filter/sort */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 18,
      }}>
        <SectionTitle icon={Icons.Activity} title="Activité récente" />

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="gs-pill-outline">
            <Icons.SlidersHorizontal size={12} strokeWidth={2.2} />
            Filtrer
          </button>
          <button className="gs-pill-outline">
            <Icons.ArrowUpDown size={12} strokeWidth={2.2} />
            Trier
          </button>
          <button className="gs-pill-outline" style={{ padding: 7, width: 32, height: 32, justifyContent: 'center' }}>
            <Icons.MoreHorizontal size={14} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Table headers en UPPERCASE */}
      <div style={{
        display: 'grid', gridTemplateColumns: cols,
        padding: '0 0 14px', fontSize: 10.5,
        color: '#9AA3AE', fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        borderBottom: '1px solid #F0EDE5',
        flexShrink: 0,
      }}>
        <div>Type</div>
        <div>ID</div>
        <div>Montant</div>
        <div>Statut</div>
        <div></div>
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {orders.map((order, i) => {
          const status = statusStyles[order.status]
          const ProductIcon = Icons[order.icon] || Icons.Package

          return (
            <div key={i} className="gs-tr" style={{
              display: 'grid', gridTemplateColumns: cols,
              padding: '14px 6px', fontSize: 12.5,
              color: '#0F1419',
              borderBottom: i < orders.length - 1 ? '1px solid #F5F3EE' : 'none',
              alignItems: 'center',
              transition: 'background 0.12s',
              borderRadius: 8,
              margin: '0 -6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: order.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <ProductIcon size={16} color={order.iconColor} strokeWidth={2} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600, color: '#0F1419',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {order.product}
                  </div>
                  <div style={{ fontSize: 11, color: '#9AA3AE', marginTop: 1 }}>
                    {order.type === 'in' ? 'Reçue' : 'Envoyée'} · {order.date}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 500, color: '#0F1419' }}>{order.id}</div>
                <div style={{ fontSize: 10.5, color: '#9AA3AE', marginTop: 1 }}>
                  {order.items} article{order.items > 1 ? 's' : ''}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: '#0F1419', fontVariantNumeric: 'tabular-nums' }}>
                  {order.amount} <span style={{ fontSize: 10.5, color: '#9AA3AE', fontWeight: 500 }}>{order.currency}</span>
                </div>
                <div style={{ fontSize: 10.5, color: '#9AA3AE', marginTop: 1 }}>
                  {order.payment}
                </div>
              </div>

              <div>
                <span style={{
                  background: status.bg, color: status.color,
                  padding: '4px 11px', borderRadius: 999,
                  fontSize: 11, fontWeight: 600,
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                }}>
                  {status.text}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button style={{
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', color: '#9AA3AE',
                  padding: 4, borderRadius: 6,
                }}>
                  <Icons.MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}