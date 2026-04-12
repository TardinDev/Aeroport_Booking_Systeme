import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { FlightsPage } from "@/pages/FlightsPage";
import { GroundTransportPage } from "@/pages/GroundTransportPage";
import { BookingPage } from "@/pages/BookingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { CheckInPage } from "@/pages/CheckInPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ReactNode } from "react";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    user: s.user,
  }));
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/flights" element={<FlightsPage />} />
                <Route path="/transport" element={<GroundTransportPage />} />
                <Route path="/booking/:flightId" element={<BookingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/check-in/:bookingId"
                  element={
                    <ProtectedRoute>
                      <CheckInPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
