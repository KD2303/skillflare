import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  updatePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerRules,
  loginRules,
  updatePasswordRules,
} from '../middleware/validate.js';

const router = express.Router();

router.post('/register', authLimiter, registerRules, register);
router.post('/login', authLimiter, loginRules, login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/updatepassword', protect, authLimiter, updatePasswordRules, updatePassword);

export default router;
