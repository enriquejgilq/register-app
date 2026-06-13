// ============================================================
// Login Component — Pantalla de Inicio de Sesión
// ============================================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Link,
  alpha,
  Fade,
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined, EmailOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const { login, error, isLoading, setError, resetPassword } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }
    try {
      await login(email, password);
    } catch {
      // El error se maneja en el authStore
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico para enviar el enlace de recuperación.');
      return;
    }
    try {
      setError(null);
      await resetPassword(email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 6000);
    } catch {
      // Error se maneja en el store
    }
  };

  return (
    <Fade in timeout={500}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          width: '100%',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 420,
            borderRadius: 4,
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
            p: 2,
          }}
        >
          <CardContent>
            {/* Cabecera */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: (theme) => alpha(theme.palette.primary.main, 0.15),
                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  color: 'primary.main',
                  mb: 2,
                }}
              >
                <LockOutlined sx={{ fontSize: 30 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Iniciar Sesión
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accede a tu cuenta de empresa
              </Typography>
            </Box>

            {/* Alertas */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {resetSent && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Se ha enviado un enlace de recuperación a tu correo.
              </Alert>
            )}

            {/* Formulario */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                disabled={isLoading}
                placeholder="ejemplo@empresa.com"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                disabled={isLoading}
                placeholder="••••••"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Olvidé mi contraseña */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
                <Link
                  component="button"
                  type="button"
                  variant="caption"
                  color="secondary.light"
                  onClick={handleForgotPassword}
                  sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>

              {/* Botón enviar */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1rem',
                  mb: 3,
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
              </Button>
            </Box>

            {/* Enlace a Registro */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary" component="span">
                ¿No tienes una cuenta?{' '}
              </Typography>
              <Link
                component="button"
                variant="body2"
                color="primary.light"
                onClick={onSwitchToRegister}
                sx={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
                disabled={isLoading}
              >
                Regístrate aquí
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};
