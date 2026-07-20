// src/components/MobileAccount.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Settings, ChevronRight, Wallet, Package, Truck, Star, CheckCircle,
  Heart, ClipboardList, MessageSquare, Headphones, Store, Gift,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { orders as ordersApi, products as productsApi } from '../lib/api'

const ORANGE='#FF4500', INK='#0F1419', MUTE='#6B7785', FAINT='#9AA3AE', LINE='#E8EAED', SOFT='#FFF0E8', BG='#F4F5F7'
const FONT='-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const NAV_H='calc(56px + env(safe-area-inset-bottom))'
const asText=(v)=> v==null?'':(typeof v==='object'?(v.content||v.name||v.email||''):String(v))
const fmt=(n)=>(Number(n)||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})
const normalize=(d)=>Array.isArray(d)?d:(d?.results||d?.orders||[])

export default function MobileAccount() {
  const { user } = useAuth()
  const { count: cartCount = 0 } = useCart()
  const [orders, setOrders] = useState([])
  const [toReview, setToReview] = useState([])
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    if (!user) return
    let alive = true
    ordersApi.list().then(d => alive && setOrders(normalize(d))).catch(() => {})
    ordersApi.toReview().then(d => alive && setToReview(d?.results || [])).catch(() => {})
    productsApi.favorites().then(d => alive && setFavorites(d?.products || [])).catch(() => {})
    return () => { alive = false }
  }, [user])

  if (!user) return null

  const countBy = (fn) => orders.filter(fn).length
  const statuses = [
    { label: 'En attente',  icon: Wallet,      to: '/dashboard/commandes?filter=pending',       n: countBy(o => o.status === 'pending' || o.status === 'call_confirmed') },
    { label: 'En production',icon: Package,    to: '/dashboard/commandes?filter=in_production',  n: countBy(o => o.status === 'in_production') },
    { label: 'Expédiées',   icon: Truck,       to: '/dashboard/commandes?filter=shipped',        n: countBy(o => o.status === 'shipped') },
    { label: 'À évaluer',   icon: Star,        to: '/dashboard/commandes?filter=to-review',      n: toReview.length },
    { label: 'Livrées',     icon: CheckCircle, to: '/dashboard/commandes?filter=delivered',      n: countBy(o => o.status === 'delivered') },
  ]
  const shortcuts = [
    { label: 'Favoris',    icon: Heart,          to: '/dashboard/favoris' },
    { label: 'Commandes',  icon: ClipboardList,  to: '/dashboard/commandes' },
    { label: 'Messages',   icon: MessageSquare,  to: '/dashboard/messages' },
    { label: 'Assistance', icon: Headphones,     to: '/help/acheteurs' },
    { label: 'Vendre',     icon: Store,          to: '/vendre' },
    { label: 'Paramètres', icon: Settings,       to: '/dashboard/parametres' },
  ]
  const initial = (asText(user.full_name) || asText(user.email) || '?')[0].toUpperCase()

  return (
    <div style={{ fontFamily: FONT, color: INK, background: BG, minHeight: `calc(100dvh - ${NAV_H})`, paddingBottom: NAV_H }}>

      {/* En-tête profil */}
      <div style={{ background: '#fff', padding: '16px 16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 58, height: 58, borderRadius: '50%', overflow: 'hidden', background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24, fontWeight: 800, color: ORANGE }}>{initial}</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asText(user.full_name) || asText(user.email)?.split('@')[0]}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: ORANGE, padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', flexShrink: 0 }}>{user.role === 'supplier' ? 'Fournisseur' : 'Acheteur'}</span>
          </div>
          <Link to="/dashboard/parametres" style={{ fontSize: 13, color: MUTE, textDecoration: 'underline', textUnderlineOffset: 3 }}>Profil</Link>
        </div>
        <Link to="/dashboard/parametres" style={{ color: INK, display: 'flex', flexShrink: 0 }}><Settings size={22} strokeWidth={1.7} /></Link>
      </div>

      {/* Mes commandes */}
      <div style={{ background: '#fff', marginTop: 10, padding: '16px 8px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px 14px' }}>
          <span style={{ fontSize: 16, fontWeight: 800, flex: 1 }}>Mes commandes</span>
          <Link to="/dashboard/commandes" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 13, color: MUTE, textDecoration: 'none' }}>Voir tout <ChevronRight size={15} /></Link>
        </div>
        <div style={{ display: 'flex' }}>
          {statuses.map(s => {
            const Icon = s.icon
            return (
              <Link key={s.label} to={s.to} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, textDecoration: 'none', color: INK, position: 'relative' }}>
                <span style={{ position: 'relative' }}>
                  <Icon size={25} strokeWidth={1.6} color="#3D4853" />
                  {s.n > 0 && <span style={{ position: 'absolute', top: -6, right: -8, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8, background: ORANGE, color: '#fff', fontSize: 9.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.n > 99 ? '99+' : s.n}</span>}
                </span>
                <span style={{ fontSize: 11, color: '#3D4853', textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Raccourcis */}
      <div style={{ background: '#fff', marginTop: 10, padding: '18px 8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 0' }}>
        {shortcuts.map(s => {
          const Icon = s.icon
          return (
            <Link key={s.label} to={s.to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none', color: INK }}>
              <Icon size={24} strokeWidth={1.6} color="#3D4853" />
              <span style={{ fontSize: 11.5, color: '#3D4853', textAlign: 'center' }}>{s.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Favoris (aperçu) */}
      {favorites.length > 0 && (
        <div style={{ background: '#fff', marginTop: 10, padding: '16px 16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 16, fontWeight: 800, flex: 1 }}>Favoris</span>
            <Link to="/dashboard/favoris" style={{ fontSize: 13, color: MUTE, textDecoration: 'none' }}>Voir tout ›</Link>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {favorites.slice(0, 6).map(p => (
              <Link key={p.id} to={`/produit/${p.id}`} style={{ flex: '0 0 92px', textDecoration: 'none' }}>
                <div style={{ width: 92, height: 92, borderRadius: 10, overflow: 'hidden', background: '#F4F5F7' }}>
                  {p.primary_image ? <img src={p.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={22} color={FAINT} /></div>}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: ORANGE, marginTop: 5 }}>{fmt(p.base_price_tnd)} TND</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Promo parrainage */}
      <div style={{ background: '#fff', marginTop: 10, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: SOFT, borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#B33000' }}>Parrainer un ami</div>
            <div style={{ fontSize: 12, color: '#B33000', opacity: .8, marginTop: 3 }}>Gagnez des réductions sur vos commandes</div>
          </div>
          <Gift size={30} color={ORANGE} style={{ flexShrink: 0 }} />
        </div>
      </div>
    </div>
  )
}