// src/components/supplier/MobileSupplierMessages.jsx — GROSHOP.tn
// Version téléphone de la messagerie. Le split-view (liste 320px + chat)
// devient deux vues qui se remplacent : liste → conversation → retour.
// Client anonyme : on n'expose que clientId + ville.

import { useState, useMemo, useRef, useEffect } from 'react'
import * as Icons from 'lucide-react'

/* Seule teinte orange du projet. */
const ORANGE      = '#ff5e20'
const ORANGE_TINT = 'rgba(255, 94, 32, .10)'
const ORANGE_RING = 'rgba(255, 94, 32, .30)'

const INK='#0F1419', MUTE='#6B7280', FAINT='#9AA3AE'
const FONT='"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const CONVERSATIONS = [
  { id: 1, clientId: 8421, city: 'Tunis',   productImg: null, productLabel: "Huile d'olive 5L",  lastMsg: "Bonjour, l'huile d'olive est-elle toujours disponible ?", time: '14:32', unread: 2, online: true,  orderRef: '#GS-8421', pinned: true },
  { id: 2, clientId: 8420, city: 'Sfax',    productImg: null, productLabel: 'Savon artisanal',   lastMsg: 'Parfait, merci beaucoup !',                                 time: '12:18', unread: 0, online: false, orderRef: '#GS-8420' },
  { id: 3, clientId: 8419, city: 'Sousse',  productImg: null, productLabel: 'Emballages carton', lastMsg: 'Est-ce que vous livrez à Sousse ?',                         time: '10:45', unread: 1, online: true,  orderRef: '#GS-8419' },
  { id: 4, clientId: 8418, city: 'Bizerte', productImg: null, productLabel: null,                lastMsg: 'Photo envoyée 📷',                                          time: 'Hier',  unread: 0, online: false, orderRef: '#GS-8418' },
  { id: 5, clientId: 8417, city: 'Ariana',  productImg: null, productLabel: 'Dattes Deglet',     lastMsg: 'Commande bien reçue, merci !',                              time: 'Hier',  unread: 0, online: false, orderRef: '#GS-8417' },
  { id: 6, clientId: 8402, city: 'Nabeul',  productImg: null, productLabel: null,                lastMsg: 'Quel est le prix pour 50 unités ?',                         time: '2j',    unread: 3, online: true,  orderRef: null },
]

const MESSAGES_MOCK = {
  1: [
    { id: 1, from: 'them', text: 'Bonjour !',                                                        time: '14:20' },
    { id: 2, from: 'them', text: "Je souhaite savoir si l'huile d'olive 5L est encore disponible ?", time: '14:20' },
    { id: 3, from: 'me',   text: 'Bonjour, oui elle est disponible en stock, 92 unités actuellement.', time: '14:25' },
    { id: 4, from: 'them', text: 'Super ! Quel est le prix pour 10 unités ?',                        time: '14:30' },
    { id: 5, from: 'me',   text: "48 TND l'unité, soit 480 TND pour 10. Livraison offerte à Tunis.", time: '14:31' },
    { id: 6, from: 'them', text: 'Et est-ce que vous livrez à Tunis ?',                              time: '14:32' },
  ],
}

const clientLabel = (conv) => `Client #${conv.clientId}`

// ═══════════════════════════════════════════════════════════════════
export default function MobileSupplierMessages() {
  const [openId, setOpenId] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  /* Le bouton retour matériel d'Android doit fermer la conversation
     avant de quitter la page : on pousse une entrée d'historique. */
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

  const filtered = useMemo(() => CONVERSATIONS.filter((c) => {
    if (filter === 'unread' && c.unread === 0) return false
    if (filter === 'archived') return false
    if (search) {
      const q = search.toLowerCase()
      if (!`${clientLabel(c)} ${c.city} ${c.orderRef || ''}`.toLowerCase().includes(q)) return false
    }
    return true
  }), [search, filter])

  const openConv = CONVERSATIONS.find((c) => c.id === openId)

  if (openConv) {
    return <ChatView conv={openConv} messages={MESSAGES_MOCK[openConv.id] || []} onBack={closeChat} />
  }

  const filters = [
    { key: 'all',      label: 'Tous' },
    { key: 'unread',   label: 'Non lus' },
    { key: 'archived', label: 'Archivés' },
  ]
  const unreadTotal = CONVERSATIONS.reduce((s, c) => s + c.unread, 0)

  return (
    <div style={{ fontFamily: FONT }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
        Messages
      </h1>
      <p style={{ margin: '0 0 16px', fontSize: 12.5, color: MUTE }}>
        {unreadTotal > 0 ? `${unreadTotal} message${unreadTotal > 1 ? 's' : ''} non lu${unreadTotal > 1 ? 's' : ''}.` : 'Tout est lu.'}
      </p>

      <div style={{
        background: '#fff', border: '1px solid #EFECE4', borderRadius: 20,
        padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
      }}>
        <Icons.Search size={14} color={FAINT} strokeWidth={2} />
        <input type="text" placeholder="ID, ville, commande…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, width: '100%', color: INK }} />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', cursor: 'pointer' }}><Icons.X size={14} color={FAINT} /></button>}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {filters.map((f) => {
          const on = f.key === filter
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: on ? ORANGE_TINT : '#fff',
                color: on ? ORANGE : FAINT,
                fontWeight: on ? 700 : 500, fontSize: 11.5,
                padding: '7px 14px', borderRadius: 20,
                boxShadow: on ? 'none' : 'inset 0 0 0 1px #EFECE4',
              }}>
              {f.label}
            </button>
          )
        })}
      </div>

      <div style={{ background: '#fff', border: '1px solid #EFECE4', borderRadius: 16, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: FAINT, fontSize: 13 }}>
            Aucune conversation
          </div>
        ) : filtered.map((c, i) => (
          <button key={c.id} onClick={() => setOpenId(c.id)}
            style={{
              width: '100%', display: 'flex', gap: 11, alignItems: 'center',
              padding: '12px 13px', background: c.unread > 0 ? ORANGE_TINT : 'none',
              border: 'none', borderTop: i > 0 ? '1px solid #F5F3EE' : 'none',
              borderLeft: c.unread > 0 ? `3px solid ${ORANGE}` : '3px solid transparent',
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <ClientAvatar conv={c} size={42} />
              {c.online && (
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: c.unread > 0 ? 700 : 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {clientLabel(c)}
                </span>
                {c.pinned && <Icons.Pin size={11} color={FAINT} style={{ flexShrink: 0 }} />}
                <span style={{ fontSize: 10, color: c.unread > 0 ? ORANGE : FAINT, fontWeight: c.unread > 0 ? 700 : 500, flexShrink: 0 }}>
                  {c.time}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: 11.5, color: c.unread > 0 ? INK : FAINT, fontWeight: c.unread > 0 ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.lastMsg}
                </span>
                {c.unread > 0 && (
                  <span style={{ background: ORANGE, color: '#fff', minWidth: 18, height: 18, borderRadius: 999, fontSize: 9.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', flexShrink: 0 }}>
                    {c.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// VUE CONVERSATION — plein écran, en position fixed pour que la zone
// de saisie reste collée au clavier plutôt qu'au bas du document.
// ═══════════════════════════════════════════════════════════════════
function ChatView({ conv, messages, onBack }) {
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [conv.id])

  const send = () => {
    if (!input.trim()) return
    setInput('')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1500,
      background: '#fff', display: 'flex', flexDirection: 'column',
      fontFamily: FONT,
    }}>
      {/* En-tête */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 12px', borderBottom: '1px solid #F0EDE5', flexShrink: 0,
      }}>
        <button onClick={onBack} aria-label="Retour"
          style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', color: INK, flexShrink: 0 }}>
          <Icons.ChevronLeft size={22} strokeWidth={2.2} />
        </button>

        <div style={{ position: 'relative', flexShrink: 0 }}>
          <ClientAvatar conv={conv} size={36} />
          {conv.online && (
            <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {clientLabel(conv)}
          </div>
          <div style={{ fontSize: 10.5, color: conv.online ? '#059669' : FAINT, marginTop: 1, fontWeight: 500 }}>
            {conv.online ? 'En ligne' : 'Hors ligne'}{conv.city ? ` · ${conv.city}` : ''}
          </div>
        </div>

        <button aria-label="Appeler" style={iconBtn}><Icons.Phone size={17} strokeWidth={1.9} /></button>
        <button aria-label="Plus" style={iconBtn}><Icons.MoreVertical size={17} strokeWidth={1.9} /></button>
      </div>

      {/* Bandeau commande */}
      {conv.orderRef && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 14px', background: ORANGE_TINT, flexShrink: 0,
          fontSize: 11.5, color: ORANGE, fontWeight: 600,
        }}>
          <Icons.Package size={13} strokeWidth={2.2} />
          Commande {conv.orderRef}
          {conv.productLabel && <span style={{ color: MUTE, fontWeight: 400 }}>· {conv.productLabel}</span>}
        </div>
      )}

      {/* Fil */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', minHeight: 0,
        padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 9,
      }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: FAINT, fontSize: 13 }}>
            Aucun message. Envoyez le premier !
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', fontSize: 9.5, color: FAINT, letterSpacing: '0.05em', fontWeight: 600, marginBottom: 2 }}>
              AUJOURD'HUI
            </div>
            {messages.map((m) => <Bubble key={m.id} msg={m} conv={conv} />)}
            {conv.online && (
              <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end' }}>
                <ClientAvatar conv={conv} size={26} />
                <div style={{ background: '#F7F7F5', border: '1px solid #EAE7DF', borderRadius: 15, borderBottomLeftRadius: 4, padding: '10px 13px', display: 'inline-flex', gap: 4 }}>
                  <Dot delay="0s" /><Dot delay=".2s" /><Dot delay=".4s" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Saisie */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '10px 12px calc(10px + env(safe-area-inset-bottom))',
        borderTop: '1px solid #F0EDE5', flexShrink: 0, background: '#fff',
      }}>
        <button aria-label="Joindre" style={iconBtn}><Icons.Paperclip size={18} strokeWidth={1.9} /></button>
        <div style={{ flex: 1, background: '#F4F4F2', borderRadius: 999, padding: '10px 16px' }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Écrivez votre message…"
            style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13.5, width: '100%', color: INK }} />
        </div>
        <button onClick={send} disabled={!input.trim()} aria-label="Envoyer"
          style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: input.trim() ? ORANGE : '#EAE7DF',
            color: '#fff', border: 'none',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .15s',
          }}>
          <Icons.Send size={16} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}

function Bubble({ msg, conv }) {
  const mine = msg.from === 'me'

  if (mine) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ background: ORANGE, color: '#fff', padding: '10px 13px', borderRadius: 15, borderBottomRightRadius: 4, fontSize: 13.5, lineHeight: 1.5 }}>
            {msg.text}
          </div>
          <div style={{ fontSize: 9.5, color: FAINT, marginTop: 3, paddingRight: 4 }}>{msg.time}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end' }}>
      <ClientAvatar conv={conv} size={26} />
      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ background: '#F7F7F5', color: INK, border: '1px solid #EAE7DF', padding: '10px 13px', borderRadius: 15, borderBottomLeftRadius: 4, fontSize: 13.5, lineHeight: 1.5 }}>
          {msg.text}
        </div>
        <div style={{ fontSize: 9.5, color: FAINT, marginTop: 3, paddingLeft: 4 }}>{msg.time}</div>
      </div>
    </div>
  )
}

/* Client anonyme : image du produit lié, sinon pastille dérivée de l'ID.
   Jamais de photo ni de nom client. */
function ClientAvatar({ conv, size = 40 }) {
  if (conv.productImg) {
    return (
      <img src={conv.productImg} alt={conv.productLabel || 'Produit'} title={conv.productLabel || undefined}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block', background: '#EAE7DF' }} />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#fff', border: `1.5px solid ${ORANGE_RING}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: ORANGE, fontSize: size * 0.32, fontWeight: 700, flexShrink: 0,
    }}>
      {String(conv.clientId).slice(-2)}
    </div>
  )
}

function Dot({ delay }) {
  return <span style={{
    width: 6, height: 6, borderRadius: '50%', background: '#C9C4BC',
    display: 'inline-block', animation: `gs-typing 1.2s infinite ${delay}`,
  }} />
}

const iconBtn = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  width: 34, height: 34, borderRadius: '50%',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  color: MUTE, flexShrink: 0, padding: 0,
}

if (typeof document !== 'undefined' && !document.getElementById('gs-mobile-msg-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-mobile-msg-styles'
  s.textContent = `
    @keyframes gs-typing { 0%,60%,100% { transform: translateY(0); opacity: .4 } 30% { transform: translateY(-4px); opacity: 1 } }
  `
  document.head.appendChild(s)
}