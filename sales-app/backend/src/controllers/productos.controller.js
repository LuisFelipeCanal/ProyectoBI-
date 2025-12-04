// productos.controller.js
// Controlador para productos
// Implementa lógica CRUD y validación con Zod

import { z } from 'zod';
import {
  getAllProductos,
  getProductoById as getProductoByIdModel,
  createProducto as createProductoModel,
  updateProducto as updateProductoModel,
  deleteProducto as deleteProductoModel
} from '../models/productos.model.js';

const productoSchema = z.object({
  nombre: z.string().min(1),
  marca: z.string().min(1),
  talla: z.string().optional(),
  modelo: z.string().optional()
});

export async function getProductos(req, res, next) {
  try {
    // Puedes ajustar los parámetros según tu frontend
    const { search = '', marca = '', talla = '', page = 1, pageSize = 20 } = req.query;
    const { items, total } = await getAllProductos({ search, marca, talla, page: Number(page), pageSize: Number(pageSize) });
    res.json({ items, total });
  } catch (err) {
    next(err);
  }
}

export async function getProductoById(req, res, next) {
  try {
    const producto = await getProductoByIdModel(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    next(err);
  }
}

export async function createProducto(req, res, next) {
  try {
    // Validar los campos obligatorios
    const parse = productoSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ errors: parse.error.errors });
    // Pasar todos los campos recibidos al modelo
    await createProductoModel(req.body);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error al agregar producto:', err);
    next(err);
  }
}

export async function updateProducto(req, res, next) {
  try {
    const parse = productoSchema.partial().safeParse(req.body);
    if (!parse.success) {
      console.error('Validación fallida al actualizar producto:', parse.error.errors);
      return res.status(400).json({ errors: parse.error.errors });
    }
    const producto = await updateProductoModel(req.params.id, parse.data);
    if (!producto) {
      console.error('Producto no encontrado al actualizar:', req.params.id);
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    next(err);
  }
}

export async function deleteProducto(req, res, next) {
  try {
    await deleteProductoModel(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export function uploadImagen(req, res) {
  res.json({ message: "uploadImagen OK" });
}
