import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { logProductionStatus } from "@/utils/productionChecks";
import "@/styles/global-dark.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import BaseFunded from "./pages/BaseFunded";
import { CreateCampaign } from "./pages/CreateCampaign";
import { CampaignPage } from "./pages/CampaignPage";
import { CampaignsListing } from "./pages/CampaignsListing";
import { MyCampaigns } from "./pages/MyCampaigns";
import { AuthPage } from "./pages/AuthPage";
import { TestVault } from "./pages/TestVault";
import DevStatus from "./pages/DevStatus";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Run production checks on app start
  useEffect(() => {
    if (import.meta.env.PROD) {
      logProductionStatus();
    }
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CampaignsListing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/create" element={
              <ProtectedRoute>
                <CreateCampaign />
              </ProtectedRoute>
            } />
            <Route path="/my-campaigns" element={
              <ProtectedRoute>
                <MyCampaigns />
              </ProtectedRoute>
            } />
            <Route path="/campaign/:campaignId" element={<CampaignPage />} />
            <Route path="/demo" element={<BaseFunded />} />
            <Route path="/test-vault" element={
              <ProtectedRoute>
                <TestVault />
              </ProtectedRoute>
            } />
            <Route path="/dev-status" element={<DevStatus />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
