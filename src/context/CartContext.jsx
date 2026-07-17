// src/context/CartContext.jsx — GROSHOP.tn
// État central du panier : items, badge, ajout/suppression.
// Quantité : mise à jour locale instantanée (recalcul des paliers) + appel API débounced.
// Non connecté → redirection vers /login avec retour automatique.

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cart as cartApi } from '../lib/api'
import { useAuth } from './AuthContext'

const CartContext = createContext({})

/* ── Recalcule le prix unitaire selon les paliers (comme le backend) ──
   Permet un feedback instantané sans attendre la réponse serveur.       */
function recomputePrice(item, qty) {
  const p     = item.product || {}
  const tiers = p.price_tiers || []
  let unit    = parseFloat(p.base_price_tnd) || 0

  if (tiers.length) {
    // 1. Palier exact : min_qty <= qty <= max_qty
    let best = tiers.find(t => {
      const min = Number(t.min_qty)
      const max = t.max_qty != null ? Number(t.max_qty) : null
      return qty >= min && (max == null || qty <= max)
    })
    // 2. Sinon : le plus grand min_qty applicable
    if (!best) {
      for (const t of tiers) {
        const min = Number(t.min_qty)
        if (min <= qty && (!best || min > Number(best.min_qty))) best = t
      }
    }
    if (best) unit = parseFloat(best.price_tnd) || unit
  }

  return {
    ...item,
    quantity:        qty,
    unit_price_tnd:  unit.toFixed(3),
    total_price_tnd: (unit * qty).toFixed(3),
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding]   = useState(null)   // id du produit en cours d'ajout
  const debouncers = useRef({})

  /* ── Chargement ── */
  const refresh = useCallback(async () => {
    if (!user || user.role === 'supplier') { setItems([]); return }
    setLoading(true)
    try {
      const data = await cartApi.list()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Panier :', e.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  // Nettoie les timers au démontage
  useEffect(() => () => {
    Object.values(debouncers.current).forEach(clearTimeout)
  }, [])

  /* ── Dérivés ── */
  const count    = items.length
  const totalQty = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)
  const total    = items.reduce((s, i) => s + (parseFloat(i.total_price_tnd) || 0), 0)

  /* ── Supprimer (optimiste) ── */
  const remove = useCallback(async (itemId) => {
    clearTimeout(debouncers.current[itemId])
    delete debouncers.current[itemId]

    let backup
    setItems(prev => { backup = prev; return prev.filter(i => i.id !== itemId) })
    try {
      await cartApi.remove(itemId)
    } catch (e) {
      setItems(backup)
      console.error('Panier :', e.message)
    }
  }, [])

  /* ── Ajouter ── */
  const add = useCallback(async (productId, quantity = 1, variantId = null) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search } })
      return { ok: false, reason: 'auth' }
    }
    setAdding(productId)
    try {
      const res = await cartApi.add(productId, quantity, variantId)
      if (res === null) {                 // session expirée
        navigate('/login', { state: { from: location.pathname } })
        return { ok: false, reason: 'auth' }
      }
      await refresh()
      return { ok: true, item: res }
    } catch (e) {
      return { ok: false, reason: 'error', message: e.message }
    } finally {
      setAdding(null)
    }
  }, [user, navigate, location, refresh])

  /* ── Quantité : local instantané + API débouncée (400 ms) ── */
  const setQty = useCallback((itemId, qty) => {
    if (qty < 1) { remove(itemId); return }

    // 1. UI immédiate + prix recalculé selon les paliers
    setItems(prev => prev.map(i => i.id === itemId ? recomputePrice(i, qty) : i))

    // 2. Backend débouncé — évite 1 requête par clic sur +
    clearTimeout(debouncers.current[itemId])
    debouncers.current[itemId] = setTimeout(async () => {
      try {
        const updated = await cartApi.updateQty(itemId, qty)
        if (!updated) return
        setItems(prev => prev.map(i => {
          if (i.id !== itemId) return i
          // l'utilisateur a re-cliqué entre-temps → on garde le local
          if (Number(i.quantity) !== qty) return i
          return updated
        }))
      } catch (e) {
        console.error('Panier :', e.message)
        refresh()   // état réconcilié depuis le serveur
      }
    }, 400)
  }, [remove, refresh])

  /* ── Vider ── */
  const clear = useCallback(async () => {
    let backup
    setItems(prev => { backup = prev; return [] })
    try {
      await cartApi.clear()
    } catch (e) {
      setItems(backup)
      console.error('Panier :', e.message)
    }
  }, [])

  return (
    <CartContext.Provider value={{
      items, count, totalQty, total, loading, adding,
      add, setQty, remove, clear, refresh,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)