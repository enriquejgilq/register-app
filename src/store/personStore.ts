// ============================================================
// Person Store — Zustand sincronizado con Firebase Firestore
// ============================================================

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Person, PersonCreateInput, PersonUpdateInput } from '../models/Person';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Elimina las propiedades con valor `undefined`, ya que Firestore no las acepta
function stripUndefined<T extends object>(obj: T): T {
  const result = {} as T;
  (Object.entries(obj) as [keyof T, T[keyof T]][]).forEach(([key, value]) => {
    if (value !== undefined) {
      result[key] = value;
    }
  });
  return result;
}

// -------------------------------------------------------
// Tipos del store
// -------------------------------------------------------
interface PersonState {
  persons: Person[];
  isLoading: boolean;
  error: string | null;
}

interface PersonActions {
  // Inicialización (con companyId obligatorio)
  initialize: (companyId: string) => Promise<void>;

  // CRUD
  addPerson: (input: PersonCreateInput, companyId: string) => Promise<Person>;
  updatePerson: (id: string, input: PersonUpdateInput, companyId: string) => Promise<void>;
  deletePerson: (id: string, companyId: string) => Promise<void>;
  deleteMultiplePersons: (ids: string[], companyId: string) => Promise<void>;
  restorePerson: (id: string, companyId: string) => Promise<void>;
  permanentlyDeletePerson: (id: string, companyId: string) => Promise<void>;

  // Importación masiva
  importPersons: (persons: PersonCreateInput[], companyId: string, replace?: boolean) => Promise<void>;

  // Estado
  clearAll: (companyId: string) => Promise<void>;
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

  // Inicializar desde Firestore filtrando por empresa
  initialize: async (companyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const q = query(collection(db, 'persons'), where('companyId', '==', companyId));
      const querySnapshot = await getDocs(q);
      const list: Person[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Person);
      });
      set({ persons: list, isLoading: false });
    } catch (error) {
      console.error('Error al inicializar personas:', error);
      set({
        error: 'Error al cargar los datos desde la nube.',
        isLoading: false,
      });
    }
  },

  // Agregar persona en Firestore
  addPerson: async (input: PersonCreateInput, companyId: string): Promise<Person> => {
    set({ isLoading: true, error: null });
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      const newPerson: Person = {
        ...input,
        id,
        companyId,
        createdAt: now,
        updatedAt: now,
        deleted: false,
      };

      await setDoc(doc(db, 'persons', id), stripUndefined(newPerson));
      
      const updated = [...get().persons, newPerson];
      set({ persons: updated });
      return newPerson;
    } catch (err) {
      console.error('Error al agregar persona:', err);
      set({ error: 'Error al registrar la persona en la nube.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Actualizar persona en Firestore
  updatePerson: async (id: string, input: PersonUpdateInput, companyId: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      // Verificar que la persona existe y pertenece a esta compañía
      const docRef = doc(db, 'persons', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Person not found');
      }

      const person = docSnap.data() as Person;
      if (person.companyId !== companyId) {
        throw new Error('Unauthorized: Person does not belong to your company');
      }

      const now = new Date().toISOString();
      const updateData = {
        ...input,
        updatedAt: now,
      };

      await updateDoc(docRef, stripUndefined(updateData));

      const persons = get().persons.map((p) =>
        p.id === id ? { ...p, ...input, updatedAt: now } : p
      );
      set({ persons });
    } catch (err) {
      console.error('Error al actualizar persona:', err);
      set({ error: 'Error al actualizar los datos en la nube.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Eliminar persona en Firestore
  deletePerson: async (id: string, companyId: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      // Verificar que la persona existe y pertenece a esta compañía
      const docRef = doc(db, 'persons', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Person not found');
      }

      const person = docSnap.data() as Person;
      if (person.companyId !== companyId) {
        throw new Error('Unauthorized: Cannot delete person from another company');
      }

      const now = new Date().toISOString();
      await updateDoc(docRef, { deleted: true, deletedAt: now, updatedAt: now });

      const persons = get().persons.map((p) =>
        p.id === id ? { ...p, deleted: true, deletedAt: now, updatedAt: now } : p
      );
      set({ persons });
    } catch (err) {
      console.error('Error al eliminar persona:', err);
      set({ error: 'Error al eliminar el registro de la nube.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Eliminar múltiples personas
  deleteMultiplePersons: async (ids: string[], companyId: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      // Verificar que todas las personas existen y pertenecen a esta compañía
      const verificationPromises = ids.map((id) => getDoc(doc(db, 'persons', id)));
      const docSnapshots = await Promise.all(verificationPromises);

      for (const docSnap of docSnapshots) {
        if (!docSnap.exists()) {
          throw new Error(`Person ${docSnap.id} not found`);
        }
        const person = docSnap.data() as Person;
        if (person.companyId !== companyId) {
          throw new Error(
            `Unauthorized: Cannot delete person ${docSnap.id} from another company`
          );
        }
      }

      const now = new Date().toISOString();
      const batchSize = 450;
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = ids.slice(i, i + batchSize);
        chunk.forEach((id) => {
          batch.update(doc(db, 'persons', id), { deleted: true, deletedAt: now, updatedAt: now });
        });
        await batch.commit();
      }

      const idSet = new Set(ids);
      const persons = get().persons.map((p) =>
        idSet.has(p.id) ? { ...p, deleted: true, deletedAt: now, updatedAt: now } : p
      );
      set({ persons });
    } catch (err) {
      console.error('Error al eliminar múltiples personas:', err);
      set({ error: 'Error al eliminar los registros seleccionados.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Restaurar persona desde la papelera
  restorePerson: async (id: string, companyId: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const docRef = doc(db, 'persons', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Person not found');
      }

      const person = docSnap.data() as Person;
      if (person.companyId !== companyId) {
        throw new Error('Unauthorized: Cannot restore person from another company');
      }

      const now = new Date().toISOString();
      await updateDoc(docRef, { deleted: false, deletedAt: null, updatedAt: now });

      const persons = get().persons.map((p) =>
        p.id === id ? { ...p, deleted: false, deletedAt: null, updatedAt: now } : p
      );
      set({ persons });
    } catch (err) {
      console.error('Error al restaurar persona:', err);
      set({ error: 'Error al restaurar el registro desde la papelera.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Eliminar persona de forma permanente (desde la papelera)
  permanentlyDeletePerson: async (id: string, companyId: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const docRef = doc(db, 'persons', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Person not found');
      }

      const person = docSnap.data() as Person;
      if (person.companyId !== companyId) {
        throw new Error('Unauthorized: Cannot delete person from another company');
      }

      await deleteDoc(docRef);
      const persons = get().persons.filter((p) => p.id !== id);
      set({ persons });
    } catch (err) {
      console.error('Error al eliminar permanentemente la persona:', err);
      set({ error: 'Error al eliminar permanentemente el registro.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Importar personas desde Excel
  importPersons: async (personsData: PersonCreateInput[], companyId: string, replace = false): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const current = replace ? [] : get().persons;
      const existingCedulas = new Set(current.map((p) => p.cedula.toLowerCase()));
      
      // Filtrar registros duplicados por cédula (dentro de la misma empresa)
      const newPersonsToImport = personsData.filter(
        (p) => !existingCedulas.has(p.cedula.toLowerCase())
      );

      const operations: { ref: any; data?: any; type: 'set' | 'delete' }[] = [];

      // Si replace es true, eliminar todo lo actual primero
      if (replace) {
        const q = query(collection(db, 'persons'), where('companyId', '==', companyId));
        const snap = await getDocs(q);
        snap.forEach((docSnap) => {
          operations.push({ ref: docSnap.ref, type: 'delete' });
        });
      }

      const now = new Date().toISOString();
      newPersonsToImport.forEach((p) => {
        const id = uuidv4();
        const newPerson: Person = {
          ...p,
          id,
          companyId,
          createdAt: now,
          updatedAt: now,
        };
        operations.push({
          ref: doc(db, 'persons', id),
          data: newPerson,
          type: 'set',
        });
      });

      // Ejecutar en lotes de 450 para respetar los límites de Firestore batches
      const batchSize = 450;
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = operations.slice(i, i + batchSize);
        chunk.forEach((op) => {
          if (op.type === 'delete') {
            batch.delete(op.ref);
          } else if (op.type === 'set') {
            batch.set(op.ref, stripUndefined(op.data));
          }
        });
        await batch.commit();
      }

      // Volver a cargar para sincronizar el estado local
      const q = query(collection(db, 'persons'), where('companyId', '==', companyId));
      const snap = await getDocs(q);
      const list: Person[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as Person);
      });
      set({ persons: list });
    } catch (err: any) {
      console.error('Error al importar personas:', err);
      set({ error: 'Error al guardar los registros importados en la nube.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Limpiar todos los datos de la empresa
  clearAll: async (companyId: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const q = query(collection(db, 'persons'), where('companyId', '==', companyId));
      const snap = await getDocs(q);
      const operations: any[] = [];
      snap.forEach((docSnap) => {
        operations.push(docSnap.ref);
      });

      const batchSize = 450;
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = operations.slice(i, i + batchSize);
        chunk.forEach((ref) => {
          batch.delete(ref);
        });
        await batch.commit();
      }

      set({ persons: [] });
    } catch (err) {
      console.error('Error al vaciar la base de datos:', err);
      set({ error: 'Error al vaciar los registros de la nube.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Helpers de estado
  setError: (error: string | null) => set({ error }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));

// -------------------------------------------------------
// Selectores derivados
// -------------------------------------------------------
export const selectPersonById = (id: string) => (state: PersonStore) =>
  state.persons.find((p) => p.id === id);

export const selectPersonCount = (state: PersonStore) => state.persons.length;
