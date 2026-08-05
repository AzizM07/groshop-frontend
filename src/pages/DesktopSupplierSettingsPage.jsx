// pages/SupplierSettingsPage.jsx — GROSHOP.tn
// Paramètres fournisseur : Compte · Sécurité · Abonnement (changement de plan réel).
// Branché sur auth.supplierMe() + subscriptions.{plans,mine,changePlan}.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserCircle, ShieldCheck, CreditCard, Camera, Pencil, Copy, Check, ChevronRight,
  Loader2, BadgeCheck, Clock, XCircle, Store, Zap, AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { auth as authApi, subscriptions as subsApi } from '../lib/api'

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
  approved: { label: 'Vérifié',     color: '#059669', bg: '#ECFDF5', icon: BadgeCheck },
  pending:  { label: 'En attente',  color: '#D97706', bg: '#FEF3C7', icon: Clock },
  rejected: { label: 'Rejeté',      color: '#DC2626', bg: '#FEE2E2', icon: XCircle },
}

const CSS = `
.sup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
@media (max-width: 900px) { .sup-grid { grid-template-columns: 1fr; } }
.sup-head { display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap; }
@keyframes sup-spin { to { transform: rotate(360deg); } }
.sup-spin { animation: sup-spin .8s linear infinite; }
`

// ═══════════════════════════════════════════════════════════════════
export default function DesktopSupplierSettingsPage() {
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
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTE, gap: 10, fontFamily: FONT }}>
        <Loader2 size={20} className="sup-spin" /> <span>Chargement…</span>
        <style>{CSS}</style>
      </div>
    )
  }
  if (error || !profile) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: MUTE, fontFamily: FONT }}>
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
    { label: 'Modifier le mot de passe',       onClick: () => go('mot-de-passe'), chevron: true },
    { label: "Changer l'adresse e-mail",       onClick: () => go('email'), value: maskEmail(email), chevron: true },
    { label: 'Changer de numéro de téléphone', onClick: () => go('telephone'), value: asText(profile.phone) || '—', chevron: true },
  ]

  return (
    <div style={{ padding: '24px clamp(16px, 2vw, 32px) 48px', fontFamily: FONT, color: INK }}>
      <style>{CSS}</style>

      {/* ═══ En-tête ═══ */}
      <div className="sup-head" style={{ marginBottom: 28 }}>
        <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profile.store?.logo_url
              ? <img src={profile.store.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              : <span style={{ fontSize: 38, fontWeight: 800, color: ORANGE }}>{initial}</span>}
          </div>
          <button title="Modifier via la vitrine" onClick={() => navigate('/supplier/shop')} style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%', background: '#fff', border: `1px solid ${LINE}`, cursor: 'pointer', color: MUTE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={15} />
          </button>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '4px 0 10px' }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{company || name}</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: verif.bg, color: verif.color, padding: '4px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
              <VerifIcon size={13} /> {verif.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 6 }}>
            <span style={{ color: MUTE }}>E-mail</span>
            <span>{maskEmail(email)}</span>
            <button onClick={() => go('email')} title="Modifier" style={{ border: 'none', background: 'none', cursor: 'pointer', color: MUTE, display: 'inline-flex' }}>
              <Pencil size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <span style={{ color: MUTE }}>Identifiant boutique</span>
            <span style={{ fontSize: 12.5 }}>{asText(profile.id).slice(0, 8)}…</span>
            <button onClick={copyId} title="Copier" style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'inline-flex', color: copied ? '#0E9F6E' : MUTE }}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
          <button onClick={() => navigate('/supplier/shop')} style={{ background: INK, color: '#fff', border: 'none', borderRadius: 30, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <Store size={16} /> Gérer ma vitrine
          </button>
          <button onClick={doLogout} style={{ background: 'none', border: 'none', color: INK, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
            Se déconnecter
          </button>
        </div>
      </div>

      {/* ═══ Abonnement (pleine largeur) ═══ */}
      <SubscriptionCard />

      {/* ═══ Compte + Sécurité ═══ */}
      <div className="sup-grid" style={{ marginTop: 20 }}>
        <Card icon={<UserCircle size={22} color={INK} />} title="Informations de la boutique" rows={ACCOUNT_ROWS} />
        <Card icon={<ShieldCheck size={22} color={INK} />} title="Sécurité du compte" rows={SECU_ROWS} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ABONNEMENT
// ═══════════════════════════════════════════════════════════════════
function SubscriptionCard() {
  const [current, setCurrent] = useState(null)
  const [plans, setPlans]     = useState([])
  const [loading, setLoading] = useState(true)
  const [changing, setChanging] = useState(null)   // id du plan en cours de changement
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
    <section style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: '18px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <CreditCard size={22} color={INK} />
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Abonnement</h2>
        {current?.plan && (
          <span style={{ marginLeft: 'auto', fontSize: 12.5, color: MUTE }}>
            Plan actuel : <strong style={{ color: ORANGE }}>{current.plan.name}</strong>
          </span>
        )}
      </div>

      {msg && (
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 12, padding: '9px 12px', borderRadius: 8,
          background: msg.type === 'ok' ? '#ECFDF5' : '#FEE2E2', color: msg.type === 'ok' ? '#059669' : '#DC2626' }}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: MUTE, padding: '12px 0' }}>
          <Loader2 size={16} className="sup-spin" /> <span style={{ fontSize: 13 }}>Chargement des plans…</span>
        </div>
      ) : plans.length === 0 ? (
        <p style={{ fontSize: 13, color: FAINT, margin: 0 }}>Aucun plan disponible pour le moment.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`, gap: 12 }}>
          {plans.map((pl) => {
            const isCurrent = pl.id === currentPlanId
            const busy = changing === pl.id
            return (
              <div key={pl.id} style={{
                border: `1.5px solid ${isCurrent ? ORANGE : LINE}`, borderRadius: 14, padding: 18,
                background: isCurrent ? SOFT : '#fff', position: 'relative', display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                {isCurrent && (
                  <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 10.5, fontWeight: 800, color: ORANGE, textTransform: 'uppercase', letterSpacing: 0.4 }}>Actuel</span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={16} color={ORANGE} />
                  <span style={{ fontSize: 16, fontWeight: 800 }}>{pl.name}</span>
                </div>
                <div>
                  <span style={{ fontSize: 26, fontWeight: 900, color: INK }}>{fmtTND(pl.price_tnd)}</span>
                  <span style={{ fontSize: 12, color: MUTE, marginLeft: 4 }}>TND / mois</span>
                </div>
                <div style={{ fontSize: 12.5, color: MUTE, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span>Commission : <strong style={{ color: INK }}>{pl.commission_pct}%</strong></span>
                  <span>Produits : <strong style={{ color: INK }}>{pl.max_products ?? 'Illimité'}</strong></span>
                </div>
                <button disabled={isCurrent || busy} onClick={() => pick(pl.id)}
                  style={{
                    marginTop: 'auto', width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                    fontSize: 13, fontWeight: 700, cursor: isCurrent ? 'default' : 'pointer', fontFamily: FONT,
                    background: isCurrent ? '#F0F0F0' : ORANGE, color: isCurrent ? MUTE : '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: busy ? 0.6 : 1,
                  }}>
                  {busy ? <Loader2 size={14} className="sup-spin" /> : null}
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

// ── Sous-composants ─────────────────────────────────────────────────
function Card({ icon, title, rows }) {
  return (
    <section style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: '18px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 6 }}>
        {icon}
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: INK }}>{title}</h2>
      </div>
      {rows.map((r, i) => <Row key={i} first={i === 0} {...r} />)}
    </section>
  )
}

function Row({ label, value, onClick, danger, chevron, first }) {
  const [hov, setHov] = useState(false)
  const clickable = !!onClick
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
        background: (clickable && hov) ? '#FAFAFA' : 'none',
        borderTop: first ? 'none' : `1px solid ${LINE}`, cursor: clickable ? 'pointer' : 'default',
        padding: '15px 4px',
      }}>
      <span style={{ flex: 1, fontSize: 14.5, color: danger ? '#B91C1C' : INK }}>{label}</span>
      {value && <span style={{ fontSize: 13.5, color: FAINT, textAlign: 'right', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>}
      {chevron && <ChevronRight size={18} color={FAINT} />}
    </div>
  )
}