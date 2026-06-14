// ============================================================
// UserPreferences Component — Preferencias personales del usuario
// ============================================================

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  alpha,
} from '@mui/material';
import { LightModeOutlined, DarkModeOutlined, TuneOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { useSnackbar } from '../common/SnackbarAlert';
import type { ThemeMode } from '../../models/Company';

export const UserPreferences: React.FC = () => {
  const { userProfile, updateThemePreference } = useAuthStore();
  const { showSuccess, showError } = useSnackbar();

  const currentMode: ThemeMode = userProfile?.themePreference ?? 'dark';

  const handleChange = async (_: React.MouseEvent<HTMLElement>, newMode: ThemeMode | null) => {
    if (!newMode || newMode === currentMode) return;
    try {
      await updateThemePreference(newMode);
      showSuccess('✓ Preferencia de tema guardada');
    } catch {
      showError('No se pudo guardar la preferencia de tema');
    }
  };

  return (
    <Card sx={{ mb: 4, background: (theme) => theme.palette.gradients.card }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              backgroundColor: alpha('#6366f1', 0.15),
              color: 'primary.main',
              display: 'flex',
            }}
          >
            <TuneOutlined fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Preferencias
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Personaliza tu experiencia. Se guarda en tu perfil.
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Apariencia
        </Typography>
        <ToggleButtonGroup value={currentMode} exclusive onChange={handleChange} size="small">
          <ToggleButton value="dark" sx={{ gap: 1, px: 2.5 }}>
            <DarkModeOutlined fontSize="small" /> Oscuro
          </ToggleButton>
          <ToggleButton value="light" sx={{ gap: 1, px: 2.5 }}>
            <LightModeOutlined fontSize="small" /> Claro
          </ToggleButton>
        </ToggleButtonGroup>
      </CardContent>
    </Card>
  );
};
