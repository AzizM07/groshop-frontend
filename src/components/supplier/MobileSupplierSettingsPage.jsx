// components/supplier/MobileSupplierSettingsPage.jsx — GROSHOP.tn
// Paramètres fournisseur, version mobile. Même API que le desktop :
// auth.supplierMe() + subscriptions.{plans,mine,changePlan}.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, CreditCard, Camera, Copy, Check, ChevronRight,
  Loader2, BadgeCheck, Clock, XCircle, Store, Zap, AlertTriangle, LogOut, Building2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { auth as authApi, subscriptions as subsApi } from '../../lib/api'

const ORANGE = '#FF4500'
const INK    = '#0F1419'
const MUTE   = '#6B7785'
const FAINT  = '#9AA3AE'
const LINE   = '#E8EAED'
const SOFT   = '#FFF0E8'
const FONT   = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const asText = (v) => (v == null ? '' : String(v))
const maskEmail = (e = '') => {
  const [u, d] = String(e).split('@')
  if (!d) return e
  return `${u.slice(0, 3)}***@${d}`
}
const fmtTND = (v) => Number(v || 0).toLocaleString('fr-FR', { maximumFractionDigits: 3 })

const VERIF = {
  approved: { label: 'Vérifié',    color: '#059669', bg: '#ECFDF5', icon: BadgeCheck },
  pending:  { label: 'En attente', color: '#D97706', bg: '#FEF3C7', icon: Clock },
  rejected: { label: 'Rejeté',     color: '#DC2626', bg: '#FEE2E2', icon: XCircle },
}

const CSS = `
@keyframes msup-spin { to { transform: rotate(360deg); } }
.msup-spin { animation: msup-spin .8s linear infinite; }
.msup-tap { -webkit-tap-highlight-color: transparent; }
.msup-tap:active { background: #F5F5F5 !important; }
`

// ═══════════════════════════════════════════════════════════════════
export default function MobileSupplierSettingsPage() {
  const authCtx  = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    authApi.supplierMe()
      .then((d) => { if (alive) setProfile(d) })
      .catch((e) => { if (alive) setError(e.message || 'Erreur de chargement') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTE, gap: 10, fontFamily: FONT }}>
        <Loader2 size={20} className="msup-spin" /> <span>Chargement…</span>
        <style>{CSS}</style>
      </div>
    )
  }
  if (error || !profile) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: MUTE, fontFamily: FONT, padding: 24, textAlign: 'center' }}>
        <AlertTriangle size={26} color="#DC2626" />
        <span>{error || 'Profil introuvable.'}</span>
      </div>
    )
  }

  const email    = asText(profile.email)
  const name     = asText(profile.full_name) || asText(profile.company_name) || email.split('@')[0]
  const company  = asText(profile.company_name)
  const initial  = (company || name || '?')[0].toUpperCase()
  const verif    = VERIF[profile.verification_status] || VERIF.pending
  const VerifIcon = verif.icon

  const go = (slug) => navigate(`/supplier/settings/${slug}`)
  const copyId = () => {
    if (!profile.id) return
    navigator.clipboard?.writeText(profile.id).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }
  const doLogout = () => {
    const fn = authCtx.logout || authCtx.signOut || authCtx.disconnect
    if (fn) fn()
    navigate('/login')
  }

  const ACCOUNT_ROWS = [
    { label: 'Nom de la boutique',   value: company || '—' },
    { label: 'Ville',                value: [profile.city, profile.wilaya].filter(Boolean).join(', ') || '—' },
    { label: 'Adresse',              value: asText(profile.address) || '—' },
    { label: 'Registre de commerce', value: asText(profile.rc_number) || '—' },
    { label: 'Matricule fiscal',     value: asText(profile.tax_number) || '—' },
    { label: 'Commande minimum',     value: profile.min_order_tnd ? `${fmtTND(profile.min_order_tnd)} TND` : '—' },
    { label: 'Ma vitrine',           onClick: () => navigate('/supplier/shop'), chevron: true },
  ]
  const SECU_ROWS = [
    { label: 'Mot de passe',    onClick: () => go('mot-de-passe'), chevron: true },
    { label: 'Adresse e-mail',  onClick: () => go('email'), value: maskEmail(email), chevron: true },
    { label: 'Téléphone',       onClick: () => go('telephone'), value: asText(profile.phone) || '—', chevron: true },
  ]

  return (
    <div style={{ fontFamily: FONT, color: INK, paddingBottom: 40, background: '#F7F7F8', minHeight: '100vh' }}>
      <style>{CSS}</style>

      {/* ═══ En-tête profil ═══ */}
      <div style={{ background: '#fff', padding: '22px 18px 20px', borderBottom: `1px solid ${LINE}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {profile.store?.logo_url
                ? <img src={profile.store.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                : <span style={{ fontSize: 28, fontWeight: 800, color: ORANGE }}>{initial}</span>}
            </div>
            <button onClick={() => navigate('/supplier/shop')} className="msup-tap" style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%', background: '#fff', border: `1px solid ${LINE}`, cursor: 'pointer', color: MUTE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={13} />
            </button>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: '0 0 5px', fontSize: 19, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company || name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: verif.bg, color: verif.color, padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700 }}>
                <VerifIcon size={12} /> {verif.label}
              </span>
              {profile.verification_status !== 'approved' && (
                <button onClick={() => navigate('/supplier/shop')} className="msup-tap"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: SOFT, color: ORANGE, border: `1px solid ${ORANGE}`, padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                  <ShieldCheck size={12} /> Se faire vérifier
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Email + ID */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
            <span style={{ color: MUTE, minWidth: 92 }}>E-mail</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{maskEmail(email)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
            <span style={{ color: MUTE, minWidth: 92 }}>Identifiant</span>
            <span style={{ fontSize: 12.5 }}>{asText(profile.id).slice(0, 8)}…</span>
            <button onClick={copyId} className="msup-tap" style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'inline-flex', color: copied ? '#0E9F6E' : MUTE, padding: 4 }}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
        </div>

        <button onClick={() => navigate('/supplier/shop')} className="msup-tap" style={{ marginTop: 16, width: '100%', background: INK, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Store size={16} /> Gérer ma vitrine
        </button>
      </div>

      {/* ═══ Abonnement ═══ */}
      <div style={{ padding: '16px 14px 0' }}>
        <MobileSubscription />
      </div>

      {/* ═══ Compte ═══ */}
      <MobileCard icon={<Building2 size={19} color={INK} />} title="Informations de la boutique" rows={ACCOUNT_ROWS} />

      {/* ═══ Sécurité ═══ */}
      <MobileCard icon={<ShieldCheck size={19} color={INK} />} title="Sécurité du compte" rows={SECU_ROWS} />

      {/* ═══ Déconnexion ═══ */}
      <div style={{ padding: '4px 14px 0' }}>
        <button onClick={doLogout} className="msup-tap" style={{ width: '100%', background: '#fff', color: '#B91C1C', border: `1px solid ${LINE}`, borderRadius: 14, padding: '15px', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <LogOut size={17} /> Se déconnecter
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ABONNEMENT — plans empilés verticalement (mobile)
// ═══════════════════════════════════════════════════════════════════
function MobileSubscription() {
  const [current, setCurrent] = useState(null)
  const [plans, setPlans]     = useState([])
  const [loading, setLoading] = useState(true)
  const [changing, setChanging] = useState(null)
  const [msg, setMsg]         = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      subsApi.mine().catch(() => null),
      subsApi.plans().catch(() => []),
    ]).then(([mine, pl]) => {
      setCurrent(mine)
      setPlans(Array.isArray(pl) ? pl : (pl?.results || []))
    }).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const currentPlanId = current?.plan?.id

  async function pick(planId) {
    if (planId === currentPlanId) return
    setChanging(planId); setMsg(null)
    try {
      const res = await subsApi.changePlan(planId)
      if (res === null) { setMsg({ type: 'err', text: 'Session expirée. Reconnecte-toi.' }); return }
      setCurrent(res)
      setMsg({ type: 'ok', text: 'Plan mis à jour.' })
    } catch (e) {
      setMsg({ type: 'err', text: e.message || 'Changement impossible.' })
    } finally {
      setChanging(null)
    }
  }

  return (
    <section style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: '16px 16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
        <CreditCard size={19} color={INK} />
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Abonnement</h2>
      </div>
      {current?.plan && (
        <p style={{ margin: '0 0 12px', fontSize: 12.5, color: MUTE }}>
          Plan actuel : <strong style={{ color: ORANGE }}>{current.plan.name}</strong>
        </p>
      )}

      {msg && (
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 12, padding: '10px 12px', borderRadius: 10,
          background: msg.type === 'ok' ? '#ECFDF5' : '#FEE2E2', color: msg.type === 'ok' ? '#059669' : '#DC2626' }}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: MUTE, padding: '10px 0' }}>
          <Loader2 size={16} className="msup-spin" /> <span style={{ fontSize: 13 }}>Chargement…</span>
        </div>
      ) : plans.length === 0 ? (
        <p style={{ fontSize: 13, color: FAINT, margin: '8px 0 0' }}>Aucun plan disponible.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {plans.map((pl) => {
            const isCurrent = pl.id === currentPlanId
            const busy = changing === pl.id
            return (
              <div key={pl.id} style={{
                border: `1.5px solid ${isCurrent ? ORANGE : LINE}`, borderRadius: 14, padding: 15,
                background: isCurrent ? SOFT : '#fff', position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Zap size={15} color={ORANGE} />
                    <span style={{ fontSize: 15.5, fontWeight: 800 }}>{pl.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: INK }}>{fmtTND(pl.price_tnd)}</span>
                    <span style={{ fontSize: 11, color: MUTE, marginLeft: 3 }}>TND/mois</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: MUTE, marginBottom: 12 }}>
                  <span>Commission <strong style={{ color: INK }}>{pl.commission_pct}%</strong></span>
                  <span>Produits <strong style={{ color: INK }}>{pl.max_products ?? 'Illimité'}</strong></span>
                </div>
                <button disabled={isCurrent || busy} onClick={() => pick(pl.id)} className="msup-tap"
                  style={{
                    width: '100%', padding: '12px', borderRadius: 11, border: 'none',
                    fontSize: 13.5, fontWeight: 700, cursor: isCurrent ? 'default' : 'pointer', fontFamily: FONT,
                    background: isCurrent ? '#F0F0F0' : ORANGE, color: isCurrent ? MUTE : '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: busy ? 0.6 : 1,
                  }}>
                  {busy ? <Loader2 size={14} className="msup-spin" /> : null}
                  {isCurrent ? 'Plan actuel' : busy ? 'Changement…' : 'Choisir ce plan'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ── Carte de réglages (mobile) ──────────────────────────────────────
function MobileCard({ icon, title, rows }) {
  return (
    <div style={{ padding: '16px 14px 0' }}>
      <section style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 16px 10px' }}>
          {icon}
          <h2 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: INK }}>{title}</h2>
        </div>
        {rows.map((r, i) => <MobileRow key={i} first={i === 0} {...r} />)}
      </section>
    </div>
  )
}

function MobileRow({ label, value, onClick, chevron, first }) {
  const clickable = !!onClick
  return (
    <div onClick={onClick} className={clickable ? 'msup-tap' : ''}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        borderTop: first ? 'none' : `1px solid ${LINE}`,
        cursor: clickable ? 'pointer' : 'default', padding: '15px 16px', minHeight: 22,
      }}>
      <span style={{ flex: '0 0 auto', fontSize: 14, color: INK, minWidth: value ? 130 : 'auto' }}>{label}</span>
      {value && <span style={{ flex: 1, fontSize: 13, color: FAINT, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>}
      {chevron && <ChevronRight size={18} color={FAINT} style={{ flexShrink: 0, marginLeft: value ? 4 : 'auto' }} />}
    </div>
  )
}