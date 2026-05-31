// ============================================================
// Formatters — Formateo de datos para la UI
// ============================================================

/**
 * Formatea una cédula venezolana: V12345678 → V-12345678
 */
export function formatCedula(value: string): string {
  const clean = value.replace(/[^VEJGPvejgp0-9]/g, '');
  if (clean.length < 2) return clean;
  const prefix = clean[0].toUpperCase();
  const digits = clean.slice(1);
  return `${prefix}-${digits}`;
}

/**
 * Formatea un teléfono venezolano: 04121234567 → 0412-1234567
 */
export function formatTelefono(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return value;
}

/**
 * Formatea un RIF: J123456789 → J-123456789
 */
export function formatRif(value: string): string {
  const clean = value.replace(/[^VEJGPvejgp0-9]/g, '');
  if (clean.length < 2) return clean;
  const prefix = clean[0].toUpperCase();
  const rest = clean.slice(1);
  if (rest.length > 8) {
    return `${prefix}-${rest.slice(0, 8)}-${rest.slice(8)}`;
  }
  return `${prefix}-${rest}`;
}

/**
 * Trunca un texto con puntos suspensivos
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Formatea una fecha ISO a formato local venezolano
 */
export function formatDate(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat('es-VE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

/**
 * Genera las iniciales de un nombre completo
 */
export function getInitials(nombre: string, apellido: string): string {
  const n = nombre.trim()[0]?.toUpperCase() ?? '';
  const a = apellido.trim()[0]?.toUpperCase() ?? '';
  return `${n}${a}`;
}

/**
 * Formatea el tamaño de un archivo en bytes a una representación legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
