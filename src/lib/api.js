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
  // Chemins finaux : /api/auth/phone/request-otp/ et /api/auth/phone/verify-otp/
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

// Cache module-level pour /products/categories/ — évite les fetchs doublés
// entre Header (mega menu) et PopularCategories (homepage). Les appels
// concurrents partagent la même Promise en flight, les appels ultérieurs
// retournent directement les données mises en cache.
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
        _productsCategoriesPromise = null   // permet de re-tenter au prochain appel
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
  async mine(params = {}) {
    const q = new URLSearchParams(params).toString()
    return request(`/products/mine/${q ? '?' + q : ''}`)
  },
  createReview: (data) => request('/products/reviews/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // ── Favoris ──
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

// ── Cart ──────────────────────────────────────────────────────────

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

// ── Suppliers ─────────────────────────────────────────────────────

export const suppliers = {

  // ── Public (vitrine d'un fournisseur) ──
  async profile(slug) {
    return request(`/auth/suppliers/${slug}/`)
  },

  async products(slug, params = {}) {
    const query = new URLSearchParams(params).toString()
    return request(`/auth/suppliers/${slug}/products/?${query}`)
  },

  // ── Fournisseur connecté (édition de SA vitrine) ──
  // GET  ma vitrine (profil + store imbriqué)
  async myShop() {
    return request('/auth/supplier/me/')
  },

  // PATCH un ou plusieurs champs de la vitrine (partial)
  async updateStore(data) {
    return request('/auth/supplier/store/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // Upload d'une image de vitrine → renvoie { url } (WebP optimisé)
  async uploadStoreImage(file) {
    return uploadFile('/auth/supplier/store/upload/', file)
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

  toReview: () => request('/orders/to-review/'),

  // ── Espace fournisseur ──
  async supplier(params = {}) {
    const q = new URLSearchParams(params).toString()
    return request(`/orders/supplier/${q ? '?' + q : ''}`)
  },

  async updateSubOrderStatus(id, status) {
    return request(`/orders/supplier/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
}

// ── Analytics ─────────────────────────────────────────────────────

export const analytics = {
  async supplierStats() { return request('/analytics/supplier/stats/') },
  async activeUsers()   { return request('/analytics/supplier/active-users/') },
  async regions()       { return request('/analytics/supplier/regions/') },
}

// ── Messaging ─────────────────────────────────────────────────────

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

// ── Notifications ─────────────────────────────────────────────────
export const notifications = {
  registerToken: (token, platform = 'web') =>
    request('/notifications/register/', { method: 'POST', body: JSON.stringify({ token, platform }) }),
  unregister: (token) =>
    request('/notifications/unregister/', { method: 'POST', body: JSON.stringify({ token }) }),
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

// ── Adresses (carnet acheteur) ────────────────────────────────────
// ⚠️ Chemins SANS '/api' en tête : request() préfixe déjà BASE_URL (…/api).
//    Les vues adresses vivent dans users/urls.py, monté sous /api/auth/.
export const addresses = {
  list:       ()          => request('/auth/addresses/'),
  create:     (data)      => request('/auth/addresses/', { method: 'POST', body: JSON.stringify(data) }),
  update:     (id, data)  => request(`/auth/addresses/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove:     (id)        => request(`/auth/addresses/${id}/`, { method: 'DELETE' }),
  setDefault: (id)        => request(`/auth/addresses/${id}/default/`, { method: 'POST' }),
}