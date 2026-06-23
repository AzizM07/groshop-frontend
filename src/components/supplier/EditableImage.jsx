// components/supplier/EditableImage.jsx — GROSHOP.tn

import { useRef, useState } from 'react'
import * as Icons from 'lucide-react'

// ── Inject hover styles ────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-editable-image-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-editable-image-styles'
  s.textContent = `
    .gs-editable-image {
      position: relative;
      cursor: pointer;
      overflow: hidden;
      transition: transform 0.2s ease;
    }
    .gs-editable-image:hover .gs-image-overlay { opacity: 1; }
    .gs-image-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 20, 25, 0.55);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: #fff;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }
    @keyframes gs-spin {
      from { transform: rotate(0deg); } to { transform: rotate(360deg); }
    }
    .gs-spinning { animation: gs-spin 0.8s linear infinite; }
  `
  document.head.appendChild(s)
}

export default function EditableImage({
  src,
  fallback,
  onUpload,
  shape = 'rect',
  style = {},
  hint = 'Cliquer pour changer',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (maxSize && file.size > maxSize) {
      setError(`Fichier trop volumineux (max ${Math.round(maxSize / 1024 / 1024)}MB)`)
      setTimeout(() => setError(null), 3000)
      e.target.value = ''
      return
    }

    setUploading(true)
    setError(null)
    try {
      await onUpload(file)
    } catch (err) {
      setError("Échec de l'upload")
      setTimeout(() => setError(null), 3000)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const borderRadius = shape === 'circle' ? '50%' : 14

  return (
    <div
      className="gs-editable-image"
      onClick={() => !uploading && inputRef.current?.click()}
      style={{ borderRadius, ...style }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        fallback || (
          <div style={{
            width: '100%',
            height: '100%',
            background: '#F5F6F8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9AA3AE',
          }}>
            <Icons.ImageIcon size={32} strokeWidth={1.5} />
          </div>
        )
      )}

      {/* Hover overlay */}
      <div className="gs-image-overlay" style={{ borderRadius }}>
        {uploading ? (
          <>
            <Icons.Loader2 size={24} strokeWidth={2} className="gs-spinning" />
            <span style={{ fontSize: 11, fontWeight: 500 }}>Upload en cours…</span>
          </>
        ) : (
          <>
            <Icons.Camera size={22} strokeWidth={1.8} />
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              fontFamily: 'DM Sans, sans-serif',
              textAlign: 'center',
              padding: '0 8px',
            }}>
              {hint}
            </span>
          </>
        )}
      </div>

      {/* Error toast */}
      {error && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          right: 8,
          background: '#DC2626',
          color: '#fff',
          padding: '6px 10px',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 500,
          textAlign: 'center',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}