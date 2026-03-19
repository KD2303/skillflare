/**
 * Admin Routes
 * All admin endpoints with protection middleware
 */

import express from "express";
import { protect } from "../middleware/auth.js";
import isAdmin from "./admin.middleware.js";
import * as adminController from "./admin.controller.js";

const router = express.Router();

// Disable caching and ETags for admin routes (prevent 304 responses)
// Admin data should always be fresh from the server
router.use((req, res, next) => {
  // Disable ETag generation to prevent client-side caching
  res.set({
    "Cache-Control":
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
  });
  next();
});

// Apply authentication and admin check to all admin routes
router.use(protect);
router.use(isAdmin);

// ============= USER MANAGEMENT ROUTES =============
router.get("/users", adminController.getAllUsers);
router.get("/users/:userId", adminController.getUserDetails);
router.patch("/users/:userId/ban", adminController.banUser);
router.patch("/users/:userId/unban", adminController.unbanUser);
router.patch("/users/:userId/suspend", adminController.suspendUser);
router.patch("/users/:userId/unsuspend", adminController.unsuspendUser);
router.patch("/users/:userId/role", adminController.changeUserRole);

// ============= TASK MANAGEMENT ROUTES =============
router.get("/tasks", adminController.getAllTasks);
router.patch("/tasks/:taskId", adminController.editTask);
router.delete("/tasks/:taskId", adminController.deleteTask);

// ============= REPORTS MANAGEMENT ROUTES =============
router.get("/reports", adminController.getAllReports);
router.post("/reports/:reportId/action", adminController.takeReportAction);

// ============= AI MANAGEMENT ROUTES =============
router.get("/ai/logs", adminController.getAILogs);

// ============= SYSTEM CONFIGURATION ROUTES =============
router.get("/system/config", adminController.getSystemConfig);
router.put("/system/config", adminController.updateSystemConfig);
router.put("/system/ai-settings", adminController.updateAISettings);

// ============= ANALYTICS ROUTES =============
router.get("/analytics", adminController.getAnalytics);

// ============= AUDIT LOG ROUTES =============
router.get("/logs", adminController.getAuditLogs);
router.get("/logs/stats", adminController.getActivityStats);

export default router;
