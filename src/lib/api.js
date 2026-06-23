// src/lib/api.js — GROSHOP.tn
// Point central pour tous les appels API Django
// Auth via cookies httpOnly (access_token / refresh_token) + CSRF

const BASE_URL = 'http://localhost:8000/api'

// ── Helpers ───────────────────────────────────────────────────────

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

async function request(endpoint, options = {}, _retried = false) {
  const csrfToken = getCookie('csrftoken')

  const headers = {
    'Content-Type': 'application/json',
    ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
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
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || error.detail || 'Erreur serveur')
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
   async recommendations(id) {              // ← AJOUTE ÇA
    return request(`/products/${id}/recommendations/`)
  },
  async categories() {
    return request('/products/categories/')
  },
}

// ── Suppliers ─────────────────────────────────────────────────────

export const suppliers = {

  async profile(slug) {
    return request(`/auth/suppliers/${slug}/`)
  },

  async products(slug, params = {}) {
    const query = new URLSearchParams(params).toString()
    return request(`/auth/suppliers/${slug}/products/?${query}`)
  },
}

// ── Orders ────────────────────────────────────────────────────────

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
}

// ── Messaging ─────────────────────────────────────────────────────

export const messaging = {

  async conversations() {
    return request('/messaging/')
  },

  async conversation(id) {
    return request(`/messaging/${id}/`)
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

// ── Notifications ─────────────────────────────────────────────────

export const notifications = {

  async list(unreadOnly = false) {
    return request(`/notifications/?unread=${unreadOnly}`)
  },

  async markRead(id) {
    return request(`/notifications/${id}/read/`, { method: 'POST' })
  },

  async markAllRead() {
    return request('/notifications/read-all/', { method: 'POST' })
  },
}

// ── Store (recherche, etc.) ───────────────────────────────────────

export const store = {
  async recentSearches() {
    return request('/store/recent-searches/')
  },
  async clearRecentSearches() {
    return request('/store/recent-searches/clear/', { method: 'POST' })
  },
}