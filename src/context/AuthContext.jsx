// src/context/AuthContext.jsx — GROSHOP.tn
// Auth via Django (cookies httpOnly) — remplace Supabase Auth

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

  // ── Vérifie si une session existe déjà (cookies httpOnly) ──
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

  // ── Charge le SupplierProfile complet (store, stats, slug...) ──
  async function _loadSupplierProfile() {
    try {
      const profile = await auth.supplierMe()
      setSupplier(profile)
    } catch (err) {
      console.error('Erreur chargement profil fournisseur:', err)
      setSupplier(null)
    }
  }

  // ── Connexion — garde la signature {data, error} comme avant ──
  async function signIn(email, password) {
    try {
      const data = await auth.login(email, password)
      setUser(data.user)
      if (data.user.role === 'supplier') {
        await _loadSupplierProfile()
      } else {
        setSupplier(null)
      }
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async function signOut() {
    try {
      await auth.logout()
    } catch {
      // on déconnecte côté front même si la requête échoue
    }
    setUser(null)
    setSupplier(null)
  }

  return (
    <AuthContext.Provider value={{ user, supplier, loading, signIn, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)