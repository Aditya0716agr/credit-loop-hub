import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import TestingHub from "@/pages/TestingHub";
import PostTest from "@/pages/PostTest";
import TestDetail from "@/pages/TestDetail";
import Profile from "@/pages/Profile";
import Forms from "@/pages/Forms";
import CreateForm from "@/pages/CreateForm";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCanceled from "@/pages/PaymentCanceled";
import { AppProvider } from "@/context/AppContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <HelmetProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/hub" element={<TestingHub />} />
                <Route path="/post" element={<PostTest />} />
                <Route path="/test/:id" element={<TestDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/forms" element={<Forms />} />
                <Route path="/forms/create" element={<CreateForm />} />
                 <Route path="/login" element={<Login />} />
                 <Route path="/signup" element={<Signup />} />
                 <Route path="/auth" element={<Login />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-canceled" element={<PaymentCanceled />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </HelmetProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
