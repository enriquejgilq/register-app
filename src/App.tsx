// ============================================================
// App.tsx — Componente raíz con toda la lógica integrada
// ============================================================

import { useEffect, useState } from 'react';
import { Box, Container, Typography, alpha, Fade } from '@mui/material';
import { Header } from './components/layout/Header';
import { PersonTable } from './components/persons/PersonTable';
import { PersonModal } from './components/persons/PersonModal';
import { ExcelImport } from './components/excel/ExcelImport';
import { SearchBar } from './components/common/SearchBar';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { useSnackbar } from './components/common/SnackbarAlert';
import { usePersons } from './hooks/usePersons';
import { useExcel } from './hooks/useExcel';
import { usePersonStore } from './store/personStore';
import type { Person, PersonCreateInput } from './models/Person';

export default function App() {
  const { showSuccess, showError, showWarning, showInfo } = useSnackbar();

  // Inicializar store desde LocalStorage al montar
  const initialize = usePersonStore((s) => s.initialize);
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Hook principal de personas
  const {
    filteredPersons,
    paginatedPersons,
    totalPersons,
    totalFiltered,
    page,
    pageSize,
    setPage,
    setPageSize,
    searchQuery,
    setSearchQuery,
    isLoading,
    addPerson,
    updatePerson,
    deletePerson,
    importPersons,
    clearAll,
  } = usePersons({ pageSize: 10 });

  // Hook de Excel
  const {
    isImporting,
    isExporting,
    importFromFile,
    exportToExcel,
    downloadTemplate,
  } = useExcel();

  // Estado de modales
  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  // ─── Handlers de Persona ───────────────────────────────────

  const handleOpenAdd = () => {
    setEditingPerson(null);
    setPersonModalOpen(true);
  };

  const handleOpenEdit = (person: Person) => {
    setEditingPerson(person);
    setPersonModalOpen(true);
  };

  const handleSavePerson = (data: PersonCreateInput) => {
    try {
      if (editingPerson) {
        updatePerson(editingPerson.id, data);
        showSuccess(`✓ ${data.nombre} ${data.apellido} actualizado correctamente`);
      } else {
        addPerson(data);
        showSuccess(`✓ ${data.nombre} ${data.apellido} registrado correctamente`);
      }
      setPersonModalOpen(false);
      setEditingPerson(null);
    } catch {
      showError('Error al guardar el registro');
    }
  };

  const handleDeletePerson = (id: string) => {
    try {
      deletePerson(id);
      showSuccess('Registro eliminado');
    } catch {
      showError('Error al eliminar el registro');
    }
  };

  // ─── Handlers de Excel ─────────────────────────────────────

  const handleImport = async (file: File) => {
    const data = await importFromFile(file);
    if (!data) {
      showError('No se pudo importar el archivo');
      return null;
    }

    const { persons, result } = data;

    if (persons.length === 0 && result.errors.length === 0) {
      showWarning('El archivo no contiene datos válidos');
      return { imported: 0, errors: result.errors };
    }

    if (persons.length > 0) {
      importPersons(persons);
      showSuccess(
        `✓ Se importaron ${persons.length} persona(s). ${result.errors.length > 0 ? `${result.errors.length} fila(s) con errores.` : ''}`
      );
    }

    if (persons.length === 0 && result.errors.length > 0) {
      showError(`El archivo tiene ${result.errors.length} error(es) y no se importó ningún registro`);
    }

    return { imported: persons.length, errors: result.errors };
  };

  const handleExport = () => {
    if (totalPersons === 0) {
      showInfo('No hay registros para exportar');
      return;
    }
    try {
      exportToExcel(filteredPersons);
      showSuccess(`✓ Excel generado con ${filteredPersons.length} registro(s)`);
    } catch {
      showError('Error al generar el archivo Excel');
    }
  };

  const handleClearAll = () => {
    clearAll();
    setClearConfirmOpen(false);
    showSuccess('Todos los registros han sido eliminados');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Fondo decorativo */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '50%',
            height: '50%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-15%',
            left: '-10%',
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </Box>

      {/* Header */}
      <Header
        totalPersons={totalPersons}
        onAddPerson={handleOpenAdd}
        onImportExcel={() => setImportModalOpen(true)}
        onExportExcel={handleExport}
        onClearAll={() => setClearConfirmOpen(true)}
        isExporting={isExporting}
      />

      {/* Contenido principal */}
      <Container
        maxWidth="xl"
        sx={{
          flex: 1,
          py: { xs: 3, md: 4 },
          px: { xs: 2, sm: 3 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Fade in timeout={600}>
          <Box>
            {/* Sección de estadísticas rápidas */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2,
                mb: 3,
              }}
            >
              {[
                {
                  label: 'Total Personas',
                  value: totalPersons,
                  color: '#6366f1',
                  icon: '👥',
                },
                {
                  label: 'Con Foto',
                  value: filteredPersons.filter((p) => p.fotoBase64).length,
                  color: '#34d399',
                  icon: '🪪',
                },
                {
                  label: 'Con Correo',
                  value: filteredPersons.filter((p) => p.correo).length,
                  color: '#60a5fa',
                  icon: '📧',
                },
                {
                  label: 'Con RIF',
                  value: filteredPersons.filter((p) => p.rif).length,
                  color: '#fbbf24',
                  icon: '📋',
                },
              ].map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 3,
                    background: (theme) => alpha(theme.palette.background.paper, 0.6),
                    border: `1px solid ${alpha(stat.color, 0.2)}`,
                    backdropFilter: 'blur(10px)',
                    transition: 'border-color 0.2s ease',
                    '&:hover': {
                      borderColor: alpha(stat.color, 0.5),
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.4rem' } }}>
                      {stat.icon}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 800, color: stat.color, lineHeight: 1, fontSize: { xs: '1.6rem', md: '2rem' } }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Barra de búsqueda */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2.5,
              }}
            >
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                totalResults={totalPersons}
                totalFiltered={totalFiltered}
              />
            </Box>

            {/* Tabla principal */}
            <PersonTable
              persons={paginatedPersons}
              total={totalFiltered}
              page={page}
              pageSize={pageSize}
              isLoading={isLoading}
              onEdit={handleOpenEdit}
              onDelete={handleDeletePerson}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />

            {/* Footer informativo */}
            {totalPersons > 0 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.disabled">
                  Los datos se guardan automáticamente en el navegador · 
                  Exporta a Excel para crear una copia de seguridad
                </Typography>
              </Box>
            )}
          </Box>
        </Fade>
      </Container>

      {/* Modal de crear/editar persona */}
      <PersonModal
        open={personModalOpen}
        editPerson={editingPerson}
        existingPersons={usePersonStore.getState().persons}
        onSave={handleSavePerson}
        onClose={() => {
          setPersonModalOpen(false);
          setEditingPerson(null);
        }}
      />

      {/* Modal de importación Excel */}
      <ExcelImport
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
        onDownloadTemplate={downloadTemplate}
        isLoading={isImporting}
      />

      {/* Confirmación de limpiar todo */}
      <ConfirmDialog
        open={clearConfirmOpen}
        title="Eliminar todos los registros"
        message={`¿Estás seguro de que deseas eliminar los ${totalPersons} registros? Esta acción eliminará toda la información y no se puede deshacer. Se recomienda exportar primero.`}
        confirmLabel="Eliminar todo"
        severity="error"
        onConfirm={handleClearAll}
        onCancel={() => setClearConfirmOpen(false)}
      />
    </Box>
  );
}
