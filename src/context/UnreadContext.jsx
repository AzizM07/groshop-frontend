// src/context/UnreadContext.jsx — GROSHOP.tn
// Poller GLOBAL du compteur de messages non lus. Vit au-dessus des routes,
// donc il tourne sur TOUTES les pages (même hors messagerie) : le badge de
// l'icône messages se met à jour tout seul quand un nouveau message arrive,
// exactement comme le badge du panier.
//
// - Poll toutes les 12 s, uniquement quand l'onglet est visible.
// - Rafraîchit aussi au retour d'onglet / focus fenêtre.
// - Rafraîchit immédiatement sur l'événement 'gs-unread-refresh'
//   (émis par useMessaging quand on lit / reçoit un message → badge instantané).

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { messaging } from '../lib/api'
import { useAuth } from './AuthContext'

const POLL_MS = 12000

const UnreadContext = createContext({ unread: 0, refresh: () => {} })
export const useUnread = () => useContext(UnreadContext)

export function UnreadProvider({ children }) {
  const { user } = useAuth()
  const [unread, setUnread] = useState(0)
  const timerRef = useRef(null)

  const refresh = useCallback(async () => {
    if (!user) { setUnread(0); return }
    try {
      const d = await messaging.unreadCount()
      setUnread(Number(d?.count) || 0)
    } catch { /* garde la valeur précédente en cas d'erreur réseau */ }
  }, [user])

  useEffect(() => {
    if (!user) { setUnread(0); return }

    const visible = () => document.visibilityState === 'visible'
    refresh()

    timerRef.current = setInterval(() => { if (visible()) refresh() }, POLL_MS)

    const onVisOrFocus = () => { if (visible()) refresh() }
    const onEvt = () => refresh()

    document.addEventListener('visibilitychange', onVisOrFocus)
    window.addEventListener('focus', onVisOrFocus)
    window.addEventListener('gs-unread-refresh', onEvt)

    return () => {
      clearInterval(timerRef.current)
      document.removeEventListener('visibilitychange', onVisOrFocus)
      window.removeEventListener('focus', onVisOrFocus)
      window.removeEventListener('gs-unread-refresh', onEvt)
    }
  }, [user, refresh])

  return (
    <UnreadContext.Provider value={{ unread, refresh }}>
      {children}
    </UnreadContext.Provider>
  )
}