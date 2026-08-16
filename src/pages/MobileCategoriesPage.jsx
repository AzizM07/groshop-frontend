// src/pages/MobileCategoriesPage.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, Navigate } from 'react-router-dom'
import { products as productsApi } from '../lib/api'
import { useIsMobile } from '../hooks/useIsMobile'
import MobileBottomNav from '../components/MobileBottomNav'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const POUR_VOUS_ID = '__pour_vous__'
const ORANGE = '#FF7A00'

/* ═══════════════════════ Header : barre de recherche ═══════════════════════ */
function SearchHeader({ onSearchClick, onCameraClick, onBellClick, placeholder = 'Rechercher un produit…', badge = 0 }) {
  return (
    <div style={{ flexShrink: 0, padding: '10px 12px', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          onClick={onSearchClick}
          style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: '#fff', border: '1.5px solid #111', borderRadius: 24,
            height: 44, padding: '0 4px 0 14px', cursor: 'pointer',
          }}
        >
          <button
            onClick={e => { e.stopPropagation(); onCameraClick?.() }}
            aria-label="Recherche image"
            style={{ background: 'none', border: 'none', padding: 0, display: 'flex', cursor: 'pointer' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
          <div style={{ width: 1, height: 22, background: '#D0D3D8', margin: '0 10px' }} />
          <span style={{ flex: 1, fontSize: 14, color: '#111', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {placeholder}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onSearchClick?.() }}
            aria-label="Rechercher"
            style={{
              width: 36, height: 36, borderRadius: '50%', background: '#111', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>

        <button
          onClick={onBellClick}
          aria-label="Notifications"
          style={{ position: 'relative', background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          {badge > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              background: '#FF3B30', color: '#fff', fontSize: 10, fontWeight: 700,
              borderRadius: 10, minWidth: 18, height: 18, padding: '0 4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{badge > 99 ? '99+' : badge}</span>
          )}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════ Bannière promo ═══════════════════════ */
function PromoBanner() {
  return (
    <div style={{
      flexShrink: 0, background: ORANGE, padding: '10px 14px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ background: '#fff', color: ORANGE, fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 3 }}>FREE</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Livraison gratuite dès 200 DT</span>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    </div>
  )
}

/* ═══════════════════════ Onglets Pour vous / Tendances ═══════════════════════ */
function TabsRow({ tab, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
      <button onClick={() => onChange('pour_vous')} style={{
        padding: '8px 22px', cursor: 'pointer', background: '#fff',
        border: tab === 'pour_vous' ? `1.5px solid ${ORANGE}` : '1.5px solid transparent',
        color: tab === 'pour_vous' ? ORANGE : '#3D4853',
        borderRadius: 22, fontSize: 14, fontWeight: tab === 'pour_vous' ? 700 : 500,
      }}>Pour vous</button>
      <button onClick={() => onChange('tendances')} style={{
        padding: '8px 16px', cursor: 'pointer',
        background: tab === 'tendances' ? '#fff' : '#F4F5F7',
        border: tab === 'tendances' ? `1.5px solid ${ORANGE}` : '1.5px solid transparent',
        color: tab === 'tendances' ? ORANGE : '#3D4853',
        borderRadius: 22, fontSize: 14, fontWeight: tab === 'tendances' ? 700 : 500,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        </svg>
        Tendances
      </button>
    </div>
  )
}

/* ═══════════════════════ Item sous-catégorie (photo sans fond) ═══════════════════════ */
function SubCategoryTile({ sub, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'center', minWidth: 0,
    }}>
      <div style={{
        width: 78, height: 78, margin: '0 auto 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {sub.image_url ? (
          <img src={sub.image_url} alt={sub.name} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={e => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <span style={{ fontSize: 32 }}>{sub.emoji || (sub.name && sub.name[0])}</span>
        )}
      </div>
      <div style={{
        fontSize: 13, color: '#1F2937', lineHeight: 1.25,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        padding: '0 2px',
      }}>
        {sub.name}
      </div>
    </button>
  )
}

/* ═══════════════════════ Carte produit (style e-commerce) ═══════════════════════ */
function ProductCard({ product, onClick }) {
  const p = product
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
    }}>
      <div style={{
        width: '100%', aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
        background: '#F4F5F7', position: 'relative',
      }}>
        {p.primary_image
          ? <img src={p.primary_image} alt={p.name} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>📦</div>}
        {p.certified && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: '#2E7CF6', color: '#fff',
            fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '3px 0',
          }}>Certifié Original</div>
        )}
      </div>

      <div style={{ padding: '6px 2px 0' }}>
        {(p.badges?.length > 0 || p.is_promo || p.is_brand_plus) && (
          <div style={{ display: 'flex', gap: 3, marginBottom: 3, flexWrap: 'wrap' }}>
            {p.is_brand_plus && (
              <span style={{ background: '#2E7CF6', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 2 }}>Marque+</span>
            )}
            {p.is_promo && (
              <span style={{ background: '#FF3B30', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 2 }}>Promo</span>
            )}
            {p.badges?.map((b, i) => (
              <span key={i} style={{ background: '#F4F5F7', color: '#3D4853', fontSize: 9, fontWeight: 600, padding: '1px 4px', borderRadius: 2 }}>{b}</span>
            ))}
          </div>
        )}

        <div style={{
          fontSize: 12, color: '#0F1419', lineHeight: 1.25, fontWeight: 500,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {p.name}
        </div>

        {(p.sold_count != null || p.rating != null) && (
          <div style={{ fontSize: 10.5, color: '#6B7785', marginTop: 3, display: 'flex', alignItems: 'center' }}>
            {p.sold_count != null && <span>{p.sold_count}+ vendus</span>}
            {p.sold_count != null && p.rating != null && <span style={{ color: '#DDD', margin: '0 4px' }}>|</span>}
            {p.rating != null && (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 2 }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span>{Number(p.rating).toFixed(1)}</span>
              </>
            )}
          </div>
        )}

        {p.price != null && (
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0F1419', marginTop: 3 }}>
            TND {Number(p.price).toFixed(2).replace('.', ',')}
          </div>
        )}

        {p.upcoming_price && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            background: '#FFF3D6', padding: '2px 5px', borderRadius: 3, marginTop: 3,
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#B25E00">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <span style={{ fontSize: 10, color: '#B25E00', fontWeight: 600 }}>Prix à venir</span>
          </div>
        )}
      </div>
    </button>
  )
}

/* ═══════════════════════ Pilule flottante bottom nav ═══════════════════════ */
function FloatingPill({ label = ['Livraison', 'gratuite'], onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'fixed', bottom: 42, left: '50%', transform: 'translateX(-50%)',
      background: ORANGE, color: '#fff', border: 'none', cursor: 'pointer',
      borderRadius: 20, padding: '8px 14px',
      fontSize: 11, fontWeight: 700, lineHeight: 1.1,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      boxShadow: '0 2px 10px rgba(255,122,0,.4)',
      zIndex: 100,
    }}>
      {Array.isArray(label) ? label.map((l, i) => <span key={i}>{l}</span>) : <span>{label}</span>}
    </button>
  )
}

/* ═══════════════════════════════════ PAGE ═══════════════════════════════════ */
export default function MobileCategoriesPage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState(POUR_VOUS_ID)
  const [rightTab, setRightTab] = useState('pour_vous')

  const { data: cats = [], isLoading: loading } = useQuery({
    queryKey: ['products', 'categories'],
    queryFn: () => productsApi.categories(),
  })

  const { data: recoData } = useQuery({
    queryKey: ['products', 'recommended'],
    queryFn: () => productsApi.recommended(),
  })
  const inspo = recoData ? (recoData.results || []).slice(0, 6) : []

  if (!isMobile) return <Navigate to="/" replace />

  const allSubs   = cats.flatMap(c => (c.children || []).map(s => ({ ...s, parent: c.name })))
  const activeCat = activeId === POUR_VOUS_ID ? null : cats.find(c => String(c.id) === String(activeId))
  const rightSubs = activeId === POUR_VOUS_ID ? allSubs.slice(0, 30) : (activeCat?.children || [])
  const showTabs   = activeId === POUR_VOUS_ID
  const showInspo  = activeId === POUR_VOUS_ID && inspo.length > 0
  const rightTitle = activeId === POUR_VOUS_ID ? null : (activeCat?.name || '')

  const leftItems = [{ id: POUR_VOUS_ID, name: 'Pour vous' }, ...cats]

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff', fontFamily: FONT, position: 'relative' }}>

      <SearchHeader
        onSearchClick={() => navigate('/search')}
        onCameraClick={() => navigate('/search?mode=image')}
        onBellClick={() => navigate('/notifications')}
        badge={99}
      />

      <PromoBanner />

      {/* Corps : sidebar + panneau droit */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>

        {/* ══════ Sidebar ══════ */}
        <div style={{ width: 90, flexShrink: 0, overflowY: 'auto', height: '100%', background: '#F5F5F5', paddingBottom: 90 }}>
          {loading
            ? [...Array(10)].map((_, i) => <div key={i} style={{ height: 40, margin: '8px 10px', background: '#ECEEF1', borderRadius: 4 }} />)
            : leftItems.map(cat => {
                const on = activeId === cat.id
                return (
                  <button key={cat.id} onClick={() => setActiveId(cat.id)}
                    style={{
                      position: 'relative',
                      display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
                      padding: '16px 8px 16px 12px', border: 'none', background: 'transparent',
                      fontSize: on ? 14 : 13.5, lineHeight: 1.25,
                      fontWeight: on ? 700 : 400,
                      color: on ? ORANGE : '#3D4853',
                    }}>
                    {on && (
                      <span style={{
                        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                        width: 3, height: 20, background: ORANGE, borderRadius: '0 2px 2px 0',
                      }} />
                    )}
                    {cat.name}
                  </button>
                )
              })
          }
        </div>

        {/* ══════ Panneau droit ══════ */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', height: '100%', padding: '14px 12px 100px', background: '#fff' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', rowGap: 26, columnGap: 6 }}>
              {[...Array(9)].map((_, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: 78, height: 78, background: '#F2F3F5', borderRadius: 6, margin: '0 auto 8px' }} />
                  <div style={{ height: 10, background: '#F2F3F5', borderRadius: 4, width: '70%', margin: '0 auto' }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {showTabs && <TabsRow tab={rightTab} onChange={setRightTab} />}

              {rightTitle && (
                <div style={{ fontSize: 17, fontWeight: 800, color: '#0F1419', marginBottom: 16 }}>
                  {rightTitle}
                </div>
              )}

              {rightSubs.length === 0 ? (
                <div style={{ color: '#9AA3AE', fontSize: 13 }}>Aucune sous-catégorie</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', rowGap: 26, columnGap: 6, paddingTop: showTabs ? 14 : 4 }}>
                  {rightSubs.map((sub, i) => (
                    <SubCategoryTile key={`${sub.id}-${i}`} sub={sub}
                      onClick={() => navigate(`/search?cat=${sub.id}`)} />
                  ))}
                </div>
              )}

              {/* Vraies cartes produits (comme AliExpress en bas de la grille) */}
              {showInspo && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 22 }}>
                  {inspo.map(p => (
                    <ProductCard key={p.id} product={p}
                      onClick={() => navigate(`/produit/${p.id}`)} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Pilule flottante + nav */}
      <FloatingPill label={['Livraison', 'gratuite']} onClick={() => navigate('/livraison')} />
      <MobileBottomNav />
    </div>
  )
}