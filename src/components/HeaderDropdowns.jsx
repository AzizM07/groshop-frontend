// HeaderDropdowns.jsx — GROSHOP.tn
// Panneaux du header : messages, commandes, panier (survol), adresse (clic),
// téléchargement (survol), langue (clic).

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useUnread } from '../context/UnreadContext'
import { messaging, orders, addresses as addressesApi } from '../lib/api'
import * as Icons from 'lucide-react'
import PHONE_ICON from '../assets/phone.png'

// --- Leaflet ---
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Correction des icônes par défaut de Leaflet (problème avec les images)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const fetchMessages = () => messaging.conversations()
const fetchOrders   = () => orders.list()

const ORANGE = '#ff5e20'
const INK    = '#0F1419'
const MUTE   = '#6B7785'
const FAINT  = '#9AA3AE'
const LINE   = '#E8EAED'
const SOFT   = '#FFF4EE'

const asText = (v) => {
  if (v == null) return ''
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (typeof v === 'object') return v.content || v.text || v.name || v.title || ''
  return ''
}

const fmtDate = (d) => {
  const raw = typeof d === 'object' && d ? (d.created_at || d.updated_at) : d
  if (!raw) return ''
  const date = new Date(raw)
  return isNaN(date) ? '' : date.toISOString().slice(0, 10)
}
const fmtPrice = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* ── Suivi du curseur ── */
const pointer = { x: -1, y: -1 }
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', e => { pointer.x = e.clientX; pointer.y = e.clientY }, { passive: true })
}
const isUnder = (el, pad = 6) => {
  if (!el) return false
  const r = el.getBoundingClientRect()
  return pointer.x >= r.left - pad && pointer.x <= r.right + pad
      && pointer.y >= r.top - pad  && pointer.y <= r.bottom + pad
}

/* ═══════════════════════════════════════════════════════════════════
   Coque générique : icône + badge + panneau au survol
   ═══════════════════════════════════════════════════════════════════ */
export function IconDropdown({ to, title, badge = 0, width = 380, icon, children }) {
  const [open, setOpen] = useState(false)
  const [hov, setHov]   = useState(false)
  const timerRef = useRef(null)
  const wrapRef  = useRef(null)
  const panelRef = useRef(null)

  // Écoute l'événement global pour fermer ce menu
  useEffect(() => {
    const handleClose = () => setOpen(false)
    window.addEventListener('closeDropdowns', handleClose)
    return () => window.removeEventListener('closeDropdowns', handleClose)
  }, [])

  const handleEnter = () => {
    window.dispatchEvent(new CustomEvent('closeDropdowns'))
    clearTimeout(timerRef.current)
    setOpen(true)
    setHov(true)
  }

  const handleLeave = () => {
    clearTimeout(timerRef.current)
    setHov(false)
    timerRef.current = setTimeout(() => {
      if (isUnder(wrapRef.current) || isUnder(panelRef.current)) return
      setOpen(false)
    }, 150)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
      onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link to={to} title={title} className="gh-util"
        style={{
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: (hov || open) ? ORANGE : INK, textDecoration: 'none',
          transition: 'color .15s', flexShrink: 0,
        }}>
        {icon}
        {badge > 0 && (
          <span key={badge} className="gh-badge" style={{
            position: 'absolute', top: '-5px', right: '-7px',
            minWidth: '18px', height: '18px', padding: '0 4px',
            borderRadius: '9px', background: ORANGE, color: '#fff',
            fontSize: '10px', fontWeight: 700, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #fff', boxSizing: 'border-box', pointerEvents: 'none',
          }}>
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </Link>
      {open && (
        <div ref={panelRef} className="gh-dd" style={{
          position: 'absolute', top: '100%', right: '-12px',
          paddingTop: '14px', zIndex: 2400,
        }}>
          <div style={{
            position: 'absolute', top: '7px', right: '18px',
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid #fff',
            filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,.05))',
            zIndex: 1,
          }} />
          <div style={{
            width, background: '#fff',
            border: `1px solid ${LINE}`, borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0,0,0,.14)',
            overflow: 'hidden', textAlign: 'left',
          }}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Briques communes ── */
function PanelTitle({ children }) {
  return <div style={{ padding: '16px 18px 8px', fontSize: '15px', fontWeight: 700, color: INK }}>{children}</div>
}
function PanelFooter({ to, label }) {
  return (
    <div style={{ padding: '10px 14px 14px' }}>
      <Link to={to} style={{
        display: 'block', textAlign: 'center', padding: '11px',
        background: ORANGE, color: '#fff', borderRadius: '30px',
        fontSize: '13.5px', fontWeight: 700, textDecoration: 'none',
      }}>{label}</Link>
    </div>
  )
}
function PanelEmpty({ children }) {
  return <div style={{ padding: '28px 18px', textAlign: 'center', fontSize: '13px', color: FAINT }}>{children}</div>
}
function PanelSkeleton({ rows = 3 }) {
  return (
    <div style={{ padding: '8px 18px 16px' }}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 0' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F4F5F7', flexShrink: 0, animation: 'skeleton-pulse 1.5s infinite' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 10, width: '45%', background: '#F4F5F7', borderRadius: 4, marginBottom: 8, animation: 'skeleton-pulse 1.5s infinite' }} />
            <div style={{ height: 10, width: '80%', background: '#F4F5F7', borderRadius: 4, animation: 'skeleton-pulse 1.5s infinite' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
function Row({ children, to }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', gap: '12px', padding: '11px 18px',
        textDecoration: 'none', background: hov ? '#FAFAFA' : 'transparent',
        transition: 'background .12s',
      }}>
      {children}
    </Link>
  )
}

/* Charge la donnée au premier survol */
function useLazyData(fetcher, enabled) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const done = useRef(false)
  useEffect(() => {
    if (!enabled || done.current) return
    done.current = true
    setLoading(true)
    fetcher()
      .then(d => setData(Array.isArray(d) ? d : (d?.results || d?.conversations || d?.orders || [])))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [enabled])
  return { data, loading }
}

/* Commandes du header : fetch au montage + au retour d'onglet (badge live).
   activeCount = commandes EN COURS (hors livrées / annulées). */
const ORDERS_DONE = ['delivered', 'cancelled', 'completed', 'refunded']
function useOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!user) { setOrders([]); return }
    let alive = true
    const load = () => {
      setLoading(true)
      fetchOrders()
        .then(d => { if (alive) setOrders(Array.isArray(d) ? d : (d?.results || d?.orders || [])) })
        .catch(() => { if (alive) setOrders([]) })
        .finally(() => { if (alive) setLoading(false) })
    }
    load()
    const onFocus = () => { if (document.visibilityState === 'visible') load() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    window.addEventListener('gs-orders-refresh', load)
    return () => {
      alive = false
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
      window.removeEventListener('gs-orders-refresh', load)
    }
  }, [user])
  const activeCount = (orders || []).filter(
    o => !ORDERS_DONE.includes(String(o.status || '').toLowerCase())
  ).length
  return { orders, loading, activeCount }
}

/* ═══════════════════════════════════════════════════════════════════
   MESSAGES, ORDERS, CART (utilisent IconDropdown)
   ═══════════════════════════════════════════════════════════════════ */
export function MessagesDropdown() {
  const [armed, setArmed] = useState(false)
  const { unread } = useUnread()
  const { data, loading } = useLazyData(fetchMessages, armed)
  return (
    <div onMouseEnter={() => setArmed(true)} style={{ display: 'flex' }}>
      <IconDropdown to="/messages" title="Messages" badge={unread} width={400} icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      }>
        <PanelTitle>Messages</PanelTitle>
        {loading && <PanelSkeleton rows={3} />}
        {!loading && data?.length === 0 && <PanelEmpty>Aucun message</PanelEmpty>}
        {!loading && data?.slice(0, 4).map(m => {
          const name = asText(m.supplier?.name || m.supplier_name || m.name || m.sender_name)
          const product = asText(m.product_name)
          const last = asText(m.last_message || m.preview)
          const date = fmtDate(m.last_msg_at || m.last_message?.created_at || m.updated_at || m.created_at)
          const logo = m.supplier?.logo_url || m.supplier_logo || m.avatar_url
          return (
            <Row key={m.id} to={`/messages/${m.id}`}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: '#F4F5F7', flexShrink: 0 }}>
                {logo
                  ? <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover'}} loading="lazy"/>
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: MUTE }}>{(name || '?')[0]}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: INK, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name || 'Conversation'}</span>
                  <span style={{ fontSize: '11px', color: FAINT, flexShrink: 0 }}>{date}</span>
                </div>
                {product && <div style={{ fontSize: '12px', color: MUTE, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product}</div>}
                <div style={{ fontSize: '12.5px', color: '#3D4853', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{last}</div>
              </div>
              {m.unread_count > 0 && (
                <span style={{ alignSelf: 'center', minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, background: ORANGE, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{m.unread_count}</span>
              )}
            </Row>
          )
        })}
        {!loading && data?.length > 0 && <PanelFooter to="/messages" label="En savoir plus" />}
      </IconDropdown>
    </div>
  )
}

export function OrdersDropdown() {
  const { orders: data, loading, activeCount } = useOrders()
  return (
    <div style={{ display: 'flex' }}>
      <IconDropdown to="/dashboard/commandes" title="Mes commandes" badge={activeCount} width={380} icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1"/>
          <line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="13" y2="15"/>
        </svg>
      }>
        <PanelTitle>Mes commandes</PanelTitle>
        {loading && !data && <PanelSkeleton rows={3} />}
        {data?.length === 0 && <PanelEmpty>Aucune commande</PanelEmpty>}
        {data?.slice(0, 4).map(o => (
          <Row key={o.id} to={`/dashboard/commandes/${o.id}`}>
            <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#F4F5F7', flexShrink: 0 }}>
              {o.image_url ? <img src={o.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover'}} loading="lazy"/> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: INK, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asText(o.reference) || `Commande #${o.id}`}</span>
                <span style={{ fontSize: '11px', color: FAINT, flexShrink: 0 }}>{fmtDate(o.created_at)}</span>
              </div>
              <div style={{ fontSize: '12px', color: MUTE, marginTop: 3 }}>{o.items_count || 0} article{(o.items_count || 0) > 1 ? 's' : ''} · {fmtPrice(o.total_tnd)} TND</div>
              {(o.status_display || o.status) && <span style={{ display: 'inline-block', marginTop: 5, fontSize: 10.5, fontWeight: 600, color: MUTE, background: '#F4F5F7', padding: '2px 8px', borderRadius: 20 }}>{asText(o.status_display || o.status)}</span>}
            </div>
          </Row>
        ))}
        {data?.length > 0 && <PanelFooter to="/dashboard/commandes" label="Voir toutes mes commandes" />}
      </IconDropdown>
    </div>
  )
}

export function CartDropdown() {
  const { items = [], count = 0 } = useCart()
  const total = items.reduce((sum, i) => sum + (parseFloat(i.unit_price_tnd) || 0) * (Number(i.quantity) || 0), 0)
  return (
    <IconDropdown to="/panier" title="Panier" badge={count} width={380} icon={
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    }>
      <PanelTitle>Panier ({items.length})</PanelTitle>
      {items.length === 0 && <PanelEmpty>Votre panier est vide</PanelEmpty>}
      {items.slice(0, 4).map(item => {
        const p = item.product || {}
        return (
          <Row key={item.id} to={`/produit/${p.id}`}>
            <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#F4F5F7', flexShrink: 0 }}>
              {p.image_url ? <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover'}} loading="lazy"/> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12.5px', fontWeight: 500, color: INK, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{asText(p.name)}</div>
              <div style={{ fontSize: '12px', color: MUTE, marginTop: 4 }}>{item.quantity} × <span style={{ color: ORANGE, fontWeight: 700 }}>{fmtPrice(item.unit_price_tnd)} TND</span></div>
            </div>
          </Row>
        )
      })}
      {items.length > 4 && <div style={{ padding: '4px 18px 0', fontSize: '12px', color: FAINT }}>+{items.length - 4} autre{items.length - 4 > 1 ? 's' : ''} article{items.length - 4 > 1 ? 's' : ''}</div>}
      {items.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 18px 4px', borderTop: `1px solid ${LINE}`, marginTop: 8 }}>
            <span style={{ fontSize: '13px', color: MUTE }}>Total</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: ORANGE }}>{fmtPrice(total)} TND</span>
          </div>
          <PanelFooter to="/panier" label="Voir le panier" />
        </>
      )}
    </IconDropdown>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ADRESSE DE LIVRAISON — au clic
   ═══════════════════════════════════════════════════════════════════ */
const GOUVERNORATS_TN = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
  'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'La Manouba', 'Médenine',
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine',
  'Tozeur', 'Tunis', 'Zaghouan',
]
const COUNTRIES = [
  { code: 'TN', flag: '🇹🇳', name: 'Tunisia' },
  { code: 'FR', flag: '🇫🇷', name: 'France' },
  { code: 'DZ', flag: '🇩🇿', name: 'Algeria' },
  { code: 'MA', flag: '🇲🇦', name: 'Morocco' },
  { code: 'IT', flag: '🇮🇹', name: 'Italy' },
]
const flagOf = (code) => (COUNTRIES.find(c => c.code === code) || COUNTRIES[0]).flag

// ─── Composant MapPicker (carte OSM avec marqueur) ──────────────
function MapPicker({ onLocationSelect, initialLat = 36.8, initialLng = 10.18 }) {
  const [position, setPosition] = useState({ lat: initialLat, lng: initialLng })
  const [isLocating, setIsLocating] = useState(false)

  const handlePositionChange = (newPos) => {
    setPosition(newPos)
    onLocationSelect(newPos)
  }

  // Sous-composant pour les événements de la carte
  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng
        handlePositionChange({ lat, lng })
        map.flyTo(e.latlng, map.getZoom())
      },
    })

    return (
      <Marker
        position={[position.lat, position.lng]}
        draggable
        eventHandlers={{
          dragend(e) {
            const marker = e.target
            const pos = marker.getLatLng()
            handlePositionChange({ lat: pos.lat, lng: pos.lng })
          },
        }}
      />
    )
  }

  // Géolocalisation HTML5
  const locateUser = () => {
    if (!navigator.geolocation) {
      alert('Géolocalisation non supportée par votre navigateur.')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        handlePositionChange({ lat: latitude, lng: longitude })
        setIsLocating(false)
      },
      (err) => {
        alert('Impossible de récupérer votre position : ' + err.message)
        setIsLocating(false)
      },
      { enableHighAccuracy: true }
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={locateUser}
          disabled={isLocating}
          style={{
            padding: '4px 12px',
            background: ORANGE,
            color: '#fff',
            border: 'none',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {isLocating ? 'Localisation…' : '📍 Ma position'}
        </button>
        <span style={{ fontSize: 11, color: MUTE, alignSelf: 'center' }}>
          Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}
        </span>
      </div>
      <div style={{ flex: 1, borderRadius: 10, overflow: 'hidden', border: `1px solid ${LINE}` }}>
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </div>
      <div style={{ fontSize: 10, color: FAINT, marginTop: 4 }}>
        Cliquez sur la carte ou faites glisser le marqueur.
      </div>
    </div>
  )
}

// ─── Composants d'adresse ────────────────────────────────────────
function AddressCard({ address, onSetDefault, onDelete }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ border: `1px solid ${hov ? '#D6D9DE' : LINE}`, borderRadius: 12, padding: '12px 14px', marginBottom: 10, transition: 'border-color .12s' }}>
      <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.5 }}>
        <span style={{ fontWeight: 700 }}>{address.full_name}</span> <span style={{ color: '#3D4853' }}>{address.street}, {address.city}, {address.region}, {address.postal_code}, {address.country}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        {address.is_default ? <span style={{ display: 'inline-block', background: SOFT, color: ORANGE, padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700 }}>Adresse de livraison par défaut</span>
          : <button type="button" onClick={onSetDefault} style={{ background: 'none', border: `1px solid ${LINE}`, color: MUTE, padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>Définir par défaut</button>}
        <div style={{ flex: 1 }} />
        <button type="button" onClick={onDelete} style={{ background: 'none', border: 'none', color: FAINT, fontSize: 11.5, cursor: 'pointer', padding: 0 }}>Supprimer</button>
      </div>
    </div>
  )
}

// ─── Formulaire d'adresse (avec Reverse Geocoding) ──────────────
function AddressForm({ onCancel, onCreated, initialCoords, onCoordsChange }) {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    country: 'TN',
    region: '',
    city: '',
    postal_code: '',
    street: '',
    additional: '',
    is_default: false,
    latitude: initialCoords?.lat || null,
    longitude: initialCoords?.lng || null,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [isGeocoding, setIsGeocoding] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // 1. Mise à jour des coordonnées dans le formulaire
  useEffect(() => {
    if (initialCoords) {
      set('latitude', initialCoords.lat)
      set('longitude', initialCoords.lng)
    }
  }, [initialCoords])

  // 2. Reverse Geocoding (Nominatim) pour remplir automatiquement les champs au déplacement du marqueur
  useEffect(() => {
    if (!initialCoords?.lat || !initialCoords?.lng) return
    const { lat, lng } = initialCoords
    
    // Éviter les appels excessifs si les coordonnées changent de manière insignifiante
    const geocode = async () => {
      setIsGeocoding(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        )
        const data = await res.json()
        const addr = data?.address

        if (addr) {
          setForm(prev => ({
            ...prev,
            street: addr.road || addr.suburb || addr.neighbourhood || prev.street,
            city: addr.city || addr.town || addr.village || addr.hamlet || prev.city,
            region: addr.state || addr.region || addr.county || prev.region,
            postal_code: addr.postcode || prev.postal_code,
            country: addr.country_code ? addr.country_code.toUpperCase() : prev.country,
          }))
        }
      } catch (err) {
        console.error("Erreur de géocodage inversé:", err)
      } finally {
        setIsGeocoding(false)
      }
    }

    geocode()
  }, [initialCoords?.lat, initialCoords?.lng])

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const created = await addressesApi.create(form)
      onCreated(created)
    } catch (err) {
      const msg = err?.message || err?.response?.data || 'Erreur lors de la sauvegarde.'
      setError(typeof msg === 'string' ? msg : 'Vérifiez les champs.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 13, color: INK, outline: 'none', boxSizing: 'border-box', background: '#fff' }
  const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input required placeholder="Nom du destinataire" value={form.full_name} onChange={e => set('full_name', e.target.value)} style={inputStyle} />
      <input required placeholder="Téléphone" value={form.phone} onChange={e => set('phone', e.target.value)} style={inputStyle} />
      <div style={rowStyle}>
        <select value={form.country} onChange={e => set('country', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}</select>
        <div style={{ position: 'relative' }}>
          <select value={form.region} onChange={e => set('region', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }} required><option value="">Gouvernorat…</option>{GOUVERNORATS_TN.map(g => <option key={g} value={g}>{g}</option>)}</select>
          {isGeocoding && <span style={{ position: 'absolute', right: 8, top: 10, fontSize: 11, color: FAINT }}>Chargement...</span>}
        </div>
      </div>
      <div style={rowStyle}>
        <input required placeholder="Ville" value={form.city} onChange={e => set('city', e.target.value)} style={inputStyle} />
        <input required placeholder="Code postal" value={form.postal_code} onChange={e => set('postal_code', e.target.value)} style={inputStyle} />
      </div>
      <input required placeholder="Rue (ex. Av. Habib Bourguiba)" value={form.street} onChange={e => set('street', e.target.value)} style={inputStyle} />
      <input placeholder="Complément (apt, étage, bâtiment)" value={form.additional} onChange={e => set('additional', e.target.value)} style={inputStyle} />
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: MUTE, marginTop: 2 }}>
        <input type="checkbox" checked={form.is_default} onChange={e => set('is_default', e.target.checked)} /> Utiliser comme adresse par défaut
      </label>
      {error && <div style={{ color: '#B42318', fontSize: 12 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: 11, background: '#fff', color: INK, border: `1px solid ${LINE}`, borderRadius: 30, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>Annuler</button>
        <button type="submit" disabled={saving || isGeocoding} style={{ flex: 1, padding: 11, background: ORANGE, color: '#fff', border: 'none', borderRadius: 30, fontSize: 13.5, fontWeight: 700, cursor: (saving || isGeocoding) ? 'default' : 'pointer', opacity: (saving || isGeocoding) ? 0.7 : 1 }}>{saving ? 'Sauvegarde…' : 'Sauvegarder'}</button>
      </div>
    </form>
  )
}

// ─── AddressDropdown avec intégration de la carte en Flex ──────
export function AddressDropdown() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [useMap, setUseMap] = useState(false)
  const [coords, setCoords] = useState({ lat: 36.8, lng: 10.18 }) // coordonnées par défaut (Tunis)
  const [defaultCountry, setDefaultCtr] = useState('TN')
  const [postalGuest, setPostalGuest] = useState('')
  const wrapRef = useRef(null)
  const panelRef = useRef(null)
  const loaded = useRef(false)

  useEffect(() => {
    const handleClose = () => setOpen(false)
    window.addEventListener('closeDropdowns', handleClose)
    return () => window.removeEventListener('closeDropdowns', handleClose)
  }, [])

  useEffect(() => {
    if (!open || !user || loaded.current) return
    loaded.current = true
    setLoading(true)
    addressesApi.list()
      .then(d => setItems(Array.isArray(d) ? d : (d?.results || [])))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [open, user])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setShowForm(false)
        setUseMap(false)
      }
    }
    const onEsc = (e) => { if (e.key === 'Escape') { setOpen(false); setShowForm(false); setUseMap(false) } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onEsc) }
  }, [open])

  const defaultItem = items.find(a => a.is_default) || items[0]
  const label = user && defaultItem ? defaultItem.country : defaultCountry

  const handleAdded = (created) => {
    setItems(prev => {
      const next = created.is_default ? prev.map(a => ({ ...a, is_default: false })) : prev
      return [created, ...next.filter(a => a.id !== created.id)]
    })
    setShowForm(false)
    setUseMap(false)
  }

  const handleSetDefault = async (id) => {
    try { await addressesApi.setDefault(id); setItems(prev => prev.map(a => ({ ...a, is_default: a.id === id }))) } catch (e) { console.error(e) }
  }
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette adresse ?')) return
    try { await addressesApi.remove(id); setItems(prev => prev.filter(a => a.id !== id)) } catch (e) { console.error(e) }
  }

  const toggleOpen = () => {
    window.dispatchEvent(new CustomEvent('closeDropdowns'))
    setOpen(prev => !prev)
    if (!open) {
      setShowForm(false)
      setUseMap(false)
    }
  }

  return (
    <div ref={wrapRef} className="gh-delivery" style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginRight: '6px', lineHeight: 1.05, flexShrink: 0 }}>
      <button type="button" onClick={toggleOpen} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.05 }}>
        <span style={{ fontSize: 'clamp(11px, 0.95vw, 13.5px)', color: MUTE, marginBottom: '3px' }}>Adresse de livraison :</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'clamp(14px, 1.25vw, 17px)', fontWeight: 700, color: INK }}>
          <span style={{ fontSize: 'clamp(16px, 1.4vw, 20px)' }}>{flagOf(label)}</span>{label}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 2 }}><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </button>
      {open && (
        <div ref={panelRef} className="gh-dd" style={{ position: 'absolute', top: 'calc(100% + 14px)', left: 0, zIndex: 2400 }}>
          <div style={{ position: 'absolute', top: -7, left: 24, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '8px solid #fff', filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,.05))' }} />
          
          {/* La largeur s'adapte automatiquement si la carte est ouverte */}
          <div style={{ width: useMap ? '620px' : '460px', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,.14)', overflow: 'hidden', transition: 'width 0.25s ease' }}>
            <div style={{ padding: '18px 20px 8px' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>Précisez votre emplacement</div>
              <div style={{ fontSize: 12.5, color: MUTE, marginTop: 6, lineHeight: 1.5 }}>Les options logistiques et les frais de port varient en fonction de votre emplacement</div>
            </div>
            <div style={{ padding: '10px 20px 4px' }}>
              {user ? (
                <>
                  {loading && <div style={{ padding: '18px 0', fontSize: 13, color: FAINT }}>Chargement…</div>}
                  {!loading && items.length === 0 && !showForm && <div style={{ padding: '16px', border: `1px dashed ${LINE}`, borderRadius: 12, fontSize: 13, color: MUTE, textAlign: 'center' }}>Aucune adresse enregistrée pour l'instant.</div>}
                  {!loading && !showForm && items.slice(0, 3).map(a => <AddressCard key={a.id} address={a} onSetDefault={() => handleSetDefault(a.id)} onDelete={() => handleDelete(a.id)} />)}
                  {!showForm && (
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '10px 2px 4px', fontSize: 13.5, fontWeight: 700 }}>
                      {items.length > 3 && <><Link to="/dashboard/addresses" style={{ color: INK, textDecoration: 'underline' }}>Voir plus</Link><span style={{ color: LINE }}>|</span></>}
                      <button type="button" onClick={() => setShowForm(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: INK, textDecoration: 'underline', fontSize: 13.5, fontWeight: 700 }}>Ajouter une adresse</button>
                    </div>
                  )}
                  
                  {/* Mise en page Carte à droite / Formulaire à gauche */}
                  {showForm && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setUseMap(!useMap)}
                          style={{
                            background: 'none', border: 'none',
                            color: useMap ? '#B42318' : ORANGE,
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          {useMap ? '✕ Masquer la carte' : '📍 Localiser sur la carte'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'stretch' }}>
                        <div style={{ flex: useMap ? '1.4' : '1', minWidth: 0 }}>
                          <AddressForm
                            onCancel={() => { setShowForm(false); setUseMap(false) }}
                            onCreated={handleAdded}
                            initialCoords={coords}
                            onCoordsChange={setCoords}
                          />
                        </div>
                        {useMap && (
                          <div style={{ flex: '1', minWidth: '220px' }}>
                            <div style={{ height: '100%', minHeight: '320px' }}>
                              <MapPicker
                                onLocationSelect={(pos) => setCoords(pos)}
                                initialLat={coords.lat}
                                initialLng={coords.lng}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '4px 0 8px', fontSize: 13, color: MUTE, textAlign: 'center' }}>
                  <Link to="/login" style={{ color: ORANGE, fontWeight: 700, textDecoration: 'underline' }}>Connectez-vous</Link> pour sauvegarder vos adresses.
                </div>
              )}
            </div>
            {!showForm && !user && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', color: FAINT, fontSize: 12 }}>
                  <div style={{ flex: 1, height: 1, background: LINE }} /><span>Ou</span><div style={{ flex: 1, height: 1, background: LINE }} />
                </div>
                <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <select value={defaultCountry} onChange={e => setDefaultCtr(e.target.value)} style={{ width: '100%', padding: '11px 14px', border: `1px solid ${LINE}`, borderRadius: 10, fontSize: 14, background: '#fff', color: INK, outline: 'none', cursor: 'pointer' }}>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                  </select>
                  <input type="text" value={postalGuest} onChange={e => setPostalGuest(e.target.value)} placeholder="Saisissez un code postal" style={{ width: '100%', padding: '11px 14px', border: `1px solid ${LINE}`, borderRadius: 10, fontSize: 14, color: INK, outline: 'none', boxSizing: 'border-box' }} />
                  <button type="button" onClick={() => setOpen(false)} style={{ width: '100%', padding: '13px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 30, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Sauvegarder</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   TÉLÉCHARGEMENT DE L'APPLICATION — survol
   ═══════════════════════════════════════════════════════════════════ */
export function AppDownloadDropdown() {
  const [open, setOpen] = useState(false)
  const [hov, setHov] = useState(false)
  const timerRef = useRef(null)
  const wrapRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    const handleClose = () => setOpen(false)
    window.addEventListener('closeDropdowns', handleClose)
    return () => window.removeEventListener('closeDropdowns', handleClose)
  }, [])

  const handleEnter = () => {
    window.dispatchEvent(new CustomEvent('closeDropdowns'))
    clearTimeout(timerRef.current)
    setOpen(true)
    setHov(true)
  }

  const handleLeave = () => {
    clearTimeout(timerRef.current)
    setHov(false)
    timerRef.current = setTimeout(() => {
      if (isUnder(wrapRef.current) || isUnder(panelRef.current)) return
      setOpen(false)
    }, 150)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button className="gh-app-download" style={{
        display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer',
        padding: '4px 12px 4px 4px', borderRadius: '8px', transition: 'background 0.15s, color 0.15s',
        flexShrink: 0, color: (hov || open) ? ORANGE : INK,
      }} onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={PHONE_ICON} alt="Télécharger l'application" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
          <span style={{ fontSize: 'clamp(10px, 0.85vw, 12px)', color: MUTE, fontWeight: 400 }}>Téléchargez l'application</span>
          <span style={{ fontSize: 'clamp(14px, 1.2vw, 17px)', fontWeight: 400, color: (hov || open) ? ORANGE : INK }}>GROSHOP</span>
        </div>
      </button>
      {open && (
        <div ref={panelRef} className="gh-dd" style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '12px', background: '#fff',
          border: `1px solid ${LINE}`, borderRadius: '16px', boxShadow: '0 12px 40px rgba(0,0,0,.14)',
          minWidth: '340px', padding: '24px', zIndex: 2400,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
              <img src={PHONE_ICON} alt="GROSHOP app" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: INK }}>Téléchargez l'application</div>
              <div style={{ fontSize: '13px', color: MUTE }}>GROSHOP sur mobile</div>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: MUTE, lineHeight: 1.5, margin: '0 0 18px 0' }}>Trouvez des produits, communiquez avec des fournisseurs, gérez et payez vos commandes partout.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href="/app/ios" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: INK, color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, flex: 1, justifyContent: 'center', transition: 'background 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = '#1F2937' }} onMouseLeave={e => { e.currentTarget.style.background = INK }}><Icons.Apple size={18} /> App Store</a>
            <a href="/app/android" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: INK, color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, flex: 1, justifyContent: 'center', transition: 'background 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = '#1F2937' }} onMouseLeave={e => { e.currentTarget.style.background = INK }}><Icons.Smartphone size={18} /> Google Play</a>
          </div>
          <div style={{ marginTop: '14px', textAlign: 'center' }}><a href="/app" style={{ fontSize: '13px', color: ORANGE, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>En savoir plus →</a></div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   LANGUE / DEVISE — au clic
   ═══════════════════════════════════════════════════════════════════ */
export function LanguageDropdown() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const panelRef = useRef(null)

  const [selectedLang, setSelectedLang] = useState('Français')
  const [selectedCurrency, setSelectedCurrency] = useState('TND')

  const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
  ]
  const currencies = [
    { code: 'TND', label: 'TND' },
  ]

  useEffect(() => {
    const handleClose = () => setOpen(false)
    window.addEventListener('closeDropdowns', handleClose)
    return () => window.removeEventListener('closeDropdowns', handleClose)
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const handleSave = () => {
    console.log('Langue:', selectedLang, 'Devise:', selectedCurrency)
    setOpen(false)
  }

  const toggleOpen = () => {
    window.dispatchEvent(new CustomEvent('closeDropdowns'))
    setOpen(prev => !prev)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button className="gh-lang" onClick={toggleOpen} style={{
        display: 'flex', alignItems: 'center', gap: '7px', background: 'none', border: 'none',
        cursor: 'pointer', padding: '0 14px', fontSize: 'clamp(13.5px, 1.15vw, 16.5px)',
        color: open ? ORANGE : INK, flexShrink: 0, transition: 'color 0.15s',
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 'clamp(17px, 1.5vw, 21px)', height: 'clamp(17px, 1.5vw, 21px)', flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
        </svg>
        <span className="gh-lang-text">{selectedLang} · {selectedCurrency}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 'clamp(11px, 1vw, 14px)', height: 'clamp(11px, 1vw, 14px)', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div ref={panelRef} className="gh-dd" style={{
          position: 'absolute', top: 'calc(100% + 14px)', right: 0, zIndex: 2400,
        }}>
          <div style={{
            position: 'absolute', top: -7, right: 18,
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid #fff',
            filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,.05))',
          }} />
          <div style={{
            width: 360, background: '#fff',
            border: `1px solid ${LINE}`, borderRadius: 16,
            boxShadow: '0 12px 40px rgba(0,0,0,.14)',
            padding: '20px 24px',
          }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: MUTE, marginBottom: 8 }}>Langue</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.label)}
                    style={{
                      flex: 1, padding: '10px 0', border: `1px solid ${selectedLang === lang.label ? ORANGE : LINE}`,
                      borderRadius: 8, background: selectedLang === lang.label ? SOFT : '#fff',
                      cursor: 'pointer', fontSize: '13px', fontWeight: selectedLang === lang.label ? 600 : 400,
                      color: selectedLang === lang.label ? ORANGE : INK,
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: MUTE, marginBottom: 8 }}>Devise</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {currencies.map(curr => (
                  <button
                    key={curr.code}
                    onClick={() => setSelectedCurrency(curr.label)}
                    style={{
                      flex: 1, padding: '10px 0', border: `1px solid ${selectedCurrency === curr.label ? ORANGE : LINE}`,
                      borderRadius: 8, background: selectedCurrency === curr.label ? SOFT : '#fff',
                      cursor: 'pointer', fontSize: '13px', fontWeight: selectedCurrency === curr.label ? 600 : 400,
                      color: selectedCurrency === curr.label ? ORANGE : INK,
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                  >
                    {curr.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              style={{
                width: '100%', padding: '12px', background: ORANGE, color: '#fff',
                border: 'none', borderRadius: 30, fontSize: '15px', fontWeight: 700,
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#d9531e' }}
              onMouseLeave={e => { e.currentTarget.style.background = ORANGE }}
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}