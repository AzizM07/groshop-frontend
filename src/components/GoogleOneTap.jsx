// src/components/GoogleOneTap.jsx — GROSHOP.tn
// Affiche la popup Google One Tap si l'utilisateur n'est pas connecté

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth as authApi } from '../lib/api'

const GOOGLE_CLIENT_ID = '714757960599-8s72nke0b78nstg5qqcd69qqgesgheb1.apps.googleusercontent.com'

export default function GoogleOneTap() {
  const { user, loading, setUser } = useAuth()
  const navigate = useNavigate()
  const initialized = useRef(false)

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
    console.log('2. Réponse backend:', data)
    console.log('3. setUser existe ?', typeof setUser)
    setUser(data.user)
    console.log('4. setUser appelé avec:', data.user)

        if (data.user.role === 'supplier') {
          navigate('/dashboard')
        }
        // sinon (buyer) → reste sur la page actuelle
      } catch (err) {
        console.error('Erreur Google One Tap:', err)
      }
    }
  }, [loading, user])

  return null
}