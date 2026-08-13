// src/lib/api.js — GROSHOP.tn
// Point central pour tous les appels API Django
// Auth via cookies httpOnly (access_token / refresh_token) + CSRF

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`

// ── Helpers ───────────────────────────────────────────────────────

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// ── Langue (FR / EN / AR) ──────────────────────────────────────────
const VALID_LANGS = ['fr', 'en', 'ar']

export function getLanguage() {
  const stored = localStorage.getItem('groshop_lang')
  return VALID_LANGS.includes(stored) ? stored : 'fr'
}

// ⭐ async + retourne la promesse : l'appelant (ex: LanguageDropdown.handleSave)
// peut l'attendre avant de recharger la page, pour garantir que le PATCH
// /auth/language/ part bien avant que window.location.reload() ne coupe tout.
// N'échoue jamais bruyamment : si non connecté (401) ou hors-ligne, on
// continue quand même (le local reste la source de vérité côté client).
export async function setLanguage(lang) {
  if (!VALID_LANGS.includes(lang)) return
  localStorage.setItem('groshop_lang', lang)
  products.categoriesInvalidate()
  document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = lang

  try {
    await request('/auth/language/', {
      method: 'PATCH',
      body: JSON.stringify({ language: lang }),
    })
  } catch {
    // silencieux : non connecté ou hors-ligne, pas bloquant
  }
}

async function request(endpoint, options = {}, _retried = false) {
  const csrfToken = getCookie('csrftoken')

  const headers = {
    'Content-Type': 'application/json',
    ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
    'X-Lang': getLanguage(),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',  // ← envoie/reçoit les cookies httpOnly
  })

  // Access token expiré → tente un refresh une seule fois
  if (response.status === 401 && !_retried && endpoint !== '/auth/refresh/' && endpoint !== '/auth/login/') {
    const refreshed = await refreshToken()
    if (refreshed) {
      return request(endpoint, options, true)
    }
    // Refresh échoué → session vraiment expirée
    return null
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    // On garde le message lisible ET on attache le corps + le statut,
    // pour que l'appelant puisse détecter des codes métier (ex: phone_required).
    const err = new Error(data.error || data.detail || data.message || 'Erreur serveur')
    err.status = response.status
    err.data = data
    throw err
  }

  // Réponses sans body (ex: certains 204)
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

async function refreshToken() {
  try {
    const csrfToken = getCookie('csrftoken')
    const response = await fetch(`${BASE_URL}/auth/refresh/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
      },
    })
    return response.ok
  } catch {
    return false
  }
}

// ── Upload fichier (multipart) ────────────────────────────────────
export async function uploadFile(endpoint, file, _retried = false) {
  const csrfToken = getCookie('csrftoken')
  const fd = new FormData()
  fd.append('file', file)

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: { ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}) },
    body: fd,
  })

  if (res.status === 401 && !_retried) {
    const ok = await refreshToken()
    if (ok) return uploadFile(endpoint, file, true)
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const err = new Error(data.error || data.detail || 'Upload échoué')
    err.status = res.status
    err.data = data
    throw err
  }
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────

export const auth = {

  async registerBuyer(data) {
    return request('/auth/register/buyer/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async registerSupplier(data) {
    return request('/auth/register/supplier/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async login(email, password) {
    return request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async googleOneTap(credential) {
    return request('/auth/google/', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    })
  },

  // ── Facebook (flux SDK client) : envoie l'access_token, reçoit { user } ──
  async facebookToken(accessToken) {
    return request('/auth/facebook/token/', {
      method: 'POST',
      body: JSON.stringify({ access_token: accessToken }),
    })
  },

  // ── Vérification téléphone (OTP SMS) ──
  async requestPhoneOtp(phone) {
    return request('/auth/phone/request-otp/', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    })
  },

  async verifyPhoneOtp(code) {
    return request('/auth/phone/verify-otp/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  },

  async supplierMe() {
    return request('/auth/supplier/me/')
  },

  async logout() {
    return request('/auth/logout/', { method: 'POST' })
  },

  async me() {
    return request('/auth/me/')
  },
}

// ── Products ──────────────────────────────────────────────────────

let _productsCategoriesCache   = null
let _productsCategoriesPromise = null

export const products = {

  async list(params = {}) {
    const query = new URLSearchParams(params).toString()
    return request(`/products/?${query}`)
  },
  async recommended() {
    return request('/products/recommended/')
  },
  async trending() {
    return request('/products/trending/')
  },
  async detail(id) {
    return request(`/products/${id}/`)
  },
  async suggestions(query) {
    return request(`/products/suggestions/?q=${encodeURIComponent(query)}`)
  },
  async search(query, params = {}) {
    const q = new URLSearchParams({ q: query, ...params }).toString()
    return request(`/products/search/?${q}`)
  },
  async similar(id) {
    return request(`/products/${id}/similar/`)
  },
  async reviews(id) {
    return request(`/products/${id}/reviews/`)
  },
  async recommendations(id) {
    return request(`/products/${id}/recommendations/`)
  },
  async categoriesForYou() {
    return request('/products/categories/for-you/')
  },
  async categories() {
    if (_productsCategoriesCache)   return _productsCategoriesCache
    if (_productsCategoriesPromise) return _productsCategoriesPromise

    _productsCategoriesPromise = request('/products/categories/')
      .then(data => {
        _productsCategoriesCache   = data
        _productsCategoriesPromise = null
        return data
      })
      .catch(err => {
        _productsCategoriesPromise = null
        throw err
      })

    return _productsCategoriesPromise
  },
  categoryBanner: (q) =>
    request(`/products/category-banner/?q=${encodeURIComponent(q)}`),
  categoriesCached() {
    return _productsCategoriesCache
  },
  categoriesInvalidate() {
    _productsCategoriesCache   = null
    _productsCategoriesPromise = null
  },
  async autocomplete(query) {
    return request(`/products/autocomplete/?q=${encodeURIComponent(query)}`)
  },
  async create(data) {
    return request('/products/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async update(id, data) {
    return request(`/products/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
  async mine(params = {}) {
    const q = new URLSearchParams(params).toString()
    return request(`/products/mine/${q ? '?' + q : ''}`)
  },
  createReview: (data) => request('/products/reviews/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  async favorites() {
    return request('/products/favorites/')
  },
  async addFavorite(id) {
    return request('/products/favorites/', {
      method: 'POST',
      body: JSON.stringify({ product_id: id }),
    })
  },
  async removeFavorite(id) {
    return request(`/products/favorites/${id}/`, { method: 'DELETE' })
  },
}

export const subscriptions = {
  plans:      ()       => request('/store/subscriptions/plans/'),
  mine:       ()       => request('/store/subscriptions/me/'),
  changePlan: (planId) => request('/store/subscriptions/change/', {
    method: 'POST',
    body: JSON.stringify({ plan_id: planId }),
  }),
}

export const cart = {

  async list() {
    return request('/cart/')
  },

  async add(productId, quantity = 1, variantId = null) {
    return request('/cart/', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity,
        variant_id: variantId,
      }),
    })
  },

  async updateQty(itemId, quantity) {
    return request(`/cart/${itemId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    })
  },

  async remove(itemId) {
    return request(`/cart/${itemId}/`, { method: 'DELETE' })
  },

  async clear() {
    return request('/cart/clear/', { method: 'DELETE' })
  },

  async count() {
    return request('/cart/count/')
  },
}

export const suppliers = {

  async profile(slug) {
    return request(`/auth/suppliers/${slug}/`)
  },

  async products(slug, params = {}) {
    const query = new URLSearchParams(params).toString()
    return request(`/auth/suppliers/${slug}/products/?${query}`)
  },

  async myShop() {
    return request('/auth/supplier/me/')
  },

  async updateStore(data) {
    return request('/auth/supplier/store/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async uploadStoreImage(file) {
    return uploadFile('/auth/supplier/store/upload/', file)
  },
}

export const orders = {

  async list() {
    return request('/orders/')
  },

  async detail(id) {
    return request(`/orders/${id}/`)
  },

  async create(data) {
    return request('/orders/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async cancel(id) {
    return request(`/orders/${id}/cancel/`, {
      method: 'POST',
    })
  },

  toReview: () => request('/orders/to-review/'),

  async supplier(params = {}) {
    const q = new URLSearchParams(params).toString()
    return request(`/orders/supplier/${q ? '?' + q : ''}`)
  },

  async updateSubOrderStatus(id, status, extra = {}) {
    return request(`/orders/supplier/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...extra }),
    })
  },
}

export const analytics = {
  async supplierStats() { return request('/analytics/supplier/stats/') },
  async activeUsers()   { return request('/analytics/supplier/active-users/') },
  async regions()       { return request('/analytics/supplier/regions/') },
}

export const messaging = {

  async conversations() {
    return request('/messaging/')
  },

  async conversation(id) {
    return request(`/messaging/${id}/`)
  },

  async poll(id, { after = null, markRead = true } = {}) {
    const q = new URLSearchParams()
    if (after) q.set('after', after)
    q.set('mark_read', markRead ? '1' : '0')
    return request(`/messaging/${id}/poll/?${q.toString()}`)
  },

  async unreadCount() {
    return request('/messaging/unread-count/')
  },

  async startConversation(supplierSlug, productId = null) {
    return request(`/messaging/start/${supplierSlug}/`, {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    })
  },

  async sendMessage(conversationId, content, attachmentUrl = '') {
    return request(`/messaging/${conversationId}/send/`, {
      method: 'POST',
      body: JSON.stringify({ content, attachment_url: attachmentUrl }),
    })
  },
}

export const notifications = {
  registerToken: (token, platform = 'web') =>
    request('/notifications/register/', { method: 'POST', body: JSON.stringify({ token, platform }) }),
  unregister: (token) =>
    request('/notifications/unregister/', { method: 'POST', body: JSON.stringify({ token }) }),
}

export const delivery = {
  carriers:            ()         => request('/delivery/carriers/'),

  carrierConfigs:      ()         => request('/delivery/carrier-configs/'),
  createCarrierConfig: (data)     => request('/delivery/carrier-configs/', { method: 'POST', body: JSON.stringify(data) }),
  updateCarrierConfig: (id, data) => request(`/delivery/carrier-configs/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  removeCarrierConfig: (id)       => request(`/delivery/carrier-configs/${id}/`, { method: 'DELETE' }),

  shipments:           ()         => request('/delivery/shipments/'),
  shipment:            (id)       => request(`/delivery/shipments/${id}/`),
  createShipment:      (data)     => request('/delivery/shipments/', { method: 'POST', body: JSON.stringify(data) }),
  refreshShipment:     (id)       => request(`/delivery/shipments/${id}/refresh/`, { method: 'POST' }),
}

export const store = {
  async recentSearches() {
    return request('/store/recent-searches/')
  },
  async clearRecentSearches() {
    return request('/store/recent-searches/clear/', { method: 'POST' })
  },
  plans: () => request('/store/plans/'),
}

export const addresses = {
  list:       ()          => request('/auth/addresses/'),
  create:     (data)      => request('/auth/addresses/', { method: 'POST', body: JSON.stringify(data) }),
  update:     (id, data)  => request(`/auth/addresses/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove:     (id)        => request(`/auth/addresses/${id}/`, { method: 'DELETE' }),
  setDefault: (id)        => request(`/auth/addresses/${id}/default/`, { method: 'POST' }),
}