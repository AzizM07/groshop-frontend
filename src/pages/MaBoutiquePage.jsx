// src/pages/MaBoutiquePage.jsx — GROSHOP.tn
// Page acheteur "Ma boutique" — soumission du dossier de vérification B2B
// (nom entreprise, RNE, patente, document justificatif) pour débloquer les
// prix masqués sur toute la marketplace.

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Store, Upload, CheckCircle2, Clock, XCircle, FileText, Info,
  ShieldCheck, Lock, ChevronRight, X,
} from 'lucide-react'
import { business } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const ORANGE = '#FF5E00'
const INK    = '#0F1419'
const SUB    = '#3D4853'
const MUTE   = '#6B7785'
const FAINT  = '#9AA3AE'
const LINE   = '#E8EAED'
const BG     = '#F4F5F7'
const GREEN  = '#0E9F6E'
const RED    = '#DC2626'
const AMBER  = '#D97706'
const FONT   = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

// Statuts renvoyés par le backend (business_status sur User)
const STATUS_META = {
  none: {
    label: 'Non soumis',
    color: FAINT, bg: '#F4F5F7',
    icon: Info,
    banner: {
      title: 'Vérifiez votre boutique pour débloquer les prix B2B',
      text: 'Les fournisseurs qui masquent leurs prix affichent « Prix sur devis » aux visiteurs. Une fois votre boutique vérifiée par GROSHOP, vous verrez tous les prix débloqués par ces fournisseurs.',
    },
  },
  pending: {
    label: 'En cours de vérification',
    color: AMBER, bg: '#FEF3C7',
    icon: Clock,
    banner: {
      title: 'Dossier reçu — vérification en cours',
      text: 'Notre équipe examine vos documents. Vous serez notifié par email dès qu\'une décision sera prise (généralement sous 48h ouvrées).',
    },
  },
  verified: {
    label: 'Boutique vérifiée',
    color: GREEN, bg: '#D1FAE5',
    icon: CheckCircle2,
    banner: {
      title: '✓ Boutique vérifiée',
      text: 'Vous voyez maintenant automatiquement les prix débloqués par tous les fournisseurs, sur toute la marketplace.',
    },
  },
  rejected: {
    label: 'Dossier refusé',
    color: RED, bg: '#FEE2E2',
    icon: XCircle,
    banner: {
      title: 'Dossier refusé',
      text: 'Corrigez les points ci-dessous et soumettez un nouveau dossier.',
    },
  },
}

export default function MaBoutiquePage() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [err, setErr] = useState(null)

  const [form, setForm] = useState({
    business_name: '',
    business_rne: '',
    business_patente: '',
    business_document: null,   // File
  })
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState('')
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let alive = true
    business.get()
      .then(d => {
        if (!alive) return
        setProfile(d)
        setForm(f => ({
          ...f,
          business_name:    d?.business_name    || '',
          business_rne:     d?.business_rne     || '',
          business_patente: d?.business_patente || '',
        }))
      })
      .catch(e => alive && setErr(e?.message || 'Impossible de charger votre dossier.'))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  const status = profile?.business_status || 'none'
  const meta = STATUS_META[status] || STATUS_META.none
  const StatusIcon = meta.icon
  const canEdit = status === 'none' || status === 'rejected'

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { setSaveErr('Le document ne doit pas dépasser 10 Mo.'); return }
    setForm(x => ({ ...x, business_document: f }))
    setSaveErr('')
  }

  const removeFile = () => {
    setForm(x => ({ ...x, business_document: null }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const submit = async (e) => {
    e?.preventDefault?.()
    setSaveErr('')

    if (!form.business_name.trim()) { setSaveErr("Le nom de l'entreprise est obligatoire."); return }
    if (!form.business_rne.trim()) { setSaveErr('Le numéro RNE est obligatoire.'); return }
    // Document obligatoire uniquement à la 1re soumission (ou après rejet, si absent)
    if (!form.business_document && !profile?.business_document_url) {
      setSaveErr('Le document justificatif (extrait RNE ou patente) est obligatoire.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        business_name:    form.business_name.trim(),
        business_rne:     form.business_rne.trim(),
        business_patente: form.business_patente.trim(),
      }
      if (form.business_document) payload.business_document = form.business_document

      const updated = await business.submit(payload)
      setProfile(updated)
      setForm(f => ({ ...f, business_document: null }))
      if (fileInputRef.current) fileInputRef.current.value = ''
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setSaveErr(e?.message || "Échec de l'envoi. Réessayez.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
        <div style={{ width: 32, height: 32, border: `4px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gd-spin .8s linear infinite' }} />
      </div>
    )
  }

  if (err) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: FONT }}>
        <div style={{ color: RED, fontSize: 14 }}>{err}</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px clamp(16px, 2vw, 32px) 40px', fontFamily: FONT, color: INK }}>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Store size={22} color={ORANGE} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>Ma boutique</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: meta.color, background: meta.bg, padding: '4px 10px', borderRadius: 20 }}>
              <StatusIcon size={12} /> {meta.label}
            </span>
          </div>
        </div>
      </div>
      <p style={{ margin: '10px 0 20px', fontSize: 13.5, color: MUTE, maxWidth: 720 }}>
        Certains fournisseurs B2B réservent leurs prix aux boutiques vérifiées. Soumettez votre RNE ou votre patente pour être identifié comme professionnel et voir tous les tarifs.
      </p>

      {/* Bandeau de statut */}
      <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${LINE}`, padding: 20, marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <StatusIcon size={20} color={meta.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: INK }}>{meta.banner.title}</div>
          <div style={{ fontSize: 13.5, color: SUB, marginTop: 6, lineHeight: 1.55 }}>{meta.banner.text}</div>

          {status === 'rejected' && profile?.business_rejection_reason && (
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, background: '#FEF2F2', border: `1px solid #FECACA`, fontSize: 13, color: '#991B1B' }}>
              <strong>Raison :</strong> {profile.business_rejection_reason}
            </div>
          )}

          {status === 'verified' && (
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 12, fontSize: 13, fontWeight: 700, color: ORANGE, textDecoration: 'none' }}>
              Explorer la marketplace <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Grille : formulaire + colonne d'aide */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16, alignItems: 'start' }} className="mb-grid">

        {/* ── Formulaire ── */}
        <form onSubmit={submit} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${LINE}` }}>

          <div style={{ padding: '20px 22px 6px' }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: INK }}>
              {canEdit ? "Informations de l'entreprise" : "Dossier soumis"}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: MUTE }}>
              {canEdit ? 'Tous les champs marqués * sont obligatoires.' : 'Vous pourrez modifier vos informations après décision de l\'équipe.'}
            </p>
          </div>

          <div style={{ padding: '18px 22px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            <Field label="Nom de l'entreprise *">
              <input
                type="text"
                value={form.business_name}
                onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                disabled={!canEdit}
                placeholder="Ex : Sfax Textile SARL"
                style={inputStyle(canEdit)}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Numéro RNE *" hint="Registre National des Entreprises">
                <input
                  type="text"
                  value={form.business_rne}
                  onChange={e => setForm(f => ({ ...f, business_rne: e.target.value }))}
                  disabled={!canEdit}
                  placeholder="Ex : B123456789"
                  style={inputStyle(canEdit)}
                />
              </Field>

              <Field label="Numéro de patente" hint="Optionnel">
                <input
                  type="text"
                  value={form.business_patente}
                  onChange={e => setForm(f => ({ ...f, business_patente: e.target.value }))}
                  disabled={!canEdit}
                  placeholder="Ex : 1234567/A/N/M/000"
                  style={inputStyle(canEdit)}
                />
              </Field>
            </div>

            {/* Upload document */}
            <Field label="Document justificatif *" hint="Extrait RNE ou patente (PDF, JPG, PNG — max 10 Mo)">
              {canEdit ? (
                <>
                  {form.business_document ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: `1px solid ${LINE}`, borderRadius: 10, background: '#FAFAFA' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FFF0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={18} color={ORANGE} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.business_document.name}</div>
                        <div style={{ fontSize: 11.5, color: MUTE, marginTop: 2 }}>{(form.business_document.size / 1024 / 1024).toFixed(2)} Mo</div>
                      </div>
                      <button type="button" onClick={removeFile}
                        style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: MUTE, display: 'flex' }}>
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <label htmlFor="biz-doc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '18px', border: `2px dashed ${LINE}`, borderRadius: 10, cursor: 'pointer', color: MUTE, fontSize: 13.5, fontWeight: 600, background: '#FAFAFA', transition: 'border-color .15s, background .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.background = '#FFF7F2' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.background = '#FAFAFA' }}>
                        <Upload size={18} />
                        Cliquer pour choisir un fichier
                      </label>
                      <input ref={fileInputRef} id="biz-doc" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} style={{ display: 'none' }} />
                    </>
                  )}
                  {profile?.business_document_url && !form.business_document && (
                    <div style={{ marginTop: 8, fontSize: 12, color: MUTE }}>
                      Document actuellement en dossier : <a href={profile.business_document_url} target="_blank" rel="noreferrer" style={{ color: ORANGE, fontWeight: 600 }}>voir</a>
                    </div>
                  )}
                </>
              ) : (
                profile?.business_document_url ? (
                  <a href={profile.business_document_url} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: `1px solid ${LINE}`, borderRadius: 10, background: '#FAFAFA', textDecoration: 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FFF0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={18} color={ORANGE} />
                    </div>
                    <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: INK }}>Voir le document soumis</div>
                    <ChevronRight size={16} color={MUTE} />
                  </a>
                ) : (
                  <div style={{ padding: '12px 14px', border: `1px solid ${LINE}`, borderRadius: 10, background: '#FAFAFA', fontSize: 13, color: MUTE }}>—</div>
                )
              )}
            </Field>

            {saveErr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#FEF2F2', color: '#B91C1C', borderRadius: 8, fontSize: 13 }}>
                <XCircle size={16} /> {saveErr}
              </div>
            )}

            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#D1FAE5', color: '#065F46', borderRadius: 8, fontSize: 13 }}>
                <CheckCircle2 size={16} /> Dossier envoyé — nous vous recontactons rapidement.
              </div>
            )}

            {canEdit && (
              <button type="submit" disabled={saving}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 20px', borderRadius: 10, border: 'none', background: ORANGE, color: '#fff', fontSize: 14.5, fontWeight: 800, cursor: saving ? 'wait' : 'pointer', opacity: saving ? .7 : 1, alignSelf: 'flex-start' }}>
                {saving ? 'Envoi en cours…' : (status === 'rejected' ? 'Soumettre à nouveau' : 'Soumettre pour vérification')}
              </button>
            )}
          </div>
        </form>

        {/* ── Colonne d'aide ── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="mb-aside">

          <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${LINE}`, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <ShieldCheck size={18} color={ORANGE} />
              <span style={{ fontSize: 14, fontWeight: 800, color: INK }}>Pourquoi vérifier ?</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <BulletHelp icon={Lock} text="Voir les prix masqués des fournisseurs qui protègent leur revente" />
              <BulletHelp icon={CheckCircle2} text="Accès automatique dès l'approbation, sur tous les catalogues" />
              <BulletHelp icon={Store} text="Badge « Vérifié » sur votre profil auprès des fournisseurs" />
            </ul>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${LINE}`, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: INK, marginBottom: 10 }}>Documents acceptés</div>
            <div style={{ fontSize: 12.5, color: SUB, lineHeight: 1.6 }}>
              Extrait du <strong>Registre National des Entreprises</strong> (RNE), <strong>patente</strong>, ou tout document officiel prouvant votre activité commerciale.
            </div>
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#F4F5F7', borderRadius: 8, fontSize: 12, color: MUTE, lineHeight: 1.5 }}>
              <strong style={{ color: INK }}>Confidentialité :</strong> vos documents ne sont visibles que par l'équipe GROSHOP et ne sont jamais partagés avec les fournisseurs.
            </div>
          </div>

          <div style={{ background: '#FFF0E8', borderRadius: 12, border: `1px solid #FFD6BF`, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#8A2C00', marginBottom: 6 }}>Besoin d'aide ?</div>
            <div style={{ fontSize: 12.5, color: '#8A2C00', lineHeight: 1.6 }}>
              Notre équipe support répond en général sous 24h ouvrées via l'assistance en ligne.
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mb-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}

// ── Sous-composants ─────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 7 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: INK }}>{label}</label>
        {hint && <span style={{ fontSize: 11.5, color: FAINT }}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function BulletHelp({ icon: Icon, text }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, background: '#FFF0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <Icon size={13} color={ORANGE} />
      </div>
      <span style={{ fontSize: 12.5, color: SUB, lineHeight: 1.55 }}>{text}</span>
    </li>
  )
}

function inputStyle(enabled) {
  return {
    width: '100%',
    padding: '11px 13px',
    borderRadius: 10,
    border: `1px solid ${LINE}`,
    fontSize: 14,
    fontFamily: FONT,
    color: enabled ? INK : MUTE,
    background: enabled ? '#fff' : '#FAFAFA',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .15s',
  }
}