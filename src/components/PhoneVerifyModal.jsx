// src/components/PhoneVerifyModal.jsx
// Modale de vérification du numéro (OTP SMS).
// S'ouvre quand orders.create renvoie le gate "phone_required".
// onVerified() est appelé une fois le numéro vérifié → le checkout relance la commande.

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Phone, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react'
import { auth as authApi } from '../lib/api'

const ORANGE='#FF5E00', INK='#1A1A1A', MUTE='#7A7A7A', FAINT='#A0A0A0', LINE='#EAEAEA', SOFT='#FFF0E8', RED='#DC2626'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

// Normalise un numéro TN : 8 chiffres → +216XXXXXXXX ; "216…" → "+216…" ; garde le +… existant.
function normalizePhone(raw) {
  const s = (raw || '').replace(/\s+/g, '')
  if (!s) return ''
  if (s.startsWith('+'))   return s
  if (s.startsWith('216')) return '+' + s
  if (/^\d{8}$/.test(s))   return '+216' + s
  return s
}

// L'erreur venant d'api.js porte .data (corps JSON) et .message.
function isBanned(e) {
  const bag = [e?.data?.code, e?.data?.error, e?.data?.detail, e?.message]
    .filter(Boolean).map(v => String(v).toLowerCase())
  return bag.some(s => s.includes('phone_banned') || s.includes('banned'))
}

export default function PhoneVerifyModal({ open, onClose, onVerified, initialPhone = '', isMobile = false }) {
  const [step, setStep]         = useState('phone')   // 'phone' | 'code'
  const [phone, setPhone]       = useState(initialPhone)
  const [code, setCode]         = useState('')
  const [busy, setBusy]         = useState(false)
  const [error, setError]       = useState('')
  const [banned, setBanned]     = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [sentTo, setSentTo]     = useState('')
  const codeRef = useRef(null)

  // Reset complet à chaque ouverture
  useEffect(() => {
    if (!open) return
    setStep('phone'); setCode(''); setError(''); setBanned(false); setCooldown(0); setSentTo('')
    setPhone(initialPhone || '')
  }, [open, initialPhone])

  // Compte à rebours du renvoi
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // Focus auto sur le champ code
  useEffect(() => {
    if (step === 'code') setTimeout(() => codeRef.current?.focus(), 60)
  }, [step])

  // Bloque le scroll de la page derrière la modale
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  const sendCode = async () => {
    const p = normalizePhone(phone)
    if (!/^\+\d{8,15}$/.test(p)) { setError('Numéro invalide. Format : +216 XX XXX XXX'); return }
    setBusy(true); setError('')
    try {
      await authApi.requestPhoneOtp(p)
      setSentTo(p)
      setStep('code'); setCooldown(60)
    } catch (e) {
      if (isBanned(e)) setBanned(true)
      else setError(e?.message || 'Envoi impossible. Réessayez.')
    } finally { setBusy(false) }
  }

  const verify = async () => {
    const c = code.trim()
    if (c.length < 4) { setError('Entrez le code reçu par SMS'); return }
    setBusy(true); setError('')
    try {
      await authApi.verifyPhoneOtp(c)
      onVerified?.()   // ← le checkout relance orders.create
    } catch (e) {
      if (isBanned(e)) setBanned(true)
      else setError(e?.message || 'Code incorrect. Réessayez.')
    } finally { setBusy(false) }
  }

  // ── styles ──
  const overlay = {
    position: 'fixed', inset: 0, zIndex: 1000, fontFamily: FONT,
    background: 'rgba(15,20,25,.55)',
    display: 'flex', justifyContent: 'center',
    alignItems: isMobile ? 'flex-end' : 'center',
    padding: isMobile ? 0 : 20,
  }
  const card = {
    position: 'relative', background: '#fff', width: '100%',
    maxWidth: isMobile ? '100%' : 420,
    borderRadius: isMobile ? '20px 20px 0 0' : 18,
    padding: isMobile ? '10px 22px calc(26px + env(safe-area-inset-bottom))' : 28,
    boxShadow: '0 20px 60px rgba(0,0,0,.25)',
    boxSizing: 'border-box',
  }
  const inputBase = {
    width: '100%', boxSizing: 'border-box', border: `1px solid ${LINE}`,
    borderRadius: 10, padding: '12px 13px', fontSize: 14, fontFamily: FONT,
    outline: 'none', color: INK, background: '#fff',
  }
  const primaryBtn = {
    width: '100%', height: 50, borderRadius: 12, border: 'none', color: '#fff',
    fontSize: 15, fontWeight: 800, cursor: busy ? 'default' : 'pointer',
    opacity: busy ? .7 : 1, background: 'linear-gradient(135deg,#FF6B35,#FF4500)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  }
  const badge = (Icon, color = ORANGE, bg = SOFT) => (
    <span style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: isMobile ? '4px auto 16px' : '4px 0 16px' }}>
      <Icon size={24} color={color} />
    </span>
  )
  const center = isMobile ? { textAlign: 'center' } : {}

  let body
  if (banned) {
    body = (
      <>
        {badge(AlertTriangle, RED, '#FEE2E2')}
        <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 8, ...center }}>Numéro non autorisé</div>
        <div style={{ fontSize: 13.5, color: MUTE, lineHeight: 1.6, marginBottom: 20, ...center }}>
          Ce numéro n'est pas autorisé à passer commande. Contactez le support si vous pensez qu'il s'agit d'une erreur.
        </div>
        <button onClick={onClose} style={{ ...primaryBtn, background: INK }}>Fermer</button>
      </>
    )
  } else if (step === 'phone') {
    body = (
      <>
        {badge(Phone)}
        <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 8, ...center }}>Vérifiez votre numéro</div>
        <div style={{ fontSize: 13.5, color: MUTE, lineHeight: 1.6, marginBottom: 18, ...center }}>
          Pour confirmer votre commande, on vous envoie un code à 6 chiffres par SMS.
        </div>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: MUTE, display: 'block', marginBottom: 6 }}>Téléphone</label>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !busy && sendCode()}
          placeholder="+216 XX XXX XXX"
          inputMode="tel"
          style={{ ...inputBase, marginBottom: error ? 8 : 18 }}
        />
        {error && <div style={{ color: RED, fontSize: 12.5, marginBottom: 14 }}>{error}</div>}
        <button onClick={sendCode} disabled={busy} style={primaryBtn}>
          {busy ? 'Envoi…' : <>Envoyer le code <ArrowRight size={17} /></>}
        </button>
      </>
    )
  } else {
    body = (
      <>
        {badge(ShieldCheck)}
        <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 8, ...center }}>Entrez le code</div>
        <div style={{ fontSize: 13.5, color: MUTE, lineHeight: 1.6, marginBottom: 18, ...center }}>
          Code envoyé au {sentTo || phone}.{' '}
          <span onClick={() => { setStep('phone'); setError('') }} style={{ color: ORANGE, fontWeight: 600, cursor: 'pointer' }}>Modifier</span>
        </div>
        <input
          ref={codeRef}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={e => e.key === 'Enter' && !busy && verify()}
          placeholder="––––––"
          inputMode="numeric"
          style={{ ...inputBase, fontSize: 26, fontWeight: 800, letterSpacing: 8, textAlign: 'center', marginBottom: error ? 8 : 14 }}
        />
        {error && <div style={{ color: RED, fontSize: 12.5, marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        <button onClick={verify} disabled={busy} style={{ ...primaryBtn, marginBottom: 12 }}>
          {busy ? 'Vérification…' : 'Vérifier'}
        </button>
        <div style={{ fontSize: 12.5, color: FAINT, textAlign: 'center' }}>
          {cooldown > 0
            ? `Renvoyer le code dans ${cooldown} s`
            : <span onClick={() => !busy && sendCode()} style={{ color: ORANGE, fontWeight: 600, cursor: 'pointer' }}>Renvoyer le code</span>}
        </div>
      </>
    )
  }

  return createPortal(
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget && !busy) onClose?.() }}>
      <div style={card} onClick={e => e.stopPropagation()}>
        {isMobile && <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E0E0E0', margin: '2px auto 14px' }} />}
        {!banned && (
          <button onClick={() => !busy && onClose?.()} aria-label="Fermer"
            style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%', border: `1px solid ${LINE}`, background: '#fff', color: MUTE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        )}
        {body}
      </div>
    </div>,
    document.body,
  )
}