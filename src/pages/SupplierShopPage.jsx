// pages/SupplierShopPage.jsx — GROSHOP.tn
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { auth as authApi, suppliers as suppliersApi } from '../lib/api';

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
 * Branchée sur Django :
 *   - GET    auth.supplierMe()            → charge profil + store
 *   - PATCH  suppliers.updateStore(data)  → sauvegarde un champ
 *   - POST   suppliers.uploadStoreImage() → upload image, renvoie { url }
 */

/* ── Helpers ─────────────────────────────────────────────────────── */

// {results:[…]} (DRF paginé) OU tableau nu.
const unwrap = (r) => (Array.isArray(r) ? r : r?.results ?? []);

// Prix affiché = plus bas palier si price_tiers, sinon base_price_tnd.
const computePrice = (p) => {
  const prices = (p.price_tiers || [])
    .map((t) => parseFloat(t.price_tnd))
    .filter((n) => !isNaN(n));
  if (prices.length) return Math.min(...prices);
  return parseFloat(p.base_price_tnd) || 0;
};

const mapProduct = (p) => ({
  id:        p.id,
  name:      p.name,
  subtitle:  p.moq ? `MOQ ${p.moq} ${p.unit || 'pièces'}` : p.category_name || '',
  price:     computePrice(p),
  currency:  'TND',
  image_url: p.primary_image || p.images?.[0]?.url || '',
});

// Le composant émet `brand_logo_url`, la colonne backend est `logo_url`.
// Seul alias nécessaire ; tout le reste porte le même nom des deux côtés.
const toBackendField = (f) => (f === 'brand_logo_url' ? 'logo_url' : f);

// certifications : chaîne CSV côté back ↔ tableau côté composants.
const splitCerts = (v) =>
  Array.isArray(v) ? v : (v || '').split(',').map((s) => s.trim()).filter(Boolean);

export default function SupplierShopPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading]     = useState(true);
  const [denied, setDenied]       = useState(false);

  const [supplier, setSupplier] = useState(null);
  const [store, setStore]       = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews]   = useState([]);

  /* ── Chargement depuis le backend ── */
  useEffect(() => {
    let cancelled = false;

    async function loadMyShop() {
      setLoading(true);
      setDenied(false);
      try {
        const me = await authApi.supplierMe(); // GET /auth/supplier/me/
        if (cancelled) return;

        if (!me) { setDenied(true); setLoading(false); return; } // 401 non récupérable

        const raw = me.store ?? {};

        setSupplier({
          id:                  me.id,
          company_name:        me.company_name || '',
          slug:                me.slug || '',
          city:                me.city || '',
          wilaya:              me.wilaya || '',
          verification_status: me.verification_status || 'pending',
          rating_avg:          Number(me.rating_avg ?? 0),
          rating_count:        Number(me.rating_count ?? 0),
          followers_count:     Number(me.followers_count ?? 0),
          created_at:          me.created_at || null,
        });

        setStore({
          ...raw,
          brand_logo_url: raw.logo_url || '',
          banner_url:     raw.banner_url || '',
          certifications: splitCerts(raw.certifications),
          about_images:   Array.isArray(raw.about_images) ? raw.about_images : [],
        });

        if (me.slug) {
          const prods = await suppliersApi.products(me.slug, { page_size: 24 }).catch(() => []);
          if (!cancelled) setProducts(unwrap(prods).map(mapProduct));
        }

        // Avis embarqués si le back les fournit un jour, sinon vide.
        setReviews(Array.isArray(me.reviews) ? me.reviews : []);
      } catch (e) {
        if (!cancelled) {
          if (e?.status === 403) setDenied(true);   // pas fournisseur
          else setDenied(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMyShop();
    return () => { cancelled = true; };
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
     HANDLERS ÉDITION — persistés côté Django
     ────────────────────────────────────────────────────────── */

  // Mise à jour optimiste : on affiche tout de suite, on PATCH derrière.
  // Si le PATCH échoue, on revient à l'ancienne valeur.
  const handleUpdateField = async (field, value) => {
    const prevValue = store?.[field];
    setStore((prev) => ({ ...prev, [field]: value }));

    const backendField = toBackendField(field);
    const payloadValue =
      backendField === 'certifications' && Array.isArray(value) ? value.join(', ') : value;

    try {
      await suppliersApi.updateStore({ [backendField]: payloadValue });
    } catch (e) {
      setStore((prev) => ({ ...prev, [field]: prevValue })); // rollback
      alert(e?.message || "Impossible d'enregistrer la modification.");
    }
  };

  /**
   * Upload d'image : upload → { url } → PATCH du champ concerné.
   *  - about_image_0..3 → met à jour l'array store.about_images[i]
   *  - autres champs    → met à jour store[field] (alias vers colonne back)
   */
  const handleUploadImage = async (field, file) => {
    const { url } = await suppliersApi.uploadStoreImage(file);

    // Cas about_image_N → on remplace l'élément i de l'array
    if (field.startsWith('about_image_')) {
      const index = parseInt(field.split('_')[2], 10);
      if (!Number.isNaN(index)) {
        const newImages = [...(store?.about_images || [])];
        newImages[index] = url;
        setStore((prev) => ({ ...prev, about_images: newImages }));
        await suppliersApi.updateStore({ about_images: newImages });
        return;
      }
    }

    // Cas standard : banner_url, brand_logo_url, highlight_image_1/2, about_image_url…
    setStore((prev) => ({ ...prev, [field]: url }));
    await suppliersApi.updateStore({ [toBackendField(field)]: url });
  };

  /* ── Handlers vitrine (boutons "Contacter" / "Nos produits")
       Sur sa propre page, on les neutralise.                    ── */
  const handleContactSelf = () => {
    alert('Ceci est un aperçu de votre vitrine — vos visiteurs verront le bouton "Contacter".');
  };

  const handleSeeAllProducts = () => {
    navigate('/supplier/products');
  };

  /* ── States UI ── */
  if (loading) return <div style={loadingStyle}>Chargement de votre boutique…</div>;

  if (denied || !supplier) return (
    <div style={{ ...loadingStyle, flexDirection: 'column', gap: 12 }}>
      <span>Accès réservé à votre compte fournisseur.</span>
      <button
        onClick={() => navigate('/login')}
        style={{ background: 'none', border: 'none', color: '#FF4500', fontWeight: 700, cursor: 'pointer' }}
      >
        Se connecter
      </button>
    </div>
  );

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
          productsCount={products.length || 0}
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