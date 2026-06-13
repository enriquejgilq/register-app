// ============================================================
// App.tsx — Componente raíz adaptado a Firebase y Multiempresa
// ============================================================

import { useEffect, useState } from 'react';
import { Box, Container, alpha, Fade, CircularProgress, Typography } from '@mui/material';
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
import { useAuthStore } from './store/authStore';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Sidebar, type ModuleType } from './components/layout/Sidebar';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { CompanySettings } from './components/company/CompanySettings';
import { LocalDataMigrationPrompt } from './components/common/LocalDataMigrationPrompt';
import type { Person, PersonCreateInput } from './models/Person';

export default function App() {
  const { showSuccess, showError, showWarning, showInfo } = useSnackbar();

  // Gestión de Estado de Autenticación
  const { initializeAuth, isInitializing, user, company } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');

  // Inicializar observador de autenticación de Firebase al montar
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  // Inicializar store de personas de la empresa
  const initializePersons = usePersonStore((s) => s.initialize);
  useEffect(() => {
    if (company?.id) {
      initializePersons(company.id);
    }
  }, [company, initializePersons]);

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

  // ─── Pantalla de Carga Inicial ─────────────────────────────
  if (isInitializing) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          background: 'linear-gradient(135deg, #0f0f1a 0%, #0d0d2b 50%, #0f0f1a 100%)',
        }}
      >
        <CircularProgress size={50} color="primary" />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Sincronizando con la nube de Firebase...
        </Typography>
      </Box>
    );
  }

  // ─── Pantalla de Autenticación ─────────────────────────────
  if (!user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f0f1a 0%, #0d0d2b 50%, #0f0f1a 100%)',
          p: 2,
        }}
      >
        {isRegister ? (
          <Register onSwitchToLogin={() => setIsRegister(false)} />
        ) : (
          <Login onSwitchToRegister={() => setIsRegister(true)} />
        )}
      </Box>
    );
  }

  // ─── Dashboard de Aplicación (Usuario Autenticado) ─────────
  const drawerWidth = 260;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
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

      {/* Sidebar Navigation */}
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} drawerWidth={drawerWidth} />

      {/* Contenido Principal Modular */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          p: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {activeModule === 'dashboard' && (
          <DashboardHome onNavigate={setActiveModule} />
        )}

        {activeModule === 'persons' && (
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
            </Box>
          </Fade>
        )}

        {activeModule === 'company-settings' && (
          <CompanySettings />
        )}
      </Box>

      {/* Modales y Diálogos Globales */}
      <LocalDataMigrationPrompt />

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
  );
}
