// pages/SupplierDashboardPage.jsx — GROSHOP.tn

import { useState } from 'react'
import * as Icons from 'lucide-react'

// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-dashboard-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-dashboard-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;0,900;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-dash { font-family: 'DM Sans', -apple-system, sans-serif; color: #0F1419; }
    .gs-h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-num { font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-card { background: #fff; border-radius: 18px; padding: 22px; border: none; box-shadow: 0 1px 3px rgba(15, 20, 25, 0.04); }

    @keyframes gs-float {
      0%, 100% { transform: translate(0, 0); }
      50%      { transform: translate(0, -15px); }
    }
    @keyframes gs-pulse {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.18); }
    }
    @keyframes gs-trophy-glow {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.06); }
    }
    @keyframes gs-shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .gs-float-slow  { animation: gs-float 8s ease-in-out infinite; }
    .gs-pulse-icon  { animation: gs-pulse 2.2s ease-in-out infinite; transform-origin: center; }
    .gs-trophy-anim { animation: gs-trophy-glow 3s ease-in-out infinite; transform-origin: center; }
    .gs-shimmer-text {
      background: linear-gradient(90deg, #fff 0%, #FFE5D6 50%, #fff 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: gs-shimmer 3s linear infinite;
    }
  `
  document.head.appendChild(s)
}

const ROW2_HEIGHT = 340
const ROW3_HEIGHT = 380

const KPI_COLORS = {
  orange: '#FF4500',
  pink:   '#EC4899',
  purple: '#8B5CF6',
  indigo: '#6366F1',
}

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function SupplierDashboardPage() {
  return (
    <div className="gs-dash" style={{ position: 'relative' }}>
      <AmbientBackground />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Top section : Hero (5fr) + KPI grid 2x2 (7fr) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '5fr 7fr',
          gap: 16,
          marginBottom: 16,
        }}>
          <HeroWelcome name="Mohamed" rating={4.8} responseRate={95} />
          <KPIGrid />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '7fr 5fr',
          gap: 16,
          marginBottom: 16,
          height: ROW2_HEIGHT,
        }}>
          <CustomerGrowthChart />
          <VisitorsChart />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '4fr 7fr',
          gap: 16,
          height: ROW3_HEIGHT,
        }}>
          <ProductViewsChart />
          <OrdersList />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// AMBIENT BACKGROUND
// ═══════════════════════════════════════════════════════════════════
function AmbientBackground() {
  const blobs = [
    { top:  -120, right:  -80, w: 520, h: 520, color: 'rgba(255, 69, 0, 0.10)',   delay: '0s' },
    { top:    80, left:  -150, w: 380, h: 380, color: 'rgba(236, 72, 153, 0.08)', delay: '2s' },
    { top:   700, right: -100, w: 340, h: 340, color: 'rgba(139, 92, 246, 0.07)', delay: '4s' },
    { top:  1100, left:    50, w: 320, h: 320, color: 'rgba(99, 102, 241, 0.06)', delay: '6s' },
  ]

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
    }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          className="gs-float-slow"
          style={{
            position: 'absolute',
            top: b.top, left: b.left, right: b.right,
            width: b.w, height: b.h,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 60%)`,
            borderRadius: '50%',
            filter: 'blur(50px)',
            animationDelay: b.delay,
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// HERO WELCOME (à gauche, plus compact)
// ═══════════════════════════════════════════════════════════════════
function HeroWelcome({ name = 'Vendeur', rating = 4.8, responseRate = 95 }) {
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(125deg, #FF4500 0%, #EC4899 35%, #8B5CF6 70%, #4F46E5 100%)',
      borderRadius: 22,
      padding: '26px 28px',
      overflow: 'hidden',
      boxShadow: '0 16px 40px -16px rgba(139, 92, 246, 0.5)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 320,
    }}>
      {/* Carrés géométriques décoratifs */}
      <div style={{
        position: 'absolute', top: -40, right: '20%',
        width: 180, height: 180,
        background: 'rgba(255, 255, 255, 0.10)',
        borderRadius: 30, transform: 'rotate(15deg)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: -20, right: '5%',
        width: 140, height: 140,
        background: 'rgba(255, 255, 255, 0.07)',
        borderRadius: 22, transform: 'rotate(-18deg)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, right: 20,
        width: 130, height: 130,
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 20, transform: 'rotate(25deg)',
        pointerEvents: 'none',
      }} />

      {/* Sparkles flottants */}
      <Icons.Sparkles
        size={22} strokeWidth={1.5}
        style={{
          position: 'absolute', top: 24, right: 130,
          color: '#fff', opacity: 0.5,
        }}
      />
      <Icons.Sparkle
        size={16} strokeWidth={1.5}
        style={{
          position: 'absolute', bottom: 70, right: 110,
          color: '#fff', opacity: 0.5,
        }}
      />

      {/* Trophée en haut à droite */}
      <div style={{
        position: 'absolute',
        top: 14, right: 10,
        pointerEvents: 'none',
      }}>
        <TrophyIllustration size={110} />
      </div>

      {/* Contenu — colonne */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 className="gs-h1" style={{
          fontSize: 21, color: '#fff', margin: 0, lineHeight: 1.2,
          maxWidth: '65%',
        }}>
          Félicitations,{' '}
          <em style={{
            fontStyle: 'italic',
            fontFamily: 'Fraunces, Georgia, serif',
            color: '#FFE5D6',
          }}>
            {name}
          </em>
          {' '}!
        </h2>

        <div style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.88)',
          marginTop: 4,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
        }}>
          Top vendeur du mois <span>🎉</span>
        </div>
      </div>

      {/* Métriques GROSSES avec effet */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        margin: '20px 0',
      }}>
        {/* Note moyenne */}
        <div style={{ position: 'relative' }}>
          <div className="gs-num" style={{
            fontSize: 44,
            color: '#fff',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textShadow: '0 2px 16px rgba(0, 0, 0, 0.25), 0 0 30px rgba(252, 211, 77, 0.4)',
          }}>
            {rating.toString().replace('.', ',')}
            <Icons.Star
              size={28}
              fill="#FCD34D"
              strokeWidth={0}
              className="gs-pulse-icon"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(252, 211, 77, 0.8))',
              }}
            />
          </div>
          <div style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.85)',
            marginTop: 8,
            fontWeight: 500,
          }}>
            Note moyenne
          </div>
        </div>

        <div style={{
          width: 1, height: 46,
          background: 'rgba(255,255,255,0.3)',
        }} />

        {/* Taux de réponse */}
        <div style={{ position: 'relative' }}>
          <div className="gs-num" style={{
            fontSize: 40,
            color: '#fff',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textShadow: '0 2px 16px rgba(0, 0, 0, 0.25), 0 0 30px rgba(34, 197, 94, 0.3)',
          }}>
            {responseRate}%
            <span
              className="gs-pulse-icon"
              style={{
                fontSize: 24,
                display: 'inline-block',
                animationDelay: '1.1s',
              }}
            >
              🚀
            </span>
          </div>
          <div style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.85)',
            marginTop: 8,
            fontWeight: 500,
          }}>
            Taux de réponse
          </div>
        </div>
      </div>

      {/* CTA */}
      <button style={{
        background: '#fff',
        color: '#8B5CF6',
        border: 'none',
        padding: '10px 18px',
        borderRadius: 18,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.25)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        position: 'relative',
        zIndex: 1,
      }}>
        Voir mes performances
        <Icons.ArrowRight size={13} strokeWidth={2.4} />
      </button>
    </div>
  )
}

// ── Trophée SVG doré (taille paramétrable) ─────────────────────────
function TrophyIllustration({ size = 140 }) {
  return (
    <svg viewBox="0 0 120 130" width={size} height={size} className="gs-trophy-anim">
      <defs>
        <linearGradient id="goldGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%"  stopColor="#FEF3C7" />
          <stop offset="30%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="goldBase" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="trophyGlow">
          <stop offset="0%"   stopColor="#FBBF24" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="60" cy="55" rx="65" ry="50" fill="url(#trophyGlow)" />

      <path d="M 28 35 Q 5 45 16 70" stroke="url(#goldGrad)" strokeWidth="6"
            fill="none" strokeLinecap="round" />
      <path d="M 92 35 Q 115 45 104 70" stroke="url(#goldGrad)" strokeWidth="6"
            fill="none" strokeLinecap="round" />

      <path d="M 27 24 L 93 24 L 88 78 Q 60 88 32 78 Z" fill="url(#goldGrad)" />
      <path d="M 35 28 L 42 28 L 41 73 Q 39 75 36 73 Z" fill="rgba(255, 255, 255, 0.4)" />

      <path d="M 60 38 L 64 49 L 75 49 L 66 56 L 70 67 L 60 60 L 50 67 L 54 56 L 45 49 L 56 49 Z"
            fill="#fff" opacity="0.95" />

      <rect x="51" y="82" width="18" height="18" fill="url(#goldBase)" />
      <rect x="38" y="98" width="44" height="8" rx="2" fill="url(#goldGrad)" />
      <rect x="30" y="105" width="60" height="9" rx="3" fill="url(#goldBase)" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════
// KPI GRID — 2x2 à droite du hero
// ═══════════════════════════════════════════════════════════════════
function KPIGrid() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridTemplateRows: 'repeat(2, 1fr)',
      gap: 16,
    }}>
      <KPICard
        icon="Wallet"
        color={KPI_COLORS.orange}
        label="Chiffre d'affaires"
        value="612 839"
        unit="TND"
        trend="+16%"
        trendUp
        sparkline={[4, 4.2, 3.8, 4.5, 4.1, 5.2, 6]}
      />
      <KPICard
        icon="ShoppingBag"
        color={KPI_COLORS.pink}
        label="Commandes"
        value="6 790"
        trend="+8%"
        trendUp
        sparkline={[3.5, 4, 3.8, 4.2, 4.1, 4.5, 4.8]}
      />
      <KPICard
        icon="Users"
        color={KPI_COLORS.purple}
        label="Clients"
        value="4 345"
        trend="-0,4%"
        trendUp={false}
        sparkline={[5, 5.2, 4.9, 5.1, 4.8, 4.9, 4.7]}
      />
      <KPICard
        icon="Package"
        color={KPI_COLORS.indigo}
        label="Produits"
        value="256"
        trend="+2%"
        trendUp
        sparkline={[3, 3.1, 3, 3.2, 3.3, 3.4, 3.6]}
      />
    </div>
  )
}

function KPICard({ icon, color, label, value, unit, trend, trendUp, sparkline }) {
  const Icon = Icons[icon] || Icons.Circle

  return (
    <div style={{
      background: `linear-gradient(135deg, #ffffff 0%, ${color}08 100%)`,
      borderRadius: 18,
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${color}14`,
      boxShadow: '0 4px 20px -8px rgba(15, 20, 25, 0.06), 0 1px 3px rgba(15, 20, 25, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div style={{ fontSize: 12.5, color: '#6B7280', fontWeight: 500 }}>
          {label}
        </div>

        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: `linear-gradient(135deg, ${color}28 0%, ${color}14 100%)`,
          border: `1px solid ${color}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 6px 14px -4px ${color}40`,
        }}>
          <Icon size={20} color={color} strokeWidth={2} />
        </div>
      </div>

      <div>
        <div className="gs-num" style={{
          fontSize: 26, color: '#0F1419', lineHeight: 1,
        }}>
          {value}
          {unit && (
            <span style={{
              fontSize: 12, color: '#9AA3AE', marginLeft: 4, fontWeight: 500,
            }}>{unit}</span>
          )}
        </div>

        <div style={{
          marginTop: 10, fontSize: 11.5,
          position: 'relative', zIndex: 1,
        }}>
          <span style={{
            color: trendUp ? '#059669' : '#DC2626',
            fontWeight: 700,
          }}>
            {trend}
          </span>
          <span style={{ color: '#9AA3AE', marginLeft: 5 }}>
            vs mois dernier
          </span>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 12, right: 12,
        width: 80, height: 30,
        pointerEvents: 'none',
      }}>
        <MiniSparkline data={sparkline} color={color} />
      </div>
    </div>
  )
}

function MiniSparkline({ data, color }) {
  const W = 100, H = 30
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - 2 - ((v - min) / range) * (H - 4),
  }))

  const smooth = (pts) => {
    if (pts.length < 2) return ''
    let path = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[i + 2] || p2
      const c1x = p1.x + (p2.x - p0.x) / 6
      const c1y = p1.y + (p2.y - p0.y) / 6
      const c2x = p2.x - (p3.x - p1.x) / 6
      const c2y = p2.y - (p3.y - p1.y) / 6
      path += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
    }
    return path
  }

  const path = smooth(points)
  const areaPath = path + ` L ${W} ${H} L 0 ${H} Z`
  const gradId = `spark-${color.replace('#', '')}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={path} stroke={color} strokeWidth="2" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CUSTOMER GROWTH CHART (inchangé)
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

  const W = 720, H = 280
  const padding = { top: 16, right: 30, bottom: 30, left: 56 }
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
        <line x1={sel.x} y1={sel.y} x2={sel.x} y2={baselineY + 8} stroke="#FF4500" strokeWidth="1.5" />
        <circle cx={sel.x} cy={sel.y} r="11" fill="#FF4500" opacity="0.22" />
        <circle cx={sel.x} cy={sel.y} r="6" fill="#FF4500" stroke="#fff" strokeWidth="2.5" />
        <g transform={`translate(${tipX}, ${sel.y - 2})`}>
          <rect x="0" y="-13" width={tipW} height="26" rx="13" fill="#FF4500" />
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
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <div className="gs-h1" style={{ fontSize: 17 }}>Évolution du CA</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span className="gs-num" style={{ fontSize: 24, color: '#0F1419' }}>
              612 839
              <span style={{ fontSize: 13, color: '#9AA3AE', marginLeft: 5, fontWeight: 500 }}>TND</span>
            </span>
            <span style={{
              background: '#D1FAE5', color: '#059669',
              padding: '3px 9px', borderRadius: 12,
              fontSize: 10.5, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}>
              <Icons.TrendingUp size={10} strokeWidth={2.4} />+6,2%
            </span>
          </div>
        </div>
        <button style={{
          background: '#F5F6F8', border: 'none',
          padding: '7px 12px', borderRadius: 14,
          fontSize: 11.5, fontWeight: 500, color: '#0F1419',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
          fontFamily: 'inherit',
        }}>
          {period}
          <Icons.ChevronDown size={12} color="#6B7280" strokeWidth={2} />
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%"
           preserveAspectRatio="xMidYMid meet"
           style={{ flex: 1, display: 'block', marginTop: 8, cursor: 'crosshair', minHeight: 0 }}
           onMouseMove={handleMouseMove}
           onMouseLeave={handleMouseLeave}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4500" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map(val => {
          const y = padding.top + chartH - (val / maxValue) * chartH
          return (
            <g key={val}>
              <line x1={padding.left} y1={y} x2={W - padding.right} y2={y}
                    stroke="#EFEDE6" strokeWidth="1" strokeDasharray="3 5" />
              <text x={padding.left - 12} y={y + 4} textAnchor="end"
                    fontSize="11" fill="#9AA3AE" fontFamily="DM Sans">{val}</text>
            </g>
          )
        })}

        <rect x={padding.left} y={padding.top} width={chartW} height={chartH} fill="transparent" />

        <path d={areaPath} fill="url(#areaGrad)" style={{ pointerEvents: 'none' }} />
        <path d={secondaryPath} stroke="#FFB088" strokeWidth="2.5" fill="none"
              strokeLinecap="round" style={{ pointerEvents: 'none' }} />
        <path d={primaryPath} stroke="#FF4500" strokeWidth="2.8" fill="none"
              strokeLinecap="round" style={{ pointerEvents: 'none' }} />

        {renderHoverIndicator()}

        {data.map((d, i) => {
          const x = padding.left + (i / (data.length - 1)) * chartW
          const isActive = i === hoveredIndex
          return (
            <text key={i} x={x} y={H - 8} textAnchor="middle"
                  fontSize="12"
                  fill={isActive ? '#0F1419' : '#9AA3AE'}
                  fontWeight={isActive ? 600 : 400}
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
// VISITORS CHART (inchangé)
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

  const W = 400, H = 220
  const padding = { top: 50, bottom: 26, left: 16, right: 16 }
  const chartW = W - padding.left - padding.right
  const chartH = H - padding.top - padding.bottom
  const barWidth = 22
  const maxValue = Math.max(...data.map(d => d.visitors))

  return (
    <div className="gs-card" style={{
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <div className="gs-h1" style={{ fontSize: 15 }}>Visiteurs</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
            <span className="gs-num" style={{ fontSize: 22, color: '#FF4500' }}>98 425</span>
            <span style={{ fontSize: 10.5, color: '#059669', fontWeight: 600 }}>+0,4%</span>
          </div>
          <div style={{ fontSize: 10, color: '#9AA3AE', marginTop: 1 }}>
            vs semaine dernière
          </div>
        </div>
        <span style={{ fontSize: 10.5, color: '#FF4500', cursor: 'pointer', fontWeight: 500 }}>
          Voir plus →
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%"
           preserveAspectRatio="xMidYMid meet"
           style={{ flex: 1, display: 'block', minHeight: 0, marginTop: 6 }}>
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
              <rect x={x - 8} y={padding.top} width={barWidth + 16} height={chartH} fill="transparent" />
              <rect x={x} y={y} width={barWidth} height={height}
                    rx={barWidth / 2}
                    fill={isHovered ? '#FF4500' : '#FFE5D6'}
                    style={{ transition: 'fill 0.15s' }} />

              {isHovered && (
                <g style={{ pointerEvents: 'none' }}>
                  <rect x={x + barWidth / 2 - 36} y={y - 50}
                        width="72" height="40" rx="8" fill="#0F1419" />
                  <text x={x + barWidth / 2} y={y - 30} textAnchor="middle"
                        fontSize="13" fill="#fff" fontWeight="700" fontFamily="DM Sans">
                    {d.pct}%
                  </text>
                  <text x={x + barWidth / 2} y={y - 17} textAnchor="middle"
                        fontSize="9" fill="#fff" opacity="0.7" fontFamily="DM Sans">
                    {d.visitors} visiteurs
                  </text>
                  <path d={`M ${x + barWidth/2 - 5} ${y - 10} L ${x + barWidth/2} ${y - 4} L ${x + barWidth/2 + 5} ${y - 10} Z`}
                        fill="#0F1419" />
                </g>
              )}

              <text x={x + barWidth / 2} y={H - 8} textAnchor="middle"
                    fontSize="10.5"
                    fill={isHovered ? '#0F1419' : '#9AA3AE'}
                    fontWeight={isHovered ? 600 : 400}
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
// PRODUCT VIEWS CHART (inchangé)
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
  const padding = { top: 30, bottom: 28, left: 32, right: 12 }
  const chartW = W - padding.left - padding.right
  const chartH = H - padding.top - padding.bottom
  const barWidth = 11
  const maxValue = 10000
  const yTicks = [0, 2000, 4000, 6000, 8000, 10000]

  return (
    <div className="gs-card" style={{
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 4,
      }}>
        <div className="gs-h1" style={{ fontSize: 15 }}>Vues produits</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#6B7280' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF4500' }} />
            Cette sem.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#6B7280' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFB088' }} />
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
                    stroke="#EFEDE6" strokeWidth="1" strokeDasharray="3 5" />
              <text x={padding.left - 8} y={y + 3} textAnchor="end"
                    fontSize="9" fill="#9AA3AE" fontFamily="DM Sans">
                {val === 0 ? '0k' : `${val / 1000}k`}
              </text>
            </g>
          )
        })}

        {data.map((d, i) => {
          const groupCenter = padding.left + (i + 0.5) * (chartW / data.length)
          const x1 = groupCenter - barWidth - 1
          const x2 = groupCenter + 1
          const h1 = (d.thisWeek / maxValue) * chartH
          const h2 = (d.lastWeek / maxValue) * chartH
          const y1 = padding.top + chartH - h1
          const y2 = padding.top + chartH - h2

          return (
            <g key={i}>
              <rect x={x1} y={y1} width={barWidth} height={h1} rx={barWidth / 2} fill="#FF4500" />
              <rect x={x2} y={y2} width={barWidth} height={h2} rx={barWidth / 2} fill="#FFB088" />
              <text x={groupCenter} y={H - 8} textAnchor="middle"
                    fontSize="10" fill="#9AA3AE" fontFamily="DM Sans">{d.day}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ORDERS LIST (inchangé)
// ═══════════════════════════════════════════════════════════════════
function OrdersList() {
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { key: 'all',        label: 'Toutes' },
    { key: 'pending',    label: 'En attente' },
    { key: 'processing', label: 'En traitement' },
    { key: 'shipping',   label: 'En livraison' },
    { key: 'delivered',  label: 'Livrées' },
  ]

  const orders = [
    { id: '#GS-7842', product: "Huile d'olive 5L",  items: 4, status: 'accepted',  date: '12 Juin 2026', amount: '1 250 TND', payment: 'Carte bancaire',     icon: 'Wine',   bg: '#FFE5D6' },
    { id: '#GS-7841', product: 'Café moulu 1kg',     items: 3, status: 'accepted',  date: '12 Juin 2026', amount: '420 TND',   payment: 'Cash à la livraison', icon: 'Coffee', bg: '#D9EFDE' },
    { id: '#GS-7840', product: 'T-shirt coton',      items: 3, status: 'pending',   date: '11 Juin 2026', amount: '180 TND',   payment: 'Carte bancaire',     icon: 'Shirt',  bg: '#D9E8FF' },
    { id: '#GS-7839', product: 'Pâtes spaghetti',    items: 4, status: 'completed', date: '11 Juin 2026', amount: '95 TND',    payment: 'Cash à la livraison', icon: 'Wheat',  bg: '#FEF3C7' },
    { id: '#GS-7838', product: 'Crevettes 1kg',      items: 2, status: 'rejected',  date: '10 Juin 2026', amount: '320 TND',   payment: 'Cash à la livraison', icon: 'Fish',   bg: '#FFE0E8' },
    { id: '#GS-7837', product: 'Moutarde 250g',      items: 4, status: 'completed', date: '10 Juin 2026', amount: '45 TND',    payment: 'Carte bancaire',     icon: 'Soup',   bg: '#FFF3CD' },
    { id: '#GS-7836', product: 'Biscuits',           items: 4, status: 'rejected',  date: '9 Juin 2026',  amount: '85 TND',    payment: 'Cash à la livraison', icon: 'Cookie', bg: '#FFE0E8' },
  ]

  const statusStyles = {
    accepted:  { bg: '#D1FAE5', color: '#059669', text: 'Acceptée' },
    pending:   { bg: '#FEF3C7', color: '#D97706', text: 'En attente' },
    completed: { bg: '#D1FAE5', color: '#059669', text: 'Terminée' },
    rejected:  { bg: '#FEE2E2', color: '#DC2626', text: 'Rejetée' },
  }

  const cols = '2.2fr 1.1fr 1.3fr 0.9fr 0.3fr'

  return (
    <div className="gs-card" style={{
      padding: 22,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 14,
      }}>
        <div className="gs-h1" style={{ fontSize: 17 }}>Liste des commandes</div>
        <button style={{
          background: '#FF4500', color: '#fff', border: 'none',
          padding: '8px 14px', borderRadius: 18,
          fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'inherit',
        }}>
          <Icons.Download size={12} />
          Exporter
        </button>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 12, gap: 10,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: tab.key === activeTab ? '#FFE5D6' : 'transparent',
                color: tab.key === activeTab ? '#FF4500' : '#9AA3AE',
                border: 'none',
                padding: '6px 11px',
                borderRadius: 18,
                fontSize: 11,
                fontWeight: tab.key === activeTab ? 600 : 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{
            background: '#F5F6F8', borderRadius: 18,
            padding: '6px 12px',
            display: 'flex', alignItems: 'center', gap: 6,
            width: 160,
          }}>
            <Icons.Search size={12} color="#9AA3AE" />
            <input type="text" placeholder="Rechercher..."
                   style={{
                     border: 'none', outline: 'none', background: 'transparent',
                     fontSize: 11.5, width: '100%', fontFamily: 'inherit',
                   }} />
          </div>
          <button style={{
            background: '#F5F6F8', border: 'none',
            borderRadius: '50%', width: 28, height: 28,
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Icons.SlidersHorizontal size={12} color="#6B7280" />
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: cols,
        padding: '10px 0', fontSize: 10.5,
        color: '#9AA3AE', fontWeight: 500,
        borderBottom: '1px solid #F5F6F8',
        flexShrink: 0,
      }}>
        <div>Produit</div>
        <div>ID Commande</div>
        <div>Montant</div>
        <div>Statut</div>
        <div></div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {orders.map((order, i) => {
          const status = statusStyles[order.status]
          const ProductIcon = Icons[order.icon] || Icons.Package

          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: cols,
              padding: '10px 0', fontSize: 11.5,
              color: '#0F1419',
              borderBottom: i < orders.length - 1 ? '1px solid #F5F6F8' : 'none',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: order.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0F1419', flexShrink: 0,
                }}>
                  <ProductIcon size={15} strokeWidth={1.8} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{order.product}</div>
                  <div style={{ fontSize: 10, color: '#9AA3AE' }}>
                    {order.items} article{order.items > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 500 }}>{order.id}</div>
                <div style={{ fontSize: 10, color: '#9AA3AE' }}>{order.date}</div>
              </div>

              <div>
                <div style={{ fontWeight: 600 }}>{order.amount}</div>
                <div style={{ fontSize: 10, color: '#9AA3AE' }}>{order.payment}</div>
              </div>

              <div>
                <span style={{
                  background: status.bg, color: status.color,
                  padding: '3px 9px', borderRadius: 12,
                  fontSize: 10, fontWeight: 600,
                  border: `1px solid ${status.color}33`,
                  whiteSpace: 'nowrap',
                }}>{status.text}</span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button style={{
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', color: '#9AA3AE', padding: 4,
                }}>
                  <Icons.MoreHorizontal size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}