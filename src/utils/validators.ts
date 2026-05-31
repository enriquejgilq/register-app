// ============================================================
// Validators — Validaciones de campos con Zod
// ============================================================

import { z } from 'zod';

// Regex de validación
// Cédula: acepta con o sin prefijo, con o sin guión, 5-9 dígitos
const CEDULA_REGEX = /^([VEJGPvejgp]-?)?\d{5,9}$/;
// RIF: acepta J-12345678-9, J12345678, V-12345678, etc.
const RIF_REGEX = /^[VEJGPvejgp]-?\d{5,9}(-?\d)?$/;
// Teléfono: acepta 04XX-XXXXXXX, 04XXXXXXXXX, +584XXXXXXXXX, etc.
const TELEFONO_REGEX = /^(\+?58[-\s.]?)?0?4[0-9]{2}[-\s.]?\d{7}$|^(\+58|0058)?[-\s.]?[2-9]\d{6,9}$/;

export const personSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(60, 'El nombre no puede superar 60 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/, 'El nombre solo puede contener letras'),

  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(60, 'El apellido no puede superar 60 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/, 'El apellido solo puede contener letras'),

  cedula: z
    .string()
    .min(1, 'La cédula es obligatoria')
    .refine(
      (val) => val.trim().length >= 5,
      'La cédula debe tener al menos 5 caracteres'
    )
    .refine(
      (val) => CEDULA_REGEX.test(val.trim().replace(/\s/g, '')),
      'Formato inválido. Ej: V-12345678, 12345678, E12345678'
    ),

  telefono: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        const clean = val.replace(/[\s.()-]/g, '');
        // Aceptar: 10+ dígitos, con o sin código de país
        return /^\+?\d{7,15}$/.test(clean) || TELEFONO_REGEX.test(clean);
      },
      'Teléfono inválido. Ej: 0412-1234567, 04121234567'
    ),

  rif: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        const clean = val.trim().replace(/\s/g, '');
        // Aceptar: con o sin prefijo, con o sin guiones
        return RIF_REGEX.test(clean) || /^\d{6,12}$/.test(clean);
      },
      'Formato inválido. Ej: J-12345678-9, V12345678'
    ),

  correo: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === '' || z.string().email().safeParse(val).success,
      'Correo electrónico inválido'
    ),

  fotoBase64: z.string().optional(),
  fotoNombre: z.string().optional(),
});

export type PersonSchemaType = z.infer<typeof personSchema>;

// Validación rápida de campo individual (para inline editing)
export function validateField(
  field: keyof PersonSchemaType,
  value: string
): string | undefined {
  const partial = personSchema.shape[field];
  const result = partial.safeParse(value);
  if (!result.success) {
    return result.error.issues[0]?.message;
  }
  return undefined;
}
