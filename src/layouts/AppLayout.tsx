// ============================================================
// AppLayout — Shell de la aplicación autenticada (sidebar + contenido)
// ============================================================

import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { LocalDataMigrationPrompt } from '../components/common/LocalDataMigrationPrompt';

const DRAWER_WIDTH = 260;

export default function AppLayout() {
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
      <Sidebar drawerWidth={DRAWER_WIDTH} />

      {/* Contenido Principal Modular */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          p: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>

      {/* Modales globales */}
      <LocalDataMigrationPrompt />
    </Box>
  );
}
