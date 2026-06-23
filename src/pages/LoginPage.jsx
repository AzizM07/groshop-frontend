import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner, Modal } from './_shared'

import { C } from './../pages/auth/_shared/constants'
import AuthLeftPanel from './../pages/auth/_shared/AuthLeftPanel'
import AuthStyles from './../pages/auth/_shared/AuthStyles'
import SimpleInput from './../pages/auth/_shared/SimpleInput'
import SocialButtons from './../pages/auth/_shared/SocialButtons'

function mapAuthError(msg) {
  if (msg.includes('incorrect'))    return 'Email ou mot de passe incorrect.'
  if (msg.includes('désactivé'))    return 'Compte désactivé. Contactez le support.'
  if (msg.includes('obligatoires')) return 'Email et mot de passe obligatoires.'
  if (msg.includes('Too many') || msg.includes('throttled') || msg.includes('limit'))
    return 'Trop de tentatives. Réessayez dans quelques minutes.'
  return msg || 'Une erreur est survenue. Réessayez.'
}

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()

  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  const [showForgot,    setShowForgot]    = useState(false)
  const [forgotEmail,   setForgotEmail]   = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState('')

  async function handleLogin(e) {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const { data, error: err } = await signIn(email, password)
      if (err) { setError(mapAuthError(err.message || '')); return }
      navigate(data.user.role === 'supplier' ? '/supplier' : '/')
    } catch (err) {
      setError(mapAuthError(err.message || ''))
    } finally {
      setLoading(false)
    }
  }

  async function handleForgot(e) {
    e.preventDefault(); setForgotLoading(true); setForgotSuccess('')
    try {
      setForgotSuccess('Cette fonctionnalité sera bientôt disponible. Contactez le support si besoin.')
    } finally {
      setForgotLoading(false)
    }
  }

  function handleSocialSignIn(provider) {
    alert(`${provider} Sign-In : à brancher`)
  }

  return (
    <>
      <AuthStyles />

      <div style={{ minHeight: '100vh', display: 'flex', background: '#f0f4f8', position: 'relative' }}>

        <AuthLeftPanel />

        {/* ── PANNEAU DROIT — Login ── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#fff', position: 'relative',
          overflowY: 'auto',
          padding: '40px 24px',
          minHeight: '100vh',
        }}>
          <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>

            <h1 style={{
              fontSize: 28, fontWeight: 800, color: '#111827',
              margin: '0 0 28px', letterSpacing: '-0.01em',
            }}>
              Se connecter
            </h1>

            {error && (
              <div style={{
                background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                color: C.primaryText, borderRadius: 10, padding: '10px 14px',
                marginBottom: 14, fontSize: 13, textAlign: 'left',
              }}>⚠️ {error}</div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SimpleInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" height={52} />
              <SimpleInput
                type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" height={52}
                rightSlot={
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, padding: 8, color: '#9ca3af' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                }
              />

              <div style={{ textAlign: 'right', marginTop: 2 }}>
                <button type="button" onClick={() => setShowForgot(true)} className="link-hover"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#111827', fontSize: 13, fontWeight: 600,
                    textDecoration: 'underline', textUnderlineOffset: 3, padding: 0,
                  }}>
                  Mot de passe oublié ?
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary"
                style={{
                  width: '100%', color: '#fff', fontWeight: 700, fontSize: 16,
                  padding: '16px 0', borderRadius: 999, border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#d1d5db' : C.primary,
                  boxShadow: loading ? 'none' : C.glow,
                  marginTop: 8,
                }}>
                {loading ? <Spinner /> : 'Continuer'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0 18px' }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500 }}>OU</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            </div>

            <SocialButtons onSelect={handleSocialSignIn} height={56} />

            <p style={{ fontSize: 14, color: '#6b7280', margin: '24px 0 0' }}>
              Nouveau sur GROSHOP.tn ?{' '}
              <button onClick={() => navigate('/signup')} className="link-hover"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#111827', fontWeight: 700, fontSize: 14,
                  textDecoration: 'underline', textUnderlineOffset: 3, padding: 0,
                }}>
                Créez un compte
              </button>
            </p>
          </div>
        </div>

        {/* ── MODAL Mot de passe oublié ── */}
        {showForgot && (
          <Modal onClose={() => { setShowForgot(false); setForgotSuccess('') }}>
            <div style={{ fontSize: 34, marginBottom: 12, textAlign: 'center' }}>🔐</div>
            <h3 style={{ fontSize: 19, fontWeight: 900, color: '#111827', margin: '0 0 4px', textAlign: 'center' }}>Mot de passe oublié ?</h3>
            <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 18, textAlign: 'center' }}>Entrez votre email — nous vous enverrons un lien de réinitialisation.</p>
            {forgotSuccess ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{forgotSuccess}</div>
            ) : (
              <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <SimpleInput type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="email@example.com" height={52} />
                <button type="submit" disabled={forgotLoading} className="btn-primary"
                  style={{ width: '100%', color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px 0', borderRadius: 999, border: 'none', cursor: forgotLoading ? 'not-allowed' : 'pointer', background: C.primary, boxShadow: C.glow, opacity: forgotLoading ? 0.6 : 1 }}>
                  {forgotLoading ? <Spinner /> : 'Envoyer le lien'}
                </button>
              </form>
            )}
          </Modal>
        )}
      </div>
    </>
  )
}