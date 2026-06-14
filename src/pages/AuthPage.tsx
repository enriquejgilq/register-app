// ============================================================
// AuthPage — Pantalla de Login / Registro
// ============================================================

import { useState } from 'react';
import { Box } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { Login } from '../components/auth/Login';
import { Register } from '../components/auth/Register';
import { useAuthStore } from '../store/authStore';

export default function AuthPage() {
  const { user } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #0d0d2b 50%, #0f0f1a 100%)',
        p: 2,
      }}
    >
      {isRegister ? (
        <Register onSwitchToLogin={() => setIsRegister(false)} />
      ) : (
        <Login onSwitchToRegister={() => setIsRegister(true)} />
      )}
    </Box>
  );
}
