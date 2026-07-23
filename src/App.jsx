import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';

const PUBLIC_ROUTES = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/p/:slug', element: <PortfolioPage /> },
  { path: '/forgot-password', element: <ResetPasswordPage mode="forgot" /> },
  { path: '/reset-password', element: <ResetPasswordPage mode="reset" /> },
];

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // TEMPORARY DEBUG — remove after diagnosing the tab-switch scroll reset.
  useEffect(() => {
    console.log('[SCROLL-DEBUG] route navigation ->', location.pathname, 'scrollY =', window.scrollY);
  }, [location.pathname]);

  return (
    <Routes>
      {PUBLIC_ROUTES.map(route => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user} loading={loading}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
