import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PropertiesProvider } from "./contexts/PropertiesContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import ComparePage from "./pages/ComparePage";
import AffordabilityCalculatorPage from "./pages/AffordabilityCalculatorPage";
import RoommateMatcherPage from "./pages/RoommateMatcherPage";
import InspectionChecklistPage from "./pages/InspectionChecklistPage";
import LocalityComparePage from "./pages/LocalityComparePage";
import CommuteCalculatorPage from "./pages/CommuteCalculatorPage";
import ToolsPage from "./pages/ToolsPage";
import OwnerEnquiriesPage from "./pages/OwnerEnquiriesPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ChatBot from "./components/ChatBot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PropertiesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/property/:id" element={<PropertyDetailPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/affordability" element={<AffordabilityCalculatorPage />} />
              <Route path="/roommate-matcher" element={<RoommateMatcherPage />} />
              <Route path="/inspection-checklist" element={<InspectionChecklistPage />} />
              <Route path="/locality-compare" element={<LocalityComparePage />} />
              <Route path="/commute-calculator" element={<CommuteCalculatorPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route
                path="/owner/enquiries"
                element={
                  <ProtectedRoute roles={["owner", "admin"]}>
                    <OwnerEnquiriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/dashboard"
                element={
                  <ProtectedRoute roles={["owner", "admin"]}>
                    <OwnerEnquiriesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              {/* CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* AI Assistant ChatBot */}
            <ChatBot />
          </BrowserRouter>
        </TooltipProvider>
      </PropertiesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
