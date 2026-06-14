// ============================================================
// AppThemeProvider — Aplica el modo claro/oscuro según la
// preferencia del usuario (Firebase) o la última usada (localStorage)
// ============================================================

import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createAppTheme } from './theme';
import { useAuthStore } from '../store/authStore';
import type { ThemeMode } from '../models/Company';

const STORAGE_KEY = 'themeMode';

const getStoredThemeMode = (): ThemeMode => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' ? 'light' : 'dark';
};

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userThemePreference = useAuthStore((s) => s.userProfile?.themePreference);
  const [mode, setMode] = useState<ThemeMode>(getStoredThemeMode);

  // Sincronizar con la preferencia guardada en el perfil del usuario
  useEffect(() => {
    if (userThemePreference && userThemePreference !== mode) {
      setMode(userThemePreference);
      localStorage.setItem(STORAGE_KEY, userThemePreference);
    }
  }, [userThemePreference, mode]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
