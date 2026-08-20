// src/components/CustomizationPopup.jsx — GROSHOP.tn
// Popup partagée desktop/mobile pour la personnalisation produit.
// Mode 'fixed' → ajoute au panier direct.
// Mode 'quote' → crée une CustomizationRequest + redirige vers la messagerie.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Upload, Loader2, Image as ImgIcon, FileText, Send, ShoppingCart, Info } from 'lucide-react'
import { customization as customizationApi, cart as cartApi } from '../lib/api'

const ORANGE = '#FF5E20'
const INK = '#0F1419', SUB = '#3D4853', MUTE = '#6B7785', LINE = '#ECEEF1', FAINT = '#9AA3AE'
const FONT = '"DM Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif'

const toNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n }
const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function CustomizationPopup({ product, variantId = null, unitBasePrice = 0, onClose, onAdded }) {
  const navigate = useNavigate()
  const fields = product?.customization_fields || []
  const mode = product?.customization_mode || 'fixed'
  const extraPrice = toNum(product?.customization_extra_price_tnd)
  const moq = product?.moq || 1
  const unit = product?.unit || 'pièce'

  const [values, setValues] = useState({})           // { [field_id]: string_or_url }
  const [uploading, setUploading] = useState({})      // { [field_id]: bool }
  const [qty, setQty] = useState(String(moq))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Lock body scroll pendant que la popup est ouverte
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const parsedQty = parseInt(qty) || 0
  const qtyValid = parsedQty >= moq
  const unitPrice = mode === 'fixed' ? unitBasePrice + extraPrice : null
  const total = mode === 'fixed' ? unitPrice * parsedQty : null

  const setValue = (fieldId, val) => setValues(v => ({ ...v, [fieldId]: val }))

  async function handleFileUpload(field, file) {
    if (!file) return
    setUploading(u => ({ ...u, [field.id]: true }))
    setError('')
    try {
      const res = await customizationApi.uploadFile(file)
      setValue(field.id, res.url)
    } catch (e) {
      setError(e.message || "Échec de l'upload")
    } finally {
      setUploading(u => ({ ...u, [field.id]: false }))
    }
  }

  function validate() {
    if (!qtyValid) return `Quantité minimale : ${moq} ${unit}`
    for (const f of fields) {
      if (f.required && !values[f.id]) return `Le champ « ${f.label} » est obligatoire`
    }
    if (Object.values(uploading).some(Boolean)) return 'Attends la fin des uploads'
    return null
  }

  async function submit() {
    const err = validate()
    if (err) { setError(err); return }
    setSubmitting(true); setError('')

    const valuesArray = fields
      .filter(f => values[f.id])
      .map(f => ({
        field_id: f.id,
        label: f.label,
        field_type: f.field_type,
        value: values[f.id],
      }))

    try {
      if (mode === 'fixed') {
        const item = await cartApi.add(product.id, parsedQty, variantId, {
          isCustomized: true,
          customizationValues: valuesArray,
        })
        if (item === null) { alert('Session expirée.'); return }
        onAdded?.(item)
        onClose()
      } else {
        // mode 'quote' → crée la demande + redirige vers la conversation
        const req = await customizationApi.createRequest({
          product_id: product.id,
          variant_id: variantId,
          quantity: parsedQty,
          values: valuesArray,
        })
        if (req === null) {
          if (window.confirm('Connexion requise pour demander un devis. Se connecter maintenant ?')) {
            navigate('/login?next=' + encodeURIComponent(window.location.pathname))
          }
          return
        }
        onClose()
        if (req.conversation) navigate(`/dashboard/messages/${req.conversation}`)
        else navigate('/dashboard/messages')
      }
    } catch (e) {
      setError(e.message || 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const ctaLabel = mode === 'quote' ? 'Demander un devis' : 'Ajouter au panier'
  const CtaIcon = mode === 'quote' ? Send : ShoppingCart

  return (
    <div onClick={onClose} style={S.backdrop}>
      <div onClick={e => e.stopPropagation()} style={S.modal}>
        {/* Header */}
        <div style={S.header}>
          <div style={{ minWidth: 0 }}>
            <div style={S.headerBadge}>{mode === 'quote' ? '📋 Sur devis' : '✨ Personnaliser'}</div>
            <h2 style={S.title}>{product.name}</h2>
          </div>
          <button onClick={onClose} style={S.closeBtn} aria-label="Fermer"><X size={20} /></button>
        </div>

        {/* Body scrollable */}
        <div style={S.body}>
          {product.customization_instructions && (
            <div style={S.instructions}>
              <Info size={15} style={{ flexShrink: 0, marginTop: 2, color: ORANGE }} />
              <span>{product.customization_instructions}</span>
            </div>
          )}

          {fields.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: MUTE, fontSize: 14 }}>
              Aucun champ de personnalisation configuré.
            </div>
          )}

          {fields.map(f => (
            <FieldInput
              key={f.id}
              field={f}
              value={values[f.id]}
              uploading={!!uploading[f.id]}
              onChange={val => setValue(f.id, val)}
              onFile={file => handleFileUpload(f, file)}
              onClear={() => setValue(f.id, '')}
            />
          ))}

          {/* Quantité */}
          <div style={S.qtyRow}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.qtyLabel}>Quantité</div>
              <div style={S.qtyHint}>MOQ : <strong style={{ color: INK }}>{moq} {unit}</strong></div>
            </div>
            <input
              type="number"
              min={moq}
              value={qty}
              onChange={e => setQty(e.target.value)}
              style={S.qtyInput}
            />
          </div>

          {/* Prix (fixed uniquement) */}
          {mode === 'fixed' && (
            <div style={S.priceBox}>
              <div>
                <div style={S.priceLabel}>Prix total</div>
                <div style={S.priceHint}>
                  {parsedQty} × {fmt(unitBasePrice)}
                  {extraPrice > 0 && <span style={{ color: ORANGE }}> + {fmt(extraPrice)} perso</span>} TND
                </div>
              </div>
              <div style={S.priceValue}>{fmt(total)} <span style={{ fontSize: 15 }}>TND</span></div>
            </div>
          )}

          {mode === 'quote' && (
            <div style={S.quoteHint}>
              <Info size={14} style={{ flexShrink: 0, color: '#92600A' }} />
              <span>Le fournisseur recevra ta demande et t'enverra un devis dans la messagerie. Tu pourras ensuite l'accepter pour ajouter au panier.</span>
            </div>
          )}

          {error && <div style={S.error}>{error}</div>}
        </div>

        {/* Footer sticky */}
        <div style={S.footer}>
          <button onClick={onClose} style={S.btnGhost} disabled={submitting}>Annuler</button>
          <button onClick={submit} disabled={submitting} style={S.btnPrimary}>
            {submitting ? <Loader2 size={16} className="cp-spin" /> : <CtaIcon size={16} />}
            {submitting ? 'Envoi…' : ctaLabel}
          </button>
        </div>
      </div>

      <style>{`
        .cp-spin { animation: cp-rot .8s linear infinite; }
        @keyframes cp-rot { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

/* ─── Rendu d'un champ selon field_type ─── */
function FieldInput({ field, value, uploading, onChange, onFile, onClear }) {
  const label = (
    <label style={S.fieldLabel}>
      {field.label}
      {field.required && <span style={{ color: ORANGE, marginLeft: 3 }}>*</span>}
    </label>
  )

  if (field.field_type === 'text') {
    return (
      <div style={S.field}>
        {label}
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          maxLength={field.constraints?.max_chars || 200}
          placeholder="Ta saisie…"
          style={S.input}
        />
      </div>
    )
  }

  if (field.field_type === 'number') {
    return (
      <div style={S.field}>
        {label}
        <input type="number" value={value || ''} onChange={e => onChange(e.target.value)} style={S.input} />
      </div>
    )
  }

  if (field.field_type === 'color') {
    return (
      <div style={S.field}>
        {label}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="color"
            value={value || '#000000'}
            onChange={e => onChange(e.target.value)}
            style={{ width: 60, height: 44, border: `1.5px solid ${LINE}`, borderRadius: 10, cursor: 'pointer', background: '#fff', padding: 4 }}
          />
          <input
            type="text"
            value={value || ''}
            placeholder="#000000"
            onChange={e => onChange(e.target.value)}
            style={{ ...S.input, flex: 1 }}
          />
        </div>
      </div>
    )
  }

  // image / file
  const isImage = field.field_type === 'image'
  return (
    <div style={S.field}>
      {label}
      {value ? (
        <div style={S.filePreview}>
          {isImage ? (
            <img src={value} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8 }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: '#F7F8FA', borderRadius: 8 }}>
              <FileText size={20} color={ORANGE} />
              <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: INK, textDecoration: 'none', wordBreak: 'break-all' }}>
                Fichier uploadé
              </a>
            </div>
          )}
          <button type="button" onClick={onClear} style={S.fileRemoveBtn}><X size={14} /></button>
        </div>
      ) : (
        <label style={{ ...S.dropzone, ...(uploading ? { opacity: 0.6, cursor: 'wait' } : null) }}>
          <input
            type="file"
            accept={isImage ? 'image/*' : 'image/*,application/pdf,.ai,.eps,.svg'}
            style={{ display: 'none' }}
            disabled={uploading}
            onChange={e => { onFile(e.target.files[0]); e.target.value = '' }}
          />
          {uploading ? <Loader2 size={22} className="cp-spin" color={ORANGE} /> : (isImage ? <ImgIcon size={22} color="#c2c8d0" /> : <Upload size={22} color="#c2c8d0" />)}
          <span style={{ fontSize: 13, color: MUTE, marginTop: 8, textAlign: 'center' }}>
            {uploading ? 'Upload en cours…' : `Cliquez pour uploader ${isImage ? 'une image' : 'un fichier'}`}
          </span>
          {!uploading && (
            <span style={{ fontSize: 11, color: FAINT, marginTop: 4 }}>
              {isImage ? 'PNG, JPG, WebP · max 15 Mo' : 'Images, PDF, SVG, AI, EPS · max 15 Mo'}
            </span>
          )}
        </label>
      )}
    </div>
  )
}

/* ─── Styles ─── */
const S = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(15, 20, 25, 0.65)', backdropFilter: 'blur(4px)',
    zIndex: 5000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0,
    animation: 'cp-fadein 0.15s ease',
  },
  modal: {
    background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 560,
    maxHeight: '92dvh', display: 'flex', flexDirection: 'column', fontFamily: FONT, color: INK,
    boxShadow: '0 -8px 32px rgba(0,0,0,0.25)',
  },
  header: {
    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '20px 20px 14px',
    borderBottom: `1px solid ${LINE}`,
  },
  headerBadge: {
    display: 'inline-block', fontSize: 11.5, fontWeight: 700, color: ORANGE, background: '#FFF3EE',
    padding: '4px 10px', borderRadius: 6, marginBottom: 8,
  },
  title: { fontSize: 17, fontWeight: 800, margin: 0, lineHeight: 1.3, letterSpacing: '-0.2px' },
  closeBtn: {
    width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#F4F5F7',
    color: INK, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },

  body: { flex: 1, overflowY: 'auto', padding: '18px 20px', minHeight: 0 },
  instructions: {
    display: 'flex', gap: 10, background: '#FFF8F3', border: `1px solid #FFE1CE`,
    borderRadius: 12, padding: '12px 14px', marginBottom: 18, fontSize: 13, color: SUB, lineHeight: 1.5,
  },
  field: { marginBottom: 18 },
  fieldLabel: { display: 'block', fontSize: 12.5, fontWeight: 700, color: SUB, marginBottom: 8 },
  input: {
    width: '100%', height: 44, padding: '0 14px', border: `1.5px solid ${LINE}`, borderRadius: 10,
    fontSize: 14, color: INK, background: '#fff', fontFamily: FONT, outline: 'none', boxSizing: 'border-box',
  },
  dropzone: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: 130, border: `2px dashed #E0E4EA`, borderRadius: 12, cursor: 'pointer',
    background: '#FAFBFC', padding: 16, transition: 'border-color .15s, background .15s',
  },
  filePreview: {
    position: 'relative', border: `1px solid ${LINE}`, borderRadius: 10, padding: 8, background: '#fff',
  },
  fileRemoveBtn: {
    position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%',
    border: 'none', background: 'rgba(15,20,25,0.7)', color: '#fff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  qtyRow: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
    background: '#FAFBFC', borderRadius: 12, marginBottom: 12,
  },
  qtyLabel: { fontSize: 11, fontWeight: 800, color: FAINT, letterSpacing: '.3px' },
  qtyHint: { fontSize: 13, color: MUTE, marginTop: 3 },
  qtyInput: {
    width: 90, height: 44, textAlign: 'center', border: `1.5px solid ${LINE}`, borderRadius: 10,
    fontSize: 15, fontWeight: 800, color: INK, outline: 'none', background: '#fff', fontFamily: FONT,
  },

  priceBox: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    padding: '14px 16px', background: '#F7F8FA', borderRadius: 12, marginBottom: 4,
  },
  priceLabel: { fontSize: 11, fontWeight: 800, color: FAINT, letterSpacing: '.3px' },
  priceHint: { fontSize: 12, color: MUTE, marginTop: 3 },
  priceValue: { fontSize: 22, fontWeight: 900, color: ORANGE, letterSpacing: '-0.5px' },

  quoteHint: {
    display: 'flex', gap: 10, background: '#FEF9E7', border: '1px solid #FDE68A',
    borderRadius: 12, padding: '12px 14px', fontSize: 12.5, color: '#78530A', lineHeight: 1.5,
  },

  error: {
    marginTop: 12, padding: '10px 12px', background: '#FDF1F1', border: '1px solid #FBCACA',
    borderRadius: 10, fontSize: 13, color: '#E11900',
  },

  footer: {
    display: 'flex', gap: 10, padding: '14px 20px calc(14px + env(safe-area-inset-bottom))',
    borderTop: `1px solid ${LINE}`, background: '#fff',
  },
  btnGhost: {
    flex: '0 0 auto', padding: '0 20px', height: 46, borderRadius: 12, border: `1.5px solid ${LINE}`,
    background: '#fff', color: SUB, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
  },
  btnPrimary: {
    flex: 1, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 12, border: 'none', background: ORANGE, color: '#fff',
    fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
  },
}