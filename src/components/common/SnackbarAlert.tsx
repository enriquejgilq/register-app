// ============================================================
// SnackbarAlert — Notificaciones de éxito, error, info
// ============================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';

interface SnackbarMessage {
  id: number;
  message: string;
  severity: AlertColor;
  duration?: number;
}

interface SnackbarContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

let messageIdCounter = 0;

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);

  const addMessage = useCallback((message: string, severity: AlertColor, duration = 4000) => {
    const id = ++messageIdCounter;
    setMessages((prev) => [...prev, { id, message, severity, duration }]);
  }, []);

  const removeMessage = useCallback((id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const showSuccess = useCallback((msg: string) => addMessage(msg, 'success'), [addMessage]);
  const showError = useCallback((msg: string) => addMessage(msg, 'error', 6000), [addMessage]);
  const showWarning = useCallback((msg: string) => addMessage(msg, 'warning'), [addMessage]);
  const showInfo = useCallback((msg: string) => addMessage(msg, 'info'), [addMessage]);

  return (
    <SnackbarContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      {messages.map((msg) => (
        <Snackbar
          key={msg.id}
          open
          autoHideDuration={msg.duration}
          onClose={() => removeMessage(msg.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ mb: messages.indexOf(msg) * 8 }}
        >
          <Alert
            severity={msg.severity}
            variant="filled"
            onClose={() => removeMessage(msg.id)}
            sx={{
              minWidth: 320,
              maxWidth: 500,
              fontWeight: 500,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            {msg.message}
          </Alert>
        </Snackbar>
      ))}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error('useSnackbar debe usarse dentro de <SnackbarProvider>');
  }
  return ctx;
}
