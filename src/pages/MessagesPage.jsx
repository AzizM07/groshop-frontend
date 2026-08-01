// pages/MessagesPage.jsx — GROSHOP.tn
// Messagerie acheteur : liste + fil, branchée au hook useMessaging
// (polling intelligent + accusés de lecture double coche).

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Send, Store, ArrowLeft, Package, AlertCircle, Check, CheckCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { useMessaging } from '../hooks/useMessaging'
import MobileMessages from '../components/MobileMessages'

const ORANGE = '#FF4500'
const INK    = '#0F1419'
const MUTE   = '#6B7785'
const FAINT  = '#9AA3AE'
const LINE   = '#E8EAED'
const SOFT   = '#FFF0E8'
const BG     = '#F4F5F7'
const SEEN   = '#34B7F1'   // bleu « vu »
const FONT   = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const fmtTime = (d) => {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date)) return ''
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  if (sameDay) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const diff = (now - date) / 86400000
  if (diff < 7) return date.toLocaleDateString('fr-FR', { weekday: 'short' })
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

const CSS = `
.msg-shell { display: grid; grid-template-columns: clamp(280px, 30vw, 380px) minmax(0,1fr); height: 100%; }
@media (max-width: 760px) {
  .msg-shell { grid-template-columns: minmax(0,1fr); }
  .msg-shell[data-open="1"] .msg-list { display: none; }
  .msg-shell[data-open="0"] .msg-thread { display: none; }
  .msg-back { display: inline-flex !important; }
}
@keyframes msg-spin { to { transform: rotate(360deg) } }
`

function MessagesPageDesktop() {
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [activeId, setActive] = useState(routeId || null)
  const [draft, setDraft]     = useState('')
  const [q, setQ]             = useState('')
  const [filter, setFilter]   = useState('all')   // all | unread

  const {
    conversations, detail, messages, loadingDetail,
    sending, sendError, send,
  } = useMessaging(activeId)

  const scrollRef = useRef(null)

  // Sync URL ↔ conversation active
  useEffect(() => {
    if (activeId) navigate(`/dashboard/messages/${activeId}`, { replace: true })
  }, [activeId])   // eslint-disable-line

  // Scroll en bas à chaque nouveau message
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages.length, activeId])

  const onSend = async () => {
    const text = draft.trim()
    if (!text) return
    const res = await send(text)
    if (res?.ok) setDraft('')
  }

  const filtered = (conversations || []).filter(c => {
    if (filter === 'unread' && !(c.unread_count > 0)) return false
    if (!q) return true
    const hay = `${c.supplier?.name || c.supplier_name || ''} ${c.last_message?.content || ''}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  const totalUnread = (conversations || []).reduce((n, c) => n + (Number(c.unread_count) || 0), 0)

  return (
    <div style={{ background: BG, fontFamily: FONT, color: INK, height: '100%' }}>
      <style>{CSS}</style>

      <div className="msg-shell" data-open={activeId ? '1' : '0'}>

        {/* ═══ LISTE ═══ */}
        <div className="msg-list" style={{ borderRight: `1px solid ${LINE}`, background: '#fff', display: 'flex', flexDirection: 'column', minHeight: 0 }}>

          <div style={{ padding: '16px 16px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: BG, borderRadius: 30, padding: '9px 14px' }}>
              <Search size={17} color={FAINT} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher"
                style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 14, color: INK }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, padding: '0 16px 12px' }}>
            <TabBtn active={filter === 'all'}    onClick={() => setFilter('all')}>Toutes</TabBtn>
            <TabBtn active={filter === 'unread'} onClick={() => setFilter('unread')}>
              Non lues {totalUnread > 0 && <Badge>{totalUnread}</Badge>}
            </TabBtn>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {conversations === null && <Spinner />}
            {conversations !== null && filtered.length === 0 && (
              <Empty icon="💬" text={q ? 'Aucun résultat' : 'Aucune conversation'} />
            )}
            {filtered.map(c => {
              const name    = c.supplier?.name || c.supplier_name || 'Fournisseur'
              const logo    = c.supplier?.logo_url || c.supplier_logo
              const preview = c.last_message?.content || ''
              const unread  = c.unread_count > 0
              const active  = c.id === activeId
              return (
                <div key={c.id} onClick={() => setActive(c.id)} style={{
                  display: 'flex', gap: 12, padding: '13px 16px', cursor: 'pointer',
                  background: active ? SOFT : 'transparent',
                  borderLeft: active ? `3px solid ${ORANGE}` : '3px solid transparent',
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#FAFAFA' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                  <Avatar name={name} logo={logo} online={c.supplier?.is_online} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: INK, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      <span style={{ fontSize: 11, color: FAINT, flexShrink: 0 }}>{fmtTime(c.last_msg_at || c.last_message?.created_at)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 12.5, color: unread ? INK : MUTE, fontWeight: unread ? 600 : 400, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {preview || 'Démarrer la conversation'}
                      </span>
                      {unread && <Badge>{c.unread_count}</Badge>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═══ FIL ═══ */}
        <div className="msg-thread" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: BG }}>
          {!activeId ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: FAINT }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: MUTE }}>Sélectionnez une conversation</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Vos échanges avec les fournisseurs apparaissent ici.</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: '#fff', borderBottom: `1px solid ${LINE}` }}>
                <button onClick={() => { setActive(null); navigate('/dashboard/messages', { replace: true }) }}
                  style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: INK }}
                  className="msg-back">
                  <ArrowLeft size={20} />
                </button>
                <Avatar name={detail?.supplier?.name || detail?.supplier_name || '?'} logo={detail?.supplier?.logo_url} online={detail?.supplier?.is_online} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>
                    {detail?.supplier?.name || detail?.supplier_name || '…'}
                  </div>
                  <div style={{ fontSize: 12, color: detail?.supplier?.is_online ? '#0E9F6E' : FAINT }}>
                    {detail?.supplier?.is_online ? 'En ligne' : 'Hors ligne'}
                  </div>
                </div>
              </div>

              {detail?.product_name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#FFFBF5', borderBottom: `1px solid ${LINE}`, fontSize: 12.5, color: MUTE }}>
                  <Package size={15} color={ORANGE} /> À propos de : <strong style={{ color: INK }}>{detail.product_name}</strong>
                </div>
              )}

              <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', minHeight: 0 }}>
                {loadingDetail && <Spinner />}
                {!loadingDetail && messages.length === 0 && (
                  <Empty icon="✍️" text="Aucun message. Écrivez le premier." />
                )}
                {!loadingDetail && messages.map(m => {
                  const mine = String(m.sender_id) === String(user?.id)
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                      <div style={{ maxWidth: '72%' }}>
                        <div style={{
                          padding: '10px 14px', borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: mine ? ORANGE : '#fff', color: mine ? '#fff' : INK,
                          border: mine ? 'none' : `1px solid ${LINE}`,
                          fontSize: 14, lineHeight: 1.45, wordBreak: 'break-word',
                        }}>
                          {m.content}
                          {m.attachment_url && (
                            <a href={m.attachment_url} target="_blank" rel="noreferrer"
                              style={{ display: 'block', marginTop: 6, fontSize: 12, color: mine ? '#fff' : ORANGE, textDecoration: 'underline' }}>
                              Pièce jointe
                            </a>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: mine ? 'flex-end' : 'flex-start', fontSize: 10.5, color: FAINT, marginTop: 3 }}>
                          {fmtTime(m.created_at)}
                          {mine && (m.is_read
                            ? <CheckCheck size={14} color={SEEN} strokeWidth={2.4} />
                            : <Check size={13} color={FAINT} strokeWidth={2.4} />)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {sendError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: '#FEF2F2', color: '#B91C1C', fontSize: 12.5 }}>
                  <AlertCircle size={15} /> {sendError}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '14px 20px', background: '#fff', borderTop: `1px solid ${LINE}` }}>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() } }}
                  placeholder="Écrivez votre message…"
                  rows={1}
                  style={{
                    flex: 1, resize: 'none', maxHeight: 120, border: `1px solid ${LINE}`, borderRadius: 20,
                    padding: '10px 16px', fontSize: 14, fontFamily: FONT, outline: 'none', color: INK,
                    lineHeight: 1.4,
                  }} />
                <button onClick={onSend} disabled={!draft.trim() || sending}
                  style={{
                    width: 44, height: 44, borderRadius: '50%', border: 'none', flexShrink: 0,
                    background: draft.trim() && !sending ? ORANGE : '#DDD', color: '#fff',
                    cursor: draft.trim() && !sending ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sous-composants ──
function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 16px', borderRadius: 30, cursor: 'pointer', fontFamily: FONT,
      border: `1px solid ${active ? INK : LINE}`, background: '#fff',
      fontSize: 13, fontWeight: active ? 700 : 500, color: active ? INK : MUTE,
    }}>{children}</button>
  )
}

function Badge({ children }) {
  return (
    <span style={{
      minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, background: ORANGE, color: '#fff',
      fontSize: 10.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{children}</span>
  )
}

function Avatar({ name, logo, online }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {logo
          ? <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Store size={20} color={ORANGE} />}
      </div>
      {online && <span style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: '#0E9F6E', border: '2px solid #fff' }} />}
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 28, height: 28, border: `4px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'msg-spin .8s linear infinite' }} />
    </div>
  )
}

function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: FAINT }}>
      <div style={{ fontSize: 38, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 13.5 }}>{text}</div>
    </div>
  )
}

export default function MessagesPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileMessages /> : <MessagesPageDesktop />
}