import express from 'express';
import {
  getUserProfile,
  updateProfile,
  getLeaderboard,
  getUsers,
  rateUser,
  getUserStats,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { rateUserRules } from '../middleware/validate.js';

const router = express.Router();

// Public routes
router.get('/leaderboard', getLeaderboard);
router.get('/profile/:id', getUserProfile);

// Protected routes
// NOTE: getUsers is disabled until a dedicated admin role is implemented
// router.get('/', protect, authorize('teacher'), getUsers);
router.put('/profile', protect, updateProfile);
router.get('/stats', protect, getUserStats);
router.post('/:id/rate', protect, rateUserRules, rateUser);

export default router;
