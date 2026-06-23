// pages/SupplierShopPage.jsx — GROSHOP.tn
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import SupplierBanner   from '../components/supplier/SupplierBanner';
import SectionTitle     from '../components/supplier/SectionTitle';
import SupplierStats    from '../components/supplier/SupplierStats';
import SupplierProducts from '../components/supplier/SupplierProducts';
import SupplierAbout    from '../components/supplier/SupplierAbout';
import SupplierReviews  from '../components/supplier/SupplierReviews';
import Footer           from '../components/Footer';

/**
 * Vitrine éditable du fournisseur connecté — Single Page Scroll
 * URL : /supplier/shop
 *
 * Visuellement IDENTIQUE à /fournisseur/:slug (page publique),
 * mais avec editable={true} sur les composants modifiables.
 * Le fournisseur édite sa vitrine en voyant exactement ce que
 * verront ses visiteurs.
 */
export default function SupplierShopPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading]     = useState(true);

  const [supplier, setSupplier] = useState(null);
  const [store, setStore]       = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews]   = useState([]);

  /* ── Mock data (même structure que SupplierProfilePage) ── */
  useEffect(() => {
    async function loadMyShop() {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 200));

      setSupplier({
        company_name: 'Sfax Textile Co.',
        slug: 'sfax-textile-co',
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
        hero_title: 'Un fournisseur de confiance\nsur lequel vous pouvez compter.',

        // ⭐ Champs SupplierStats
        stats_title: "Sfax Textile Co.,\nl'expertise grossiste\nau service des pros.",
        stats_description: "Notre savoir-faire allie production de qualité, logistique fiable et accompagnement personnalisé. À chaque étape, nous garantissons un service à la hauteur des exigences professionnelles.",
        highlight_image_1: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
        highlight_image_2: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80',

        // ⭐ Champs SupplierAbout
        about_title_main: 'Un fournisseur de confiance.',
        about_title_accent: 'Une vision claire.',
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

      setProducts([
        { id: 1,  name: 'T-shirt coton premium',         subtitle: 'Lot de 12 unités',  price: 84,  currency: 'TND', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
        { id: 2,  name: 'Chemise Oxford homme',          subtitle: 'Lot de 6 unités',   price: 138, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80' },
        { id: 3,  name: 'Polo piqué bicolore',           subtitle: 'Lot de 12 unités',  price: 108, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80' },
        { id: 4,  name: 'Jean slim stretch',             subtitle: 'Lot de 6 unités',   price: 192, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' },
        { id: 5,  name: 'Hoodie zip intérieur molleton', subtitle: 'Lot de 6 unités',   price: 174, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80' },
        { id: 6,  name: 'Veste légère coupe-vent',       subtitle: 'Lot de 4 unités',   price: 236, currency: 'TND', image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80' },
      ]);

      setReviews([
        {
          id: 1, rating: 5,
          text: "Qualité irréprochable et livraison rapide depuis Sfax. Les lots de t-shirts sont conformes à la description, finitions soignées.",
          author_name: "Karim Ben Salah", city: "Tunis",
          avatar_url: "https://i.pravatar.cc/150?img=12",
          attached_images: [],
        },
        {
          id: 2, rating: 4,
          text: "Bons produits, tissu conforme à la description et délai respecté. Je recommande pour les commandes en volume.",
          author_name: "Sonia Mhiri", city: "Sousse",
          avatar_url: "https://i.pravatar.cc/150?img=47",
          attached_images: [],
        },
        {
          id: 3, rating: 5,
          text: "Fournisseur de confiance avec lequel je travaille depuis 2 ans. Les certifications sont un vrai gage de qualité.",
          author_name: "Nabil Trabelsi", city: "Sfax",
          avatar_url: "https://i.pravatar.cc/150?img=33",
          attached_images: [],
        },
      ]);

      setLoading(false);
    }
    loadMyShop();
  }, []);

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
            if (entry.isIntersecting) setActiveTab(id);
          });
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [loading]);

  /* ──────────────────────────────────────────────────────────
     HANDLERS ÉDITION — mock (modifie juste le state local)
     Plus tard : remplacer par PATCH /api/dashboard/profile/
     ────────────────────────────────────────────────────────── */
  const handleUpdateField = async (field, value) => {
    await new Promise((r) => setTimeout(r, 400));
    console.log('[Shop] update field:', field, '→', value);
    setStore((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Upload d'image — gère 3 cas :
   *  1. about_image_0..3 → met à jour l'array store.about_images[i]
   *  2. autres champs    → met à jour store[field] directement
   *
   * Plus tard, remplacer par : POST /api/dashboard/profile/upload/
   * Le backend renverra une URL et on remplacera previewUrl par result[field].
   */
  const handleUploadImage = async (field, file) => {
    await new Promise((r) => setTimeout(r, 600));
    const previewUrl = URL.createObjectURL(file);
    console.log('[Shop] upload image:', field, '→', file.name);

    // Cas spécial : about_image_0..3 → on update l'array about_images
    if (field.startsWith('about_image_')) {
      const index = parseInt(field.split('_')[2], 10);
      if (!Number.isNaN(index)) {
        setStore((prev) => {
          const newImages = [...(prev.about_images || [])];
          newImages[index] = previewUrl;
          return { ...prev, about_images: newImages };
        });
        return;
      }
    }

    // Cas standard : banner_url, brand_logo_url, highlight_image_1, highlight_image_2, etc.
    setStore((prev) => ({ ...prev, [field]: previewUrl }));
  };

  /* ── Handlers vitrine (boutons "Contacter" / "Nos produits")
       Sur sa propre page, on les neutralise — ça n'a aucun sens
       que le fournisseur se contacte lui-même.                  ── */
  const handleContactSelf = () => {
    alert('Ceci est un aperçu de votre vitrine — vos visiteurs verront le bouton "Contacter".');
  };

  const handleSeeAllProducts = () => {
    navigate('/supplier/products');
  };

  /* ── States UI ── */
  if (loading) return <div style={loadingStyle}>Chargement de votre boutique…</div>;

  /* ── Render principal ── */
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg,#FFFFFF 0%,#F8F8FB 100%)',
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
    }}>

      {/* ⭐ Bandeau d'aide "Mode édition" en haut */}
      <EditModeBanner />

      {/* ═══════════════════ SECTION HOME ═══════════════════ */}
      <section id="section-home">
        <SupplierBanner
          supplier={supplier}
          store={store}
          activeTab={activeTab}
          onContact={handleContactSelf}
          editable={true}
          onUpdateField={handleUpdateField}
          onUploadImage={handleUploadImage}
        />

        <SupplierStats
          supplier={supplier}
          store={store}
          productsCount={products.length || 48}
          editable={true}
          onUpdateField={handleUpdateField}
          onUploadImage={handleUploadImage}
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
          onContact={handleContactSelf}
          editable={true}
          onUpdateField={handleUpdateField}
          onUploadImage={handleUploadImage}
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

      <Footer />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Petit bandeau "Mode édition" en haut de la page
   ════════════════════════════════════════════════════════════ */
function EditModeBanner() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #FF4500 0%, #FF6B1E 100%)',
      color: '#fff',
      padding: '10px 24px',
      fontSize: 13,
      fontWeight: 500,
      textAlign: 'center',
      letterSpacing: 0.2,
      fontFamily: 'DM Sans, sans-serif',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(255, 69, 0, 0.25)',
    }}>
      <span style={{ marginRight: 6 }}>✨</span>
      Mode édition — cliquez sur les zones modifiables pour personnaliser votre vitrine
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