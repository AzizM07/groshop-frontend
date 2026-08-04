// AddProductPage.jsx — GROSHOP.tn
// Formulaire fournisseur "Ajouter un produit".
// Prix par tranche + override par combinaison, dispo booléenne, livraison multi-modes.

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { products as productsApi, uploadFile } from '../lib/api'
import {
  Upload, X, Plus, Trash2, Star, Package, Tag, Truck, Image as ImageIcon,
  Layers, FileText, Loader2, CheckCircle2, AlertTriangle,
} from 'lucide-react'

const ORANGE = '#FF4500'
const FONT = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif"
const UPLOAD_ENDPOINT = '/products/upload-image/'
const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })

const SHIP_MODES = [
  ['free', 'Gratuite'], ['flat', 'Fixe'], ['tiered', 'Par tranche'], ['per_block', 'Par palier'],
]

function tierRange(rows, i) {
  if (!rows[i].min_qty) return '—'
  const min = Number(rows[i].min_qty)
  const next = rows[i + 1] && rows[i + 1].min_qty ? Number(rows[i + 1].min_qty) : null
  if (next === null) return `${min}+`
  return `${min}–${Math.max(min, next - 1)}`
}

function priceTierIssues(rows) {
  const errs = rows.map(() => null)
  let ok = true
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    if (!r.min_qty || !r.price_tnd) continue
    const min = Number(r.min_qty), price = Number(r.price_tnd)
    const old = r.old_price_tnd === '' ? null : Number(r.old_price_tnd)
    if (min < 1) { errs[i] = 'Quantité de départ ≥ 1'; ok = false; continue }
    const prev = rows[i - 1]
    if (i > 0 && prev.min_qty && min <= Number(prev.min_qty)) {
      errs[i] = 'La quantité doit dépasser la tranche précédente'; ok = false; continue
    }
    if (i > 0 && prev.price_tnd && price >= Number(prev.price_tnd)) {
      errs[i] = `Le prix doit être inférieur à la tranche précédente (${fmt(prev.price_tnd)})`; ok = false; continue
    }
    if (old !== null && old <= price) { errs[i] = "L'ancien prix doit être supérieur au prix"; ok = false }
  }
  return { errs, ok }
}

export default function AddProductPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', category: '', description: '', brand: '', reference: '', unit: '',
    in_stock: true,
    shipping_mode: 'flat',
    shipping_price_tnd: '',
    shipping_block_size: 10,
    shipping_block_price: '',
    delivery_days: 3,
    video_url: '', video_poster_url: '', specs_raw: '',
  })
  const [images, setImages]     = useState([])
  const [tiers, setTiers]       = useState([{ min_qty: '', price_tnd: '', old_price_tnd: '' }])
  const [shipTiers, setShipTiers] = useState([{ min_qty: '', price_tnd: '' }])
  const [choiceGroups, setChoiceGroups] = useState([])
  const [variantCombos, setVariantCombos] = useState([])   // [{ id, sel:{[gi]:variantName}, tiers:[…] }]
  const [categories, setCategories] = useState([])
  const [errors, setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [videoUploading, setVideoUploading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

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

  /* ── Groupes de choix ── */
  const addGroup = () => setChoiceGroups((g) => (g.length >= 5 ? g : [...g, { name: '', variants: [] }]))
  const removeGroup = (gi) => setChoiceGroups((g) => g.filter((_, i) => i !== gi))
  const setGroupName = (gi, val) => setChoiceGroups((g) => g.map((x, i) => (i === gi ? { ...x, name: val } : x)))
  const addVariant = (gi) => setChoiceGroups((g) => g.map((x, i) =>
    i === gi ? { ...x, variants: [...x.variants, { name: '', image_url: '', uploading: false }] } : x))
  const setVariant = (gi, vi, k, val) => setChoiceGroups((g) => g.map((x, i) =>
    i === gi ? { ...x, variants: x.variants.map((v, j) => (j === vi ? { ...v, [k]: val } : v)) } : x))
  const removeVariant = (gi, vi) => setChoiceGroups((g) => g.map((x, i) =>
    i === gi ? { ...x, variants: x.variants.filter((_, j) => j !== vi) } : x))
  async function handleVariantFile(gi, vi, file) {
    setVariant(gi, vi, 'uploading', true)
    try {
      const { url } = await uploadFile(UPLOAD_ENDPOINT, file)
      setChoiceGroups((g) => g.map((x, i) =>
        i === gi ? { ...x, variants: x.variants.map((v, j) => (j === vi ? { ...v, image_url: url, uploading: false } : v)) } : x))
    } catch (e) {
      setVariant(gi, vi, 'uploading', false)
      alert(e.message)
    }
  }

  /* ── Tranches de prix produit ── */
  const addTier = () => setTiers((t) => [...t, { min_qty: '', price_tnd: '', old_price_tnd: '' }])
  const setTier = (i, k, val) => setTiers((t) => t.map((x, idx) => (idx === i ? { ...x, [k]: val } : x)))
  const removeTier = (i) => setTiers((t) => (t.length <= 1 ? t : t.filter((_, idx) => idx !== i)))

  /* ── Tranches de livraison ── */
  const addShipTier = () => setShipTiers((t) => [...t, { min_qty: '', price_tnd: '' }])
  const setShipTier = (i, k, val) => setShipTiers((t) => t.map((x, idx) => (idx === i ? { ...x, [k]: val } : x)))
  const removeShipTier = (i) => setShipTiers((t) => (t.length <= 1 ? t : t.filter((_, idx) => idx !== i)))

  /* ── Groupes exploitables pour les combinaisons (nom + ≥1 variante nommée) ── */
  const namedGroups = choiceGroups
    .map((g, gi) => ({ gi, name: g.name.trim(), variants: g.variants.map((v) => v.name.trim()).filter(Boolean) }))
    .filter((g) => g.name && g.variants.length)

  /* ── Prix par combinaison (override) ── */
  const addCombo = () => setVariantCombos((c) => [...c, { id: crypto.randomUUID(), sel: {}, tiers: [{ min_qty: '', price_tnd: '', old_price_tnd: '' }] }])
  const removeCombo = (id) => setVariantCombos((c) => c.filter((x) => x.id !== id))
  const setComboSel = (id, gi, val) => setVariantCombos((c) => c.map((x) => (x.id === id ? { ...x, sel: { ...x.sel, [gi]: val } } : x)))
  const addComboTier = (id) => setVariantCombos((c) => c.map((x) => (x.id === id ? { ...x, tiers: [...x.tiers, { min_qty: '', price_tnd: '', old_price_tnd: '' }] } : x)))
  const setComboTier = (id, i, k, val) => setVariantCombos((c) => c.map((x) => (x.id === id ? { ...x, tiers: x.tiers.map((t, idx) => (idx === i ? { ...t, [k]: val } : t)) } : x)))
  const removeComboTier = (id, i) => setVariantCombos((c) => c.map((x) => (x.id === id ? { ...x, tiers: x.tiers.length <= 1 ? x.tiers : x.tiers.filter((_, idx) => idx !== i) } : x)))

  const { errs: tierErrs, ok: tierOk } = priceTierIssues(tiers)

  async function handleVideo(file) {
    if (!file) return
    setVideoUploading(true)
    try {
      const { url, poster } = await uploadFile('/products/upload-video/', file)
      setForm((f) => ({ ...f, video_url: url, video_poster_url: poster || '' }))
    } catch (e) {
      alert(e.message)
    } finally {
      setVideoUploading(false)
    }
  }
  const removeVideo = () => setForm((f) => ({ ...f, video_url: '', video_poster_url: '' }))

  /* ── Soumission ── */
  async function submit(status) {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nom requis'
    if (!form.category)    errs.category = 'Catégorie requise'
    if (videoUploading) errs.images = 'Attends la fin de la compression vidéo'

    const completeTiers = tiers.filter((t) => t.min_qty && t.price_tnd)
    if (!completeTiers.length) errs.price_tiers = 'Ajoute au moins une tranche de prix'
    else if (!tierOk)          errs.price_tiers = 'Corrige les tranches en rouge (quantité croissante, prix décroissant)'

    if (form.shipping_mode === 'tiered' && !shipTiers.filter((t) => t.min_qty && t.price_tnd).length)
      errs.shipping = 'Ajoute au moins une tranche de livraison'
    if (form.shipping_mode === 'per_block' && (!form.shipping_block_size || !form.shipping_block_price))
      errs.shipping = 'Renseigne le palier et le frais par palier'
    if (images.some((im) => im.uploading)) errs.images = 'Attends la fin des uploads'

    // ── Validation des combinaisons ──
    const comboKeys = []
    for (const c of variantCombos) {
      const picked = namedGroups.filter((g) => c.sel[g.gi])
      const hasTiers = c.tiers.some((t) => t.min_qty && t.price_tnd)
      if (picked.length === 0 && !hasTiers) continue          // ligne vide → ignorée
      if (picked.length !== namedGroups.length) { errs.combos = 'Choisis une option par groupe pour chaque prix spécifique'; break }
      const { ok } = priceTierIssues(c.tiers)
      if (!ok || !hasTiers) { errs.combos = 'Corrige les tranches des prix par variante'; break }
      comboKeys.push(namedGroups.map((g) => c.sel[g.gi]).join('|'))
    }
    if (!errs.combos && new Set(comboKeys).size !== comboKeys.length)
      errs.combos = 'Deux prix spécifiques visent la même combinaison'

    setErrors(errs)
    if (Object.keys(errs).length) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }

    setSubmitting(true)
    const payload = {
      name: form.name, category: form.category, description: form.description,
      brand: form.brand, reference: form.reference, unit: form.unit,
      specs_raw: form.specs_raw, video_url: form.video_url, video_poster_url: form.video_poster_url,
      in_stock: form.in_stock,
      delivery_days: Number(form.delivery_days) || 3,
      shipping_mode: form.shipping_mode,
      shipping_price_tnd:  form.shipping_mode === 'flat' ? Number(form.shipping_price_tnd || 0) : 0,
      shipping_block_size: Number(form.shipping_block_size) || 10,
      shipping_block_price: form.shipping_mode === 'per_block' ? Number(form.shipping_block_price || 0) : 0,
      status,
      images: images.filter((im) => im.url).map((im, i) => ({ url: im.url, is_primary: im.is_primary, sort_order: i })),
      price_tiers: completeTiers.map((t) => ({
        min_qty: Number(t.min_qty),
        price_tnd: Number(t.price_tnd),
        old_price_tnd: t.old_price_tnd === '' ? null : Number(t.old_price_tnd),
      })),
      shipping_tiers: form.shipping_mode === 'tiered'
        ? shipTiers.filter((t) => t.min_qty && t.price_tnd).map((t) => ({ min_qty: Number(t.min_qty), price_tnd: Number(t.price_tnd) }))
        : [],
      choice_groups: choiceGroups
        .filter((g) => g.name.trim())
        .map((g, gi) => ({
          name: g.name.trim(), sort_order: gi,
          variants: g.variants.filter((v) => v.name.trim())
            .map((v, vi) => ({ name: v.name.trim(), image_url: v.image_url || '', sort_order: vi })),
        })),
      variant_combos: variantCombos
        .map((c) => ({
          selections: namedGroups.map((g) => ({ group: g.name, variant: c.sel[g.gi] })).filter((s) => s.variant),
          price_tiers: c.tiers.filter((t) => t.min_qty && t.price_tnd).map((t) => ({
            min_qty: Number(t.min_qty),
            price_tnd: Number(t.price_tnd),
            old_price_tnd: t.old_price_tnd === '' ? null : Number(t.old_price_tnd),
          })),
        }))
        .filter((c) => c.selections.length === namedGroups.length && c.selections.length > 0 && c.price_tiers.length > 0),
    }

    try {
      const res = await productsApi.create(payload)
      if (res === null) { alert('Session expirée. Reconnecte-toi puis réessaie.'); return }
      navigate('/supplier/products')
    } catch (e) {
      alert('Erreur : ' + e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={S.page}>
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
              <Field label="Référence" hint="Code produit / fabricant (optionnel)">
                <input style={S.input} className="ap-in" value={form.reference} onChange={(e) => set('reference', e.target.value)} placeholder="Ex : TS-180-BLK" />
              </Field>
            </div>

            <Field label="Description">
              <textarea style={{ ...S.input, height: 120, resize: 'vertical', paddingTop: 12 }} className="ap-in"
                value={form.description} onChange={(e) => set('description', e.target.value)}
                placeholder="Décris le produit, matière, finitions, taille du lot…" />
            </Field>
          </section>

          {/* PRIX PAR TRANCHE */}
          <section style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ color: ORANGE, display: 'flex' }}><Tag size={18} /></span>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#141414', margin: 0, fontFamily: FONT, flex: 1 }}>Prix par tranche</h2>
              <span style={{ fontSize: 12, fontWeight: 600, color: ORANGE, background: '#FFF3EE', padding: '5px 12px', borderRadius: 8 }}>
                MOQ auto : {tiers[0]?.min_qty ? `${tiers[0].min_qty} ${form.unit || 'pièce'}` : '—'}
              </span>
            </div>

            <div style={{ ...S.priceRow, marginBottom: 6 }}>
              <span style={S.colHead}>À partir de</span>
              <span style={S.colHead}>Prix unit. (TND)</span>
              <span style={S.colHead}>Ancien prix</span>
              <span style={S.colHead}>Plage</span>
              <span />
            </div>

            {tiers.map((t, i) => {
              const err = tierErrs[i]
              return (
                <div key={i}>
                  <div style={S.priceRow}>
                    <input type="number" min="1" style={{ ...S.input, height: 42, textAlign: 'center' }} className="ap-in" placeholder="1"
                      value={t.min_qty} onChange={(e) => setTier(i, 'min_qty', e.target.value)} />
                    <input type="number" step="0.001" style={{ ...S.input, height: 42, textAlign: 'center', ...(err ? { borderColor: '#E11900' } : null) }} className="ap-in" placeholder="0.000"
                      value={t.price_tnd} onChange={(e) => setTier(i, 'price_tnd', e.target.value)} />
                    <input type="number" step="0.001" style={{ ...S.input, height: 42, textAlign: 'center' }} className="ap-in" placeholder="—"
                      value={t.old_price_tnd} onChange={(e) => setTier(i, 'old_price_tnd', e.target.value)} />
                    <span style={S.rangePill}>{tierRange(tiers, i)}</span>
                    <button style={{ ...S.iconDanger, opacity: tiers.length <= 1 ? 0.4 : 1 }} onClick={() => removeTier(i)} type="button" disabled={tiers.length <= 1}><Trash2 size={16} /></button>
                  </div>
                  {err && <div style={S.tierErr}><AlertTriangle size={13} /> {err}</div>}
                </div>
              )
            })}
            <button style={S.addBtn} onClick={addTier} type="button"><Plus size={15} /> Ajouter une tranche</button>
            {errors.price_tiers && <div style={{ ...S.errText, marginTop: 8 }}>{errors.price_tiers}</div>}
            <p style={{ ...S.helper, marginTop: 12 }}>Le prix doit diminuer quand la quantité augmente. La borne haute de chaque tranche se calcule toute seule.</p>
          </section>

          {/* PRIX PAR VARIANTE (OVERRIDE) */}
          <section style={S.card}>
            <SectionTitle icon={<Tag size={18} />} title="Prix par variante (optionnel)" />
            {namedGroups.length === 0 ? (
              <p style={S.helper}>Ajoute d'abord tes choix &amp; variantes (Couleur, Taille…) pour pouvoir fixer un prix spécifique à une combinaison. Par défaut, toutes les variantes utilisent le barème du produit.</p>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F5F0', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
                  <CheckCircle2 size={15} color="#6B7785" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: '#6B7785' }}>Par défaut, toutes les combinaisons utilisent le barème du produit. Ajoutes-en une seulement si son prix diffère.</span>
                </div>

                {variantCombos.map((c) => {
                  const { errs: cErrs } = priceTierIssues(c.tiers)
                  return (
                    <div key={c.id} style={{ border: '1px solid #ECEEF2', borderRadius: 12, padding: 14, marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
                        {namedGroups.map((g) => (
                          <div key={g.gi} style={S.selectWrap}>
                            <select style={{ ...S.select, height: 40, minWidth: 130 }} className="ap-in" value={c.sel[g.gi] || ''} onChange={(e) => setComboSel(c.id, g.gi, e.target.value)}>
                              <option value="">{g.name}…</option>
                              {g.variants.map((vn) => <option key={vn} value={vn}>{vn}</option>)}
                            </select>
                          </div>
                        ))}
                        <div style={{ flex: 1 }} />
                        <button type="button" style={S.iconDanger} onClick={() => removeCombo(c.id)}><Trash2 size={16} /></button>
                      </div>

                      <div style={{ ...S.priceRow, marginBottom: 6 }}>
                        <span style={S.colHead}>À partir de</span>
                        <span style={S.colHead}>Prix (TND)</span>
                        <span style={S.colHead}>Ancien prix</span>
                        <span style={S.colHead}>Plage</span>
                        <span />
                      </div>
                      {c.tiers.map((t, i) => {
                        const err = cErrs[i]
                        return (
                          <div key={i}>
                            <div style={S.priceRow}>
                              <input type="number" min="1" style={{ ...S.input, height: 40, textAlign: 'center' }} className="ap-in" placeholder="1" value={t.min_qty} onChange={(e) => setComboTier(c.id, i, 'min_qty', e.target.value)} />
                              <input type="number" step="0.001" style={{ ...S.input, height: 40, textAlign: 'center', ...(err ? { borderColor: '#E11900' } : null) }} className="ap-in" placeholder="0.000" value={t.price_tnd} onChange={(e) => setComboTier(c.id, i, 'price_tnd', e.target.value)} />
                              <input type="number" step="0.001" style={{ ...S.input, height: 40, textAlign: 'center' }} className="ap-in" placeholder="—" value={t.old_price_tnd} onChange={(e) => setComboTier(c.id, i, 'old_price_tnd', e.target.value)} />
                              <span style={S.rangePill}>{tierRange(c.tiers, i)}</span>
                              <button style={{ ...S.iconDanger, opacity: c.tiers.length <= 1 ? 0.4 : 1 }} onClick={() => removeComboTier(c.id, i)} type="button" disabled={c.tiers.length <= 1}><Trash2 size={16} /></button>
                            </div>
                            {err && <div style={S.tierErr}><AlertTriangle size={13} /> {err}</div>}
                          </div>
                        )
                      })}
                      <button style={S.addBtn} onClick={() => addComboTier(c.id)} type="button"><Plus size={15} /> Ajouter une tranche</button>
                    </div>
                  )
                })}

                <button style={S.addBtn} onClick={addCombo} type="button"><Plus size={15} /> Prix spécifique pour une combinaison</button>
                {errors.combos && <div style={{ ...S.errText, marginTop: 8 }}>{errors.combos}</div>}
              </>
            )}
          </section>

          {/* DISPONIBILITÉ */}
          <section style={S.card}>
            <SectionTitle icon={<Layers size={18} />} title="Disponibilité" />
            <div style={S.segRow}>
              <button type="button" style={{ ...S.modeBtn, ...(form.in_stock ? S.modeBtnOn : null) }} onClick={() => set('in_stock', true)}>En stock</button>
              <button type="button" style={{ ...S.modeBtn, ...(!form.in_stock ? S.modeBtnDanger : null) }} onClick={() => set('in_stock', false)}>Hors stock</button>
            </div>
            <p style={S.helper}>« Hors stock » affiche un badge sur la fiche produit et bloque l'ajout au panier.</p>
          </section>

          {/* LIVRAISON */}
          <section style={S.card}>
            <SectionTitle icon={<Truck size={18} />} title="Livraison" />
            <div style={S.segRow}>
              {SHIP_MODES.map(([m, label]) => (
                <button key={m} type="button" style={{ ...S.modeBtn, ...(form.shipping_mode === m ? S.modeBtnOn : null) }} onClick={() => set('shipping_mode', m)}>{label}</button>
              ))}
            </div>

            {form.shipping_mode === 'flat' && (
              <Field label="Frais de livraison (TND)" hint="Montant unique quelle que soit la quantité">
                <input type="number" step="0.001" style={S.input} className="ap-in" value={form.shipping_price_tnd} onChange={(e) => set('shipping_price_tnd', e.target.value)} placeholder="0.000" />
              </Field>
            )}

            {form.shipping_mode === 'per_block' && (
              <div style={S.row2}>
                <Field label="Tous les (articles)" hint="Palier de quantité">
                  <input type="number" min="1" style={S.input} className="ap-in" value={form.shipping_block_size} onChange={(e) => set('shipping_block_size', e.target.value)} placeholder="10" />
                </Field>
                <Field label="Frais par palier (TND)">
                  <input type="number" step="0.001" style={S.input} className="ap-in" value={form.shipping_block_price} onChange={(e) => set('shipping_block_price', e.target.value)} placeholder="0.000" />
                </Field>
              </div>
            )}

            {form.shipping_mode === 'tiered' && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ ...S.shipRow, marginBottom: 6 }}>
                  <span style={S.colHead}>À partir de</span>
                  <span style={S.colHead}>Frais (TND)</span>
                  <span style={S.colHead}>Plage</span>
                  <span />
                </div>
                {shipTiers.map((t, i) => (
                  <div key={i} style={S.shipRow}>
                    <input type="number" min="1" style={{ ...S.input, height: 42, textAlign: 'center' }} className="ap-in" placeholder="1" value={t.min_qty} onChange={(e) => setShipTier(i, 'min_qty', e.target.value)} />
                    <input type="number" step="0.001" style={{ ...S.input, height: 42, textAlign: 'center' }} className="ap-in" placeholder="0.000" value={t.price_tnd} onChange={(e) => setShipTier(i, 'price_tnd', e.target.value)} />
                    <span style={S.rangePill}>{tierRange(shipTiers, i)}</span>
                    <button style={{ ...S.iconDanger, opacity: shipTiers.length <= 1 ? 0.4 : 1 }} onClick={() => removeShipTier(i)} type="button" disabled={shipTiers.length <= 1}><Trash2 size={16} /></button>
                  </div>
                ))}
                <button style={S.addBtn} onClick={addShipTier} type="button"><Plus size={15} /> Ajouter une tranche</button>
              </div>
            )}

            {form.shipping_mode === 'free' && <p style={S.helper}>Livraison offerte pour ce produit.</p>}
            {errors.shipping && <div style={{ ...S.errText, marginTop: 4 }}>{errors.shipping}</div>}

            <Field label="Délai estimé (jours)" style={{ marginTop: 16 }}>
              <input type="number" style={S.input} className="ap-in" value={form.delivery_days} onChange={(e) => set('delivery_days', e.target.value)} placeholder="3" />
            </Field>
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
                      <img src={im.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
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

            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#3D4853', marginBottom: 7 }}>Vidéo produit</label>
              {form.video_url ? (
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
                  <video src={form.video_url} poster={form.video_poster_url || undefined} controls
                    style={{ width: '100%', display: 'block', maxHeight: 220 }} />
                  <button type="button" style={S.imgRemove} onClick={removeVideo}><X size={13} /></button>
                </div>
              ) : (
                <label style={S.dropzone} className="ap-drop">
                  <input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-matroska" style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files[0]) handleVideo(e.target.files[0]); e.target.value = '' }} />
                  {videoUploading
                    ? <Loader2 size={24} className="ap-spin" color="#9aa3ae" />
                    : <><Upload size={24} color="#c2c8d0" /><span style={{ fontSize: 13, color: '#6B7785', marginTop: 8, textAlign: 'center' }}>Uploader une vidéo<br /><span style={{ fontSize: 11, color: '#a5adb8' }}>MP4, WEBM, MOV · max 100 Mo</span></span></>}
                </label>
              )}
              {videoUploading && <div style={{ ...S.helper, marginTop: 6 }}>Compression en cours, ça peut prendre quelques secondes…</div>}
            </div>
          </section>

          {/* CHOIX & VARIANTES */}
          <section style={S.card}>
            <SectionTitle icon={<Layers size={18} />} title="Choix & variantes" />
            <p style={{ fontSize: 12, color: '#9aa3ae', margin: '-8px 0 16px', lineHeight: 1.5 }}>
              Jusqu'à 5 groupes (ex : Couleur, Taille). Variantes illimitées par groupe.
            </p>

            {choiceGroups.map((g, gi) => (
              <div key={gi} style={{ border: '1px solid #ECEEF2', borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                  <input style={{ ...S.input, flex: 1 }} className="ap-in" placeholder="Nom du choix (ex : Couleur)"
                    value={g.name} onChange={(e) => setGroupName(gi, e.target.value)} />
                  <button type="button" style={S.iconDanger} onClick={() => removeGroup(gi)}><Trash2 size={16} /></button>
                </div>

                {g.variants.map((v, vi) => (
                  <div key={vi} style={S.variantRow}>
                    <label style={S.variantImg} className="ap-drop">
                      <input type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={(e) => { if (e.target.files[0]) handleVariantFile(gi, vi, e.target.files[0]); e.target.value = '' }} />
                      {v.uploading
                        ? <Loader2 size={16} className="ap-spin" color="#9aa3ae" />
                        : v.image_url
                          ? <img src={v.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                          : <Plus size={16} color="#c2c8d0" />}
                    </label>
                    <input style={{ ...S.input, flex: 1 }} className="ap-in" placeholder="Ex : Rose, XL…"
                      value={v.name} onChange={(e) => setVariant(gi, vi, 'name', e.target.value)} />
                    <button type="button" style={S.iconDanger} onClick={() => removeVariant(gi, vi)}><Trash2 size={16} /></button>
                  </div>
                ))}

                <button style={S.addBtn} onClick={() => addVariant(gi)} type="button">
                  <Plus size={15} /> Ajouter une variante
                </button>
              </div>
            ))}

            <button type="button" disabled={choiceGroups.length >= 5}
              style={{ ...S.addBtn, opacity: choiceGroups.length >= 5 ? 0.5 : 1, cursor: choiceGroups.length >= 5 ? 'not-allowed' : 'pointer' }}
              onClick={choiceGroups.length < 5 ? addGroup : undefined}>
              <Plus size={15} /> Ajouter un choix ({choiceGroups.length}/5)
            </button>
          </section>

          {/* PUBLICATION */}
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

  colHead: { fontSize: 11, color: '#9aa3ae', fontWeight: 600 },
  priceRow: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 56px 40px', gap: 8, marginBottom: 8, alignItems: 'center' },
  shipRow: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) 56px 40px', gap: 8, marginBottom: 8, alignItems: 'center' },
  rangePill: { fontSize: 11, fontWeight: 600, color: ORANGE, background: '#FFF3EE', borderRadius: 6, padding: '6px 3px', textAlign: 'center' },
  tierErr: { fontSize: 11.5, color: '#E11900', margin: '-2px 0 8px', display: 'flex', alignItems: 'center', gap: 5 },

  segRow: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  modeBtn: { flex: 1, minWidth: 72, textAlign: 'center', padding: '10px 8px', borderRadius: 10, border: '1.5px solid #E3E6EB', background: '#fff', color: '#3D4853', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT },
  modeBtnOn: { borderColor: ORANGE, background: '#FFF3EE', color: ORANGE },
  modeBtnDanger: { borderColor: '#E11900', background: '#FDF1F1', color: '#E11900' },

  subLabel: { fontSize: 12.5, fontWeight: 600, color: '#3D4853', marginBottom: 10 },
  addBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFF3EE', color: ORANGE, border: '1px dashed #FFC2A8', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, marginTop: 4 },
  iconDanger: { width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDF1F1', color: '#E11900', border: 'none', borderRadius: 9, cursor: 'pointer', flexShrink: 0 },

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