// src/hooks/usePageTracking.js — GROSHOP.tn
// Fire-and-forget : n'échoue jamais bruyamment, ne bloque jamais l'UI.

import { useEffect } from 'react'

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
    if (host.includes(window.location.hostname)) return 'direct'   // navigation interne
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

/**
 * @param {'home'|'catalogue'|'search'|'product_detail'|'supplier_shop'} pageType
 * @param {string|null} supplierId  UUID du fournisseur (si la page le concerne)
 * @param {string|null} productId   UUID du produit (page détail)
 */
export function usePageTracking({ pageType, supplierId = null, productId = null }) {
  useEffect(() => {
    // n'envoie rien tant que les IDs attendus ne sont pas chargés
    if (pageType === 'product_detail' && !productId) return
    if (pageType === 'supplier_shop' && !supplierId) return

    const params = new URLSearchParams(window.location.search)
    const csrf   = getCookie('csrftoken')

    fetch(`${BASE_URL}/analytics/pageview/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrf ? { 'X-CSRFToken': csrf } : {}),
      },
      body: JSON.stringify({
        page_type:    pageType,
        supplier:     supplierId,
        product:      productId,
        session_id:   getSessionId(),
        channel:      detectChannel(),
        device_type:  detectDevice(),
        utm_source:   params.get('utm_source')   || '',
        utm_medium:   params.get('utm_medium')   || '',
        utm_campaign: params.get('utm_campaign') || '',
        referrer:     document.referrer || '',
      }),
    }).catch(() => {})
  }, [pageType, supplierId, productId])
}