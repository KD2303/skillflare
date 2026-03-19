/**
 * Admin Service
 * Business logic for all admin operations
 */

import User from "../models/User.js";
import Task from "../models/Task.js";
import Report from "../models/Report.js";
import AILog from "../models/AILog.js";
import SystemConfig from "../models/SystemConfig.js";
import { logAdminAction } from "./admin.audit.js";

// ============= USER MANAGEMENT =============

export const getAllUsers = async (filters = {}, page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;

    const query = User.find(filters);
    const total = await User.countDocuments(filters);
    const users = await query
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
};

export const getUserDetails = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

export const banUser = async (userId, adminId, reason, req) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isBanned: true },
      { new: true },
    );

    if (!user) {
      throw new Error("User not found");
    }

    await logAdminAction(
      adminId,
      "user_ban",
      userId,
      "User",
      user.email,
      `User banned: ${reason}`,
      { isBanned: true },
      req,
    );

    return user;
  } catch (error) {
    throw error;
  }
};

export const unbanUser = async (userId, adminId, reason, req) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isBanned: false },
      { new: true },
    );

    if (!user) {
      throw new Error("User not found");
    }

    await logAdminAction(
      adminId,
      "user_unban",
      userId,
      "User",
      user.email,
      `User unbanned: ${reason}`,
      { isBanned: false },
      req,
    );

    return user;
  } catch (error) {
    throw error;
  }
};

export const suspendUser = async (userId, adminId, reason, req) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: true },
      { new: true },
    );

    if (!user) {
      throw new Error("User not found");
    }

    await logAdminAction(
      adminId,
      "user_suspend",
      userId,
      "User",
      user.email,
      `User suspended: ${reason}`,
      { isSuspended: true },
      req,
    );

    return user;
  } catch (error) {
    throw error;
  }
};

export const unsuspendUser = async (userId, adminId, reason, req) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: false },
      { new: true },
    );

    if (!user) {
      throw new Error("User not found");
    }

    await logAdminAction(
      adminId,
      "user_unsuspend",
      userId,
      "User",
      user.email,
      `User unsuspended: ${reason}`,
      { isSuspended: false },
      req,
    );

    return user;
  } catch (error) {
    throw error;
  }
};

export const changeUserRole = async (userId, newRole, adminId, req) => {
  try {
    const validRoles = ["student", "teacher", "admin"];
    if (!validRoles.includes(newRole)) {
      throw new Error("Invalid role");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const oldRole = user.role;
    user.role = newRole;
    await user.save();

    await logAdminAction(
      adminId,
      "role_change",
      userId,
      "User",
      user.email,
      `Role changed from ${oldRole} to ${newRole}`,
      { oldRole, newRole },
      req,
    );

    return user;
  } catch (error) {
    throw error;
  }
};

export const searchUsers = async (query, page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;

    const searchQuery = User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    });

    const total = await User.countDocuments({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    });

    const users = await searchQuery
      .select("-password")
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw error;
  }
};

// ============= TASK MANAGEMENT =============

export const getAllTasks = async (filters = {}, page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;

    const query = Task.find(filters);
    const total = await Task.countDocuments(filters);
    const tasks = await query
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("postedBy", "name email")
      .populate("assignedTo", "name email")
      .exec();

    return {
      tasks,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw error;
  }
};

export const deleteTask = async (taskId, adminId, reason, req) => {
  try {
    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    await logAdminAction(
      adminId,
      "task_delete",
      taskId,
      "Task",
      task.title,
      `Task deleted: ${reason}`,
      { deletedTask: task.toObject() },
      req,
    );

    return { message: "Task deleted successfully", task };
  } catch (error) {
    throw error;
  }
};

export const editTask = async (taskId, updateData, adminId, req) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const oldData = task.toObject();
    Object.assign(task, updateData);
    await task.save();

    await logAdminAction(
      adminId,
      "task_edit",
      taskId,
      "Task",
      task.title,
      "Task details updated by admin",
      { before: oldData, after: task.toObject() },
      req,
    );

    return task;
  } catch (error) {
    throw error;
  }
};

// ============= REPORTS MANAGEMENT =============

export const getAllReports = async (filters = {}, page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;

    const query = Report.find(filters);
    const total = await Report.countDocuments(filters);
    const reports = await query
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reportedBy", "name email")
      .populate("actionTakenBy", "name email")
      .exec();

    return {
      reports,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw error;
  }
};

export const takeReportAction = async (
  reportId,
  action,
  actionNotes,
  adminId,
  req,
) => {
  try {
    const validActions = ["ignore", "warning", "suspend", "ban", "delete"];
    if (!validActions.includes(action)) {
      throw new Error("Invalid action");
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status: "resolved",
        adminAction: action,
        actionTakenBy: adminId,
        actionNotes,
        resolvedAt: new Date(),
      },
      { new: true },
    );

    if (!report) {
      throw new Error("Report not found");
    }

    await logAdminAction(
      adminId,
      "report_action",
      reportId,
      "Report",
      report.type,
      `Report action: ${action}. Notes: ${actionNotes}`,
      { action, actionNotes },
      req,
    );

    return report;
  } catch (error) {
    throw error;
  }
};

// ============= AI MANAGEMENT =============

export const getAILogs = async (filters = {}, page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;

    const query = AILog.find(filters);
    const total = await AILog.countDocuments(filters);
    const logs = await query
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email")
      .exec();

    return {
      logs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw error;
  }
};

export const getFlaggedAIInteractions = async (page = 1, limit = 50) => {
  try {
    return await getAILogs({ isFlagged: true }, page, limit);
  } catch (error) {
    throw error;
  }
};

// ============= SYSTEM CONFIGURATION =============

export const getSystemConfig = async () => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
      await config.save();
    }
    return config;
  } catch (error) {
    throw error;
  }
};

export const updateSystemConfig = async (configData, adminId, req) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
    }

    const oldConfig = config.toObject();
    Object.assign(config, configData);
    config.lastModifiedBy = adminId;
    config.lastModifiedAt = new Date();
    await config.save();

    await logAdminAction(
      adminId,
      "system_config_update",
      null,
      "SystemConfig",
      null,
      "System configuration updated",
      { before: oldConfig, after: config.toObject() },
      req,
    );

    return config;
  } catch (error) {
    throw error;
  }
};

export const updateAISettings = async (aiSettings, adminId, req) => {
  try {
    let config = await getSystemConfig();
    Object.assign(config.aiSettings, aiSettings);
    config.lastModifiedBy = adminId;
    config.lastModifiedAt = new Date();
    await config.save();

    await logAdminAction(
      adminId,
      "ai_config_update",
      null,
      "SystemConfig",
      null,
      "AI settings updated",
      { aiSettings },
      req,
    );

    return config.aiSettings;
  } catch (error) {
    throw error;
  }
};

// ============= ANALYTICS =============

export const getAnalytics = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalReports = await Report.countDocuments();
    const openReports = await Report.countDocuments({ status: "open" });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });
    const adminUsers = await User.countDocuments({ role: "admin" });
    const mentors = await User.countDocuments({ isMentor: true });
    const completedTasks = await Task.countDocuments({
      status: "completed",
    });

    // AI stats
    const aiLogCount = await AILog.countDocuments();
    const flaggedAICount = await AILog.countDocuments({ isFlagged: true });

    return {
      users: {
        total: totalUsers,
        banned: bannedUsers,
        suspended: suspendedUsers,
        admins: adminUsers,
        mentors,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
      },
      reports: {
        total: totalReports,
        open: openReports,
      },
      ai: {
        totalInteractions: aiLogCount,
        flaggedInteractions: flaggedAICount,
        flagPercentage:
          aiLogCount > 0 ? ((flaggedAICount / aiLogCount) * 100).toFixed(2) : 0,
      },
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getAllUsers,
  getUserDetails,
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
  changeUserRole,
  searchUsers,
  getAllTasks,
  deleteTask,
  editTask,
  getAllReports,
  takeReportAction,
  getAILogs,
  getFlaggedAIInteractions,
  getSystemConfig,
  updateSystemConfig,
  updateAISettings,
  getAnalytics,
};
