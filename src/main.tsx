// ============================================================
// main.tsx — Punto de entrada de la aplicación
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppThemeProvider } from './theme/AppThemeProvider';
import { SnackbarProvider } from './components/common/SnackbarAlert';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <SnackbarProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SnackbarProvider>
    </AppThemeProvider>
  </React.StrictMode>
);
