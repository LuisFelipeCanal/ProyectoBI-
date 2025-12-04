import pool from '../db.js';

// Inserta o actualiza un vendedor por nombre
export async function upsertVendedor(nombre) {
	// Si el vendedor ya existe, no hace nada; si no, lo crea
	await pool.query('INSERT IGNORE INTO vendedores (nombre) VALUES (?)', [nombre]);
	// Devuelve el registro
	const [rows] = await pool.query('SELECT * FROM vendedores WHERE nombre = ?', [nombre]);
	return rows[0] || null;
}
// vendedores.model.js
// Modelo para vendedores
// Implementa funciones de acceso a la tabla vendedores usando pool y SQL parametrizado
