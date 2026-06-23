import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { auth } from '../lib/api'
import { Spinner } from './_shared'

import { C } from './auth/_shared/constants'
import AuthLeftPanel from './auth/_shared/AuthLeftPanel'
import AuthStyles from './auth/_shared/AuthStyles'
import SimpleInput from './auth/_shared/SimpleInput'
import PasswordStrength from './auth/_shared/PasswordStrength'

function mapResetError(msg) {
  const m = (msg || '').toLowerCase()
  if (m.includes('token') && (m.includes('invalid') || m.includes('expired') || m.includes('expir')))
    return 'Ce lien a expiré ou n\'est plus valide. Demandez un nouveau lien depuis la page de connexion.'
  if (m.includes('password') || m.includes('mot de passe'))
    return 'Mot de passe invalide. Utilisez au moins 8 caractères.'
  if (m.includes('too many') || m.includes('throttled') || m.includes('limit'))
    return 'Trop de tentatives. Réessayez dans quelques minutes.'
  return msg || 'Une erreur est survenue. Réessayez.'
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [success,  setSuccess]  = useState(false)

  // Si pas de token dans l'URL → on redirige vers login
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [token, navigate])

  function validate() {
    if (password.length < 8) return 'Le mot de passe doit comporter au moins 8 caractères.'
    if (password !== confirm) return 'Les deux mots de passe ne correspondent pas.'
    return null
  }

  async function handleReset(e) {
    e.preventDefault()
    setError('')

    const vErr = validate()
    if (vErr) { setError(vErr); return }

    setLoading(true)
    try {
      const { error: err } = await auth.confirmPasswordReset({ token, password })
      if (err) { setError(mapResetError(err.message || '')); return }
      setSuccess(true)
      // Redirection après 2 secondes pour laisser lire le message
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err) {
      setError(mapResetError(err.message || ''))
    } finally {
      setLoading(false)
    }
  }

  if (!token) return null

  return (
    <>
      <AuthStyles />

      <div style={{ minHeight: '100vh', display: 'flex', background: '#f0f4f8', position: 'relative' }}>

        <AuthLeftPanel />

        {/* ── PANNEAU DROIT ── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#fff', position: 'relative',
          overflowY: 'auto',
          padding: '40px 24px',
          minHeight: '100vh',
        }}>
          <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>

            {success ? (
              <>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                <h1 style={{
                  fontSize: 26, fontWeight: 800, color: '#111827',
                  margin: '0 0 8px', letterSpacing: '-0.01em',
                }}>
                  Mot de passe modifié !
                </h1>
                <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 24px', lineHeight: 1.5 }}>
                  Votre mot de passe a été réinitialisé avec succès.<br />
                  Redirection vers la connexion...
                </p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  color: C.primary, fontSize: 13, fontWeight: 600,
                }}>
                  <Spinner /> Redirection en cours
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🔐</div>
                <h1 style={{
                  fontSize: 26, fontWeight: 800, color: '#111827',
                  margin: '0 0 8px', letterSpacing: '-0.01em',
                }}>
                  Nouveau mot de passe
                </h1>
                <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 24px', fontWeight: 400 }}>
                  Choisissez un mot de passe solide pour sécuriser votre compte.
                </p>

                {error && (
                  <div style={{
                    background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                    color: C.primaryText, borderRadius: 10, padding: '10px 14px',
                    marginBottom: 14, fontSize: 13, textAlign: 'left',
                  }}>⚠️ {error}</div>
                )}

                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <SimpleInput
                      type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Nouveau mot de passe"
                      height={52}
                      rightSlot={
                        <button type="button" onClick={() => setShowPass(v => !v)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, padding: 8, color: '#9ca3af' }}>
                          {showPass ? '🙈' : '👁️'}
                        </button>
                      }
                    />
                    <PasswordStrength password={password} />
                  </div>

                  <SimpleInput
                    type={showPass ? 'text' : 'password'} value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Confirmez le mot de passe"
                    height={52}
                  />

                  {confirm && password !== confirm && (
                    <p style={{ fontSize: 12, color: '#ef4444', margin: 0, textAlign: 'left' }}>
                      Les mots de passe ne correspondent pas
                    </p>
                  )}

                  <button type="submit" disabled={loading} className="btn-primary"
                    style={{
                      width: '100%', color: '#fff', fontWeight: 700, fontSize: 16,
                      padding: '16px 0', borderRadius: 999, border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      background: loading ? '#d1d5db' : C.primary,
                      boxShadow: loading ? 'none' : C.glow,
                      marginTop: 8,
                    }}>
                    {loading ? <Spinner /> : 'Réinitialiser mon mot de passe'}
                  </button>
                </form>

                <p style={{ fontSize: 13, color: '#6b7280', margin: '20px 0 0' }}>
                  <button onClick={() => navigate('/login')} className="link-hover"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#111827', fontWeight: 600, fontSize: 13,
                      textDecoration: 'underline', textUnderlineOffset: 3, padding: 0,
                    }}>
                    ← Retour à la connexion
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}