export async function updateProducto(id, data) {
  // Solo actualiza los campos que vienen en data
  console.log('updateProducto - id:', id, 'data:', data);
  const fields = [];
  const params = [];
  for (const key of Object.keys(data)) {
    fields.push(`${key} = ?`);
    params.push(data[key]);
  }
  if (!fields.length) {
    console.log('updateProducto - No fields to update');
    return null;
  }
  params.push(id);
  const sql = `UPDATE productos SET ${fields.join(', ')} WHERE id = ?`;
  console.log('updateProducto - SQL:', sql, 'params:', params);
  const [result] = await pool.query(sql, params);
  console.log('updateProducto - result:', result);
  return await getProductoById(id);
}
// Inserta o actualiza un producto por nombre, marca y talla
export async function upsertProducto(producto) {
  const {
    nombre, marca, talla, categoria, precio_compra, precio_venta, stock, descripcion, imagen_url
  } = producto;
  await pool.query(
    `INSERT INTO productos (nombre, marca, talla, categoria, precio_compra, precio_venta, stock, descripcion, imagen_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       categoria=VALUES(categoria),
       precio_compra=VALUES(precio_compra),
       precio_venta=VALUES(precio_venta),
       stock=VALUES(stock),
       descripcion=VALUES(descripcion),
       imagen_url=VALUES(imagen_url)`,
    [nombre, marca, talla, categoria, precio_compra, precio_venta, stock, descripcion, imagen_url]
  );
  // Devuelve el registro actualizado
  const [rows] = await pool.query(
    'SELECT * FROM productos WHERE nombre = ? AND marca = ? AND talla = ?',
    [nombre, marca, talla]
  );
  return rows[0] || null;
}
// productos.model.js
// Modelo para productos
// Implementa funciones de acceso a la tabla productos usando pool y SQL parametrizado

import pool from '../db.js';

export async function getAllProductos({ search = '', marca = '', talla = '', page = 1, pageSize = 20 }) {
  const offset = (page - 1) * pageSize;
  let where = [];
  let params = [];
  if (search) {
    where.push('(nombre LIKE ? OR marca LIKE ? OR talla LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (marca) {
    where.push('marca = ?');
    params.push(marca);
  }
  if (talla) {
    where.push('talla = ?');
    params.push(talla);
  }
  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';
  const [rows] = await pool.query(
    `SELECT * FROM productos ${whereClause} ORDER BY fecha_creacion DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total FROM productos ${whereClause}`,
    params
  );
  const total = countRows.length > 0 ? countRows[0].total : 0;
  return { items: rows, total };
}

export async function getProductoById(id) {
  const idNum = Number(id);
  if (isNaN(idNum)) return null;
  const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [idNum]);
  return rows[0] || null;
}

// Al crear producto, no permitir especificar el ID manualmente
export async function createProducto(data) {
  // El ID se asigna automáticamente por MySQL
  const {
    nombre,
    marca,
    modelo,
    talla,
    precio_compra,
    precio_venta,
    stock,
    imagen_url
  } = data;
  const stockValue = (stock === undefined || stock === null || stock === '') ? 1 : stock;
  const fecha_creacion = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const result = await pool.query(
    `INSERT INTO productos (nombre, marca, modelo, talla, precio_compra, precio_venta, stock, imagen_url, fecha_creacion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, marca, modelo || null, talla, precio_compra, precio_venta, stockValue, imagen_url, fecha_creacion]
  );
  const id = result[0].insertId;
  const codigo = `PA${String(id).padStart(4, '0')}`;
  await pool.query('UPDATE productos SET codigo = ? WHERE id = ?', [codigo, id]);
  const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function deleteProducto(id) {
  await pool.query('DELETE FROM productos WHERE id = ?', [id]);
  return true;
}

