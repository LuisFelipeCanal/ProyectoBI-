// Actualiza una venta en la base de datos
export async function updateVenta(id, data) {
	// Buscar producto y vendedor por nombre
	const [prodRows] = await pool.query('SELECT id FROM productos WHERE nombre = ? AND marca = ? AND talla = ?', [data.producto, data.marca, data.talla]);
	const producto_id = prodRows[0]?.id;
	const [compRows] = await pool.query('SELECT id FROM compradores WHERE nombre = ?', [data.comprador]);
	const comprador_id = compRows[0]?.id || null;
	if (!producto_id) throw new Error('Producto no encontrado');

	await pool.query(
		`UPDATE ventas SET
		 producto_id = ?,
		 comprador_id = ?,
			fecha_adquisicion = ?,
			fecha_venta = ?,
			precio_unitario_compra = ?,
			precio_unitario_venta = ?,
			descuento = ?,
			precio_final = ?,
			ingreso_total = ?,
			costo_total = ?,
			ganancia_total = ?
		WHERE id = ?`,
		[
			producto_id,
			vendedor_id,
			data.fecha_adquisicion,
			data.fecha_venta,
			data.precio_unitario_compra,
			data.precio_unitario_venta,
			data.descuento,
			data.precio_final,
			data.ingreso_total,
			data.costo_total,
			data.ganancia_total,
			id
		]
	);
}
import pool from '../db.js';

// Inserta una venta en la base de datos
// Al crear venta, no permitir especificar el ID manualmente
export async function insertVenta(data) {
	// Usar directamente el id del producto recibido
	const producto_id = data.producto_id;
	if (!producto_id) throw new Error('Debes enviar el id del producto');

	// Buscar comprador por nombre (si existe), si no existe lo crea
	let comprador_id = null;
	if (data.comprador) {
		const [compRows] = await pool.query('SELECT id FROM compradores WHERE nombre = ?', [data.comprador]);
		if (compRows.length > 0) {
			comprador_id = compRows[0].id;
		} else {
			// Crear comprador y obtener su id
			const result = await pool.query('INSERT INTO compradores (nombre) VALUES (?)', [data.comprador]);
			comprador_id = result[0].insertId;
			// Generar identificador personalizado para comprador
			const codigoComprador = `TC${String(comprador_id).padStart(4, '0')}`;
			await pool.query('UPDATE compradores SET codigo = ? WHERE id = ?', [codigoComprador, comprador_id]);
		}
	}

	const cantidad = parseInt(data.cantidad) > 0 ? parseInt(data.cantidad) : 1;
	// Validar stock suficiente antes de registrar la venta
	const [prodRows] = await pool.query('SELECT stock FROM productos WHERE id = ?', [producto_id]);
	if (!prodRows.length || prodRows[0].stock < cantidad) {
		throw new Error('¡Se agotó el producto! No hay stock suficiente para registrar la venta.');
	}
	for (let i = 0; i < cantidad; i++) {
		const result = await pool.query(
			`INSERT INTO ventas (
			 producto_id, comprador_id, fecha_adquisicion, fecha_venta,
			 precio_unitario_compra, precio_unitario_venta, descuento, precio_final,
			 ingreso_total, costo_total, ganancia_total, imagen_url
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			 [
			 producto_id,
			 comprador_id,
			 data.fecha_adquisicion,
			 data.fecha_venta,
			 data.precio_unitario_compra,
			 data.precio_unitario_venta,
			 data.descuento,
			 data.precio_final,
			 data.ingreso_total,
			 data.costo_total,
			 data.ganancia_total,
			 data.imagen_url || null
			 ]
		);
		const id = result[0].insertId;
		const codigo = `TB${String(id).padStart(4, '0')}`;
		await pool.query('UPDATE ventas SET codigo = ? WHERE id = ?', [codigo, id]);
	}
	// Actualizar el stock del producto después de registrar la venta
	await pool.query('UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?', [cantidad, producto_id, cantidad]);
}
// Añadir ventas manualmente con id 501 y 502
export async function insertarVentasDemo() {
	await pool.query(
		`INSERT INTO ventas (id, producto_id, comprador_id, fecha_adquisicion, fecha_venta, precio_unitario_compra, precio_unitario_venta, descuento, precio_final, ingreso_total, costo_total, ganancia_total)
		 VALUES
		 (501, 1, 1, '2025-11-01', '2025-11-28', 100, 150, 0, 150, 150, 100, 50),
		 (502, 2, 2, '2025-11-02', '2025-11-28', 120, 180, 10, 162, 162, 120, 42)
	`
	);
}
// Añadir ventas masivas para pruebas de paginación
export async function insertarVentasMasivas(cantidad = 100) {
	// Obtener IDs válidos de productos y compradores
	const [productos] = await pool.query('SELECT id FROM productos LIMIT 10');
	const [compradores] = await pool.query('SELECT id FROM compradores LIMIT 10');
	for (let i = 0; i < cantidad; i++) {
		const producto_id = productos[i % productos.length]?.id || 1;
		const comprador_id = compradores[i % compradores.length]?.id || 1;
		await pool.query(
			`INSERT INTO ventas (producto_id, comprador_id, fecha_adquisicion, fecha_venta, precio_unitario_compra, precio_unitario_venta, descuento, precio_final, ingreso_total, costo_total, ganancia_total)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				producto_id,
				comprador_id,
				'2025-11-01',
				'2025-11-28',
				100 + i,
				150 + i,
				i % 20,
				150 + i - (i % 20),
				150 + i - (i % 20),
				100 + i,
				50 + i
			]
		);
	}
}
// ventas.model.js
// Obtener todas las ventas
export async function getAllVentas({ search = '', page = 1, pageSize = 100 }) {
	const offset = (page - 1) * pageSize;
	let where = [];
	let params = [];
	if (search) {
		where.push('(producto_id IN (SELECT id FROM productos WHERE nombre LIKE ?) )');
		params.push(`%${search}%`);
	}
	const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';
	const [rows] = await pool.query(
		`SELECT v.*, p.nombre as producto, p.marca, p.talla, p.imagen_url, comp.nombre as comprador
		 FROM ventas v
		 LEFT JOIN productos p ON v.producto_id = p.id
		 LEFT JOIN compradores comp ON v.comprador_id = comp.id
		 ${whereClause}
		ORDER BY v.id ASC
		 LIMIT ? OFFSET ?`,
		[...params, pageSize, offset]
	);
	const [countRows] = await pool.query(
		`SELECT COUNT(*) as total FROM ventas ${whereClause}`,
		params
	);
	const total = countRows.length > 0 ? countRows[0].total : 0;
	return { items: rows, total };
}
// Modelo para ventas
// Implementa funciones de acceso a la tabla ventas usando pool y SQL parametrizado
