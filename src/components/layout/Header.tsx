// ============================================================
// Header — Barra de navegación principal
// ============================================================

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Tooltip,
  IconButton,
  alpha,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

interface HeaderProps {
  totalPersons: number;
  onAddPerson: () => void;
  onImportExcel: () => void;
  onExportExcel: () => void;
  onClearAll: () => void;
  isExporting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  totalPersons,
  onAddPerson,
  onImportExcel,
  onExportExcel,
  onClearAll,
  isExporting = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha('#6366f1', 0.2)}`,
        zIndex: (t) => t.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ gap: 2, py: { xs: 1, md: 0.5 } }}>
        {/* Logo y título */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 2 }}>
          <Box
            sx={{
              width: { xs: 36, md: 44 },
              height: { xs: 36, md: 44 },
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              flexShrink: 0,
            }}
          >
            <PeopleRoundedIcon sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1rem', md: '1.15rem' },
                lineHeight: 1.2,
              }}
            >
              Registro de Personas
            </Typography>
            {!isMobile && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Gestión de Identidades
              </Typography>
            )}
          </Box>
        </Box>

        {/* Contador de registros */}
        <Chip
          label={`${totalPersons} ${totalPersons === 1 ? 'registro' : 'registros'}`}
          size="small"
          sx={{
            fontWeight: 700,
            background: (theme) => alpha(theme.palette.primary.main, 0.15),
            color: 'primary.light',
            border: `1px solid ${alpha('#6366f1', 0.3)}`,
            display: { xs: 'none', sm: 'flex' },
          }}
        />

        <Box sx={{ flex: 1 }} />

        {/* Botones de acción — Desktop */}
        {!isTablet && (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Tooltip title="Importar desde Excel">
              <Button
                variant="outlined"
                startIcon={<UploadFileRoundedIcon />}
                onClick={onImportExcel}
                id="header-import-btn"
                size="small"
                sx={{ borderColor: alpha('#6366f1', 0.4) }}
              >
                Importar
              </Button>
            </Tooltip>

            <Tooltip title={totalPersons === 0 ? 'No hay datos para exportar' : 'Exportar a Excel'}>
              <span>
                <Button
                  variant="outlined"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={onExportExcel}
                  id="header-export-btn"
                  size="small"
                  disabled={totalPersons === 0 || isExporting}
                  sx={{ borderColor: alpha('#34d399', 0.4), color: 'success.main' }}
                >
                  {isExporting ? 'Exportando...' : 'Exportar'}
                </Button>
              </span>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<PersonAddAlt1RoundedIcon />}
              onClick={onAddPerson}
              id="header-add-person-btn"
              size="small"
            >
              Nueva Persona
            </Button>
          </Box>
        )}

        {/* Botones compactos — Tablet/Mobile */}
        {isTablet && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title="Nueva persona">
              <IconButton
                onClick={onAddPerson}
                id="header-add-person-icon-btn"
                sx={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: 'white',
                  '&:hover': { background: 'linear-gradient(135deg, #818cf8, #6366f1)' },
                }}
              >
                <PersonAddAlt1RoundedIcon />
              </IconButton>
            </Tooltip>

            <IconButton
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              id="header-more-btn"
              sx={{ color: 'text.secondary' }}
            >
              <MoreVertRoundedIcon />
            </IconButton>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    border: `1px solid ${alpha('#6366f1', 0.2)}`,
                    minWidth: 200,
                  },
                }
              }}
            >
              <MenuItem onClick={() => { onImportExcel(); setMenuAnchor(null); }} id="mobile-import-btn">
                <ListItemIcon><UploadFileRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} /></ListItemIcon>
                Importar Excel
              </MenuItem>
              <MenuItem
                onClick={() => { onExportExcel(); setMenuAnchor(null); }}
                disabled={totalPersons === 0}
                id="mobile-export-btn"
              >
                <ListItemIcon><DownloadRoundedIcon fontSize="small" sx={{ color: 'success.main' }} /></ListItemIcon>
                Exportar Excel
              </MenuItem>
              <MenuItem
                onClick={() => { onClearAll(); setMenuAnchor(null); }}
                disabled={totalPersons === 0}
                id="mobile-clear-btn"
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon><DeleteSweepRoundedIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                Limpiar todo
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
