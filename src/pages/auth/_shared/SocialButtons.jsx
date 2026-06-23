import { GoogleIcon, FacebookIcon, LinkedInIcon } from './SocialIcons'

export default function SocialButtons({ onSelect, height = 46 }) {
  const buttons = [
    { name: 'Google',   Icon: GoogleIcon,   title: 'Continuer avec Google' },
    { name: 'Facebook', Icon: FacebookIcon, title: 'Continuer avec Facebook' },
    { name: 'LinkedIn', Icon: LinkedInIcon, title: 'Continuer avec LinkedIn' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {buttons.map(({ name, Icon, title }) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className="social-card"
          style={{
            height, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f3f4f6', border: '1px solid #f3f4f6',
            borderRadius: 9,
          }}
          title={title}>
          <Icon size={22} />
        </button>
      ))}
    </div>
  )
}