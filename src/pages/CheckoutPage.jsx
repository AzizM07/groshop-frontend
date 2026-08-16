// src/pages/CheckoutPage.jsx — GROSHOP.tn
// Cette page ne fait QUE choisir l'adresse + le mode de livraison.
// Le paiement (total, promo, moyen de paiement) se fait sur l'écran suivant :
// le bouton "Continuer vers le paiement" y navigue avec l'état nécessaire.
import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  MapPin, Truck, Ticket, ChevronDown, Lock, Plus, ArrowRight,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { orders as ordersApi, addresses as addressesApi } from '../lib/api'
import { useIsMobile } from '../hooks/useIsMobile'

// --- Leaflet & Map Imports ---
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const ORANGE = '#FF5E00', INK = '#1A1A1A', MUTE = '#7A7A7A', FAINT = '#A0A0A0', LINE = '#EAEAEA', SOFT = '#FFF0E8'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const DEFAULT_COORDS = { lat: 36.800095, lng: 10.173364 } // Tunis, par défaut

// Pays / gouvernorats
const COUNTRIES = [
  { code: 'TN', flag: '🇹🇳', name: 'Tunisie' },
  { code: 'FR', flag: '🇫🇷', name: 'France' },
  { code: 'DZ', flag: '🇩🇿', name: 'Algérie' },
  { code: 'MA', flag: '🇲🇦', name: 'Maroc' },
  { code: 'IT', flag: '🇮🇹', name: 'Italie' },
]
const GOUVERNORATS_TN = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
  'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'La Manouba', 'Médenine',
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine',
  'Tozeur', 'Tunis', 'Zaghouan',
]
const countryName = (code) => (COUNTRIES.find(c => c.code === code) || {}).name || code || 'Tunisie'

// ─── COMPOSANT CARTE LEAFLET ───
// onLocationSelect est appelé au clic, au drag du marqueur ET à la géolocalisation,
// ce qui permet au parent de rester synchronisé avec la position affichée (vue adresse
// sélectionnée à gauche, ou pin déplacé pendant l'ajout d'une nouvelle adresse).
function MapPicker({ initialLat = DEFAULT_COORDS.lat, initialLng = DEFAULT_COORDS.lng, onLocationSelect, interactive = true }) {
  const [position, setPosition] = useState({ lat: initialLat, lng: initialLng })
  const [isLocating, setIsLocating] = useState(false)

  useEffect(() => {
    setPosition({ lat: initialLat, lng: initialLng })
  }, [initialLat, initialLng])

  const updatePosition = (pos) => {
    setPosition(pos)
    onLocationSelect?.(pos)
  }

  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        if (!interactive) return
        const { lat, lng } = e.latlng
        updatePosition({ lat, lng })
        map.flyTo(e.latlng, map.getZoom())
      },
    })
    return (
      <Marker
        position={[position.lat, position.lng]}
        draggable={interactive}
        eventHandlers={interactive ? {
          dragend(e) {
            const pos = e.target.getLatLng()
            updatePosition({ lat: pos.lat, lng: pos.lng })
          },
        } : {}}
      />
    )
  }

  const locateUser = () => {
    if (!navigator.geolocation) { alert('Géolocalisation non supportée.'); return }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        updatePosition({ lat: latitude, lng: longitude })
        setIsLocating(false)
      },
      (err) => {
        alert('Impossible de récupérer votre position : ' + err.message)
        setIsLocating(false)
      },
      { enableHighAccuracy: true }
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {interactive && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={locateUser}
            disabled={isLocating}
            style={{ padding: '4px 12px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {isLocating ? 'Localisation…' : '📍 Ma position'}
          </button>
          <span style={{ fontSize: 11, color: MUTE, alignSelf: 'center' }}>
            Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}
          </span>
        </div>
      )}

      {/* Le flex:1 avec min-height force la carte à prendre toute la place */}
      <div style={{ flex: 1, minHeight: 0, borderRadius: 12, overflow: 'hidden', border: `1px solid ${LINE}` }}>
        <MapContainer
          key={`${position.lat}-${position.lng}`}
          center={[position.lat, position.lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker />
        </MapContainer>
      </div>
      {interactive && (
        <div style={{ fontSize: 10, color: FAINT, marginTop: 4 }}>Cliquez sur la carte ou faites glisser le marqueur.</div>
      )}
    </div>
  )
}

// ─── LOGIQUE PARTAGÉE ───
function useCheckout() {
  const { items, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const ids = location.state?.itemIds
  const selected = useMemo(
    () => (ids ? items.filter(i => ids.includes(i.id)) : items),
    [items, ids],
  )

  const [addresses, setAddresses] = useState([])
  const [addrLoading, setAddrLoading] = useState(true)
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [addingAddress, setAddingAddress] = useState(false)

  useEffect(() => {
    if (!user) { setAddresses([]); setAddrLoading(false); return }
    let alive = true
    setAddrLoading(true)
    addressesApi.list()
      .then(d => {
        if (!alive) return
        const list = Array.isArray(d) ? d : (d?.results || [])
        setAddresses(list)
        setSelectedAddressId(prev => prev ?? (list.find(a => a.is_default) || list[0])?.id ?? null)
      })
      .catch(() => { if (alive) setAddresses([]) })
      .finally(() => { if (alive) setAddrLoading(false) })
    return () => { alive = false }
  }, [user])

  const selectedAddress = useMemo(
    () => addresses.find(a => a.id === selectedAddressId) || null,
    [addresses, selectedAddressId],
  )

  const addAddress = async (form) => {
    setAddingAddress(true)
    try {
      const created = await addressesApi.create(form)
      setAddresses(prev => {
        const next = created.is_default ? prev.map(a => ({ ...a, is_default: false })) : prev
        return [created, ...next.filter(a => a.id !== created.id)]
      })
      setSelectedAddressId(created.id)
      return created
    } finally {
      setAddingAddress(false)
    }
  }

  // ── Options de livraison ──
  const [shippingOptions, setShippingOptions] = useState([])
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shipping, setShipping] = useState(null)

  const FALLBACK_SHIPPING = [
    { id: 0, title: 'Livraison standard', sub: 'Reçu en 3–5 jours', price: 0 },
    { id: 1, title: 'Livraison express', sub: 'Reçu en 24–48 h', price: 12 },
  ]

  useEffect(() => {
    // Le client API n'expose pas forcément shippingOptions() (selon le backend/version
    // de ../lib/api) — on ne l'appelle que si elle existe vraiment, sinon fallback direct.
    const canFetchOptions = typeof ordersApi?.shippingOptions === 'function'

    if (!selectedAddress || !canFetchOptions) {
      setShippingOptions(FALLBACK_SHIPPING)
      setShipping(prev => (prev == null ? 0 : prev))
      return
    }

    let alive = true
    setShippingLoading(true)
    ordersApi.shippingOptions(selectedAddress.id)
      .then(options => {
        if (!alive) return
        if (Array.isArray(options) && options.length > 0) {
          setShippingOptions(options)
          setShipping(prev => (options.some(o => o.id === prev) ? prev : options[0].id))
        } else {
          throw new Error('Empty options')
        }
      })
      .catch(() => {
        if (!alive) return
        setShippingOptions(FALLBACK_SHIPPING)
        setShipping(prev => ([0, 1].includes(prev) ? prev : 0))
      })
      .finally(() => { if (alive) setShippingLoading(false) })
    return () => { alive = false }
  }, [selectedAddress])

  // ── Reste du checkout (épuré : pas de paiement ici) ──
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  // Continue vers l'écran de paiement : on valide juste que tout est prêt,
  // le paiement (total, promo, moyen de paiement) se fait sur l'écran suivant.
const goToPayment = async () => {
  const goToPayment = async () => {
  if (!user) {
    // Invité : on redirige vers /login, retour auto sur checkout après
    navigate('/login', { state: { from: '/checkout' } })
    return
  }
  if (!selected.length)  { setError('Votre panier est vide'); return }
  if (!selectedAddress)  { setError('Veuillez choisir une adresse de livraison'); return }
  setError('')

  const payload = {
    address_id: selectedAddress.id,
    payment_method: 'cod',
    notes: notes.trim(),
    items: selected.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
  }

  try {
    const created = await ordersApi.create(payload)
    if (payload.payment_method === 'cod') {
      navigate(`/commande/${created.id}/confirmation`, { state: { order: created } })
    } else {
      navigate('/checkout/paiement', { state: { orderId: created.id } })
    }
  } catch (e) {
    setError(e.data?.error || e.message || 'Erreur lors de la création de la commande')
  }
}
  if (!selected.length)  { setError('Votre panier est vide'); return }
  if (!selectedAddress)  { setError('Veuillez choisir une adresse de livraison'); return }
  setError('')

  const payload = {
    address_id: selectedAddress.id,
    // TODO : pas encore de sélecteur de mode de paiement côté UI → COD en dur
    // (paiement en ligne pas encore intégré). À remplacer par le choix réel
    // une fois d17/flouci/sobflous branchés.
    payment_method: 'cod',
    notes: notes.trim(),
    items: selected.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
  }

  try {
    const created = await ordersApi.create(payload)
    // COD = pas de paiement en ligne à faire → direct confirmation
    if (payload.payment_method === 'cod') {
  navigate('/commande/confirmation', { state: { order: created } })
} else {
  navigate('/checkout/paiement', { state: { orderId: created.id } })
}
  } catch (e) {
    setError(e.data?.error || e.message || 'Erreur lors de la création de la commande')
  }
}

  return {
    selected, user,
    addresses, addrLoading, selectedAddress, selectAddress: setSelectedAddressId, addAddress, addingAddress,
    shippingOptions, shippingLoading, shipping, setShipping,
    notes, setNotes,
    error, goToPayment,
    navigate,
  }
}

// ─── COMPOSANTS UI PARTAGÉS ───
function Field({ label, value, onChange, placeholder }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTE, display: 'block', marginBottom: 6 }}>{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${LINE}`, borderRadius: 10, padding: '11px 13px', fontSize: 14, fontFamily: FONT, outline: 'none', color: INK, background: '#fff' }} />
    </label>
  )
}
function Select({ label, value, onChange, options }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTE, display: 'block', marginBottom: 6 }}>{label}</span>
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', appearance: 'none', border: `1px solid ${LINE}`, borderRadius: 10, padding: '11px 13px', fontSize: 14, fontFamily: FONT, outline: 'none', color: INK, background: '#fff' }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={16} color={MUTE} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </div>
    </label>
  )
}
function ShippingTile({ active, title, sub, price, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, cursor: 'pointer', background: active ? '#FFF7F2' : '#fff', border: `1.5px solid ${active ? ORANGE : LINE}` }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Truck size={20} color={ORANGE} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{title}</div>
        <div style={{ fontSize: 11.5, color: MUTE, marginTop: 2 }}>{sub}</div>
      </div>
      <span style={{ fontSize: 13, fontWeight: 800 }}>{price <= 0 ? 'Gratuit' : `${Number(price).toLocaleString('fr-FR')} TND`}</span>
      <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, border: `2px solid ${active ? ORANGE : '#CCC'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {active && <span style={{ width: 10, height: 10, borderRadius: '50%', background: ORANGE }} />}
      </span>
    </div>
  )
}

// ─── FORMULAIRE ADRESSE ───
function AddressForm({ onCancel, onSave, adding, allowCancel = true, coords }) {
  const [f, setF] = useState({ full_name: '', phone: '', country: 'TN', region: '', city: '', postal_code: '', street: '', additional: '', is_default: false, latitude: null, longitude: null })
  const [isGeocoding, setIsGeocoding] = useState(false)
  const set = (k, v) => setF(s => ({ ...s, [k]: v }))
  const valid = f.full_name.trim() && f.phone.trim() && f.street.trim() && f.city.trim() && f.region.trim()

  useEffect(() => {
    if (!coords) return
    set('latitude', coords.lat)
    set('longitude', coords.lng)
  }, [coords?.lat, coords?.lng])

  // Reverse-geocoding (Nominatim) : remplit automatiquement les champs quand le pin bouge.
  useEffect(() => {
    if (!coords?.lat || !coords?.lng) return
    let alive = true
    const geocode = async () => {
      setIsGeocoding(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`)
        const data = await res.json()
        const addr = data?.address
        if (addr && alive) {
          setF(prev => ({
            ...prev,
            street: addr.road || prev.street,
            city: addr.city || addr.town || prev.city,
            region: addr.state || addr.region || prev.region,
            postal_code: addr.postcode || prev.postal_code,
            country: addr.country_code ? addr.country_code.toUpperCase() : prev.country,
          }))
        }
      } catch (err) {
        console.error('Erreur reverse geocoding:', err)
      } finally {
        if (alive) setIsGeocoding(false)
      }
    }
    geocode()
    return () => { alive = false }
  }, [coords?.lat, coords?.lng])

  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, background: '#fff' }}>
      <div style={{ fontSize: 14, fontWeight: 800 }}>Nouvelle adresse</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Nom complet" value={f.full_name} onChange={v => set('full_name', v)} placeholder="Nom du destinataire" />
        <Field label="Téléphone" value={f.phone} onChange={v => set('phone', v)} placeholder="+216 …" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Select label="Pays" value={f.country} onChange={v => set('country', v)} options={COUNTRIES.map(c => ({ value: c.code, label: `${c.flag} ${c.name}` }))} />
        <div style={{ position: 'relative' }}>
          <Select label="Gouvernorat" value={f.region} onChange={v => set('region', v)} options={[{ value: '', label: 'Choisir…' }, ...GOUVERNORATS_TN.map(g => ({ value: g, label: g }))]} />
          {isGeocoding && <span style={{ position: 'absolute', right: 8, bottom: 12, fontSize: 11, color: FAINT, pointerEvents: 'none' }}>Chargement...</span>}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Ville" value={f.city} onChange={v => set('city', v)} placeholder="Ville" />
        <Field label="Code postal" value={f.postal_code} onChange={v => set('postal_code', v)} placeholder="1000" />
      </div>
      <Field label="Adresse" value={f.street} onChange={v => set('street', v)} placeholder="Rue, numéro, quartier…" />
      <Field label="Complément (optionnel)" value={f.additional} onChange={v => set('additional', v)} placeholder="Apt, étage, bâtiment" />
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: MUTE }}><input type="checkbox" checked={f.is_default} onChange={e => set('is_default', e.target.checked)} /> Définir comme adresse par défaut</label>
      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        {allowCancel && <button type="button" onClick={onCancel} style={{ flex: 1, border: `1px solid ${LINE}`, borderRadius: 10, padding: '11px', fontSize: 13.5, fontWeight: 700, color: INK, background: '#fff', cursor: 'pointer' }}>Annuler</button>}
        <button type="button" disabled={!valid || adding || isGeocoding} onClick={() => onSave(f)} style={{ flex: 1, border: 'none', borderRadius: 10, padding: '11px', fontSize: 13.5, fontWeight: 800, color: '#fff', background: ORANGE, cursor: (valid && !adding && !isGeocoding) ? 'pointer' : 'default', opacity: (valid && !adding && !isGeocoding) ? 1 : .6 }}>
          {adding ? 'Enregistrement…' : "Enregistrer l'adresse"}
        </button>
      </div>
    </div>
  )
}

// ─── ADDRESS PICKER ───
function AddressPicker({ addresses, loading, selectedId, onSelect, onAdd, adding, user, isFormOpen, setIsFormOpen, coords }) {
  if (!user) return <div style={{ border: `1px dashed ${LINE}`, borderRadius: 12, padding: 16, fontSize: 13.5, color: MUTE, textAlign: 'center' }}><Link to="/login" style={{ color: ORANGE, fontWeight: 700, textDecoration: 'underline' }}>Connectez-vous</Link> pour utiliser vos adresses.</div>
  if (loading) return <div style={{ padding: '18px 0', fontSize: 13, color: FAINT }}>Chargement de vos adresses…</div>

  const empty = addresses.length === 0
  const showForm = isFormOpen || empty
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {!showForm && addresses.map(a => {
        const sel = a.id === selectedId
        const line = [a.street, a.city, a.region, a.postal_code, countryName(a.country)].filter(Boolean).join(', ')
        return (
          <div key={a.id} onClick={() => onSelect(a.id)} style={{ border: `1.5px solid ${sel ? ORANGE : LINE}`, background: sel ? '#FFF7F2' : '#fff', borderRadius: 12, padding: 14, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${sel ? ORANGE : '#CCC'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{sel && <span style={{ width: 10, height: 10, borderRadius: '50%', background: ORANGE }} />}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{a.full_name}{a.phone && <span style={{ color: MUTE, fontWeight: 500 }}> · {a.phone}</span>}</div>
              <div style={{ fontSize: 12.5, color: MUTE, marginTop: 3, lineHeight: 1.5 }}>{line}</div>
              {a.is_default && <span style={{ display: 'inline-block', marginTop: 8, background: SOFT, color: ORANGE, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>Par défaut</span>}
            </div>
          </div>
        )
      })}
      {showForm ? (
        <AddressForm adding={adding} allowCancel={!empty} onCancel={() => setIsFormOpen(false)} onSave={async (form) => { await onAdd(form); setIsFormOpen(false) }} coords={coords} />
      ) : (
        <button type="button" onClick={() => setIsFormOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', border: `1.4px dashed ${ORANGE}`, background: '#fff', color: ORANGE, borderRadius: 12, padding: '13px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}><Plus size={16} /> Ajouter une adresse</button>
      )}
      {!empty && <div style={{ textAlign: 'right' }}><Link to="/dashboard/addresses" style={{ fontSize: 12.5, color: MUTE, textDecoration: 'underline' }}>Gérer mes adresses</Link></div>}
    </div>
  )
}

// ══════════ DESKTOP (2 colonnes, PAS DE SCROLL, CARTE À DROITE) ══════════
function DesktopCheckout(c) {
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false)
  const [coords, setCoords] = useState(DEFAULT_COORDS)

  // Synchronisation automatique : si l'adresse change à gauche, la carte bouge à droite.
  // On ne resynchronise pas pendant l'ajout d'une nouvelle adresse, pour ne pas
  // écraser le pin que l'utilisateur est en train de positionner.
  useEffect(() => {
    if (isAddressFormOpen || !c.selectedAddress) return
    const addr = c.selectedAddress
    if (addr.latitude && addr.longitude) {
      setCoords({ lat: parseFloat(addr.latitude), lng: parseFloat(addr.longitude) })
      return
    }
    let alive = true
    const query = [addr.street, addr.city, addr.region, addr.postal_code, addr.country].filter(Boolean).join(', ')
    if (!query) return
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => { if (alive && data?.[0]) setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }) })
      .catch(console.error)
    return () => { alive = false }
  }, [c.selectedAddress, isAddressFormOpen])

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#fff', fontFamily: FONT, color: INK, display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 0 24px', flex: 1, display: 'flex', flexDirection: 'column', height: '100%', width: '100%', boxSizing: 'border-box' }}>

        {/* Fil d'Ariane */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 24, flexShrink: 0 }}>
          <Link to="/panier" style={{ color: ORANGE, textDecoration: 'none', fontWeight: 600 }}>Panier</Link>
          <span style={{ color: FAINT }}>›</span>
          <span style={{ color: INK, fontWeight: 700 }}>Livraison</span>
          <span style={{ color: FAINT }}>›</span>
          <span style={{ color: FAINT }}>Paiement</span>
        </div>

        {/* Layout principal — occupe tout l'espace restant, sans scroll de page */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) 1fr', gap: 32, flex: 1, minHeight: 0 }}>

          {/* ─── COLONNE GAUCHE (scroll interne si le contenu dépasse) ─── */}
          <div style={{ overflowY: 'auto', height: '100%', paddingBottom: 20, paddingRight: 4 }}>
            <h1 style={{ margin: '0 0 20px', fontSize: 26, fontWeight: 800 }}>Adresse de livraison</h1>
            <AddressPicker
              addresses={c.addresses} loading={c.addrLoading} selectedId={c.selectedAddress?.id ?? null}
              onSelect={c.selectAddress} onAdd={c.addAddress} adding={c.addingAddress} user={c.user}
              isFormOpen={isAddressFormOpen} setIsFormOpen={setIsAddressFormOpen}
              coords={coords}
            />

            <div style={{ marginTop: 20 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTE, display: 'block', marginBottom: 6 }}>Note (optionnel)</span>
              <textarea value={c.notes} onChange={e => c.setNotes(e.target.value)} rows={3} placeholder="Instructions de livraison…"
                style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${LINE}`, borderRadius: 10, padding: '11px 13px', fontSize: 14, fontFamily: FONT, outline: 'none', color: INK, resize: 'vertical' }} />
            </div>

            <h2 style={{ margin: '32px 0 16px', fontSize: 20, fontWeight: 800 }}>Méthode de livraison</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {c.shippingLoading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: 13, color: MUTE, padding: 20 }}>Chargement...</div>
              ) : (
                c.shippingOptions.map(opt => (
                  <ShippingTile key={opt.id} active={c.shipping === opt.id} title={opt.title} sub={opt.sub || ''} price={opt.price || 0} onClick={() => c.setShipping(opt.id)} />
                ))
              )}
            </div>
          </div>

          {/* ─── COLONNE DROITE (carte, toujours liée à la sélection de gauche) ─── */}
          <aside style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, border: `1px solid ${LINE}`, borderRadius: 16, padding: 12, boxShadow: '0 4px 20px rgba(0,0,0,.04)' }}>
              <MapPicker
                initialLat={coords.lat}
                initialLng={coords.lng}
                onLocationSelect={setCoords}
                interactive={isAddressFormOpen}
              />
            </div>
            {!isAddressFormOpen && c.selectedAddress && (
              <div style={{ marginTop: 10, fontSize: 12, color: MUTE, textAlign: 'center' }}>
                📍 {[c.selectedAddress.street, c.selectedAddress.city, c.selectedAddress.region].filter(Boolean).join(', ')}
              </div>
            )}
          </aside>
        </div>

        {/* ─── Barre d'action : erreur + Continuer vers le paiement ─── */}
        <div style={{ flexShrink: 0, borderTop: `1px solid ${LINE}`, padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 20 }}>
          {c.error && <div style={{ color: '#DC2626', fontSize: 13, marginRight: 'auto' }}>{c.error}</div>}
          <button onClick={c.goToPayment}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px 28px', borderRadius: 12, border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', background: 'linear-gradient(135deg,#FF6B35,#FF4500)', boxShadow: '0 4px 14px rgba(255,69,0,.3)', whiteSpace: 'nowrap' }}>
            Continuer vers le paiement <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════ MOBILE ══════════
function SectionHeader({ icon: Icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} color={ORANGE} /></span>
      <span style={{ fontSize: 15, fontWeight: 800 }}>{title}</span>
    </div>
  )
}
function MobileCheckout(c) {
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false)
  const [coords, setCoords] = useState(DEFAULT_COORDS)

  // Même logique de synchronisation que sur desktop : la carte suit l'adresse
  // sélectionnée, sauf pendant la saisie d'une nouvelle adresse.
  useEffect(() => {
    if (isAddressFormOpen || !c.selectedAddress) return
    const addr = c.selectedAddress
    if (addr.latitude && addr.longitude) {
      setCoords({ lat: parseFloat(addr.latitude), lng: parseFloat(addr.longitude) })
      return
    }
    let alive = true
    const query = [addr.street, addr.city, addr.region, addr.postal_code, addr.country].filter(Boolean).join(', ')
    if (!query) return
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => { if (alive && data?.[0]) setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }) })
      .catch(console.error)
    return () => { alive = false }
  }, [c.selectedAddress, isAddressFormOpen])

  return (
    <div style={{ fontFamily: FONT, color: INK, background: '#fff', minHeight: '100dvh', paddingBottom: 92 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: `1px solid #F0F0F0`, height: 52, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <button onClick={() => c.navigate(-1)} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', color: INK }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 800 }}>Checkout</span>
        <span style={{ width: 32 }} />
      </div>
      <div style={{ padding: '16px 16px 8px' }}>
        <SectionHeader icon={MapPin} title="Adresse de livraison" />
        <div style={{ marginBottom: 24 }}>
          <AddressPicker
            addresses={c.addresses} loading={c.addrLoading} selectedId={c.selectedAddress?.id ?? null}
            onSelect={c.selectAddress} onAdd={c.addAddress} adding={c.addingAddress} user={c.user}
            isFormOpen={isAddressFormOpen} setIsFormOpen={setIsAddressFormOpen}
            coords={coords}
          />
          {isAddressFormOpen && (
            <div style={{ marginTop: 12, height: 280, borderRadius: 12, overflow: 'hidden', border: `1px solid ${LINE}` }}>
              <MapPicker onLocationSelect={setCoords} initialLat={coords.lat} initialLng={coords.lng} interactive />
            </div>
          )}
          {!isAddressFormOpen && c.selectedAddress && (
            <div style={{ marginTop: 12, height: 180, borderRadius: 12, overflow: 'hidden', border: `1px solid ${LINE}` }}>
              <MapPicker initialLat={coords.lat} initialLng={coords.lng} interactive={false} />
            </div>
          )}
        </div>

        <SectionHeader icon={Truck} title="Options de livraison" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {c.shippingLoading ? (
            <div style={{ padding: 20, textAlign: 'center', color: MUTE }}>Chargement...</div>
          ) : (
            c.shippingOptions.map(opt => (
              <ShippingTile key={opt.id} active={c.shipping === opt.id} title={opt.title} sub={opt.sub || ''} price={opt.price || 0} onClick={() => c.setShipping(opt.id)} />
            ))
          )}
        </div>

        <div>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTE, display: 'block', marginBottom: 6 }}>Note (optionnel)</span>
          <textarea value={c.notes} onChange={e => c.setNotes(e.target.value)} rows={3} placeholder="Instructions de livraison…"
            style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${LINE}`, borderRadius: 10, padding: '11px 13px', fontSize: 14, fontFamily: FONT, outline: 'none', color: INK, resize: 'vertical' }} />
        </div>

        {c.error && <div style={{ color: '#DC2626', fontSize: 12.5, marginTop: 16 }}>{c.error}</div>}
      </div>

      {/* Bouton fixe : Continuer vers le paiement */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60, background: '#fff', borderTop: `1px solid ${LINE}`, padding: '10px 16px calc(10px + env(safe-area-inset-bottom))' }}>
        <button onClick={c.goToPayment}
          style={{ width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, border: 'none', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', background: 'linear-gradient(135deg,#FF6B35,#FF4500)' }}>
          Continuer vers le paiement <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}

// ══════════ WRAPPER ══════════
export default function CheckoutPage() {
  const isMobile = useIsMobile()
  const checkout = useCheckout()
  return <>{isMobile ? <MobileCheckout {...checkout} /> : <DesktopCheckout {...checkout} />}</>
}