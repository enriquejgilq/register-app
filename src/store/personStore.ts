// ============================================================
// Person Store — Zustand con persistencia en LocalStorage
// ============================================================

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Person, PersonCreateInput, PersonUpdateInput } from '../models/Person';
import {
  createStorageService,
  PERSONS_STORAGE_KEY,
} from '../services/storageService';

const storage = createStorageService<Person>(PERSONS_STORAGE_KEY);

// -------------------------------------------------------
// Tipos del store
// -------------------------------------------------------
interface PersonState {
  persons: Person[];
  isLoading: boolean;
  error: string | null;
}

interface PersonActions {
  // Inicialización
  initialize: () => void;

  // CRUD
  addPerson: (input: PersonCreateInput) => Person;
  updatePerson: (id: string, input: PersonUpdateInput) => void;
  deletePerson: (id: string) => void;
  deleteMultiplePersons: (ids: string[]) => void;

  // Importación masiva
  importPersons: (persons: Person[], replace?: boolean) => void;

  // Estado
  clearAll: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export type PersonStore = PersonState & PersonActions;

// -------------------------------------------------------
// Store
// -------------------------------------------------------
export const usePersonStore = create<PersonStore>((set, get) => ({
  // Estado inicial
  persons: [],
  isLoading: false,
  error: null,

  // Inicializar desde LocalStorage
  initialize: () => {
    set({ isLoading: true });
    try {
      const saved = storage.getAll();
      set({ persons: saved, isLoading: false });
    } catch (error) {
      set({
        error: 'Error al cargar los datos guardados',
        isLoading: false,
      });
    }
  },

  // Agregar persona
  addPerson: (input: PersonCreateInput): Person => {
    const now = new Date().toISOString();
    const newPerson: Person = {
      ...input,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    const updated = [...get().persons, newPerson];
    storage.save(updated);
    set({ persons: updated });
    return newPerson;
  },

  // Actualizar persona
  updatePerson: (id: string, input: PersonUpdateInput): void => {
    const persons = get().persons.map((p) =>
      p.id === id
        ? { ...p, ...input, updatedAt: new Date().toISOString() }
        : p
    );
    storage.save(persons);
    set({ persons });
  },

  // Eliminar persona
  deletePerson: (id: string): void => {
    const persons = get().persons.filter((p) => p.id !== id);
    storage.save(persons);
    set({ persons });
  },

  // Eliminar múltiples personas
  deleteMultiplePersons: (ids: string[]): void => {
    const idSet = new Set(ids);
    const persons = get().persons.filter((p) => !idSet.has(p.id));
    storage.save(persons);
    set({ persons });
  },

  // Importar personas desde Excel
  importPersons: (persons: Person[], replace = false): void => {
    const current = replace ? [] : get().persons;

    // Deduplicar por cédula al importar
    const existingCedulas = new Set(current.map((p) => p.cedula.toLowerCase()));
    const newPersons = persons.filter(
      (p) => !existingCedulas.has(p.cedula.toLowerCase())
    );

    const updated = [...current, ...newPersons];
    storage.save(updated);
    set({ persons: updated });
  },

  // Limpiar todos los datos
  clearAll: (): void => {
    storage.clear();
    set({ persons: [] });
  },

  // Helpers de estado
  setError: (error: string | null) => set({ error }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));

// -------------------------------------------------------
// Selectores derivados (memoizados externamente con useMemo)
// -------------------------------------------------------
export const selectPersonById = (id: string) => (state: PersonStore) =>
  state.persons.find((p) => p.id === id);

export const selectPersonCount = (state: PersonStore) => state.persons.length;
