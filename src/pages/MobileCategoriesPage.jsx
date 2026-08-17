// src/pages/MobileCategoriesPage.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, Navigate } from 'react-router-dom'
import { products as productsApi } from '../lib/api'
import { useIsMobile } from '../hooks/useIsMobile'
import MobileBottomNav from '../components/MobileBottomNav'
import ProductCard from '../components/ProductCard'

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

  // ── Produits : "Pour vous" = recommandés, sinon liste filtrée par catégorie ──
  const { data: prodData } = useQuery({
    queryKey: ['products', 'catalog-mobile', activeId],
    queryFn: () => activeId === POUR_VOUS_ID
      ? productsApi.recommended()
      : productsApi.list({ category_id: activeId, page_size: 20 }),
    keepPreviousData: true,
  })
  const productsList = (prodData?.results || prodData || []).slice(0, 12)

  if (!isMobile) return <Navigate to="/" replace />

  const allSubs   = cats.flatMap(c => (c.children || []).map(s => ({ ...s, parent: c.name })))
  const activeCat = activeId === POUR_VOUS_ID ? null : cats.find(c => String(c.id) === String(activeId))
  const rightSubs = activeId === POUR_VOUS_ID ? allSubs.slice(0, 30) : (activeCat?.children || [])
  const showTabs   = activeId === POUR_VOUS_ID
  const rightTitle = activeId === POUR_VOUS_ID ? null : (activeCat?.name || '')

  const leftItems = [{ id: POUR_VOUS_ID, name: 'Pour vous' }, ...cats]

  const productsSectionTitle = activeId === POUR_VOUS_ID
    ? "Trouvez de l'inspiration"
    : `Produits populaires${activeCat?.name ? ` — ${activeCat.name}` : ''}`

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

        {/* Panneau droit */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', height: '100%', padding: '12px 10px', paddingBottom: 70 }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px 4px' }}>
              {[...Array(9)].map((_, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: 76, aspectRatio: '1', borderRadius: 8, background: '#F2F3F5', margin: '0 auto 6px' }} />
                  <div style={{ height: 9, background: '#F2F3F5', borderRadius: 4, width: '70%', margin: '0 auto' }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Onglets Pour vous / Tendances (seulement sur "Pour vous") */}
              {showTabs && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <button onClick={() => setRightTab('pour_vous')} style={{
                    padding: '7px 18px', cursor: 'pointer',
                    background: '#fff',
                    border: rightTab === 'pour_vous' ? `1.5px solid ${ORANGE}` : '1.5px solid transparent',
                    color: rightTab === 'pour_vous' ? ORANGE : '#3D4853',
                    borderRadius: 20, fontSize: 13, fontWeight: rightTab === 'pour_vous' ? 700 : 500,
                  }}>Pour vous</button>
                  <button onClick={() => setRightTab('tendances')} style={{
                    padding: '7px 16px', cursor: 'pointer',
                    background: rightTab === 'tendances' ? '#fff' : '#F4F5F7',
                    border: rightTab === 'tendances' ? `1.5px solid ${ORANGE}` : '1.5px solid transparent',
                    color: rightTab === 'tendances' ? ORANGE : '#3D4853',
                    borderRadius: 20, fontSize: 13, fontWeight: rightTab === 'tendances' ? 700 : 500,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                    </svg>
                    Tendances
                  </button>
                </div>
              )}

              {/* Titre catégorie (uniquement quand une vraie catégorie est sélectionnée) */}
              {rightTitle && (
                <div style={{ fontSize: 17, fontWeight: 800, color: '#0F1419', marginBottom: 16 }}>{rightTitle}</div>
              )}

              {/* Grille sous-catégories */}
              {rightSubs.length === 0 ? (
                <div style={{ color: '#9AA3AE', fontSize: 13 }}>Aucune sous-catégorie</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px 4px' }}>
                  {rightSubs.map((sub, i) => (
                    <button key={`${sub.id}-${i}`} onClick={() => navigate(`/search?cat=${sub.id}`)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'center', minWidth: 0 }}>
                      <div style={{
                        width: '100%', aspectRatio: '1', maxWidth: 76,
                        borderRadius: 8, overflow: 'hidden',
                        margin: '0 auto 6px', background: '#F4F5F7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {sub.image_url ? (
                          <img src={sub.image_url} alt={sub.name} loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.currentTarget.style.display = 'none' }} />
                        ) : (
                          <span style={{ fontSize: 26 }}>{sub.emoji || (sub.name && sub.name[0])}</span>
                        )}
                      </div>
                      <div style={{
                        fontSize: 11, color: '#1F2937', lineHeight: 1.2,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        padding: '0 2px',
                      }}>
                        {sub.name}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* ── Produits (dans TOUTES les catégories) ── */}
              {productsList.length > 0 && (
                <>
                  <div style={{ height: 1, background: '#F0F0F0', margin: '20px 0 16px' }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1419', marginBottom: 12, lineHeight: 1.25 }}>
                    {productsSectionTitle}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {productsList.map(p => (
                      <ProductCard
                        key={p.id}
                        variant="aliexpress"
                        product={p}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <MobileBottomNav />
    </div>
  )
}