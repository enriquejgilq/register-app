// ============================================================
// useExcel Hook — Importación y Exportación Excel
// ============================================================

import { useState, useCallback } from 'react';
import { parseExcelFile, exportPersonsToExcel, downloadExcelTemplate } from '../services/excelService';
import type { Person } from '../models/Person';
import type { ImportResult } from '../models/Person';

export interface UseExcelReturn {
  isImporting: boolean;
  isExporting: boolean;
  importError: string | null;
  lastImportResult: ImportResult | null;

  importFromFile: (file: File) => Promise<{ persons: Person[]; result: ImportResult } | null>;
  exportToExcel: (persons: Person[], fileName?: string) => Promise<void>;
  downloadTemplate: () => Promise<void>;
  clearImportState: () => void;
}

export function useExcel(): UseExcelReturn {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [lastImportResult, setLastImportResult] = useState<ImportResult | null>(null);

  const importFromFile = useCallback(
    async (file: File): Promise<{ persons: Person[]; result: ImportResult } | null> => {
      setIsImporting(true);
      setImportError(null);
      setLastImportResult(null);

      try {
        // Validar extensión del archivo
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['xlsx', 'xls'].includes(ext ?? '')) {
          throw new Error('Solo se permiten archivos Excel (.xlsx o .xls)');
        }

        const data = await parseExcelFile(file);
        setLastImportResult(data.result);
        return data;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Error desconocido al importar';
        setImportError(message);
        return null;
      } finally {
        setIsImporting(false);
      }
    },
    []
  );

  const exportToExcel = useCallback(async (persons: Person[], fileName?: string) => {
    setIsExporting(true);
    try {
      await exportPersonsToExcel(persons, fileName);
    } catch (error) {
      console.error('[useExcel] Error al exportar:', error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const downloadTemplate = useCallback(async () => {
    try {
      await downloadExcelTemplate();
    } catch (error) {
      console.error('[useExcel] Error al descargar plantilla:', error);
    }
  }, []);

  const clearImportState = useCallback(() => {
    setImportError(null);
    setLastImportResult(null);
  }, []);

  return {
    isImporting,
    isExporting,
    importError,
    lastImportResult,
    importFromFile,
    exportToExcel,
    downloadTemplate,
    clearImportState,
  };
}
