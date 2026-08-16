// src/context/CartContext.jsx — GROSHOP.tn
// Panier universel : marche pour invités (cookie gs_guest_id posé par
// le middleware Django) ET pour utilisateurs connectés. Fusion auto
// au login via cartApi.merge().

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { cart as cartApi } from '../lib/api'
import { useAuth } from './AuthContext'

const CartContext = createContext({})

function recomputePrice(item, qty) {
  const p     = item.product || {}
  const tiers = p.price_tiers || []
  let unit    = parseFloat(p.base_price_tnd) || 0

  if (tiers.length) {
    let best = tiers.find(t => {
      const min = Number(t.min_qty)
      const max = t.max_qty != null ? Number(t.max_qty) : null
      return qty >= min && (max == null || qty <= max)
    })
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

  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding]   = useState(null)
  const debouncers = useRef({})
  const prevUserRef = useRef(undefined)  // undefined = pas encore initialisé

  /* ── Chargement — marche invité ET connecté ── */
  const refresh = useCallback(async () => {
    // Suppliers n'ont pas de panier acheteur
    if (user?.role === 'supplier') { setItems([]); return }
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

  /* ── Fusion auto au login ──
     Détecte la transition "invité → connecté" et fusionne le panier
     invité dans celui de l'user avant de rafraîchir. */
  useEffect(() => {
    const prev = prevUserRef.current
    const wasGuest = prev === null
    const isLoggedInBuyer = user && user.role !== 'supplier'

    if (prev !== undefined && wasGuest && isLoggedInBuyer) {
      // Transition invité → connecté : merge puis refresh
      cartApi.merge()
        .catch(e => console.error('Merge panier :', e.message))
        .finally(() => refresh())
    } else {
      // Chargement normal (au montage, ou changement d'user)
      refresh()
    }
    prevUserRef.current = user || null
  }, [user, refresh])

  useEffect(() => () => {
    Object.values(debouncers.current).forEach(clearTimeout)
  }, [])

  const count    = items.length
  const totalQty = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)
  const total    = items.reduce((s, i) => s + (parseFloat(i.total_price_tnd) || 0), 0)

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

  /* ── Ajouter : marche invité OU connecté ──
     Plus de redirect vers /login : le backend accepte l'invité via
     le cookie gs_guest_id posé par le middleware Django. */
  const add = useCallback(async (productId, quantity = 1, variantId = null) => {
    if (user?.role === 'supplier') {
      return { ok: false, reason: 'supplier' }
    }
    setAdding(productId)
    try {
      const res = await cartApi.add(productId, quantity, variantId)
      await refresh()
      return { ok: true, item: res }
    } catch (e) {
      return { ok: false, reason: 'error', message: e.message }
    } finally {
      setAdding(null)
    }
  }, [user, refresh])

  const setQty = useCallback((itemId, qty) => {
    if (qty < 1) { remove(itemId); return }
    setItems(prev => prev.map(i => i.id === itemId ? recomputePrice(i, qty) : i))
    clearTimeout(debouncers.current[itemId])
    debouncers.current[itemId] = setTimeout(async () => {
      try {
        const updated = await cartApi.updateQty(itemId, qty)
        if (!updated) return
        setItems(prev => prev.map(i => {
          if (i.id !== itemId) return i
          if (Number(i.quantity) !== qty) return i
          return updated
        }))
      } catch (e) {
        console.error('Panier :', e.message)
        refresh()
      }
    }, 400)
  }, [remove, refresh])

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