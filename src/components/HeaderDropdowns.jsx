// HeaderDropdowns.jsx — GROSHOP.tn
// Panneaux au survol des icônes du header (messages, commandes, panier).

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { messaging, orders } from '../lib/api'

const fetchMessages = () => messaging.conversations()
const fetchOrders   = () => orders.list()

const ORANGE = '#FF4500'
const INK    = '#0F1419'
const MUTE   = '#6B7785'
const FAINT  = '#9AA3AE'
const LINE   = '#E8EAED'

/* Rend une valeur inconnue en texte : l'API renvoie parfois des objets
   (last_message = { id, content, sender_id, ... }) — React ne sait pas les afficher. */
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

/* ── Suivi du curseur (partagé avec Header.jsx) ───────────────── */
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

  const handleEnter = () => { clearTimeout(timerRef.current); setOpen(true); setHov(true) }
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
          paddingTop: '14px',            // pont invisible : évite le trou entre icône et panneau
          zIndex: 2400,
        }}>
          {/* flèche */}
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

/* ── Briques communes ─────────────────────────────────────────── */
function PanelTitle({ children }) {
  return (
    <div style={{ padding: '16px 18px 8px', fontSize: '15px', fontWeight: 700, color: INK }}>
      {children}
    </div>
  )
}

function PanelFooter({ to, label }) {
  return (
    <div style={{ padding: '10px 14px 14px' }}>
      <Link to={to} style={{
        display: 'block', textAlign: 'center', padding: '11px',
        background: ORANGE, color: '#fff', borderRadius: '30px',
        fontSize: '13.5px', fontWeight: 700, textDecoration: 'none',
      }}>
        {label}
      </Link>
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

/* Charge la donnée au premier survol seulement */
function useLazyData(fetcher, enabled) {
  const [data, setData]       = useState(null)
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
  }, [enabled])   // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading }
}

/* ═══════════════════════════════════════════════════════════════════
   MESSAGES
   ═══════════════════════════════════════════════════════════════════ */
export function MessagesDropdown({ badge = 0 }) {
  const [armed, setArmed] = useState(false)
  const { data, loading } = useLazyData(fetchMessages, armed)

  return (
    <div onMouseEnter={() => setArmed(true)} style={{ display: 'flex' }}>
      <IconDropdown to="/messages" title="Messages" badge={badge} width={400} icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      }>
        <PanelTitle>Messages</PanelTitle>

        {loading && <PanelSkeleton rows={3} />}
        {!loading && data?.length === 0 && <PanelEmpty>Aucun message</PanelEmpty>}

        {!loading && data?.slice(0, 4).map(m => {
          const name    = asText(m.name || m.sender_name || m.supplier || m.other_party)
          const company = asText(m.company || m.supplier_name || m.company_name)
          const last    = asText(m.last_message || m.preview)
          const date    = fmtDate(m.last_message?.created_at || m.updated_at || m.created_at)
          return (
            <Row key={m.id} to={`/messages/${m.id}`}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: '#F4F5F7', flexShrink: 0 }}>
                {m.avatar_url
                  ? <img src={m.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: MUTE }}>
                      {(name || '?')[0]}
                    </div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: INK, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name || 'Conversation'}
                  </span>
                  <span style={{ fontSize: '11px', color: FAINT, flexShrink: 0 }}>{date}</span>
                </div>
                {company && (
                  <div style={{ fontSize: '12px', color: MUTE, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {company}
                  </div>
                )}
                <div style={{ fontSize: '12.5px', color: '#3D4853', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {last}
                </div>
              </div>
              {m.unread_count > 0 && (
                <span style={{
                  alignSelf: 'center', minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9,
                  background: ORANGE, color: '#fff', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {m.unread_count}
                </span>
              )}
            </Row>
          )
        })}

        {!loading && data?.length > 0 && <PanelFooter to="/messages" label="En savoir plus" />}
      </IconDropdown>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   COMMANDES
   ═══════════════════════════════════════════════════════════════════ */
export function OrdersDropdown() {
  const [armed, setArmed] = useState(false)
  const { data, loading } = useLazyData(fetchOrders, armed)

  return (
    <div onMouseEnter={() => setArmed(true)} style={{ display: 'flex' }}>
      <IconDropdown to="/dashboard/commandes" title="Mes commandes" width={380} icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1"/>
          <line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="13" y2="15"/>
        </svg>
      }>
        <PanelTitle>Mes commandes</PanelTitle>

        {loading && <PanelSkeleton rows={3} />}
        {!loading && data?.length === 0 && <PanelEmpty>Aucune commande</PanelEmpty>}

        {!loading && data?.slice(0, 4).map(o => (
          <Row key={o.id} to={`/dashboard/commandes/${o.id}`}>
            <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#F4F5F7', flexShrink: 0 }}>
              {o.image_url
                ? <img src={o.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: INK, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {asText(o.reference) || `Commande #${o.id}`}
                </span>
                <span style={{ fontSize: '11px', color: FAINT, flexShrink: 0 }}>{fmtDate(o.created_at)}</span>
              </div>
              <div style={{ fontSize: '12px', color: MUTE, marginTop: 3 }}>
                {o.items_count || 0} article{(o.items_count || 0) > 1 ? 's' : ''} · {fmtPrice(o.total_tnd)} TND
              </div>
              {(o.status_display || o.status) && (
                <span style={{
                  display: 'inline-block', marginTop: 5,
                  fontSize: 10.5, fontWeight: 600, color: MUTE,
                  background: '#F4F5F7', padding: '2px 8px', borderRadius: 20,
                }}>
                  {asText(o.status_display || o.status)}
                </span>
              )}
            </div>
          </Row>
        ))}

        {!loading && data?.length > 0 && <PanelFooter to="/dashboard/commandes" label="Voir toutes mes commandes" />}
      </IconDropdown>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   PANIER — pas de fetch, on lit le CartContext
   ═══════════════════════════════════════════════════════════════════ */
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
              {p.image_url
                ? <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '12.5px', fontWeight: 500, color: INK, lineHeight: 1.35,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {asText(p.name)}
              </div>
              <div style={{ fontSize: '12px', color: MUTE, marginTop: 4 }}>
                {item.quantity} × <span style={{ color: ORANGE, fontWeight: 700 }}>{fmtPrice(item.unit_price_tnd)} TND</span>
              </div>
            </div>
          </Row>
        )
      })}

      {items.length > 4 && (
        <div style={{ padding: '4px 18px 0', fontSize: '12px', color: FAINT }}>
          +{items.length - 4} autre{items.length - 4 > 1 ? 's' : ''} article{items.length - 4 > 1 ? 's' : ''}
        </div>
      )}

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