// src/hooks/usePageTracking.js — GROSHOP.tn
// Fire-and-forget : n'échoue jamais bruyamment, ne bloque jamais l'UI.
//   1. pageview  → à l'arrivée sur la page
//   2. duration  → à la sortie (temps passé), rattaché via client_view_id
//   3. trackProductEvent(productId, type) → clics significatifs (description, panier…)

import { useEffect, useRef } from 'react'

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`

/* ── Session ID (pas de dépendance uuid) ── */
export function getSessionId() {
  let id = sessionStorage.getItem('gs_session_id')
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) ||
         `s-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    sessionStorage.setItem('gs_session_id', id)
  }
  return id
}

/* ── Identifiant d'UNE ouverture de page (pour rattacher le temps passé) ── */
function newViewId() {
  return (crypto.randomUUID && crypto.randomUUID()) ||
         `v-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function getCookie(name) {
  const parts = `; ${document.cookie}`.split(`; ${name}=`)
  return parts.length === 2 ? parts.pop().split(';').shift() : null
}

function detectChannel() {
  const params = new URLSearchParams(window.location.search)
  const medium = params.get('utm_medium')
  const ALLOWED = ['direct', 'search', 'social', 'email', 'referral', 'app_ios', 'app_android']
  if (medium && ALLOWED.includes(medium)) return medium

  const ref = document.referrer
  if (!ref) return 'direct'
  try {
    const host = new URL(ref).hostname
    if (host.includes(window.location.hostname)) return 'direct'
    if (/google|bing|yahoo|duckduckgo|qwant/.test(host)) return 'search'
    if (/facebook|instagram|tiktok|twitter|x\.com|linkedin/.test(host)) return 'social'
    return 'referral'
  } catch {
    return 'unknown'
  }
}

function detectDevice() {
  const ua = navigator.userAgent
  if (/tablet|ipad/i.test(ua)) return 'tablet'
  if (/mobile|android|iphone/i.test(ua)) return 'mobile'
  return 'desktop'
}

/* ── POST générique fire-and-forget. keepalive=true pour survivre à la
      fermeture / navigation (utilisé par l'envoi du temps passé). ── */
function post(path, body, { keepalive = false } = {}) {
  try {
    const csrf = getCookie('csrftoken')
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      credentials: 'include',
      keepalive,
      headers: {
        'Content-Type': 'application/json',
        ...(csrf ? { 'X-CSRFToken': csrf } : {}),
      },
      body: JSON.stringify(body),
    }).catch(() => {})
  } catch {
    /* jamais bloquant */
  }
}

/**
 * Envoie un événement d'interaction sur une fiche produit.
 * @param {string} productId  UUID du produit
 * @param {'view_description'|'view_image'|'select_variant'|'add_to_cart'|'contact_supplier'} eventType
 */
export function trackProductEvent(productId, eventType) {
  if (!productId || !eventType) return
  post('/analytics/product-event/', {
    product:    productId,
    event_type: eventType,
    session_id: getSessionId(),
  })
}

/**
 * @param {'home'|'catalogue'|'search'|'product_detail'|'supplier_shop'} pageType
 * @param {string|null} supplierId  UUID du fournisseur (si la page le concerne)
 * @param {string|null} productId   UUID du produit (page détail)
 */
export function usePageTracking({ pageType, supplierId = null, productId = null }) {
  // un id de vue régénéré à chaque (re)montage de page concernée
  const viewIdRef = useRef(null)

  // ── 1. Pageview à l'arrivée ──
  useEffect(() => {
    if (pageType === 'product_detail' && !productId) return
    if (pageType === 'supplier_shop' && !supplierId) return

    const params  = new URLSearchParams(window.location.search)
    const viewId  = newViewId()
    viewIdRef.current = viewId

    post('/analytics/pageview/', {
      page_type:      pageType,
      supplier:       supplierId,
      product:        productId,
      session_id:     getSessionId(),
      client_view_id: viewId,
      channel:        detectChannel(),
      device_type:    detectDevice(),
      utm_source:     params.get('utm_source')   || '',
      utm_medium:     params.get('utm_medium')   || '',
      utm_campaign:   params.get('utm_campaign') || '',
      referrer:       document.referrer || '',
    })
  }, [pageType, supplierId, productId])

  // ── 2. Temps passé : mesuré seulement sur les fiches produit ──
  useEffect(() => {
    if (pageType !== 'product_detail' || !productId) return

    const startedAt = Date.now()
    let sent = false

    const flush = () => {
      if (sent) return
      const vid = viewIdRef.current
      if (!vid) return
      const durationMs = Date.now() - startedAt
      if (durationMs < 1000) return          // ignore les passages < 1 s
      sent = true
      post('/analytics/duration/', { client_view_id: vid, duration_ms: durationMs }, { keepalive: true })
    }

    // onglet masqué (mobile : bascule d'app, verrouillage) → moment le plus fiable
    const onVisibility = () => { if (document.visibilityState === 'hidden') flush() }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', flush)

    // navigation interne (SPA) → démontage du composant : on flush aussi
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [pageType, productId])
}