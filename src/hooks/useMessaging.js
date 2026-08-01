// src/hooks/useMessaging.js — GROSHOP.tn
// Logique messagerie partagée (acheteur + fournisseur) : liste, fil actif,
// polling INTELLIGENT (se met en pause quand l'onglet est caché), accusés
// de lecture (double coche). Aucune UI ici — juste des données + actions.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { messaging } from '../lib/api'

const LIST_MS   = 6000   // rafraîchit la liste (aperçu, ordre, non-lus)
const THREAD_MS = 2800   // rafraîchit le fil ouvert (nouveaux messages + accusés)

const isVisible = () =>
  typeof document === 'undefined' || document.visibilityState === 'visible'

export function useMessaging(activeId) {
  const [conversations, setConversations] = useState(null)
  const [detail,   setDetail]   = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [sending,   setSending]   = useState(false)
  const [sendError, setSendError] = useState('')

  const cursorRef  = useRef(null)          // curseur serveur pour le poll incrémental
  const seenRef    = useRef(new Set())     // ids déjà affichés (anti-doublon)
  const activeRef  = useRef(activeId)
  activeRef.current = activeId

  // ── Liste ──────────────────────────────────────────────────────
  const loadList = useCallback(async () => {
    try {
      const d = await messaging.conversations()
      setConversations(Array.isArray(d) ? d : (d?.results || []))
    } catch {
      setConversations([])
    }
  }, [])

  useEffect(() => { loadList() }, [loadList])

  // Polling liste (visible uniquement) + refresh immédiat au retour d'onglet
  useEffect(() => {
    const tick = () => { if (isVisible()) loadList() }
    const t = setInterval(tick, LIST_MS)
    const onVis = () => { if (isVisible()) loadList() }
    document.addEventListener('visibilitychange', onVis)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis) }
  }, [loadList])

  // ── Chargement du fil actif ────────────────────────────────────
  useEffect(() => {
    if (!activeId) { setDetail(null); setMessages([]); return }
    let alive = true
    setLoadingDetail(true)
    setSendError('')
    seenRef.current = new Set()

    messaging.conversation(activeId)
      .then(d => {
        if (!alive || activeRef.current !== activeId) return
        setDetail(d)
        const msgs = d?.messages || []
        msgs.forEach(m => seenRef.current.add(String(m.id)))
        setMessages(msgs)
        cursorRef.current = d?.server_time || new Date().toISOString()
        setLoadingDetail(false)
        loadList()   // les non-lus viennent d'être remis à zéro côté serveur
      })
      .catch(() => {
        if (!alive) return
        setDetail(null); setMessages([]); setLoadingDetail(false)
      })

    return () => { alive = false }
  }, [activeId, loadList])

  // ── Polling du fil actif ───────────────────────────────────────
  useEffect(() => {
    if (!activeId) return

    const poll = async () => {
      if (!isVisible() || activeRef.current !== activeId) return
      try {
        const res = await messaging.poll(activeId, {
          after: cursorRef.current,
          markRead: isVisible(),      // ne marque « lu » que si on regarde vraiment
        })
        if (activeRef.current !== activeId) return

        // Nouveaux messages (dédoublonnés par id)
        const incoming = (res?.messages || []).filter(m => !seenRef.current.has(String(m.id)))
        if (incoming.length) {
          incoming.forEach(m => seenRef.current.add(String(m.id)))
          setMessages(prev => [...prev, ...incoming])
          loadList()   // maj aperçu + ordre
        }

        // Accusés de lecture : mes messages passés « vus »
        const readSet = new Set((res?.read_ids || []).map(String))
        if (readSet.size) {
          setMessages(prev => prev.map(m =>
            readSet.has(String(m.id)) && !m.is_read ? { ...m, is_read: true } : m))
        }

        if (res?.server_time) cursorRef.current = res.server_time
      } catch { /* silencieux : on retentera au prochain tick */ }
    }

    const t = setInterval(poll, THREAD_MS)
    const onVis = () => { if (isVisible()) poll() }
    document.addEventListener('visibilitychange', onVis)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis) }
  }, [activeId, loadList])

  // ── Envoi ──────────────────────────────────────────────────────
  const send = useCallback(async (text, attachmentUrl = '') => {
    const content = (text || '').trim()
    if (!content || sending || !activeRef.current) return { ok: false }
    setSending(true); setSendError('')
    try {
      const msg = await messaging.sendMessage(activeRef.current, content, attachmentUrl)
      // request() lève une erreur sur 4xx → le filtre anti-contournement
      // arrive donc dans le catch (message précis dans e.message).
      seenRef.current.add(String(msg.id))
      setMessages(prev => [...prev, msg])
      setSending(false)
      loadList()
      return { ok: true, message: msg }
    } catch (e) {
      setSendError(e?.message || "Échec de l'envoi. Réessayez.")
      setSending(false)
      return { ok: false, error: e?.message }
    }
  }, [sending, loadList])

  const unreadTotal = useMemo(
    () => (conversations || []).reduce((n, c) => n + (Number(c.unread_count) || 0), 0),
    [conversations],
  )

  return {
    conversations,
    unreadTotal,
    detail,
    messages,
    loadingList: conversations === null,
    loadingDetail,
    sending,
    sendError,
    setSendError,
    send,
    reloadList: loadList,
  }
}