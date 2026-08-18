// src/components/supplier/MobileSupplierMessages.jsx — GROSHOP.tn
// Messagerie fournisseur (mobile) — RÉELLE, via useMessaging.
// Nom réel du client · double coche « vu » · polling intelligent.
// Liste → conversation plein écran → retour (géré aussi par le bouton Android).

import { useState, useMemo, useRef, useEffect } from 'react'
import * as Icons from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useMessaging } from '../../hooks/useMessaging'
import { AccessBanner } from './AccessControls'   // ⭐ NOUVEAU

const ORANGE      = '#ff5e20'
const ORANGE_TINT = 'rgba(255, 94, 32, .10)'
const ORANGE_RING = 'rgba(255, 94, 32, .30)'
const SEEN        = '#34B7F1'

const INK='#0F1419', MUTE='#6B7280', FAINT='#9AA3AE'
const FONT='"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const fmtTime = (d) => {
  if (!d) return ''
  const x = new Date(d); if (isNaN(x)) return ''
  const now = new Date()
  if (x.toDateString() === now.toDateString()) return x.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if ((now - x) / 86400000 < 7) return x.toLocaleDateString('fr-FR', { weekday: 'short' })
  return x.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}
const initials = (name) => (name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')

// ═══════════════════════════════════════════════════════════════════
export default function MobileSupplierMessages() {
  const { user } = useAuth()
  const [openId, setOpenId] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const {
    conversations, detail, messages, loadingDetail,
    sending, sendError, send,
  } = useMessaging(openId)

  const list = conversations || []

  useEffect(() => {
    if (openId === null) return
    const onPop = () => setOpenId(null)
    window.history.pushState({ chat: openId }, '')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [openId])

  const closeChat = () => {
    if (window.history.state?.chat) window.history.back()
    else setOpenId(null)
  }

  const filtered = useMemo(() => list.filter((c) => {
    if (filter === 'unread' && !(c.unread_count > 0)) return false
    if (search) {
      const q = search.toLowerCase()
      const hay = `${c.buyer?.full_name || c.buyer_name || ''} ${c.buyer?.city || ''} ${c.product_name || ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  }), [list, search, filter])

  if (openId) {
    return (
      <ChatView
        detail={detail} messages={messages} loading={loadingDetail}
        me={user?.id} sending={sending} sendError={sendError} onSend={send}
        onBack={closeChat}
      />
    )
  }

  const filters = [
    { key: 'all',    label: 'Tous' },
    { key: 'unread', label: 'Non lus' },
  ]
  const unreadTotal = list.reduce((s, c) => s + (Number(c.unread_count) || 0), 0)

  return (
    <div style={{ fontFamily: FONT }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, letterSpacing: '-0.03em', margin: '0 0 4px' }}>Messages</h1>
      <p style={{ margin: '0 0 16px', fontSize: 12.5, color: MUTE }}>
        {unreadTotal > 0 ? `${unreadTotal} message${unreadTotal > 1 ? 's' : ''} non lu${unreadTotal > 1 ? 's' : ''}.` : 'Tout est lu.'}
      </p>

      <div style={{ background: '#fff', border: '1px solid #EFECE4', borderRadius: 20, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icons.Search size={14} color={FAINT} strokeWidth={2} />
        <input type="text" placeholder="Client, ville, produit…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, width: '100%', color: INK }} />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', cursor: 'pointer' }}><Icons.X size={14} color={FAINT} /></button>}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {filters.map((f) => {
          const on = f.key === filter
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: on ? ORANGE_TINT : '#fff', color: on ? ORANGE : FAINT, fontWeight: on ? 700 : 500, fontSize: 11.5, padding: '7px 14px', borderRadius: 20, boxShadow: on ? 'none' : 'inset 0 0 0 1px #EFECE4' }}>
              {f.label}
            </button>
          )
        })}
      </div>

      <div style={{ background: '#fff', border: '1px solid #EFECE4', borderRadius: 16, overflow: 'hidden' }}>
        {conversations === null ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ width: 26, height: 26, margin: '0 auto', border: `3px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gs-spin2 .8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: FAINT, fontSize: 13 }}>Aucune conversation</div>
        ) : filtered.map((c, i) => {
          const name    = c.buyer?.full_name || c.buyer_name || 'Client'
          const online  = c.buyer?.is_online
          const unread  = c.unread_count > 0
          const preview = c.last_message?.content || 'Démarrer la conversation'
          return (
            <button key={c.id} onClick={() => setOpenId(c.id)}
              style={{ width: '100%', display: 'flex', gap: 11, alignItems: 'center', padding: '12px 13px', background: unread ? ORANGE_TINT : 'none', border: 'none', borderTop: i > 0 ? '1px solid #F5F3EE' : 'none', borderLeft: unread ? `3px solid ${ORANGE}` : '3px solid transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <ClientAvatar buyer={c.buyer} name={name} size={42} />
                {online && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: unread ? 700 : 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                  <span style={{ fontSize: 10, color: unread ? ORANGE : FAINT, fontWeight: unread ? 700 : 500, flexShrink: 0 }}>{fmtTime(c.last_msg_at || c.last_message?.created_at)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 11.5, color: unread ? INK : FAINT, fontWeight: unread ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.product_name ? `${c.product_name} · ` : ''}{preview}
                  </span>
                  {unread && <span style={{ background: ORANGE, color: '#fff', minWidth: 18, height: 18, borderRadius: 999, fontSize: 9.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', flexShrink: 0 }}>{c.unread_count}</span>}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function ChatView({ detail, messages, loading, me, sending, sendError, onSend, onBack }) {
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages.length, detail?.id])

  const name   = detail?.buyer?.full_name || detail?.buyer_name || 'Client'
  const online = detail?.buyer?.is_online
  const city   = detail?.buyer?.city

  const submit = async () => {
    const text = input.trim(); if (!text) return
    const res = await onSend(text)
    if (res?.ok) setInput('')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1500, background: '#fff', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px', borderBottom: '1px solid #F0EDE5', flexShrink: 0 }}>
        <button onClick={onBack} aria-label="Retour" style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', color: INK, flexShrink: 0 }}>
          <Icons.ChevronLeft size={22} strokeWidth={2.2} />
        </button>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <ClientAvatar buyer={detail?.buyer} name={name} size={36} />
          {online && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
          <div style={{ fontSize: 10.5, color: online ? '#059669' : FAINT, marginTop: 1, fontWeight: 500 }}>
            {online ? 'En ligne' : 'Hors ligne'}{city ? ` · ${city}` : ''}
          </div>
        </div>
      </div>

      {/* ⭐ Bandeau d'accès B2B — compact pour ne pas manger l'écran mobile */}
      {detail?.buyer?.id && (
        <AccessBanner
          key={`${detail.id}-${detail.buyer.id}`}
          userId={detail.buyer.id}
          productId={detail.product_id || detail.product?.id || null}
          buyerName={name}
          compact
        />
      )}

      {/* Bandeau produit */}
      {detail?.product_name && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', background: ORANGE_TINT, flexShrink: 0, fontSize: 11.5, color: ORANGE, fontWeight: 600 }}>
          <Icons.Package size={13} strokeWidth={2.2} /> {detail.product_name}
        </div>
      )}

      {/* Fil */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 26, height: 26, border: `3px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gs-spin2 .8s linear infinite' }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: FAINT, fontSize: 13 }}>
            Aucun message. Envoyez le premier !
          </div>
        ) : messages.map((m) => (
          <Bubble key={m.id} msg={m} mine={String(m.sender_id) === String(me)} buyer={detail?.buyer} name={name} />
        ))}
      </div>

      {sendError && (
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#FEF2F2', color: '#B91C1C', fontSize: 12 }}>
          <Icons.AlertCircle size={14} /> {sendError}
        </div>
      )}

      {/* Saisie */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 12px calc(10px + env(safe-area-inset-bottom))', borderTop: '1px solid #F0EDE5', flexShrink: 0, background: '#fff' }}>
        <div style={{ flex: 1, background: '#F4F4F2', borderRadius: 999, padding: '10px 16px' }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }}
            placeholder="Écrivez votre message…"
            style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13.5, width: '100%', color: INK }} />
        </div>
        <button onClick={submit} disabled={!input.trim() || sending} aria-label="Envoyer"
          style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: input.trim() && !sending ? ORANGE : '#EAE7DF', color: '#fff', border: 'none', cursor: input.trim() && !sending ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}>
          <Icons.Send size={16} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}

function Bubble({ msg, mine, buyer, name }) {
  if (mine) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ background: ORANGE, color: '#fff', padding: '10px 13px', borderRadius: 15, borderBottomRightRadius: 4, fontSize: 13.5, lineHeight: 1.5 }}>
            {msg.content}
            {msg.attachment_url && (
              <a href={msg.attachment_url} target="_blank" rel="noreferrer"
                style={{ display: 'block', marginTop: 6, fontSize: 11.5, color: '#fff', textDecoration: 'underline' }}>
                Pièce jointe
              </a>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9.5, color: FAINT, marginTop: 3, paddingRight: 2 }}>
            {fmtTime(msg.created_at)}
            {msg.is_read
              ? <Icons.CheckCheck size={14} color={SEEN} strokeWidth={2.4} />
              : <Icons.Check size={13} color={FAINT} strokeWidth={2.4} />}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end' }}>
      <ClientAvatar buyer={buyer} name={name} size={26} />
      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ background: '#F7F7F5', color: INK, border: '1px solid #EAE7DF', padding: '10px 13px', borderRadius: 15, borderBottomLeftRadius: 4, fontSize: 13.5, lineHeight: 1.5 }}>
          {msg.content}
          {msg.attachment_url && (
            <a href={msg.attachment_url} target="_blank" rel="noreferrer"
              style={{ display: 'block', marginTop: 6, fontSize: 11.5, color: ORANGE, textDecoration: 'underline' }}>
              Pièce jointe
            </a>
          )}
        </div>
        <div style={{ fontSize: 9.5, color: FAINT, marginTop: 3, paddingLeft: 4 }}>{fmtTime(msg.created_at)}</div>
      </div>
    </div>
  )
}

function ClientAvatar({ buyer, name, size = 40 }) {
  if (buyer?.avatar_url) {
    return <img src={buyer.avatar_url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block', background: '#EAE7DF' }} />
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#fff', border: `1.5px solid ${ORANGE_RING}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORANGE, fontSize: size * 0.34, fontWeight: 700, flexShrink: 0 }}>
      {initials(name)}
    </div>
  )
}

if (typeof document !== 'undefined' && !document.getElementById('gs-spin2-style')) {
  const s = document.createElement('style')
  s.id = 'gs-spin2-style'
  s.textContent = `@keyframes gs-spin2 { to { transform: rotate(360deg) } }`
  document.head.appendChild(s)
}