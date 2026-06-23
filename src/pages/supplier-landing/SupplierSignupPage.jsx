// src/pages/supplier-landing/SupplierSignupPage.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../auth/_shared/constants'
import LOGO_SRC from '../../assets/logo2.png'

const SECTORS = [
  'Agroalimentaire', 'Boissons', 'Cosmétiques & Hygiène', 'Textile & Habillement',
  'Électronique & High-Tech', 'Fournitures de bureau', 'Emballage',
  'Matériaux de construction', 'Pièces auto', 'Mobilier & Décoration',
  'Nettoyage & Entretien', 'Autre',
]

const GOVERNORATES = [
  'Tunis','Ariana','Ben Arous','Manouba','Nabeul','Zaghouan','Bizerte',
  'Béja','Jendouba','Le Kef','Siliana','Sousse','Monastir','Mahdia',
  'Sfax','Kairouan','Kasserine','Sidi Bouzid','Gabès','Médenine',
  'Tataouine','Gafsa','Tozeur','Kébili',
]

const STEPS = [
  { id: 1, label: 'Compte' },
  { id: 2, label: 'Entreprise' },
  { id: 3, label: 'Documents' },
]

export default function SupplierSignupPage() {
  const navigate = useNavigate()
  const formTopRef = useRef(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const [companyName, setCompanyName] = useState('')
  const [rne, setRne] = useState('')
  const [mf, setMf] = useState('')
  const [sector, setSector] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')

  const [docRne, setDocRne] = useState(null)
  const [docCin, setDocCin] = useState(null)
  const [docRib, setDocRib] = useState(null)
  const [docLogo, setDocLogo] = useState(null)
  const [cguOk, setCguOk] = useState(false)

  // Force le retour en haut du formulaire à chaque changement d'étape
  useEffect(() => {
    formTopRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [step])

  function validateStep() {
    if (step === 1) {
      if (!fullName.trim() || fullName.trim().length < 2) return 'Veuillez entrer votre nom complet.'
      if (!email.includes('@') || !email.includes('.')) return 'Email invalide.'
      if (phone.length !== 8) return 'Le numéro doit comporter 8 chiffres.'
      if (password.length < 8) return 'Le mot de passe doit comporter au moins 8 caractères.'
    }
    if (step === 2) {
      if (!companyName.trim()) return "Nom de l'entreprise requis."
      if (!rne.trim()) return 'Numéro RNE requis.'
      if (!mf.trim()) return 'Matricule fiscal requis.'
      if (!sector) return 'Veuillez choisir un secteur.'
      if (!governorate) return 'Veuillez choisir un gouvernorat.'
      if (!address.trim()) return 'Adresse requise.'
    }
    if (step === 3) {
      if (!docRne) return "Veuillez joindre l'extrait RNE."
      if (!docCin) return 'Veuillez joindre la copie CIN du gérant.'
      if (!docRib) return 'Veuillez joindre le RIB bancaire.'
      if (!cguOk) return 'Vous devez accepter les CGU.'
    }
    return null
  }

  function handleNext() {
    setError('')
    const err = validateStep()
    if (err) { setError(err); return }
    setStep(s => s + 1)
  }

  function handleBack() {
    setError('')
    setStep(s => s - 1)
  }

  async function handleSubmit() {
    setError('')
    const err = validateStep()
    if (err) { setError(err); return }
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 1500))
      navigate('/pending')
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: '#fff',
    }}>

      {/* ── LEFT PANEL — fixed ── */}
      <div style={{
        width: '38%',
        minWidth: 340,
        maxWidth: 520,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,14,26,0.72) 0%, rgba(10,14,26,0.38) 45%, rgba(10,14,26,0.82) 100%)',
        }} />

        <div style={{
          position: 'relative', zIndex: 2,
          height: '100%',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '32px 28px 36px',
          boxSizing: 'border-box',
        }}>
          <button onClick={() => navigate('/')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
              GROSHOP<span style={{ color: C.primary }}>.tn</span>
            </span>
          </button>

          <div>
            <h2 style={{
              color: '#fff', fontSize: 26, fontWeight: 800,
              margin: '0 0 10px', lineHeight: 1.2, letterSpacing: '-0.02em',
            }}>
              Rejoignez +500 fournisseurs qui vendent sur GROSHOP
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.55)', fontSize: 13.5,
              lineHeight: 1.55, margin: '0 0 24px',
            }}>
              Inscription gratuite · Validation sous 24h · Zéro commission le premier mois
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex' }}>
                {[11, 32, 47, 59].map((id, i) => (
                  <img key={id} src={`https://i.pravatar.cc/80?img=${id}`} alt=""
                    style={{
                      width: 34, height: 34, borderRadius: '50%',
                      border: '2.5px solid rgba(10,14,26,0.80)',
                      marginLeft: i === 0 ? 0 : -10, objectFit: 'cover',
                    }} />
                ))}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.50)', fontSize: 11.5, fontWeight: 500 }}>
                +500 fournisseurs actifs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — CHANGEMENT ICI : Gestion du scroll fluide ── */}
      <div style={{
        flex: 1,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto', // Permet le scroll vertical du panneau complet si nécessaire
        background: '#fff',
        boxSizing: 'border-box',
      }}>
        {/* Top bar (reste collée en haut si on veut, ou défile avec le reste) */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 40px',
          background: '#fff',
          borderBottom: '1px solid #f3f4f6',
          flexShrink: 0,
          position: 'sticky', top: 0, zIndex: 10, // Reste visible au scroll
        }}>
          <button onClick={() => navigate('/devenir-fournisseur')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6, padding: 0,
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Retour
          </button>
          <span style={{ color: '#9ca3af', fontSize: 13 }}>
            Déjà un compte ?{' '}
            <button onClick={() => navigate('/login')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#111827', fontWeight: 700, fontSize: 13,
                textDecoration: 'underline', textUnderlineOffset: 3, padding: 0,
              }}>Se connecter</button>
          </span>
        </div>

        {/* Form Body Container */}
        <div style={{
          flex: 1,
          maxWidth: 500,
          width: '100%',
          margin: '0 auto',
          padding: '4vh 40px 6vh', // Un peu plus de padding en bas pour respirer au scroll
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}>
          <div ref={formTopRef} style={{ scrollMarginTop: '100px' }} />

          <h1 style={{
            fontSize: 'calc(20px + 0.5vh)', fontWeight: 800, color: '#111827',
            margin: '0 0 4px', letterSpacing: '-0.015em',
          }}>Créer un compte fournisseur</h1>
          <p style={{ color: '#6b7280', fontSize: 13.5, margin: '0 0 3vh' }}>
            Remplissez les informations ci-dessous pour commencer.
          </p>

          {/* ── STEPPER ── */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3vh' }}>
            {STEPS.map((s, i) => {
              const done = step > s.id
              const active = step === s.id
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      background: (done || active) ? C.primary : '#f3f4f6',
                      color: (done || active) ? '#fff' : '#b0b5bf',
                      transition: 'all 0.25s ease',
                    }}>
                      {done ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : s.id}
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: active ? 700 : 500,
                      color: active ? '#111827' : done ? '#6b7280' : '#b0b5bf',
                    }}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{
                      width: 36, height: 2, margin: '0 12px', borderRadius: 1,
                      background: done ? C.primary : '#e5e7eb',
                      transition: 'background 0.25s ease',
                    }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div style={{
              background: '#FFF5F3', border: '1px solid rgba(255,107,53,0.25)',
              color: '#c2410c', borderRadius: 10, padding: '8px 12px',
              marginBottom: 16, fontSize: 12.5, fontWeight: 500,
            }}>⚠️ {error}</div>
          )}

          {/* ═══ STEP 1 ═══ */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
              <SectionLabel icon="👤" label="Informations personnelles" />

              <Field label="Nom complet" required>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ahmed Ben Ali" />
              </Field>

              <Field label="Email professionnel" required>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@votreentreprise.tn" />
              </Field>

              <Field label="Téléphone" required>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: '#6b7280', fontSize: 13.5, fontWeight: 600, pointerEvents: 'none',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    🇹🇳 +216
                  </span>
                  <Input type="tel" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="XX XXX XXX" style={{ paddingLeft: 92 }} />
                </div>
              </Field>

              <Field label="Mot de passe" required>
                <div style={{ position: 'relative' }}>
                  <Input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="Min. 8 caractères" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9ca3af', fontSize: 16, padding: 0, lineHeight: 1,
                    }}>{showPass ? '🙈' : '👁️'}</button>
                </div>
              </Field>
            </div>
          )}

          {/* ═══ STEP 2 ═══ */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
              <SectionLabel icon="🏢" label="Informations entreprise" />

              <Field label="Raison sociale" required>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="SARL Mon Entreprise" />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Numéro RNE" required>
                  <Input value={rne} onChange={e => setRne(e.target.value)} placeholder="A012345678" />
                </Field>
                <Field label="Matricule fiscal" required>
                  <Input value={mf} onChange={e => setMf(e.target.value)} placeholder="1234567/A/B/C/000" />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Secteur d'activité" required>
                  <Select value={sector} onChange={e => setSector(e.target.value)} placeholder="Choisir...">
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field label="Gouvernorat" required>
                  <Select value={governorate} onChange={e => setGovernorate(e.target.value)} placeholder="Choisir...">
                    {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                  </Select>
                </Field>
              </div>

              <Field label="Adresse complète" required>
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Rue, ville, code postal" />
              </Field>

              <Field label="Site web" hint="optionnel">
                <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://www.votresite.tn" />
              </Field>

              <Field label="Description" hint="optionnel">
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Décrivez brièvement votre activité..."
                  rows={2}
                  style={{
                    width: '100%', background: '#fff',
                    border: '1.5px solid #e5e7eb', borderRadius: 10,
                    padding: '10px 14px', color: '#111827', fontSize: 13.5,
                    fontFamily: 'inherit', resize: 'none', outline: 'none',
                    transition: 'border-color 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = C.primary}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </Field>
            </div>
          )}

          {/* ═══ STEP 3 ═══ */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
              <div>
                <SectionLabel icon="📄" label="Documents de vérification" />
              </div>

              <FileUpload label="Extrait RNE *" file={docRne} onFile={setDocRne} accept=".pdf,.jpg,.jpeg,.png" />
              <FileUpload label="Copie CIN du gérant *" file={docCin} onFile={setDocCin} accept=".pdf,.jpg,.jpeg,.png" />
              <FileUpload label="RIB bancaire *" file={docRib} onFile={setDocRib} accept=".pdf,.jpg,.jpeg,.png" />
              <FileUpload label="Logo de l'entreprise" file={docLogo} onFile={setDocLogo} accept=".jpg,.jpeg,.png,.svg" />

              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 9,
                marginTop: 2, cursor: 'pointer',
              }}>
                <input type="checkbox" checked={cguOk} onChange={e => setCguOk(e.target.checked)}
                  style={{ width: 16, height: 16, marginTop: 2, accentColor: C.primary, cursor: 'pointer', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>
                  J'accepte les <a href="/cgu" target="_blank" rel="noopener" style={{ color: '#111827', fontWeight: 600 }}>CGU</a> et la <a href="/confidentialite" target="_blank" rel="noopener" style={{ color: '#111827', fontWeight: 600 }}>politique de confidentialité</a>.
                </span>
              </label>
            </div>
          )}

          {/* ── BUTTONS ── */}
          <div style={{ display: 'flex', gap: 12, marginTop: '3vh' }}>
            {step > 1 && (
              <button onClick={handleBack}
                style={{
                  background: '#fff', border: '1.5px solid #e5e7eb',
                  color: '#374151', padding: '11px 24px', borderRadius: 999,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#d1d5db'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                Retour
              </button>
            )}
            <button
              onClick={step < 3 ? handleNext : handleSubmit}
              disabled={loading}
              style={{
                flex: 1, background: loading ? '#d1d5db' : C.primary,
                color: '#fff', border: 'none', padding: '11px 24px',
                borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(255,107,53,0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,107,53,0.35)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = loading ? 'none' : '0 6px 20px rgba(255,107,53,0.30)'
              }}>
              {loading ? 'Envoi en cours…' : step < 3 ? 'Continuer' : 'Soumettre ma candidature'}
            </button>
          </div>

          {/* Security note */}
          <div style={{
            marginTop: '2vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6, color: '#c4c8cf', fontSize: 11,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Données chiffrées et sécurisées
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// SUB-COMPONENTS (Inchangés mais conservés pour ton copier-coller)
// ═══════════════════════════════════════════════════
function SectionLabel({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{label}</span>
    </div>
  )
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label style={{ display: 'block', color: '#374151', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
        {label}
        {required && <span style={{ color: C.primary, marginLeft: 3 }}>*</span>}
        {hint && <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: 6 }}>({hint})</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ style, onFocus, onBlur, ...props }) {
  return (
    <input {...props}
      style={{
        width: '100%', background: '#fff',
        border: '1.5px solid #e5e7eb', borderRadius: 10,
        padding: '10px 14px', color: '#111827', fontSize: 13.5,
        outline: 'none', transition: 'border-color 0.2s',
        boxSizing: 'border-box', ...style,
      }}
      onFocus={e => {
        if (e.target.style) {
          e.target.style.borderColor = C.primary
          e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.06)'
        }
        onFocus?.(e)
      }}
      onBlur={e => {
        if (e.target.style) {
          e.target.style.borderColor = '#e5e7eb'
          e.target.style.boxShadow = 'none'
        }
        onBlur?.(e)
      }} />
  )
}

function Select({ value, onChange, placeholder, children }) {
  return (
    <select value={value} onChange={onChange}
      style={{
        width: '100%', background: '#fff',
        border: '1.5px solid #e5e7eb', borderRadius: 10,
        padding: '10px 14px', color: value ? '#111827' : '#9ca3af',
        fontSize: 13.5, outline: 'none', cursor: 'pointer',
        transition: 'border-color 0.2s', boxSizing: 'border-box',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
      }}
      onFocus={e => {
        e.target.style.borderColor = C.primary
        e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.06)'
      }}
      onBlur={e => {
        e.target.style.borderColor = '#e5e7eb'
        e.target.style.boxShadow = 'none'
      }}>
      <option value="" disabled>{placeholder}</option>
      {children}
    </select>
  )
}

function FileUpload({ label, file, onFile, accept }) {
  const ref = useRef(null)
  function handleRemove(e) {
    e.stopPropagation()
    onFile(null)
    if (ref.current) ref.current.value = ''
  }

  return (
    <div onClick={() => !file && ref.current?.click()}
      style={{
        border: file ? `1.5px solid rgba(255,107,53,0.30)` : '1.5px dashed #d1d5db',
        borderRadius: 10, padding: '10px 14px',
        background: file ? '#FFF8F5' : '#fafafa',
        cursor: file ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => { if (!file) e.currentTarget.style.borderColor = C.primary }}
      onMouseLeave={e => { if (!file) e.currentTarget.style.borderColor = '#d1d5db' }}>
      <input ref={ref} type="file" accept={accept}
        onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]) }}
        style={{ display: 'none' }} />
      {file ? (
        <>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: '#111827', fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {label.replace(' *', '')} joint : {file.name}
            </span>
          </div>
          <button onClick={handleRemove}
            style={{
              background: '#f3f4f6', border: 'none', borderRadius: 6,
              width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#6b7280', fontSize: 11, flexShrink: 0,
            }}>✕</button>
        </>
      ) : (
        <>
          <div style={{ color: '#374151', fontSize: 12.5, fontWeight: 600 }}>{label}</div>
          <span style={{ color: '#9ca3af', fontSize: 11.5, marginLeft: 'auto' }}>Télécharger ＋</span>
        </>
      )}
    </div>
  )
}