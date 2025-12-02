import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import MarketingDashboard from './pages/MarketingDashboard';
import ClientAdminDashboard from './pages/ClientAdminDashboard';
import ClientEngineerDashboard from './pages/ClientEngineerDashboard';
import '@/App.css';

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'SuperAdmin':
      return <SuperAdminDashboard />;
    case 'Marketing':
      return <MarketingDashboard />;
    case 'ClientAdmin':
      return <ClientAdminDashboard />;
    case 'ClientEngineer':
      return <ClientEngineerDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;