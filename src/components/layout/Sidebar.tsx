// ============================================================
// Sidebar Component — Barra lateral modular de navegación
// ============================================================

import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  DashboardOutlined,
  PeopleAltOutlined,
  BusinessOutlined,
  LogoutOutlined,
  AdminPanelSettingsOutlined,
  DeleteOutlineRounded,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  drawerWidth?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ drawerWidth = 260 }) => {
  const { userProfile, company, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Inicio',
      icon: <DashboardOutlined />,
      roles: ['admin', 'collaborator'],
    },
    {
      path: '/persons',
      label: 'Registro de Personas',
      icon: <PeopleAltOutlined />,
      roles: ['admin', 'collaborator'],
    },
    {
      path: '/papelera',
      label: 'Papelera',
      icon: <DeleteOutlineRounded />,
      roles: ['admin', 'collaborator'],
    },
    {
      path: '/settings',
      label: 'Ajustes de Empresa',
      icon: <BusinessOutlined />,
      roles: ['admin'], // Solo admins pueden ver los ajustes de empresa
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || (userProfile && item.roles.includes(userProfile.role))
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
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

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: (theme) => theme.palette.background.paper,
          borderRight: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      <Box>
        {/* Encabezado / Logo */}
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.2rem',
            }}
          >
            R
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              RegisterApp
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
              v2.0 (Firebase Cloud)
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2, opacity: 0.5 }} />

        {/* Sección de la Empresa Activa */}
        <Box sx={{ px: 2, mb: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              backgroundColor: alpha('#6366f1', 0.05),
              border: `1px solid ${alpha('#6366f1', 0.15)}`,
            }}
          >
            <Typography variant="caption" color="primary.light" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              EMPRESA ACTIVA
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              🏢 {company?.name || 'Cargando...'}
            </Typography>
          </Box>
        </Box>

        {/* Menú de Navegación */}
        <List sx={{ px: 1 }}>
          {filteredMenuItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 2,
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    backgroundColor: isSelected ? alpha('#6366f1', 0.08) : 'transparent',
                    borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                    '&.Mui-selected': {
                      backgroundColor: alpha('#6366f1', 0.08),
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: alpha('#6366f1', 0.12),
                      },
                    },
                    '&:hover': {
                      backgroundColor: alpha('#6366f1', 0.04),
                      color: 'text.primary',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isSelected ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: isSelected ? 700 : 500 }}>
                        {item.label}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Sección del Perfil del Usuario / Pie de Página */}
      <Box>
        <Divider sx={{ opacity: 0.5 }} />
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              fontSize: '0.9rem',
              fontWeight: 700,
              background: userProfile?.role === 'admin' 
                ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' 
                : 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
            }}
          >
            {userProfile ? getInitials(userProfile.name) : 'U'}
          </Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userProfile?.name || 'Usuario'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
              {userProfile?.role === 'admin' ? (
                <Chip
                  label="Admin"
                  size="small"
                  icon={<AdminPanelSettingsOutlined style={{ fontSize: 12, color: 'inherit' }} />}
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    backgroundColor: alpha('#6366f1', 0.15),
                    color: '#818cf8',
                    border: `1px solid ${alpha('#6366f1', 0.3)}`,
                  }}
                />
              ) : (
                <Chip
                  label="Colab"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    backgroundColor: alpha('#a78bfa', 0.15),
                    color: '#c4b5fd',
                    border: `1px solid ${alpha('#a78bfa', 0.3)}`,
                  }}
                />
              )}
            </Box>
          </Box>
          <Tooltip title="Cerrar Sesión">
            <IconButton onClick={handleLogout} color="error" size="small" sx={{ p: 1 }}>
              <LogoutOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
};
