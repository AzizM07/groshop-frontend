// src/components/MobileProductPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Share2, Heart, Star, Truck, MapPin, ChevronDown, ChevronRight,
  Minus, Plus, ShoppingCart, MessageCircle, Store, BadgeCheck, Check,
  ShieldCheck, RotateCcw, Info,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { products as productsApi } from '../lib/api'
import { usePageTracking } from '../hooks/usePageTracking'

const ORANGE='#FF4500', ORANGE2='#FF7A45', INK='#0F1419', SUB='#3D4853', MUTE='#6B7785', FAINT='#9AA3AE', LINE='#ECEEF1', BG='#F0F0F0', GREEN='#0E9F6E'
const FONT='-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const toNum = (v) => { if (v == null) return 0; const n = parseFloat(v); return isNaN(n) ? 0 : n }
const toInt = (v) => { const n = parseInt(v); return isNaN(n) ? 0 : n }
const fmtNum = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDT = (n) => `${fmtNum(n)} TND`

export default function MobileProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [similar, setSimilar] = useState([])
  const [reco, setReco] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [qty, setQty] = useState('1')
  const [imgIdx, setImgIdx] = useState(0)
  const [imgOverride, setImgOverride] = useState(null)
  const [selected, setSelected] = useState({})
  const [wishlisted, setWishlisted] = useState(false)
  const [added, setAdded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  const { add, adding } = useCart()

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError(null)
      try {
        const [p, sim, rec, rev] = await Promise.all([
          productsApi.detail(id),
          productsApi.similar(id).catch(() => []),
          productsApi.recommendations?.(id).catch(() => []) ?? [],
          productsApi.reviews(id).catch(() => []),
        ])
        if (cancelled) return
        setProduct(p)
        setWishlisted(!!p.is_favorited)
        setSimilar(sim || [])
        setReco(rec || [])
        setReviews(rev || [])
        setQty(String(p.moq || 1))
        setImgIdx(0); setImgOverride(null)
        if (p.choice_groups?.length) {
          const init = {}
          p.choice_groups.forEach(g => { if (g.variants?.length) init[g.id] = g.variants[0] })
          setSelected(init)
        } else {
          setSelected({})
        }
      } catch (e) {
        if (!cancelled) setError("Impossible de charger ce produit.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  usePageTracking({ pageType: 'product_detail', productId: product?.id })

  const toggleWishlist = async () => {
    if (!product) return
    const next = !wishlisted
    setWishlisted(next)
    try {
      if (next) await productsApi.addFavorite(product.id)
      else await productsApi.removeFavorite(product.id)
    } catch { setWishlisted(!next) }
  }

  const share = () => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800) }

  if (loading) {
    return <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ width: 30, height: 30, border: `4px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gs-spin .8s linear infinite' }} />
    </div>
  }
  if (error || !product) {
    return <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: BG, fontFamily: FONT }}>
      <span style={{ color: MUTE, fontSize: 14 }}>{error || 'Produit introuvable.'}</span>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: ORANGE, fontWeight: 700, cursor: 'pointer' }}>Retour à l'accueil</button>
    </div>
  }

  const p = product
  const images = p.images?.length ? p.images : (p.primary_image ? [{ url: p.primary_image }] : [])
  const mainImage = imgOverride || images[imgIdx]?.url
  const moq = p.moq || 1
  const unit = p.unit || 'pièce'
  const parsedQty = parseInt(qty) || 0
  const tiers = p.price_tiers || []
  const basePrice = tiers.length ? toNum(tiers[0].price_tnd) : toNum(p.base_price_tnd)
  const oldPrice = toNum(p.old_price_tnd)
  const stockQty = toInt(p.stock_qty)
  const rating = toNum(p.rating_avg)
  const reviewCount = toInt(p.rating_count) || reviews.length
  const soldCount = toInt(p.sold_count)

  const activeIdx = tiers.findIndex(t => parsedQty >= toInt(t.min_qty) && (!t.max_qty || parsedQty <= toInt(t.max_qty)))
  const activeTier = tiers[activeIdx] || tiers[0]
  const unitPrice = activeTier ? toNum(activeTier.price_tnd) : toNum(p.base_price_tnd)
  const savePct = basePrice ? Math.round((1 - unitPrice / basePrice) * 100) : 0
  const total = parsedQty * unitPrice
  const qtyValid = parsedQty >= moq

  const days = p.delivery_days || 3
  const estDate = new Date(); estDate.setDate(estDate.getDate() + days)
  const estStr = estDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const shippingPrice = toNum(p.shipping_price_tnd)

  const specs = (p.specs || []).map(s => ({ k: (s.k || s.label || '').toString(), v: (s.v || s.value || '').toString() })).filter(s => s.k && s.v)
  const dist = [5, 4, 3, 2, 1].map(star => ({ star, n: reviews.filter(r => Math.round(toNum(r.rating)) === star).length }))

  const doOrder = async () => {
    if (!qtyValid) return
    const firstVariantId = Object.values(selected)[0]?.id ?? null
    const res = await add(p.id, parsedQty, firstVariantId)
    if (res?.ok) { setAdded(true); setTimeout(() => setAdded(false), 2000) }
    else if (res?.reason === 'error') alert(res.message || "Impossible d'ajouter au panier.")
  }

  return (
    <div style={{ background: BG, minHeight: '100dvh', fontFamily: FONT, paddingBottom: 84 }}>

      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: `1px solid #F0F0F0`, height: 52, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', color: INK }}><ArrowLeft size={22} /></button>
        <div style={{ flex: 1 }} />
        <button onClick={share} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', color: INK }}>{copied ? <Check size={20} color="#0F9D58" /> : <Share2 size={20} />}</button>
        <button onClick={toggleWishlist} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', color: wishlisted ? ORANGE : INK }}><Heart size={21} fill={wishlisted ? ORANGE : 'none'} /></button>
      </div>

      <div style={{ padding: '10px 10px 0' }}>

        {/* Fil d'ariane */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: MUTE, marginBottom: 10, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <Link to="/" style={{ color: MUTE, textDecoration: 'none' }}>Accueil</Link>
          {p.category_name && <><ChevronRight size={13} style={{ flexShrink: 0 }} /><Link to={`/search?cat=${p.category_id || ''}`} style={{ color: MUTE, textDecoration: 'none' }}>{p.category_name}</Link></>}
          <ChevronRight size={13} style={{ flexShrink: 0 }} />
          <span style={{ color: INK, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
        </div>

        {/* ═══ Grosse carte : image + titre + prix + tiers + variantes + quantité ═══ */}
        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>

          {/* Carrousel */}
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100%', aspectRatio: '1', background: '#F7F8FA' }}>
              {mainImage
                ? <img src={mainImage} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.src = 'https://placehold.co/600x600/F8F8FB/9AA3AE?text=Image' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50 }}>📦</div>}
            </div>

            {oldPrice > unitPrice && (
              <span style={{ position: 'absolute', top: 12, left: 12, background: ORANGE, color: '#fff', fontSize: 12, fontWeight: 800, padding: '4px 9px', borderRadius: 7 }}>
                -{Math.round((1 - unitPrice / oldPrice) * 100)}%
              </span>
            )}

            {/* Cœur + partage sur l'image */}
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={toggleWishlist} style={circBtn}><Heart size={19} fill={wishlisted ? ORANGE : 'none'} color={wishlisted ? ORANGE : INK} /></button>
              <button onClick={share} style={circBtn}>{copied ? <Check size={18} color={GREEN} /> : <Share2 size={17} color={INK} />}</button>
            </div>

            {/* Indicateur type « pilule » */}
            {images.length > 1 && (
              <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.55)', backdropFilter: 'blur(4px)', borderRadius: 20, padding: '5px 9px' }}>
                {images.map((_, i) => (
                  <span key={i} onClick={() => { setImgIdx(i); setImgOverride(null) }}
                    style={{ width: i === imgIdx && !imgOverride ? 18 : 6, height: 6, borderRadius: 3, background: i === imgIdx && !imgOverride ? ORANGE : '#C7CBD1', transition: 'width .2s', cursor: 'pointer' }} />
                ))}
              </div>
            )}
          </div>

          {/* Vignettes */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, padding: '12px 16px 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {images.map((im, i) => (
                <button key={i} onClick={() => { setImgIdx(i); setImgOverride(null) }}
                  style={{ flex: '0 0 56px', width: 56, height: 56, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: '#F7F8FA', padding: 0, border: `2px solid ${i === imgIdx && !imgOverride ? ORANGE : 'transparent'}` }}>
                  <img src={im.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          <div style={{ padding: 16 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: INK, lineHeight: 1.2, letterSpacing: '-0.25px' }}>{p.name}</h1>

            {/* Stock | étoiles | avis | vendus */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: stockQty > 0 ? '#16994A' : '#DC2626' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: stockQty > 0 ? '#22C55E' : '#EF4444' }} />
                {stockQty > 0 ? 'En stock' : 'Rupture de stock'}
              </span>
              <span style={{ color: '#DDD' }}>|</span>
              <span style={{ display: 'inline-flex', gap: 1 }}>
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= Math.round(rating) ? '#FFB800' : '#E5E7EB'} stroke="none" />)}
              </span>
              <span style={{ fontSize: 12, color: FAINT, textDecoration: 'underline' }}>{reviewCount} avis</span>
              {soldCount > 0 && <><span style={{ color: '#DDD' }}>|</span><span style={{ fontSize: 12, color: FAINT }}>{soldCount} vendus</span></>}
            </div>

            {/* Badges façon « bon plan » */}
            {(oldPrice > unitPrice || p.badge_flash || p.badge_choice || p.brand) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {oldPrice > unitPrice && <Badge bg={ORANGE} color="#fff">Promo</Badge>}
                {p.badge_flash && <Badge bg="#FFEDE4" color={ORANGE}>Soldes</Badge>}
                {p.badge_choice && <Badge bg="#FFD000" color="#2E2E2E">Choice</Badge>}
                {p.brand && <Badge bg="#EEF0FA" color="#1B1B4B">Marque {p.brand}</Badge>}
              </div>
            )}

            {p.reference && (
              <div style={{ marginTop: 12, fontSize: 13, color: MUTE }}>Référence # : <strong style={{ color: INK }}>{p.reference}</strong></div>
            )}

            <div style={{ height: 1, background: LINE, margin: '18px 0' }} />

            {/* Prix hero */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 34, fontWeight: 800, color: INK, lineHeight: 1, letterSpacing: '-1px' }}>{fmtNum(unitPrice)}</span>
              <span style={{ fontSize: 17, fontWeight: 700, color: INK }}>TND</span>
              <span style={{ fontSize: 13, color: FAINT, marginLeft: 4 }}>/ {unit}</span>
            </div>
            {savePct > 0 && basePrice !== unitPrice && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 13, color: FAINT, textDecoration: 'line-through' }}>{fmtDT(basePrice)}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', background: `linear-gradient(135deg,${ORANGE2},${ORANGE})`, padding: '3px 8px', borderRadius: 10 }}>Économisez {savePct}%</span>
              </div>
            )}

            {/* Paliers de prix */}
            {tiers.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 4, height: 14, background: ORANGE, borderRadius: 2 }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: INK, letterSpacing: '.5px' }}>PRIX SELON LA QUANTITÉ</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {tiers.map((t, i) => {
                    const active = i === activeIdx
                    const tp = toNum(t.price_tnd)
                    const label = t.max_qty ? `${t.min_qty}-${t.max_qty} ${unit}` : `≥${t.min_qty} ${unit}`
                    const ts = basePrice > 0 && tp < basePrice ? Math.round((1 - tp / basePrice) * 100) : 0
                    return (
                      <button key={t.id || i} onClick={() => setQty(String(t.min_qty))}
                        style={{ position: 'relative', textAlign: 'left', cursor: 'pointer', background: active ? '#FFEEDD' : '#fff', borderRadius: 14, padding: '10px 12px', border: `${active ? 2 : 1}px solid ${active ? ORANGE : '#EEE'}` }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                          <span style={{ fontSize: 16, fontWeight: 900, color: INK }}>{fmtNum(tp)}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: INK }}>TND</span>
                        </div>
                        <div style={{ fontSize: 11, color: FAINT, marginTop: 3 }}>{label}</div>
                        {ts > 0 && <span style={{ position: 'absolute', top: -2, right: -2, background: active ? ORANGE : '#FFEEDD', color: active ? '#fff' : ORANGE, fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 6 }}>-{ts}%</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Groupes de choix (Couleur, Taille…) — pastilles bordées façon Cdiscount */}
            {p.choice_groups?.length > 0 && p.choice_groups.map(g => (
              <div key={g.id} style={{ marginTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 10 }}>
                  {g.name} : <span style={{ color: MUTE, fontWeight: 500 }}>{selected[g.id]?.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {g.variants.map(v => {
                    const on = selected[g.id]?.id === v.id
                    return (
                      <button key={v.id} title={v.name}
                        onClick={() => { setSelected(s => ({ ...s, [g.id]: v })); if (v.image_url) setImgOverride(v.image_url) }}
                        style={{ minWidth: v.image_url ? 56 : 'auto', height: 56, padding: v.image_url ? 0 : '0 16px', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: '#F7F8FA', border: `2px solid ${on ? ORANGE : '#E2E5E9'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: on ? ORANGE : SUB }}>
                        {v.image_url ? <img src={v.image_url} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : v.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* MOQ + quantité */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, padding: '12px 14px', borderRadius: 14, border: `1px solid #EEE` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: FAINT, letterSpacing: '.3px' }}>QUANTITÉ</div>
                <div style={{ fontSize: 13, color: MUTE, marginTop: 2 }}>MOQ : <strong style={{ color: INK }}>{moq} {unit}</strong></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: '#FAFAFB', borderRadius: 12, border: '1px solid #E0E0E0' }}>
                <button onClick={() => setQty(q => String(Math.max(moq, (parseInt(q) || moq) - 1)))} style={qBtn(parsedQty > moq)}><Minus size={16} /></button>
                <input type="number" value={qty} min={moq} onChange={e => setQty(e.target.value)} style={{ width: 46, textAlign: 'center', border: 'none', background: 'none', outline: 'none', fontSize: 15, fontWeight: 900, color: INK, padding: '10px 0' }} />
                <button onClick={() => setQty(q => String((parseInt(q) || moq) + 1))} style={qBtn(true)}><Plus size={16} /></button>
              </div>
            </div>
            {!qtyValid && <div style={{ fontSize: 11, fontWeight: 600, color: ORANGE, marginTop: 8 }}>Quantité minimale : {moq} {unit}</div>}

            {/* Total */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '14px 16px', borderRadius: 14, background: '#F5F5F5', border: '1px solid #E8E8E8' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: FAINT, letterSpacing: '.5px' }}>TOTAL</div>
                <div style={{ fontSize: 11, color: MUTE, marginTop: 2 }}>{parsedQty} × {fmtDT(unitPrice)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: INK, letterSpacing: '-0.5px' }}>{fmtNum(total)}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>TND</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Points forts ── */}
        {specs.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginTop: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: INK, marginBottom: 10 }}>Points forts</div>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {specs.slice(0, 4).map((s, i) => <li key={i} style={{ fontSize: 14, color: SUB, lineHeight: 1.4 }}><strong style={{ color: INK }}>{s.k} :</strong> {s.v}</li>)}
            </ul>
          </div>
        )}

        {/* ── Livraison ── */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginTop: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: INK, marginBottom: 12 }}>Livraison</div>
          <Row icon={Truck}><strong>Livré par GROSHOP</strong></Row>
          <Row icon={MapPin}>Chez vous dès <strong style={{ textTransform: 'capitalize' }}>{estStr}</strong></Row>
          <Row icon={shippingPrice > 0 ? Truck : ShieldCheck}>{shippingPrice > 0 ? `Frais de livraison : ${fmtDT(shippingPrice)}` : 'Livraison offerte'}</Row>
          <Row icon={RotateCcw} last>Retours acceptés sous 7 jours</Row>
        </div>

        {/* ── Accordéons (chacun sa carte) ── */}
        <Accordion title="Nos offres de garanties">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: SUB }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={18} color={ORANGE} /> Paiement 100% sécurisé</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Truck size={18} color={ORANGE} /> Livraison suivie partout en Tunisie</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><RotateCcw size={18} color={ORANGE} /> Retour sous 7 jours</span>
          </div>
        </Accordion>

        {p.description && (
          <Accordion title="Présentation du produit" defaultOpen>
            <p style={{ margin: 0, fontSize: 13.5, color: SUB, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{p.description}</p>
          </Accordion>
        )}

        {specs.length > 0 && (
          <Accordion title="Descriptif technique">
            <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden' }}>
              {specs.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: i % 2 ? '#FAFAFB' : '#fff' }}>
                  <span style={{ flex: 1, fontSize: 13, color: FAINT }}>{s.k}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: INK, textAlign: 'right' }}>{s.v}</span>
                </div>
              ))}
            </div>
          </Accordion>
        )}

        <Accordion
          title="Avis"
          trailing={rating > 0 ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ display: 'inline-flex', gap: 1 }}>{[1,2,3,4,5].map(s => <Star key={s} size={13} fill={s <= Math.round(rating) ? '#FFB800' : '#E5E7EB'} stroke="none" />)}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: MUTE }}>{rating.toFixed(1)} / 5</span>
            </span>
          ) : null}
          defaultOpen
        >
          {reviews.length === 0
            ? <p style={{ margin: 0, fontSize: 13, color: FAINT }}>Aucun avis pour le moment.</p>
            : <div>
                {/* Résumé + distribution */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18 }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 34, fontWeight: 900, color: INK, lineHeight: 1 }}>{rating.toFixed(1)}</div>
                    <span style={{ display: 'inline-flex', gap: 1, marginTop: 4 }}>{[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= Math.round(rating) ? '#FFB800' : '#E5E7EB'} stroke="none" />)}</span>
                    <div style={{ fontSize: 11, color: MUTE, marginTop: 3 }}>{reviewCount} avis</div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {dist.map(({ star, n }) => {
                      const pct = reviews.length ? (n / reviews.length) * 100 : 0
                      return (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: MUTE, width: 22 }}>{star}★</span>
                          <div style={{ flex: 1, height: 6, borderRadius: 4, background: '#EEF0F2', overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: '#FFB800' }} /></div>
                          <span style={{ fontSize: 11, color: FAINT, width: 20, textAlign: 'right' }}>{n}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Liste */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {reviews.slice(0, 5).map(r => (
                    <div key={r.id} style={{ borderTop: `1px solid ${LINE}`, paddingTop: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${ORANGE2},${ORANGE})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{(r.reviewer_name || '?')[0]?.toUpperCase()}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{r.reviewer_name}</div>
                          <span style={{ display: 'inline-flex', gap: 1 }}>{[1,2,3,4,5].map(s => <Star key={s} size={11} fill={s <= Math.round(r.rating) ? '#FFB800' : '#E5E7EB'} stroke="none" />)}</span>
                        </div>
                      </div>
                      {r.comment && <p style={{ margin: '8px 0 0', fontSize: 13, color: SUB, lineHeight: 1.5 }}>{r.comment}</p>}
                      {r.photos?.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                          {r.photos.map((photo, i) => (
                            <button key={photo.id || i} onClick={() => setLightbox({ photos: r.photos, index: i })}
                              style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', padding: 0, border: `1px solid ${LINE}`, cursor: 'pointer', background: '#F7F8FA' }}>
                              <img src={photo.url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>}
        </Accordion>

        <Accordion title="Questions et réponses" trailing={<span style={{ fontSize: 12.5, color: '#1B1B4B', textDecoration: 'underline' }}>{p.questions_count || 0} questions</span>}>
          <p style={{ margin: 0, fontSize: 13, color: FAINT }}>Une question sur ce produit ? Contactez le fournisseur depuis sa boutique.</p>
        </Accordion>

        {/* ── Carte fournisseur ── */}
        {p.supplier_name && (
          <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#FFF1EA', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {p.supplier_logo ? <img src={p.supplier_logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 22, fontWeight: 700, color: ORANGE }}>{(p.supplier_name || '?')[0]}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.supplier_name}</span>
                  {p.supplier_verified === 'approved' && <BadgeCheck size={15} fill={ORANGE} stroke="#fff" />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: MUTE, marginTop: 3 }}><MapPin size={11} />{p.supplier_city || '—'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <a href={`/fournisseur/${p.supplier_slug}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 12, border: '1px solid #E5E5E5', fontSize: 13, fontWeight: 600, color: INK, textDecoration: 'none' }}><Store size={15} /> Boutique</a>
              <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 12, border: 'none', background: ORANGE, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><MessageCircle size={15} /> Contacter</button>
            </div>
          </div>
        )}

        {/* ── Produits similaires ── */}
        {similar.length > 0 && <ScrollRow title="Produits similaires" items={similar} navigate={navigate} sponsored />}
        {reco.length > 0 && <ScrollRow title="Nos clients ont apprécié" items={reco} navigate={navigate} />}
      </div>

      {/* Barre d'action fixe */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60, background: '#fff', borderTop: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px calc(10px + env(safe-area-inset-bottom))' }}>
        <button style={{ flexShrink: 0, width: 50, height: 48, borderRadius: 12, border: `1.5px solid ${ORANGE}`, background: '#fff', color: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MessageCircle size={20} /></button>
        <button onClick={doOrder} disabled={!qtyValid || adding === p.id}
          style={{ flex: 1, height: 48, borderRadius: 12, border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, cursor: qtyValid ? 'pointer' : 'default', opacity: (!qtyValid || adding === p.id) ? .6 : 1, background: added ? '#0F9D58' : `linear-gradient(135deg,${ORANGE2},${ORANGE})`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <ShoppingCart size={18} /> {adding === p.id ? 'Ajout…' : added ? '✓ Ajouté' : 'Ajouter au panier'}
        </button>
      </div>

      {/* Lightbox photos d'avis */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <img src={lightbox.photos[lightbox.index]?.url} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '84vh', objectFit: 'contain', borderRadius: 8 }} />
          {lightbox.photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: (l.index - 1 + l.photos.length) % l.photos.length })) }}
                style={{ position: 'fixed', left: 14, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.15)', color: '#fff', cursor: 'pointer', fontSize: 22 }}>‹</button>
              <button onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: (l.index + 1) % l.photos.length })) }}
                style={{ position: 'fixed', right: 14, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.15)', color: '#fff', cursor: 'pointer', fontSize: 22 }}>›</button>
            </>
          )}
          <button onClick={() => setLightbox(null)} style={{ position: 'fixed', top: 14, right: 14, width: 42, height: 42, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.15)', color: '#fff', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>
      )}
    </div>
  )
}

const qBtn = (enabled) => ({ width: 38, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: enabled ? INK : '#CCC', cursor: enabled ? 'pointer' : 'default' })
const circBtn = { width: 34, height: 34, borderRadius: '50%', background: '#fff', border: `1px solid ${LINE}`, boxShadow: '0 2px 8px rgba(0,0,0,.10)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }

function Badge({ bg, color, children }) {
  return <span style={{ background: bg, color, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>{children}</span>
}

function Row({ icon: Icon, children, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: SUB, marginBottom: last ? 0 : 10 }}>
      <Icon size={17} color={MUTE} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{children}</span>
    </div>
  )
}

/* Accordéon = sa propre carte blanche (façon Cdiscount) */
function Accordion({ title, trailing, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', marginTop: 10 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '18px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: INK }}>{title}</span>
        {trailing}
        <span style={{ flex: 1 }} />
        <ChevronDown size={22} color={INK} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }} />
      </button>
      {open && <div style={{ padding: '0 16px 18px' }}>{children}</div>}
    </div>
  )
}

/* Rangée horizontale de produits */
function ScrollRow({ title, items, navigate, sponsored }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: '16px 0 16px 16px', marginTop: 10 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: INK, marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingRight: 16, scrollbarWidth: 'none' }}>
        {items.map(sp => {
          const img = sp.primary_image
          const price = toNum(sp.base_price_tnd)
          const old = toNum(sp.old_price_tnd)
          const disc = old > price ? Math.round((1 - price / old) * 100) : 0
          return (
            <div key={sp.id} onClick={() => navigate(`/produit/${sp.id}`)} style={{ flex: '0 0 140px', cursor: 'pointer' }}>
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: '#F5F5F5' }}>
                {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📦</div>}
              </div>
              <div style={{ fontSize: 12.5, color: SUB, lineHeight: 1.3, marginTop: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 33 }}>{sp.name}</div>
              {toNum(sp.rating_avg) > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <span style={{ display: 'inline-flex', gap: 1 }}>{[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= Math.round(toNum(sp.rating_avg)) ? '#FFB800' : '#E5E7EB'} stroke="none" />)}</span>
                  <span style={{ fontSize: 11, color: MUTE }}>{toNum(sp.rating_avg).toFixed(1)}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: ORANGE }}>{fmtNum(price)} <span style={{ fontSize: 10, fontWeight: 700 }}>TND</span></span>
                {disc > 0 && <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', background: ORANGE, padding: '1px 5px', borderRadius: 4 }}>-{disc}%</span>}
              </div>
            </div>
          )
        })}
      </div>
      {sponsored && <div style={{ fontSize: 11, color: FAINT, marginTop: 8 }}>Sponsorisé</div>}
    </div>
  )
}