// src/pages/AddressesPage.jsx — GROSHOP.tn
import { useState, useEffect } from 'react'
import {
  MapPin, Plus, Trash2, Pencil, X, ChevronLeft, Home, Briefcase, Building2, Check,
} from 'lucide-react'
import { addresses as addressesApi } from '../lib/api'
import { useIsMobile } from '../hooks/useIsMobile'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const ORANGE = '#FF5E00', INK = '#1A1A1A', MUTE = '#7A7A7A', FAINT = '#A0A0A0', LINE = '#EAEAEA', SOFT = '#FFF3EC'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const DEFAULT_COORDS = { lat: 36.800095, lng: 10.173364 }

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

// Sélecteur de type d'adresse — cosmétique local (address_label). Le modèle Address
// n'a pas ce champ côté back ; envoyé quand même dans le payload, ignoré si non supporté.
const ADDRESS_TYPES = [
  { value: 'home',   label: 'Maison', icon: Home },
  { value: 'office',  label: 'Bureau', icon: Briefcase },
  { value: 'other',  label: 'Autre',  icon: MapPin },
]

// ─── CARTE (partagée desktop + mobile) ───
function MapPicker({ initialLat = DEFAULT_COORDS.lat, initialLng = DEFAULT_COORDS.lng, onLocationSelect, interactive = true, hint }) {
  const [position, setPosition] = useState({ lat: initialLat, lng: initialLng })
  const [isLocating, setIsLocating] = useState(false)

  useEffect(() => { setPosition({ lat: initialLat, lng: initialLng }) }, [initialLat, initialLng])

  const updatePosition = (pos) => { setPosition(pos); onLocationSelect?.(pos) }

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
      <Marker position={[position.lat, position.lng]} draggable={interactive}
        eventHandlers={interactive ? { dragend(e) { const p = e.target.getLatLng(); updatePosition({ lat: p.lat, lng: p.lng }) } } : {}} />
    )
  }

  const locateUser = () => {
    if (!navigator.geolocation) { alert('Géolocalisation non supportée.'); return }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { updatePosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setIsLocating(false) },
      (err) => { alert('Impossible de récupérer votre position : ' + err.message); setIsLocating(false) },
      { enableHighAccuracy: true }
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {interactive && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <button type="button" onClick={locateUser} disabled={isLocating}
            style={{ padding: '4px 12px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {isLocating ? 'Localisation…' : '📍 Ma position'}
          </button>
          <span style={{ fontSize: 11, color: MUTE, alignSelf: 'center' }}>Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}</span>
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, borderRadius: interactive && !hint ? 12 : 0, overflow: 'hidden', border: interactive && !hint ? `1px solid ${LINE}` : 'none' }}>
        <MapContainer key={`${position.lat}-${position.lng}`} center={[position.lat, position.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker />
        </MapContainer>
      </div>
      {hint && (
        <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', background: INK, color: '#fff', fontSize: 12.5, fontWeight: 600, padding: '9px 16px', borderRadius: 20, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(0,0,0,.25)' }}>
          {hint}
        </div>
      )}
    </div>
  )
}

// ─── CHAMPS ───
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
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', border: `1px solid ${LINE}`, borderRadius: 10, padding: '11px 13px', fontSize: 14, fontFamily: FONT, outline: 'none', color: INK, background: '#fff' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}
function TypePicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {ADDRESS_TYPES.map(t => {
        const Icon = t.icon
        const active = value === t.value
        return (
          <button key={t.value} type="button" onClick={() => onChange(t.value)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${active ? ORANGE : LINE}`, background: active ? SOFT : '#fff', color: active ? ORANGE : INK, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
            <Icon size={15} /> {t.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── ÉTAT PARTAGÉ DU FORMULAIRE ───
function useAddressForm(editing) {
  const [f, setF] = useState(() => editing ? {
    label: editing.label || 'home', full_name: editing.full_name || '', phone: editing.phone || '',
    country: editing.country || 'TN', region: editing.region || '', city: editing.city || '',
    postal_code: editing.postal_code || '', street: editing.street || '', additional: editing.additional || '',
    is_default: !!editing.is_default, latitude: editing.latitude ?? null, longitude: editing.longitude ?? null,
  } : {
    label: 'home', full_name: '', phone: '', country: 'TN', region: '', city: '', postal_code: '',
    street: '', additional: '', is_default: false, latitude: null, longitude: null,
  })
  const [coords, setCoords] = useState(() => (editing?.latitude && editing?.longitude)
    ? { lat: parseFloat(editing.latitude), lng: parseFloat(editing.longitude) }
    : DEFAULT_COORDS)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [pinMoved, setPinMoved] = useState(false)
  const set = (k, v) => setF(s => ({ ...s, [k]: v }))
  const valid = f.full_name.trim() && f.phone.trim() && f.street.trim() && f.city.trim() && f.region.trim()

  const onMapMove = (pos) => {
    setPinMoved(true)
    setCoords(pos)
    set('latitude', pos.lat)
    set('longitude', pos.lng)
  }

  // Reverse-geocoding (Nominatim) uniquement après un déplacement manuel du pin,
  // pour ne pas écraser les champs d'une adresse déjà remplie au chargement.
  useEffect(() => {
    if (!pinMoved || !coords?.lat || !coords?.lng) return
    let alive = true
    setIsGeocoding(true)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`)
      .then(res => res.json())
      .then(data => {
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
      })
      .catch(err => console.error('Erreur reverse geocoding:', err))
      .finally(() => { if (alive) setIsGeocoding(false) })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lng])

  return { f, set, coords, onMapMove, isGeocoding, valid }
}

// ══════════ DESKTOP ══════════
function AddressForm({ editing, onCancel, onSave, saving }) {
  const { f, set, coords, onMapMove, isGeocoding, valid } = useAddressForm(editing)

  return (
    <div style={{ background: '#fff', border: `0.5px solid ${LINE}`, borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 4px 20px rgba(0,0,0,.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 800 }}>{editing ? "Modifier l'adresse" : 'Nouvelle adresse'}</span>
        <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTE, display: 'flex' }}><X size={18} /></button>
      </div>

      <div style={{ height: 220, borderRadius: 12, overflow: 'hidden', border: `1px solid ${LINE}`, position: 'relative' }}>
        <MapPicker initialLat={coords.lat} initialLng={coords.lng} interactive onLocationSelect={onMapMove} />
        {isGeocoding && <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 11, background: '#fff', padding: '2px 8px', borderRadius: 20, color: MUTE }}>Chargement…</span>}
      </div>

      <TypePicker value={f.label} onChange={v => set('label', v)} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Nom complet" value={f.full_name} onChange={v => set('full_name', v)} placeholder="Nom du destinataire" />
        <Field label="Téléphone" value={f.phone} onChange={v => set('phone', v)} placeholder="+216 …" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Select label="Pays" value={f.country} onChange={v => set('country', v)} options={COUNTRIES.map(c => ({ value: c.code, label: `${c.flag} ${c.name}` }))} />
        <Select label="Gouvernorat" value={f.region} onChange={v => set('region', v)} options={[{ value: '', label: 'Choisir…' }, ...GOUVERNORATS_TN.map(g => ({ value: g, label: g }))]} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Ville" value={f.city} onChange={v => set('city', v)} placeholder="Ville" />
        <Field label="Code postal" value={f.postal_code} onChange={v => set('postal_code', v)} placeholder="1000" />
      </div>
      <Field label="Adresse" value={f.street} onChange={v => set('street', v)} placeholder="Rue, numéro, quartier…" />
      <Field label="Complément (optionnel)" value={f.additional} onChange={v => set('additional', v)} placeholder="Apt, étage, bâtiment" />
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: MUTE }}>
        <input type="checkbox" checked={f.is_default} onChange={e => set('is_default', e.target.checked)} /> Définir comme adresse par défaut
      </label>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, border: `1px solid ${LINE}`, borderRadius: 10, padding: 11, fontSize: 13.5, fontWeight: 700, color: INK, background: '#fff', cursor: 'pointer' }}>Annuler</button>
        <button type="button" disabled={!valid || saving || isGeocoding} onClick={() => onSave(f)}
          style={{ flex: 1, border: 'none', borderRadius: 10, padding: 11, fontSize: 13.5, fontWeight: 800, color: '#fff', background: ORANGE, cursor: (valid && !saving) ? 'pointer' : 'default', opacity: (valid && !saving) ? 1 : .6 }}>
          {saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : "Enregistrer l'adresse"}
        </button>
      </div>
    </div>
  )
}

function AddressCard({ addr, onEdit, onDelete }) {
  const line = [addr.street, addr.city, addr.region, addr.postal_code, countryName(addr.country)].filter(Boolean).join(', ')
  return (
    <div style={{ border: `1.5px solid ${addr.is_default ? ORANGE : LINE}`, background: addr.is_default ? SOFT : '#fff', borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          {addr.is_default && <span style={{ display: 'inline-block', marginBottom: 8, background: '#FAC775', color: '#633806', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>Par défaut</span>}
          <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{addr.full_name}{addr.phone && <span style={{ color: MUTE, fontWeight: 500 }}> · {addr.phone}</span>}</div>
          <div style={{ fontSize: 12.5, color: MUTE, marginTop: 3, lineHeight: 1.5 }}>{line}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={() => onEdit(addr)} title="Modifier" style={{ border: `1px solid ${LINE}`, background: '#fff', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: INK }}><Pencil size={15} /></button>
          <button onClick={() => onDelete(addr)} title="Supprimer" style={{ border: `1px solid ${LINE}`, background: '#fff', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#DC2626' }}><Trash2 size={15} /></button>
        </div>
      </div>
    </div>
  )
}

function DesktopAddresses({ list, loading, error, panel, setPanel, saving, handleSave, handleDelete }) {
  return (
    <div style={{ fontFamily: FONT, color: INK, padding: '28px clamp(20px,3vw,40px)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 420px', gap: 24, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Mes adresses</h1>
            <button onClick={() => setPanel('new')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: ORANGE, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}><Plus size={16} /> Ajouter</button>
          </div>
          {loading ? (
            <div style={{ padding: '24px 0', color: FAINT, fontSize: 13.5 }}>Chargement de vos adresses…</div>
          ) : list.length === 0 ? (
            <div style={{ border: `1px dashed ${LINE}`, borderRadius: 12, padding: 30, textAlign: 'center', color: MUTE, fontSize: 13.5 }}>
              <MapPin size={22} color={FAINT} style={{ marginBottom: 8 }} />
              <div>Vous n'avez encore aucune adresse enregistrée.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {list.map(a => <AddressCard key={a.id} addr={a} onEdit={setPanel} onDelete={handleDelete} />)}
            </div>
          )}
          {error && <div style={{ color: '#DC2626', fontSize: 13, marginTop: 14 }}>{error}</div>}
        </div>
        {panel ? (
          <AddressForm editing={panel === 'new' ? null : panel} onCancel={() => setPanel(null)} onSave={handleSave} saving={saving} />
        ) : (
          <div style={{ border: `1px dashed ${LINE}`, borderRadius: 16, padding: 30, textAlign: 'center', color: FAINT, fontSize: 13 }}>
            Sélectionnez « Modifier » sur une adresse ou « Ajouter » pour afficher le formulaire ici.
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════ MOBILE ══════════
function MobileTopBar({ title, onBack, right }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: `1px solid ${LINE}`, height: 52, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', display: 'flex', color: INK }}><ChevronLeft size={24} /></button>
      <span style={{ flex: 1, textAlign: 'center', fontSize: 16.5, fontWeight: 800, marginRight: right ? 0 : 40 }}>{title}</span>
      {right}
    </div>
  )
}

function MobileAddressCard({ addr, selected, onSelect, onEdit }) {
  const Icon = ADDRESS_TYPES.find(t => t.value === addr.label)?.icon || MapPin
  const line = [addr.street, addr.city, addr.region ? `étage ${addr.region}` : null].filter(Boolean).join(', ')
  return (
    <div onClick={() => onSelect(addr)} style={{ border: `1.5px solid ${selected ? ORANGE : LINE}`, background: selected ? SOFT : '#fff', borderRadius: 14, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
      <span style={{ width: 34, height: 34, borderRadius: 9, background: selected ? '#fff' : '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: ORANGE }}><Icon size={17} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>{ADDRESS_TYPES.find(t => t.value === addr.label)?.label || addr.full_name}</div>
        <div style={{ fontSize: 12.5, color: MUTE, marginTop: 3, lineHeight: 1.5 }}>{[addr.city, addr.street, addr.region, addr.postal_code].filter(Boolean).join(', ')}</div>
        {addr.phone && <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>{addr.phone}</div>}
        <button onClick={(e) => { e.stopPropagation(); onEdit(addr) }} style={{ background: 'none', border: 'none', padding: 0, marginTop: 6, color: ORANGE, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Modifier</button>
      </div>
      <span style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${selected ? ORANGE : '#CCC'}`, background: selected ? ORANGE : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {selected && <Check size={13} color="#fff" strokeWidth={3} />}
      </span>
    </div>
  )
}

function MobileAddressListScreen({ list, loading, selectedId, setSelectedId, onAdd, onEdit, navigate }) {
  return (
    <div style={{ fontFamily: FONT, color: INK, background: '#F4F5F7', minHeight: '100dvh' }}>
      <MobileTopBar title="Mes adresses" onBack={() => navigate(-1)} />
      <div style={{ padding: 16 }}>
        <button onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: '#fff', border: `1.5px dashed ${ORANGE}`, color: ORANGE, borderRadius: 12, padding: '13px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}>
          <Plus size={17} /> Ajouter une nouvelle adresse
        </button>
        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: FAINT, fontSize: 13.5 }}>Chargement…</div>
        ) : list.length === 0 ? (
          <div style={{ background: '#fff', border: `1px dashed ${LINE}`, borderRadius: 12, padding: 30, textAlign: 'center', color: MUTE, fontSize: 13.5 }}>
            Aucune adresse enregistrée pour le moment.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.map(a => (
              <MobileAddressCard key={a.id} addr={a} selected={a.id === selectedId} onSelect={(addr) => setSelectedId(addr.id)} onEdit={onEdit} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MobileAddressFormScreen({ editing, onCancel, onSave, saving }) {
  const { f, set, coords, onMapMove, isGeocoding, valid } = useAddressForm(editing)
  const [step, setStep] = useState('map') // 'map' | 'details'

  if (step === 'map') {
    return (
      <div style={{ fontFamily: FONT, color: INK, height: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <MapPicker initialLat={coords.lat} initialLng={coords.lng} interactive onLocationSelect={onMapMove} hint="Déplacez le pin pour ajuster" />
          <button onClick={onCancel} style={{ position: 'absolute', top: 14, left: 14, width: 38, height: 38, borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.15)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ background: '#fff', borderTop: `1px solid ${LINE}`, padding: '14px 16px calc(14px + env(safe-area-inset-bottom))' }}>
          {isGeocoding && <div style={{ fontSize: 12, color: MUTE, marginBottom: 8 }}>Recherche de l'adresse…</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <MapPin size={18} color={ORANGE} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: INK, lineHeight: 1.4 }}>{[f.street, f.city, f.region].filter(Boolean).join(', ') || 'Positionnez le pin sur votre adresse'}</span>
          </div>
          <button onClick={() => setStep('details')} disabled={isGeocoding}
            style={{ width: '100%', height: 50, borderRadius: 14, border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, cursor: isGeocoding ? 'default' : 'pointer', background: 'linear-gradient(135deg,#FF6B35,#FF4500)', opacity: isGeocoding ? .6 : 1 }}>
            Confirmer cet emplacement
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: FONT, color: INK, background: '#fff', minHeight: '100dvh', paddingBottom: 92 }}>
      <MobileTopBar title={editing ? "Modifier l'adresse" : 'Nouvelle adresse'} onBack={() => setStep('map')} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTE }}>Type d'adresse</span>
        <TypePicker value={f.label} onChange={v => set('label', v)} />
        <Field label="Nom complet" value={f.full_name} onChange={v => set('full_name', v)} placeholder="Nom du destinataire" />
        <Field label="Téléphone" value={f.phone} onChange={v => set('phone', v)} placeholder="+216 …" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Select label="Pays" value={f.country} onChange={v => set('country', v)} options={COUNTRIES.map(c => ({ value: c.code, label: `${c.flag} ${c.name}` }))} />
          <Select label="Gouvernorat" value={f.region} onChange={v => set('region', v)} options={[{ value: '', label: 'Choisir…' }, ...GOUVERNORATS_TN.map(g => ({ value: g, label: g }))]} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Ville" value={f.city} onChange={v => set('city', v)} placeholder="Ville" />
          <Field label="Code postal" value={f.postal_code} onChange={v => set('postal_code', v)} placeholder="1000" />
        </div>
        <Field label="Adresse" value={f.street} onChange={v => set('street', v)} placeholder="Rue, numéro, quartier…" />
        <Field label="Complément (optionnel)" value={f.additional} onChange={v => set('additional', v)} placeholder="Apt, étage, bâtiment" />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: MUTE }}>
          <input type="checkbox" checked={f.is_default} onChange={e => set('is_default', e.target.checked)} /> Définir comme adresse par défaut
        </label>
      </div>
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#fff', borderTop: `1px solid ${LINE}`, padding: '10px 16px calc(10px + env(safe-area-inset-bottom))' }}>
        <button disabled={!valid || saving} onClick={() => onSave(f)}
          style={{ width: '100%', height: 50, borderRadius: 14, border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, cursor: (valid && !saving) ? 'pointer' : 'default', background: 'linear-gradient(135deg,#FF6B35,#FF4500)', opacity: (valid && !saving) ? 1 : .6 }}>
          {saving ? 'Enregistrement…' : 'Enregistrer l\'adresse'}
        </button>
      </div>
    </div>
  )
}

function MobileAddresses({ list, loading, panel, setPanel, saving, handleSave, navigate }) {
  const [selectedId, setSelectedId] = useState(() => list.find(a => a.is_default)?.id ?? list[0]?.id ?? null)
  useEffect(() => { if (selectedId == null && list.length) setSelectedId(list.find(a => a.is_default)?.id ?? list[0].id) }, [list, selectedId])

  if (panel) {
    return <MobileAddressFormScreen editing={panel === 'new' ? null : panel} onCancel={() => setPanel(null)} onSave={handleSave} saving={saving} />
  }
  return (
    <MobileAddressListScreen
      list={list} loading={loading} selectedId={selectedId} setSelectedId={setSelectedId}
      onAdd={() => setPanel('new')} onEdit={setPanel} navigate={navigate}
    />
  )
}

// ══════════ PAGE ══════════
export default function AddressesPage() {
  const isMobile = useIsMobile()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [panel, setPanel] = useState(null) // null | 'new' | address object en édition
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    addressesApi.list()
      .then(d => setList(Array.isArray(d) ? d : (d?.results || [])))
      .catch(() => setError('Impossible de charger vos adresses.'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleSave = async (form) => {
    setSaving(true)
    setError('')
    try {
      if (panel && panel !== 'new') await addressesApi.update(panel.id, form)
      else await addressesApi.create(form)
      setPanel(null)
      load()
    } catch (e) {
      setError(e.message || "Erreur lors de l'enregistrement.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (addr) => {
    if (!confirm(`Supprimer l'adresse de ${addr.full_name} ?`)) return
    try {
      await addressesApi.remove(addr.id)
      setList(prev => prev.filter(a => a.id !== addr.id))
    } catch (e) {
      setError(e.message || 'Erreur lors de la suppression.')
    }
  }

  if (isMobile) {
    return (
      <MobileAddresses
        list={list} loading={loading} panel={panel} setPanel={setPanel} saving={saving}
        handleSave={handleSave} navigate={(n) => window.history.go(n)}
      />
    )
  }

  return (
    <DesktopAddresses
      list={list} loading={loading} error={error} panel={panel} setPanel={setPanel}
      saving={saving} handleSave={handleSave} handleDelete={handleDelete}
    />
  )
}