// pages/SupplierMessagesPage.jsx — GROSHOP.tn

import { useState } from 'react'
import * as Icons from 'lucide-react'

// ── Inject styles ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-messages-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-messages-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-msg { font-family: 'DM Sans', -apple-system, sans-serif; color: #0F1419; }
    .gs-h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-card { background: #fff; border-radius: 18px; border: none; box-shadow: 0 1px 3px rgba(15, 20, 25, 0.04); }
    .gs-input-clean { border: none; outline: none; background: transparent; font-family: inherit; }
    .gs-icon-btn {
      background: transparent; border: none; cursor: pointer; padding: 8px;
      border-radius: 10px; display: inline-flex; align-items: center;
      justify-content: center; color: #6B7280; transition: all 0.15s;
    }
    .gs-icon-btn:hover { background: #F5F6F8; color: #0F1419; }

    /* Conversation item — left bar accent when active/hover */
    .gs-conv-item {
      position: relative;
      padding: 14px 18px 14px 22px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .gs-conv-item::before {
      content: '';
      position: absolute;
      left: 0; top: 8px; bottom: 8px;
      width: 3px;
      background: transparent;
      border-radius: 0 3px 3px 0;
      transition: background 0.15s ease;
    }
    .gs-conv-item:hover { background: #FAFBFC; }
    .gs-conv-item.is-active { background: #FFF5EF; }
    .gs-conv-item.is-active::before { background: #FF4500; }

    /* Custom scrollbar (subtle) */
    .gs-scroll::-webkit-scrollbar { width: 6px; }
    .gs-scroll::-webkit-scrollbar-track { background: transparent; }
    .gs-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }
    .gs-scroll::-webkit-scrollbar-thumb:hover { background: #C5CBD3; }
  `
  document.head.appendChild(s)
}

// ── Mock data ──────────────────────────────────────────────────────
const CONVERSATIONS = [
  { id: 1, name: 'Ahmed Ben Ali',     role: 'Pro Customer',  color: '#FF4500', initials: 'AB',
    lastMessage: "J'aimerais commander 50 unités d'huile d'olive 5L",
    time: '10:15', unread: 2, online: true },
  { id: 2, name: 'Sarra Khelifi',     role: 'New Customer',  color: '#EC4899', initials: 'SK',
    lastMessage: 'Quel est le délai de livraison pour Sfax ?',
    time: '09:42', unread: 1, online: true },
  { id: 3, name: 'Mohamed Trabelsi',  role: 'Star Customer', color: '#8B5CF6', initials: 'MT',
    lastMessage: 'Merci pour la rapidité de livraison !',
    time: 'Hier',  unread: 0, online: true, isActive: true },
  { id: 4, name: 'Imen Belhadj',      role: 'Pro Customer',  color: '#06B6D4', initials: 'IB',
    lastMessage: 'Le paiement a été effectué, merci de confirmer la réception',
    time: '12 Juin', unread: 0, online: false },
  { id: 5, name: 'Karim Mansour',     role: 'New Customer',  color: '#F59E0B', initials: 'KM',
    lastMessage: 'Avez-vous le café arabica en format 500g ?',
    time: '11 Juin', unread: 3, online: false },
  { id: 6, name: 'Leila Saidi',       role: 'Star Customer', color: '#6366F1', initials: 'LS',
    lastMessage: 'Pouvez-vous m\'envoyer la facture détaillée ?',
    time: '10 Juin', unread: 0, online: true },
  { id: 7, name: 'Bilel Hamdi',       role: 'Pro Customer',  color: '#22C55E', initials: 'BH',
    lastMessage: 'Les biscuits sont-ils sans gluten ?',
    time: '9 Juin',  unread: 0, online: false },
  { id: 8, name: 'Yosra Cherif',      role: 'New Customer',  color: '#EF4444', initials: 'YC',
    lastMessage: 'Bonjour, première commande chez vous, j\'ai quelques questions',
    time: '8 Juin',  unread: 1, online: false },
]

const MESSAGES = [
  { id: 1, from: 'them', date: "Aujourd'hui",
    content: "Bonjour, j'aimerais passer une commande importante pour mon restaurant. Avez-vous l'huile d'olive 5L en stock ?",
    time: '14:23' },
  { id: 2, from: 'me',
    content: "Bonjour Mohamed ! Oui, j'ai 48 unités en stock. Combien vous en voulez ?",
    time: '14:25', read: true },
  { id: 3, from: 'them',
    content: 'Parfait ! Je voudrais 40 unités. Quel est le prix dégressif possible ?',
    time: '14:27' },
  { id: 4, from: 'me',
    content: 'Pour 40 unités, je peux faire 105 TND par unité au lieu de 125 TND habituels.',
    time: '14:29', read: true, reactions: ['🔥'] },
  { id: 5, from: 'them',
    content: 'C\'est très bien, je confirme la commande. Livraison à Tunis svp.',
    time: '14:31' },
  { id: 6, from: 'me',
    content: 'Merci ! Je prépare la commande, livraison sous 24h à Tunis 🚚',
    time: '14:32', read: true },
  { id: 7, from: 'them',
    content: 'Merci pour la rapidité de livraison !',
    time: '14:35', reactions: ['👍', '❤️'] },
]

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function SupplierMessagesPage() {
  const [search, setSearch] = useState('')
  const [activeId, setActiveId] = useState(3)
  const [input, setInput] = useState('')

  const active = CONVERSATIONS.find(c => c.id === activeId) || CONVERSATIONS[0]
  const filteredConvs = CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="gs-msg" style={{
      height: 'calc(100vh - 170px)',
      minHeight: 560,
      display: 'flex',
      gap: 16,
    }}>
      <ConversationsList
        conversations={filteredConvs}
        activeId={activeId}
        onSelect={setActiveId}
        search={search}
        setSearch={setSearch}
      />

      <ChatArea
        active={active}
        input={input}
        setInput={setInput}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CONVERSATIONS LIST (left, 340px)
// ═══════════════════════════════════════════════════════════════════
function ConversationsList({ conversations, activeId, onSelect, search, setSearch }) {
  return (
    <div className="gs-card" style={{
      width: 340,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header + Search */}
      <div style={{
        padding: '18px 18px 14px',
        borderBottom: '1px solid #F1F2F4',
      }}>
        <h2 className="gs-h1" style={{
          fontSize: 18, margin: 0, marginBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          Messages
          <span style={{
            background: '#FFE5D6',
            color: '#FF4500',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 9px',
            borderRadius: 12,
            fontFamily: 'DM Sans',
          }}>
            {conversations.filter(c => c.unread > 0).length} non lus
          </span>
        </h2>

        {/* Search */}
        <div style={{
          background: '#F5F6F8',
          borderRadius: 10,
          padding: '9px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
        }}>
          <Icons.Search size={13} color="#9AA3AE" strokeWidth={2} />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="gs-input-clean"
            style={{ fontSize: 12.5, width: '100%', color: '#0F1419' }}
          />
        </div>
      </div>

      {/* List — scrollable */}
      <div className="gs-scroll" style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
      }}>
        {conversations.length === 0 ? (
          <div style={{
            padding: 40, textAlign: 'center',
            color: '#9AA3AE', fontSize: 12.5,
          }}>
            Aucune conversation trouvée
          </div>
        ) : (
          conversations.map(conv => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              isActive={conv.id === activeId}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function ConversationItem({ conv, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`gs-conv-item ${isActive ? 'is-active' : ''}`}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar
          initials={conv.initials}
          color={conv.color}
          online={conv.online}
          size={44}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top: name + time */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 4,
          }}>
            <div style={{
              fontSize: 13.5,
              fontWeight: conv.unread > 0 ? 700 : 600,
              color: '#0F1419',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 170,
            }}>
              {conv.name}
            </div>
            <div style={{
              fontSize: 10.5,
              color: conv.unread > 0 ? '#FF4500' : '#9AA3AE',
              fontWeight: conv.unread > 0 ? 600 : 500,
              flexShrink: 0,
            }}>
              {conv.time}
            </div>
          </div>

          {/* Bottom: preview + unread badge */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{
              fontSize: 11.5,
              color: conv.unread > 0 ? '#0F1419' : '#9AA3AE',
              fontWeight: conv.unread > 0 ? 500 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}>
              {conv.lastMessage}
            </div>

            {conv.unread > 0 && (
              <div style={{
                background: '#FF4500',
                color: '#fff',
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                padding: '0 5px',
                boxShadow: '0 2px 6px -1px rgba(255, 69, 0, 0.4)',
              }}>
                {conv.unread}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CHAT AREA (right, flex 1)
// ═══════════════════════════════════════════════════════════════════
function ChatArea({ active, input, setInput }) {
  return (
    <div className="gs-card" style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      minWidth: 0,
    }}>
      {/* Header */}
      <ChatHeader active={active} />

      {/* Messages scrollable */}
      <div className="gs-scroll" style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        padding: '18px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        {/* Date separator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '6px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: '#F1F2F4' }} />
          <span style={{
            fontSize: 10.5,
            color: '#9AA3AE',
            fontWeight: 500,
            padding: '3px 10px',
            background: '#F5F6F8',
            borderRadius: 10,
          }}>
            Aujourd'hui
          </span>
          <div style={{ flex: 1, height: 1, background: '#F1F2F4' }} />
        </div>

        {MESSAGES.map(msg => (
          <MessageBubble key={msg.id} msg={msg} active={active} />
        ))}
      </div>

      {/* Input area */}
      <ChatInput input={input} setInput={setInput} />
    </div>
  )
}

function ChatHeader({ active }) {
  return (
    <div style={{
      padding: '14px 24px',
      borderBottom: '1px solid #F1F2F4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar initials={active.initials} color={active.color} online={active.online} size={42} />
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0F1419' }}>
            {active.name}
          </div>
          <div style={{
            fontSize: 11,
            color: active.online ? '#059669' : '#9AA3AE',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            marginTop: 2,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: active.online ? '#22C55E' : '#9AA3AE',
            }} />
            {active.online ? 'En ligne' : 'Hors ligne'} · {active.role}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <button className="gs-icon-btn" title="Appel vidéo">
          <Icons.Video size={17} strokeWidth={1.8} />
        </button>
        <button className="gs-icon-btn" title="Appel">
          <Icons.Phone size={16} strokeWidth={1.8} />
        </button>
        <button className="gs-icon-btn" title="Voir profil">
          <Icons.UserCircle2 size={17} strokeWidth={1.8} />
        </button>
        <button className="gs-icon-btn" title="Plus">
          <Icons.MoreVertical size={17} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  )
}

function MessageBubble({ msg, active }) {
  const isMe = msg.from === 'me'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isMe ? 'flex-end' : 'flex-start',
      gap: 4,
    }}>
      {/* Sender label */}
      {!isMe && (
        <div style={{
          fontSize: 10.5,
          color: '#9AA3AE',
          fontWeight: 500,
          marginLeft: 4,
          marginBottom: 2,
        }}>
          {active.name}
        </div>
      )}

      {/* Bubble */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        maxWidth: '72%',
        flexDirection: isMe ? 'row-reverse' : 'row',
      }}>
        <div style={{
          background: isMe ? '#0F1419' : '#F5F6F8',
          color: isMe ? '#fff' : '#0F1419',
          padding: '10px 14px',
          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          fontSize: 13,
          lineHeight: 1.45,
          wordBreak: 'break-word',
        }}>
          {msg.content}
        </div>

        {/* Reply arrow */}
        <button className="gs-icon-btn" style={{ padding: 4, opacity: 0.5 }}>
          <Icons.Reply size={13} strokeWidth={2} color="#9AA3AE" />
        </button>
      </div>

      {/* Reactions */}
      {msg.reactions && (
        <div style={{
          display: 'flex',
          gap: 4,
          marginTop: 2,
          marginRight: isMe ? 28 : 0,
          marginLeft: isMe ? 0 : 4,
        }}>
          {msg.reactions.map((r, i) => (
            <div key={i} style={{
              background: '#fff',
              border: '1px solid #F1F2F4',
              borderRadius: 10,
              padding: '2px 7px',
              fontSize: 12,
              boxShadow: '0 1px 3px rgba(15, 20, 25, 0.05)',
            }}>
              {r}
            </div>
          ))}
        </div>
      )}

      {/* Time + read indicator */}
      <div style={{
        fontSize: 10,
        color: '#9AA3AE',
        marginTop: 2,
        marginRight: isMe ? 28 : 0,
        marginLeft: isMe ? 0 : 4,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        {isMe && msg.read && <Icons.CheckCheck size={12} color="#22C55E" strokeWidth={2.2} />}
        {msg.time} {isMe && <span style={{ color: '#9AA3AE' }}>· Vous</span>}
      </div>
    </div>
  )
}

function ChatInput({ input, setInput }) {
  const send = () => {
    if (!input.trim()) return
    // In real app : send to backend
    setInput('')
  }

  return (
    <div style={{
      padding: '14px 18px',
      borderTop: '1px solid #F1F2F4',
      flexShrink: 0,
    }}>
      <div style={{
        background: '#F5F6F8',
        borderRadius: 14,
        padding: '8px 8px 8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Écris un message..."
          className="gs-input-clean"
          style={{ fontSize: 13, flex: 1, color: '#0F1419' }}
        />

        <button className="gs-icon-btn" title="Joindre une image" style={{ padding: 6 }}>
          <Icons.Image size={16} strokeWidth={1.8} />
        </button>
        <button className="gs-icon-btn" title="Joindre un fichier" style={{ padding: 6 }}>
          <Icons.Paperclip size={16} strokeWidth={1.8} />
        </button>
        <button className="gs-icon-btn" title="Emojis" style={{ padding: 6 }}>
          <Icons.Smile size={16} strokeWidth={1.8} />
        </button>

        <button
          onClick={send}
          style={{
            background: input.trim()
              ? 'linear-gradient(135deg, #FF6B3D 0%, #FF4500 100%)'
              : '#E5E7EB',
            color: '#fff',
            border: 'none',
            padding: '9px 18px',
            borderRadius: 10,
            fontSize: 12.5,
            fontWeight: 700,
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'inherit',
            boxShadow: input.trim() ? '0 4px 12px -2px rgba(255, 69, 0, 0.45)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          Envoyer
          <Icons.Send size={13} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// AVATAR — initiales + statut en ligne
// ═══════════════════════════════════════════════════════════════════
function Avatar({ initials, color, online, size = 42 }) {
  return (
    <div style={{
      position: 'relative',
      flexShrink: 0,
      width: size,
      height: size,
    }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: size * 0.36,
        fontWeight: 700,
        fontFamily: '"DM Sans", sans-serif',
        boxShadow: `0 3px 10px -3px ${color}66`,
      }}>
        {initials}
      </div>
      {online && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: '50%',
          background: '#22C55E',
          border: '2px solid #fff',
        }} />
      )}
    </div>
  )
}