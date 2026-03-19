import express from "express";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  takeTask,
  submitTask,
  reviewTask,
  reassignTask,
  getTasksByUser,
  getMyTasks,
  deleteTask,
} from "../controllers/taskController.js";
import { protect, isStudent } from "../middleware/auth.js";
import {
  createTaskRules,
  submitTaskRules,
  reviewTaskRules,
} from "../middleware/validate.js";

const router = express.Router();

// Public routes
router.get("/", getTasks);
router.get("/user/:userId", getTasksByUser);

// Protected routes
router.get("/my-tasks", protect, getMyTasks);
router.post("/", protect, createTaskRules, createTask);
router.put("/:id", protect, updateTask);
router.get("/:id", getTask);
router.put("/:id/take", protect, isStudent, takeTask);
router.put("/:id/submit", protect, submitTaskRules, submitTask);
router.put("/:id/review", protect, reviewTaskRules, reviewTask);
router.put("/:id/reassign", protect, reassignTask);
router.delete("/:id", protect, deleteTask);

export default router;
