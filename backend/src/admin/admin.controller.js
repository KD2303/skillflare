/**
 * Admin Controller
 * Handles all admin-related HTTP requests
 */

import asyncHandler from "../utils/asyncHandler.js";
import * as adminService from "./admin.service.js";
import { getAdminLogs, getAdminActivityStats } from "./admin.audit.js";

// ============= USER MANAGEMENT =============

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, role, isBanned, search } = req.query;

  const filters = {};
  if (role) filters.role = role;
  if (isBanned === "true") filters.isBanned = true;
  if (isBanned === "false") filters.isBanned = false;

  let result;
  if (search) {
    result = await adminService.searchUsers(
      search,
      parseInt(page),
      parseInt(limit),
    );
  } else {
    result = await adminService.getAllUsers(
      filters,
      parseInt(page),
      parseInt(limit),
    );
  }

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const getUserDetails = asyncHandler(async (req, res) => {
  const user = await adminService.getUserDetails(req.params.userId);

  res.status(200).json({
    success: true,
    user,
  });
});

export const banUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      error: "Reason is required",
    });
  }

  const user = await adminService.banUser(
    req.params.userId,
    req.user.id,
    reason,
    req,
  );

  res.status(200).json({
    success: true,
    message: "User banned successfully",
    user,
  });
});

export const unbanUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      error: "Reason is required",
    });
  }

  const user = await adminService.unbanUser(
    req.params.userId,
    req.user.id,
    reason,
    req,
  );

  res.status(200).json({
    success: true,
    message: "User unbanned successfully",
    user,
  });
});

export const suspendUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      error: "Reason is required",
    });
  }

  const user = await adminService.suspendUser(
    req.params.userId,
    req.user.id,
    reason,
    req,
  );

  res.status(200).json({
    success: true,
    message: "User suspended successfully",
    user,
  });
});

export const unsuspendUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      error: "Reason is required",
    });
  }

  const user = await adminService.unsuspendUser(
    req.params.userId,
    req.user.id,
    reason,
    req,
  );

  res.status(200).json({
    success: true,
    message: "User unsuspended successfully",
    user,
  });
});

export const changeUserRole = asyncHandler(async (req, res) => {
  const { newRole } = req.body;

  if (!newRole) {
    return res.status(400).json({
      success: false,
      error: "New role is required",
    });
  }

  const user = await adminService.changeUserRole(
    req.params.userId,
    newRole,
    req.user.id,
    req,
  );

  res.status(200).json({
    success: true,
    message: "User role changed successfully",
    user,
  });
});

// ============= TASK MANAGEMENT =============

export const getAllTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, status } = req.query;

  const filters = {};
  if (status) filters.status = status;

  const result = await adminService.getAllTasks(
    filters,
    parseInt(page),
    parseInt(limit),
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const editTask = asyncHandler(async (req, res) => {
  const task = await adminService.editTask(
    req.params.taskId,
    req.body,
    req.user.id,
    req,
  );

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    task,
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      error: "Reason is required",
    });
  }

  const result = await adminService.deleteTask(
    req.params.taskId,
    req.user.id,
    reason,
    req,
  );

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// ============= REPORTS MANAGEMENT =============

export const getAllReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, status, type } = req.query;

  const filters = {};
  if (status) filters.status = status;
  if (type) filters.type = type;

  const result = await adminService.getAllReports(
    filters,
    parseInt(page),
    parseInt(limit),
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const takeReportAction = asyncHandler(async (req, res) => {
  const { action, actionNotes } = req.body;

  if (!action || !actionNotes) {
    return res.status(400).json({
      success: false,
      error: "Action and notes are required",
    });
  }

  const report = await adminService.takeReportAction(
    req.params.reportId,
    action,
    actionNotes,
    req.user.id,
    req,
  );

  res.status(200).json({
    success: true,
    message: "Report action taken successfully",
    report,
  });
});

// ============= AI MANAGEMENT =============

export const getAILogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, flagged } = req.query;

  const filters = {};
  if (flagged === "true") filters.isFlagged = true;

  const result = await adminService.getAILogs(
    filters,
    parseInt(page),
    parseInt(limit),
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

// ============= SYSTEM CONFIGURATION =============

export const getSystemConfig = asyncHandler(async (req, res) => {
  const config = await adminService.getSystemConfig();

  res.status(200).json({
    success: true,
    config,
  });
});

export const updateSystemConfig = asyncHandler(async (req, res) => {
  const config = await adminService.updateSystemConfig(
    req.body,
    req.user.id,
    req,
  );

  res.status(200).json({
    success: true,
    message: "System configuration updated successfully",
    config,
  });
});

export const updateAISettings = asyncHandler(async (req, res) => {
  const aiSettings = await adminService.updateAISettings(
    req.body,
    req.user.id,
    req,
  );

  res.status(200).json({
    success: true,
    message: "AI settings updated successfully",
    aiSettings,
  });
});

// ============= ANALYTICS =============

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminService.getAnalytics();

  res.status(200).json({
    success: true,
    analytics,
  });
});

// ============= AUDIT LOGS =============

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, action, adminId } = req.query;

  const filters = {};
  if (action) filters.action = action;
  if (adminId) filters.adminId = adminId;

  const result = await getAdminLogs(filters, parseInt(page), parseInt(limit));

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const getActivityStats = asyncHandler(async (req, res) => {
  const stats = await getAdminActivityStats();

  res.status(200).json({
    success: true,
    stats,
  });
});

export default {
  getAllUsers,
  getUserDetails,
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
  changeUserRole,
  getAllTasks,
  editTask,
  deleteTask,
  getAllReports,
  takeReportAction,
  getAILogs,
  getSystemConfig,
  updateSystemConfig,
  updateAISettings,
  getAnalytics,
  getAuditLogs,
  getActivityStats,
};
