// ventas.routes.js
import express from 'express';
import * as ventasController from '../controllers/ventas.controller.js';

const router = express.Router();

// GET /api/ventas
router.get('/', ventasController.getVentas);
// GET /api/ventas/:id
router.get('/:id', ventasController.getVentaById);
// POST /api/ventas
router.post('/', ventasController.createVenta);
// PUT /api/ventas/:id
router.put('/:id', ventasController.updateVenta);
// DELETE /api/ventas/:id
router.delete('/:id', ventasController.deleteVenta);

// Endpoint para insertar ventas demo (solo para pruebas)
router.post('/demo', async (req, res) => {
  try {
    const { insertarVentasDemo } = await import('../models/ventas.model.js');
    await insertarVentasDemo();
    res.json({ success: true, message: 'Ventas demo insertadas.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para insertar ventas masivas
router.post('/masivas', async (req, res) => {
  try {
    const cantidad = Number(req.body.cantidad) || 100;
    const { insertarVentasMasivas } = await import('../models/ventas.model.js');
    await insertarVentasMasivas(cantidad);
    res.json({ success: true, message: `Se insertaron ${cantidad} ventas de prueba.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
