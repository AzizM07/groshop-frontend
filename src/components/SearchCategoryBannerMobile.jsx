// src/components/SearchCategoryBannerMobile.jsx
// Bannière de catégorie — version mobile (1/4 de l'écran : 25vh)

export default function SearchCategoryBannerMobile({ banner, onClick }) {
  if (!banner?.image_url) return null
  const clickable = !!banner.link
  return (
    <div
      onClick={clickable ? onClick : undefined}
      style={{
        width: '100%',
        height: '25vh',        // un quart de la hauteur de l'écran mobile
        minHeight: 120,
        marginBottom: 14,
        borderRadius: 10,
        overflow: 'hidden',
        cursor: clickable ? 'pointer' : 'default',
      }}
    >
      <img
        src={banner.image_url}
        alt=""
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
        }}
      />
    </div>
  )
}