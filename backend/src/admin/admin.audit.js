/**
 * Admin Audit Logging Service
 * Maintains comprehensive logs of all admin actions
 */

import AdminLog from "../models/AdminLog.js";

export const logAdminAction = async (
  adminId,
  action,
  targetId,
  targetModel,
  targetEmail,
  description,
  changes = null,
  req = null,
) => {
  try {
    const logEntry = new AdminLog({
      adminId,
      action,
      targetId,
      targetModel,
      targetEmail,
      description,
      changes,
      status: "success",
      ipAddress: req?.ip || "unknown",
      userAgent: req?.get("user-agent") || "unknown",
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error("Error logging admin action:", error);
    // Don't throw - we don't want logging failures to break the admin action
    return null;
  }
};

export const getAdminLogs = async (filters = {}, page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;

    const query = AdminLog.find(filters);

    const total = await AdminLog.countDocuments(filters);
    const logs = await query
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("adminId", "name email")
      .exec();

    return {
      logs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching admin logs:", error);
    throw error;
  }
};

export const getAdminActivityStats = async () => {
  try {
    const stats = await AdminLog.aggregate([
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
          lastPerformed: { $max: "$createdAt" },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return stats;
  } catch (error) {
    console.error("Error fetching admin activity stats:", error);
    throw error;
  }
};

export default {
  logAdminAction,
  getAdminLogs,
  getAdminActivityStats,
};
