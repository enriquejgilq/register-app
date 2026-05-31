// ============================================================
// ConfirmDialog — Modal de confirmación de eliminación
// ============================================================

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  alpha,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'warning' | 'error';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  severity = 'warning',
  onConfirm,
  onCancel,
}) => {
  const color = severity === 'error' ? '#f87171' : '#fbbf24';

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: `1px solid ${alpha(color, 0.3)}`,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: alpha(color, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <WarningAmberRoundedIcon sx={{ color, fontSize: 22 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary' }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.8 }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          id="confirm-dialog-cancel-btn"
          sx={{ flex: 1 }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          id="confirm-dialog-confirm-btn"
          sx={{
            flex: 1,
            background: severity === 'error'
              ? 'linear-gradient(135deg, #f87171, #ef4444)'
              : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            color: severity === 'error' ? '#fff' : '#000',
            '&:hover': {
              background: severity === 'error'
                ? 'linear-gradient(135deg, #fca5a5, #f87171)'
                : 'linear-gradient(135deg, #fcd34d, #fbbf24)',
            },
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
