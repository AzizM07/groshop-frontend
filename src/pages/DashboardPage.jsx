// pages/DashboardPage.jsx — GROSHOP.tn
// CONTENU du tableau de bord acheteur (page d'accueil de l'espace).
// Rendu dans DashboardLayout via <Outlet /> : plus de topbar/sidebar ici.

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Headphones, Package, Gift } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { orders as ordersApi, store as storeApi, products as productsApi } from '../lib/api'
import Footer from '../components/Footer'

const ORANGE = '#FF4500'
const INK    = '#0F1419'
const MUTE   = '#6B7785'
const FAINT  = '#9AA3AE'
const LINE   = '#E8EAED'
const SOFT   = '#FFF0E8'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

const STATUS_LABELS = {
  pending:        'En attente',
  call_confirmed: 'Confirmée',
  in_production:  'En production',
  shipped:        'Expédiée',
  delivered:      'Livrée',
  cancelled:      'Annulée',
}
const STATUS_COLORS = {
  pending:        { fg: '#92600A', bg: '#FEF3C7' },
  call_confirmed: { fg: '#1E40AF', bg: '#DBEAFE' },
  in_production:  { fg: '#5B21B6', bg: '#EDE9FE' },
  shipped:        { fg: '#155E75', bg: '#CFFAFE' },
  delivered:      { fg: '#166534', bg: '#DCFCE7' },
  cancelled:      { fg: '#991B1B', bg: '#FEE2E2' },
}

const asText = (v) => {
  if (v == null) return ''
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (typeof v === 'object') return v.content || v.text || v.name || v.title || ''
  return ''
}
const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return isNaN(date) ? '' : date.toLocaleDateString('fr-FR')
}

function normalize(d) {
  if (Array.isArray(d)) return d
  return d?.results || d?.orders || []
}

// ═══════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { user } = useAuth()
  const { count: cartCount = 0 } = useCart()

  const [orders, setOrders]       = useState(null)
  const [toReview, setToReview]   = useState(null)
  const [recent, setRecent]       = useState([])
  const [favorites, setFavorites] = useState(null)   // ⭐ favoris (null = chargement)
  const [tab, setTab]             = useState('all')

  useEffect(() => {
    if (!user) return
    let alive = true

    ordersApi.list()
      .then(d => alive && setOrders(normalize(d)))
      .catch(() => alive && setOrders([]))

    ordersApi.toReview()
      .then(d => alive && setToReview(d?.results || []))
      .catch(() => alive && setToReview([]))

    storeApi.recentSearches()
      .then(d => alive && setRecent(d?.searches || []))
      .catch(() => {})

    productsApi.favorites()
      .then(d => alive && setFavorites(d?.products || []))
      .catch(() => alive && setFavorites([]))

    return () => { alive = false }
  }, [user])

  // L'accès est déjà protégé par <RequireAuth> sur la route /dashboard.
  if (!user) return null

  const TABS = [
    { id: 'all',           label: 'Toutes les commandes' },
    { id: 'pending',       label: 'En attente' },
    { id: 'in_production', label: 'En production' },
    { id: 'shipped',       label: 'Expédiées' },
    { id: 'delivered',     label: 'Livrées' },
  ]

  const filtered = (orders || []).filter(o => {
    if (tab === 'all') return true
    if (tab === 'pending') return o.status === 'pending' || o.status === 'call_confirmed'
    return o.status === tab
  })

  return (
    <>
      <div style={{ padding: '16px clamp(16px, 2vw, 32px) 40px', fontFamily: FONT, color: INK }}>
        <div className="gd-grid">

          {/* COLONNE CENTRALE */}
          <div>
            {/* Carte profil */}
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 22px 0' }}>
                <Avatar user={user} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: INK }}>
                      {asText(user.full_name) || asText(user.email)?.split('@')[0]}
                    </span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, color: '#fff', background: ORANGE,
                      padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '.4px',
                    }}>
                      {user.role === 'supplier' ? 'Fournisseur' : 'Acheteur'}
                    </span>
                  </div>
                  <Link to="/dashboard/parametres" style={{
                    fontSize: 13, color: MUTE, textDecoration: 'underline', textUnderlineOffset: 3,
                    display: 'inline-block', marginTop: 4,
                  }}>
                    Profil
                  </Link>
                </div>
                <Link to="/help/acheteurs" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontSize: 13.5, fontWeight: 600, color: INK, textDecoration: 'underline',
                  textUnderlineOffset: 3, flexShrink: 0,
                }}>
                  <Headphones size={18} /> Assistance en ligne
                </Link>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', padding: '22px 22px 20px' }}>
                <Stat value={(toReview || []).length} label="À évaluer" to="/dashboard/commandes?filter=to-review" />
                <StatDivider />
                <Stat value={(orders || []).length} label="Commandes"       to="/dashboard/commandes" />
                <StatDivider />
                <Stat value={cartCount}     label="Articles au panier" to="/panier" />
              </div>

              {/* Bandeau */}
              <div style={{ padding: '0 22px 20px' }}>
                <Link to="/dashboard/parametres" style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#FAFAFA', border: `1px solid ${LINE}`, borderRadius: 10,
                  padding: '14px 16px', textDecoration: 'none',
                }}>
                  <span style={{ fontSize: 13.5, color: INK, flex: 1 }}>
                    Complétez vos informations d'entreprise
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: MUTE }}>
                    Vérifier <ChevronRight size={15} />
                  </span>
                </Link>
              </div>
            </Card>

            {/* Carte commandes */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', padding: '20px 22px 14px' }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: INK }}>Commandes</h2>
                <div style={{ flex: 1 }} />
                <Link to="/dashboard/commandes" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 13.5, fontWeight: 600, color: MUTE, textDecoration: 'none',
                }}>
                  Afficher tout <ChevronRight size={15} />
                </Link>
              </div>

              <div style={{ display: 'flex', gap: 8, padding: '0 22px 16px', flexWrap: 'wrap' }}>
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    padding: '9px 18px', borderRadius: 30, cursor: 'pointer',
                    border: `1px solid ${tab === t.id ? INK : LINE}`,
                    background: '#fff', fontFamily: FONT,
                    fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                    color: tab === t.id ? INK : MUTE, whiteSpace: 'nowrap',
                  }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {orders === null && <Skeleton rows={2} />}

              {orders !== null && filtered.length === 0 && (
                <div style={{ padding: '30px 22px 44px', textAlign: 'center' }}>
                  <div style={{ fontSize: 54, marginBottom: 12 }}>📄</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: INK, marginBottom: 18 }}>
                    Vous n'avez aucune commande pour l'instant
                  </div>
                  <Link to="/" style={{
                    display: 'inline-block', padding: '12px 28px', borderRadius: 30,
                    border: `1px solid ${INK}`, color: INK, textDecoration: 'none',
                    fontSize: 13.5, fontWeight: 700,
                  }}>
                    Commencez à vous approvisionner
                  </Link>
                </div>
              )}

              {orders !== null && filtered.slice(0, 5).map(o => {
                const nSub = o.sub_orders_count || 0
                return (
                  <Link key={o.id} to={`/dashboard/commandes/${o.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 22px', borderTop: `1px solid #F2F3F5`, textDecoration: 'none',
                  }}>
                    <div style={{ width: 52, height: 52, borderRadius: 8, background: '#F4F5F7', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={20} color={FAINT} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>
                        Commande #{String(o.id).slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: 12, color: MUTE, marginTop: 3 }}>
                        {fmtDate(o.created_at)} · {nSub} fournisseur{nSub > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: ORANGE }}>{fmt(o.total_tnd)} TND</div>
                      <span style={{
                        display: 'inline-block', marginTop: 4, fontSize: 10.5, fontWeight: 600,
                        color: STATUS_COLORS[o.status]?.fg || MUTE,
                        background: STATUS_COLORS[o.status]?.bg || '#F4F5F7',
                        padding: '2px 8px', borderRadius: 20,
                      }}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </Card>
          </div>

          {/* ═══ COLONNE DROITE ═══ */}
          <aside className="gd-aside">
            {/* Favoris */}
            <Card style={{ marginBottom: 16, padding: '20px 20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: INK, flex: 1 }}>Favoris</h3>
                {favorites && favorites.length > 0 && (
                  <Link to="/dashboard/favoris" style={{ fontSize: 12.5, color: FAINT, textDecoration: 'none' }}>Afficher tout ›</Link>
                )}
              </div>

              {favorites === null ? (
                <div style={{ fontSize: 13, color: FAINT, padding: '8px 0' }}>Chargement…</div>
              ) : favorites.length === 0 ? (
                <div style={{ background: '#FAFAFA', borderRadius: 10, padding: '30px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📦</div>
                  <div style={{ fontSize: 13.5, color: MUTE, marginBottom: 6 }}>Aucun favori pour l'instant</div>
                  <Link to="/" style={{ fontSize: 13, color: MUTE, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    Explorer des produits
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {favorites.slice(0, 3).map(p => (
                    <Link key={p.id} to={`/produit/${p.id}`} style={{ display: 'flex', gap: 12, alignItems: 'center', textDecoration: 'none' }}>
                      <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', background: '#F4F5F7', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.primary_image
                          ? <img src={p.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Package size={20} color={FAINT} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: INK, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: ORANGE, marginTop: 3 }}>{fmt(p.base_price_tnd)} TND</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Historique de recherches */}
            <Card style={{ marginBottom: 16, padding: '20px 20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: INK, flex: 1 }}>Historique de recherches</h3>
                {recent.length > 0 && (
                  <Link to="/search" style={{ fontSize: 12.5, color: FAINT, textDecoration: 'none' }}>Afficher tout ›</Link>
                )}
              </div>
              {recent.length === 0 ? (
                <div style={{ fontSize: 13, color: FAINT, padding: '8px 0' }}>Aucune recherche récente</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {recent.slice(0, 8).map((s, i) => {
                    const text = asText(s)
                    return (
                      <Link key={i} to={`/search?q=${encodeURIComponent(text)}`} style={{
                        fontSize: 12.5, color: MUTE, background: '#F4F5F7',
                        padding: '7px 14px', borderRadius: 30, textDecoration: 'none',
                      }}>
                        {text}
                      </Link>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Promotion */}
            <Card style={{ padding: '20px 20px 22px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 800, color: INK }}>Promotion</h3>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: SOFT, borderRadius: 10, padding: '16px 18px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#B33000' }}>Parrainer un ami</div>
                  <div style={{ fontSize: 12, color: '#B33000', opacity: .8, marginTop: 3 }}>
                    Gagnez des réductions sur vos commandes
                  </div>
                </div>
                <Gift size={30} color={ORANGE} style={{ flexShrink: 0 }} />
              </div>
            </Card>
          </aside>
        </div>
      </div>

      <Footer />
    </>
  )
}

// ── Sous-composants ─────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${LINE}`, ...style }}>
      {children}
    </div>
  )
}

function Avatar({ user }) {
  const initial = (asText(user.full_name) || asText(user.email) || '?')[0].toUpperCase()
  return (
    <div style={{
      width: 56, height: 56, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
      background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {user.avatar_url
        ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontSize: 22, fontWeight: 800, color: ORANGE }}>{initial}</span>}
    </div>
  )
}

function Stat({ value, label, to }) {
  return (
    <Link to={to} style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: INK, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: MUTE, marginTop: 7 }}>{label}</div>
    </Link>
  )
}

function StatDivider() {
  return <div style={{ width: 1, background: LINE, alignSelf: 'stretch' }} />
}

function Skeleton({ rows = 2 }) {
  return (
    <div style={{ padding: '8px 22px 20px' }}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0' }}>
          <div style={{ width: 52, height: 52, borderRadius: 8, background: '#F4F5F7', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 11, width: '35%', background: '#F4F5F7', borderRadius: 4, marginBottom: 9 }} />
            <div style={{ height: 11, width: '60%', background: '#F4F5F7', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}