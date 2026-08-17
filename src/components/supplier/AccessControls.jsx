// src/components/supplier/AccessControls.jsx — GROSHOP.tn
// Bandeau d'état d'accès + modal unlock/révoquer, réutilisé dans la messagerie
// fournisseur desktop ET mobile. Interroge /products/access/check/:userId/[?product_id=]
// et exécute les actions unlock/revoke selon la portée choisie.

import { useState, useEffect, useCallback } from 'react'
import * as Icons from 'lucide-react'
import { access } from '../../lib/api'

const ORANGE      = '#ff5e20'
const ORANGE_TINT = 'rgba(255, 94, 32, .10)'
const GREEN       = '#059669'
const GREEN_TINT  = '#D1FAE5'
const AMBER       = '#D97706'
const AMBER_TINT  = '#FEF3C7'
const INK='#0F1419', SUB='#3D4853', MUTE='#6B7785', FAINT='#9AA3AE', LINE='#EAE7DF'
const FONT='"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

/* ═══════════════════════════════════════════════════════════════════
   BANDEAU — s'insère en haut du fil de conversation.
   Props :
     userId    : id du buyer (detail.buyer?.id)
     productId : id du produit lié à la conversation (nullable)
     buyerName : pour affichage
   =================================================================== */
export function AccessBanner({ userId, productId, buyerName, compact = false }) {
  const [state, setState] = useState(null)   // null = loading, {} = loaded
  const [modalOpen, setModalOpen] = useState(false)
  const [revoking, setRevoking] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    try {
      const d = await access.check(userId, productId || null)
      setState(d || {})
    } catch {
      setState({})
    }
  }, [userId, productId])

  useEffect(() => { load() }, [load])

  if (!userId) return null

  // État en cours de chargement
  if (state === null) {
    return (
      <div style={bannerBase(compact, LINE, '#FAFAFA')}>
        <div style={{ width: 16, height: 16, border: `2px solid ${MUTE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gs-spin2 .8s linear infinite', flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, color: MUTE }}>Vérification de l'accès…</span>
      </div>
    )
  }

  // Types possibles renvoyés par le backend :
  //   'none'           → pas d'accès
  //   'auto_verified'  → user vérifié GROSHOP (accès auto, non révocable)
  //   'supplier'       → catalogue entier débloqué (unlock_id fourni)
  //   'product'        → produit précis débloqué (unlock_id + product_id)
  const type = state.unlock_type || 'none'
  const expiresAt = state.expires_at
  const isAuto = type === 'auto_verified'
  const isUnlocked = type === 'supplier' || type === 'product' || isAuto

  const doRevoke = async () => {
    if (isAuto) return
    if (!state.unlock_id) return
    if (!confirm(`Révoquer l'accès de ${buyerName || 'ce client'} ?`)) return
    setRevoking(true)
    try {
      if (type === 'supplier') await access.revokeSupplier(state.unlock_id)
      else if (type === 'product') await access.revokeProduct(state.unlock_id)
      await load()
    } catch (e) {
      alert(e?.message || 'Échec de la révocation.')
    } finally {
      setRevoking(false)
    }
  }

  // ── UI : 3 variantes d'état ────────────────────────────────────
  const style = {
    verified: { border: GREEN, bg: GREEN_TINT, iconColor: GREEN, Icon: Icons.ShieldCheck,
                title: 'Boutique vérifiée', text: 'Accès automatique GROSHOP — non révocable.' },
    supplier: { border: GREEN, bg: GREEN_TINT, iconColor: GREEN, Icon: Icons.Unlock,
                title: 'Catalogue entier débloqué', text: expiresAt ? `Expire le ${fmtDate(expiresAt)}` : 'Accès permanent' },
    product:  { border: GREEN, bg: GREEN_TINT, iconColor: GREEN, Icon: Icons.Unlock,
                title: 'Ce produit est débloqué', text: expiresAt ? `Expire le ${fmtDate(expiresAt)}` : 'Accès permanent · uniquement ce produit' },
    none:     { border: AMBER, bg: AMBER_TINT, iconColor: AMBER, Icon: Icons.Lock,
                title: 'Prix masqués pour ce client', text: 'Débloquez ce produit ou tout votre catalogue.' },
  }
  const s = style[isAuto ? 'verified' : type] || style.none

  return (
    <>
      <div style={bannerBase(compact, s.border, s.bg)}>
        <div style={{ width: compact ? 28 : 32, height: compact ? 28 : 32, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <s.Icon size={compact ? 15 : 17} color={s.iconColor} strokeWidth={2.2} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: compact ? 12.5 : 13, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {s.title}
          </div>
          <div style={{ fontSize: compact ? 11 : 11.5, color: SUB, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {s.text}
          </div>
        </div>

        {!isAuto && (
          isUnlocked ? (
            <button onClick={doRevoke} disabled={revoking}
              style={btnGhost(compact, revoking)}>
              {revoking ? '…' : 'Révoquer'}
            </button>
          ) : (
            <button onClick={() => setModalOpen(true)}
              style={btnPrimary(compact)}>
              <Icons.Unlock size={compact ? 12 : 13} strokeWidth={2.4} />
              Donner l'accès
            </button>
          )
        )}
      </div>

      {modalOpen && (
        <UnlockModal
          userId={userId}
          productId={productId}
          productName={state.product_name}
          buyerName={buyerName}
          onClose={() => setModalOpen(false)}
          onDone={() => { setModalOpen(false); load() }}
        />
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MODAL — Donner l'accès
   =================================================================== */
function UnlockModal({ userId, productId, productName, buyerName, onClose, onDone }) {
  const [scope, setScope]       = useState(productId ? 'product' : 'supplier')
  const [duration, setDuration] = useState('permanent')  // 'permanent' | '30' | '90' | '180'
  const [note, setNote]         = useState('')
  const [saving, setSaving]     = useState(false)
  const [err, setErr]           = useState('')

  const DURATIONS = [
    { key: 'permanent', label: 'Permanent', hint: 'Aucune expiration' },
    { key: '30',        label: '30 jours',  hint: '~ 1 mois' },
    { key: '90',        label: '90 jours',  hint: '~ 3 mois' },
    { key: '180',       label: '180 jours', hint: '~ 6 mois' },
  ]

  const submit = async () => {
    setSaving(true); setErr('')
    try {
      const opts = {
        duration_days: duration === 'permanent' ? null : parseInt(duration, 10),
        note: note.trim(),
      }
      if (scope === 'product') {
        if (!productId) throw new Error('Aucun produit rattaché à cette conversation.')
        await access.unlockProduct(productId, userId, opts)
      } else {
        await access.unlockSupplier(userId, opts)
      }
      onDone()
    } catch (e) {
      setErr(e?.message || 'Échec du déblocage. Réessayez.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 20, 25, .55)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: FONT }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '92vh', overflow: 'auto', boxShadow: '0 24px 60px -20px rgba(0,0,0,.35)' }}>

        {/* En-tête */}
        <div style={{ padding: '20px 22px 12px', borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: ORANGE_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icons.Unlock size={20} color={ORANGE} strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>Débloquer les prix</div>
            <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>Pour {buyerName || 'ce client'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: MUTE, display: 'flex' }}>
            <Icons.X size={20} />
          </button>
        </div>

        <div style={{ padding: '18px 22px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Portée */}
          <Section title="Portée de l'accès">
            <RadioCard
              checked={scope === 'product'}
              onChange={() => setScope('product')}
              disabled={!productId}
              icon={Icons.Package}
              title={productId ? 'Ce produit uniquement' : 'Ce produit uniquement (indisponible)'}
              subtitle={productId ? (productName || 'Le produit lié à cette conversation') : 'Aucun produit rattaché à cette conversation'}
            />
            <RadioCard
              checked={scope === 'supplier'}
              onChange={() => setScope('supplier')}
              icon={Icons.Store}
              title="Tout mon catalogue"
              subtitle="Tous vos produits actuels et futurs à prix masqué"
            />
          </Section>

          {/* Durée */}
          <Section title="Durée">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {DURATIONS.map(d => {
                const on = duration === d.key
                return (
                  <button key={d.key} onClick={() => setDuration(d.key)}
                    style={{ textAlign: 'left', padding: '11px 13px', borderRadius: 10, cursor: 'pointer', background: on ? ORANGE_TINT : '#fff', border: `${on ? 2 : 1}px solid ${on ? ORANGE : LINE}`, fontFamily: 'inherit' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: on ? ORANGE : INK }}>{d.label}</div>
                    <div style={{ fontSize: 11, color: MUTE, marginTop: 2 }}>{d.hint}</div>
                  </button>
                )
              })}
            </div>
          </Section>

          {/* Note */}
          <Section title="Note interne (optionnel)">
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Ex : Client fidèle, tarif préférentiel…"
              rows={2} maxLength={200}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${LINE}`, fontFamily: 'inherit', fontSize: 13, color: INK, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ fontSize: 10.5, color: FAINT, marginTop: 4, textAlign: 'right' }}>{note.length}/200 · visible uniquement par vous</div>
          </Section>

          {err && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#FEF2F2', color: '#B91C1C', borderRadius: 8, fontSize: 12.5 }}>
              <Icons.AlertCircle size={14} /> {err}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4, borderTop: `1px solid ${LINE}`, marginTop: 4 }}>
            <button onClick={onClose} disabled={saving}
              style={{ padding: '11px 18px', borderRadius: 10, background: '#F5F3EE', color: SUB, border: 'none', fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit' }}>
              Annuler
            </button>
            <button onClick={submit} disabled={saving || (scope === 'product' && !productId)}
              style={{ padding: '11px 20px', borderRadius: 10, background: ORANGE, color: '#fff', border: 'none', fontSize: 13, fontWeight: 800, cursor: (saving || (scope === 'product' && !productId)) ? 'default' : 'pointer', opacity: saving ? .7 : 1, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
              {saving ? 'Envoi…' : (<><Icons.Unlock size={13} strokeWidth={2.4} /> Donner l'accès</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sous-composants ─────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: FAINT, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

function RadioCard({ checked, onChange, disabled, icon: Icon, title, subtitle }) {
  return (
    <button onClick={onChange} disabled={disabled}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 14px', borderRadius: 10, background: checked ? ORANGE_TINT : '#fff', border: `${checked ? 2 : 1}px solid ${checked ? ORANGE : LINE}`, cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'left', opacity: disabled ? .5 : 1, fontFamily: 'inherit' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${LINE}` }}>
        <Icon size={16} color={checked ? ORANGE : MUTE} strokeWidth={2.2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{title}</div>
        <div style={{ fontSize: 11.5, color: MUTE, marginTop: 2, lineHeight: 1.4 }}>{subtitle}</div>
      </div>
      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${checked ? ORANGE : '#C7CBD1'}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        {checked && <div style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE }} />}
      </div>
    </button>
  )
}

// ── Styles inline factorisés ────────────────────────────────────────
function bannerBase(compact, borderColor, bg) {
  return {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: compact ? '9px 12px' : '10px 14px',
    background: bg, borderLeft: `3px solid ${borderColor}`,
    fontFamily: FONT, flexShrink: 0,
  }
}
function btnPrimary(compact) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
    padding: compact ? '6px 10px' : '7px 12px', borderRadius: 8,
    background: ORANGE, color: '#fff', border: 'none',
    fontSize: compact ? 11.5 : 12, fontWeight: 700, cursor: 'pointer',
    fontFamily: FONT,
  }
}
function btnGhost(compact, disabled) {
  return {
    flexShrink: 0,
    padding: compact ? '6px 10px' : '7px 12px', borderRadius: 8,
    background: '#fff', color: SUB, border: `1px solid ${LINE}`,
    fontSize: compact ? 11.5 : 12, fontWeight: 700,
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? .6 : 1,
    fontFamily: FONT,
  }
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return '' }
}