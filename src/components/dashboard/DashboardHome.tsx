// ============================================================
// DashboardHome Component — Módulo de inicio del sistema
// ============================================================

import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  alpha,
  Fade,
} from '@mui/material';
import {
  PeopleAltOutlined,
  BusinessOutlined,
  ArrowForwardOutlined,
  CalendarTodayOutlined,
  BadgeOutlined,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { usePersonStore } from '../../store/personStore';
import { PersonStatsCharts } from './PersonStatsCharts';

interface DashboardHomeProps {
  onNavigate: (module: 'persons' | 'company-settings') => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  const { userProfile, company, collaborators, fetchCollaborators } = useAuthStore();
  const { persons, initialize } = usePersonStore();

  // Inicializar datos al cargar
  useEffect(() => {
    if (company) {
      initialize(company.id);
      fetchCollaborators();
    }
  }, [company, initialize, fetchCollaborators]);

  // Obtener los últimos 4 registros de personas
  const recentPersons = [...persons]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Fade in timeout={600}>
      <Container maxWidth="xl" disableGutters sx={{ width: '100%' }}>
        {/* Banner de Bienvenida */}
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(167,139,250,0.15) 100%)',
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            mb: 4,
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            ¡Hola, {userProfile?.name || 'Usuario'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenido al panel de control de <strong>{company?.name || 'tu empresa'}</strong>. Aquí puedes coordinar los registros de tu equipo en tiempo real.
          </Typography>
        </Box>

        {/* Tarjetas de Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card sx={{ background: (theme) => theme.palette.gradients.card }}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifycontent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    Personas Registradas
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {persons.length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha('#6366f1', 0.1),
                    color: 'primary.main',
                  }}
                >
                  <PeopleAltOutlined sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Card sx={{ background: (theme) => theme.palette.gradients.card }}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifycontent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    Colaboradores de la Empresa
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                    {collaborators.length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha('#a78bfa', 0.1),
                    color: 'secondary.main',
                  }}
                >
                  <BusinessOutlined sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Gráficas de Estadísticas */}
        <PersonStatsCharts persons={persons} />

        <Grid container spacing={4}>
          {/* Columna Izquierda: Accesos Rápidos */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', background: (theme) => theme.palette.gradients.card }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Acciones Rápidas
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    endIcon={<ArrowForwardOutlined />}
                    onClick={() => onNavigate('persons')}
                    sx={{
                      justifyContent: 'space-between',
                      py: 2,
                      px: 3,
                      borderRadius: 3,
                      border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                      textAlign: 'left',
                      '&:hover': {
                        backgroundColor: alpha('#6366f1', 0.05),
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PeopleAltOutlined color="primary" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Ir al Registro de Personas
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Crea, edita e importa personas desde archivos Excel
                        </Typography>
                      </Box>
                    </Box>
                  </Button>

                  {userProfile?.role === 'admin' && (
                    <Button
                      variant="outlined"
                      fullWidth
                      size="large"
                      color="secondary"
                      endIcon={<ArrowForwardOutlined />}
                      onClick={() => onNavigate('company-settings')}
                      sx={{
                        justifyContent: 'space-between',
                        py: 2,
                        px: 3,
                        borderRadius: 3,
                        border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.25)}`,
                        textAlign: 'left',
                        '&:hover': {
                          backgroundColor: alpha('#a78bfa', 0.05),
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <BusinessOutlined color="secondary" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            Gestionar Empresa
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Invita a nuevos colaboradores y edita datos de empresa
                          </Typography>
                        </Box>
                      </Box>
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Columna Derecha: Últimos Registros */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', background: (theme) => theme.palette.gradients.card }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Últimos Registros
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {recentPersons.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay registros creados recientemente en la empresa.
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {recentPersons.map((p, index) => (
                      <React.Fragment key={p.id}>
                        <ListItem sx={{ py: 1.5, px: 0 }}>
                          <ListItemAvatar>
                            {p.fotoBase64 ? (
                              <Avatar src={p.fotoBase64} sx={{ width: 44, height: 44 }} />
                            ) : (
                              <Avatar
                                sx={{
                                  width: 44,
                                  height: 44,
                                  fontSize: '0.9rem',
                                  fontWeight: 700,
                                  background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
                                }}
                              >
                                {getInitials(`${p.nombre} ${p.apellido}`)}
                              </Avatar>
                            )}
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {p.nombre} {p.apellido}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <BadgeOutlined style={{ fontSize: 12 }} /> C.I.: {p.cedula}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarTodayOutlined style={{ fontSize: 12 }} /> Creado el {formatDate(p.createdAt)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < recentPersons.length - 1 && <Divider component="li" sx={{ opacity: 0.5 }} />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};
