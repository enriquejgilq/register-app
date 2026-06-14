// ============================================================
// PersonTable — Tabla principal con paginación y acciones
// ============================================================

import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Badge,
  alpha,
  Skeleton,
  TableSortLabel,
  Zoom,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import RestoreFromTrashRoundedIcon from '@mui/icons-material/RestoreFromTrashRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import ImageNotSupportedRoundedIcon from '@mui/icons-material/ImageNotSupportedRounded';
import type { Person } from '../../models/Person';
import { getInitials, truncate } from '../../utils/formatters';
import { ConfirmDialog } from '../common/ConfirmDialog';

type SortField = 'nombre' | 'apellido' | 'cedula' | 'correo';
type SortOrder = 'asc' | 'desc';

interface PersonTableProps {
  persons: Person[];
  total: number;
  page: number;
  pageSize: number;
  isLoading?: boolean;
  mode?: 'normal' | 'trash';
  onEdit?: (person: Person) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const PersonTable: React.FC<PersonTableProps> = ({
  persons,
  total,
  page,
  pageSize,
  isLoading = false,
  mode = 'normal',
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  onPageChange,
  onPageSizeChange,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<Person | null>(null);
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedPersons = [...persons].sort((a, b) => {
    const aVal = (a[sortField] ?? '').toLowerCase();
    const bVal = (b[sortField] ?? '').toLowerCase();
    return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const columns = [
    { id: 'foto', label: 'Foto', width: 70, sortable: false },
    { id: 'nombre', label: 'Nombre', sortable: true },
    { id: 'apellido', label: 'Apellido', sortable: true },
    { id: 'cedula', label: 'Cédula', sortable: true },
    { id: 'telefono', label: 'Teléfono', sortable: false },
    { id: 'rif', label: 'RIF', sortable: false },
    { id: 'correo', label: 'Correo', sortable: true },
    { id: 'acciones', label: 'Acciones', width: 100, sortable: false },
  ];

  if (isLoading) {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id}>{col.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.id}>
                    <Skeleton variant={col.id === 'foto' ? 'circular' : 'text'} width={col.id === 'foto' ? 40 : '80%'} height={col.id === 'foto' ? 40 : 20} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (persons.length === 0) {
    return (
      <Paper
        sx={{
          p: 8,
          textAlign: 'center',
          borderRadius: 3,
          border: '2px dashed',
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.15),
        }}
      >
        <BadgeRoundedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }} gutterBottom>
          {mode === 'trash' ? 'La papelera está vacía' : 'No hay registros'}
        </Typography>
        <Typography variant="body2" color="text.disabled">
          {mode === 'trash'
            ? 'Los registros eliminados aparecerán aquí'
            : 'Agrega personas manualmente o importa un archivo Excel'}
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{ width: col.width ?? 'auto' }}
                  sortDirection={sortField === col.id ? sortOrder : false}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortField === col.id}
                      direction={sortField === col.id ? sortOrder : 'asc'}
                      onClick={() => handleSortChange(col.id as SortField)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedPersons.map((person, index) => (
              <Zoom
                in
                style={{ transitionDelay: `${Math.min(index * 30, 150)}ms` }}
                key={person.id}
              >
                <TableRow id={`person-row-${person.id}`}>
                  {/* Foto */}
                  <TableCell>
                    <Tooltip
                      title={person.fotoBase64 ? 'Ver foto completa' : 'Sin foto'}
                      placement="right"
                    >
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          !person.fotoBase64 ? (
                            <ImageNotSupportedRoundedIcon
                              sx={{ fontSize: 12, color: 'text.disabled' }}
                            />
                          ) : null
                        }
                      >
                        <Avatar
                          src={person.fotoBase64}
                          onClick={() =>
                            person.fotoBase64 && setPreviewImage(person.fotoBase64)
                          }
                          sx={{
                            width: 42,
                            height: 42,
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            background: person.fotoBase64
                              ? 'transparent'
                              : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            cursor: person.fotoBase64 ? 'pointer' : 'default',
                            transition: 'transform 0.2s ease',
                            '&:hover': person.fotoBase64
                              ? { transform: 'scale(1.1)' }
                              : {},
                          }}
                        >
                          {getInitials(person.nombre, person.apellido)}
                        </Avatar>
                      </Badge>
                    </Tooltip>
                  </TableCell>

                  {/* Nombre */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {person.nombre}
                    </Typography>
                  </TableCell>

                  {/* Apellido */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {person.apellido}
                    </Typography>
                  </TableCell>

                  {/* Cédula */}
                  <TableCell>
                    <Chip
                      icon={<BadgeRoundedIcon />}
                      label={person.cedula}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                        color: 'primary.light',
                      }}
                    />
                  </TableCell>

                  {/* Teléfono */}
                  <TableCell>
                    {person.telefono ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneRoundedIcon sx={{ fontSize: 14, color: 'success.main' }} />
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {person.telefono}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.disabled">—</Typography>
                    )}
                  </TableCell>

                  {/* RIF */}
                  <TableCell>
                    {person.rif ? (
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {person.rif}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled">—</Typography>
                    )}
                  </TableCell>

                  {/* Correo */}
                  <TableCell>
                    {person.correo ? (
                      <Tooltip title={person.correo}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailRoundedIcon sx={{ fontSize: 14, color: 'info.main' }} />
                          <Typography variant="body2">
                            {truncate(person.correo, 25)}
                          </Typography>
                        </Box>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.disabled">—</Typography>
                    )}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {mode === 'trash' ? (
                        <>
                          <Tooltip title="Restaurar">
                            <IconButton
                              size="small"
                              onClick={() => onRestore?.(person.id)}
                              id={`restore-btn-${person.id}`}
                              sx={{
                                color: 'success.main',
                                '&:hover': {
                                  background: (theme) => alpha(theme.palette.success.main, 0.12),
                                },
                              }}
                            >
                              <RestoreFromTrashRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Eliminar permanentemente">
                            <IconButton
                              size="small"
                              onClick={() => setDeleteTarget(person)}
                              id={`permanent-delete-btn-${person.id}`}
                              sx={{
                                color: 'error.main',
                                '&:hover': {
                                  background: (theme) => alpha(theme.palette.error.main, 0.12),
                                },
                              }}
                            >
                              <DeleteForeverRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => onEdit?.(person)}
                              id={`edit-btn-${person.id}`}
                              sx={{
                                color: 'primary.main',
                                '&:hover': {
                                  background: (theme) => alpha(theme.palette.primary.main, 0.12),
                                },
                              }}
                            >
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              onClick={() => setDeleteTarget(person)}
                              id={`delete-btn-${person.id}`}
                              sx={{
                                color: 'error.main',
                                '&:hover': {
                                  background: (theme) => alpha(theme.palette.error.main, 0.12),
                                },
                              }}
                            >
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              </Zoom>
            ))}
          </TableBody>
        </Table>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          sx={{
            borderTop: '1px solid',
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
          }}
        />
      </TableContainer>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={mode === 'trash' ? 'Eliminar permanentemente' : 'Eliminar persona'}
        message={
          mode === 'trash'
            ? `¿Estás seguro de que deseas eliminar permanentemente a "${deleteTarget?.nombre} ${deleteTarget?.apellido}"? Esta acción no se puede deshacer y el registro se borrará para siempre.`
            : `¿Estás seguro de que deseas eliminar a "${deleteTarget?.nombre} ${deleteTarget?.apellido}"? El registro se moverá a la papelera.`
        }
        confirmLabel="Eliminar"
        severity="error"
        onConfirm={() => {
          if (deleteTarget) {
            if (mode === 'trash') {
              onPermanentDelete?.(deleteTarget.id);
            } else {
              onDelete?.(deleteTarget.id);
            }
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Preview de imagen full-screen */}
      {previewImage && (
        <Box
          onClick={() => setPreviewImage(null)}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            backdropFilter: 'blur(8px)',
          }}
        >
          <img
            src={previewImage}
            alt="Foto de cédula"
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              borderRadius: 16,
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              objectFit: 'contain',
            }}
          />
        </Box>
      )}
    </>
  );
};
