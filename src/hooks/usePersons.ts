// ============================================================
// usePersons Hook — Lógica de CRUD con búsqueda y paginación
// ============================================================

import { useMemo, useState } from 'react';
import { usePersonStore } from '../store/personStore';
import type { Person } from '../models/Person';

export interface UsePersonsOptions {
  pageSize?: number;
}

export interface UsePersonsReturn {
  // Datos
  persons: Person[];
  filteredPersons: Person[];
  paginatedPersons: Person[];
  totalPersons: number;
  totalFiltered: number;

  // Paginación
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Búsqueda
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Estado
  isLoading: boolean;
  error: string | null;

  // Acciones
  addPerson: ReturnType<typeof usePersonStore>['addPerson'];
  updatePerson: ReturnType<typeof usePersonStore>['updatePerson'];
  deletePerson: ReturnType<typeof usePersonStore>['deletePerson'];
  deleteMultiplePersons: ReturnType<typeof usePersonStore>['deleteMultiplePersons'];
  importPersons: ReturnType<typeof usePersonStore>['importPersons'];
  clearAll: ReturnType<typeof usePersonStore>['clearAll'];
}

export function usePersons(options: UsePersonsOptions = {}): UsePersonsReturn {
  const { pageSize: initialPageSize = 10 } = options;

  const {
    persons,
    isLoading,
    error,
    addPerson,
    updatePerson,
    deletePerson,
    deleteMultiplePersons,
    importPersons,
    clearAll,
  } = usePersonStore();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [searchQuery, setSearchQueryState] = useState('');

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(0);
  };

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    setPage(0);
  };

  // Filtrado multi-campo
  const filteredPersons = useMemo(() => {
    if (!searchQuery.trim()) return persons;

    const query = searchQuery.toLowerCase().trim();
    return persons.filter((p) =>
      [p.nombre, p.apellido, p.cedula, p.telefono, p.rif, p.correo].some(
        (field) => field?.toLowerCase().includes(query)
      )
    );
  }, [persons, searchQuery]);

  // Paginación
  const totalPages = Math.ceil(filteredPersons.length / pageSize);

  const paginatedPersons = useMemo(() => {
    const start = page * pageSize;
    return filteredPersons.slice(start, start + pageSize);
  }, [filteredPersons, page, pageSize]);

  return {
    persons,
    filteredPersons,
    paginatedPersons,
    totalPersons: persons.length,
    totalFiltered: filteredPersons.length,
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    addPerson,
    updatePerson,
    deletePerson,
    deleteMultiplePersons,
    importPersons,
    clearAll,
  };
}
