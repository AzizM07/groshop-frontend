// AddProductPage.jsx — GROSHOP.tn
// Formulaire fournisseur "Ajouter un produit" — mappé sur le modèle Product réel.
// Auth : passe par lib/api.js (cookies httpOnly + CSRF + refresh auto).

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { products as productsApi, uploadFile } from '../lib/api'
import {
  Upload, X, Plus, Trash2, Star, Package, Tag, Truck, Image as ImageIcon,
  Layers, FileText, Loader2, CheckCircle2,
} from 'lucide-react'

const ORANGE = '#FF4500'
const FONT = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif"
const UPLOAD_ENDPOINT = '/products/upload-image/'

export default function AddProductPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', category: '', description: '', brand: '', reference: '', unit: '',
    base_price_tnd: '', old_price_tnd: '', moq: '', pack_size: 1,
    sku: '', stock_qty: 0,
    is_free_shipping: false, shipping_price_tnd: '', delivery_days: 3,
    video_url: '', specs_raw: '',
  })
  const [images, setImages]         = useState([])   // {tempId, url, is_primary, uploading}
  const [tiers, setTiers]           = useState([])   // {min_qty, max_qty, price_tnd}
  const [variants, setVariants]     = useState([])   // {name, image_url, uploading}
  const [categories, setCategories] = useState([])
  const [errors, setErrors]         = useState({})
  const [submitting, setSubmitting] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  /* ── Catégories ── */
  useEffect(() => {
    productsApi.categories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
  }, [])

  /* ── Upload images produit ── */
  async function handleFiles(fileList) {
    const files = Array.from(fileList)
    for (const file of files) {
      const tempId = crypto.randomUUID()
      setImages((prev) => [...prev, { tempId, url: '', is_primary: false, uploading: true }])
      try {
        const { url } = await uploadFile(UPLOAD_ENDPOINT, file)
        setImages((prev) => {
          const next = prev.map((im) => (im.tempId === tempId ? { ...im, url, uploading: false } : im))
          if (!next.some((im) => im.is_primary && im.url)) {
            const idx = next.findIndex((im) => im.url)
            if (idx >= 0) next[idx].is_primary = true
          }
          return next
        })
      } catch (e) {
        setImages((prev) => prev.filter((im) => im.tempId !== tempId))
        alert(e.message)
      }
    }
  }

  const removeImage = (tempId) =>
    setImages((prev) => {
      const next = prev.filter((im) => im.tempId !== tempId)
      if (next.length && !next.some((im) => im.is_primary)) next[0].is_primary = true
      return next
    })
  const setPrimary = (tempId) =>
    setImages((prev) => prev.map((im) => ({ ...im, is_primary: im.tempId === tempId })))

  /* ── Variantes ── */
  const addVariant = () => setVariants((v) => [...v, { name: '', image_url: '', uploading: false }])
  const setVariant = (i, k, val) => setVariants((v) => v.map((x, idx) => (idx === i ? { ...x, [k]: val } : x)))
  const removeVariant = (i) => setVariants((v) => v.filter((_, idx) => idx !== i))
  async function handleVariantFile(i, file) {
    setVariant(i, 'uploading', true)
    try {
      const { url } = await uploadFile(UPLOAD_ENDPOINT, file)
      setVariants((v) => v.map((x, idx) => (idx === i ? { ...x, image_url: url, uploading: false } : x)))
    } catch (e) {
      setVariant(i, 'uploading', false)
      alert(e.message)
    }
  }

  /* ── Tranches de prix ── */
  const addTier = () => setTiers((t) => [...t, { min_qty: '', max_qty: '', price_tnd: '' }])
  const setTier = (i, k, val) => setTiers((t) => t.map((x, idx) => (idx === i ? { ...x, [k]: val } : x)))
  const removeTier = (i) => setTiers((t) => t.filter((_, idx) => idx !== i))

  /* ── Soumission ── */
  async function submit(status) {
    const errs = {}
    if (!form.name.trim())     errs.name = 'Nom requis'
    if (!form.category)        errs.category = 'Catégorie requise'
    if (!form.base_price_tnd)  errs.base_price_tnd = 'Prix requis'
    if (!form.moq)             errs.moq = 'MOQ requis'
    if (images.some((im) => im.uploading)) errs.images = 'Attends la fin des uploads'
    setErrors(errs)
    if (Object.keys(errs).length) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    const payload = {
      ...form,
      status,
      base_price_tnd: Number(form.base_price_tnd),
      old_price_tnd:  form.old_price_tnd ? Number(form.old_price_tnd) : null,
      moq:            Number(form.moq),
      pack_size:      Number(form.pack_size) || 1,
      stock_qty:      Number(form.stock_qty) || 0,
      shipping_price_tnd: form.is_free_shipping ? 0 : Number(form.shipping_price_tnd || 0),
      delivery_days:  Number(form.delivery_days) || 3,
      images: images.filter((im) => im.url).map((im, i) => ({ url: im.url, is_primary: im.is_primary, sort_order: i })),
      price_tiers: tiers
        .filter((t) => t.min_qty && t.price_tnd)
        .map((t) => ({ min_qty: Number(t.min_qty), max_qty: t.max_qty ? Number(t.max_qty) : null, price_tnd: Number(t.price_tnd) })),
      variants: variants
        .filter((v) => v.name.trim())
        .map((v, i) => ({ name: v.name.trim(), image_url: v.image_url || '', sort_order: i })),
    }

    try {
      const res = await productsApi.create(payload)
      if (res === null) {
        // request() renvoie null quand la session a expiré (refresh échoué)
        alert('Session expirée. Reconnecte-toi puis réessaie.')
        return
      }
      navigate('/supplier/products')
    } catch (e) {
      alert('Erreur : ' + e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={S.page}>
      {/* ── Barre titre ── */}
      <div style={S.topbar}>
        <div>
          <h1 style={S.topTitle}>Ajouter un produit</h1>
          <div style={S.breadcrumb}>
            <Link to="/supplier/products" style={S.crumbLink}>Mes produits</Link>
            <span style={{ color: '#c7ccd3' }}>/</span>
            <span style={{ color: ORANGE, fontWeight: 600 }}>Nouveau produit</span>
          </div>
        </div>
        <span style={S.draftBadge}>Brouillon</span>
      </div>

      <div style={S.layout} className="ap-layout">
        {/* ═══════════ COLONNE PRINCIPALE ═══════════ */}
        <div style={S.main}>

          {/* GÉNÉRAL */}
          <section style={S.card}>
            <SectionTitle icon={<Package size={18} />} title="Général" />
            <Field label="Nom du produit" required error={errors.name}>
              <input style={S.input} className="ap-in" value={form.name}
                onChange={(e) => set('name', e.target.value)} placeholder="Ex : T-shirt coton premium 180g" />
            </Field>

            <div style={S.row2}>
              <Field label="Catégorie" required error={errors.category}>
                <div style={S.selectWrap}>
                  <select style={S.select} className="ap-in" value={form.category} onChange={(e) => set('category', e.target.value)}>
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((root) =>
                      root.children && root.children.length ? (
                        <optgroup key={root.id} label={root.name}>
                          {root.children.map((ch) => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                        </optgroup>
                      ) : (
                        <option key={root.id} value={root.id}>{root.name}</option>
                      ),
                    )}
                  </select>
                </div>
              </Field>
              <Field label="Unité" hint="Ex : pièce, mètre, lot…">
                <input style={S.input} className="ap-in" value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="pièce" />
              </Field>
            </div>

            <div style={S.row2}>
              <Field label="Marque">
                <input style={S.input} className="ap-in" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Ex : Sfax Textile" />
              </Field>
              <Field label="Référence" hint="Code fabricant">
                <input style={S.input} className="ap-in" value={form.reference} onChange={(e) => set('reference', e.target.value)} placeholder="Ex : TS-180-BLK" />
              </Field>
            </div>

            <Field label="Description">
              <textarea style={{ ...S.input, height: 120, resize: 'vertical', paddingTop: 12 }} className="ap-in"
                value={form.description} onChange={(e) => set('description', e.target.value)}
                placeholder="Décris le produit, matière, finitions, usages…" />
            </Field>
          </section>

          {/* PRIX & GROS */}
          <section style={S.card}>
            <SectionTitle icon={<Tag size={18} />} title="Prix & vente en gros" />
            <div style={S.row2}>
              <Field label="Prix de base (TND)" required error={errors.base_price_tnd} hint="Prix unitaire de départ">
                <input type="number" step="0.001" style={S.input} className="ap-in"
                  value={form.base_price_tnd} onChange={(e) => set('base_price_tnd', e.target.value)} placeholder="0.000" />
              </Field>
              <Field label="Ancien prix (TND)" hint="Optionnel — affiché barré">
                <input type="number" step="0.001" style={S.input} className="ap-in"
                  value={form.old_price_tnd} onChange={(e) => set('old_price_tnd', e.target.value)} placeholder="0.000" />
              </Field>
            </div>
            <div style={S.row2}>
              <Field label="MOQ (quantité min.)" required error={errors.moq}>
                <input type="number" style={S.input} className="ap-in" value={form.moq} onChange={(e) => set('moq', e.target.value)} placeholder="Ex : 50" />
              </Field>
              <Field label="Taille du lot" hint="Vendu par lot de X unités">
                <input type="number" style={S.input} className="ap-in" value={form.pack_size} onChange={(e) => set('pack_size', e.target.value)} placeholder="1" />
              </Field>
            </div>

            {/* Tranches de prix */}
            <div style={{ marginTop: 6 }}>
              <div style={S.subLabel}>Tranches de prix dégressif <span style={{ color: '#9aa3ae', fontWeight: 400 }}>(optionnel)</span></div>
              {tiers.map((t, i) => (
                <div key={i} style={S.tierRow}>
                  <input type="number" style={{ ...S.input, textAlign: 'center' }} className="ap-in" placeholder="Qté min"
                    value={t.min_qty} onChange={(e) => setTier(i, 'min_qty', e.target.value)} />
                  <input type="number" style={{ ...S.input, textAlign: 'center' }} className="ap-in" placeholder="Qté max"
                    value={t.max_qty} onChange={(e) => setTier(i, 'max_qty', e.target.value)} />
                  <input type="number" step="0.001" style={{ ...S.input, textAlign: 'center' }} className="ap-in" placeholder="Prix TND"
                    value={t.price_tnd} onChange={(e) => setTier(i, 'price_tnd', e.target.value)} />
                  <button style={S.iconDanger} onClick={() => removeTier(i)} type="button"><Trash2 size={16} /></button>
                </div>
              ))}
              <button style={S.addBtn} onClick={addTier} type="button"><Plus size={15} /> Ajouter une tranche</button>
            </div>
          </section>

          {/* INVENTAIRE */}
          <section style={S.card}>
            <SectionTitle icon={<Layers size={18} />} title="Inventaire" />
            <div style={S.row2}>
              <Field label="SKU" hint="Référence interne du produit">
                <input style={S.input} className="ap-in" value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="SKU-0001" />
              </Field>
              <Field label="Quantité en stock">
                <input type="number" style={S.input} className="ap-in" value={form.stock_qty} onChange={(e) => set('stock_qty', e.target.value)} placeholder="0" />
              </Field>
            </div>
          </section>

          {/* LIVRAISON */}
          <section style={S.card}>
            <SectionTitle icon={<Truck size={18} />} title="Livraison" />
            <button type="button" style={S.toggleRow} onClick={() => set('is_free_shipping', !form.is_free_shipping)}>
              <span style={{ ...S.checkbox, ...(form.is_free_shipping ? S.checkboxOn : null) }}>
                {form.is_free_shipping && <CheckCircle2 size={14} />}
              </span>
              <span style={{ fontWeight: 500 }}>Livraison gratuite</span>
            </button>
            <div style={S.row2}>
              <Field label="Prix de livraison (TND)" hint={form.is_free_shipping ? 'Désactivé (gratuit)' : 'Frais fixes'}>
                <input type="number" step="0.001" style={{ ...S.input, opacity: form.is_free_shipping ? 0.5 : 1 }} className="ap-in"
                  disabled={form.is_free_shipping} value={form.shipping_price_tnd} onChange={(e) => set('shipping_price_tnd', e.target.value)} placeholder="0.000" />
              </Field>
              <Field label="Délai estimé (jours)">
                <input type="number" style={S.input} className="ap-in" value={form.delivery_days} onChange={(e) => set('delivery_days', e.target.value)} placeholder="3" />
              </Field>
            </div>
          </section>

          {/* SPECS */}
          <section style={S.card}>
            <SectionTitle icon={<FileText size={18} />} title="Caractéristiques" />
            <Field label="Spécifications" hint="Une par ligne au format « Clé: Valeur »">
              <textarea style={{ ...S.input, height: 120, resize: 'vertical', paddingTop: 12, fontFamily: 'monospace', fontSize: 13 }} className="ap-in"
                value={form.specs_raw} onChange={(e) => set('specs_raw', e.target.value)}
                placeholder={'Matière: 100% coton\nGrammage: 180g/m²\nCouleur: Noir'} />
            </Field>
          </section>
        </div>

        {/* ═══════════ SIDEBAR ═══════════ */}
        <div style={S.side}>

          {/* IMAGES */}
          <section style={S.card}>
            <SectionTitle icon={<ImageIcon size={18} />} title="Images" />
            <label style={S.dropzone} className="ap-drop">
              <input type="file" accept="image/png,image/jpeg,image/webp" multiple style={{ display: 'none' }}
                onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }} />
              <Upload size={26} color="#c2c8d0" />
              <span style={{ fontSize: 13, color: '#6B7785', marginTop: 8, textAlign: 'center' }}>
                Cliquez pour uploader<br /><span style={{ fontSize: 11, color: '#a5adb8' }}>PNG, JPG, WEBP · max 5 Mo</span>
              </span>
            </label>
            {errors.images && <div style={S.errText}>{errors.images}</div>}

            {images.length > 0 && (
              <div style={S.imgGrid}>
                {images.map((im) => (
                  <div key={im.tempId} style={{ ...S.imgThumb, ...(im.is_primary ? S.imgThumbPrimary : null) }}>
                    {im.uploading ? (
                      <div style={S.imgLoading}><Loader2 size={20} className="ap-spin" /></div>
                    ) : (
                      <img src={im.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    {!im.uploading && (
                      <>
                        <button type="button" style={S.imgRemove} onClick={() => removeImage(im.tempId)}><X size={13} /></button>
                        <button type="button" style={{ ...S.imgStar, ...(im.is_primary ? S.imgStarOn : null) }} onClick={() => setPrimary(im.tempId)} title="Image principale">
                          <Star size={13} fill={im.is_primary ? '#fff' : 'none'} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p style={S.helper}>La 1ʳᵉ image (★) est la principale, affichée sur la carte produit.</p>

            <Field label="Vidéo (URL)" hint="Optionnel — lien YouTube / mp4" style={{ marginTop: 14 }}>
              <input style={S.input} className="ap-in" value={form.video_url} onChange={(e) => set('video_url', e.target.value)} placeholder="https://…" />
            </Field>
          </section>

          {/* VARIANTES */}
          <section style={S.card}>
            <SectionTitle icon={<Layers size={18} />} title="Variantes" />
            {variants.map((v, i) => (
              <div key={i} style={S.variantRow}>
                <label style={S.variantImg} className="ap-drop">
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files[0]) handleVariantFile(i, e.target.files[0]); e.target.value = '' }} />
                  {v.uploading
                    ? <Loader2 size={16} className="ap-spin" color="#9aa3ae" />
                    : v.image_url
                      ? <img src={v.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                      : <Plus size={16} color="#c2c8d0" />}
                </label>
                <input style={{ ...S.input, flex: 1 }} className="ap-in" placeholder="Ex : Noir, XL…"
                  value={v.name} onChange={(e) => setVariant(i, 'name', e.target.value)} />
                <button type="button" style={S.iconDanger} onClick={() => removeVariant(i)}><Trash2 size={16} /></button>
              </div>
            ))}
            <button style={S.addBtn} onClick={addVariant} type="button"><Plus size={15} /> Ajouter une variante</button>
          </section>

          {/* STATUT + ACTIONS */}
          <section style={S.card}>
            <SectionTitle icon={<CheckCircle2 size={18} />} title="Publication" />
            <p style={{ fontSize: 13, color: '#6B7785', lineHeight: 1.6, margin: '0 0 16px' }}>
              Enregistre en <b>brouillon</b> pour continuer plus tard, ou <b>soumets pour validation</b> :
              un admin vérifie puis approuve ton produit.
            </p>
            <button type="button" style={S.btnPrimary} className="ap-btn-primary" disabled={submitting} onClick={() => submit('pending_review')}>
              {submitting ? <Loader2 size={16} className="ap-spin" /> : <CheckCircle2 size={16} />}
              Soumettre pour validation
            </button>
            <button type="button" style={S.btnGhost} className="ap-btn-ghost" disabled={submitting} onClick={() => submit('draft')}>
              Enregistrer en brouillon
            </button>
          </section>
        </div>
      </div>

      <style>{`
        .ap-in:focus { border-color: ${ORANGE} !important; box-shadow: 0 0 0 3px rgba(255,69,0,0.10) !important; }
        .ap-drop:hover { border-color: ${ORANGE} !important; background: #FFF8F5 !important; }
        .ap-btn-primary:hover:not(:disabled) { background: #E63E00 !important; }
        .ap-btn-ghost:hover:not(:disabled) { background: #f1f0ee !important; }
        .ap-spin { animation: ap-rotate 0.8s linear infinite; }
        @keyframes ap-rotate { to { transform: rotate(360deg); } }
        @media (max-width: 900px) { .ap-layout { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}

/* ─────────── Sous-composants ─────────── */
function SectionTitle({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <span style={{ color: ORANGE, display: 'flex' }}>{icon}</span>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#141414', margin: 0, fontFamily: FONT }}>{title}</h2>
    </div>
  )
}

function Field({ label, required, hint, error, children, style }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#3D4853', marginBottom: 7 }}>
        {label}{required && <span style={{ color: ORANGE, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error
        ? <div style={{ fontSize: 11.5, color: '#E11900', marginTop: 5 }}>{error}</div>
        : hint ? <div style={{ fontSize: 11.5, color: '#9aa3ae', marginTop: 5 }}>{hint}</div> : null}
    </div>
  )
}

/* ─────────── Styles ─────────── */
const S = {
  page: { minHeight: '100vh', background: '#F4F6FA', fontFamily: FONT, color: '#141414', padding: '28px clamp(16px, 3vw, 40px) 60px' },

  topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #ECEEF2', borderRadius: 16, padding: '18px 24px', marginBottom: 22, flexWrap: 'wrap', gap: 12 },
  topTitle: { fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 600, margin: '0 0 4px', letterSpacing: -0.3 },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7785' },
  crumbLink: { color: '#6B7785', textDecoration: 'none' },
  draftBadge: { background: '#F3F0FF', color: '#7A5AF8', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 20 },

  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 22, alignItems: 'start' },
  main: { display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 },
  side: { display: 'flex', flexDirection: 'column', gap: 22, position: 'sticky', top: 20 },

  card: { background: '#fff', border: '1px solid #ECEEF2', borderRadius: 18, padding: 24 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },

  input: { width: '100%', height: 44, padding: '0 14px', border: '1.5px solid #E3E6EB', borderRadius: 10, fontSize: 14, color: '#141414', background: '#fff', fontFamily: FONT, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' },
  selectWrap: { position: 'relative' },
  select: { width: '100%', height: 44, padding: '0 14px', border: '1.5px solid #E3E6EB', borderRadius: 10, fontSize: 14, color: '#141414', background: '#fff', fontFamily: FONT, outline: 'none', boxSizing: 'border-box', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' },

  subLabel: { fontSize: 12.5, fontWeight: 600, color: '#3D4853', marginBottom: 10 },
  tierRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 40px', gap: 8, marginBottom: 8, alignItems: 'center' },
  addBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFF3EE', color: ORANGE, border: '1px dashed #FFC2A8', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, marginTop: 4 },
  iconDanger: { width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDF1F1', color: '#E11900', border: 'none', borderRadius: 9, cursor: 'pointer', flexShrink: 0 },

  toggleRow: { display: 'flex', alignItems: 'center', gap: 11, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 14, color: '#141414', padding: '4px 0', marginBottom: 14 },
  checkbox: { width: 22, height: 22, borderRadius: 7, border: '1.5px solid #d8dce1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 },
  checkboxOn: { background: ORANGE, borderColor: ORANGE },

  errText: { fontSize: 11.5, color: '#E11900', marginTop: 6 },
  helper: { fontSize: 11.5, color: '#9aa3ae', margin: '10px 0 0', lineHeight: 1.5 },

  dropzone: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 150, border: '2px dashed #E0E4EA', borderRadius: 14, cursor: 'pointer', background: '#FAFBFC', transition: 'border-color 0.15s, background 0.15s' },
  imgGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 },
  imgThumb: { position: 'relative', aspectRatio: '1 / 1', borderRadius: 12, overflow: 'hidden', background: '#f2f3f5', border: '2px solid transparent' },
  imgThumbPrimary: { border: `2px solid ${ORANGE}` },
  imgLoading: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aa3ae' },
  imgRemove: { position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: '50%', background: 'rgba(20,20,20,0.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  imgStar: { position: 'absolute', bottom: 5, left: 5, width: 24, height: 24, borderRadius: '50%', background: 'rgba(20,20,20,0.55)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  imgStarOn: { background: ORANGE },

  variantRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  variantImg: { width: 44, height: 44, borderRadius: 10, border: '1.5px dashed #E0E4EA', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: '#FAFBFC', overflow: 'hidden' },

  btnPrimary: { width: '100%', height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: ORANGE, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, marginBottom: 10, transition: 'background 0.15s' },
  btnGhost: { width: '100%', height: 44, background: '#F4F5F7', color: '#3D4853', border: 'none', borderRadius: 12, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, transition: 'background 0.15s' },
}