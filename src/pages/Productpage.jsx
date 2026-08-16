// src/pages/Productpage.jsx — GROSHOP.tn
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Heart, Share2, Star, ChevronDown, ChevronRight, ChevronLeft, Minus, Plus,
  Truck, MapPin, Store, ShoppingCart, BadgeCheck, ShieldCheck, RotateCcw, Check, Info, MessageCircle,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { products as productsApi } from '../lib/api'
import { usePageTracking, trackProductEvent } from '../hooks/usePageTracking'
import { useIsMobile } from '../hooks/useIsMobile'
import MobileProductPage from '../components/MobileProductPage'
import ProductCard from '../components/ProductCard'

const ORANGE='#FF5E20', ORANGE2='#FF7A45', NAVY='#1B1B4B', INK='#0F1419', SUB='#3D4853', MUTE='#6B7785', FAINT='#9AA3AE', LINE='#ECEEF1', BG='#F4F5F7', GREEN='#0E9F6E', RED='#DC2626'
const FONT='"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

/* ── Hauteur du header fixe (barre recherche + barre catégories).
      Ajuste cette seule valeur si tu modifies le header. ── */
const HEADER_H = 152
const STICKY_TOP = HEADER_H + 12

const toNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n }
const toInt = (v) => { const n = parseInt(v); return isNaN(n) ? 0 : n }
const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const splitPrice = (n) => { const [a, b] = fmt(n).split(','); return [a, b] }

/* ⭐ Résout le nom d'affichage d'un produit, quelle que soit la forme renvoyée
   par le backend : name (résolu par modeltranslation) OU name_fr/name_en/name_ar
   si la traduction active n'a pas été résolue côté serializer. Centralisé ici
   pour ne pas répéter la même chaîne de fallback à chaque usage. */
const productName = (p = {}) => p.name || p.name_fr || p.name_en || p.name_ar || ''

/* ── Mapper : produit API (similar / reco) → props attendues par <ProductCard>.
   Les endpoints similar/reco renvoient base_price_tnd / rating_avg / primary_image…
   alors que ProductCard attend price / rating / image. On traduit ici, en étant
   tolérant aux champs manquants (tout est optionnel côté carte). ── */
const toCardProduct = (p = {}) => {
  const price = toNum(p.base_price_tnd)
  const old = toNum(p.old_price_tnd)
  const gallery = Array.isArray(p.images) ? p.images.map(im => im?.url || im).filter(Boolean) : []
  return {
    id: p.id,
    name: productName(p),
    price,
    was: old > price ? old : null,
    rating: toNum(p.rating_avg) || null,
    reviewCount: toInt(p.rating_count) || null,
    image: p.primary_image || gallery[0] || null,
    images: gallery,
    soldCount: p.sold_count != null ? toInt(p.sold_count) : null,
    moq: p.moq != null ? toInt(p.moq) : null,
    moqUnit: p.unit || 'pcs',
    supplier: p.supplier_name || null,
    verified: p.supplier_verified === 'approved',
    isFreeShipping: !!p.free_shipping,
    isBestSeller: !!p.badge_flash,
  }
}

/* ── Grille produits : 7 par ligne, entièrement proportionnelle à l'écran.
   repeat(7, minmax(0,1fr)) = 7 colonnes qui se partagent la largeur ; le gap
   est lui-même fluide. Combiné à la variante "mini" de ProductCard (tailles en
   clamp/vw), toute la rangée rétrécit/grandit avec la fenêtre. ── */
const grid7 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: 'clamp(8px, 0.9vw, 16px)',
  alignItems: 'start',
}

function Stars({ value = 0, size = 15 }) {
  return <span style={{ display: 'inline-flex', gap: 1 }}>{[1, 2, 3, 4, 5].map(s => <Star key={s} size={size} fill={s <= Math.round(value) ? '#FFB800' : '#E3E6EA'} stroke="none" />)}</span>
}

function Accordion({ title, trailing, defaultOpen = false, anchorRef, onOpen, children }) {
  const [open, setOpen] = useState(defaultOpen)
  // onOpen ne se déclenche QUE sur une ouverture initiée par l'utilisateur
  // (clic), jamais sur l'ouverture auto via defaultOpen au montage.
  const toggle = () => setOpen(o => {
    const next = !o
    if (next && onOpen) onOpen()
    return next
  })
  return (
    <div ref={anchorRef} style={{ background: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', border: `1px solid ${LINE}`, scrollMarginTop: STICKY_TOP }}>
      <button onClick={toggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 19, fontWeight: 800, color: INK }}>{title}</span>
        {trailing}
        <span style={{ flex: 1 }} />
        <ChevronDown size={24} color={INK} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && <div style={{ padding: '0 24px 24px' }}>{children}</div>}
    </div>
  )
}

function DesktopProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { add, adding } = useCart()
  const [lightbox, setLightbox] = useState(null)
  const [product, setProduct] = useState(null)
  const [similar, setSimilar] = useState([])
  const [reco, setReco] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [imgIdx, setImgIdx] = useState(0)
  const [imgOverride, setImgOverride] = useState(null)
  const [qty, setQty] = useState('1')
  const [selected, setSelected] = useState({})
  const [wishlisted, setWishlisted] = useState(false)
  const [added, setAdded] = useState(false)
  const [copied, setCopied] = useState(false)

  const descRef = useRef(null)
  const avisRef = useRef(null)

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
        setProduct(p); setWishlisted(!!p.is_favorited); setSimilar(sim || []); setReco(rec || []); setReviews(rev || [])
        setQty(String(p.moq || 1))
        setImgIdx(0); setImgOverride(null)
        if (p.choice_groups?.length) {
          const init = {}
          p.choice_groups.forEach(g => { if (g.variants?.length) init[g.id] = g.variants[0] })
          setSelected(init)
        } else {
          setSelected({})
        }
      } catch { if (!cancelled) setError("Impossible de charger ce produit.") }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  usePageTracking({ pageType: 'product_detail', productId: product?.id })

  const toggleWishlist = async () => {
    if (!product) return
    const next = !wishlisted; setWishlisted(next)
    try { next ? await productsApi.addFavorite(product.id) : await productsApi.removeFavorite(product.id) }
    catch { setWishlisted(!next) }
  }
  const share = () => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800) }

  if (loading) return <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}><div style={{ width: 34, height: 34, border: `4px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gs-spin .8s linear infinite' }} /></div>
  if (error || !product) return <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', background: BG, fontFamily: FONT }}><span style={{ color: MUTE }}>{error || 'Produit introuvable.'}</span><button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: ORANGE, fontWeight: 700, cursor: 'pointer' }}>Retour à l'accueil</button></div>

  const p = product
  // ⭐ Fallback : le backend peut renvoyer name_fr/name_en/name_ar (modeltranslation)
  // au lieu de name si la traduction active n'est pas résolue côté serializer.
  const displayName = productName(p)
  const images = p.images?.length ? p.images : (p.primary_image ? [{ url: p.primary_image }] : [])
  const mainImage = imgOverride || images[imgIdx]?.url
  const unit = p.unit || 'pièce'
  const parsedQty = parseInt(qty) || 0
  const tiers = p.price_tiers || []

  // ── Résolution du prix selon la combinaison choisie ──
  // combo_key = ids des variantes sélectionnées, triés (identique au serveur).
  // Si une combinaison a un override → on prend SON barème, sinon le barème produit.
  const selectedVariantIds = (p.choice_groups || []).map(g => selected[g.id]?.id).filter(Boolean)
  const comboKey = [...selectedVariantIds].sort().join('|')
  const activeCombo = comboKey
    ? (p.variant_combos || []).find(c => [...(c.variant_ids || [])].sort().join('|') === comboKey)
    : null
  const effectiveTiers = activeCombo?.price_tiers?.length ? activeCombo.price_tiers : tiers

  const moq = (effectiveTiers[0] ? toInt(effectiveTiers[0].min_qty) : 0) || toInt(p.moq) || 1
  const basePrice = effectiveTiers[0] ? toNum(effectiveTiers[0].price_tnd) : toNum(p.base_price_tnd)
  const rating = toNum(p.rating_avg)
  const reviewCount = toInt(p.rating_count) || reviews.length
  const inStock = p.in_stock !== false

  const activeTier = effectiveTiers.find(t => parsedQty >= toInt(t.min_qty) && (!t.max_qty || parsedQty <= toInt(t.max_qty))) || effectiveTiers[0]
  const unitPrice = activeTier ? toNum(activeTier.price_tnd) : basePrice
  const tierOld = activeTier ? toNum(activeTier.old_price_tnd) : 0
  const oldPrice = tierOld > 0 ? tierOld : (activeCombo ? 0 : toNum(p.old_price_tnd))
  const disc = oldPrice > unitPrice ? Math.round((1 - unitPrice / oldPrice) * 100) : 0
  const total = parsedQty * unitPrice
  const qtyValid = parsedQty >= moq
  const [big, cents] = splitPrice(unitPrice)

  const days = p.delivery_days || 3
  const est = new Date(); est.setDate(est.getDate() + days)
  const estStr = est.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const shippingPrice = toNum(p.shipping_price_tnd)
  const specs = (p.specs || []).map(s => ({ k: (s.k || s.label || '').toString(), v: (s.v || s.value || '').toString() })).filter(s => s.k && s.v)
  const dist = [5, 4, 3, 2, 1].map(star => ({ star, n: reviews.filter(r => Math.round(toNum(r.rating)) === star).length }))
  const tierLabel = (t) => t.max_qty ? `${t.min_qty}–${t.max_qty} ${unit}` : `≥${t.min_qty} ${unit}`
   // ── Fallback logo/bannière fournisseur : certains endpoints renvoient
  // brand_logo_url / banner_url (comme la page boutique) au lieu de
  // supplier_logo / supplier_banner. On couvre les deux cas.
  const supplierLogo = p.supplier_logo || p.brand_logo_url || p.supplier?.brand_logo_url
  const supplierBanner = p.supplier_banner || p.banner_url || p.supplier?.banner_url
  const doOrder = async () => {
    if (!qtyValid || !inStock) return
    // ⚠️ Tant que le panier/serveur ne résout pas le combo, on envoie la 1re variante
    // choisie (contrat actuel de cart.add). Le prix combo sera correct une fois le
    // ripple panier/checkout fait.
    const firstVariantId = Object.values(selected)[0]?.id ?? null
    const res = await add(p.id, parsedQty, firstVariantId)
    if (res?.ok) {
      setAdded(true)
      trackProductEvent(p.id, 'add_to_cart')
      setTimeout(() => setAdded(false), 2000)
    }
    else if (res?.reason === 'error') alert(res.message || "Impossible d'ajouter au panier.")
  }

  return (
    <div style={{ background: BG, fontFamily: FONT, color: INK, paddingBottom: 40 }}>

      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '20px clamp(4px, 1vw, 16px)' }}>

        {/* Fil d'ariane */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: MUTE, marginBottom: 16, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: MUTE, textDecoration: 'none' }}>Accueil</Link>
{p.category_name && p.category_slug && (
  <>
    <ChevronRight size={14} />
    <Link 
      to={`/search?cat=${p.category_slug}`} 
      style={{ color: MUTE, textDecoration: 'none' }}
    >
      {p.category_name}
    </Link>
  </>
)}          <ChevronRight size={14} />
          <span style={{ color: INK, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>{displayName}</span>
        </div>

        {/* ═══ [ gauche : produit + société + accordéons ] + [ droite : buy box sticky ] ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) clamp(300px, 26vw, 380px)', gap: 'clamp(14px, 1.6vw, 26px)', alignItems: 'start' }}>

          {/* ── COLONNE GAUCHE ── */}
          <div style={{ minWidth: 0 }}>
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${LINE}`, padding: 'clamp(14px, 1.6vw, 24px)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)', gap: 'clamp(18px, 2.2vw, 32px)', alignItems: 'start' }}>

                {/* Galerie */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: '#F7F8FA' }}>
                    {mainImage
                      ? <img src={mainImage} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover'}} loading="lazy"/>
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>📦</div>}
                    <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <button onClick={toggleWishlist} style={circBtn}><Heart size={20} fill={wishlisted ? ORANGE : 'none'} color={wishlisted ? ORANGE : INK} /></button>
                      <button onClick={share} style={circBtn}>{copied ? <Check size={20} color={GREEN} /> : <Share2 size={19} color={INK} />}</button>
                    </div>
                  </div>
                  {images.length > 1 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', scrollbarWidth: 'none' }}>
                      {images.map((im, i) => (
                        <button key={i}
                          onClick={() => { setImgIdx(i); setImgOverride(null); trackProductEvent(p.id, 'view_image') }}
                          onMouseEnter={() => { setImgIdx(i); setImgOverride(null) }}
                          style={{ flex: '0 0 clamp(58px, 5vw, 76px)', width: 'clamp(58px, 5vw, 76px)', height: 'clamp(58px, 5vw, 76px)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: '#F7F8FA', padding: 0, border: `2px solid ${i === imgIdx && !imgOverride ? ORANGE : 'transparent'}` }}>
                          <img src={im.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover'}} loading="lazy"/>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Infos produit */}
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ margin: 0, fontSize: 'clamp(19px, 1.5vw, 26px)', fontWeight: 800, lineHeight: 1.22, letterSpacing: '-0.3px' }}>{displayName}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    <Stars value={rating} /><span style={{ fontSize: 14, fontWeight: 700 }}>{rating.toFixed(1)} / 5</span>
                    <button onClick={() => avisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} style={{ background: 'none', border: 'none', color: NAVY, fontSize: 13, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>{reviewCount} avis</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                    {oldPrice > unitPrice && <Badge bg={ORANGE} color="#fff">Promo</Badge>}
                    {p.badge_flash && <Badge bg="#FFEDE4" color={ORANGE}>Soldes</Badge>}
                    {p.badge_choice && <Badge bg="#FFD000" color="#2E2E2E">Choice</Badge>}
                    {p.brand && <Badge bg="#EEF0FA" color={NAVY}>Marque {p.brand}</Badge>}
                    {inStock
                      ? <Badge bg="#E9F9F0" color={GREEN}>En stock</Badge>
                      : <Badge bg="#FEECEC" color={RED}>Hors stock</Badge>}
                  </div>

                  {effectiveTiers.length > 1 && (
                    <div style={{ display: 'flex', gap: 'clamp(16px, 2vw, 28px)', flexWrap: 'wrap', marginTop: 22 }}>
                      {effectiveTiers.map((t, i) => {
                        const on = activeTier === t
                        return (
                          <button key={t.id || i} onClick={() => setQty(String(t.min_qty))} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                            <div style={{ fontSize: 'clamp(17px, 1.3vw, 21px)', fontWeight: 900, color: on ? ORANGE : INK, letterSpacing: '-0.5px' }}>{fmt(toNum(t.price_tnd))} <span style={{ fontSize: 13 }}>TND</span></div>
                            <div style={{ fontSize: 12.5, color: on ? ORANGE : MUTE, marginTop: 2 }}>{tierLabel(t)}</div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {specs.length > 0 && (
                    <div style={{ marginTop: 24 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>Points forts :</div>
                      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {specs.slice(0, 4).map((s, i) => <li key={i} style={{ fontSize: 14, color: SUB }}><strong style={{ color: INK }}>{s.k} :</strong> {s.v}</li>)}
                      </ul>
                      <button onClick={() => { descRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); trackProductEvent(p.id, 'view_description') }} style={{ marginTop: 12, background: 'none', border: 'none', color: NAVY, fontSize: 14, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}>Voir le descriptif technique <ChevronDown size={16} /></button>
                    </div>
                  )}

                  {/* Groupes de choix (Couleur, Taille…) */}
                  {p.choice_groups?.length > 0 && p.choice_groups.map(g => (
                    <div key={g.id} style={{ marginTop: 24 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                        {g.name} : <span style={{ color: MUTE, fontWeight: 500 }}>{selected[g.id]?.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {g.variants.map(v => {
                          const on = selected[g.id]?.id === v.id
                          return (
                            <button key={v.id} title={v.name}
                              onClick={() => {
                                setSelected(s => ({ ...s, [g.id]: v }))
                                if (v.image_url) setImgOverride(v.image_url)
                                trackProductEvent(p.id, 'select_variant')
                              }}
                              style={{ minWidth: 'clamp(54px, 4.6vw, 66px)', height: 'clamp(54px, 4.6vw, 66px)', padding: v.image_url ? 0 : '0 12px', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: '#F7F8FA', border: `2px solid ${on ? ORANGE : '#E2E5E9'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: SUB }}>
                              {v.image_url ? <img src={v.image_url} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover'}} loading="lazy"/> : v.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

{/* Carte société — bannière fournisseur en fond, logo + infos par-dessus */}
{p.supplier_name && (() => {
  const hasBanner = !!supplierBanner
  return (
    <div style={{ marginTop: 12, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, overflow: 'hidden' }}>
      {/* Bandeau : grande image du fournisseur */}
      <div style={{
        padding: '20px 16px',
        background: hasBanner
          ? `url(${supplierBanner}) center/cover `
          : '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.18)' }}>
            {supplierLogo
              ? <img src={supplierLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              : <span style={{ fontSize: 26, fontWeight: 900, color: ORANGE }}>{(p.supplier_name || '?')[0]}</span>}
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: hasBanner ? '#fff' : INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: hasBanner ? '0 1px 4px rgba(0,0,0,.45)' : 'none' }}>{p.supplier_name}</span>
              {p.supplier_verified === 'approved' && <BadgeCheck size={17} fill={ORANGE} stroke="#fff" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: hasBanner ? 'rgba(255,255,255,.92)' : MUTE, marginTop: 3, textShadow: hasBanner ? '0 1px 4px rgba(0,0,0,.45)' : 'none' }}>
              <MapPin size={12} />{p.supplier_city || 'Tunisie'}{p.supplier_wilaya ? `, ${p.supplier_wilaya}` : ''}
            </div>
          </div>
          <Link to={`/fournisseur/${p.supplier_slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 12, border: `1px solid ${hasBanner ? 'rgba(255,255,255,.55)' : LINE}`, background: hasBanner ? 'rgba(255,255,255,.14)' : '#fff', backdropFilter: hasBanner ? 'blur(4px)' : 'none', fontSize: 13.5, fontWeight: 600, color: hasBanner ? '#fff' : INK, textDecoration: 'none', whiteSpace: 'nowrap' }}><Store size={16} /> Boutique</Link>
          <button onClick={() => trackProductEvent(p.id, 'contact_supplier')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 12, border: 'none', background: ORANGE, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}><MessageCircle size={16} /> Contacter</button>
        </div>
      </div>

      {/* Note / Ville / Statut — synchronisés backend */}
      <div style={{ display: 'flex', margin: 16, borderRadius: 12, background: '#FAFBFC', border: `1px solid ${LINE}` }}>
        <Stat label="Note boutique" value={p.supplier_rating ? `${toNum(p.supplier_rating).toFixed(1)}/5` : '—'} extra={p.supplier_rating_count ? `(${p.supplier_rating_count})` : ''} />
        <StatSep />
        <Stat label="Ville" value={p.supplier_city || 'Tunisie'} />
        <StatSep />
        <Stat label="Statut" value={p.supplier_verified === 'approved' ? 'Vérifié' : 'Standard'} valueColor={p.supplier_verified === 'approved' ? GREEN : INK} />
      </div>
    </div>
  )
})()}

            {/* Accordéons — ils étirent la colonne, donc le sticky de droite tient jusqu'ici */}
            <div style={{ marginTop: 24 }}>
              <Accordion title="Nos offres de garanties">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 14, color: SUB }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={18} color={ORANGE} /> Paiement 100% sécurisé</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Truck size={18} color={ORANGE} /> Livraison suivie partout en Tunisie</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><RotateCcw size={18} color={ORANGE} /> Retour sous 7 jours</span>
                </div>
              </Accordion>
              <Accordion title="Présentation du produit" defaultOpen onOpen={() => trackProductEvent(p.id, 'view_description')}>
                <p style={{ margin: 0, fontSize: 14.5, color: SUB, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{p.description || 'Aucune description fournie.'}</p>
              </Accordion>
              <Accordion title="Descriptif technique" anchorRef={descRef} defaultOpen={specs.length > 0} onOpen={() => trackProductEvent(p.id, 'view_description')}>
                {specs.length === 0 ? <p style={{ margin: 0, fontSize: 14, color: FAINT }}>Aucune caractéristique renseignée.</p> : (
                  <div style={{ border: `1px solid ${LINE}`, borderRadius: 10, overflow: 'hidden' }}>
                    {specs.map((s, i) => (
                      <div key={i} style={{ display: 'flex', background: i % 2 ? '#FAFBFC' : '#fff' }}>
                        <div style={{ flex: '0 0 40%', padding: '12px 16px', fontSize: 13.5, color: MUTE }}>{s.k}</div>
                        <div style={{ flex: 1, padding: '12px 16px', fontSize: 13.5, fontWeight: 600, color: INK }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Accordion>
              <Accordion title="Avis" anchorRef={avisRef}
                trailing={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 4, flexWrap: 'wrap' }}><Stars value={rating} size={16} /><span style={{ fontSize: 14, fontWeight: 700 }}>{rating.toFixed(1)} / 5</span><span style={{ fontSize: 13, color: NAVY, textDecoration: 'underline' }}>{reviewCount} avis</span></span>} defaultOpen>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(18px, 2vw, 32px)' }}>
                  <div>
                    <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>{rating.toFixed(1)}<span style={{ fontSize: 18, color: FAINT }}>/5</span></div>
                    <Stars value={rating} size={18} />
                    <div style={{ fontSize: 13, color: MUTE, marginTop: 4 }}>{reviewCount} avis</div>
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {dist.map(({ star, n }) => {
                        const pct = reviews.length ? (n / reviews.length) * 100 : 0
                        return (
                          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, color: MUTE, width: 30 }}>{star}★</span>
                            <div style={{ flex: 1, height: 7, borderRadius: 4, background: '#EEF0F2', overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: '#FFB800' }} /></div>
                            <span style={{ fontSize: 11.5, color: FAINT, width: 24, textAlign: 'right' }}>{n}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {reviews.length === 0 ? <p style={{ margin: 0, fontSize: 14, color: FAINT }}>Aucun avis pour le moment.</p> :
                      reviews.slice(0, 6).map(r => (
                        <div key={r.id} style={{ borderBottom: `1px solid ${LINE}`, paddingBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${ORANGE2},${ORANGE})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{(r.reviewer_name || '?')[0]?.toUpperCase()}</div>
                            <div><div style={{ fontSize: 14, fontWeight: 700 }}>{r.reviewer_name}</div><Stars value={toNum(r.rating)} size={12} /></div>
                          </div>
                          {r.comment && <p style={{ margin: '10px 0 0', fontSize: 14, color: SUB, lineHeight: 1.55 }}>{r.comment}</p>}
                          {r.photos?.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                              {r.photos.map((photo, i) => (
                                <button key={photo.id || i} onClick={() => setLightbox({ photos: r.photos, index: i })}
                                  style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', padding: 0, border: `1px solid ${LINE}`, cursor: 'pointer', background: '#F7F8FA' }}>
                                  <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover'}} loading="lazy"/>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </Accordion>
              <Accordion title="Questions et réponses" trailing={<span style={{ fontSize: 13, color: NAVY, textDecoration: 'underline', marginLeft: 6 }}>{p.questions_count || 0} questions</span>}>
                <p style={{ margin: 0, fontSize: 14, color: FAINT }}>Une question sur ce produit ? Contactez le fournisseur depuis sa boutique.</p>
              </Accordion>
            </div>
          </div>

          {/* ── COLONNE DROITE : sticky sous le header, sans scroll interne ── */}
          <div style={{ position: 'sticky', top: STICKY_TOP, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${LINE}`, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: FAINT, marginBottom: 8 }}>Prix le + bas sur 30j <Info size={12} /></div>
              {oldPrice > unitPrice && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14, color: FAINT, textDecoration: 'line-through' }}>{fmt(oldPrice)} TND</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', background: ORANGE, padding: '2px 7px', borderRadius: 5 }}>-{disc}%</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <span style={{ fontSize: 'clamp(32px, 2.6vw, 42px)', fontWeight: 900, color: ORANGE, lineHeight: 1, letterSpacing: '-1.5px' }}>{big}</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: ORANGE, marginTop: 2 }}>,{cents}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: ORANGE, marginTop: 3, marginLeft: 3 }}>TND</span>
              </div>
              <div style={{ fontSize: 12, color: MUTE, marginTop: 4 }}>/ {unit} · TVA incluse</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 90, fontSize: 12.5, color: MUTE }}>MOQ <strong style={{ color: INK }}>{moq} {unit}</strong></div>
                <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${LINE}`, borderRadius: 10 }}>
                  <button onClick={() => setQty(q => String(Math.max(moq, (parseInt(q) || moq) - 1)))} style={stepBtn(parsedQty > moq)}><Minus size={15} /></button>
                  <input type="number" value={qty} min={moq} onChange={e => setQty(e.target.value)} style={{ width: 52, textAlign: 'center', border: 'none', outline: 'none', fontSize: 14, fontWeight: 800, padding: '9px 0' }} />
                  <button onClick={() => setQty(q => String((parseInt(q) || moq) + 1))} style={stepBtn(true)}><Plus size={15} /></button>
                </div>
              </div>
              {!qtyValid && <div style={{ fontSize: 11.5, color: ORANGE, fontWeight: 600, marginTop: 6 }}>Minimum {moq} {unit}</div>}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '14px 0', padding: '12px 14px', background: '#F7F8FA', borderRadius: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: MUTE }}>Total</span>
                <span style={{ fontSize: 'clamp(17px, 1.4vw, 20px)', fontWeight: 900 }}>{fmt(total)} TND</span>
              </div>

              <button onClick={doOrder} disabled={!qtyValid || !inStock || adding === p.id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '15px', borderRadius: 12, border: 'none', color: '#fff', fontSize: 16, fontWeight: 800, cursor: (qtyValid && inStock) ? 'pointer' : 'default', opacity: (!qtyValid || !inStock || adding === p.id) ? .6 : 1, background: added ? GREEN : (!inStock ? '#B9BEC7' : `linear-gradient(135deg, ${ORANGE2}, ${ORANGE})`), whiteSpace: 'nowrap' }}>
                <ShoppingCart size={18} /> {!inStock ? 'Indisponible' : adding === p.id ? 'Ajout…' : added ? 'Ajouté ✓' : 'Ajouter au panier'}
              </button>
            </div>

            <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${LINE}`, padding: 18 }}>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14 }}>Livraison</div>
              <Row icon={Truck}><strong>Livré par GROSHOP</strong></Row>
              <div style={{ height: 1, background: LINE, margin: '12px 0' }} />
              <Row icon={MapPin}>Chez vous dès <strong style={{ textTransform: 'capitalize' }}>{estStr}</strong></Row>
              <Row icon={shippingPrice > 0 ? Truck : ShieldCheck}>{shippingPrice > 0 ? `Frais de livraison : ${fmt(shippingPrice)} TND` : 'Livraison offerte'}</Row>
              <Row icon={RotateCcw}>Retours acceptés sous 7 jours</Row>
            </div>
          </div>
        </div>

        {/* ── Pleine largeur après la grille — 7 cartes par ligne, fluides ── */}
        {similar.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(18px, 1.4vw, 22px)', fontWeight: 800 }}>Produits similaires</h2>
            <div style={grid7}>
              {similar.map(sp => <ProductCard key={sp.id} product={toCardProduct(sp)} variant="mini" />)}
            </div>
            <div style={{ fontSize: 11.5, color: FAINT, marginTop: 8 }}>Sponsorisé</div>
          </div>
        )}

        {reco.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(18px, 1.4vw, 22px)', fontWeight: 800 }}>Nos clients ont apprécié</h2>
            <div style={grid7}>
              {reco.map(rp => <ProductCard key={rp.id} product={toCardProduct(rp)} variant="mini" />)}
            </div>
          </div>
        )}
        {lightbox && (
          <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <img src={lightbox.photos[lightbox.index]?.url} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '86vh', objectFit: 'contain', borderRadius: 8 }} />
            {lightbox.photos.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: (l.index - 1 + l.photos.length) % l.photos.length })) }}
                  style={{ position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.15)', color: '#fff', cursor: 'pointer', fontSize: 24 }}>‹</button>
                <button onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: (l.index + 1) % l.photos.length })) }}
                  style={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.15)', color: '#fff', cursor: 'pointer', fontSize: 24 }}>›</button>
              </>
            )}
            <button onClick={() => setLightbox(null)} style={{ position: 'fixed', top: 16, right: 16, width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.15)', color: '#fff', cursor: 'pointer', fontSize: 22 }}>✕</button>
          </div>
        )}
      </div>
    </div>
  )
}

const circBtn = { width: 40, height: 40, borderRadius: '50%', background: '#fff', border: `1px solid ${LINE}`, boxShadow: '0 2px 8px rgba(0,0,0,.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const stepBtn = (on) => ({ width: 34, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: on ? INK : '#CCC', cursor: on ? 'pointer' : 'default' })
function Badge({ bg, color, children }) { return <span style={{ background: bg, color, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>{children}</span> }
function Row({ icon: Icon, children }) { return <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: SUB, marginBottom: 8 }}><Icon size={17} color={MUTE} style={{ flexShrink: 0, marginTop: 1 }} /><span>{children}</span></div> }
function Stat({ label, value, extra, valueColor = INK }) { return <div style={{ flex: 1, padding: '12px 8px', textAlign: 'center', minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 800, color: valueColor, overflow: 'hidden', textOverflow: 'ellipsis' }}>{value} {extra && <span style={{ fontSize: 12, fontWeight: 500, color: FAINT }}>{extra}</span>}</div><div style={{ fontSize: 11.5, color: MUTE, marginTop: 2 }}>{label}</div></div> }
function StatSep() { return <div style={{ width: 1, background: LINE, margin: '10px 0' }} /> }

export default function ProductPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileProductPage /> : <DesktopProductPage />
}