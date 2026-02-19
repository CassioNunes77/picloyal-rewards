import { type ReactNode, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useParams, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";
import MerchantLayout from "./layouts/merchant/MerchantLayout";
import SplashScreen from "./components/SplashScreen";
import Index from "./pages/Index";
import StoresPage from "./pages/StoresPage";
import OffersPage from "./pages/OffersPage";
import ProfilePage from "./pages/ProfilePage";
import PremiumPage from "./pages/PremiumPage";
import LoginPage from "./pages/LoginPage";
import NotificationsPage from "./pages/NotificationsPage";
import HistoryPage from "./pages/HistoryPage";
import RewardsPage from "./pages/RewardsPage";
import StoreDetailPage from "./pages/StoreDetailPage";
import OfferDetailPage from "./pages/OfferDetailPage";
import RewardDetailPage from "./pages/RewardDetailPage";
import HistoryDetailPage from "./pages/HistoryDetailPage";
import SettingsPage from "./pages/SettingsPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminLocationsPage from "./pages/admin/AdminLocationsPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminStoresPage from "./pages/admin/AdminStoresPage";
import AdminStoreDetailPage from "./pages/admin/AdminStoreDetailPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminActivitiesPage from "./pages/admin/AdminActivitiesPage";
import AdminFeedbackPage from "./pages/admin/AdminFeedbackPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminPrivacyPage from "./pages/admin/AdminPrivacyPage";
import MerchantLoginPage from "./pages/merchant/MerchantLoginPage";
import MerchantSignUpPage from "./pages/merchant/MerchantSignUpPage";
import MerchantDashboardPage from "./pages/merchant/MerchantDashboardPage";
import MerchantStoresPage from "./pages/merchant/MerchantStoresPage";
import MerchantOffersPage from "./pages/merchant/MerchantOffersPage";
import MerchantSettingsPage from "./pages/merchant/MerchantSettingsPage";
import MerchantRedemptionsPage from "./pages/merchant/MerchantRedemptionsPage";
import StoreDetailsPage from "./pages/merchant/StoreDetailsPage";
import NotFound from "./pages/NotFound";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

const queryClient = new QueryClient();

/** Wrapper para StoreDetailPage: usa key=id para forçar remount ao trocar de loja */
function StoreDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <StoreDetailPage key={id ?? "none"} />;
}

/** Sem login, só a rota "/" é permitida — qualquer outra vai para splash/login. */
function AuthGuard({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <span className="text-white/90 text-lg font-medium">Carregando...</span>
      </div>
    );
  }
  if (!user && pathname !== "/") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

/** Guard para rotas administrativas */
function AdminGuard({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { isAuthenticated, loading } = useAdminAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground text-lg font-medium">Carregando...</span>
      </div>
    );
  }
  
  const isLoginPage = pathname === "/sys-admin-panel-7x9k/login" || pathname.endsWith("/login");
  
  // Se não está autenticado e não está na página de login, redireciona
  if (!isAuthenticated && !isLoginPage) {
    return <Navigate to="/sys-admin-panel-7x9k/login" replace />;
  }
  
  // Se está autenticado e está na página de login, redireciona para dashboard
  if (isAuthenticated && isLoginPage) {
    return <Navigate to="/sys-admin-panel-7x9k/dashboard" replace />;
  }
  
  return <>{children}</>;
}

const App = () => {
  const [splashVisible, setSplashVisible] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {splashVisible && (
              <SplashScreen onComplete={() => setSplashVisible(false)} />
            )}
            <BrowserRouter>
              <Routes>
              {/* Rotas administrativas */}
              <Route
                path="/sys-admin-panel-7x9k/login"
                element={
                  <AdminGuard>
                    <AdminLoginPage />
                  </AdminGuard>
                }
              />
              <Route
                path="/sys-admin-panel-7x9k"
                element={
                  <AdminGuard>
                    <AdminLayout />
                  </AdminGuard>
                }
              >
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="locations" element={<AdminLocationsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="stores" element={<AdminStoresPage />} />
                <Route path="stores/:storeId" element={<AdminStoreDetailPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="activities" element={<AdminActivitiesPage />} />
                <Route path="feedback" element={<AdminFeedbackPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="privacy" element={<AdminPrivacyPage />} />
                <Route index element={<Navigate to="/sys-admin-panel-7x9k/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/sys-admin-panel-7x9k/dashboard" replace />} />
              </Route>

              {/* Rotas do painel do lojista */}
              <Route path="/merchant/login" element={<MerchantLoginPage />} />
              <Route path="/merchant/signup" element={<MerchantSignUpPage />} />
              <Route element={<MerchantLayout />}>
                <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />
                <Route path="/merchant/stores" element={<MerchantStoresPage />} />
                <Route path="/merchant/offers" element={<MerchantOffersPage />} />
                <Route path="/merchant/store/:storeId" element={<StoreDetailsPage />} />
                <Route path="/merchant/profile" element={<Navigate to="/merchant/settings" replace />} />
                <Route path="/merchant/redemptions" element={<MerchantRedemptionsPage />} />
                <Route path="/merchant/settings" element={<MerchantSettingsPage />} />
                <Route path="/merchant/privacy-policy" element={<PrivacyPolicyPage />} />
              </Route>

              {/* Rotas do app principal */}
              <Route
                path="/*"
                element={
                  <AuthGuard>
                    <Routes>
                      <Route path="/" element={<LoginPage />} />
                      <Route element={<AppLayout />}>
                        <Route path="/home" element={<Index />} />
                        <Route path="/stores" element={<StoresPage />} />
                        <Route path="/store/:id" element={<StoreDetailRoute />} />
                        <Route path="/offers" element={<OffersPage />} />
                        <Route path="/offer" element={<OfferDetailPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/premium" element={<PremiumPage />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/history-detail" element={<HistoryDetailPage />} />
                        <Route path="/rewards" element={<RewardsPage />} />
                        <Route path="/reward" element={<RewardDetailPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                      </Route>
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AuthGuard>
                }
              />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
