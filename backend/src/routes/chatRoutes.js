import express from 'express';
import {
  getChatByTask,
  getChatRoom,
  sendMessage,
  markAsRead,
  getMyChats,
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';
import { chatLimiter } from '../middleware/rateLimiter.js';
import { sendMessageRules } from '../middleware/validate.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/my-chats', getMyChats);
router.get('/task/:taskId', getChatByTask);
router.get('/:id', getChatRoom);
router.post('/:id/message', chatLimiter, sendMessageRules, sendMessage);
router.put('/:id/read', markAsRead);

export default router;
