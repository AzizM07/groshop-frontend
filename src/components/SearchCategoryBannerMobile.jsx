export default function SearchCategoryBannerMobile({ banner, onClick }) {
  if (!banner?.image_url) return null
  const clickable = !!banner.link
  return (
    <div
      onClick={clickable ? onClick : undefined}
      style={{
        width: '100%',
        aspectRatio: '3 / 1',
        minHeight: 90,
        maxHeight: 140,
        marginBottom: 0,              // ⭐ 14 → 0
        borderTopLeftRadius: 10,      // ⭐ arrondi seulement en haut
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 0,    // ⭐ coins bas carrés
        borderBottomRightRadius: 0,
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