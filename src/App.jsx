// src/App.jsx

import { lazy, Suspense, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { UnreadProvider } from './context/UnreadContext'
import { useAuth } from './context/AuthContext'
import SupplierRoute from './router/SupplierRoute'
import Layout from './components/Layout'
import GoogleOneTap from './components/GoogleOneTap'
import DashboardLayout from './components/DashboardLayout'
import SupplierDashboardLayout from './components/supplier/SupplierDashboardLayout'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'
import RequireAuth from './router/RequireAuth'
import { requestPushToken, onForegroundMessage } from './lib/firebase'
import { notifications } from './lib/api'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

const LoginPage              = lazy(() => import('./pages/LoginPage'))
const SignupPage             = lazy(() => import('./pages/SignupPage'))
const PendingPage            = lazy(() => import('./pages/PendingPage'))
const DashboardPage          = lazy(() => import('./pages/DashboardPage'))
const MessagesPage           = lazy(() => import('./pages/MessagesPage'))
const CommandesPage          = lazy(() => import('./pages/CommandesPage'))
const FavorisPage            = lazy(() => import('./pages/FavorisPage'))
const ParametresPage         = lazy(() => import('./pages/ParametresPage'))
const HomePage                = lazy(() => import('./pages/HomePage'))
const SearchPage              = lazy(() => import('./pages/SearchPage'))
const CartPage                = lazy(() => import('./pages/CartPage'))
const SupplierProfilePage     = lazy(() => import('./pages/SupplierProfilePage'))
const SupplierCataloguePage   = lazy(() => import('./components/supplier/Suppliercataloguepage'))
const ProductPage             = lazy(() => import('./pages/Productpage'))
const SupplierDashboardPage   = lazy(() => import('./pages/SupplierDashboardPage'))
const SupplierProductsPage    = lazy(() => import('./pages/SupplierProductsPage'))
const SupplierOrdersPage      = lazy(() => import('./pages/SupplierOrdersPage'))
const SupplierMessagesPage    = lazy(() => import('./pages/SupplierMessagesPage'))
const SupplierStatsPage       = lazy(() => import('./pages/SupplierStatsPage'))
const SupplierReviewsPage     = lazy(() => import('./pages/SupplierReviewsPage'))
const SupplierPromotionsPage  = lazy(() => import('./pages/SupplierPromotionsPage'))
const SupplierShopPage        = lazy(() => import('./pages/SupplierShopPage'))
const SupplierSettingsPage    = lazy(() => import('./pages/SupplierSettingsPage'))
const ResetPasswordPage       = lazy(() => import('./pages/ResetPasswordPage'))
const SupplierLandingPage     = lazy(() => import('./pages/supplier-landing/SupplierLandingPage'))
const SupplierSignupPage      = lazy(() => import('./pages/supplier-landing/SupplierSignupPage'))
const AddProductPage          = lazy(() => import('./pages/AddProductPage'))
const MobileCategoriesPage    = lazy(() => import('./pages/MobileCategoriesPage'))
const CheckoutPage            = lazy(() => import('./pages/CheckoutPage'))

const NO_LAYOUT   = ['/login', '/signup', '/pending', '/supplier', '/dashboard', '/categories', '/checkout']
const FOOTER_ONLY = ['/devenir-fournisseur']

// Simple fallback shown while a lazy page chunk is loading
function PageLoader() {
  return (
    <div style={{ padding: 48, textAlign: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <div style={{ fontSize: 13.5, color: '#6B7785' }}>Chargement…</div>
    </div>
  )
}

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
  useEffect(() => {
  ;(async () => {
    const token = await requestPushToken()
    if (token) await notifications.registerToken(token)
  })()
  onForegroundMessage((payload) => {
    console.log('Push (foreground):', payload)
  })
}, [])
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
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    )
  }

  if (isFooterOnly) {
    return (
      <>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/devenir-fournisseur" element={<SupplierLandingPage />} />
          </Routes>
        </Suspense>
        <Footer />
      </>
    )
  }

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                            element={<HomePage />} />
          <Route path="/search"                      element={<SearchPage />} />
          <Route path="/panier"                      element={<CartPage />} />
          <Route path="/produit/:id"                 element={<ProductPage />} />
          <Route path="/fournisseur/:slug"           element={<SupplierProfilePage />} />
          <Route path="/fournisseur/:slug/catalogue" element={<SupplierCataloguePage />} />
          <Route path="*"                            element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CartProvider>
          <UnreadProvider>
            <ScrollToTop />
            <AppContent />
            <GoogleOneTap />
          </UnreadProvider>
        </CartProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}
