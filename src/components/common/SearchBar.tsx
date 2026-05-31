// ============================================================
// SearchBar — Barra de búsqueda multi-campo
// ============================================================

import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Chip,
  Tooltip,
  alpha,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalResults?: number;
  totalFiltered?: number;
  disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar por nombre, cédula, teléfono, RIF o correo...',
  totalResults,
  totalFiltered,
  disabled = false,
}) => {
  const showResults =
    totalResults !== undefined &&
    totalFiltered !== undefined &&
    value.trim() !== '';
  const isFiltering = showResults && totalFiltered !== totalResults;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
      <TextField
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        id="search-bar-input"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon
                sx={{
                  color: value ? 'primary.main' : 'text.disabled',
                  fontSize: 20,
                  transition: 'color 0.2s',
                }}
              />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <Tooltip title="Limpiar búsqueda">
                <IconButton
                  size="small"
                  onClick={() => onChange('')}
                  id="search-clear-btn"
                  sx={{ color: 'text.secondary' }}
                >
                  <ClearRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ) : null,
          sx: {
            borderRadius: 3,
            fontSize: '0.9rem',
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            background: (theme) => alpha(theme.palette.background.paper, 0.6),
          },
        }}
      />

      {showResults && (
        <Chip
          label={
            isFiltering
              ? `${totalFiltered} de ${totalResults}`
              : `${totalResults} registros`
          }
          size="small"
          color={isFiltering ? 'primary' : 'default'}
          variant={isFiltering ? 'filled' : 'outlined'}
          sx={{
            fontWeight: 600,
            whiteSpace: 'nowrap',
            fontSize: '0.72rem',
          }}
        />
      )}
    </Box>
  );
};
