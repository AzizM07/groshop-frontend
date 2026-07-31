// src/components/SearchCategoryBannerDesktop.jsx
// Bannière de catégorie — version desktop (1/4 de l'écran : 25vh)

export default function SearchCategoryBannerDesktop({ banner, onClick }) {
  if (!banner?.image_url) return null
  const clickable = !!banner.link
  return (
    <div
      onClick={clickable ? onClick : undefined}
      style={{
        width: '100%',
        height: '25vh',          // un quart de la hauteur de page
        minHeight: 170,          // garde-fou sur très petits écrans
        maxHeight: 340,          // évite un bandeau géant sur grands écrans
        marginBottom: 18,
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid #EEF0F2',
        cursor: clickable ? 'pointer' : 'default',
      }}
    >
      <img
        src={banner.image_url}
        alt=""
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',        // remplit le bandeau, recadre si besoin
          objectPosition: 'center',  // ← ajuste ('top'/'left'…) si un bord doit rester visible
          display: 'block',
        }}
      />
    </div>
  )
}