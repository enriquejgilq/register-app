// ============================================================
// PersonsPage — Módulo de gestión de personas
// ============================================================

import { useState } from 'react';
import { Box, Container, Fade } from '@mui/material';
import { Header } from '../components/layout/Header';
import { PersonTable } from '../components/persons/PersonTable';
import { PersonModal } from '../components/persons/PersonModal';
import { PersonStatsCards } from '../components/persons/PersonStatsCards';
import { ExcelImport } from '../components/excel/ExcelImport';
import { SearchBar } from '../components/common/SearchBar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useSnackbar } from '../components/common/SnackbarAlert';
import { usePersons } from '../hooks/usePersons';
import { useExcel } from '../hooks/useExcel';
import { usePersonStore } from '../store/personStore';
import type { Person, PersonCreateInput } from '../models/Person';

export default function PersonsPage() {
  const { showSuccess, showError, showWarning, showInfo } = useSnackbar();

  // Hook principal de personas (inyecta companyId automáticamente)
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
    categoryFilter,
    setCategoryFilter,
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

  const handleSavePerson = async (data: PersonCreateInput) => {
    try {
      if (editingPerson) {
        await updatePerson(editingPerson.id, data);
        showSuccess(`✓ ${data.nombre} ${data.apellido} actualizado correctamente`);
      } else {
        await addPerson(data);
        showSuccess(`✓ ${data.nombre} ${data.apellido} registrado correctamente`);
      }
      setPersonModalOpen(false);
      setEditingPerson(null);
    } catch {
      showError('Error al guardar el registro');
    }
  };

  const handleDeletePerson = async (id: string) => {
    try {
      await deletePerson(id);
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

    const { persons: importedData, result } = data;

    if (importedData.length === 0 && result.errors.length === 0) {
      showWarning('El archivo no contiene datos válidos');
      return { imported: 0, errors: result.errors };
    }

    if (importedData.length > 0) {
      // Mapear al tipo de creación para omitir campos obsoletos
      const cleanInput = importedData.map((p) => ({
        nombre: p.nombre,
        apellido: p.apellido,
        cedula: p.cedula,
        telefono: p.telefono,
        rif: p.rif,
        correo: p.correo,
        fotoBase64: p.fotoBase64,
        fotoNombre: p.fotoNombre,
      }));

      await importPersons(cleanInput);
      showSuccess(
        `✓ Se importaron ${importedData.length} persona(s). ${result.errors.length > 0 ? `${result.errors.length} fila(s) con errores.` : ''}`
      );
    }

    if (importedData.length === 0 && result.errors.length > 0) {
      showError(`El archivo tiene ${result.errors.length} error(es) y no se importó ningún registro`);
    }

    return { imported: importedData.length, errors: result.errors };
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

  const handleClearAll = async () => {
    await clearAll();
    setClearConfirmOpen(false);
    showSuccess('Todos los registros han sido eliminados');
  };

  return (
    <Fade in timeout={400}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header de Personas */}
        <Header
          totalPersons={totalPersons}
          onAddPerson={handleOpenAdd}
          onImportExcel={() => setImportModalOpen(true)}
          onExportExcel={handleExport}
          onClearAll={() => setClearConfirmOpen(true)}
          isExporting={isExporting}
        />

        <Container maxWidth="xl" sx={{ flex: 1, px: '0 !important', mt: 3 }}>
          {/* Sección de estadísticas rápidas */}
          <PersonStatsCards
            totalPersons={totalPersons}
            filteredPersons={filteredPersons}
            categoryFilter={categoryFilter}
            onFilterChange={setCategoryFilter}
          />

          {/* Barra de búsqueda */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
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
          message={`¿Estás seguro de que deseas eliminar los ${totalPersons} registros? Esta acción eliminará toda la información de la nube para tu empresa y no se puede deshacer. Se recomienda exportar primero.`}
          confirmLabel="Eliminar todo"
          severity="error"
          onConfirm={handleClearAll}
          onCancel={() => setClearConfirmOpen(false)}
        />
      </Box>
    </Fade>
  );
}
