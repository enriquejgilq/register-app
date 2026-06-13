// ============================================================
// Excel Service — Importación y Exportación con ExcelJS
// ============================================================

import * as ExcelJS from 'exceljs';
import type { Person, PersonFormData, ImportResult, ImportError } from '../models/Person';
import { EXCEL_COLUMN_MAP } from '../models/Person';
import { v4 as uuidv4 } from 'uuid';

// -------------------------------------------------------
// IMPORTACIÓN
// -------------------------------------------------------

/**
 * Lee un archivo Excel y lo convierte en un array de Person (incluyendo imágenes)
 */
export async function parseExcelFile(file: File): Promise<{ persons: Person[]; result: ImportResult }> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  // Tomamos la primera hoja
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('El archivo Excel está vacío o no tiene hojas.');
  }

  const persons: (Person & { _rowNumber?: number })[] = [];
  const errors: ImportError[] = [];
  let successCount = 0;

  // Encontrar qué columna corresponde a qué dato, basado en la fila 1 (encabezado)
  const headerRow = worksheet.getRow(1);
  const columnMap: Record<number, keyof PersonFormData> = {};

  headerRow.eachCell((cell, colNumber) => {
    const headerValue = String(cell.value ?? '').trim().toLowerCase();
    const mappedField = EXCEL_COLUMN_MAP[headerValue];
    if (mappedField) {
      columnMap[colNumber] = mappedField;
    }
  });

  if (Object.keys(columnMap).length === 0) {
    throw new Error('No se encontraron columnas reconocibles en la primera fila.');
  }

  // Iterar las filas de datos (a partir de la fila 2)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Saltar encabezado

    const rawData: Record<string, string> = {};
    Object.entries(columnMap).forEach(([colIndexStr, field]) => {
      const colIndex = parseInt(colIndexStr, 10);
      const cellValue = row.getCell(colIndex).value;
      
      let textValue = '';
      if (cellValue !== null && cellValue !== undefined) {
        if (typeof cellValue === 'object' && 'richText' in cellValue) {
          textValue = cellValue.richText.map(t => t.text).join('');
        } else if (typeof cellValue === 'object' && 'result' in cellValue) {
          textValue = String(cellValue.result);
        } else {
          textValue = String(cellValue);
        }
      }
      rawData[field] = textValue.trim();
    });

    const mapped = mapRowToPersonExcelJS(rawData, rowNumber, errors);
    if (mapped) {
      // Guardamos la fila temporalmente para mapear la imagen después
      const mappedWithRow: Person & { _rowNumber?: number } = mapped;
      mappedWithRow._rowNumber = rowNumber;
      persons.push(mappedWithRow);
      successCount++;
    }
  });

  // Extraer imágenes y asociarlas a las personas
  const images = worksheet.getImages();
  if (images && images.length > 0) {
    for (const img of images) {
      // Las imágenes en exceljs están ligadas a un rango tl (top-left) col, row (0-indexed)
      // tl.row = 0 significa la fila 1. Así que la row del excel es tl.row + 1
      const imgRowNumber = Math.floor(img.range.tl.row) + 1;
      
      const personMatch = persons.find(p => p._rowNumber === imgRowNumber);
      if (personMatch && !personMatch.fotoBase64) {
        const media = workbook.getImage(Number(img.imageId));
        if (media && media.buffer) {
          // Convertir ArrayBuffer a Base64 manualmente en el navegador
          let binary = '';
          const bytes = new Uint8Array(media.buffer);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64String = window.btoa(binary);
          const ext = media.extension === 'jpeg' ? 'jpeg' : 'png';
          
          personMatch.fotoBase64 = `data:image/${ext};base64,${base64String}`;
          personMatch.fotoNombre = `foto_importada_${personMatch.cedula}.${ext}`;
        }
      }
    }
  }

  // Limpiar campo temporal
  persons.forEach(p => delete p._rowNumber);

  return {
    persons,
    result: {
      success: successCount,
      errors,
    },
  };
}

function mapRowToPersonExcelJS(
  normalized: Record<string, string>,
  rowNumber: number,
  errors: ImportError[]
): Person | null {
  const rowErrors: ImportError[] = [];

  if (!normalized.nombre) {
    rowErrors.push({ row: rowNumber, field: 'nombre', message: 'Nombre es obligatorio' });
  }
  if (!normalized.apellido) {
    rowErrors.push({ row: rowNumber, field: 'apellido', message: 'Apellido es obligatorio' });
  }
  if (!normalized.cedula) {
    rowErrors.push({ row: rowNumber, field: 'cedula', message: 'Cédula es obligatoria' });
  }

  if (rowErrors.length > 0) {
    errors.push(...rowErrors);
    return null;
  }

  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    companyId: '', // Se sobreescribirá al importar a la base de datos de la empresa
    nombre: normalized.nombre ?? '',
    apellido: normalized.apellido ?? '',
    cedula: normalized.cedula ?? '',
    telefono: normalized.telefono ?? '',
    rif: normalized.rif ?? '',
    correo: normalized.correo ?? '',
    fotoBase64: undefined,
    fotoNombre: undefined,
    createdAt: now,
    updatedAt: now,
  };
}

// -------------------------------------------------------
// EXPORTACIÓN
// -------------------------------------------------------

/**
 * Genera y descarga un archivo Excel con la lista de personas y sus fotos incrustadas
 */
export async function exportPersonsToExcel(persons: Person[], fileName = 'registro-personas'): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Personas');

  // Ajustar anchos de columna
  worksheet.columns = [
    { header: 'Nombre', key: 'nombre', width: 20 },
    { header: 'Apellido', key: 'apellido', width: 20 },
    { header: 'Cédula', key: 'cedula', width: 18 },
    { header: 'Teléfono', key: 'telefono', width: 18 },
    { header: 'RIF', key: 'rif', width: 18 },
    { header: 'Correo Electrónico', key: 'correo', width: 32 },
    { header: 'Foto', key: 'foto', width: 15 },
  ];

  // Dar estilo a la cabecera
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { horizontal: 'center' };

  persons.forEach((person, index) => {
    const rowIndex = index + 2; // Fila 1 es cabecera
    const row = worksheet.getRow(rowIndex);
    
    // Altura de fila suficiente para mostrar la foto
    row.height = 80;

    row.getCell(1).value = person.nombre;
    row.getCell(2).value = person.apellido;
    row.getCell(3).value = person.cedula;
    row.getCell(4).value = person.telefono;
    row.getCell(5).value = person.rif;
    row.getCell(6).value = person.correo;

    // Alinear texto al medio
    row.alignment = { vertical: 'middle' };

    // Si tiene foto, incrustarla
    if (person.fotoBase64) {
      try {
        const base64Data = person.fotoBase64.replace(/^data:image\/\w+;base64,/, '');
        const extensionMatch = person.fotoBase64.match(/^data:image\/(\w+);base64,/);
        const extension = extensionMatch ? (extensionMatch[1] === 'jpeg' ? 'jpeg' : 'png') : 'png';

        const imageId = workbook.addImage({
          base64: base64Data,
          extension: extension as 'jpeg' | 'png',
        });

        worksheet.addImage(imageId, {
          tl: { col: 6.1, row: rowIndex - 1 + 0.1 }, // Columna G (index 6), con un pequeño margen
          ext: { width: 90, height: 90 } // Tamaño de la imagen
        });
      } catch (err) {
        console.error('No se pudo añadir la imagen para', person.nombre, err);
        row.getCell(7).value = 'Error al cargar imagen';
      }
    } else {
      row.getCell(7).value = 'Sin foto';
    }
  });

  // Generar y descargar
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const timestamp = new Date().toISOString().slice(0, 10);
  a.download = `${fileName}-${timestamp}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Genera una plantilla Excel vacía para facilitar la importación
 */
export async function downloadExcelTemplate(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Personas');

  worksheet.columns = [
    { header: 'Nombre', key: 'nombre', width: 20 },
    { header: 'Apellido', key: 'apellido', width: 20 },
    { header: 'Cédula', key: 'cedula', width: 18 },
    { header: 'Teléfono', key: 'telefono', width: 18 },
    { header: 'RIF', key: 'rif', width: 18 },
    { header: 'Correo Electrónico', key: 'correo', width: 32 },
    { header: 'Foto', key: 'foto', width: 15 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { horizontal: 'center' };

  worksheet.addRow({
    nombre: 'Juan',
    apellido: 'Pérez',
    cedula: 'V-12345678',
    telefono: '0412-1234567',
    rif: 'J-12345678-9',
    correo: 'juan.perez@correo.com',
    foto: ''
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla-registro-personas.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
