import express from 'express';
import { getTempleData, updateTempleData } from '../controllers/templeController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import { templeUpdateSchema } from '../validations/templeValidation.js';

const router = express.Router();

// 1. GET Temple Data (Publicly accessible)
router.get('/temple-data', getTempleData);

// 2. POST Temple Data (Protected: Admin Token required)
router.post('/temple-data', verifyToken, isAdmin, validateBody(templeUpdateSchema), updateTempleData);

export default router;
