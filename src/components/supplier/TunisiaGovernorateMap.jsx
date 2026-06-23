// components/supplier/TunisiaGovernorateMap.jsx — GROSHOP.tn
// Version sans react-simple-maps : utilise d3-geo + topojson-client directement

import { useState, useEffect, useMemo } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import { scaleLinear } from 'd3-scale'

const GEO_URL =
  'https://cdn.jsdelivr.net/npm/datamaps@0.5.9/src/js/data/tun.topo.json'

const ACCENT = '#FF4500'
const W = 380
const H = 580

// ── Données — à remplacer par l'appel API Django ──────────────────
const govData = {
  Tunis:        { visitors: 4820, orders: 312, revenue: 58400, vG: 62, oG: 44, rG: 28 },
  Ariana:       { visitors: 2140, orders: 178, revenue: 32100, vG: 48, oG: 35, rG: 22 },
  'Ben Arous':  { visitors: 1980, orders: 154, revenue: 28700, vG: 41, oG: 30, rG: 19 },
  Manouba:      { visitors:  890, orders:  67, revenue: 11200, vG: 29, oG: 18, rG: 12 },
  Nabeul:       { visitors: 1340, orders:  98, revenue: 18900, vG: 37, oG: 25, rG: 17 },
  Zaghouan:     { visitors:  310, orders:  22, revenue:  4100, vG: 15, oG:  9, rG:  6 },
  Bizerte:      { visitors: 1120, orders:  84, revenue: 15600, vG: 33, oG: 21, rG: 14 },
  Béja:         { visitors:  420, orders:  31, revenue:  5800, vG: 18, oG: 11, rG:  7 },
  Jendouba:     { visitors:  380, orders:  28, revenue:  5200, vG: 16, oG: 10, rG:  6 },
  'Le Kef':     { visitors:  290, orders:  21, revenue:  3900, vG: 12, oG:  7, rG:  5 },
  Siliana:      { visitors:  220, orders:  16, revenue:  2900, vG: 10, oG:  6, rG:  4 },
  Sousse:       { visitors: 2310, orders: 187, revenue: 34500, vG: 55, oG: 38, rG: 24 },
  Monastir:     { visitors: 1750, orders: 142, revenue: 26300, vG: 49, oG: 33, rG: 21 },
  Mahdia:       { visitors:  680, orders:  51, revenue:  9400, vG: 24, oG: 15, rG: 10 },
  Sfax:         { visitors: 2890, orders: 234, revenue: 43200, vG: 58, oG: 41, rG: 26 },
  Kairouan:     { visitors:  760, orders:  57, revenue: 10500, vG: 26, oG: 16, rG: 11 },
  Kasserine:    { visitors:  450, orders:  33, revenue:  6100, vG: 19, oG: 12, rG:  8 },
  'Sidi Bouzid':{ visitors:  390, orders:  29, revenue:  5300, vG: 16, oG: 10, rG:  7 },
  Gabès:        { visitors:  870, orders:  65, revenue: 12000, vG: 31, oG: 20, rG: 13 },
  Médenine:     { visitors:  740, orders:  56, revenue: 10200, vG: 27, oG: 17, rG: 11 },
  Tataouine:    { visitors:  240, orders:  18, revenue:  3300, vG: 11, oG:  7, rG:  4 },
  Gafsa:        { visitors:  520, orders:  39, revenue:  7100, vG: 21, oG: 13, rG:  9 },
  Tozeur:       { visitors:  310, orders:  23, revenue:  4200, vG: 14, oG:  8, rG:  5 },
  Kébili:       { visitors:  270, orders:  20, revenue:  3600, vG: 12, oG:  7, rG:  4 },
}

const nameMap = {
  Tunis: 'Tunis', Ariana: 'Ariana', 'Ben Arous': 'Ben Arous',
  'La Manouba': 'Manouba', Manouba: 'Manouba', Nabeul: 'Nabeul',
  Zaghouan: 'Zaghouan', Bizerte: 'Bizerte', Beja: 'Béja', Béja: 'Béja',
  Jendouba: 'Jendouba', 'Le Kef': 'Le Kef', Kef: 'Le Kef', Siliana: 'Siliana',
  Sousse: 'Sousse', Monastir: 'Monastir', Mahdia: 'Mahdia', Sfax: 'Sfax',
  Kairouan: 'Kairouan', Kasserine: 'Kasserine', 'Sidi Bouzid': 'Sidi Bouzid',
  Gabes: 'Gabès', Gabès: 'Gabès', Medenine: 'Médenine', Médenine: 'Médenine',
  Tataouine: 'Tataouine', Gafsa: 'Gafsa', Tozeur: 'Tozeur',
  Kebili: 'Kébili', Kébili: 'Kébili',
}

// ── StatCard ───────────────────────────────────────────────────────
function StatCard({ label, value, sub, percent }) {
  return (
    <div style={{
      background: '#FAFAF6',
      borderRadius: '10px',
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: '11px', color: '#9AA3AE', marginBottom: '2px' }}>{label}</div>
      <div style={{
        fontSize: '20px', fontWeight: 700, color: '#0F1419',
        fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.02em',
      }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#9AA3AE', marginBottom: '8px' }}>{sub}</div>
      <div style={{
        background: '#EFEDE6', borderRadius: '3px', height: '6px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: '3px', background: ACCENT,
          width: `${Math.min(percent, 100)}%`,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}

// ── Component principal ───────────────────────────────────────────
export default function TunisiaGovernorateMap() {
  const [geographies, setGeographies] = useState([])
  const [selected, setSelected] = useState('Tunis')
  const [hovered, setHovered] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Charge le TopoJSON au mount
  useEffect(() => {
    let cancelled = false
    fetch(GEO_URL)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(topology => {
        if (cancelled) return
        const objKey = Object.keys(topology.objects)[0]
        const geoFeatures = feature(topology, topology.objects[objKey]).features
        setGeographies(geoFeatures)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        console.error('Erreur chargement carte:', err)
        setError(err.message)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Path generator d3 (Mercator centré sur la Tunisie)
  const pathGen = useMemo(() => {
    const proj = geoMercator()
      .center([9.2, 33.9])
      .scale(2800)
      .translate([W / 2, H / 2])
    return geoPath().projection(proj)
  }, [])

  const maxOrders = useMemo(
    () => Math.max(...Object.values(govData).map(d => d.orders)), []
  )

  const colorScale = useMemo(
    () => scaleLinear().domain([0, maxOrders]).range(['#FFE5D6', ACCENT]),
    [maxOrders]
  )

  const data = govData[selected]

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap',
      background: '#fff',
      border: '1px solid #EFEDE6', borderRadius: '16px',
      overflow: 'hidden',
      fontFamily: 'DM Sans, sans-serif',
      height: '100%',
    }}>

      {/* Carte */}
      <div style={{
        flex: '1 1 320px', minWidth: 280,
        background: '#FAFAF6', position: 'relative',
        padding: '16px 20px',
      }}>
        <div style={{
          fontSize: '13px', fontWeight: 500,
          color: '#6B7280', marginBottom: '8px',
        }}>
          Carte par gouvernorat · Tunisie
        </div>

        {loading && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '400px', color: '#9AA3AE', fontSize: '13px',
          }}>
            Chargement de la carte...
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '400px', color: '#E5446D', fontSize: '13px', textAlign: 'center',
          }}>
            Impossible de charger la carte<br />({error})
          </div>
        )}

        {!loading && !error && (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            {geographies.map((geo, i) => {
              const rawName = geo.properties.name || geo.properties.NAME || ''
              const mapped = nameMap[rawName] || rawName
              const d = govData[mapped]
              const isSelected = mapped === selected
              const isHovered = hovered?.name === mapped

              return (
                <path
                  key={i}
                  d={pathGen(geo)}
                  fill={d ? colorScale(d.orders) : '#E8E4DF'}
                  stroke={isSelected || isHovered ? ACCENT : '#fff'}
                  strokeWidth={isSelected || isHovered ? 2 : 0.8}
                  style={{
                    cursor: d ? 'pointer' : 'default',
                    transition: 'stroke 0.15s, stroke-width 0.15s',
                    outline: 'none',
                  }}
                  onMouseEnter={() => setHovered({ name: mapped, ...d })}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => d && setSelected(mapped)}
                />
              )
            })}
          </svg>
        )}

        {/* Légende */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginTop: '8px', fontSize: '11px', color: '#9AA3AE',
        }}>
          <span>0</span>
          <div style={{
            flex: 1, height: '6px', borderRadius: '3px',
            background: `linear-gradient(to right, #FFE5D6, ${ACCENT})`,
          }} />
          <span>{maxOrders} cmd</span>
        </div>

        {/* Tooltip */}
        {hovered && (
          <div style={{
            position: 'absolute', top: '16px', right: '16px',
            background: '#fff', border: '1px solid #E5E2DA',
            borderRadius: '10px', padding: '8px 12px', fontSize: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            pointerEvents: 'none', minWidth: '130px',
          }}>
            <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '4px', color: '#0F1419' }}>
              {hovered.name}
            </div>
            {hovered.orders !== undefined && (
              <>
                <div style={{ color: '#9AA3AE' }}>{hovered.orders} commandes</div>
                <div style={{ color: '#9AA3AE' }}>
                  {hovered.visitors?.toLocaleString()} visiteurs
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Panneau stats */}
      <div style={{
        flex: '1 1 220px', minWidth: 200, padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        borderLeft: '1px solid #EFEDE6',
      }}>
        <div style={{
          fontSize: '20px', fontWeight: 700, color: ACCENT,
          fontFamily: 'Fraunces, Georgia, serif', letterSpacing: '-0.02em',
        }}>
          {selected}
        </div>
        <div style={{
          fontSize: '12px', color: '#9AA3AE',
          marginTop: '-6px', marginBottom: '4px',
        }}>
          Gouvernorat de {selected}
        </div>

        <StatCard
          label="Visiteurs uniques"
          value={data.visitors.toLocaleString()}
          sub={`+${data.vG}% cette semaine`}
          percent={(data.visitors / 4820) * 100}
        />
        <StatCard
          label="Commandes"
          value={data.orders}
          sub={`+${data.oG}% ce mois`}
          percent={(data.orders / 312) * 100}
        />
        <StatCard
          label="Chiffre d'affaires"
          value={`${data.revenue.toLocaleString('fr-TN')} TND`}
          sub={`+${data.rG}% vs mois dernier`}
          percent={(data.revenue / 58400) * 100}
        />
      </div>
    </div>
  )
}