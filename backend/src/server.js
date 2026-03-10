import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { sanitizeMiddleware } from './utils/sanitize.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';

// Load env vars
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Trust the first proxy hop (Render, Railway, Heroku, Nginx, etc.)
// Required for express-rate-limit to see the real client IP via X-Forwarded-For
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Allowed origins for CORS
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL]
  : [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// --- Security middleware ---
app.use(helmet());

// Cookie parser (required to read httpOnly auth cookies)
app.use(cookieParser());

// Body parser
app.use(express.json({ limit: '10kb' })); // Limit body size

// Enable CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman) in dev only
      if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Sanitize all incoming requests against NoSQL injection
app.use(sanitizeMiddleware);

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/mentors', mentorRoutes);

// Health check route (verifies DB connectivity)
app.get('/api/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.status(dbState === 1 ? 200 : 503).json({
      success: dbState === 1,
      message: 'Server is running',
      database: dbStatus[dbState] || 'unknown',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Health check failed',
    });
  }
});

// Error handler middleware
app.use(errorHandler);

// --- Socket.IO JWT authentication middleware ---
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, '| userId:', socket.userId);

  // Auto-join user to their personal room using authenticated userId
  connectedUsers.set(socket.userId, socket.id);
  socket.join(socket.userId);

  // Join chat room
  socket.on('chat:join', (chatRoomId) => {
    if (!chatRoomId || typeof chatRoomId !== 'string') return;
    socket.join(chatRoomId);
  });

  // Leave chat room
  socket.on('chat:leave', (chatRoomId) => {
    if (!chatRoomId || typeof chatRoomId !== 'string') return;
    socket.leave(chatRoomId);
  });

  // Send message
  socket.on('chat:message', (data) => {
    if (!data || !data.chatRoomId || !data.message) return;
    if (typeof data.message !== 'string') return;
    // Enforce maximum message length to prevent large payload abuse
    const MAX_MSG_LEN = 2000;
    const { chatRoomId } = data;
    const message = typeof data.message === 'string'
      ? data.message.trim().slice(0, MAX_MSG_LEN)
      : '';
    if (!message) return;
    socket.to(chatRoomId).emit('chat:newMessage', message);
  });

  // Typing indicator
  socket.on('chat:typing', (data) => {
    if (!data || !data.chatRoomId) return;
    const { chatRoomId, user } = data;
    socket.to(chatRoomId).emit('chat:userTyping', user);
  });

  // Stop typing indicator
  socket.on('chat:stopTyping', (data) => {
    if (!data || !data.chatRoomId) return;
    const { chatRoomId, user } = data;
    socket.to(chatRoomId).emit('chat:userStopTyping', user);
  });

  // Read receipt
  socket.on('chat:read', (data) => {
    if (!data || !data.chatRoomId) return;
    const { chatRoomId } = data;
    socket.to(chatRoomId).emit('chat:messagesRead', { userId: socket.userId });
  });

  // Task notifications — use authenticated userId as sender
  socket.on('task:taken', (data) => {
    if (!data || !data.taskPosterId || !data.message) return;
    const { taskPosterId, message } = data;
    io.to(taskPosterId).emit('notification', {
      type: 'task_taken',
      message,
    });
  });

  socket.on('task:submitted', (data) => {
    if (!data || !data.taskPosterId || !data.message) return;
    const { taskPosterId, message } = data;
    io.to(taskPosterId).emit('notification', {
      type: 'task_submitted',
      message,
    });
  });

  socket.on('task:completed', (data) => {
    if (!data || !data.userId || !data.message) return;
    const { userId, message, credits } = data;
    io.to(userId).emit('notification', {
      type: 'task_completed',
      message,
      credits,
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    connectedUsers.delete(socket.userId);
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// --- Start server only when run directly (not imported for tests) ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Validate required environment variables before anything else
  const required = ['JWT_SECRET', 'MONGODB_URI'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  await connectDB();
  
  httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

// Only start if this file is the entry point (not imported by tests)
if (process.argv[1]?.includes('server.js')) {
  startServer();
}

// --- Graceful shutdown ---
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  httpServer.close(() => {
    console.log('HTTP server closed.');
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  httpServer.close(() => process.exit(1));
});

// Export for testing
export { app, httpServer, io, startServer };
