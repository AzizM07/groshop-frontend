import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Field, PhoneInput, SelectField, InfoCard, DocCard,
         Alert, NextBtn, Spinner, Modal, FloatInput } from './_shared'
const CITIES = ['Tunis','Sfax','Sousse','Mahdia','Nabeul','Bizerte','Gabès','Monastir','Kairouan','Gafsa','Autre']

function mapError(msg) {
  if (msg.includes('already registered')) return 'Cet email est déjà utilisé.'
  if (msg.includes('password'))           return 'Le mot de passe doit contenir au moins 6 caractères.'
  return msg
}

export default function BuyerSignupPage() {
  const navigate  = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [showPass,setShowPass]= useState(false)
  const [success, setSuccess] = useState(false)

  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [phone,   setPhone]   = useState('')
  const [company, setCompany] = useState('')
  const [city,    setCity]    = useState('Tunis')
  const [pass,    setPass]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (pass.length < 6) { setError('Minimum 6 caractères'); return }
    setLoading(true); setError('')

    try {
      const { data, error: err } = await supabase.auth.signUp({
        email, password: pass,
        options: { data: { full_name: name, user_type: 'buyer' } }
      })
      if (err) throw err
      if (!data.user) throw new Error('Erreur création compte')

      await supabase.from('profiles').upsert({
        id: data.user.id, full_name: name,
        phone, company, city, user_type: 'buyer',
      })

      await supabase.from('wallets').insert({ buyer_id: data.user.id })

      // Email non confirmé → dialog
      if (!data.user.email_confirmed_at) {
        setSuccess(true)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(mapError(err.message || ''))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Vérifiez votre email</h2>
          <p className="text-gray-500 text-sm mb-3">
            Un email de confirmation a été envoyé à :<br />
            <strong className="text-gray-800">{email}</strong>
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-600 mb-6">
            Cliquez sur le lien dans l'email pour activer votre compte, puis connectez-vous.
          </div>
          <button onClick={() => navigate('/login')}
            className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl">
            Aller à la connexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-6 text-white">
          <button onClick={() => navigate('/login')}
            className="text-white/70 hover:text-white text-sm mb-4 flex items-center gap-1">
            ← Retour
          </button>
          <h1 className="text-xl font-black">Créer un compte acheteur</h1>
          <p className="text-white/70 text-sm">Accès immédiat après inscription</p>
        </div>

        <div className="p-6">
          {/* Info card */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🛒</span>
            <div>
              <div className="font-bold text-gray-800 text-sm">Compte Acheteur</div>
              <div className="text-gray-500 text-xs">Accès immédiat après inscription</div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nom complet *" icon="👤" value={name} onChange={e => setName(e.target.value)}
              placeholder="Mohamed Ben Ali" required />
            <Field label="Email *" icon="✉️" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
            <PhoneInput value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,8))} />
            <Field label="Entreprise / Commerce (optionnel)" icon="🏪" value={company}
              onChange={e => setCompany(e.target.value)} placeholder="Nom de votre commerce" />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ville *</label>
              <select value={city} onChange={e => setCity(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 outline-none text-sm bg-white">
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="relative">
              <Field label="Mot de passe *" icon="🔒"
                type={showPass ? 'text' : 'password'}
                value={pass} onChange={e => setPass(e.target.value)}
                placeholder="Minimum 6 caractères" required />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-4 bottom-3 text-gray-400 text-lg">
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4
                         rounded-2xl transition disabled:opacity-60 shadow-lg shadow-orange-200">
              {loading ? <Spinner /> : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}