import express from 'express';
import { register, login, adminLogin, guestLogin } from '../controllers/authController.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import { registerSchema, loginSchema } from '../validations/authValidation.js';

const router = express.Router();

// 1. User Registration Route
router.post('/register', validateBody(registerSchema), register);

// 2. User Login Route
router.post('/login', validateBody(loginSchema), login);

// 3. Admin Login Route
router.post('/admin-login', validateBody(loginSchema), adminLogin);

// 4. Guest Devotee Login Route
router.post('/guest-login', guestLogin);

export default router;
