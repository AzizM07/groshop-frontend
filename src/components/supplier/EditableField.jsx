// components/supplier/EditableField.jsx — GROSHOP.tn

import { useState } from 'react'
import * as Icons from 'lucide-react'

// ── Inject hover styles globalement ────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-editable-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-editable-styles'
  s.textContent = `
    .gs-editable {
      position: relative;
      cursor: pointer;
      padding: 4px 8px;
      margin: -4px -8px;
      border-radius: 8px;
      transition: background 0.15s ease, outline 0.15s ease;
      outline: 1px dashed transparent;
    }
    .gs-editable:hover {
      background: rgba(255, 69, 0, 0.05);
      outline-color: rgba(255, 69, 0, 0.25);
    }
    .gs-editable:hover .gs-edit-icon { opacity: 1; }
    .gs-edit-icon {
      opacity: 0;
      transition: opacity 0.15s ease;
      flex-shrink: 0;
    }
  `
  document.head.appendChild(s)
}

export default function EditableField({
  value,
  onSave,
  multiline = false,
  placeholder = 'Cliquer pour modifier',
  style = {},
  maxLength,
  prefix,
  type = 'text',
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (draft === value) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await onSave(draft)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDraft(value || '')
    setEditing(false)
  }

  const handleKey = (e) => {
    if (!multiline && e.key === 'Enter')  { e.preventDefault(); handleSave() }
    if (e.key === 'Escape')                handleCancel()
  }

  if (editing) {
    const InputTag = multiline ? 'textarea' : 'input'
    return (
      <div style={{ width: '100%' }}>
        <InputTag
          autoFocus
          type={type}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={multiline ? 5 : undefined}
          style={{
            border: '2px solid #FF4500',
            borderRadius: 10,
            padding: '10px 12px',
            width: '100%',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: style.fontSize || 14,
            fontWeight: style.fontWeight || 400,
            color: '#0F1419',
            background: '#fff',
            resize: multiline ? 'vertical' : undefined,
            lineHeight: style.lineHeight || 1.5,
            boxShadow: '0 4px 12px -4px rgba(255, 69, 0, 0.25)',
          }}
        />

        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: '#FF4500',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              cursor: saving ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'inherit',
              opacity: saving ? 0.7 : 1,
            }}>
            <Icons.Check size={13} strokeWidth={2.6} />
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button
            onClick={handleCancel}
            style={{
              background: '#F5F6F8',
              color: '#6B7280',
              border: 'none',
              borderRadius: 8,
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'inherit',
            }}>
            <Icons.X size={13} strokeWidth={2.5} />
            Annuler
          </button>
          {!multiline && (
            <span style={{ fontSize: 10, color: '#9AA3AE', alignSelf: 'center', marginLeft: 'auto' }}>
              Entrée = enregistrer · Échap = annuler
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className="gs-editable"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        ...style,
      }}
    >
      {prefix && <span style={{ color: '#9AA3AE', flexShrink: 0 }}>{prefix}</span>}
      <span style={{ flex: 1, minWidth: 0 }}>
        {value || (
          <span style={{ color: '#9AA3AE', fontStyle: 'italic', fontWeight: 400 }}>
            {placeholder}
          </span>
        )}
      </span>
      <Icons.Pencil
        size={13}
        className="gs-edit-icon"
        color="#FF4500"
        strokeWidth={2}
      />
    </div>
  )
}