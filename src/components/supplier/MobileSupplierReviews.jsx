// src/components/supplier/MobileSupplierReviews.jsx — GROSHOP.tn
// Version téléphone de la page Avis. Résumé + distribution en carte hero,
// filtres par étoiles en chips, chaque avis en carte avec réponse dépliable.
// Suppose `productsApi.reviewsMine()` — adapte à ta signature.

import { useState, useEffect, useMemo } from 'react'
import * as Icons from 'lucide-react'
import { products as productsApi } from '../../lib/api'

/* Seule teinte orange du projet. */
const ORANGE      = '#ff5e20'
const ORANGE_TINT = 'rgba(255, 94, 32, .10)'
const STAR        = '#FFB800'

const INK='#0F1419', SUB='#3D4853', MUTE='#6B7280', FAINT='#9AA3AE'
const FONT='"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const PAGE_SIZE = 8

const FILTERS = [
  { key: 'all',      label: 'Tous' },
  { key: 'unreplied', label: 'Sans réponse' },
  { key: '5',        label: '5 ★' },
  { key: '4',        label: '4 ★' },
  { key: '3',        label: '3 ★' },
  { key: '2',        label: '2 ★' },
  { key: '1',        label: '1 ★' },
]

const fmt = (n) => Number(n || 0).toLocaleString('fr-FR')

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 3600)  return `${Math.max(1, Math.round(diff / 60))} min`
  if (diff < 86400) return `${Math.round(diff / 3600)} h`
  const d = Math.round(diff / 86400)
  return d < 30 ? `${d} j` : new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function Skel({ h = 14, w = '100%', style }) {
  return <div style={{ height: h, width: w, background: '#EFECE4', borderRadius: 6, animation: 'gs-pulse 1.4s infinite', ...style }} />
}

function Stars({ value, size = 12 }) {
  const rounded = Math.round(value)
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Icons.Star key={s} size={size} fill={s <= rounded ? STAR : '#E5E7EB'} stroke="none" />
      ))}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════
export default function MobileSupplierReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [replyOpen, setReplyOpen] = useState(null)   // id de l'avis en cours de réponse

  useEffect(() => {
    let alive = true
    setLoading(true)
    /* Nom probable — adapte si ton API expose autre chose. */
    const fetcher = productsApi.reviewsMine || productsApi.supplierReviews
    if (!fetcher) {
      setError("Endpoint des avis introuvable.")
      setLoading(false)
      return
    }
    fetcher()
      .then((d) => { if (alive) setReviews(Array.isArray(d) ? d : (d?.results || [])) })
      .catch((e) => { if (alive) setError(e.message || 'Erreur de chargement') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  useEffect(() => { setVisible(PAGE_SIZE) }, [filter, search])

  const summary = useMemo(() => {
    const n = reviews.length
    const avg = n ? reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / n : 0
    const dist = [5, 4, 3, 2, 1].map(star => ({
      star,
      n: reviews.filter(r => Math.round(Number(r.rating || 0)) === star).length,
    }))
    const unreplied = reviews.filter(r => !r.reply && !r.supplier_reply).length
    return { n, avg, dist, unreplied }
  }, [reviews])

  const counts = useMemo(() => {
    const c = { all: reviews.length, unreplied: summary.unreplied }
    for (let s = 1; s <= 5; s++) {
      c[String(s)] = reviews.filter(r => Math.round(Number(r.rating || 0)) === s).length
    }
    return c
  }, [reviews, summary])

  const filtered = useMemo(() => reviews.filter(r => {
    if (filter === 'unreplied' && (r.reply || r.supplier_reply)) return false
    if (['1','2','3','4','5'].includes(filter) && Math.round(Number(r.rating || 0)) !== Number(filter)) return false
    if (search) {
      const q = search.toLowerCase()
      const hay = `${r.product_name || ''} ${r.reviewer_name || ''} ${r.comment || ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  }), [reviews, filter, search])

  const rows = filtered.slice(0, visible)

  async function submitReply(reviewId, text) {
    /* Optimiste : on injecte la réponse localement et on refetch en cas d'erreur. */
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: text, reply_at: new Date().toISOString() } : r))
    setReplyOpen(null)
    try {
      await (productsApi.replyReview?.(reviewId, text) ?? Promise.reject(new Error('replyReview manquant')))
    } catch (e) {
      alert('Erreur : ' + e.message)
      const fetcher = productsApi.reviewsMine || productsApi.supplierReviews
      if (fetcher) fetcher().then((d) => setReviews(Array.isArray(d) ? d : (d?.results || []))).catch(() => {})
    }
  }

  return (
    <div style={{ fontFamily: FONT }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
        Avis
      </h1>
      <p style={{ margin: '0 0 14px', fontSize: 12.5, color: MUTE }}>
        {loading ? 'Chargement…' : summary.n > 0
          ? `${summary.n} avis · ${summary.unreplied} sans réponse.`
          : 'Aucun avis pour l\'instant.'}
      </p>

      {/* Résumé + distribution */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: 16,
        border: '1px solid #EFECE4', marginBottom: 14,
      }}>
        {loading ? <Skel h={90} /> : (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: INK, lineHeight: 1, letterSpacing: '-0.04em' }}>
                {summary.avg.toFixed(1)}
              </div>
              <div style={{ marginTop: 6 }}><Stars value={summary.avg} size={13} /></div>
              <div style={{ fontSize: 10.5, color: MUTE, marginTop: 5 }}>{summary.n} avis</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {summary.dist.map(({ star, n }) => {
                const pct = summary.n ? (n / summary.n) * 100 : 0
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10.5, color: MUTE, width: 20 }}>{star}★</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#F5F3EE', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: STAR }} />
                    </div>
                    <span style={{ fontSize: 10.5, color: FAINT, width: 24, textAlign: 'right' }}>{n}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recherche */}
      <div style={{
        background: '#fff', border: '1px solid #EFECE4', borderRadius: 20,
        padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
      }}>
        <Icons.Search size={14} color={FAINT} strokeWidth={2} />
        <input type="text" placeholder="Produit, client, commentaire…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, width: '100%', color: INK }} />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', cursor: 'pointer' }}><Icons.X size={14} color={FAINT} /></button>}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 12, scrollbarWidth: 'none' }}>
        {FILTERS.map((f) => {
          const on = f.key === filter
          const count = counts[f.key] ?? 0
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: on ? ORANGE_TINT : '#fff',
                color: on ? ORANGE : FAINT,
                fontWeight: on ? 700 : 500, fontSize: 11.5,
                padding: '7px 13px', borderRadius: 20,
                boxShadow: on ? 'none' : 'inset 0 0 0 1px #EFECE4',
              }}>
              {f.label}
              <span style={{ fontSize: 10, fontWeight: 700, opacity: on ? 1 : 0.7 }}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Liste */}
      {loading ? (
        [...Array(4)].map((_, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 16, padding: 14,
            border: '1px solid #EFECE4', marginBottom: 8,
          }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <Skel h={38} w={38} style={{ borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}><Skel h={11} w="55%" /><div style={{ height: 5 }} /><Skel h={9} w="35%" /></div>
            </div>
            <div style={{ marginTop: 10 }}><Skel h={9} w="100%" /><div style={{ height: 4 }} /><Skel h={9} w="70%" /></div>
          </div>
        ))
      ) : error ? (
        <StateBox icon="AlertTriangle" title="Erreur de chargement" sub={error} />
      ) : rows.length === 0 ? (
        reviews.length === 0
          ? <StateBox icon="MessageSquare" title="Aucun avis" sub="Les retours clients apparaîtront ici." />
          : <StateBox icon="Search" title="Aucun résultat" sub="Essaie d'autres filtres." />
      ) : (
        <>
          {rows.map((r) => (
            <ReviewCard key={r.id} review={r}
              expanded={replyOpen === r.id}
              onOpen={() => setReplyOpen(r.id)}
              onCancel={() => setReplyOpen(null)}
              onSubmit={(text) => submitReply(r.id, text)} />
          ))}

          {visible < filtered.length && (
            <button onClick={() => setVisible(v => v + PAGE_SIZE)}
              style={{
                width: '100%', padding: '12px', marginTop: 4,
                background: '#fff', border: '1px solid #EFECE4', borderRadius: 14,
                fontSize: 12.5, fontWeight: 600, color: INK, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              Charger plus ({filtered.length - visible} restants)
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function ReviewCard({ review, expanded, onOpen, onCancel, onSubmit }) {
  const [text, setText] = useState('')
  const existingReply = review.reply || review.supplier_reply

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 14,
      border: '1px solid #EFECE4', marginBottom: 8,
    }}>
      {/* Ligne 1 : produit */}
      {review.product_name && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#F5F3EE',
            flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {review.product_image
              ? <img src={review.product_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Icons.Package size={14} color="#B8BCC4" strokeWidth={2} />}
          </div>
          <span style={{
            flex: 1, fontSize: 11.5, fontWeight: 600, color: INK,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {review.product_name}
          </span>
        </div>
      )}

      {/* Ligne 2 : auteur, étoiles, date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: ORANGE,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>
          {(review.reviewer_name || '?')[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {review.reviewer_name || 'Client'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <Stars value={Number(review.rating || 0)} size={11} />
            <span style={{ fontSize: 10.5, color: FAINT }}>· {timeAgo(review.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Commentaire */}
      {review.comment && (
        <p style={{ margin: '10px 0 0', fontSize: 13, color: SUB, lineHeight: 1.5 }}>
          {review.comment}
        </p>
      )}

      {/* Photos éventuelles */}
      {review.photos?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {review.photos.map((ph, i) => (
            <div key={ph.id || i} style={{ width: 54, height: 54, borderRadius: 8, overflow: 'hidden', background: '#F5F3EE' }}>
              <img src={ph.url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}

      {/* Réponse existante */}
      {existingReply && (
        <div style={{
          marginTop: 12, padding: 11,
          background: ORANGE_TINT, borderRadius: 10,
          borderLeft: `3px solid ${ORANGE}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, marginBottom: 4, letterSpacing: '.02em' }}>
            VOTRE RÉPONSE
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: SUB, lineHeight: 1.5 }}>
            {existingReply}
          </p>
        </div>
      )}

      {/* Zone de réponse */}
      {!existingReply && (
        <>
          {!expanded ? (
            <button onClick={onOpen}
              style={{
                marginTop: 12, width: '100%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: '#fff', border: `1px solid ${ORANGE}`, color: ORANGE,
                borderRadius: 12, padding: '10px 0',
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              <Icons.MessageCircle size={14} strokeWidth={2.2} />
              Répondre
            </button>
          ) : (
            <div style={{ marginTop: 12 }}>
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Votre réponse…"
                style={{
                  width: '100%', padding: 10, boxSizing: 'border-box',
                  background: '#FAFAF7', border: `1px solid #EFECE4`, borderRadius: 10,
                  fontSize: 13, color: INK, resize: 'vertical',
                  fontFamily: 'inherit', outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={onCancel}
                  style={{
                    flex: 1, background: '#fff', border: '1px solid #EFECE4', color: MUTE,
                    borderRadius: 10, padding: '9px 0', fontSize: 12.5, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>Annuler</button>
                <button onClick={() => text.trim() && onSubmit(text.trim())}
                  disabled={!text.trim()}
                  style={{
                    flex: 1, background: ORANGE, border: 'none', color: '#fff',
                    borderRadius: 10, padding: '9px 0', fontSize: 12.5, fontWeight: 700,
                    cursor: text.trim() ? 'pointer' : 'not-allowed', opacity: text.trim() ? 1 : 0.55,
                    fontFamily: 'inherit',
                  }}>Envoyer</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function StateBox({ icon, title, sub }) {
  const Icon = Icons[icon] || Icons.MessageSquare
  return (
    <div style={{ padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: FAINT }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: ORANGE_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={23} color={ORANGE} strokeWidth={1.8} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{title}</div>
      <div style={{ fontSize: 12.5, textAlign: 'center', maxWidth: 260 }}>{sub}</div>
    </div>
  )
}