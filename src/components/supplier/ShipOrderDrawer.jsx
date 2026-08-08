// components/supplier/ShipOrderDrawer.jsx — GROSHOP.tn
// Drawer de sélection du transporteur, ouvert depuis SupplierOrdersPage
// au clic sur « Expédier » (menu kebab OU bouton camion d'une ligne).
//
// Flux : à l'ouverture on charge
//   delivery.carrierConfigs()  -> transporteurs ACTIVÉS par le fournisseur
//   delivery.carriers()        -> catalogue (code -> label) pour l'affichage
// Sélection unique -> « Créer l'expédition » -> delivery.createShipment(...)
// -> onShipped(shipment) : le parent passe la sous-commande à `shipped`.
//
// ➕ Ajout : option « Livraison par mes soins » (SELF_DELIVERY_CODE).
//    Le fournisseur livre lui-même, sans transporteur GROSHOP :
//    - aucun appel à delivery.createShipment() (évite un 500 sur un
//      transporteur non configuré, cf. ALLOW_UNCONFIGURED)
//    - onShipped({ selfDelivery: true }) : le parent bascule directement
//      la sous-commande en `shipped` avec delivery_type='supplier'.
//
// ⚠️ 3 points marqués « AJUSTE » à adapter à ton back :
//   1. L'adresse destination (dépend de ce que renvoie /orders/supplier/).
//      Par défaut on n'envoie qu'order.id : laisse le back résoudre l'adresse
//      depuis la commande, ou renseigne order.destination si tu l'as.
//   2. ALLOW_UNCONFIGURED : true tant que la page « connecter un transporteur »
//      n'existe pas (pour tester) ; passe à false ensuite.
//   3. Le mapping poids/service si create_shipment attend d'autres clés.

import { useState, useEffect, useMemo } from 'react'
import * as Icons from 'lucide-react'
import { delivery } from '../../lib/api'

// même accent que SupplierOrdersPage ; mets '#ff5e20' pour l'orange sidebar
const ORANGE = '#FF4500'
const INK   = '#0F1419'
const MUTE  = '#6B7280'
const FAINT = '#9AA3AE'
const LINE  = '#EAE7DF'
const CREAM = '#FAFAF7'
const FONT  = "'DM Sans', -apple-system, sans-serif"

// AJUSTE (2) : autorise la sélection d'un transporteur non encore configuré.
const ALLOW_UNCONFIGURED = true

// Sentinelle pour l'option « je livre moi-même » — ne correspond à aucun
// code transporteur réel, jamais envoyée à delivery.createShipment().
const SELF_DELIVERY_CODE = '__self__'

// ── Styles injectés (anim slide-in + hover) ────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gs-ship-drawer-styles')) {
  const s = document.createElement('style')
  s.id = 'gs-ship-drawer-styles'
  s.textContent = `
    @keyframes gs-drawer-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes gs-fade-in   { from { opacity: 0; } to { opacity: 1; } }
    .gs-carrier-row { transition: border-color .15s, background .15s; }
    .gs-carrier-row:hover:not(.is-disabled):not(.is-on) { border-color: #D3D1C7; }
  `
  document.head.appendChild(s)
}

const fmtTND = (v) => Number(v || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })

const initials = (label = '') => {
  const w = String(label).trim().split(/\s+/)
  return ((w[0]?.[0] || '') + (w[1]?.[0] || '')).toUpperCase() || '??'
}
const normalize = (d) => Array.isArray(d) ? d : (d?.results || [])

// ═══════════════════════════════════════════════════════════════════
export default function ShipOrderDrawer({ order, open, onClose, onShipped }) {
  const [configs, setConfigs] = useState(null)   // configs activées | null = chargement
  const [catalog, setCatalog] = useState([])     // [{ code, label }]
  const [picked,  setPicked]  = useState(null)   // carrier_code sélectionné (ou SELF_DELIVERY_CODE)
  const [weight,  setWeight]  = useState('1')
  const [service, setService] = useState('standard')
  const [busy,    setBusy]    = useState(false)
  const [error,   setError]   = useState(null)

  const isSelf = picked === SELF_DELIVERY_CODE

  // COD : seulement en paiement à la livraison
  const codAmount = order?.payment_method === 'cod' ? Number(order?.subtotal_tnd || 0) : 0

  useEffect(() => {
    if (!open || !order) return
    setError(null); setPicked(null); setConfigs(null); setWeight('1'); setService('standard')
    Promise.all([
      delivery.carrierConfigs().catch(() => []),
      delivery.carriers().catch(() => []),
    ]).then(([cfgs, cat]) => {
      const active = normalize(cfgs).filter(c => c.is_active)
      setConfigs(active)
      setCatalog(normalize(cat))
      const def = active.find(c => c.is_default) || active[0]
      if (def) setPicked(def.carrier_code)
    })
  }, [open, order])

  // Fusionne catalogue + configs -> lignes affichées (activés d'abord)
  const rows = useMemo(() => {
    const byCode = new Map((configs || []).map(c => [c.carrier_code, c]))
    const labelOf = (code) => catalog.find(x => x.code === code)?.label || code

    if (configs && configs.length) {
      const enabled = configs.map(c => ({
        code: c.carrier_code, label: labelOf(c.carrier_code),
        isDefault: c.is_default, configured: true,
      }))
      if (!ALLOW_UNCONFIGURED) return enabled
      const rest = catalog
        .filter(x => !byCode.has(x.code))
        .map(x => ({ code: x.code, label: x.label, isDefault: false, configured: false }))
      return [...enabled, ...rest]
    }
    // aucun transporteur activé -> fallback catalogue (si autorisé)
    return ALLOW_UNCONFIGURED
      ? catalog.map(x => ({ code: x.code, label: x.label, isDefault: false, configured: false }))
      : []
  }, [configs, catalog])

  const submit = async () => {
    if (!picked || busy) return
    setBusy(true); setError(null)

    // ── Livraison par ses propres moyens : aucun transporteur GROSHOP,
    //    on ne touche pas à delivery.createShipment(). Le parent se charge
    //    de passer la sous-commande à `shipped` + delivery_type='supplier'.
    if (isSelf) {
      onShipped?.({ selfDelivery: true })
      onClose?.()
      setBusy(false)
      return
    }

    try {
      const shipment = await delivery.createShipment({
        order:          order.id,
        carrier_code:   picked,
        service,
        cod_amount_tnd: codAmount,
        parcels:        [{ weight: Number(String(weight).replace(',', '.')) || 1 }],
        // AJUSTE (1) : renseigne l'adresse si /orders/supplier/ te la renvoie,
        // sinon laisse le back la résoudre depuis la commande (order.id).
        destination:    order.destination || {},
        origin:         order.origin || {},
      })
      onShipped?.(shipment)
      onClose?.()
    } catch (e) {
      setError(e?.message || 'Création de l’expédition échouée')
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null
  const loading = configs === null

  return (
    <>
      {/* overlay */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(15,20,25,.35)',
        zIndex: 1000, animation: 'gs-fade-in .18s ease',
      }} />

      {/* panneau */}
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(440px, 100vw)',
        background: '#fff', zIndex: 1001, fontFamily: FONT, color: INK,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 30px rgba(15,20,25,.12)', animation: 'gs-drawer-in .22s ease',
      }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '18px 22px', borderBottom: '1px solid #F0EDE5' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, fontSize: 20, letterSpacing: '-.02em' }}>
              Expédier la commande
            </div>
            <div style={{ fontSize: 12.5, color: MUTE, marginTop: 3 }}>
              Réf. #{String(order?.id || '').slice(0, 8).toUpperCase()}{order?.buyer_name ? ` · ${order.buyer_name}` : ''}
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" style={{ border: 'none', background: 'none', cursor: 'pointer', color: FAINT, padding: 4, display: 'inline-flex' }}>
            <Icons.X size={20} />
          </button>
        </div>

        {/* résumé destination + COD */}
        <div style={{ display: 'flex', gap: 12, padding: '14px 22px', background: CREAM, borderBottom: '1px solid #F0EDE5' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Label>Destination</Label>
            <div style={{ fontSize: 13.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
              <Icons.MapPin size={15} color={ORANGE} style={{ flexShrink: 0 }} />
              {order?.destination?.city || order?.buyer_city || 'Résolue depuis la commande'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Label>{codAmount > 0 ? 'Montant COD' : 'Paiement'}</Label>
            <div style={{ fontSize: 15, fontWeight: 600, color: codAmount > 0 ? ORANGE : INK, marginTop: 4 }}>
              {codAmount > 0 ? `${fmtTND(codAmount)} TND` : 'Prépayé'}
            </div>
          </div>
        </div>

        {/* liste transporteurs (scroll) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Choisir le transporteur</div>

          {loading ? (
            <CarrierSkeleton />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>

              {/* ── Option : le fournisseur livre lui-même ── */}
              <div
                onClick={() => setPicked(SELF_DELIVERY_CODE)}
                className={`gs-carrier-row${isSelf ? ' is-on' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
                  border: `1.5px dashed ${isSelf ? ORANGE : LINE}`,
                  borderRadius: 12, cursor: 'pointer',
                  background: isSelf ? `${ORANGE}0D` : '#fff',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isSelf ? `${ORANGE}1F` : '#F1EFE9', color: isSelf ? ORANGE : '#5F5E5A',
                }}>
                  <Icons.Store size={17} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Livraison par mes soins</div>
                  <div style={{ fontSize: 12, color: MUTE, marginTop: 2 }}>
                    Sans transporteur GROSHOP — je gère moi-même l'acheminement
                  </div>
                </div>
                <Radio on={isSelf} />
              </div>

              {rows.length === 0 ? (
                ALLOW_UNCONFIGURED === false ? <EmptyCarriers /> : null
              ) : rows.map(r => {
                const on = picked === r.code
                const disabled = !r.configured && !ALLOW_UNCONFIGURED
                return (
                  <div
                    key={r.code}
                    onClick={() => !disabled && setPicked(r.code)}
                    className={`gs-carrier-row${disabled ? ' is-disabled' : ''}${on ? ' is-on' : ''}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
                      border: `1px ${r.configured ? 'solid' : 'dashed'} ${on ? ORANGE : LINE}`,
                      borderRadius: 12, cursor: disabled ? 'default' : 'pointer',
                      background: on ? `${ORANGE}0D` : '#fff', opacity: disabled ? .6 : 1,
                    }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 600, fontSize: 13,
                      background: on ? `${ORANGE}1F` : '#F1EFE9', color: on ? ORANGE : '#5F5E5A',
                    }}>{initials(r.label)}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
                        {r.label}
                        {r.isDefault && <Badge>Par défaut</Badge>}
                      </div>
                      <div style={{ fontSize: 12, color: r.configured ? MUTE : FAINT, marginTop: 2 }}>
                        {r.configured ? 'Activé' : 'Non configuré'}
                      </div>
                    </div>

                    {r.configured
                      ? <Radio on={on} />
                      : <span style={{ fontSize: 12, fontWeight: 500, color: ORANGE, whiteSpace: 'nowrap' }}>À connecter</span>}
                  </div>
                )
              })}
            </div>
          )}

          {/* poids + service — masqués en auto-livraison, inutiles sans transporteur */}
          {!loading && !isSelf && picked && (
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: MUTE, fontWeight: 500, marginBottom: 5 }}>Poids (kg)</div>
                <input
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  inputMode="decimal"
                  style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${LINE}`, borderRadius: 10, padding: '9px 12px', fontSize: 13, fontFamily: FONT, color: INK, outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1.4 }}>
                <div style={{ fontSize: 11, color: MUTE, fontWeight: 500, marginBottom: 5 }}>Service</div>
                <div style={{ display: 'flex', border: `1px solid ${LINE}`, borderRadius: 10, overflow: 'hidden' }}>
                  {['standard', 'express'].map(sv => (
                    <button key={sv} onClick={() => setService(sv)} style={{
                      flex: 1, padding: '9px 0', fontSize: 12.5, fontFamily: FONT, cursor: 'pointer', border: 'none',
                      fontWeight: service === sv ? 600 : 400,
                      background: service === sv ? INK : '#fff', color: service === sv ? '#fff' : MUTE,
                    }}>{sv === 'standard' ? 'Standard' : 'Express'}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* note explicative en auto-livraison */}
          {!loading && isSelf && (
            <div style={{ marginTop: 16, background: CREAM, border: `1px solid ${LINE}`, borderRadius: 10, padding: '12px 14px', fontSize: 12.5, color: MUTE, lineHeight: 1.5 }}>
              Vous êtes responsable de l'acheminement jusqu'au client{codAmount > 0 ? ' ainsi que de l\u2019encaissement du paiement à la livraison' : ''}.
              Le statut passera directement à « Expédiée ».
            </div>
          )}

          {error && (
            <div style={{ marginTop: 14, background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 10, padding: '10px 12px', fontSize: 12.5 }}>
              {error}
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{ padding: '16px 22px', borderTop: '1px solid #F0EDE5' }}>
          <button onClick={submit} disabled={!picked || busy} style={{
            width: '100%', padding: 13, border: 'none', borderRadius: 12,
            background: (!picked || busy) ? '#F1B49E' : ORANGE, color: '#fff',
            fontFamily: FONT, fontSize: 14, fontWeight: 600,
            cursor: (!picked || busy) ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            {busy
              ? 'Création…'
              : isSelf
                ? <><Icons.CheckCircle2 size={17} /> Confirmer l'expédition</>
                : <><Icons.Truck size={17} /> Créer l’expédition</>}
          </button>
          {codAmount > 0 && !isSelf && (
            <div style={{ textAlign: 'center', fontSize: 11, color: FAINT, marginTop: 9 }}>
              Le COD ({fmtTND(codAmount)} TND) est encaissé par le transporteur
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

// ── Helpers UI ─────────────────────────────────────────────────────
function Label({ children }) {
  return <div style={{ fontSize: 10.5, color: '#9AA3AE', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{children}</div>
}
function Badge({ children }) {
  return <span style={{ fontSize: 10, fontWeight: 600, color: ORANGE, background: `${ORANGE}1F`, padding: '1px 7px', borderRadius: 9 }}>{children}</span>
}
function Radio({ on }) {
  return (
    <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: `2px solid ${on ? ORANGE : '#D3D1C7'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {on && <div style={{ width: 9, height: 9, borderRadius: '50%', background: ORANGE }} />}
    </div>
  )
}
function CarrierSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', border: `1px solid ${LINE}`, borderRadius: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F1EFE9' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 12, width: '45%', background: '#F1EFE9', borderRadius: 4, marginBottom: 7 }} />
            <div style={{ height: 9, width: '25%', background: '#F5F3EE', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
function EmptyCarriers() {
  return (
    <div style={{ padding: '28px 16px', textAlign: 'center', color: MUTE }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FFF3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        <Icons.Truck size={22} color={ORANGE} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: INK, marginBottom: 4 }}>Aucun transporteur activé</div>
      <div style={{ fontSize: 12.5, maxWidth: 260, margin: '0 auto' }}>Active un transporteur, ou choisis « Livraison par mes soins » ci-dessus.</div>
    </div>
  )
}