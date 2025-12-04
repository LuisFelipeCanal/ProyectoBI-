// csvImport.js
// Utilidad para importar y validar CSV
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import dayjs from 'dayjs';

// Define el esquema Zod para validar cada fila, incluyendo Imagen URL
export const ventaSchema = z.object({
  'ID': z.string().optional(),
  'Fecha Adquisición': z.string().refine(val => dayjs(val, 'YYYY-MM-DD', true).isValid(), 'Fecha Adquisición inválida'),
  'Fecha Venta': z.string().refine(val => dayjs(val, 'YYYY-MM-DD', true).isValid(), 'Fecha Venta inválida'),
  'Producto': z.string().min(1),
  'Marca': z.string().min(1),
  'Talla': z.string().min(1),
  'Precio Unitario (Compra)': z.coerce.number(),
  'Precio Unitario (Venta)': z.coerce.number(),
  'Descuento (%)': z.coerce.number().min(0).max(100),
  'Precio Final (Venta)': z.coerce.number(),
  'Ingreso Total': z.coerce.number(),
  'Costo Total': z.coerce.number(),
  'Ganancia Total': z.coerce.number(),
  'Vendedor': z.string().min(1),
  'Imagen URL': z.string().url().optional()
});

export function parseCsv(buffer) {
  return parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });
}

// Función para leer, parsear y validar el CSV de ventas
export async function parseCsvVentas(filePath) {
  const buffer = fs.readFileSync(filePath);
  const rawRows = parseCsv(buffer);
  const rows = [];
  const errors = [];
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const result = ventaSchema.safeParse(row);
    if (result.success) {
      // Normaliza los campos para el modelo
      rows.push({
        id: row['ID'] || undefined,
        fecha_adquisicion: row['Fecha Adquisición'],
        fecha_venta: row['Fecha Venta'],
        producto: row['Producto'],
        marca: row['Marca'],
        talla: row['Talla'],
        precio_compra: row['Precio Unitario (Compra)'],
        precio_venta: row['Precio Unitario (Venta)'],
        descuento: row['Descuento (%)'],
        precio_final: row['Precio Final (Venta)'],
        ingreso_total: row['Ingreso Total'],
        costo_total: row['Costo Total'],
        ganancia_total: row['Ganancia Total'],
        vendedor: row['Vendedor'],
        imagen_url: row['Imagen URL'] || undefined
      });
    } else {
      errors.push({ fila: i + 1, error: result.error.errors });
    }
  }
  return { rows, errors };
}
