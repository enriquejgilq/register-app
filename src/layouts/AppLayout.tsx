// ============================================================
// AppLayout — Shell de la aplicación autenticada (sidebar + contenido)
// ============================================================

import { useState, useEffect } from 'react';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { LocalDataMigrationPrompt } from '../components/common/LocalDataMigrationPrompt';

const DRAWER_WIDTH = 260;

export default function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Fondo decorativo */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '50%',
            height: '50%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-15%',
            left: '-10%',
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </Box>

      {/* Sidebar Navigation */}
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        variant={isDesktop ? 'persistent' : 'temporary'}
      />

      {/* Botón flotante para reabrir el menú */}
      {!sidebarOpen && (
        <IconButton
          onClick={() => setSidebarOpen(true)}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: (t) => t.zIndex.drawer + 1,
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          <MenuRoundedIcon />
        </IconButton>
      )}

      {/* Contenido Principal Modular */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          minHeight: '100vh',
          p: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: sidebarOpen
              ? theme.transitions.duration.enteringScreen
              : theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>

      {/* Modales globales */}
      <LocalDataMigrationPrompt />
    </Box>
  );
}
