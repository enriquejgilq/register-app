import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Sube una imagen de persona a Firebase Storage.
 * Retorna la URL pública y la ruta interna.
 */
export const uploadPersonImage = async (
  companyId: string,
  personId: string,
  file: File
): Promise<{ url: string; path: string }> => {
  try {
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filePath = `companies/${companyId}/persons/${personId}.${fileExtension}`;
    
    const storageRef = ref(storage, filePath);
    
    // Subir archivo
    await uploadBytes(storageRef, file);
    
    // Obtener URL pública
    const url = await getDownloadURL(storageRef);
    
    return { url, path: filePath };
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    throw new Error('No se pudo subir la imagen al servidor.');
  }
};

/**
 * Elimina una imagen de Firebase Storage usando su ruta interna.
 */
export const deletePersonImage = async (path: string): Promise<void> => {
  if (!path) return;
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error(`Error al eliminar la imagen en ${path}:`, error);
  }
};
