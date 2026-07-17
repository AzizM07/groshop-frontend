// src/context/AuthContext.jsx — GROSHOP.tn

import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/api'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null)
  const [supplier, setSupplier] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    _loadSession()
  }, [])

  // ── Sync entre onglets ──
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    const bc = new BroadcastChannel('gs_auth')
    bc.onmessage = (e) => {
      if (e.data === 'logout') { setUser(null); setSupplier(null) }
      if (e.data === 'login')  { _loadSession() }
    }
    return () => bc.close()
  }, [])

  // ── Revalide quand l'onglet redevient actif ──
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') _loadSession()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  async function _loadSession() {
    try {
      const data = await auth.me()
      if (data) {
        setUser(data)
        if (data.role === 'supplier') {
          await _loadSupplierProfile()
        } else {
          setSupplier(null)
        }
      } else {
        setUser(null)
        setSupplier(null)
      }
    } catch {
      setUser(null)
      setSupplier(null)
    } finally {
      setLoading(false)
    }
  }

  async function _loadSupplierProfile() {
    try {
      const profile = await auth.supplierMe()
      setSupplier(profile)
    } catch (err) {
      console.error('Erreur chargement profil fournisseur:', err)
      setSupplier(null)
    }
  }

  async function signIn(email, password) {
    try {
      const data = await auth.login(email, password)
      setUser(data.user)
      if (data.user.role === 'supplier') {
        await _loadSupplierProfile()
      } else {
        setSupplier(null)
      }
      // Notifie les autres onglets
      try { new BroadcastChannel('gs_auth').postMessage('login') } catch {}
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async function signOut() {
    try {
      await auth.logout()
    } catch {}
    setUser(null)
    setSupplier(null)
    // Notifie les autres onglets
    try { new BroadcastChannel('gs_auth').postMessage('logout') } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, supplier, loading, signIn, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)