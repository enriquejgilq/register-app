// ============================================================
// Person Model — Tipos TypeScript estrictos
// ============================================================

export interface Person {
  id: string;
  companyId: string;     // Identificador de la empresa propietaria del registro
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  rif: string;
  correo: string;
  fotoBase64?: string;   // Imagen codificada en Base64
  fotoNombre?: string;   // Nombre original del archivo de imagen
  createdAt: string;     // ISO date string
  updatedAt: string;     // ISO date string
}

export type PersonFormData = Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>;

export type PersonCreateInput = Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>;

export type PersonUpdateInput = Partial<PersonCreateInput>;

// Campos permitidos para búsqueda
export type SearchableField = 'nombre' | 'apellido' | 'cedula' | 'telefono' | 'rif' | 'correo';

export const SEARCHABLE_FIELDS: SearchableField[] = [
  'nombre',
  'apellido',
  'cedula',
  'telefono',
  'rif',
  'correo',
];

// Mapa de labels de campos para la UI
export const FIELD_LABELS: Record<keyof Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'fotoBase64' | 'fotoNombre' | 'companyId'>, string> = {
  nombre: 'Nombre',
  apellido: 'Apellido',
  cedula: 'Cédula de Identidad',
  telefono: 'Teléfono',
  rif: 'RIF',
  correo: 'Correo Electrónico',
};

// Encabezados de Excel esperados al importar (acepta variantes)
export const EXCEL_COLUMN_MAP: Record<string, keyof PersonFormData> = {
  // Nombre
  'nombre': 'nombre',
  'name': 'nombre',
  'first name': 'nombre',
  'primer nombre': 'nombre',
  // Apellido
  'apellido': 'apellido',
  'surname': 'apellido',
  'last name': 'apellido',
  'primer apellido': 'apellido',
  // Cédula
  'cedula': 'cedula',
  'cédula': 'cedula',
  'ci': 'cedula',
  'cedula de identidad': 'cedula',
  'cédula de identidad': 'cedula',
  'documento': 'cedula',
  // Teléfono
  'telefono': 'telefono',
  'teléfono': 'telefono',
  'phone': 'telefono',
  'tel': 'telefono',
  'celular': 'telefono',
  // RIF
  'rif': 'rif',
  'r.i.f': 'rif',
  'r.i.f.': 'rif',
  // Correo
  'correo': 'correo',
  'email': 'correo',
  'correo electronico': 'correo',
  'correo electrónico': 'correo',
  'e-mail': 'correo',
};

export interface ImportResult {
  success: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface ExcelExportRow {
  Nombre: string;
  Apellido: string;
  'Cédula': string;
  Teléfono: string;
  RIF: string;
  'Correo Electrónico': string;
  'Tiene Foto': string;
}
