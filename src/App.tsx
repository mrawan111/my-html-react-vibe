import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Balance from "./pages/Balance";
import Users from "./pages/Users";
import Files from "./pages/Files";
import Sales from "./pages/Sales";
import DailyUsage from "./pages/DailyUsage";
import Routers from "./pages/Routers";
import Bills from "./pages/Bills";
import ServerConnectionForm from "./pages/ServerConnectionForm";
import { DashboardLayout } from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/balance" element={<DashboardLayout><Balance /></DashboardLayout>} />
          <Route path="/users" element={<DashboardLayout><Users /></DashboardLayout>} />
          <Route path="/files" element={<DashboardLayout><Files /></DashboardLayout>} />
          <Route path="/sales" element={<DashboardLayout><Sales /></DashboardLayout>} />
          <Route path="/daily-usage" element={<DashboardLayout><DailyUsage /></DashboardLayout>} />
          <Route path="/routers" element={<DashboardLayout><Routers /></DashboardLayout>} />
          <Route path="/bills" element={<DashboardLayout><Bills /></DashboardLayout>} />
          <Route path="/server-connection" element={<DashboardLayout><ServerConnectionForm /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
