// upload.routes.js
import express from 'express';
import * as uploadController from '../controllers/upload.controller.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// POST /api/upload/image
router.post('/image', upload.single('file'), uploadController.uploadImage);
// POST /api/ventas/import
router.post('/ventas/import', upload.single('file'), uploadController.importCsv);

export default router;
