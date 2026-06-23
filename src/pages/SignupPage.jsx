import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth } from '../lib/api'
import { Spinner } from './_shared'

import { C } from './auth/_shared/constants'
import AuthLeftPanel from './../pages/auth/_shared/AuthLeftPanel'
import AuthStyles from './../pages/auth/_shared/AuthStyles'
import SimpleInput from './../pages/auth/_shared/SimpleInput'
import SocialButtons from './../pages/auth/_shared/SocialButtons'
import PasswordStrength from './../pages/auth/_shared/PasswordStrength'

function mapSignupError(msg) {
  const m = (msg || '').toLowerCase()
  if (m.includes('email') && (m.includes('déjà') || m.includes('exist') || m.includes('unique')))
    return 'Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.'
  if (m.includes('password') || m.includes('mot de passe'))
    return 'Mot de passe invalide. Utilisez au moins 8 caractères.'
  if (m.includes('phone') || m.includes('téléphone') || m.includes('telephone'))
    return 'Numéro de téléphone invalide.'
  if (m.includes('full_name') || m.includes('nom'))
    return 'Nom complet requis.'
  if (m.includes('Too many') || m.includes('throttled') || m.includes('limit'))
    return 'Trop de tentatives. Réessayez dans quelques minutes.'
  return msg || 'Une erreur est survenue. Réessayez.'
}

export default function SignupPage() {
  const { setUser } = useAuth()
  const navigate    = useNavigate()

  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [password, setPassword] = useState('')
  const [cguOk,    setCguOk]    = useState(false)

  function validate() {
    if (!fullName.trim() || fullName.trim().length < 2) return 'Veuillez entrer votre nom complet.'
    if (!email.includes('@') || !email.includes('.'))   return 'Email invalide.'
    if (phone.length !== 8)                              return 'Le numéro doit comporter 8 chiffres.'
    if (password.length < 8)                             return 'Le mot de passe doit comporter au moins 8 caractères.'
    if (!cguOk)                                          return 'Vous devez accepter les CGU pour créer un compte.'
    return null
  }

  async function handleSignup(e) {
    e.preventDefault(); setError('')
    const vErr = validate()
    if (vErr) { setError(vErr); return }

    setLoading(true)
    try {
      const { data, error: err } = await auth.registerBuyer({
        email: email.trim().toLowerCase(),
        full_name: fullName.trim(),
        phone: `+216${phone}`,
        password,
      })
      if (err) { setError(mapSignupError(err.message || '')); return }
      if (data?.user) setUser(data.user)
      navigate('/')
    } catch (err) {
      setError(mapSignupError(err.message || ''))
    } finally {
      setLoading(false)
    }
  }

  function handleSocialSignIn(provider) {
    alert(`${provider} Sign-In : à brancher`)
  }

  return (
    <>
      <AuthStyles />

      <div style={{ height: '100vh', display: 'flex', background: '#f0f4f8', position: 'relative', overflow: 'hidden' }}>

        <AuthLeftPanel />

        {/* ── PANNEAU DROIT — Signup compact ── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#fff', position: 'relative',
          padding: '20px 24px',
          height: '100vh',
          overflow: 'hidden',
        }}>
          <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>

            <h1 style={{
              fontSize: 24, fontWeight: 800, color: '#111827',
              margin: '0 0 4px', letterSpacing: '-0.01em',
            }}>
              Créer un compte
            </h1>
            <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 16px', fontWeight: 400 }}>
              Rejoignez la marketplace B2B de Tunisie.
            </p>

            {error && (
              <div style={{
                background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                color: C.primaryText, borderRadius: 9, padding: '8px 12px',
                marginBottom: 10, fontSize: 12, textAlign: 'left',
              }}>⚠️ {error}</div>
            )}

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <SimpleInput type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nom complet" />
              <SimpleInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
              <SimpleInput type="tel" value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="Numéro de téléphone" prefix="🇹🇳 +216" />

              <div>
                <SimpleInput
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mot de passe (min. 8 caractères)"
                  rightSlot={
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 6, color: '#9ca3af' }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  }
                />
                <PasswordStrength password={password} />
              </div>

              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                marginTop: 2, cursor: 'pointer', textAlign: 'left',
              }}>
                <input type="checkbox" checked={cguOk} onChange={e => setCguOk(e.target.checked)}
                  style={{ width: 16, height: 16, marginTop: 1, accentColor: C.primary, cursor: 'pointer', flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: '#6b7280', lineHeight: 1.45 }}>
                  J'accepte les{' '}
                  <a href="/cgu" target="_blank" rel="noopener" style={{ color: '#111827', fontWeight: 600, textDecoration: 'underline' }}>CGU</a>
                  {' '}et la{' '}
                  <a href="/confidentialite" target="_blank" rel="noopener" style={{ color: '#111827', fontWeight: 600, textDecoration: 'underline' }}>politique de confidentialité</a>.
                </span>
              </label>

              <button type="submit" disabled={loading} className="btn-primary"
                style={{
                  width: '100%', color: '#fff', fontWeight: 700, fontSize: 15,
                  padding: '13px 0', borderRadius: 999, border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#d1d5db' : C.primary,
                  boxShadow: loading ? 'none' : C.glow,
                  marginTop: 4,
                }}>
                {loading ? <Spinner /> : 'Créer mon compte'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 12px' }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 500 }}>OU</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            </div>

            <SocialButtons onSelect={handleSocialSignIn} height={46} />

            <p style={{ fontSize: 13, color: '#6b7280', margin: '14px 0 0' }}>
              Vous avez déjà un compte ?{' '}
              <button onClick={() => navigate('/login')} className="link-hover"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#111827', fontWeight: 700, fontSize: 13,
                  textDecoration: 'underline', textUnderlineOffset: 3, padding: 0,
                }}>
                Se connecter
              </button>
            </p>

            <button onClick={() => navigate('/devenir-fournisseur')} className="supplier-cta"
              style={{
                width: '100%', marginTop: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#fafafa', border: '1px solid #f3f4f6',
                borderRadius: 10, cursor: 'pointer', textAlign: 'left',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>🏭</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
                    Vous êtes fournisseur ?
                  </div>
                  <div style={{ fontSize: 10.5, color: '#6b7280', marginTop: 1 }}>
                    Vendez sur GROSHOP — postulez ici
                  </div>
                </div>
              </div>
              <span style={{ color: C.primary, fontSize: 16, fontWeight: 700 }}>→</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}