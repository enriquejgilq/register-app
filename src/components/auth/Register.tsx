// ============================================================
// Register Component — Pantalla de Registro de Usuarios
// ============================================================

import React, { useState, useEffect } from 'react';
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
import {
  Visibility,
  VisibilityOff,
  PersonAddOutlined,
  LockOutlined,
  EmailOutlined,
  BadgeOutlined,
  BusinessOutlined,
  CheckCircleOutlined,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import type { Invitation } from '../../models/Company';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { registerUser, checkInvitation, error, isLoading, setError } = useAuthStore();

  // Campos de formulario
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Estados locales
  const [showPassword, setShowPassword] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [checkingInvite, setCheckingInvite] = useState(false);
  const [inviteChecked, setInviteChecked] = useState(false);

  // Validar invitación al perder el foco del campo correo
  const handleEmailBlur = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return;
    }

    setCheckingInvite(true);
    setError(null);
    try {
      const invite = await checkInvitation(trimmedEmail);
      setInvitation(invite);
      setInviteChecked(true);
    } catch (err) {
      console.error('Error verificando invitación:', err);
    } finally {
      setCheckingInvite(false);
    }
  };

  // Escuchar si el correo cambia para resetear la verificación
  useEffect(() => {
    setInvitation(null);
    setInviteChecked(false);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !name || !password) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Si no está invitado, la empresa es obligatoria
    if (!invitation && !companyName) {
      setError('Por favor, ingresa el nombre de la empresa que deseas registrar.');
      return;
    }

    try {
      await registerUser(email, password, name, invitation ? undefined : companyName);
    } catch {
      // El error se maneja en el authStore
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
            maxWidth: 440,
            borderRadius: 4,
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            background: (theme) => theme.palette.gradients.card,
            boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
            p: 2,
          }}
        >
          <CardContent>
            {/* Cabecera */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: (theme) => alpha(theme.palette.secondary.main, 0.15),
                  border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                  color: 'secondary.main',
                  mb: 2,
                }}
              >
                <PersonAddOutlined sx={{ fontSize: 30 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Crear Cuenta
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Regístrate para comenzar a gestionar
              </Typography>
            </Box>

            {/* Alertas de Error */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
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
                onBlur={handleEmailBlur}
                margin="normal"
                required
                disabled={isLoading}
                placeholder="colaborador@empresa.com"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: checkingInvite ? (
                      <InputAdornment position="end">
                        <CircularProgress size={20} color="secondary" />
                      </InputAdornment>
                    ) : null,
                  },
                }}
                helperText="Presiona fuera del campo para verificar si tienes una invitación pendiente."
              />

              {/* Alerta de Invitación Detectada */}
              {inviteChecked && invitation && (
                <Fade in>
                  <Alert
                    severity="success"
                    icon={<CheckCircleOutlined />}
                    sx={{ my: 2, backgroundColor: alpha('#34d399', 0.1), borderColor: '#34d399' }}
                  >
                    Invitación confirmada. Te unirás a: <strong>{invitation.companyName}</strong> como <strong>{invitation.role === 'admin' ? 'Administrador' : 'Colaborador'}</strong>.
                  </Alert>
                </Fade>
              )}

              {/* Información si NO hay invitación */}
              {inviteChecked && !invitation && email.includes('@') && (
                <Fade in>
                  <Alert
                    severity="info"
                    sx={{ my: 2, backgroundColor: alpha('#60a5fa', 0.1), borderColor: '#60a5fa' }}
                  >
                    No se detectó invitación previa. Crearás una nueva empresa en el sistema y serás el Administrador.
                  </Alert>
                </Fade>
              )}

              <TextField
                fullWidth
                label="Nombre Completo"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                required
                disabled={isLoading}
                placeholder="Juan Pérez"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeOutlined color="action" />
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
                placeholder="Mínimo 6 caracteres"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={isLoading}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Nombre de Empresa (Solo si no está invitado) */}
              {!invitation && (
                <TextField
                  fullWidth
                  label="Nombre de tu Empresa / Negocio"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  margin="normal"
                  required
                  disabled={isLoading}
                  placeholder="Mi Empresa S.A."
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessOutlined color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  helperText="Este nombre se usará para agrupar tus registros y colaboradores."
                />
              )}

              {/* Botón registrar */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading || checkingInvite}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1rem',
                  mt: 3,
                  mb: 2,
                  background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)',
                    boxShadow: '0 8px 20px rgba(167, 139, 250, 0.4)',
                  },
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
              </Button>
            </Box>

            {/* Enlace a Login */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary" component="span">
                ¿Ya tienes una cuenta?{' '}
              </Typography>
              <Link
                component="button"
                variant="body2"
                color="secondary.light"
                onClick={onSwitchToLogin}
                sx={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
                disabled={isLoading}
              >
                Inicia sesión
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};
