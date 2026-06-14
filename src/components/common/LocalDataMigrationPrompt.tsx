// ============================================================
// LocalDataMigrationPrompt — Diálogo para migrar datos locales
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { CloudUploadOutlined } from '@mui/icons-material';
import { usePersonStore } from '../../store/personStore';
import { useAuthStore } from '../../store/authStore';
import type { Person } from '../../models/Person';

const PERSONS_STORAGE_KEY = 'registro-personas:persons';

export const LocalDataMigrationPrompt: React.FC = () => {
  const { company } = useAuthStore();
  const { persons, importPersons, isLoading } = usePersonStore();
  
  const [open, setOpen] = useState(false);
  const [localItems, setLocalItems] = useState<Person[]>([]);

  useEffect(() => {
    // Solo verificar si el usuario tiene una empresa cargada y no hay personas en Firestore
    if (!company || persons.length > 0 || isLoading) return;

    try {
      const raw = localStorage.getItem(PERSONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Person[];
        if (parsed && parsed.length > 0) {
          setLocalItems(parsed);
          setOpen(true);
        }
      }
    } catch (err) {
      console.error('Error al leer datos locales obsoletos:', err);
    }
  }, [company, persons, isLoading]);

  const handleMigrate = async () => {
    if (!company) return;

    try {
      // Mapear al tipo de entrada esperado (omitir campos de sistema anteriores)
      const cleanInput = localItems.map((p) => ({
        nombre: p.nombre || '',
        apellido: p.apellido || '',
        cedula: p.cedula || '',
        telefono: p.telefono || '',
        rif: p.rif || '',
        correo: p.correo || '',
        fotoBase64: p.fotoBase64,
        fotoNombre: p.fotoNombre,
      }));

      await importPersons(cleanInput, company.id, false);

      // Limpiar LocalStorage una vez completado con éxito
      localStorage.removeItem(PERSONS_STORAGE_KEY);
      setOpen(false);
    } catch (err) {
      console.error('Error durante la migración de datos locales:', err);
    }
  };

  const handleDismiss = () => {
    // Si decide no migrar, igual limpiamos el localStorage para no molestarlo de nuevo
    localStorage.removeItem(PERSONS_STORAGE_KEY);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleDismiss}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <CloudUploadOutlined color="primary" sx={{ fontSize: 28 }} />
        Migración de Datos Locales Detectada
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Hemos detectado <strong>{localItems.length} registros</strong> de personas guardados localmente en este navegador que pertenecen a la versión anterior.
        </DialogContentText>
        <DialogContentText>
          ¿Deseas subirlos y migrarlos a la nube de tu nueva empresa <strong>"{company?.name}"</strong>? Esto te permitirá compartirlos con tus colaboradores y evitar perderlos si limpias la caché del navegador.
        </DialogContentText>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Subiendo registros a Firestore...
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button onClick={handleDismiss} color="inherit" disabled={isLoading}>
          Descartar Datos Locales
        </Button>
        <Button
          onClick={handleMigrate}
          variant="contained"
          disabled={isLoading}
          startIcon={<CloudUploadOutlined />}
        >
          Migrar a la Nube
        </Button>
      </DialogActions>
    </Dialog>
  );
};
