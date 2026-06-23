// SuperOffres.jsx — GROSHOP.tn
// Zone unique "Super Offres" — produits les plus vendus + remises

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function OffreCard({ product, accentColor = '#FF4500' }) {
  const [hov, setHov] = useState(false)
  const { name, price, was, discount, soldCount, image } = product

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${hov ? accentColor : '#F0F0F0'}`,
        cursor: 'pointer',
        transition: 'all 0.18s',
        boxShadow: hov ? '0 6px 20px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
        transform: hov ? 'translateY(-3px)' : 'none',
        flexShrink: 0,
        width: 'clamp(150px, 14vw, 190px)',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '1/1', background: '#F8F8F8', overflow: 'hidden' }}>
        <img
          src={image}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', transform: hov ? 'scale(1.06)' : 'scale(1)' }}
          onError={e => { e.target.src = 'https://placehold.co/300x300/F4F5F7/9AA3AE?text=IMG' }}
        />
        {discount && (
          <div style={{
            position: 'absolute', top: '8px', left: '8px',
            background: accentColor, color: '#fff',
            fontSize: '11px', fontWeight: 800,
            padding: '3px 8px', borderRadius: '6px',
          }}>
            -{discount}%
          </div>
        )}
      </div>

      {/* Infos */}
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: '12.5px', color: '#0F1419', lineHeight: 1.35, marginBottom: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '34px' }}>
          {name}
        </div>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F1419', lineHeight: 1 }}>
          TND{Number(price).toFixed(2)}
        </div>
        {was && (
          <div style={{ fontSize: '11px', color: '#9AA3AE', textDecoration: 'line-through', marginTop: '2px' }}>
            TND{Number(was).toFixed(2)}
          </div>
        )}
        {soldCount > 0 && (
          <div style={{ fontSize: '11px', color: '#9AA3AE', marginTop: '4px' }}>
            {soldCount >= 1000 ? (soldCount / 1000).toFixed(1) + 'k' : soldCount} vendus
          </div>
        )}
      </div>
    </div>
  )
}

export default function SuperOffres() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, price, old_price, discount, sold_count, image_url')
      .order('sold_count', { ascending: false })
      .limit(12)
      .then(({ data }) => {
        setProducts(data || [])
        setLoading(false)
      })
  }, [])

  const mapProduct = p => ({
    id: p.id, name: p.name, price: p.price,
    was: p.old_price, discount: p.discount,
    soldCount: p.sold_count, image: p.image_url,
  })

  const FALLBACK = [
    { id: 1, name: "Huile d'olive 5L · palette x80",  price: 24.50, was: 38.00, discount: 35, soldCount: 1200, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80' },
    { id: 2, name: 'T-shirt coton 180g · carton x50',  price: 4.20,  was: 7.50,  discount: 44, soldCount: 4800, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80' },
    { id: 3, name: 'Masque chirurgical · boîte x50',   price: 5.90,  was: 8.00,  discount: 26, soldCount: 2100, image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=300&q=80' },
    { id: 4, name: 'Café arabica 1kg · carton x12',    price: 18.90, was: 26.00, discount: 27, soldCount: 935,  image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&q=80' },
    { id: 5, name: 'Détergent multi-surfaces 5L',      price: 6.80,  was: 11.00, discount: 38, soldCount: 3200, image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300&q=80' },
    { id: 6, name: 'Câble USB-C tressé 2m · x100',    price: 3.20,  was: 5.50,  discount: 42, soldCount: 4200, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&q=80' },
    { id: 7, name: 'Savon liquide mains 5L · x40',    price: 9.80,  was: 14.50, discount: 32, soldCount: 760,  image: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=300&q=80' },
    { id: 8, name: 'Couches bébé taille 3 · x6',      price: 42.00, was: 60.00, discount: 30, soldCount: 1348, image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&q=80' },
  ]

  const items = loading ? [] : (products.length > 0 ? products.map(mapProduct) : FALLBACK)

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      marginTop: '24px',
    }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #FF4500 0%, #FF6B35 50%, #FF9A3C 100%)',
        padding: '20px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
          }}>🔥</div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>
              Super Offres
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', marginTop: '2px' }}>
              Les produits les plus commandés en gros
            </div>
          </div>
        </div>
        <a href="/offres" style={{
          background: '#fff', color: '#FF4500',
          textDecoration: 'none', fontSize: '13px', fontWeight: 700,
          padding: '8px 20px', borderRadius: '8px',
          transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          Voir tout →
        </a>
      </div>

      {/* Produits scroll horizontal */}
      <div style={{ padding: '20px 24px 24px' }}>
        {loading ? (
          <div style={{ display: 'flex', gap: '14px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                flexShrink: 0, width: '170px', borderRadius: '12px',
                background: '#F4F5F7', aspectRatio: '0.8',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex', gap: '14px',
            overflowX: 'auto', paddingBottom: '6px',
            scrollbarWidth: 'thin', scrollbarColor: '#E8EAED #fff',
          }}>
            {items.map((p, i) => (
              <OffreCard key={p.id || i} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}