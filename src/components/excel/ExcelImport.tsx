// ============================================================
// ExcelImport — Componente de importación de Excel
// ============================================================

import React, { useRef, useState } from 'react';
import {
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Collapse,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
} from '@mui/material';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import type { ImportResult } from '../../models/Person';

interface ExcelImportProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<{ imported: number; errors: ImportResult['errors'] } | null>;
  onDownloadTemplate: () => void;
  isLoading?: boolean;
}

export const ExcelImport: React.FC<ExcelImportProps> = ({
  open,
  onClose,
  onImport,
  onDownloadTemplate,
  isLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ imported: number; errors: ImportResult['errors'] } | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    const data = await onImport(selectedFile);
    if (data) {
      setResult(data);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    setShowErrors(false);
    onClose();
  };

  const hasResult = result !== null;
  const hasErrors = (result?.errors?.length ?? 0) > 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: 2,
                background: (theme) => alpha(theme.palette.success.main, 0.15),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <UploadFileRoundedIcon sx={{ color: 'success.main', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>Importar desde Excel</Typography>
              <Typography variant="caption" color="text.secondary">
                Sube un archivo .xlsx con los datos de personas
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ color: 'text.secondary' }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: (theme) => alpha(theme.palette.primary.main, 0.1) }} />

      <DialogContent sx={{ pt: 3 }}>
        {/* Zona drag & drop */}
        {!hasResult && (
          <Box
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: isDragging
                ? 'primary.main'
                : selectedFile
                ? 'success.main'
                : (theme) => alpha(theme.palette.primary.main, 0.3),
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging
                ? (theme) => alpha(theme.palette.primary.main, 0.06)
                : selectedFile
                ? (theme) => alpha(theme.palette.success.main, 0.06)
                : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                background: (theme) => alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            <UploadFileRoundedIcon
              sx={{
                fontSize: 48,
                color: selectedFile ? 'success.main' : 'text.disabled',
                mb: 1,
                transition: 'color 0.2s',
              }}
            />

            {selectedFile ? (
              <>
                <Typography variant="subtitle1" fontWeight={700} color="success.main">
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(selectedFile.size / 1024).toFixed(1)} KB · Haz clic para cambiar archivo
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                  {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo Excel aquí'}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  o haz clic para seleccionar · Solo .xlsx y .xls
                </Typography>
              </>
            )}
          </Box>
        )}

        {/* Progress */}
        {isLoading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Procesando archivo...
            </Typography>
          </Box>
        )}

        {/* Resultado */}
        {hasResult && (
          <Box sx={{ mt: 1 }}>
            {result!.imported > 0 && (
              <Alert severity="success" icon={<CheckCircleRoundedIcon />} sx={{ mb: 2 }}>
                <AlertTitle>Importación exitosa</AlertTitle>
                Se importaron <strong>{result!.imported}</strong> persona(s) correctamente.
              </Alert>
            )}

            {hasErrors && (
              <Alert
                severity={result!.imported > 0 ? 'warning' : 'error'}
                action={
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => setShowErrors((v) => !v)}
                    endIcon={showErrors ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                  >
                    {showErrors ? 'Ocultar' : 'Ver errores'}
                  </Button>
                }
              >
                <AlertTitle>
                  {result!.errors.length} fila(s) con errores
                </AlertTitle>
                Algunas filas no pudieron importarse.
              </Alert>
            )}

            <Collapse in={showErrors}>
              <List dense sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                {result?.errors.map((err, i) => (
                  <ListItem key={i} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ErrorRoundedIcon sx={{ fontSize: 16, color: 'error.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={`Fila ${err.row}`} size="small" color="error" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                          <Typography variant="caption">{err.message}</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        )}

        {/* Plantilla */}
        {!hasResult && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              ¿Primera vez? Descarga la plantilla Excel
            </Typography>
            <Button
              size="small"
              variant="text"
              startIcon={<DownloadRoundedIcon />}
              onClick={onDownloadTemplate}
              id="excel-download-template-btn"
            >
              Descargar plantilla
            </Button>
          </Box>
        )}
      </DialogContent>

      <Divider sx={{ borderColor: (theme) => alpha(theme.palette.primary.main, 0.1) }} />

      <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
        <Button variant="outlined" onClick={handleClose} id="excel-import-cancel-btn">
          {hasResult ? 'Cerrar' : 'Cancelar'}
        </Button>

        {!hasResult && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={!selectedFile || isLoading}
            startIcon={<UploadFileRoundedIcon />}
            id="excel-import-confirm-btn"
            sx={{ minWidth: 140 }}
          >
            Importar
          </Button>
        )}

        {hasResult && (
          <Button
            variant="outlined"
            onClick={() => { setSelectedFile(null); setResult(null); setShowErrors(false); }}
            id="excel-import-again-btn"
          >
            Importar otro
          </Button>
        )}
      </DialogActions>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
        id="excel-file-input"
      />
    </Dialog>
  );
};
