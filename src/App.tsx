// ============================================================
// App.tsx — Componente raíz adaptado a Firebase y Multiempresa
// ============================================================

import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { usePersonStore } from './store/personStore';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PersonsPage from './pages/PersonsPage';
import PersonsTrashPage from './pages/PersonsTrashPage';
import CompanySettingsPage from './pages/CompanySettingsPage';

export default function App() {
  // Gestión de Estado de Autenticación
  const { initializeAuth, isInitializing, company } = useAuthStore();

  // Inicializar observador de autenticación de Firebase al montar
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  // Inicializar store de personas de la empresa
  const initializePersons = usePersonStore((s) => s.initialize);
  useEffect(() => {
    if (company?.id) {
      initializePersons(company.id);
    }
  }, [company, initializePersons]);

  // ─── Pantalla de Carga Inicial ─────────────────────────────
  if (isInitializing) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          background: (theme) => theme.palette.gradients.page,
        }}
      >
        <CircularProgress size={50} color="primary" />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Sincronizando con la nube de Firebase...
        </Typography>
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/persons" element={<PersonsPage />} />
          <Route path="/papelera" element={<PersonsTrashPage />} />
          <Route path="/settings" element={<CompanySettingsPage />} />
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
