// ============================================================
// ImageUpload — Carga y preview de foto de cédula
// ============================================================

import React, { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  alpha,
  Button,
} from '@mui/material';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import { fileToBase64, validateImageFile } from '../../services/imageService';
import { getInitials } from '../../utils/formatters';

interface ImageUploadProps {
  value?: string;
  nombre?: string;
  apellido?: string;
  onChange: (base64: string, fileName: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  nombre = '',
  apellido = '',
  onChange,
  onRemove,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error ?? 'Archivo inválido');
      return;
    }

    setIsLoading(true);
    try {
      const imageData = await fileToBase64(file);
      onChange(imageData.base64, imageData.nombre);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la imagen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input para poder cargar el mismo archivo de nuevo
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const initials = getInitials(nombre, apellido);

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600} mb={1} display="block">
        FOTO DE CÉDULA
      </Typography>

      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          p: 2,
          borderRadius: 3,
          border: '2px dashed',
          borderColor: isDragging
            ? 'primary.main'
            : error
            ? 'error.main'
            : (theme) => alpha(theme.palette.primary.main, 0.2),
          background: isDragging
            ? (theme) => alpha(theme.palette.primary.main, 0.08)
            : 'transparent',
          transition: 'all 0.2s ease',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        {/* Vista previa de imagen */}
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={value}
            sx={{
              width: 100,
              height: 100,
              fontSize: '2rem',
              fontWeight: 700,
              background: value
                ? 'transparent'
                : 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: '3px solid',
              borderColor: value ? 'primary.main' : 'transparent',
              boxShadow: value ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {isLoading ? (
              <CircularProgress size={30} sx={{ color: 'white' }} />
            ) : value ? null : initials ? (
              initials
            ) : (
              <BadgeRoundedIcon sx={{ fontSize: 36, color: 'rgba(255,255,255,0.7)' }} />
            )}
          </Avatar>

          {/* Botones de acción sobre la imagen */}
          {!disabled && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                '&:hover': { opacity: 1 },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip title="Cambiar foto">
                <IconButton
                  size="small"
                  onClick={() => inputRef.current?.click()}
                  id="image-upload-change-btn"
                  sx={{ color: 'white', background: 'rgba(99,102,241,0.8)' }}
                >
                  <PhotoCameraRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {value && (
                <Tooltip title="Eliminar foto">
                  <IconButton
                    size="small"
                    onClick={onRemove}
                    id="image-upload-remove-btn"
                    sx={{ color: 'white', background: 'rgba(239,68,68,0.8)' }}
                  >
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>

        {/* Texto de ayuda */}
        <Box textAlign="center">
          <Typography variant="caption" color="text.secondary">
            {isDragging
              ? 'Suelta la imagen aquí'
              : 'Arrastra una imagen o haz clic para seleccionar'}
          </Typography>
          <Typography variant="caption" color="text.disabled" display="block">
            JPG, PNG, WEBP · Máx. 5MB
          </Typography>
        </Box>

        {/* Botón explícito si no hay imagen */}
        {!value && !disabled && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PhotoCameraRoundedIcon />}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            id="image-upload-select-btn"
            sx={{ mt: 0.5 }}
          >
            Seleccionar foto
          </Button>
        )}
      </Box>

      {/* Mensaje de error */}
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleInputChange}
        id="image-upload-input"
      />
    </Box>
  );
};
