// pages/SupplierMessagesPage.jsx — GROSHOP.tn
// Messagerie fournisseur — RÉELLE (branchée au backend via useMessaging).
// Nom réel du client · double coche « vu » · polling intelligent.

import { useState, useMemo, useRef, useEffect } from 'react'
import * as Icons from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useMessaging } from '../hooks/useMessaging'
import { useIsMobile } from '../hooks/useIsMobile'
import MobileSupplierMessages from '../components/supplier/MobileSupplierMessages'

const ORANGE = '#FF5E00'
const ORANGE_SOFT = '#FFF1EA'
const ORANGE_TINT = '#FFD9C7'
const SEEN = '#34B7F1'

if (typeof document !== 'undefined' && !document.getElementById('gs-messages-styles-v2')) {
  document.querySelectorAll('style[id^="gs-messages-styles"]').forEach(el => el.remove())
  const s = document.createElement('style')
  s.id = 'gs-messages-styles-v2'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-messages {
      font-family: 'DM Sans', -apple-system, sans-serif; color: #0F1419;
      height: 100%; min-height: 0; display: grid;
      grid-template-columns: 320px minmax(0, 1fr); background: #fff; overflow: hidden;
    }
    .gs-input-clean { border: none; outline: none; background: transparent; font-family: inherit; }
    .gs-icon-btn {
      background: transparent; border: none; cursor: pointer;
      width: 34px; height: 34px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      color: #6B7280; transition: all 0.15s;
    }
    .gs-icon-btn:hover { background: #F4F4F2; color: #0F1419; }
    .gs-conv { padding: 11px 16px; display: flex; gap: 11px; align-items: center; cursor: pointer; transition: background 0.15s; position: relative; }
    .gs-conv:hover { background: #FAFAF7; }
    .gs-conv--active { background: ${ORANGE_SOFT}; }
    .gs-conv--active::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: ${ORANGE}; }
    .gs-tab { padding: 6px 12px; border: none; background: transparent; color: #9AA3AE; font-weight: 500; font-size: 12px; cursor: pointer; border-radius: 999px; font-family: inherit; transition: all 0.15s; }
    .gs-tab:hover { color: #0F1419; }
    .gs-tab--active { background: ${ORANGE_SOFT}; color: ${ORANGE}; font-weight: 600; }
    @keyframes gs-msg-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .gs-msg { animation: gs-msg-in 0.25s ease; }
    @keyframes gs-spin2 { to { transform: rotate(360deg) } }
    .gs-scroll::-webkit-scrollbar { width: 6px; }
    .gs-scroll::-webkit-scrollbar-track { background: transparent; }
    .gs-scroll::-webkit-scrollbar-thumb { background: #EAE7DF; border-radius: 3px; }
    .gs-scroll::-webkit-scrollbar-thumb:hover { background: #DBD5C8; }
  `
  document.head.appendChild(s)
}

const fmtTime = (d) => {
  if (!d) return ''
  const date = new Date(d); if (isNaN(date)) return ''
  const now = new Date()
  if (date.toDateString() === now.toDateString())
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if ((now - date) / 86400000 < 7) return date.toLocaleDateString('fr-FR', { weekday: 'short' })
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

const initials = (name) => (name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')

// ═══════════════════════════════════════════════════════════════════
function DesktopSupplierMessagesPage() {
  const { user } = useAuth()
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [draft, setDraft]   = useState('')

  const {
    conversations, detail, messages, loadingDetail,
    sending, sendError, send,
  } = useMessaging(selectedId)

  const list = conversations || []

  const filtered = useMemo(() => list.filter(c => {
    if (filter === 'unread' && !(c.unread_count > 0)) return false
    if (search) {
      const q = search.toLowerCase()
      const hay = `${c.buyer?.full_name || c.buyer_name || ''} ${c.buyer?.city || ''} ${c.product_name || ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  }), [list, search, filter])

  // sélectionne la 1re conversation par défaut
  useEffect(() => {
    if (!selectedId && list.length) setSelectedId(list[0].id)
  }, [list, selectedId])

  const onSend = async () => {
    const text = draft.trim(); if (!text) return
    const res = await send(text)
    if (res?.ok) setDraft('')
  }

  return (
    <div style={{ height: '100%', minHeight: 0, display: 'flex' }}>
      <div className="gs-messages" style={{ flex: 1, minWidth: 0 }}>
        <ConversationList
          conversations={filtered}
          loading={conversations === null}
          selectedId={selectedId}
          onSelect={setSelectedId}
          search={search} setSearch={setSearch}
          filter={filter} setFilter={setFilter}
        />
        <ChatArea
          detail={detail}
          messages={messages}
          loading={loadingDetail}
          me={user?.id}
          draft={draft} setDraft={setDraft}
          onSend={onSend} sending={sending} sendError={sendError}
          hasSelection={!!selectedId}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function ConversationList({ conversations, loading, selectedId, onSelect, search, setSearch, filter, setFilter }) {
  const filters = [
    { key: 'all',    label: 'Tous' },
    { key: 'unread', label: 'Non lus' },
  ]

  return (
    <div style={{ borderRight: '1px solid #EAE7DF', display: 'flex', flexDirection: 'column', minHeight: 0, background: '#fff' }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #F0EDE5' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#9AA3AE', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Conversations</span>
        </div>

        <div style={{ background: '#F4F4F2', borderRadius: 10, padding: '8px 13px', display: 'flex', alignItems: 'center', gap: 7, marginTop: 12 }}>
          <Icons.Search size={14} color="#9AA3AE" strokeWidth={2} />
          <input type="text" placeholder="Rechercher (client, ville, produit)..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="gs-input-clean" style={{ fontSize: 12.5, width: '100%', color: '#0F1419' }} />
        </div>

        <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`gs-tab ${f.key === filter ? 'gs-tab--active' : ''}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="gs-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 26, height: 26, border: `3px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gs-spin2 .8s linear infinite' }} />
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9AA3AE', fontSize: 13 }}>Aucune conversation</div>
        ) : (
          conversations.map(c => <ConvItem key={c.id} conv={c} active={c.id === selectedId} onSelect={onSelect} />)
        )}
      </div>
    </div>
  )
}

function ConvItem({ conv, active, onSelect }) {
  const name    = conv.buyer?.full_name || conv.buyer_name || 'Client'
  const online  = conv.buyer?.is_online
  const preview = conv.last_message?.content || 'Démarrer la conversation'
  const unread  = conv.unread_count > 0
  return (
    <div onClick={() => onSelect(conv.id)} className={`gs-conv ${active ? 'gs-conv--active' : ''}`}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <ClientAvatar buyer={conv.buyer} name={name} size={44} />
        {online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 13.5, fontWeight: unread ? 700 : 600, color: '#0F1419', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </div>
          <span style={{ fontSize: 10.5, color: unread ? ORANGE : '#9AA3AE', fontWeight: unread ? 700 : 500, flexShrink: 0 }}>
            {fmtTime(conv.last_msg_at || conv.last_message?.created_at)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', marginTop: 3 }}>
          <div style={{ fontSize: 11.5, color: unread ? '#0F1419' : '#9AA3AE', fontWeight: unread ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {conv.product_name ? `${conv.product_name} · ` : ''}{preview}
          </div>
          {unread && (
            <div style={{ background: ORANGE, color: '#fff', minWidth: 19, height: 19, borderRadius: 999, fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', flexShrink: 0 }}>
              {conv.unread_count}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function ChatArea({ detail, messages, loading, me, draft, setDraft, onSend, sending, sendError, hasSelection }) {
  const scrollRef = useRef(null)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages.length, detail?.id])

  if (!hasSelection) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: '#fff', alignItems: 'center', justifyContent: 'center', color: '#9AA3AE' }}>
        <Icons.MessagesSquare size={46} strokeWidth={1.4} style={{ opacity: 0.5 }} />
        <div style={{ fontSize: 14, marginTop: 10 }}>Sélectionnez une conversation</div>
      </div>
    )
  }

  const name   = detail?.buyer?.full_name || detail?.buyer_name || 'Client'
  const online = detail?.buyer?.is_online
  const city   = detail?.buyer?.city

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderBottom: '1px solid #F0EDE5' }}>
        <div style={{ position: 'relative' }}>
          <ClientAvatar buyer={detail?.buyer} name={name} size={40} />
          {online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0F1419' }}>{name}</div>
          <div style={{ fontSize: 11.5, color: online ? '#059669' : '#9AA3AE', marginTop: 1, fontWeight: 500 }}>
            {online ? 'En ligne' : 'Hors ligne'}{city ? ` · ${city}` : ''}
          </div>
        </div>
        {detail?.product_name && (
          <span className="gs-icon-btn" title={detail.product_name} style={{ width: 'auto', padding: '0 12px', borderRadius: 999, border: '1px solid #EAE7DF', gap: 5, fontSize: 11.5, color: '#0F1419' }}>
            <Icons.Package size={12} strokeWidth={2.2} /> {detail.product_name}
          </span>
        )}
      </div>

      <div ref={scrollRef} className="gs-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10, background: '#fff' }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 26, height: 26, border: `3px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gs-spin2 .8s linear infinite' }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA3AE', fontSize: 13 }}>
            Aucun message. Envoyez le premier !
          </div>
        ) : (
          messages.map(m => (
            <MessageBubble key={m.id} msg={m} mine={String(m.sender_id) === String(me)} buyer={detail?.buyer} name={name} />
          ))
        )}
      </div>

      {sendError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 22px', background: '#FEF2F2', color: '#B91C1C', fontSize: 12.5 }}>
          <Icons.AlertCircle size={15} /> {sendError}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderTop: '1px solid #F0EDE5', background: '#fff' }}>
        <div style={{ flex: 1, background: '#F4F4F2', borderRadius: 999, padding: '10px 18px' }}>
          <input type="text" value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onSend() } }}
            placeholder="Écrivez votre message..." className="gs-input-clean"
            style={{ fontSize: 13, width: '100%', color: '#0F1419' }} />
        </div>
        <button onClick={onSend} disabled={!draft.trim() || sending}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: draft.trim() && !sending ? ORANGE : '#EAE7DF',
            color: '#fff', border: 'none',
            cursor: draft.trim() && !sending ? 'pointer' : 'not-allowed',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
            boxShadow: draft.trim() && !sending ? `0 4px 14px -3px rgba(255,94,0,0.5)` : 'none',
          }}>
          <Icons.Send size={15} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function MessageBubble({ msg, mine, buyer, name }) {
  if (mine) {
    return (
      <div className="gs-msg" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '68%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ background: ORANGE, color: '#fff', padding: '10px 14px', borderRadius: 16, borderBottomRightRadius: 4, fontSize: 13, lineHeight: 1.5 }}>
            {msg.content}
            {msg.attachment_url && (
              <a href={msg.attachment_url} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: 6, fontSize: 11.5, color: '#fff', textDecoration: 'underline' }}>Pièce jointe</a>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9.5, color: '#9AA3AE', marginTop: 3, paddingRight: 2 }}>
            {fmtTime(msg.created_at)}
            {msg.is_read
              ? <Icons.CheckCheck size={14} color={SEEN} strokeWidth={2.4} />
              : <Icons.Check size={13} color="#9AA3AE" strokeWidth={2.4} />}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="gs-msg" style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
      <ClientAvatar buyer={buyer} name={name} size={28} />
      <div style={{ maxWidth: '68%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ background: '#F7F7F5', color: '#0F1419', border: '1px solid #EAE7DF', padding: '10px 14px', borderRadius: 16, borderBottomLeftRadius: 4, fontSize: 13, lineHeight: 1.5 }}>
          {msg.content}
          {msg.attachment_url && (
            <a href={msg.attachment_url} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: 6, fontSize: 11.5, color: ORANGE, textDecoration: 'underline' }}>Pièce jointe</a>
          )}
        </div>
        <div style={{ fontSize: 9.5, color: '#9AA3AE', marginTop: 3, paddingLeft: 4 }}>{fmtTime(msg.created_at)}</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// AVATAR CLIENT — avatar réel si dispo, sinon initiales (nom réel : B2B)
function ClientAvatar({ buyer, name, size = 40 }) {
  if (buyer?.avatar_url) {
    return <img src={buyer.avatar_url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block', background: '#EAE7DF' }} />
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: '#fff',
      border: `1.5px solid ${ORANGE_TINT}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: ORANGE, fontSize: size * 0.34, fontWeight: 700, flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  )
}

export default function SupplierMessagesPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileSupplierMessages /> : <DesktopSupplierMessagesPage />
}