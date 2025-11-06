import express from 'express';
import AuthController from './auth.controller.js';
import { auth } from '../../middleware/auth.js';
import { validateLogin } from './auth.validation.js';

const router = express.Router();

// Public routes
router.post('/login', validateLogin, AuthController.login);

// Protected routes
router.get('/me', auth, AuthController.getMe);
router.post('/logout', auth, AuthController.logout);

export default router;
