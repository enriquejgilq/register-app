// ============================================================
// Image Service — Manejo de imágenes en Base64
// ============================================================

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_DIMENSION = 1200; // px

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface ImageData {
  base64: string;
  nombre: string;
  tipo: string;
  tamaño: number;
}

/**
 * Valida un archivo de imagen antes de procesarlo
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Use: ${ALLOWED_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `El archivo supera el límite de ${MAX_FILE_SIZE_MB}MB`,
    };
  }

  return { valid: true };
}

// Tamaño máximo del base64 en bytes (~700KB para dejar margen con otros campos del documento)
const MAX_BASE64_BYTES = 700 * 1024;

/**
 * Convierte un File a Base64 comprimido para almacenamiento en Firestore.
 * Reduce calidad y dimensiones iterativamente hasta que quepa bajo el límite.
 */
export async function fileToBase64(file: File): Promise<ImageData> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen'));
          return;
        }

        // Paso 1: Redimensionar al tamaño máximo permitido
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Paso 2: Comprimir iterativamente hasta que quepa bajo el límite
        let quality = 0.85;
        let base64 = canvas.toDataURL('image/jpeg', quality);

        while (base64.length > MAX_BASE64_BYTES && quality > 0.2) {
          quality -= 0.1;
          base64 = canvas.toDataURL('image/jpeg', quality);
        }

        // Paso 3: Si todavía es grande, reducir dimensiones a la mitad y reintentar
        if (base64.length > MAX_BASE64_BYTES) {
          width = Math.round(width * 0.6);
          height = Math.round(height * 0.6);
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          base64 = canvas.toDataURL('image/jpeg', 0.7);
        }

        resolve({
          base64,
          nombre: file.name,
          tipo: file.type,
          tamaño: base64.length,
        });
      };

      img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}


/**
 * Obtiene las dimensiones de una imagen en Base64
 */
export function getBase64Dimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    img.src = base64;
  });
}

/**
 * Verifica si una cadena es un Base64 válido de imagen
 */
export function isValidBase64Image(value: string): boolean {
  return value.startsWith('data:image/');
}
