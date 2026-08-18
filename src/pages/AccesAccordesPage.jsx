// src/pages/AccesAccordesPage.jsx — GROSHOP.tn
// Dashboard fournisseur — liste des accès accordés aux clients pour les prix
// masqués (catalogue complet OU produit spécifique). Révocation en 1 clic.

import { useState, useEffect, useMemo } from 'react'
import * as Icons from 'lucide-react'
import { access } from '../lib/api'

const ORANGE = '#ff5e20'
const ORANGE_TINT = 'rgba(255, 94, 32, .10)'
const INK='#0F1419', SUB='#3D4853', MUTE='#6B7280', FAINT='#9AA3AE', LINE='#EAE7DF'
const GREEN='#059669', RED='#DC2626', AMBER='#D97706'
const FONT='"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const fmtDate = (iso) => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '' }
}
const initials = (name) => (name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')

const relativeExpiry = (iso) => {
  if (!iso) return { label: 'Permanent', color: GREEN, urgent: false }
  const d = new Date(iso); const now = new Date()
  const diff = d - now
  if (diff <= 0) return { label: 'Expiré', color: RED, urgent: true }
  const days = Math.ceil(diff / 86400000)
  if (days <= 7) return { label: `Expire dans ${days}j`, color: AMBER, urgent: true }
  return { label: `Expire le ${fmtDate(iso)}`, color: MUTE, urgent: false }
}

export default function AccesAccordesPage() {
  const [rows, setRows] = useState(null)
  const [err, setErr]   = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')   // 'all' | 'supplier' | 'product'
  const [revoking, setRevoking] = useState(null) // unlock_id en cours

  const load = async () => {
    try {
      const d = await access.myUnlocks()
      // Réponse attendue : { supplier_unlocks: [...], product_unlocks: [...] }
      // ou tableau plat avec un champ scope. On accepte les deux.
      const raw = d?.results || d
      let list = []
      if (Array.isArray(raw)) {
        list = raw
      } else if (raw && typeof raw === 'object') {
        const sup = (raw.supplier_unlocks || []).map(u => ({ ...u, scope: 'supplier' }))
        const prd = (raw.product_unlocks  || []).map(u => ({ ...u, scope: 'product' }))
        list = [...sup, ...prd]
      }
      // Tri : les plus récents en premier
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      setRows(list)
    } catch (e) {
      setErr(e?.message || 'Impossible de charger vos accès.')
      setRows([])
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => (rows || []).filter(r => {
    if (filter === 'supplier' && r.scope !== 'supplier') return false
    if (filter === 'product'  && r.scope !== 'product')  return false
    if (search) {
      const q = search.toLowerCase()
      const hay = `${r.user?.full_name || r.user_name || ''} ${r.user?.email || ''} ${r.product_name || ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  }), [rows, search, filter])

  const stats = useMemo(() => {
    const list = rows || []
    return {
      total:    list.length,
      supplier: list.filter(r => r.scope === 'supplier').length,
      product:  list.filter(r => r.scope === 'product').length,
      expiring: list.filter(r => {
        if (!r.expires_at) return false
        const days = (new Date(r.expires_at) - new Date()) / 86400000
        return days > 0 && days <= 7
      }).length,
    }
  }, [rows])

  const doRevoke = async (row) => {
    if (!confirm(`Révoquer l'accès de ${row.user?.full_name || row.user_name || 'ce client'} ?`)) return
    setRevoking(row.unlock_id || row.id)
    try {
      if (row.scope === 'supplier') await access.revokeSupplier(row.unlock_id || row.id)
      else                          await access.revokeProduct(row.unlock_id || row.id)
      await load()
    } catch (e) {
      alert(e?.message || 'Échec de la révocation.')
    } finally {
      setRevoking(null)
    }
  }

  return (
    <div style={{ fontFamily: FONT, color: INK }}>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 42, margin: 0, color: INK, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            Accès accordés
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: MUTE, fontWeight: 400 }}>
            Clients à qui vous avez débloqué vos prix masqués.
          </p>
        </div>
      </div>

      {/* KPI ligne */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label="Accès actifs"        value={stats.total} icon={Icons.Unlock} />
        <StatCard label="Catalogues débloqués" value={stats.supplier} icon={Icons.Store} />
        <StatCard label="Produits débloqués"   value={stats.product} icon={Icons.Package} />
        <StatCard label="Expirent sous 7j"     value={stats.expiring} icon={Icons.Clock} accent={stats.expiring > 0 ? AMBER : null} />
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, background: '#fff', borderRadius: 10, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${LINE}` }}>
          <Icons.Search size={15} color={FAINT} strokeWidth={2} />
          <input type="text" placeholder="Rechercher (nom, email, produit)…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, width: '100%', color: INK }} />
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#F4F4F2', borderRadius: 10, padding: 3 }}>
          {[
            { key: 'all',      label: 'Tous',       count: stats.total },
            { key: 'supplier', label: 'Catalogue',  count: stats.supplier },
            { key: 'product',  label: 'Produit',    count: stats.product },
          ].map(f => {
            const on = filter === f.key
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: on ? '#fff' : 'transparent', color: on ? INK : MUTE, fontWeight: on ? 700 : 500, fontSize: 12.5, padding: '7px 14px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: on ? '0 1px 3px rgba(0,0,0,.06)' : 'none' }}>
                {f.label}
                <span style={{ fontSize: 10.5, fontWeight: 700, color: on ? ORANGE : FAINT, background: on ? ORANGE_TINT : 'transparent', padding: '1px 6px', borderRadius: 999 }}>{f.count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Liste */}
      <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${LINE}`, overflow: 'hidden' }}>

        {/* En-tête colonnes (desktop) */}
        <div className="ac-cols-header" style={{
          display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1fr 100px',
          padding: '12px 18px', fontSize: 10.5,
          color: FAINT, fontWeight: 700,
          letterSpacing: '.06em', textTransform: 'uppercase',
          borderBottom: `1px solid ${LINE}`,
        }}>
          <div>Client</div>
          <div>Portée</div>
          <div>Accordé le</div>
          <div>Expiration</div>
          <div style={{ textAlign: 'right' }}></div>
        </div>

        {rows === null ? (
          <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, border: `3px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gs-spin2 .8s linear infinite' }} />
          </div>
        ) : err ? (
          <div style={{ padding: 40, textAlign: 'center', color: RED, fontSize: 13.5 }}>{err}</div>
        ) : filtered.length === 0 ? (
          <EmptyState hasAny={(rows || []).length > 0} search={search} />
        ) : filtered.map((r, i) => (
          <Row key={r.unlock_id || r.id || i}
            row={r}
            isLast={i === filtered.length - 1}
            revoking={revoking === (r.unlock_id || r.id)}
            onRevoke={() => doRevoke(r)}
          />
        ))}
      </div>

      {/* Responsive : sur mobile, cache l'en-tête colonnes (les lignes se plient toutes seules) */}
      <style>{`
        @media (max-width: 720px) {
          .ac-cols-header { display: none !important; }
          .ac-row { grid-template-columns: 1fr !important; gap: 6px !important; padding: 14px 16px !important; }
          .ac-row-cell-label { display: inline !important; color: ${FAINT}; font-weight: 600; margin-right: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
          .ac-row-actions { justify-content: flex-start !important; margin-top: 6px; }
        }
        .ac-row-cell-label { display: none; }
      `}</style>
    </div>
  )
}

// ── Ligne ───────────────────────────────────────────────────────────
function Row({ row, isLast, revoking, onRevoke }) {
  const name  = row.user?.full_name || row.user_name || 'Client'
  const email = row.user?.email || row.user_email || ''
  const city  = row.user?.city  || ''
  const exp   = relativeExpiry(row.expires_at)
  const scope = row.scope

  return (
    <div className="ac-row" style={{
      display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1fr 100px',
      padding: '14px 18px', fontSize: 13, color: INK,
      borderBottom: isLast ? 'none' : `1px solid #F5F3EE`,
      alignItems: 'center',
    }}>
      {/* Client */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: ORANGE_TINT, color: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
          {initials(name)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
          <div style={{ fontSize: 11.5, color: MUTE, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}{city && ` · ${city}`}
          </div>
          {row.note && (
            <div style={{ fontSize: 11, color: FAINT, marginTop: 3, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              « {row.note} »
            </div>
          )}
        </div>
      </div>

      {/* Portée */}
      <div>
        <span className="ac-row-cell-label">Portée</span>
        {scope === 'supplier' ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#7C3AED', background: '#EDE9FE', padding: '4px 10px', borderRadius: 20 }}>
            <Icons.Store size={12} strokeWidth={2.2} /> Catalogue entier
          </span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: ORANGE, background: ORANGE_TINT, padding: '4px 10px', borderRadius: 20, alignSelf: 'flex-start' }}>
              <Icons.Package size={12} strokeWidth={2.2} /> Produit
            </span>
            {row.product_name && (
              <span style={{ fontSize: 11, color: MUTE, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.product_name}>
                {row.product_name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Accordé le */}
      <div style={{ fontSize: 12.5, color: SUB }}>
        <span className="ac-row-cell-label">Accordé le</span>
        {fmtDate(row.created_at) || '—'}
      </div>

      {/* Expiration */}
      <div style={{ fontSize: 12.5, color: exp.color, fontWeight: exp.urgent ? 700 : 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span className="ac-row-cell-label">Expiration</span>
        {exp.urgent && <Icons.AlertCircle size={13} />}
        {exp.label}
      </div>

      {/* Actions */}
      <div className="ac-row-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onRevoke} disabled={revoking}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, background: '#fff', color: RED, border: `1px solid #FECACA`, fontSize: 12, fontWeight: 700, cursor: revoking ? 'wait' : 'pointer', opacity: revoking ? .6 : 1, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          {revoking ? '…' : (<><Icons.Lock size={12} strokeWidth={2.4} /> Révoquer</>)}
        </button>
      </div>
    </div>
  )
}

// ── KPI card ────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: MUTE, fontWeight: 600 }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: accent ? '#FEF3C7' : '#F5F3EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={accent || INK} strokeWidth={2.4} />
        </div>
      </div>
      <div style={{ fontSize: 34, fontWeight: 700, color: accent || INK, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 12 }}>
        {value}
      </div>
    </div>
  )
}

// ── Empty state ─────────────────────────────────────────────────────
function EmptyState({ hasAny, search }) {
  if (search) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <Icons.SearchX size={36} color={FAINT} strokeWidth={1.5} style={{ opacity: 0.5 }} />
        <div style={{ fontSize: 14, color: MUTE, marginTop: 12 }}>Aucun résultat pour « {search} »</div>
      </div>
    )
  }
  if (hasAny) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <Icons.Filter size={36} color={FAINT} strokeWidth={1.5} style={{ opacity: 0.5 }} />
        <div style={{ fontSize: 14, color: MUTE, marginTop: 12 }}>Aucun accès dans cette catégorie.</div>
      </div>
    )
  }
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: ORANGE_TINT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Icons.Unlock size={26} color={ORANGE} strokeWidth={2} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>Aucun accès accordé pour l'instant</div>
      <div style={{ fontSize: 13, color: MUTE, marginTop: 6, maxWidth: 420, margin: '6px auto 0', lineHeight: 1.55 }}>
        Quand un client vous contacte pour un produit à prix masqué, vous pouvez lui débloquer les prix depuis la conversation. Les accès accordés apparaîtront ici.
      </div>
    </div>
  )
}