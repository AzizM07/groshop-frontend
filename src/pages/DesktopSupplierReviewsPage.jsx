// pages/SupplierReviewsPage.jsx — GROSHOP.tn
// Avis boutique — agrégation front via products.mine() + products.reviews(id).
// Master-detail : liste à gauche, détail sticky à droite.
// Résumé style Google Play (barres jaunes, note géante). Sélection douce (crème + barre orange).

import { useState, useEffect, useMemo } from 'react'
import * as Icons from 'lucide-react'
import { products as productsApi } from '../lib/api'

// ── Tokens ─────────────────────────────────────────────────────────
const ORANGE = '#FF4500'
const STAR = '#FFB800'          // jaune barres + étoiles (plus doux que #FFB800)
const STAR_BG = '#FEF3C7'
const STAR_TEXT = '#92400E'
const INK = '#0F1419'
const MUTE = '#6B7280'
const FAINT = '#9AA3AE'
const BORDER = '#EAE7DF'
const LINE = '#F0F1F3'
const BAR_TRACK = '#EEF0F2'     // piste des barres
const EMPTY_STAR = '#D6D9DE'
const SEL_BG = '#FFF9F5'        // ligne sélectionnée — crème très léger
const MAX_PRODUCTS = 40

// ── Styles ─────────────────────────────────────────────────────────
const STYLE_ID = 'gs-reviews-styles-v4'
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  document.querySelectorAll('style[id^="gs-reviews-styles"]').forEach(el => el.remove())
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
    .gs-rev { font-family: 'DM Sans', -apple-system, sans-serif; color: ${INK}; padding: 24px; }
    .gs-h1  { font-family: 'Fraunces', Georgia, serif; font-weight: 700; letter-spacing: -0.02em; }
    .gs-num { font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: -0.03em; }
    .gs-rev-card { background: #fff; border-radius: 20px; border: 1px solid ${BORDER}; box-shadow: 0 1px 2px rgba(15,20,25,.03); }
    .gs-rev-row { transition: background .16s ease; cursor: pointer; position: relative; }
    .gs-rev-row::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:transparent; transition:background .16s ease; }
    .gs-rev-row:hover { background: #FAFAFB; }
    .gs-rev-row:hover::before { background: ${ORANGE}; }
    .gs-rev-row.is-sel { background: ${SEL_BG}; }
    .gs-rev-row.is-sel::before { background: ${ORANGE}; }
    .gs-rev-btn-ghost { background:#fff; color:${INK}; border:1px solid ${BORDER}; padding:12px 16px; border-radius:12px; font-size:12.5px; font-weight:600; cursor:pointer; font-family:inherit; display:inline-flex; align-items:center; justify-content:center; gap:7px; transition:background .15s ease, border-color .15s ease; }
    .gs-rev-btn-ghost:hover { background:#FAFAFB; border-color:#DDE0E5; }
    @keyframes gs-spin { to { transform: rotate(360deg); } }
    .gs-spin { animation: gs-spin .8s linear infinite; }
  `
  document.head.appendChild(s)
}

// ── Helpers ────────────────────────────────────────────────────────
const toNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n }
function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
const initial = (name) => (name || '?').trim()[0]?.toUpperCase() || '?'

// ═══════════════════════════════════════════════════════════════════
export default function DesktopSupplierReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true); setError(null)
    ;(async () => {
      try {
        const mineRaw = await productsApi.mine()
        const mine = Array.isArray(mineRaw) ? mineRaw : (mineRaw?.results || [])
        const withReviews = mine
          .filter(p => (Number(p.rating_count) || 0) > 0)
          .slice(0, MAX_PRODUCTS)

        const lists = await Promise.all(
          withReviews.map(p =>
            productsApi.reviews(p.id)
              .then(rs => (Array.isArray(rs) ? rs : (rs?.results || [])).map(r => ({
                ...r,
                _key: `${p.id}-${r.id}`,
                product_id: p.id,
                product_name: p.name,
                product_image: p.primary_image || null,
              })))
              .catch(() => [])
          )
        )

        if (!alive) return
        const flat = lists.flat().sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        )
        setReviews(flat)
        setSelectedId(flat[0]?._key ?? null)
      } catch (e) {
        if (alive) setError(e.message || 'Erreur de chargement')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const { avg, total, dist } = useMemo(() => {
    const total = reviews.length
    if (!total) return { avg: 0, total: 0, dist: [5, 4, 3, 2, 1].map(s => ({ stars: s, count: 0, pct: 0 })) }
    const sum = reviews.reduce((s, r) => s + toNum(r.rating), 0)
    const buckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => {
      const st = Math.min(5, Math.max(1, Math.round(toNum(r.rating))))
      buckets[st] = (buckets[st] || 0) + 1
    })
    const dist = [5, 4, 3, 2, 1].map(stars => ({
      stars, count: buckets[stars],
      pct: total ? (buckets[stars] / total) * 100 : 0,
    }))
    return { avg: sum / total, total, dist }
  }, [reviews])

  const selected = reviews.find(r => r._key === selectedId) || null

  return (
    <div className="gs-rev">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h1 className="gs-h1" style={{ fontSize: 30, margin: 0 }}>Avis de la boutique</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: MUTE }}>
            {loading ? 'Chargement…' : `${total} avis sur l'ensemble de vos produits`}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2.3fr 1fr', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <RatingSummary avg={avg} total={total} dist={dist} loading={loading} />
          <ReviewsTable
            reviews={reviews} loading={loading} error={error}
            selectedKey={selectedId} onSelect={setSelectedId}
          />
        </div>

        <ReviewDetail review={selected} loading={loading} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// RÉSUMÉ — style Google Play : barres jaunes à gauche, grande note à droite
// ═══════════════════════════════════════════════════════════════════
function RatingSummary({ avg, total, dist, loading }) {
  return (
    <div className="gs-rev-card" style={{ padding: '28px 32px' }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Résumé des avis</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'center' }}>

        {/* Barres */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dist.map(r => (
            <div key={r.stars} style={{ display: 'grid', gridTemplateColumns: '14px 1fr 56px', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 13, color: MUTE }}>{r.stars}</span>
              <div style={{ height: 11, background: BAR_TRACK, borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${r.pct}%`, background: STAR, borderRadius: 999, transition: 'width .3s ease' }} />
              </div>
              <span style={{ fontSize: 11.5, color: FAINT, textAlign: 'right' }}>
                {r.count.toLocaleString('fr-FR')}
              </span>
            </div>
          ))}
        </div>

        {/* Grande note */}
        <div style={{ textAlign: 'center', minWidth: 120 }}>
          <div className="gs-num" style={{ fontSize: 66, color: INK, lineHeight: .95 }}>
            {loading ? '—' : avg.toFixed(1)}
          </div>
          <div style={{ marginTop: 6 }}><StarRating value={avg} size={18} /></div>
          <div style={{ fontSize: 13, color: FAINT, marginTop: 8 }}>
            {total.toLocaleString('fr-FR')} avis
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TABLEAU DES AVIS
// ═══════════════════════════════════════════════════════════════════
function ReviewsTable({ reviews, loading, error, selectedKey, onSelect }) {
  const cols = '120px 230px 1fr 78px'

  return (
    <div className="gs-rev-card" style={{ padding: '8px 0', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '16px 26px 14px', fontSize: 11, color: FAINT, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', borderBottom: `1px solid ${LINE}` }}>
        <div>Date</div>
        <div>Client · Produit</div>
        <div>Avis</div>
        <div style={{ textAlign: 'right' }}>Note</div>
      </div>

      {loading ? (
        <SkeletonRows cols={cols} />
      ) : error ? (
        <StateBox icon="AlertTriangle" title="Erreur de chargement" sub={error} />
      ) : reviews.length === 0 ? (
        <StateBox icon="MessageSquareOff" title="Aucun avis pour l'instant" sub="Les avis laissés sur vos produits apparaîtront ici." />
      ) : (
        reviews.map((r, i) => {
          const isSel = r._key === selectedKey
          const rating = toNum(r.rating)
          return (
            <div key={r._key} className={`gs-rev-row ${isSel ? 'is-sel' : ''}`} onClick={() => onSelect(r._key)}
              style={{ display: 'grid', gridTemplateColumns: cols, padding: '16px 26px', fontSize: 12.5, alignItems: 'center', borderBottom: i < reviews.length - 1 ? `1px solid ${LINE}` : 'none' }}>
              <div style={{ color: MUTE, fontSize: 12 }}>{fmtDate(r.created_at)}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F5F3EE', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {r.product_image
                    ? <img src={r.product_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    : <Icons.Package size={17} color="#B8BCC4" strokeWidth={1.7} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.reviewer_name || 'Client'}
                  </div>
                  <div style={{ fontSize: 10.5, color: FAINT, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.product_name}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: INK, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', paddingRight: 18 }}>
                {r.comment || <span style={{ color: FAINT, fontStyle: 'italic' }}>Sans commentaire</span>}
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ background: STAR_BG, color: STAR_TEXT, padding: '5px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid rgba(245,179,1,.25)' }}>
                  <Icons.Star size={11} fill={STAR} stroke={STAR} />
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// DÉTAIL (droite, sticky)
// ═══════════════════════════════════════════════════════════════════
function ReviewDetail({ review, loading }) {
  if (loading) {
    return (
      <div className="gs-rev-card" style={{ padding: 26, position: 'sticky', top: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
        <Icons.Loader2 size={20} className="gs-spin" color={FAINT} />
      </div>
    )
  }
  if (!review) {
    return (
      <div className="gs-rev-card" style={{ padding: 40, position: 'sticky', top: 16, textAlign: 'center', color: FAINT }}>
        <Icons.MousePointerClick size={26} color={FAINT} style={{ marginBottom: 10 }} />
        <div style={{ fontSize: 13 }}>Sélectionnez un avis pour voir le détail</div>
      </div>
    )
  }

  const rating = toNum(review.rating)
  const photos = review.photos || []

  return (
    <div className="gs-rev-card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 16 }}>
      <div style={{ position: 'relative', alignSelf: 'center', marginTop: 6 }}>
        <div style={{ padding: 4, background: '#fff', borderRadius: '50%', border: `1px solid ${LINE}`, boxShadow: '0 10px 24px -8px rgba(15,20,25,.18)' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: `linear-gradient(135deg, ${ORANGE} 0%, #FF7A45 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 38, fontWeight: 800 }}>
            {initial(review.reviewer_name)}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', background: '#fff', color: STAR_TEXT, padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, boxShadow: '0 4px 12px -2px rgba(15,20,25,.18)', border: `1px solid ${LINE}`, whiteSpace: 'nowrap' }}>
          <Icons.Star size={11} fill={STAR} stroke={STAR} />
          {rating.toFixed(1)}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 6 }}>{review.reviewer_name || 'Client'}</div>
        <div style={{ fontSize: 11.5, color: FAINT, display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Icons.Package size={11} strokeWidth={2} />
          <span style={{ color: INK, fontWeight: 600 }}>{review.product_name}</span>
          {review.created_at && <><span style={{ color: '#DDE0E5' }}>·</span>{fmtDate(review.created_at)}</>}
        </div>
      </div>

      <div style={{ height: 1, background: LINE }} />

      <div style={{ display: 'flex', justifyContent: 'center' }}><StarRating value={rating} size={20} /></div>

      <div style={{ background: '#FAFAFB', border: `1px solid ${LINE}`, borderRadius: 14, padding: '14px 16px', fontSize: 12.5, color: INK, lineHeight: 1.6 }}>
        {review.comment || <span style={{ color: FAINT, fontStyle: 'italic' }}>Le client n'a pas laissé de commentaire.</span>}
      </div>

      {photos.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {photos.map((ph, i) => (
            <div key={ph.id || i} style={{ width: 60, height: 60, borderRadius: 10, overflow: 'hidden', border: `1px solid ${LINE}`, background: '#F7F8FA' }}>
              <img src={ph.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <button className="gs-rev-btn-ghost"
          onClick={() => window.open(`/produit/${review.product_id}`, '_blank')}>
          <Icons.ExternalLink size={14} strokeWidth={2.2} />
          Voir le produit
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
function StarRating({ value, size = 16 }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    const fill = Math.max(0, Math.min(1, value - (i - 1)))
    stars.push(
      <span key={i} style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
        <Icons.Star size={size} stroke={EMPTY_STAR} fill={EMPTY_STAR} strokeWidth={1.5} />
        {fill > 0 && (
          <span style={{ position: 'absolute', top: 0, left: 0, width: `${fill * 100}%`, height: '100%', overflow: 'hidden' }}>
            <Icons.Star size={size} fill={STAR} stroke={STAR} strokeWidth={1.5} />
          </span>
        )}
      </span>
    )
  }
  return <div style={{ display: 'inline-flex', gap: 4 }}>{stars}</div>
}

// ═══════════════════════════════════════════════════════════════════
function SkeletonRows({ cols }) {
  return (
    <div>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: cols, padding: '16px 26px', alignItems: 'center', borderBottom: `1px solid ${LINE}`, gap: 14 }}>
          <div style={{ height: 11, width: 70, background: '#F1EFE9', borderRadius: 4 }} />
          <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F1EFE9' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 11, width: '60%', background: '#F1EFE9', borderRadius: 4, marginBottom: 6 }} />
              <div style={{ height: 9, width: '40%', background: '#F5F3EE', borderRadius: 4 }} />
            </div>
          </div>
          <div>
            <div style={{ height: 9, width: '90%', background: '#F1EFE9', borderRadius: 4, marginBottom: 6 }} />
            <div style={{ height: 9, width: '70%', background: '#F5F3EE', borderRadius: 4 }} />
          </div>
          <div style={{ height: 22, width: 46, background: '#F1EFE9', borderRadius: 999, marginLeft: 'auto' }} />
        </div>
      ))}
    </div>
  )
}

function StateBox({ icon, title, sub }) {
  const Icon = Icons[icon] || Icons.MessageSquare
  return (
    <div style={{ padding: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: FAINT }}>
      <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#FFF3EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} color={ORANGE} strokeWidth={1.8} />
      </div>
      <div className="gs-h1" style={{ fontSize: 17, color: INK }}>{title}</div>
      <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 320 }}>{sub}</div>
    </div>
  )
}