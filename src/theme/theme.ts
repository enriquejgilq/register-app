// ============================================================
// MUI Theme — Modos claro/oscuro con paleta índigo/violet
// ============================================================

import { createTheme, alpha, type Theme } from '@mui/material/styles';
import type { ThemeMode } from '../models/Company';

declare module '@mui/material/styles' {
  interface Palette {
    glass: {
      background: string;
      border: string;
    };
    gradients: {
      page: string;
      card: string;
      tooltip: string;
    };
  }
  interface PaletteOptions {
    glass?: {
      background?: string;
      border?: string;
    };
    gradients?: {
      page?: string;
      card?: string;
      tooltip?: string;
    };
  }
}

const sharedTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 800, letterSpacing: '-0.025em' },
  h2: { fontWeight: 700, letterSpacing: '-0.02em' },
  h3: { fontWeight: 700, letterSpacing: '-0.015em' },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  subtitle1: { fontWeight: 500 },
  subtitle2: { fontWeight: 500 },
  body1: { lineHeight: 1.7 },
  body2: { lineHeight: 1.6 },
  button: { fontWeight: 600, letterSpacing: '0.025em', textTransform: 'none' as const },
};

const sharedShape = {
  borderRadius: 12,
};

const sharedShadows = [
  'none',
  '0 1px 3px rgba(0,0,0,0.4)',
  '0 4px 6px rgba(0,0,0,0.4)',
  '0 10px 15px rgba(0,0,0,0.4)',
  '0 20px 25px rgba(0,0,0,0.4)',
  '0 25px 50px rgba(0,0,0,0.5)',
  ...Array(19).fill('none'),
] as Theme['shadows'];

export const createAppTheme = (mode: ThemeMode = 'dark') => {
  const isDark = mode === 'dark';

  const background = {
    default: isDark ? '#0f0f1a' : '#f1f3f9',
    paper: isDark ? '#1a1a2e' : '#ffffff',
  };

  const text = {
    primary: isDark ? '#e2e8f0' : '#1e293b',
    secondary: isDark ? '#94a3b8' : '#64748b',
    disabled: isDark ? '#475569' : '#cbd5e1',
  };

  const gradients = {
    page: isDark
      ? 'linear-gradient(135deg, #0f0f1a 0%, #0d0d2b 50%, #0f0f1a 100%)'
      : 'linear-gradient(135deg, #eef1fb 0%, #f7f8fd 50%, #eef1fb 100%)',
    card: isDark
      ? 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)'
      : 'linear-gradient(145deg, #ffffff 0%, #f1f3fb 100%)',
    tooltip: isDark ? '#1e1e3a' : '#312e81',
  };

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#6366f1',      // Indigo
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#a78bfa',      // Violet
        light: '#c4b5fd',
        dark: '#7c3aed',
        contrastText: '#ffffff',
      },
      error: {
        main: '#f87171',
        light: '#fca5a5',
        dark: '#ef4444',
      },
      warning: {
        main: '#fbbf24',
        light: '#fcd34d',
        dark: '#f59e0b',
      },
      success: {
        main: '#34d399',
        light: '#6ee7b7',
        dark: '#10b981',
      },
      info: {
        main: '#60a5fa',
        light: '#93c5fd',
        dark: '#3b82f6',
      },
      background,
      text,
      divider: alpha('#6366f1', isDark ? 0.15 : 0.12),
      glass: {
        background: alpha('#6366f1', isDark ? 0.08 : 0.05),
        border: alpha('#6366f1', isDark ? 0.2 : 0.15),
      },
      gradients,
    },

    typography: {
      ...sharedTypography,
      subtitle2: { ...sharedTypography.subtitle2, color: text.secondary },
    },

    shape: sharedShape,

    shadows: sharedShadows,

    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

          * {
            scrollbar-width: thin;
            scrollbar-color: #6366f1 ${background.paper};
          }

          *::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          *::-webkit-scrollbar-track {
            background: ${background.paper};
          }

          *::-webkit-scrollbar-thumb {
            background-color: #6366f1;
            border-radius: 3px;
          }

          body {
            background: ${gradients.page};
            min-height: 100vh;
          }
        `,
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 20px',
            transition: 'all 0.2s ease',
          },
          contained: {
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          outlined: {
            borderColor: alpha('#6366f1', 0.4),
            '&:hover': {
              borderColor: '#6366f1',
              background: alpha('#6366f1', 0.08),
            },
          },
          text: {
            '&:hover': {
              background: alpha('#6366f1', 0.08),
            },
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: background.paper,
            border: `1px solid ${alpha('#6366f1', isDark ? 0.12 : 0.1)}`,
            transition: 'border-color 0.2s ease',
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: alpha('#6366f1', isDark ? 0.1 : 0.08),
            padding: '12px 16px',
          },
          head: {
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: text.secondary,
            background: alpha('#6366f1', isDark ? 0.08 : 0.06),
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.15s ease',
            '&:nth-of-type(even)': {
              backgroundColor: alpha('#6366f1', isDark ? 0.04 : 0.03),
            },
            '&:hover': {
              backgroundColor: `${alpha('#6366f1', isDark ? 0.1 : 0.08)} !important`,
            },
          },
        },
      },

      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'small' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              transition: 'all 0.2s ease',
              '& fieldset': {
                borderColor: alpha('#6366f1', isDark ? 0.2 : 0.18),
              },
              '&:hover fieldset': {
                borderColor: alpha('#6366f1', 0.5),
              },
              '&.Mui-focused fieldset': {
                borderColor: '#6366f1',
                boxShadow: `0 0 0 3px ${alpha('#6366f1', 0.12)}`,
              },
            },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: '0.72rem',
            borderRadius: 8,
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            background: gradients.card,
            border: `1px solid ${alpha('#6366f1', isDark ? 0.25 : 0.15)}`,
            boxShadow: isDark
              ? `0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px ${alpha('#6366f1', 0.1)}`
              : `0 25px 60px rgba(99,102,241,0.15), 0 0 0 1px ${alpha('#6366f1', 0.08)}`,
            backdropFilter: 'blur(20px)',
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: {
            background: `linear-gradient(135deg, ${alpha('#6366f1', isDark ? 0.15 : 0.1)} 0%, transparent 100%)`,
            borderBottom: `1px solid ${alpha('#6366f1', isDark ? 0.15 : 0.12)}`,
            padding: '20px 24px',
          },
        },
      },

      MuiSnackbar: {
        defaultProps: {
          anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: gradients.tooltip,
            border: `1px solid ${alpha('#6366f1', 0.3)}`,
            fontSize: '0.8rem',
            color: '#e2e8f0',
          },
          arrow: {
            color: gradients.tooltip,
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: alpha('#6366f1', isDark ? 0.15 : 0.12),
          },
          bar: {
            borderRadius: 4,
            background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
          },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            border: '1px solid',
          },
        },
      },
    },
  });
};

export const theme = createAppTheme('dark');
