// pages/ParametresPage.jsx — GROSHOP.tn
// Paramètres du compte acheteur (style AliExpress « Mon compte »).
// Rendu dans DashboardLayout via <Outlet /> → /dashboard/parametres.
//
// Les lignes renvoient vers des sous-pages /dashboard/parametres/<slug>
// (encore en placeholder « en construction » tant qu'on ne les a pas créées).

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserCircle, ShieldCheck, SlidersHorizontal,
  Camera, Pencil, Copy, Check, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ORANGE = '#FF4500'
const INK    = '#0F1419'
const MUTE   = '#6B7785'
const FAINT  = '#9AA3AE'
const LINE   = '#E8EAED'
const SOFT   = '#FFF0E8'
const FONT   = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const asText = (v) => {
  if (v == null) return ''
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (typeof v === 'object') return v.content || v.text || v.name || v.title || ''
  return ''
}
const maskEmail = (e = '') => {
  const [u, d] = String(e).split('@')
  if (!d) return e
  return `${u.slice(0, 3)}***@${d}`
}

const CSS = `
.ps-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
@media (max-width: 900px) { .ps-grid { grid-template-columns: 1fr; } }
.ps-head { display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap; }
`

// ═══════════════════════════════════════════════════════════════════
export default function ParametresPage() {
  const auth = useAuth()
  const user = auth.user
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const memberId = asText(user.id) || asText(user.member_id)
  const email    = asText(user.email)
  const name     = asText(user.full_name) || email.split('@')[0]
  const initial  = (name || '?')[0].toUpperCase()
  const googleLinked = user.google_connected ?? (user.provider === 'google')

  const go = (slug) => navigate(`/dashboard/parametres/${slug}`)

  const copyId = () => {
    if (!memberId) return
    navigator.clipboard?.writeText(memberId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }

  // ⚠️ confirme le nom réel dans AuthContext (logout / signOut / disconnect)
  const doLogout = () => {
    const fn = auth.logout || auth.signOut || auth.disconnect
    if (fn) fn()
    navigate('/login')
  }

  const INFO_ROWS = [
    { label: 'Mon profil',            onClick: () => go('profil') },
    { label: 'Profil de membre',      onClick: () => go('membre') },
    { label: 'Comptes connectés',     onClick: () => go('comptes'), badge: googleLinked ? <GoogleBadge /> : null },
    { label: 'Informations fiscales', onClick: () => go('fiscal') },
  ]
  const SECU_ROWS = [
    { label: 'Modifier le mot de passe',       onClick: () => go('mot-de-passe') },
    { label: "Changer l'adresse e-mail",       onClick: () => go('email'), value: maskEmail(email) },
    { label: 'Changer de numéro de téléphone', onClick: () => go('telephone') },
    { label: 'Supprimer le compte',            onClick: () => go('supprimer'), danger: true },
  ]
  const PREF_ROWS = [
    { label: 'Paramètres de confidentialité', onClick: () => go('confidentialite') },
    { label: "Préférences d'e-mails",         onClick: () => go('emails') },
    { label: 'Préférences publicitaires',     onClick: () => go('publicite') },
  ]

  return (
    <div style={{ padding: '24px clamp(16px, 2vw, 32px) 48px', fontFamily: FONT, color: INK }}>
      <style>{CSS}</style>

      {/* ═══ En-tête profil ═══ */}
      <div className="ps-head" style={{ marginBottom: 28 }}>
        <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user.avatar_url
              ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 38, fontWeight: 800, color: ORANGE }}>{initial}</span>}
          </div>
          <button title="Changer la photo" style={{
            position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%',
            background: '#fff', border: `1px solid ${LINE}`, cursor: 'pointer', color: MUTE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Camera size={15} />
          </button>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: '4px 0 10px', fontSize: 24, fontWeight: 800 }}>{name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 6 }}>
            <span style={{ color: MUTE }}>E-mail</span>
            <span>{maskEmail(email)}</span>
            <button onClick={() => go('email')} title="Modifier" style={{ border: 'none', background: 'none', cursor: 'pointer', color: MUTE, display: 'inline-flex' }}>
              <Pencil size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <span style={{ color: MUTE }}>Identifiant de membre</span>
            <span>{memberId}</span>
            <button onClick={copyId} title="Copier" style={{
              border: 'none', background: 'none', cursor: 'pointer', display: 'inline-flex',
              color: copied ? '#0E9F6E' : MUTE,
            }}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
          <button onClick={() => go('profil')} style={{
            background: INK, color: '#fff', border: 'none', borderRadius: 30,
            padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
          }}>Modifier mon profil</button>
          <button onClick={doLogout} style={{
            background: 'none', border: 'none', color: INK, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
          }}>Se déconnecter</button>
        </div>
      </div>

      {/* ═══ Cartes de réglages ═══ */}
      <div className="ps-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card icon={<UserCircle size={22} color={INK} />} title="Informations du compte" rows={INFO_ROWS} />
          <Card icon={<SlidersHorizontal size={22} color={INK} />} title="Préférences" rows={PREF_ROWS} />
        </div>
        <div>
          <Card icon={<ShieldCheck size={22} color={INK} />} title="Sécurité du compte" rows={SECU_ROWS} />
        </div>
      </div>
    </div>
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

function Row({ label, value, badge, onClick, danger, first }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
        background: hov ? '#FAFAFA' : 'none', border: 'none',
        borderTop: first ? 'none' : `1px solid ${LINE}`, cursor: 'pointer',
        padding: '15px 4px', fontFamily: FONT,
      }}>
      <span style={{ flex: 1, fontSize: 14.5, color: danger ? '#B91C1C' : INK }}>{label}</span>
      {badge}
      {value && <span style={{ fontSize: 13.5, color: FAINT }}>{value}</span>}
      <ChevronRight size={18} color={FAINT} />
    </button>
  )
}

function GoogleBadge() {
  return (
    <span style={{
      width: 20, height: 20, borderRadius: '50%', border: `1px solid ${LINE}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 800, color: '#4285F4', background: '#fff',
    }}>G</span>
  )
}