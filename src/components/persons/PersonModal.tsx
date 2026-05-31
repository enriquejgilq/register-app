// ============================================================
// PersonModal — Formulario de crear/editar persona
// ============================================================

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  IconButton,
  Divider,
  Alert,
  alpha,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personSchema, type PersonSchemaType } from '../../utils/validators';
import type { Person, PersonCreateInput } from '../../models/Person';
import { ImageUpload } from './ImageUpload';

interface PersonModalProps {
  open: boolean;
  editPerson?: Person | null;
  existingPersons?: Person[];
  onSave: (data: PersonCreateInput) => void;
  onClose: () => void;
}

const defaultValues: PersonSchemaType = {
  nombre: '',
  apellido: '',
  cedula: '',
  telefono: '',
  rif: '',
  correo: '',
  fotoBase64: '',
  fotoNombre: '',
};

export const PersonModal: React.FC<PersonModalProps> = ({
  open,
  editPerson,
  existingPersons = [],
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(editPerson);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PersonSchemaType>({
    resolver: zodResolver(personSchema),
    defaultValues,
    mode: 'onTouched',        // Muestra errores al salir de cada campo
    reValidateMode: 'onChange', // Re-valida mientras se escribe tras un error
  });

  const nombre = watch('nombre');
  const apellido = watch('apellido');

  // Cargar datos cuando editamos
  useEffect(() => {
    if (open) {
      if (editPerson) {
        reset({
          nombre: editPerson.nombre,
          apellido: editPerson.apellido,
          cedula: editPerson.cedula,
          telefono: editPerson.telefono ?? '',
          rif: editPerson.rif ?? '',
          correo: editPerson.correo ?? '',
          fotoBase64: editPerson.fotoBase64 ?? '',
          fotoNombre: editPerson.fotoNombre ?? '',
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, editPerson, reset]);

  const onSubmit = (data: PersonSchemaType) => {
    // Validar cédula única
    const cedulaNormalizada = data.cedula.trim().toLowerCase();
    const isDuplicate = existingPersons.some(p => 
      p.cedula.trim().toLowerCase() === cedulaNormalizada && 
      p.id !== editPerson?.id
    );

    if (isDuplicate) {
      setError('cedula', { 
        type: 'manual', 
        message: 'Esta cédula ya está registrada en el sistema' 
      });
      return;
    }

    onSave({
      nombre: data.nombre,
      apellido: data.apellido,
      cedula: data.cedula,
      telefono: data.telefono ?? '',
      rif: data.rif ?? '',
      correo: data.correo ?? '',
      fotoBase64: data.fotoBase64 ?? '',
      fotoNombre: data.fotoNombre ?? '',
    });
  };

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3 },
        }
      }}
    >
      {/* Header del modal */}
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: (theme) => alpha(theme.palette.primary.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isEditing ? (
                <EditRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              ) : (
                <PersonAddAlt1RoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              )}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {isEditing ? 'Editar Persona' : 'Nueva Persona'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isEditing
                  ? `Editando: ${editPerson?.nombre} ${editPerson?.apellido}`
                  : 'Completa los campos para registrar una nueva persona'}
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={handleClose}
            id="person-modal-close-btn"
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: (theme) => alpha(theme.palette.primary.main, 0.15) }} />

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Columna izquierda — Foto */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="fotoBase64"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  value={field.value}
                  nombre={nombre}
                  apellido={apellido}
                  onChange={(base64, fileName) => {
                    field.onChange(base64);
                    setValue('fotoNombre', fileName);
                  }}
                  onRemove={() => {
                    field.onChange('');
                    setValue('fotoNombre', '');
                  }}
                />
              )}
            />
          </Grid>

          {/* Columna derecha — Datos */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={2}>
              {/* Nombre */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="nombre"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nombre *"
                      fullWidth
                      error={Boolean(errors.nombre)}
                      helperText={errors.nombre?.message}
                      id="person-modal-nombre"
                      autoFocus={!isEditing}
                    />
                  )}
                />
              </Grid>

              {/* Apellido */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="apellido"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Apellido *"
                      fullWidth
                      error={Boolean(errors.apellido)}
                      helperText={errors.apellido?.message}
                      id="person-modal-apellido"
                    />
                  )}
                />
              </Grid>

              {/* Cédula */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="cedula"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Cédula de Identidad *"
                      fullWidth
                      placeholder="V-12345678"
                      error={Boolean(errors.cedula)}
                      helperText={errors.cedula?.message ?? 'Ej: V-12345678, E-12345678'}
                      id="person-modal-cedula"
                    />
                  )}
                />
              </Grid>

              {/* Teléfono */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="telefono"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Teléfono"
                      fullWidth
                      placeholder="0412-1234567"
                      error={Boolean(errors.telefono)}
                      helperText={errors.telefono?.message ?? 'Ej: 0412-1234567'}
                      id="person-modal-telefono"
                    />
                  )}
                />
              </Grid>

              {/* RIF */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="rif"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="RIF"
                      fullWidth
                      placeholder="J-12345678-9"
                      error={Boolean(errors.rif)}
                      helperText={errors.rif?.message ?? 'Ej: J-12345678-9, V-12345678-0'}
                      id="person-modal-rif"
                    />
                  )}
                />
              </Grid>

              {/* Correo */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="correo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Correo Electrónico"
                      fullWidth
                      type="email"
                      placeholder="ejemplo@correo.com"
                      error={Boolean(errors.correo)}
                      helperText={errors.correo?.message}
                      id="person-modal-correo"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Resumen de errores cuando el usuario intenta guardar */}
      {Object.keys(errors).filter(k => !['fotoBase64','fotoNombre'].includes(k)).length > 0 && (
        <Alert
          severity="error"
          sx={{
            mx: 3,
            mb: 1,
            borderRadius: 2,
            fontSize: '0.8rem',
          }}
        >
          <strong>Corrige los siguientes campos:</strong>
          <ul style={{ margin: '4px 0 0 0', paddingLeft: 16 }}>
            {errors.nombre && <li>Nombre: {errors.nombre.message}</li>}
            {errors.apellido && <li>Apellido: {errors.apellido.message}</li>}
            {errors.cedula && <li>Cédula: {errors.cedula.message}</li>}
            {errors.telefono && <li>Teléfono: {errors.telefono.message}</li>}
            {errors.rif && <li>RIF: {errors.rif.message}</li>}
            {errors.correo && <li>Correo: {errors.correo.message}</li>}
          </ul>
        </Alert>
      )}

      <Divider sx={{ borderColor: (theme) => alpha(theme.palette.primary.main, 0.1) }} />

      <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          id="person-modal-cancel-btn"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveRoundedIcon />}
          id="person-modal-save-btn"
          disabled={isSubmitting}
          onClick={() => void handleSubmit(onSubmit)()}
          sx={{ minWidth: 140 }}
        >
          {isEditing ? 'Guardar Cambios' : 'Registrar Persona'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
