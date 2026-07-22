// Import des icônes sociales (depuis src/assets/socials)
import facebookIcon  from '../assets/socials/facebook.png';
import linkedinIcon  from '../assets/socials/linkedin.png';
import twitterIcon   from '../assets/socials/twitter.png';
import instagramIcon from '../assets/socials/instagram.png';
import youtubeIcon   from '../assets/socials/youtube.png';
import tiktokIcon    from '../assets/socials/tiktok.png';

// Badges des stores
import appstoreBadge  from '../assets/socials/applestore.png';
import playstoreBadge from '../assets/socials/playstore.png';

/**
 * Footer GroShop — Composant global
 * Emplacement : src/components/Footer.jsx
 */

const columns = [
  {
    title: "Obtenir de l'aide",
    links: [
      "Centre d'assistance",
      "Discussion en direct",
      "Vérifier le statut de commande",
      "Remboursements",
      "Signaler un abus",
    ],
  },
  {
    title: "Paiements et protections",
    links: [
      "Paiements sûrs et faciles",
      "Politique de remboursement",
      "Livraison à temps",
      "Protections après-vente",
      "Suivi et inspection",
    ],
  },
  {
    title: "Approvisionnement",
    links: [
      "Demande de devis",
      "Adhésion GroShop",
      "Conformité fiscale",
      "Blog GroShop",
    ],
  },
  {
    title: "Vendez sur GroShop",
    links: [
      "Commencer à vendre",
      "Centre des vendeurs",
      "Devenir fournisseur vérifié",
      "Partenariats",
      "App pour fournisseurs",
    ],
  },
  {
    title: "Faites notre connaissance",
    links: [
      "À propos de GroShop",
      "Politiques de RSE",
      "Centre de nouvelles",
      "Nous rejoindre | Carrières",
    ],
  },
];

const socials = [
  { src: facebookIcon,  label: "Facebook"  },
  { src: linkedinIcon,  label: "LinkedIn"  },
  { src: twitterIcon,   label: "Twitter"   },
  { src: instagramIcon, label: "Instagram" },
  { src: youtubeIcon,   label: "YouTube"   },
  { src: tiktokIcon,    label: "TikTok"    },
];

const bottomLinks = [
  "Politique de confidentialité",
  "Conditions d'utilisation",
  "Plan du site",
];

export default function Footer() {
  return (
    <footer className="w-full bg-white font-sans text-gray-700">
      {/* Liseré orange en haut */}
      <div className="h-1 w-full bg-[#ff5e20]" />

      {/* Contenu principal */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap gap-x-8 gap-y-10">
          {/* Bloc marque */}
          <div className="w-full max-w-xs sm:w-auto">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
              GROS<span className="text-[#ff5e20]">HOP</span> TN
            </h2>
            <p className="mt-1 text-sm font-bold text-[#ff5e20]">
              Votre marketplace en Tunisie
            </p>
            <div className="my-4 h-px w-full bg-gray-200" />
            <p className="text-xs leading-relaxed text-gray-500">
              Achetez et vendez en gros partout en Tunisie. Livraison rapide et
              paiement sécurisé.
            </p>

            {/* Réseaux sociaux */}
            <div className="mt-4 flex gap-3">
              {socials.map(({ src, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="transition-transform hover:scale-110"
                >
                  <img
                    src={src}
                    alt={label}
                    style={{ width: 22, height: 22, objectFit: 'contain' }}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Colonnes de liens */}
          {columns.map((col) => (
            <div key={col.title} className="min-w-[140px] flex-1">
              <h3 className="mb-3 text-sm font-bold text-gray-900">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-gray-500 transition-colors hover:text-[#ff5e20]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bandeau applications */}
      <div className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4">
          <span className="text-sm text-gray-600">
            Téléchargez l'application mobile GroShop :{" "}
            <a href="#" className="font-bold text-gray-900 hover:text-[#ff5e20] transition-colors">
              l'application GroShop
            </a>
          </span>

          {/* Badges alignés à droite */}
          <div className="ml-auto flex items-center gap-3">

            {/* Badge App Store */}
            <a href="#" aria-label="Télécharger sur l'App Store" className="transition-opacity hover:opacity-80">
              <img
                src={appstoreBadge}
                alt="App Store"
                style={{ height: 40, width: 'auto', display: 'block' }}
              />
            </a>

            {/* Badge Google Play */}
            <a href="#" aria-label="Disponible sur Google Play" className="transition-opacity hover:opacity-80">
              <img
                src={playstoreBadge}
                alt="Google Play"
                style={{ height: 40, width: 'auto', display: 'block' }}
              />
            </a>

          </div>
        </div>
      </div>

      {/* Barre du bas */}
      <div className="bg-[#1a1a1a]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-3 sm:flex-row sm:items-center">
          <nav className="flex flex-wrap">
            {bottomLinks.map((link, i) => (
              <a
                key={link}
                href="#"
                className={`px-3 text-xs text-gray-400 transition-colors hover:text-white ${
                  i !== bottomLinks.length - 1 ? "border-r border-gray-700" : ""
                } ${i === 0 ? "pl-0" : ""}`}
              >
                {link}
              </a>
            ))}
          </nav>
          <span className="text-xs text-gray-500">
            © 2025 GroShop.tn — Tous droits réservés
          </span>
        </div>
      </div>
    </footer>
  );
}