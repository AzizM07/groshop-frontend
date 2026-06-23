import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import SupplierBanner   from '../components/supplier/SupplierBanner';
import SectionTitle     from '../components/supplier/SectionTitle';
import SupplierStats    from '../components/supplier/SupplierStats';
import SupplierProducts from '../components/supplier/SupplierProducts';
import SupplierAbout    from '../components/supplier/SupplierAbout';
import SupplierReviews  from '../components/supplier/SupplierReviews';
import Footer           from '../components/Footer';

// import { supabase } from '../lib/supabaseClient';

/**
 * Page publique du profil fournisseur — Single Page Scroll
 * URL : /fournisseur/:slug
 *
 * Sections : Accueil / Produits / Profil de l'entreprise / Avis
 */
export default function SupplierProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const [supplier, setSupplier] = useState(null);
  const [store, setStore]       = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews]   = useState([]);

  /* ── Fetch data ── */
  useEffect(() => {
    async function loadSupplier() {
      try {
        setLoading(true);
        setError(null);

        // ─── MOCK DATA ───
        await new Promise((r) => setTimeout(r, 200));

        setSupplier({
          company_name: 'Sfax Textile Co.',
          slug: slug,
          city: 'Sfax',
          wilaya: 'Sfax',
          verification_status: 'verified',
          rating_avg: 4.6,
          rating_count: 128,
          followers_count: 1240,
          created_at: '2012-03-15',
        });

        setStore({
          brand_logo_url: 'https://www.livinx.com/img/livinx-logo-1738657124.jpg',
          banner_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1600&q=80',
          about_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
          about_images: [
            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=80',
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&q=80',
            'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
          ],
          description: "Sfax Textile Co. est un fournisseur grossiste spécialisé dans la fabrication et distribution de textiles de qualité supérieure depuis 2012. Notre usine basée à Sfax dispose d'une capacité de production de 50 000 pièces/mois, garantissant des délais compétitifs et une traçabilité complète de nos produits. Nous accompagnons les professionnels en Tunisie et au Maghreb avec un service personnalisé.",
          mission: "Offrir aux professionnels tunisiens et maghrébins un textile de qualité industrielle, à prix juste, avec un service humain et une traçabilité totale.",
          founded_year: 2012,
          certifications: ['ISO 9001:2015', 'OEKO-TEX', 'INNORPI'],
          page_views: 142000,
          response_rate: 94,
          response_time_hrs: 2,
        });

        // ⭐ Produits (12 mais l'aperçu n'en affiche que 6)
        setProducts([
          { id: 1,  name: 'T-shirt coton premium',           subtitle: 'Lot de 12 unités',   price: 84,  currency: 'TND', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
          { id: 2,  name: 'Chemise Oxford homme',            subtitle: 'Lot de 6 unités',    price: 138, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80' },
          { id: 3,  name: 'Polo piqué bicolore',             subtitle: 'Lot de 12 unités',   price: 108, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80' },
          { id: 4,  name: 'Jean slim stretch',               subtitle: 'Lot de 6 unités',    price: 192, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' },
          { id: 5,  name: 'Hoodie zip intérieur molleton',   subtitle: 'Lot de 6 unités',    price: 174, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80' },
          { id: 6,  name: 'Veste légère coupe-vent',         subtitle: 'Lot de 4 unités',    price: 236, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80' },
          { id: 7,  name: 'Tissu jersey premium',            subtitle: 'Rouleau 50 mètres',  price: 145, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
          { id: 8,  name: 'Tissu coton sergé',               subtitle: 'Rouleau 30 mètres',  price: 118, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80' },
          { id: 9,  name: 'Drap percale 200 fils',           subtitle: 'Lot de 10 unités',   price: 96,  currency: 'TND', image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80' },
          { id: 10, name: 'Serviettes de bain 600g',         subtitle: 'Lot de 20 unités',   price: 74,  currency: 'TND', image_url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80' },
          { id: 11, name: 'Tee-shirt oversize femme',        subtitle: 'Lot de 12 unités',   price: 90,  currency: 'TND', image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80' },
          { id: 12, name: 'Short sportif microfibre',        subtitle: 'Lot de 12 unités',   price: 78,  currency: 'TND', image_url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80' },
        ]);

        setReviews([
          {
            id: 1,
            rating: 5,
            text: "Qualité irréprochable et livraison rapide depuis Sfax. Les lots de t-shirts sont conformes à la description, finitions soignées. Je commande régulièrement et je recommande sans hésiter.",
            author_name: "Karim Ben Salah",
            city: "Tunis",
            avatar_url: "https://i.pravatar.cc/150?img=12",
            attached_images: [
              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80",
              "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&q=80",
              "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=200&q=80",
            ],
          },
          {
            id: 2,
            rating: 4,
            text: "Bons produits, tissu conforme à la description et délai respecté. Je recommande pour les commandes en volume, le service est sérieux et professionnel.",
            author_name: "Sonia Mhiri",
            city: "Sousse",
            avatar_url: "https://i.pravatar.cc/150?img=47",
            attached_images: [
              "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",
            ],
          },
          {
            id: 3,
            rating: 5,
            text: "Fournisseur de confiance avec lequel je travaille depuis 2 ans. Les certifications sont un vrai gage de qualité et la communication est toujours impeccable.",
            author_name: "Nabil Trabelsi",
            city: "Sfax",
            avatar_url: "https://i.pravatar.cc/150?img=33",
            attached_images: [],
          },
          {
            id: 4,
            rating: 5,
            text: "Packaging soigné, produits bien emballés. Le taux de réponse est vraiment bon, très réactif sur la messagerie GROSHOP. Je continuerai à commander.",
            author_name: "Amira Laabidi",
            city: "Bizerte",
            avatar_url: "https://i.pravatar.cc/150?img=48",
            attached_images: [
              "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200&q=80",
              "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=200&q=80",
            ],
          },
          {
            id: 5,
            rating: 4,
            text: "Très bon rapport qualité-prix. Quelques jours de délai en plus que prévu mais le résultat en vaut la peine. Service client réactif et professionnel.",
            author_name: "Mehdi Gharbi",
            city: "Monastir",
            avatar_url: "https://i.pravatar.cc/150?img=15",
            attached_images: [
              "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200&q=80",
            ],
          },
        ]);
      } catch (err) {
        console.error('Erreur chargement fournisseur:', err);
        setError('load_failed');
      } finally {
        setLoading(false);
      }
    }

    loadSupplier();
  }, [slug]);

  /* ── Scroll spy : détecte la section visible et update activeTab ── */
  useEffect(() => {
    if (loading) return;

    const sections = ['home', 'products', 'profile', 'reviews'];
    const observers = [];

    sections.forEach((id) => {
      const el = document.getElementById(`section-${id}`);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveTab(id);
            }
          });
        },
        {
          rootMargin: '-30% 0px -60% 0px',
          threshold: 0,
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [loading]);

  /* ── Handlers ── */
  const handleContact = () => {
    navigate(`/messages/new?to=${supplier.slug}`);
  };

  const handleSeeAllProducts = () => {
    navigate(`/fournisseur/${supplier.slug}/catalogue`);
  };

  /* ── States UI ── */
  if (loading) {
    return <div style={loadingStyle}>Chargement du profil…</div>;
  }

  if (error === 'not_found') {
    return (
      <div style={pageStateStyle}>
        <i className="ti ti-mood-empty" style={{ fontSize: 48, color: '#ccc' }} />
        <h2 style={{ margin: '16px 0 8px', fontSize: 22, color: '#111' }}>
          Fournisseur introuvable
        </h2>
        <p style={{ color: '#666', fontSize: 14 }}>
          Ce profil n'existe pas ou a été supprimé.
        </p>
        <button onClick={() => navigate('/')} style={btnPrimaryStyle}>
          Retour à l'accueil
        </button>
      </div>
    );
  }

  if (error === 'load_failed') {
    return (
      <div style={pageStateStyle}>
        <i className="ti ti-alert-circle" style={{ fontSize: 48, color: '#FF4500' }} />
        <h2 style={{ margin: '16px 0 8px', fontSize: 22, color: '#111' }}>
          Erreur de chargement
        </h2>
        <p style={{ color: '#666', fontSize: 14 }}>
          Impossible de charger ce profil. Réessayez plus tard.
        </p>
        <button onClick={() => window.location.reload()} style={btnPrimaryStyle}>
          Réessayer
        </button>
      </div>
    );
  }

  /* ── Render principal ── */
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg,#FFFFFF 0%,#F8F8FB 100%)',
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
    }}>

      {/* ═══════════════════ SECTION HOME ═══════════════════ */}
      <section id="section-home">
        <SupplierBanner
          supplier={supplier}
          store={store}
          activeTab={activeTab}
          onContact={handleContact}
        />

        <SupplierStats
          supplier={supplier}
          store={store}
          productsCount={products.length || 48}
        />
      </section>

      {/* ═══════════════════ SECTION PRODUCTS ═══════════════════ */}
      <section id="section-products">
        <SectionTitle
          small="Catalogue"
          title="Nos produits"
          subtitle="Découvrez notre gamme complète de produits disponibles en gros pour les professionnels."
        />

        <SupplierProducts
          products={products}
          supplierSlug={supplier.slug}
          onSeeAll={handleSeeAllProducts}
        />
      </section>

      {/* ═══════════════════ SECTION PROFILE ═══════════════════ */}
      <section id="section-profile" style={{ paddingTop: 60 }}>
        <SectionTitle
          small="Qui sommes-nous"
          title="Profil de l'entreprise"
          subtitle="Découvrez l'histoire, la mission et les coulisses de notre fournisseur."
        />

        <SupplierAbout
          supplier={supplier}
          store={store}
          onContact={handleContact}
        />
      </section>

      {/* ═══════════════════ SECTION AVIS ═══════════════════ */}
      <section id="section-reviews" style={{ paddingTop: 60, paddingBottom: 120 }}>
        <SectionTitle
          small="Témoignages"
          title="Avis clients"
          subtitle="Ce que disent les professionnels qui font confiance à ce fournisseur sur GROSHOP."
        />

        <SupplierReviews reviews={reviews} />
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <Footer />

    </div>
  );
}

/* ── Styles ── */
const loadingStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(180deg,#FFFFFF 0%,#F8F8FB 100%)',
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
  color: '#666',
  fontSize: 14,
};

const pageStateStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(180deg,#FFFFFF 0%,#F8F8FB 100%)',
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
  padding: 20,
  textAlign: 'center',
};

const btnPrimaryStyle = {
  marginTop: 16,
  background: '#FF4500',
  color: '#fff',
  border: 'none',
  padding: '10px 24px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const tempPlaceholder = {
  padding: 60,
  textAlign: 'center',
  color: '#999',
  fontSize: 14,
  background: '#fff',
  borderRadius: 16,
  border: '1px dashed #ddd',
  lineHeight: 1.6,
  maxWidth: 1100,
  margin: '0 auto',
};