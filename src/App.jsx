// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { useAuth } from './context/AuthContext'
import SupplierRoute from './router/SupplierRoute'
import Layout from './components/Layout'
import GoogleOneTap from './components/GoogleOneTap'
import LoginPage          from './pages/LoginPage'
import SignupPage         from './pages/SignupPage'
import PendingPage        from './pages/PendingPage'
import DashboardLayout    from './components/DashboardLayout'
import DashboardPage      from './pages/DashboardPage'
import MessagesPage       from './pages/MessagesPage'
import CommandesPage      from './pages/CommandesPage'
import FavorisPage        from './pages/FavorisPage'
import ParametresPage     from './pages/ParametresPage'
import HomePage           from './pages/HomePage'
import SearchPage         from './pages/SearchPage'
import CartPage           from './pages/CartPage'
import SupplierProfilePage   from './pages/SupplierProfilePage'
import SupplierCataloguePage from './components/supplier/Suppliercataloguepage'
import ProductPage        from './pages/Productpage'
import SupplierDashboardLayout from './components/supplier/SupplierDashboardLayout'
import SupplierDashboardPage   from './pages/SupplierDashboardPage'
import SupplierProductsPage from './pages/SupplierProductsPage'
import SupplierOrdersPage from './pages/SupplierOrdersPage'
import SupplierMessagesPage from './pages/SupplierMessagesPage'
import SupplierStatsPage from './pages/SupplierStatsPage'
import SupplierReviewsPage from './pages/SupplierReviewsPage'
import SupplierPromotionsPage from './pages/SupplierPromotionsPage'
import SupplierShopPage from './pages/SupplierShopPage'
import SupplierSettingsPage from './pages/SupplierSettingsPage'
import ScrollToTop from './components/ScrollToTop'
import ResetPasswordPage from './pages/ResetPasswordPage'
import SupplierLandingPage from './pages/supplier-landing/SupplierLandingPage'
import SupplierSignupPage from './pages/supplier-landing/SupplierSignupPage'
import Footer from './components/Footer'
import AddProductPage from './pages/AddProductPage'
import RequireAuth from './router/RequireAuth'
import MobileCategoriesPage from './pages/MobileCategoriesPage'
import CheckoutPage from './pages/CheckoutPage'
const NO_LAYOUT   = ['/login', '/signup', '/pending', '/supplier', '/dashboard', '/categories', '/checkout']
const FOOTER_ONLY = ['/devenir-fournisseur']

// Placeholder pour les sous-pages du dashboard pas encore construites
// (commandes, paiement, favoris, logistique, parametres…). Rendu DANS la coque.
function DashSoon() {
  return (
    <div style={{ padding: 48, textAlign: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>🚧</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: '#0F1419' }}>Page en construction</div>
      <div style={{ fontSize: 13.5, color: '#6B7785', marginTop: 6 }}>Cette section arrive bientôt.</div>
    </div>
  )
}

function AppContent() {
  const location    = useLocation()
  const { user, loading: authLoading } = useAuth()

  // ⭐ Un compte = un rôle. Le fournisseur n'a accès qu'à son dashboard.
  //    /produit/:id reste public (SEO + prévisualisation de ses fiches).
  const BUYER_PATHS = ['/', '/search', '/panier']
  const isBuyerPath = BUYER_PATHS.includes(location.pathname)
                   || location.pathname.startsWith('/dashboard')
                   || location.pathname.startsWith('/fournisseur')

  if (!authLoading && user?.role === 'supplier' && isBuyerPath) {
    return <Navigate to="/supplier" replace />
  }

  const isNoLayout = NO_LAYOUT.includes(location.pathname)
                  || location.pathname.startsWith('/supplier')
                  || location.pathname.startsWith('/dashboard')
                  || location.pathname.startsWith('/devenir-fournisseur/inscription')
  const isFooterOnly = !isNoLayout && FOOTER_ONLY.includes(location.pathname)

  if (isNoLayout) {
    return (
      <Routes>
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/signup"         element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/pending"        element={<PendingPage />} />
        <Route path="/categories"     element={<MobileCategoriesPage />} />
        <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
        <Route path="/devenir-fournisseur/inscription" element={<SupplierSignupPage />} />

        {/* ═══ Espace acheteur : coque persistante (topbar + sidebar), contenu via <Outlet/> ═══ */}
        <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
          <Route index               element={<DashboardPage />} />
          <Route path="messages"     element={<MessagesPage />} />
          <Route path="messages/:id" element={<MessagesPage />} />
          <Route path="commandes"    element={<CommandesPage />} />
          <Route path="favoris"      element={<FavorisPage />} />
          <Route path="parametres"   element={<ParametresPage />} />
          {/* commandes/:id (détail), sous-pages parametres, logistique : à construire */}
          <Route path="*"            element={<DashSoon />} />
        </Route>

        {/* ═══ Espace fournisseur ═══ */}
        <Route path="/supplier" element={
          <SupplierRoute><SupplierDashboardLayout /></SupplierRoute>
        }>
          <Route index               element={<SupplierDashboardPage />} />
          <Route path="products"     element={<SupplierProductsPage />} />
          <Route path="products/new" element={<AddProductPage />} />
          <Route path="orders"       element={<SupplierOrdersPage />} />
          <Route path="messages"     element={<SupplierMessagesPage />} />
          <Route path="stats"        element={<SupplierStatsPage />} />
          <Route path="reviews"      element={<SupplierReviewsPage />} />
          <Route path="promotions"   element={<SupplierPromotionsPage />} />
          <Route path="shop"         element={<SupplierShopPage />} />
          <Route path="settings"     element={<SupplierSettingsPage />} />
        </Route>
      </Routes>
    )
  }

  if (isFooterOnly) {
    return (
      <>
        <Routes>
          <Route path="/devenir-fournisseur" element={<SupplierLandingPage />} />
        </Routes>
        <Footer />
      </>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/"                            element={<HomePage />} />
        <Route path="/search"                      element={<SearchPage />} />
        <Route path="/panier"                      element={<CartPage />} />
        <Route path="/produit/:id"                 element={<ProductPage />} />
        <Route path="/fournisseur/:slug"           element={<SupplierProfilePage />} />
        <Route path="/fournisseur/:slug/catalogue" element={<SupplierCataloguePage />} />
        <Route path="*"                            element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CartProvider>
          <ScrollToTop />
          <AppContent />
          <GoogleOneTap />
        </CartProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}