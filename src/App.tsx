import { type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "./layouts/AppLayout";
import Index from "./pages/Index";
import StoresPage from "./pages/StoresPage";
import OffersPage from "./pages/OffersPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import NotificationsPage from "./pages/NotificationsPage";
import HistoryPage from "./pages/HistoryPage";
import RewardsPage from "./pages/RewardsPage";
import StoreDetailPage from "./pages/StoreDetailPage";
import OfferDetailPage from "./pages/OfferDetailPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthGuard>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route element={<AppLayout />}>
                <Route path="/home" element={<Index />} />
                <Route path="/stores" element={<StoresPage />} />
                <Route path="/store/:id" element={<StoreDetailPage />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/offer" element={<OfferDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthGuard>
        </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
