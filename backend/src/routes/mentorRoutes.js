import express from 'express';
import {
  getMentors,
  getMentorById,
  applyAsMentor,
  updateMentorProfile,
  addSkill,
  uploadVerification,
  verifySkill,
  requestSession,
  getMyRequests,
  respondToRequest,
  completeSession,
} from '../controllers/mentorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getMentors);
router.get('/:id', getMentorById);

// Protected routes
router.post('/apply', protect, applyAsMentor);
router.put('/update', protect, updateMentorProfile);
router.post('/add-skill', protect, addSkill);
router.post('/upload-verification', protect, uploadVerification);
router.post('/request-session', protect, requestSession);
router.get('/my-requests', protect, getMyRequests);
router.put('/respond/:requestId', protect, respondToRequest);
router.put('/complete/:requestId', protect, completeSession);

// Admin routes
router.put('/admin/verify-skill/:mentorId/:skillId', protect, authorize('admin', 'teacher'), verifySkill);

export default router;
