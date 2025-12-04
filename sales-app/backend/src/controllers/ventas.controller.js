// ventas.controller.js
import { getAllVentas, updateVenta as updateVentaModel } from '../models/ventas.model.js';
import { insertVenta } from '../models/ventas.model.js';
// Controlador para ventas
// Implementa lógica CRUD, validación y recalculo de totales

export function getVentas(req, res) {
		getAllVentas({
			search: req.query.search || '',
			page: Number(req.query.page) || 1,
			pageSize: Number(req.query.pageSize) || 100
		})
			.then(result => res.json(result))
			.catch(err => res.status(500).json({ error: err.message }));
}

export function getVentaById(req, res) {
	res.json({ message: "getVentaById OK" });
}

// Crear venta en la base de datos
export async function createVenta(req, res) {
  try {
    console.log('Datos recibidos para venta:', req.body); // <-- Agrega esta línea
    await insertVenta(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al registrar venta:', err); // <-- Este log muestra el error real
    res.status(500).json({ error: err.message, detalle: err });
  }
}

export async function updateVenta(req, res) {
	try {
		await updateVentaModel(req.params.id, req.body);
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

export function deleteVenta(req, res) {
	res.json({ message: "deleteVenta OK" });
}
