// ============================================================
// CompanySettings Component — Panel de administración de Empresa
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  alpha,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  SaveOutlined,
  SendOutlined,
  PeopleOutlined,
  AdminPanelSettingsOutlined,
  BusinessOutlined,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { useSnackbar } from '../common/SnackbarAlert';
import type { UserRole } from '../../models/Company';

export const CompanySettings: React.FC = () => {
  const { showSuccess, showError } = useSnackbar();
  const {
    company,
    userProfile,
    collaborators,
    inviteCollaborator,
    fetchCollaborators,
    updateCompanyName,
    isLoading,
    isInitializing,
    error,
    setError,
  } = useAuthStore();

  const isAuthLoading = isInitializing || isLoading;

  // Estados locales
  const [newCompanyName, setNewCompanyName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('collaborator');
  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Inicializar nombre
  useEffect(() => {
    if (company) {
      setNewCompanyName(company.name);
    }
  }, [company]);

  // Cargar colaboradores
  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  // Guardar nombre de empresa
  const handleSaveCompanyName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    
    setIsUpdatingCompany(true);
    setError(null);
    try {
      await updateCompanyName(newCompanyName);
      showSuccess('✓ Nombre de la empresa actualizado correctamente');
    } catch {
      showError('Error al cambiar el nombre de la empresa');
    } finally {
      setIsUpdatingCompany(false);
    }
  };

  // Enviar invitación
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSendingInvite(true);
    setError(null);
    try {
      await inviteCollaborator(inviteEmail, inviteRole);
      showSuccess(`✓ Invitación enviada con éxito a ${inviteEmail}`);
      setInviteEmail('');
    } catch (err) {
      const errorVal = err as Error;
      showError(errorVal.message || 'Error al enviar la invitación');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Validar si el usuario actual es admin
  const isAdmin = userProfile?.role === 'admin';

  if (isAuthLoading && !userProfile) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={28} color="primary" sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Cargando permisos de la empresa...
        </Typography>
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="warning">No tienes permisos para ver esta sección. Solo administradores pueden gestionar la empresa.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabecera del Panel */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            backgroundColor: alpha('#6366f1', 0.15),
            color: 'primary.main',
          }}
        >
          <BusinessOutlined fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Configuración de Empresa
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra el nombre de tu organización e invita a colaboradores de tu equipo
          </Typography>
        </Box>
      </Box>

      {/* Alertas generales de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Lado Izquierdo: Configuración General e Invitaciones */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            
            {/* Tarjeta 1: Perfil / Nombre de la Empresa */}
            <Card sx={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🏢 Datos de la Empresa
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box component="form" onSubmit={handleSaveCompanyName}>
                  <TextField
                    fullWidth
                    label="Nombre de la Empresa"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    disabled={isUpdatingCompany || isLoading}
                    required
                    sx={{ mb: 3 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isUpdatingCompany || isLoading || newCompanyName.trim() === company?.name}
                    startIcon={isUpdatingCompany ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
                    sx={{ fontWeight: 700 }}
                  >
                    Guardar Cambios
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Tarjeta 2: Enviar Invitación */}
            <Card sx={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  ✉️ Invitar Colaborador
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Envía una invitación por correo. La persona invitada podrá registrarse y acceder inmediatamente a todos los registros de tu empresa.
                </Typography>

                <Box component="form" onSubmit={handleSendInvite}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Correo del Colaborador"
                    placeholder="colaborador@empresa.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={isSendingInvite || isLoading}
                    required
                    sx={{ mb: 2.5 }}
                  />

                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="invite-role-label">Rol del Colaborador</InputLabel>
                    <Select
                      labelId="invite-role-label"
                      value={inviteRole}
                      label="Rol del Colaborador"
                      onChange={(e) => setInviteRole(e.target.value as UserRole)}
                      disabled={isSendingInvite || isLoading}
                    >
                      <MenuItem value="collaborator">Colaborador (Lectura y Escritura)</MenuItem>
                      <MenuItem value="admin">Administrador (Control total y Ajustes)</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disabled={isSendingInvite || isLoading || !inviteEmail}
                    startIcon={isSendingInvite ? <CircularProgress size={20} color="inherit" /> : <SendOutlined />}
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)',
                      },
                    }}
                  >
                    Enviar Invitación
                  </Button>
                </Box>
              </CardContent>
            </Card>

          </Box>
        </Grid>

        {/* Lado Derecho: Lista de Colaboradores */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%', background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleOutlined /> Miembros del Equipo ({collaborators.length})
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Correo</TableCell>
                      <TableCell>Rol</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {collaborators.map((colab) => (
                      <TableRow key={colab.uid}>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                background: colab.role === 'admin'
                                  ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                                  : 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                              }}
                            >
                              {getInitials(colab.name)}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {colab.name} {colab.uid === userProfile?.uid && '(Tú)'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, color: 'text.secondary', fontSize: '0.85rem' }}>
                          {colab.email}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          {colab.role === 'admin' ? (
                            <Chip
                              label="Admin"
                              size="small"
                              icon={<AdminPanelSettingsOutlined style={{ fontSize: 12, color: 'inherit' }} />}
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                backgroundColor: alpha('#6366f1', 0.15),
                                color: '#818cf8',
                                border: `1px solid ${alpha('#6366f1', 0.3)}`,
                              }}
                            />
                          ) : (
                            <Chip
                              label="Colaborador"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                backgroundColor: alpha('#a78bfa', 0.15),
                                color: '#c4b5fd',
                                border: `1px solid ${alpha('#a78bfa', 0.3)}`,
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
