// ============================================================
// PersonsTrashPage — Papelera de personas eliminadas
// ============================================================

import { useMemo, useState } from 'react';
import { Box, Container, Fade, Typography, alpha } from '@mui/material';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import { PersonTable } from '../components/persons/PersonTable';
import { useSnackbar } from '../components/common/SnackbarAlert';
import { usePersons } from '../hooks/usePersons';

export default function PersonsTrashPage() {
  const { showSuccess, showError } = useSnackbar();

  const {
    deletedPersons,
    isLoading,
    restorePerson,
    permanentlyDeletePerson,
  } = usePersons();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const paginatedPersons = useMemo(() => {
    const start = page * pageSize;
    return deletedPersons.slice(start, start + pageSize);
  }, [deletedPersons, page, pageSize]);

  const handleRestore = async (id: string) => {
    try {
      await restorePerson(id);
      showSuccess('Registro restaurado');
    } catch {
      showError('Error al restaurar el registro');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await permanentlyDeletePerson(id);
      showSuccess('Registro eliminado permanentemente');
    } catch {
      showError('Error al eliminar permanentemente el registro');
    }
  };

  return (
    <Fade in timeout={400}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 3,
            py: 2.5,
            borderBottom: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              flexShrink: 0,
            }}
          >
            <DeleteSweepRoundedIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Papelera
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Registros eliminados — restaura o elimina permanentemente
            </Typography>
          </Box>
        </Box>

        <Container maxWidth="xl" sx={{ flex: 1, px: '0 !important', mt: 3 }}>
          <PersonTable
            persons={paginatedPersons}
            total={deletedPersons.length}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
            mode="trash"
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
          />
        </Container>
      </Box>
    </Fade>
  );
}
