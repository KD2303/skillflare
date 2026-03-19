/**
 * Admin API Service
 * Frontend service for communicating with admin APIs
 */

import { api } from "./index.js";

// ============= USER MANAGEMENT =============
export const getAdminUsers = (page = 1, limit = 50, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters,
  });
  return api.get(`/admin/users?${params}`);
};

export const getUserDetails = (userId) => {
  return api.get(`/admin/users/${userId}`);
};

export const banUser = (userId, reason) => {
  return api.patch(`/admin/users/${userId}/ban`, { reason });
};

export const unbanUser = (userId, reason) => {
  return api.patch(`/admin/users/${userId}/unban`, { reason });
};

export const suspendUser = (userId, reason) => {
  return api.patch(`/admin/users/${userId}/suspend`, { reason });
};

export const unsuspendUser = (userId, reason) => {
  return api.patch(`/admin/users/${userId}/unsuspend`, { reason });
};

export const changeUserRole = (userId, newRole) => {
  return api.patch(`/admin/users/${userId}/role`, { newRole });
};

// ============= TASK MANAGEMENT =============
export const getAdminTasks = (page = 1, limit = 50, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters,
  });
  return api.get(`/admin/tasks?${params}`);
};

export const editTask = (taskId, updateData) => {
  return api.patch(`/admin/tasks/${taskId}`, updateData);
};

export const deleteTask = (taskId, reason) => {
  return api.delete(`/admin/tasks/${taskId}`, { data: { reason } });
};

// ============= REPORTS MANAGEMENT =============
export const getAdminReports = (page = 1, limit = 50, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters,
  });
  return api.get(`/admin/reports?${params}`);
};

export const takeReportAction = (reportId, action, actionNotes) => {
  return api.post(`/admin/reports/${reportId}/action`, {
    action,
    actionNotes,
  });
};

// ============= AI MANAGEMENT =============
export const getAdminAILogs = (page = 1, limit = 50, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters,
  });
  return api.get(`/admin/ai/logs?${params}`);
};

// ============= SYSTEM CONFIGURATION =============
export const getSystemConfig = () => {
  return api.get("/admin/system/config");
};

export const updateSystemConfig = (configData) => {
  return api.put("/admin/system/config", configData);
};

export const updateAISettings = (aiSettings) => {
  return api.put("/admin/system/ai-settings", aiSettings);
};

// ============= ANALYTICS =============
export const getAnalytics = () => {
  return api.get("/admin/analytics");
};

// ============= AUDIT LOGS =============
export const getAuditLogs = (page = 1, limit = 50, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters,
  });
  return api.get(`/admin/logs?${params}`);
};

export const getActivityStats = () => {
  return api.get("/admin/logs/stats");
};

export default {
  getAdminUsers,
  getUserDetails,
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
  changeUserRole,
  getAdminTasks,
  editTask,
  deleteTask,
  getAdminReports,
  takeReportAction,
  getAdminAILogs,
  getSystemConfig,
  updateSystemConfig,
  updateAISettings,
  getAnalytics,
  getAuditLogs,
  getActivityStats,
};
