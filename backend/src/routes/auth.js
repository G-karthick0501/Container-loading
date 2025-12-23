import express from 'express';
import { signup, login, getMe } from '../controller/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';  // ADD THIS

const router = express.Router();

router.post('/signup', authLimiter, signup);  // ADD authLimiter
router.post('/login', authLimiter, login);    // ADD authLimiter
router.get('/me', protect, getMe);

export default router;