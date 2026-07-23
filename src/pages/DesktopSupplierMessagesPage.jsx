// pages/SupplierMessagesPage.jsx — GROSHOP.tn
// Fond du chat blanc · orange #FF5E00 · avatar client anonyme (pastille blanche, texte orange).

import { useState, useMemo, useRef, useEffect } from 'react'
import * as Icons from 'lucide-react'

// ── Couleur orange de marque ───────────────────────────────────────
const ORANGE = '#FF5E00'
const ORANGE_SOFT = '#FFF1EA'   // fond très clair pour états actifs
const ORANGE_TINT = '#FFD9C7'   // bordure claire (pastilles, etc.)

// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-messages-styles-v2')) {
  document.querySelectorAll('style[id^="gs-messages-styles"]').forEach(el => el.remove())
  const s = document.createElement('style')
  s.id = 'gs-messages-styles-v2'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-messages {
      font-family: 'DM Sans', -apple-system, sans-serif;
      color: #0F1419;
      height: 100%;
      min-height: 0;
      display: grid;
      grid-template-columns: 320px minmax(0, 1fr);
      background: #fff;
      overflow: hidden;
    }
    .gs-input-clean { border: none; outline: none; background: transparent; font-family: inherit; }

    .gs-icon-btn {
      background: transparent; border: none; cursor: pointer;
      width: 34px; height: 34px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      color: #6B7280; transition: all 0.15s;
    }
    .gs-icon-btn:hover { background: #F4F4F2; color: #0F1419; }

    .gs-conv {
      padding: 11px 16px;
      display: flex; gap: 11px; align-items: center;
      cursor: pointer; transition: background 0.15s; position: relative;
    }
    .gs-conv:hover { background: #FAFAF7; }
    .gs-conv--active { background: ${ORANGE_SOFT}; }
    .gs-conv--active::before {
      content: ''; position: absolute; left: 0; top: 0; bottom: 0;
      width: 3px; background: ${ORANGE};
    }

    .gs-tab {
      padding: 6px 12px; border: none; background: transparent;
      color: #9AA3AE; font-weight: 500; font-size: 12px;
      cursor: pointer; border-radius: 999px; font-family: inherit;
      transition: all 0.15s;
    }
    .gs-tab:hover { color: #0F1419; }
    .gs-tab--active { background: ${ORANGE_SOFT}; color: ${ORANGE}; font-weight: 600; }

    @keyframes gs-msg-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .gs-msg { animation: gs-msg-in 0.25s ease; }

    @keyframes gs-typing { 0%,60%,100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }
    .gs-dot { width: 6px; height: 6px; border-radius: 50%; background: #C9C4BC; display: inline-block; }
    .gs-dot:nth-child(1) { animation: gs-typing 1.2s infinite 0s; }
    .gs-dot:nth-child(2) { animation: gs-typing 1.2s infinite 0.2s; }
    .gs-dot:nth-child(3) { animation: gs-typing 1.2s infinite 0.4s; }

    .gs-scroll::-webkit-scrollbar { width: 6px; }
    .gs-scroll::-webkit-scrollbar-track { background: transparent; }
    .gs-scroll::-webkit-scrollbar-thumb { background: #EAE7DF; border-radius: 3px; }
    .gs-scroll::-webkit-scrollbar-thumb:hover { background: #DBD5C8; }
  `
  document.head.appendChild(s)
}

// ── Data ───────────────────────────────────────────────────────────
// Client anonyme : on n'expose que clientId + ville.
// productImg = image du produit lié (avatar), null sinon → pastille ID.
const CONVERSATIONS = [
  { id: 1, clientId: 8421, city: 'Tunis',   productImg: null, productLabel: "Huile d'olive 5L",   lastMsg: "Bonjour, l'huile d'olive est-elle toujours disponible ?", time: '14:32', unread: 2, online: true,  orderRef: '#GS-8421', pinned: true },
  { id: 2, clientId: 8420, city: 'Sfax',    productImg: null, productLabel: 'Savon artisanal',    lastMsg: 'Parfait, merci beaucoup !',                                 time: '12:18', unread: 0, online: false, orderRef: '#GS-8420' },
  { id: 3, clientId: 8419, city: 'Sousse',  productImg: null, productLabel: 'Emballages carton',  lastMsg: 'Est-ce que vous livrez à Sousse ?',                         time: '10:45', unread: 1, online: true,  orderRef: '#GS-8419' },
  { id: 4, clientId: 8418, city: 'Bizerte', productImg: null, productLabel: null,                 lastMsg: 'Photo envoyée 📷',                                          time: 'Hier',  unread: 0, online: false, orderRef: '#GS-8418' },
  { id: 5, clientId: 8417, city: 'Ariana',  productImg: null, productLabel: 'Dattes Deglet',      lastMsg: 'Commande bien reçue, merci !',                              time: 'Hier',  unread: 0, online: false, orderRef: '#GS-8417' },
  { id: 6, clientId: 8402, city: 'Nabeul',  productImg: null, productLabel: null,                 lastMsg: 'Quel est le prix pour 50 unités ?',                         time: '2j',    unread: 3, online: true,  orderRef: null },
]

const MESSAGES_MOCK = {
  1: [
    { id: 1, from: 'them', text: 'Bonjour !',                                                              time: '14:20' },
    { id: 2, from: 'them', text: "Je souhaite savoir si l'huile d'olive 5L est encore disponible ?",       time: '14:20' },
    { id: 3, from: 'me',   text: 'Bonjour, oui elle est disponible en stock, 92 unités actuellement.',      time: '14:25' },
    { id: 4, from: 'them', text: 'Super ! Quel est le prix pour 10 unités ?',                              time: '14:30' },
    { id: 5, from: 'me',   text: "48 TND l'unité, soit 480 TND pour 10. Livraison offerte à Tunis.",       time: '14:31' },
    { id: 6, from: 'them', text: 'Et est-ce que vous livrez à Tunis ?',                                    time: '14:32' },
  ]
}

const clientLabel = (conv) => `Client #${conv.clientId}`

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function DesktopSupplierMessagesPage() {
  const [selectedId, setSelectedId] = useState(1)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    return CONVERSATIONS.filter(c => {
      if (filter === 'unread' && c.unread === 0) return false
      if (filter === 'archived') return false
      if (search) {
        const q = search.toLowerCase()
        const hay = `${clientLabel(c)} ${c.city} ${c.orderRef || ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [search, filter])

  const selectedConv = CONVERSATIONS.find(c => c.id === selectedId)

  return (
    <div style={{ height: '100%', minHeight: 0, display: 'flex' }}>
      <div className="gs-messages" style={{ flex: 1, minWidth: 0 }}>
        <ConversationList
          conversations={filtered}
          selectedId={selectedId}
          onSelect={setSelectedId}
          search={search} setSearch={setSearch}
          filter={filter} setFilter={setFilter}
        />
        {selectedConv && (
          <ChatArea conv={selectedConv} messages={MESSAGES_MOCK[selectedConv.id] || []} />
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CONVERSATION LIST
// ═══════════════════════════════════════════════════════════════════
function ConversationList({ conversations, selectedId, onSelect, search, setSearch, filter, setFilter }) {
  const filters = [
    { key: 'all',      label: 'Tous' },
    { key: 'unread',   label: 'Non lus' },
    { key: 'archived', label: 'Archivés' },
  ]

  return (
    <div style={{ borderRight: '1px solid #EAE7DF', display: 'flex', flexDirection: 'column', minHeight: 0, background: '#fff' }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #F0EDE5' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#9AA3AE', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Conversations</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="gs-icon-btn" title="Nouveau message"><Icons.SquarePen size={17} strokeWidth={1.8} /></button>
            <button className="gs-icon-btn" title="Ajouter un contact"><Icons.UserPlus size={17} strokeWidth={1.8} /></button>
          </div>
        </div>

        <div style={{ background: '#F4F4F2', borderRadius: 10, padding: '8px 13px', display: 'flex', alignItems: 'center', gap: 7, marginTop: 12 }}>
          <Icons.Search size={14} color="#9AA3AE" strokeWidth={2} />
          <input
            type="text"
            placeholder="Rechercher (ID, ville, commande)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="gs-input-clean"
            style={{ fontSize: 12.5, width: '100%', color: '#0F1419' }}
          />
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
        {conversations.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9AA3AE', fontSize: 13 }}>Aucune conversation</div>
        ) : (
          conversations.map(c => (
            <ConvItem key={c.id} conv={c} active={c.id === selectedId} onSelect={onSelect} />
          ))
        )}
      </div>
    </div>
  )
}

function ConvItem({ conv, active, onSelect }) {
  return (
    <div onClick={() => onSelect(conv.id)} className={`gs-conv ${active ? 'gs-conv--active' : ''}`}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <ClientAvatar conv={conv} size={44} />
        {conv.online && (
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 13.5, fontWeight: conv.unread > 0 ? 700 : 600, color: '#0F1419', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {clientLabel(conv)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 10.5, color: conv.unread > 0 ? ORANGE : '#9AA3AE', fontWeight: conv.unread > 0 ? 700 : 500 }}>{conv.time}</span>
            {conv.pinned && <Icons.Pin size={12} color="#9AA3AE" />}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', marginTop: 3 }}>
          <div style={{ fontSize: 11.5, color: conv.unread > 0 ? '#0F1419' : '#9AA3AE', fontWeight: conv.unread > 0 ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {conv.lastMsg}
          </div>
          {conv.unread > 0 && (
            <div style={{ background: ORANGE, color: '#fff', minWidth: 19, height: 19, borderRadius: 999, fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', flexShrink: 0 }}>
              {conv.unread}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CHAT AREA
// ═══════════════════════════════════════════════════════════════════
function ChatArea({ conv, messages }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderBottom: '1px solid #F0EDE5' }}>
        <div style={{ position: 'relative' }}>
          <ClientAvatar conv={conv} size={40} />
          {conv.online && (
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0F1419' }}>{clientLabel(conv)}</div>
          <div style={{ fontSize: 11.5, color: conv.online ? '#059669' : '#9AA3AE', marginTop: 1, fontWeight: 500 }}>
            {conv.online ? 'En ligne' : 'Hors ligne'}{conv.city ? ` · ${conv.city}` : ''}
          </div>
        </div>

        {conv.orderRef && (
          <button className="gs-icon-btn" title={`Commande ${conv.orderRef}`} style={{ width: 'auto', padding: '0 12px', borderRadius: 999, border: '1px solid #EAE7DF', gap: 5, fontSize: 11.5, color: '#0F1419' }}>
            <Icons.Package size={12} strokeWidth={2.2} /> {conv.orderRef}
          </button>
        )}
        <button className="gs-icon-btn" title="Appel vidéo"><Icons.Video size={17} strokeWidth={1.8} /></button>
        <button className="gs-icon-btn" title="Appeler"><Icons.Phone size={16} strokeWidth={1.8} /></button>
        <button className="gs-icon-btn" title="Plus"><Icons.Menu size={17} strokeWidth={1.8} /></button>
      </div>

      {/* Fond du chat : BLANC */}
      <div ref={scrollRef} className="gs-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10, background: '#fff' }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA3AE', fontSize: 13 }}>
            Aucun message. Envoyez le premier !
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', fontSize: 10, color: '#9AA3AE', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 }}>
              AUJOURD'HUI
            </div>
            {messages.map(m => <MessageBubble key={m.id} msg={m} conv={conv} />)}
            {conv.online && (
              <div className="gs-msg" style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <ClientAvatar conv={conv} size={28} />
                <div style={{ background: '#F7F7F5', border: '1px solid #EAE7DF', borderRadius: 16, borderBottomLeftRadius: 4, padding: '11px 14px', display: 'inline-flex', gap: 4 }}>
                  <span className="gs-dot" /><span className="gs-dot" /><span className="gs-dot" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderTop: '1px solid #F0EDE5', background: '#fff' }}>
        <button className="gs-icon-btn" title="Joindre"><Icons.Paperclip size={17} strokeWidth={1.8} /></button>
        <button className="gs-icon-btn" title="Emoji"><Icons.Smile size={17} strokeWidth={1.8} /></button>
        <div style={{ flex: 1, background: '#F4F4F2', borderRadius: 999, padding: '10px 18px' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Écrivez votre message..."
            className="gs-input-clean"
            style={{ fontSize: 13, width: '100%', color: '#0F1419' }}
          />
        </div>
        <button
          onClick={send}
          disabled={!input.trim()}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: input.trim() ? ORANGE : '#EAE7DF',
            color: '#fff', border: 'none',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
            boxShadow: input.trim() ? `0 4px 14px -3px rgba(255,94,0,0.5)` : 'none',
          }}
        >
          <Icons.Send size={15} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MESSAGE BUBBLE — moi = orange #FF5E00 · client = gris clair + avatar
// ═══════════════════════════════════════════════════════════════════
function MessageBubble({ msg, conv }) {
  const isMine = msg.from === 'me'

  if (isMine) {
    return (
      <div className="gs-msg" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '68%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ background: ORANGE, color: '#fff', padding: '10px 14px', borderRadius: 16, borderBottomRightRadius: 4, fontSize: 13, lineHeight: 1.5 }}>
            {msg.text}
          </div>
          <div style={{ fontSize: 9.5, color: '#9AA3AE', marginTop: 3, paddingRight: 4 }}>{msg.time}</div>
        </div>
      </div>
    )
  }

  // Bulle reçue : gris très clair + bordure (le fond du chat étant blanc)
  return (
    <div className="gs-msg" style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
      <ClientAvatar conv={conv} size={28} />
      <div style={{ maxWidth: '68%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ background: '#F7F7F5', color: '#0F1419', border: '1px solid #EAE7DF', padding: '10px 14px', borderRadius: 16, borderBottomLeftRadius: 4, fontSize: 13, lineHeight: 1.5 }}>
          {msg.text}
        </div>
        <div style={{ fontSize: 9.5, color: '#9AA3AE', marginTop: 3, paddingLeft: 4 }}>{msg.time}</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CLIENT AVATAR — image produit si dispo, sinon pastille BLANCHE
// (bordure + texte orange) dérivée de l'ID. Jamais de photo/nom client.
// ═══════════════════════════════════════════════════════════════════
function ClientAvatar({ conv, size = 40 }) {
  // 1) Image du produit lié à la conversation
  if (conv.productImg) {
    return (
      <img
        src={conv.productImg}
        alt={conv.productLabel || 'Produit'}
        title={conv.productLabel || undefined}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', flexShrink: 0, display: 'block',
          background: '#EAE7DF',
        }}
      />
    )
  }

  // 2) Fallback : pastille blanche, bordure + texte orange (option A)
  const label = String(conv.clientId).slice(-2)   // 2 derniers chiffres de l'ID

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#fff',
      border: `1.5px solid ${ORANGE_TINT}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: ORANGE, fontSize: size * 0.32, fontWeight: 700, flexShrink: 0,
    }}>
      {label}
    </div>
  )
}