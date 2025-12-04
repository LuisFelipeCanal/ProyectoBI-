// productos.routes.js
import express from 'express';
import * as productosController from '../controllers/productos.controller.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// GET /api/productos
router.get('/', productosController.getProductos);
// GET /api/productos/:id
router.get('/:id', productosController.getProductoById);
// POST /api/productos
router.post('/', productosController.createProducto);
// PUT /api/productos/:id
router.put('/:id', productosController.updateProducto);
// DELETE /api/productos/:id
router.delete('/:id', productosController.deleteProducto);
// POST /api/productos/:id/imagen
router.post('/:id/imagen', upload.single('file'), productosController.uploadImagen);

export default router;
