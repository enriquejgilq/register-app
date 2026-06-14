// ============================================================
// usePersons Hook — Lógica de CRUD con búsqueda y paginación
// ============================================================

import { useMemo, useState } from 'react';
import { usePersonStore } from '../store/personStore';
import type { PersonStore } from '../store/personStore';
import type { Person, PersonCreateInput } from '../models/Person';
import { useAuthStore } from '../store/authStore';

export type PersonCategoryFilter = 'all' | 'conFoto' | 'conCorreo' | 'conRif';

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

  // Filtro de categoría
  categoryFilter: PersonCategoryFilter;
  setCategoryFilter: (filter: PersonCategoryFilter) => void;

  // Estado
  isLoading: boolean;
  error: string | null;

  // Acciones (con companyId inyectado automáticamente)
  addPerson: (input: PersonCreateInput) => Promise<Person>;
  updatePerson: (id: string, input: any) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  deleteMultiplePersons: (ids: string[]) => Promise<void>;
  importPersons: (persons: PersonCreateInput[], replace?: boolean) => Promise<void>;
  clearAll: () => Promise<void>;
}

export function usePersons(options: UsePersonsOptions = {}): UsePersonsReturn {
  const { pageSize: initialPageSize = 10 } = options;
  const company = useAuthStore((s) => s.company);
  const companyId = company?.id || '';

  const {
    persons,
    isLoading,
    error,
    addPerson: storeAddPerson,
    updatePerson: storeUpdatePerson,
    deletePerson: storeDeletePerson,
    deleteMultiplePersons: storeDeleteMultiplePersons,
    importPersons: storeImportPersons,
    clearAll: storeClearAll,
  } = usePersonStore();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [searchQuery, setSearchQueryState] = useState('');
  const [categoryFilter, setCategoryFilterState] = useState<PersonCategoryFilter>('all');

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(0);
  };

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    setPage(0);
  };

  const setCategoryFilter = (filter: PersonCategoryFilter) => {
    setCategoryFilterState(filter);
    setPage(0);
  };

  // Filtrado por categoría + búsqueda multi-campo
  const filteredPersons = useMemo(() => {
    let result = persons;

    switch (categoryFilter) {
      case 'conFoto':
        result = result.filter((p) => !!p.fotoBase64);
        break;
      case 'conCorreo':
        result = result.filter((p) => !!p.correo);
        break;
      case 'conRif':
        result = result.filter((p) => !!p.rif);
        break;
      default:
        break;
    }

    if (!searchQuery.trim()) return result;

    const query = searchQuery.toLowerCase().trim();
    return result.filter((p) =>
      [p.nombre, p.apellido, p.cedula, p.telefono, p.rif, p.correo].some(
        (field) => field?.toLowerCase().includes(query)
      )
    );
  }, [persons, searchQuery, categoryFilter]);

  // Paginación
  const totalPages = Math.ceil(filteredPersons.length / pageSize);

  const paginatedPersons = useMemo(() => {
    const start = page * pageSize;
    return filteredPersons.slice(start, start + pageSize);
  }, [filteredPersons, page, pageSize]);

  // Envolturas para inyectar companyId automáticamente
  const addPerson = (input: PersonCreateInput) => storeAddPerson(input, companyId);
  const updatePerson = (id: string, input: any) => storeUpdatePerson(id, input, companyId);
  const deletePerson = (id: string) => storeDeletePerson(id, companyId);
  const deleteMultiplePersons = (ids: string[]) => storeDeleteMultiplePersons(ids, companyId);
  const importPersons = (personsList: PersonCreateInput[], replace?: boolean) =>
    storeImportPersons(personsList, companyId, replace);
  const clearAll = () => storeClearAll(companyId);

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
    categoryFilter,
    setCategoryFilter,
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
