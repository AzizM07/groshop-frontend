// src/pages/MobileCategoriesPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { products as productsApi } from '../lib/api'
import { useIsMobile } from '../hooks/useIsMobile'
import MobileBottomNav from '../components/MobileBottomNav'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const POUR_VOUS_ID = '__pour_vous__'
let _cache = null  // categories + children, mis en cache (le fetch est lent)

export default function MobileCategoriesPage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [cats, setCats]       = useState(_cache || [])
  const [loading, setLoading] = useState(!_cache)
  const [activeId, setActiveId] = useState(POUR_VOUS_ID)

  useEffect(() => {
    if (_cache) return
    productsApi.categories()
      .then(d => { _cache = d || []; setCats(_cache); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (!isMobile) return <Navigate to="/" replace />

  const allSubs   = cats.flatMap(c => (c.children || []).map(s => ({ ...s, parent: c.name })))
  const activeCat = activeId === POUR_VOUS_ID ? null : cats.find(c => String(c.id) === String(activeId))
  const rightSubs = activeId === POUR_VOUS_ID ? allSubs.slice(0, 30) : (activeCat?.children || [])
  const rightTitle = activeId === POUR_VOUS_ID ? 'Recommandations' : (activeCat?.name || '')

  const leftItems = [{ id: POUR_VOUS_ID, name: 'Pour vous' }, ...cats]

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff', fontFamily: FONT }}>

      {/* ── Barre du haut ── */}
      <div style={{ flexShrink: 0, height: 53, display: 'flex', alignItems: 'center', padding: '0 14px', borderBottom: '1px solid #F0F0F0' }}>
        <button onClick={() => navigate(-1)} aria-label="Retour"
          style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', color: '#0F1419' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 19, fontWeight: 800, color: '#0F1419' }}>Catégories</span>
        <span style={{ width: 32 }} />
      </div>

      {/* ── Corps : sidebar + panneau droit ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>

        {/* Sidebar catégories */}
        <div style={{ width: 128, flexShrink: 0, overflowY: 'auto', height: '100%', background: '#F7F8FA', paddingBottom: 70 }}>
          {loading
            ? [...Array(10)].map((_, i) => <div key={i} style={{ height: 52, margin: '6px 10px', background: '#ECEEF1', borderRadius: 6 }} />)
            : leftItems.map(cat => {
                const on = activeId === cat.id
                return (
                  <button key={cat.id} onClick={() => setActiveId(cat.id)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
                      padding: '15px 12px', border: 'none',
                      background: on ? '#fff' : 'transparent',
                      borderLeft: on ? '4px solid #FF4500' : '4px solid transparent',
                      fontSize: 13.5, lineHeight: 1.3,
                      fontWeight: on ? 800 : 500,
                      color: on ? '#0F1419' : '#6B7785',
                    }}>
                    {cat.name}
                  </button>
                )
              })
          }
        </div>

        {/* Panneau droit : sous-catégories en rond */}
        <div style={{ flex: 1, overflowY: 'auto', height: '100%', padding: '18px 14px', paddingBottom: 70 }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '22px 10px' }}>
              {[...Array(9)].map((_, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: 78, height: 78, borderRadius: '50%', background: '#F2F3F5', margin: '0 auto 8px' }} />
                  <div style={{ height: 9, background: '#F2F3F5', borderRadius: 4, width: '70%', margin: '0 auto' }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0F1419', marginBottom: 18 }}>{rightTitle}</div>
              {rightSubs.length === 0 ? (
                <div style={{ color: '#9AA3AE', fontSize: 13 }}>Aucune sous-catégorie</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '22px 8px' }}>
                  {rightSubs.map((sub, i) => (
                    <button key={`${sub.id}-${i}`} onClick={() => navigate(`/search?cat=${sub.id}`)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ width: 82, height: 82, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 8px', background: '#F2F3F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {sub.image_url ? (
                          <img src={sub.image_url} alt={sub.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                        ) : (
                          <span style={{ fontSize: 30 }}>{sub.emoji || (sub.name && sub.name[0])}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#1F2937', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', padding: '0 2px' }}>
                        {sub.name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  )
}