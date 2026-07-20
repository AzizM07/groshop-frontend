// src/components/MobileMessages.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Send, Store, ArrowLeft } from 'lucide-react'
import { messaging } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const ORANGE='#FF4500', INK='#0F1419', MUTE='#6B7785', FAINT='#9AA3AE', LINE='#E8EAED', SOFT='#FFF0E8', BG='#F4F5F7'
const FONT='-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const NAV_H = 'calc(56px + env(safe-area-inset-bottom))'

const fmtDate = (d) => { if (!d) return ''; const x = new Date(d); return isNaN(x) ? '' : x.toLocaleDateString('fr-FR') }
const fmtTime = (d) => { if (!d) return ''; const x = new Date(d); if (isNaN(x)) return ''; const s = x.toDateString()===new Date().toDateString(); return s ? x.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : x.toLocaleDateString('fr-FR') }

export default function MobileMessages() {
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [convos, setConvos] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loadingDetail, setLD] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const scrollRef = useRef(null)
  const activeId = routeId || null

  const loadList = useCallback(() => {
    messaging.conversations().then(d => setConvos(Array.isArray(d) ? d : (d?.results || []))).catch(() => setConvos([]))
  }, [])
  useEffect(() => { loadList() }, [loadList])

  useEffect(() => {
    if (!activeId) { setDetail(null); return }
    setLD(true)
    messaging.conversation(activeId).then(d => { setDetail(d); setLD(false) }).catch(() => { setDetail(null); setLD(false) })
  }, [activeId])

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [detail?.messages?.length])

  const send = async () => {
    const text = draft.trim(); if (!text || sending) return
    setSending(true)
    try {
      const msg = await messaging.sendMessage(activeId, text)
      if (!msg?.error) { setDetail(d => d ? { ...d, messages: [...(d.messages || []), msg] } : d); setDraft(''); loadList() }
    } catch { /* ignore */ }
    setSending(false)
  }

  const filtered = (convos || []).filter(c => {
    if (filter === 'unread' && !(c.unread_count > 0)) return false
    if (!q) return true
    const hay = `${c.supplier?.name || c.supplier_name || ''} ${c.last_message?.content || ''}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })
  const totalUnread = (convos || []).reduce((n, c) => n + (Number(c.unread_count) || 0), 0)

  // ══ FIL (une conversation ouverte) ══
  if (activeId) {
    const name = detail?.supplier?.name || detail?.supplier_name || '…'
    return (
      <div style={{ fontFamily: FONT, color: INK, height: `calc(100dvh - ${NAV_H})`, display: 'flex', flexDirection: 'column', background: BG }}>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff', borderBottom: `1px solid ${LINE}` }}>
          <button onClick={() => navigate('/dashboard/messages', { replace: true })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK, display: 'flex', padding: 4 }}><ArrowLeft size={22} /></button>
          <Avatar name={name} logo={detail?.supplier?.logo_url} online={detail?.supplier?.is_online} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div style={{ fontSize: 12, color: detail?.supplier?.is_online ? '#0E9F6E' : FAINT }}>{detail?.supplier?.is_online ? 'En ligne' : 'Hors ligne'}</div>
          </div>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, minHeight: 0 }}>
          {loadingDetail && <Spinner />}
          {!loadingDetail && (detail?.messages || []).map(m => {
            const mine = String(m.sender_id) === String(user?.id)
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                <div style={{ maxWidth: '76%' }}>
                  <div style={{ padding: '10px 13px', borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: mine ? ORANGE : '#fff', color: mine ? '#fff' : INK, border: mine ? 'none' : `1px solid ${LINE}`, fontSize: 14, lineHeight: 1.45, wordBreak: 'break-word' }}>{m.content}</div>
                  <div style={{ fontSize: 10.5, color: FAINT, marginTop: 3, textAlign: mine ? 'right' : 'left' }}>{fmtTime(m.created_at)}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 12px', background: '#fff', borderTop: `1px solid ${LINE}` }}>
          <textarea value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder="Écrivez votre message…" rows={1}
            style={{ flex: 1, resize: 'none', maxHeight: 110, border: `1px solid ${LINE}`, borderRadius: 20, padding: '10px 14px', fontSize: 14, fontFamily: FONT, outline: 'none', color: INK, lineHeight: 1.4 }} />
          <button onClick={send} disabled={!draft.trim() || sending} style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', flexShrink: 0, background: draft.trim() && !sending ? ORANGE : '#DDD', color: '#fff', cursor: draft.trim() && !sending ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={18} /></button>
        </div>
      </div>
    )
  }

  // ══ LISTE ══
  return (
    <div style={{ fontFamily: FONT, color: INK, background: '#fff', minHeight: `calc(100dvh - ${NAV_H})` }}>
      <div style={{ padding: '14px 16px 6px' }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Messagerie</div>
      </div>
      <div style={{ padding: '0 16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: BG, borderRadius: 30, padding: '10px 14px' }}>
          <Search size={17} color={FAINT} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher des messages ou des fournisseurs" style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 14, color: INK }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 10px' }}>
        <Tab active={filter === 'all'} onClick={() => setFilter('all')}>Toutes</Tab>
        <Tab active={filter === 'unread'} onClick={() => setFilter('unread')}>Non lus {totalUnread > 0 && <B>{totalUnread}</B>}</Tab>
      </div>

      <div style={{ paddingBottom: NAV_H }}>
        {convos === null && <Spinner />}
        {convos !== null && filtered.length === 0 && <Empty icon="💬" text={q ? 'Aucun résultat' : 'Aucune conversation'} />}
        {filtered.map(c => {
          const name = c.supplier?.name || c.supplier_name || 'Fournisseur'
          const company = c.supplier?.company || c.supplier_company || ''
          const preview = c.last_message?.content || 'Démarrer la conversation'
          const unread = c.unread_count > 0
          return (
            <div key={c.id} onClick={() => navigate(`/dashboard/messages/${c.id}`)} style={{ display: 'flex', gap: 12, padding: '14px 16px', cursor: 'pointer', borderBottom: `1px solid #F4F4F4` }}>
              <Avatar name={name} logo={c.supplier?.logo_url || c.supplier_logo} online={c.supplier?.is_online} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                  <span style={{ fontSize: 11.5, color: FAINT, flexShrink: 0 }}>{fmtDate(c.last_msg_at || c.last_message?.created_at)}</span>
                </div>
                {company && <div style={{ fontSize: 12, color: FAINT, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 13, color: unread ? INK : MUTE, fontWeight: unread ? 600 : 400, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview}</span>
                  {unread && <B>{c.unread_count}</B>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Tab({ active, onClick, children }) {
  return <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 30, cursor: 'pointer', fontFamily: FONT, border: `1px solid ${active ? INK : LINE}`, background: '#fff', fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? INK : MUTE }}>{children}</button>
}
function B({ children }) {
  return <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, background: ORANGE, color: '#fff', fontSize: 10.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{children}</span>
}
function Avatar({ name, logo, online }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {logo ? <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Store size={22} color={ORANGE} />}
      </div>
      {online && <span style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: '#0E9F6E', border: '2px solid #fff' }} />}
    </div>
  )
}
function Spinner() { return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div style={{ width: 28, height: 28, border: `4px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gd-spin .8s linear infinite' }} /></div> }
function Empty({ icon, text }) { return <div style={{ textAlign: 'center', padding: '50px 20px', color: FAINT }}><div style={{ fontSize: 40, marginBottom: 10 }}>{icon}</div><div style={{ fontSize: 13.5 }}>{text}</div></div> }