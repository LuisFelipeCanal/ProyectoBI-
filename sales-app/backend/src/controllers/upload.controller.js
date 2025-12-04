// upload.controller.js
// Controlador para upload de imágenes y CSV
// Implementa lógica de importación y respuesta de conteos/errores

export function uploadImage(req, res) {
	res.json({ message: "uploadImage OK" });
}

export async function importCsv(req, res) {
	try {
		const file = req.file;
		if (!file) {
			return res.status(400).json({ error: "No se recibió archivo." });
		}

		const path = file.path;
		// Import dinámico compatible con ES Modules
		const { parseCsvVentas } = await import("../utils/csvImport.js");
		const ventasModel = await import("../models/ventas.model.js");
		const vendedoresModel = await import("../models/vendedores.model.js");
		const productosModel = await import("../models/productos.model.js");

		// Parsear y validar el CSV
		const { rows, errors } = await parseCsvVentas(path);

		let resumen = {
			totalFilas: rows.length,
			ventasInsertadas: 0,
			productosUpsert: 0,
			vendedoresUpsert: 0,
			errores: errors,
		};

		// Usar un Set para evitar upserts duplicados
		const vendedoresProcesados = new Set();
		const productosProcesados = new Set();

		for (const row of rows) {
			// Upsert vendedor
			if (row.vendedor && !vendedoresProcesados.has(row.vendedor)) {
				await vendedoresModel.upsertVendedor(row.vendedor);
				vendedoresProcesados.add(row.vendedor);
				resumen.vendedoresUpsert++;
			}
			// Upsert producto
			const productoObj = {
				nombre: row.producto || row['Producto'],
				marca: row.marca || row['Marca'],
				talla: row.talla || row['Talla'],
				categoria: row.categoria || row['Categoria'] || null,
				precio_compra: row.precio_compra || row['Precio Unitario (Compra)'] || null,
				precio_venta: row.precio_venta || row['Precio Unitario (Venta)'] || null,
				stock: row.stock || null,
				descripcion: row.descripcion || null,
				imagen_url: row.imagen_url || row['ImagenURL'] || row['Imagen URL'] || null
			};
			if (productoObj.nombre && productoObj.marca && productoObj.talla && !productosProcesados.has(productoObj.nombre + productoObj.marca + productoObj.talla)) {
				await productosModel.upsertProducto(productoObj);
				productosProcesados.add(productoObj.nombre + productoObj.marca + productoObj.talla);
				resumen.productosUpsert++;
			}
			// Insertar venta
			try {
				await ventasModel.insertVenta(row);
				resumen.ventasInsertadas++;
			} catch (err) {
				resumen.errores.push({ fila: row, error: err.message });
			}
		}

		res.json({
			message: "Importación completada",
			resumen,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}
