import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Balance from "./pages/Balance";
import Users from "./pages/Users";
import Files from "./pages/Files";
import Sales from "./pages/Sales";
import DailyUsage from "./pages/DailyUsage";
import Routers from "./pages/Routers";
import RouterTest from "./pages/RouterTest";
import ServerConnectionForm from "./pages/ServerConnectionForm";
import VoucherCards from "./pages/VoucherCards";
import CardData from "./pages/CardData";
import Guide from "./pages/Guide";
import { DashboardLayout } from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">جاري التحميل...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout><Dashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/balance" element={
            <ProtectedRoute>
              <DashboardLayout><Balance /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <DashboardLayout><Users /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/files" element={
            <ProtectedRoute>
              <DashboardLayout><Files /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/sales" element={
            <ProtectedRoute>
              <DashboardLayout><Sales /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/daily-usage" element={
            <ProtectedRoute>
              <DashboardLayout><DailyUsage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/routers" element={
            <ProtectedRoute>
              <DashboardLayout><Routers /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/server-connection" element={
            <ProtectedRoute>
              <DashboardLayout><ServerConnectionForm /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/router-test" element={
            <ProtectedRoute>
              <DashboardLayout><RouterTest /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/cards" element={
            <ProtectedRoute>
              <DashboardLayout><VoucherCards /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/card-data" element={
            <ProtectedRoute>
              <DashboardLayout><CardData /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/help" element={
            <ProtectedRoute>
              <DashboardLayout><Guide /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
