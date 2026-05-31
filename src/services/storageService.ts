// ============================================================
// Storage Service — Abstracción de persistencia
// Preparado para migrar fácilmente a una API REST o BD
// ============================================================

export interface StorageAdapter<T> {
  getAll(): T[];
  save(items: T[]): void;
  clear(): void;
}

class LocalStorageAdapter<T> implements StorageAdapter<T> {
  private readonly key: string;

  constructor(key: string) {
    this.key = key;
  }

  getAll(): T[] {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return [];
      return JSON.parse(raw) as T[];
    } catch {
      console.error(`[StorageService] Error reading key "${this.key}" from localStorage`);
      return [];
    }
  }

  save(items: T[]): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
    } catch (error) {
      console.error(`[StorageService] Error saving to localStorage:`, error);
      throw new Error('No se pudo guardar la información. El almacenamiento local puede estar lleno.');
    }
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }
}

// Singleton factory — para migrar a REST, reemplaza LocalStorageAdapter
// por una clase que haga fetch() sin cambiar nada en el resto de la app
export function createStorageService<T>(storageKey: string): StorageAdapter<T> {
  return new LocalStorageAdapter<T>(storageKey);
}

export const PERSONS_STORAGE_KEY = 'registro-personas:persons';
