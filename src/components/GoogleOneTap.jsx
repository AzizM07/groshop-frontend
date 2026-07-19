// src/components/GoogleOneTap.jsx — GROSHOP.tn
// Affiche la popup Google One Tap si l'utilisateur n'est pas connecté.

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth as authApi } from '../lib/api'

const GOOGLE_CLIENT_ID = '714757960599-8s72nke0b78nstg5qqcd69qqgesgheb1.apps.googleusercontent.com'

export default function GoogleOneTap() {
  const { user, loading, setUser } = useAuth()
  const navigate = useNavigate()
  const initialized = useRef(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Attend que l'auth context ait fini de vérifier la session existante
    if (loading || user || initialized.current) return
    if (!window.google?.accounts?.id) return

    initialized.current = true

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    window.google.accounts.id.prompt()

    async function handleCredentialResponse(response) {
      try {
        const data = await authApi.googleOneTap(response.credential)

        // request() renvoie null sur 401 (il ne throw pas) → on garde contre le crash
        if (!data || !data.user) {
          console.error('Connexion Google refusée par le serveur')
          setError('La connexion Google a échoué. Réessayez.')
          initialized.current = false   // autorise une nouvelle tentative
          return
        }

        setUser(data.user)

        if (data.user.role === 'supplier') {
          navigate('/dashboard')
        }
        // sinon (buyer) → reste sur la page actuelle
      } catch (err) {
        console.error('Erreur Google One Tap:', err)
        setError('Une erreur est survenue. Réessayez.')
        initialized.current = false
      }
    }
  }, [loading, user])   // eslint-disable-line react-hooks/exhaustive-deps

  // Petit bandeau d'erreur discret (optionnel — retire ce bloc si tu ne le veux pas)
  if (error) {
    return (
      <div style={{
        position: 'fixed', top: 16, right: 16, zIndex: 3000,
        background: '#FEF2F2', color: '#B91C1C',
        border: '1px solid #FCA5A5', borderRadius: 10,
        padding: '10px 14px', fontSize: 13, fontWeight: 500,
        boxShadow: '0 4px 16px rgba(0,0,0,.1)',
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}>
        {error}
      </div>
    )
  }

  return null
}