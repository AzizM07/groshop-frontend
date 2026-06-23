import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Field, PhoneInput, SelectField, InfoCard, DocCard,
         Alert, NextBtn, Spinner, Modal, FloatInput } from './_shared'
const CITIES   = ['Tunis','Sfax','Sousse','Mahdia','Nabeul','Bizerte','Gabès','Monastir','Kairouan','Gafsa','Autre']
const SECTORS  = ['Textile','Beauté & Cosmétique','Électronique','Alimentaire','Agriculture','Mobilier','Bâtiment','Parapharmacie','Outillage','Autre']
const STEPS    = ['Compte', 'Entreprise', 'Contact', 'Documents']

export default function SupplierSignupPage() {
  const navigate  = useNavigate()
  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [data,    setData]    = useState({})

  function nextStep(stepData) {
    setData(d => ({ ...d, ...stepData }))
    setStep(s => s + 1)
    setError('')
  }

  function prevStep() {
    setStep(s => s - 1)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400">
        <div className="max-w-2xl mx-auto px-6 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={step === 0 ? () => navigate('/login') : prevStep}
              className="text-white/80 hover:text-white text-sm">
              {step === 0 ? '✕ Annuler' : '← Retour'}
            </button>
            <span className="text-white font-black ml-auto">Inscription Fournisseur</span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/30 rounded-full mb-4">
            <div className="h-1 bg-white rounded-full transition-all duration-300"
                 style={{ width: `${((step + 1) / 4) * 100}%` }} />
          </div>
        </div>

        {/* Step indicators */}
        <div className="max-w-2xl mx-auto px-6 pb-4">
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((s, i) => {
              const done    = i < step
              const current = i === step
              return (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      done    ? 'bg-green-400 text-white' :
                      current ? 'bg-white text-orange-500' :
                                'bg-white/30 text-white/60'
                    }`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs mt-1 ${current ? 'text-white font-bold' : 'text-white/60'}`}>
                      {s}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 mb-4 mx-1 ${i < step ? 'bg-green-400' : 'bg-white/30'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>
        )}

        {step === 0 && <Step1 data={data} onNext={nextStep} />}
        {step === 1 && <Step2 data={data} onNext={nextStep} />}
        {step === 2 && <Step3 data={data} onNext={nextStep} />}
        {step === 3 && <Step4 data={data} setError={setError} loading={loading} setLoading={setLoading} />}
      </div>
    </div>
  )
}

// ── STEP 1 — Compte ──────────────────────────────────────
function Step1({ data, onNext }) {
  const [name,    setName]    = useState(data.name     || '')
  const [email,   setEmail]   = useState(data.email    || '')
  const [pass,    setPass]    = useState(data.password || '')
  const [showPass,setShowPass]= useState(false)
  const [error,   setError]   = useState('')

  function submit(e) {
    e.preventDefault(); setError('')
    if (!name)                    return setError('Nom requis')
    if (!email.includes('@'))     return setError('Email invalide')
    if (pass.length < 6)          return setError('Minimum 6 caractères')
    onNext({ name, email, password: pass })
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <InfoCard emoji="👤" title="Informations du compte" subtitle="Ces données vous serviront à vous connecter" />
      {error && <Alert msg={error} />}
      <form onSubmit={submit} className="space-y-4 mt-4">
        <Field label="Nom complet *" icon="👤" value={name}
          onChange={e => setName(e.target.value)} placeholder="Mohamed Ben Ali" required />
        <Field label="Email professionnel *" icon="✉️" type="email" value={email}
          onChange={e => setEmail(e.target.value)} placeholder="contact@entreprise.tn" required />
        <div className="relative">
          <Field label="Mot de passe *" icon="🔒"
            type={showPass ? 'text' : 'password'} value={pass}
            onChange={e => setPass(e.target.value)} placeholder="Minimum 6 caractères" required />
          <button type="button" onClick={() => setShowPass(v => !v)}
            className="absolute right-4 bottom-3 text-gray-400 text-lg">
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>
        <NextBtn />
      </form>
    </div>
  )
}

// ── STEP 2 — Entreprise ───────────────────────────────────
function Step2({ data, onNext }) {
  const [company,  setCompany]  = useState(data.company_name || '')
  const [matricule,setMatricule]= useState(data.matricule    || '')
  const [city,     setCity]     = useState(data.city         || 'Tunis')
  const [sector,   setSector]   = useState(data.sector       || 'Textile')
  const [error,    setError]    = useState('')

  function submit(e) {
    e.preventDefault(); setError('')
    if (!company)   return setError('Nom entreprise requis')
    if (!matricule) return setError('Matricule fiscal requis')
    onNext({ company_name: company, matricule, city, sector })
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <InfoCard emoji="🏭" title="Informations de l'entreprise" subtitle="Ces données seront vérifiées par notre équipe" />
      {error && <Alert msg={error} />}
      <form onSubmit={submit} className="space-y-4 mt-4">
        <Field label="Nom de l'entreprise *" icon="🏢" value={company}
          onChange={e => setCompany(e.target.value)} placeholder="Sfax Textile SARL" required />
        <Field label="Matricule fiscal *" icon="🔢" value={matricule}
          onChange={e => setMatricule(e.target.value)} placeholder="1234567A/B/000" required />
        <SelectField label="Ville *" value={city} onChange={e => setCity(e.target.value)} options={CITIES} />
        <SelectField label="Secteur d'activité *" value={sector} onChange={e => setSector(e.target.value)} options={SECTORS} />
        <NextBtn />
      </form>
    </div>
  )
}

// ── STEP 3 — Contact ──────────────────────────────────────
function Step3({ data, onNext }) {
  const [phone,   setPhone]   = useState(data.phone   || '')
  const [address, setAddress] = useState(data.address || '')
  const [website, setWebsite] = useState(data.website || '')
  const [error,   setError]   = useState('')

  function submit(e) {
    e.preventDefault(); setError('')
    if (phone.length !== 8) return setError('8 chiffres requis')
    if (!address)           return setError('Adresse requise')
    onNext({ phone, address, website })
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <InfoCard emoji="📞" title="Informations de contact" subtitle="Visible aux acheteurs après validation" />
      {error && <Alert msg={error} />}
      <form onSubmit={submit} className="space-y-4 mt-4">
        <PhoneInput value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,8))} />
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse *</label>
          <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} required
            placeholder="Rue, Quartier, Ville"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 outline-none text-sm resize-none" />
        </div>
        <Field label="Site web (optionnel)" icon="🌐" value={website}
          onChange={e => setWebsite(e.target.value)} placeholder="www.monsociete.tn" />
        <NextBtn />
      </form>
    </div>
  )
}

// ── STEP 4 — Documents ────────────────────────────────────
function Step4({ data, setError, loading, setLoading }) {
  const navigate  = useNavigate()
  const [cin,     setCin]     = useState(null)
  const [rne,     setRne]     = useState(null)
  const [local,   setLocal]   = useState(null)

  function pickFile(setter) {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
    input.onchange = e => setter(e.target.files[0])
    input.click()
  }

  async function uploadFile(file, path) {
    const { error } = await supabase.storage.from('supplier-docs').upload(path, file, { upsert: true })
    if (error) throw error
    return supabase.storage.from('supplier-docs').getPublicUrl(path).data.publicUrl
  }

  async function submit() {
    if (!cin) return setError('CIN ou Patente obligatoire')
    if (!rne) return setError('Registre du Commerce obligatoire')
    setLoading(true); setError('')

    try {
      // Auth signup
      let uid
      try {
        const { data: authData, error: err } = await supabase.auth.signUp({
          email: data.email, password: data.password,
          options: { data: { full_name: data.name, user_type: 'supplier' } }
        })
        if (err) throw err
        uid = authData.user.id
      } catch {
        const { data: authData } = await supabase.auth.signInWithPassword({
          email: data.email, password: data.password
        })
        uid = authData.user.id
      }

      // Upload docs
      const cinUrl   = await uploadFile(cin, `suppliers/${uid}/cin.jpg`)
      const rneUrl   = await uploadFile(rne, `suppliers/${uid}/rne.jpg`)
      const localUrl = local ? await uploadFile(local, `suppliers/${uid}/local.jpg`) : null

      // Upsert supplier
      await supabase.from('suppliers').upsert({
        user_id: uid, name: data.company_name,
        city: data.city, matricule: data.matricule,
        phone: data.phone, address: data.address,
        website: data.website, description: data.sector,
        status: 'pending', verified: false,
        submitted_at: new Date().toISOString(),
        doc_cin_url: cinUrl, doc_rne_url: rneUrl,
        doc_local_url: localUrl,
      })

      await supabase.from('profiles').upsert({
        id: uid, full_name: data.name,
        phone: data.phone, user_type: 'supplier',
      })

      navigate('/pending')
    } catch (err) {
      setError(err.message || 'Erreur lors de la soumission')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <InfoCard emoji="📄" title="Documents officiels" subtitle="Pour vérifier votre identité commerciale" />

        <div className="mt-4 space-y-3">
          <DocCard title="CIN ou Patente *" subtitle="Photo recto/verso de votre pièce d'identité"
            emoji="🪪" file={cin} required onPick={() => pickFile(setCin)} />
          <DocCard title="Registre du Commerce (RNE) *" subtitle="Document officiel d'enregistrement"
            emoji="📋" file={rne} required onPick={() => pickFile(setRne)} />
          <DocCard title="Photo du local (optionnel)" subtitle="Photo de votre magasin ou entrepôt"
            emoji="🏭" file={local} onPick={() => pickFile(setLocal)} />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-4 text-xs text-green-700">
          ℹ️ Dossier examiné sous 24-48h. Confirmation par email.
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-900 mb-3">Récapitulatif</h3>
        <div className="space-y-2 text-sm">
          {[
            ['👤 Nom', data.name],
            ['🏭 Entreprise', data.company_name],
            ['📍 Ville', data.city],
            ['🏷️ Secteur', data.sector],
            ['📞 Téléphone', `+216 ${data.phone}`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-400">{label}</span>
              <span className="font-semibold text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={submit} disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4
                   rounded-2xl transition disabled:opacity-60 shadow-lg shadow-orange-200">
        {loading ? <Spinner /> : 'Soumettre ma candidature'}
      </button>
    </div>
  )
}