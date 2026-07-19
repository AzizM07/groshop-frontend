// pages/FavorisPage.jsx — GROSHOP.tn
// Favoris acheteur : onglets Produits/Fournisseurs, panneau « Ma liste »,
// grille de favoris + « Recommandés pour vous ».
// Rendu dans DashboardLayout via <Outlet /> → /dashboard/favoris.
//
// Backend réel : products.favorites() / products.removeFavorite() / products.recommended()
// Champs lus = ceux de ProductListSerializer : primary_image, base_price_tnd,
//              supplier_name, supplier_slug, supplier_verified ('approved'), years_active.

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, MoreHorizontal, BadgeCheck, Store, Package, MessageSquare } from 'lucide-react'
import { products as productsApi, messaging } from '../lib/api'

const ORANGE = '#FF4500'
const INK    = '#0F1419'
const MUTE   = '#6B7785'
const FAINT  = '#9AA3AE'
const LINE   = '#E8EAED'
const FONT   = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const arr = (d) => Array.isArray(d) ? d : (d?.results || d?.products || [])

// ── Lecture des champs (ProductListSerializer) ──
const pImg   = (p) => p.primary_image || ''
const pTitle = (p) => p.name || 'Produit'
const pPrice = (p) => `${fmt(p.base_price_tnd)} TND`
const pOld   = (p) => (p.old_price_tnd ? `${fmt(p.old_price_tnd)} TND` : null)
const pVerified = (p) => p.supplier_verified === 'approved'

// ═══════════════════════════════════════════════════════════════════
export default function FavorisPage() {
  const navigate = useNavigate()
  const [tab, setTab]     = useState('produits')
  const [group, setGroup] = useState('all')
  const [products, setProducts] = useState(null)   // null = chargement
  const [reco, setReco]   = useState([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const d = await productsApi.favorites()          // { products, suppliers }
        if (alive) setProducts(arr(d?.products ?? d))
      } catch { if (alive) setProducts([]) }
      try {
        const r = await productsApi.recommended()        // { results, ... }
        if (alive) setReco(arr(r).slice(0, 10))
      } catch { if (alive) setReco([]) }
    })()
    return () => { alive = false }
  }, [])

  const list = products || []
  // (les groupes/listes ne sont pas encore renvoyés par l'API → un seul groupe « All »)

  const removeProduct = async (id) => {
    setProducts(ps => (ps || []).filter(p => p.id !== id))   // optimiste
    try { await productsApi.removeFavorite(id) } catch {}
  }

  // Ouvre la conversation fournisseur (endpoint réel)
  const openChat = async (slug, productId = null) => {
    if (!slug) { navigate('/dashboard/messages'); return }
    try {
      const conv = await messaging.startConversation(slug, productId)
      navigate(conv?.id ? `/dashboard/messages/${conv.id}` : '/dashboard/messages')
    } catch { navigate('/dashboard/messages') }
  }

  return (
    <div style={{ padding: '20px clamp(16px, 2vw, 32px) 48px', fontFamily: FONT, color: INK }}>
      <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800 }}>Favoris</h1>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${LINE}`, marginBottom: 20 }}>
        {[['produits', 'Produits'], ['fournisseurs', 'Fournisseurs']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT,
            padding: '10px 0', fontSize: 15, fontWeight: tab === id ? 800 : 500,
            color: tab === id ? INK : MUTE, borderBottom: tab === id ? `2px solid ${INK}` : '2px solid transparent',
          }}>{label}</button>
        ))}
      </div>

      {products === null && <FavSkeleton />}

      {/* ─── PRODUITS ─── */}
      {products !== null && tab === 'produits' && (
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          <aside style={{ width: 190, flexShrink: 0 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800 }}>Ma liste</h3>
            <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginBottom: 16, fontSize: 13.5, color: INK, textDecoration: 'underline', textUnderlineOffset: 3, fontFamily: FONT }}>Créer une liste</button>
            <GroupBtn active={group === 'all'} onClick={() => setGroup('all')} title="All" count={list.length} />
            <GroupBtn active={group === 'ungrouped'} onClick={() => setGroup('ungrouped')} title="Ungrouped" count={list.length} />
          </aside>

          <div style={{ flex: 1, minWidth: 0 }}>
            {list.length === 0 ? (
              <EmptyState icon={<Package size={40} color={FAINT} />} text="Aucun produit en favori" cta />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
                {list.map(p => (
                  <ProductCard key={p.id} p={p}
                    onRemove={() => removeProduct(p.id)}
                    onChat={() => openChat(p.supplier_slug, p.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── FOURNISSEURS (l'API ne renvoie pas encore de fournisseurs favoris) ─── */}
      {products !== null && tab === 'fournisseurs' && (
        <EmptyState icon={<Store size={40} color={FAINT} />} text="Aucun fournisseur en favori" />
      )}

      {/* ─── RECOMMANDÉS (products.recommended()) ─── */}
      {reco.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800 }}>Recommandés pour vous</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {reco.map(p => (
              <Link key={p.id} to={`/produit/${p.id}`} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden', textDecoration: 'none', color: INK }}>
                <div style={{ aspectRatio: '1 / 1', background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {pImg(p) ? <img src={pImg(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={28} color={FAINT} />}
                </div>
                <div style={{ padding: '10px 12px 14px' }}>
                  <div style={{ fontSize: 13, lineHeight: 1.4, height: 36, overflow: 'hidden' }}>{pTitle(p)}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginTop: 6 }}>{pPrice(p)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sous-composants ─────────────────────────────────────────────────
function GroupBtn({ active, onClick, title, count }) {
  return (
    <button onClick={onClick} style={{ display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: FONT, border: 'none', borderRadius: 10, padding: '12px 14px', marginBottom: 6, background: active ? '#F1EFE8' : 'transparent' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{title}</div>
      <div style={{ fontSize: 12, color: MUTE, marginTop: 2 }}>{count} article{count > 1 ? 's' : ''}</div>
    </button>
  )
}

function ProductCard({ p, onRemove, onChat }) {
  const old = pOld(p)
  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', aspectRatio: '1 / 1', background: '#F4F5F7' }}>
        <Link to={`/produit/${p.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          {pImg(p) ? <img src={pImg(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   : <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: FAINT }}><Package size={30} /></span>}
        </Link>
        <button onClick={onRemove} title="Retirer des favoris" style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', border: 'none', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Heart size={18} color={ORANGE} fill={ORANGE} />
        </button>
      </div>
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.4, color: INK, height: 38, overflow: 'hidden' }}>{pTitle(p)}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: INK }}>{pPrice(p)}</span>
          {old && <span style={{ fontSize: 12, color: FAINT, textDecoration: 'line-through' }}>{old}</span>}
        </div>
        {p.moq && (
          <div style={{ fontSize: 12, color: MUTE, marginTop: 3 }}>Min. commande : {p.moq}{p.unit ? ` ${p.unit}` : ''}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 12, color: MUTE }}>
          {pVerified(p) && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#185FA5', fontWeight: 700 }}><BadgeCheck size={14} /> Vérifié</span>
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.years_active ? `${p.years_active} ans · ` : ''}{p.supplier_name || ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={onChat} style={{ flex: 1, padding: '9px', borderRadius: 30, cursor: 'pointer', fontFamily: FONT, border: `1px solid ${LINE}`, background: '#fff', color: INK, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <MessageSquare size={15} /> Discuter maintenant
          </button>
          <button onClick={onRemove} title="Options" style={{ width: 40, borderRadius: 30, cursor: 'pointer', border: `1px solid ${LINE}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTE }}>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ icon, text, cta }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, padding: '48px 22px', textAlign: 'center' }}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: 15, color: MUTE, marginBottom: cta ? 16 : 0 }}>{text}</div>
      {cta && (
        <Link to="/" style={{ display: 'inline-block', padding: '11px 26px', borderRadius: 30, border: `1px solid ${INK}`, color: INK, textDecoration: 'none', fontSize: 13.5, fontWeight: 700 }}>Explorer des produits</Link>
      )}
    </div>
  )
}

function FavSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ aspectRatio: '1 / 1', background: '#F4F5F7' }} />
          <div style={{ padding: 14 }}>
            <div style={{ height: 12, width: '80%', background: '#F4F5F7', borderRadius: 4, marginBottom: 10 }} />
            <div style={{ height: 14, width: '40%', background: '#F4F5F7', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}