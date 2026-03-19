import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "user_ban",
        "user_unban",
        "user_suspend",
        "user_unsuspend",
        "role_change",
        "task_edit",
        "task_delete",
        "task_reassign",
        "submission_override",
        "mentor_approve",
        "mentor_revoke",
        "message_delete",
        "user_mute",
        "ai_config_update",
        "ai_system_prompt_update",
        "ai_disable",
        "system_config_update",
        "feature_toggle",
        "mass_action",
        "logout_all_sessions",
      ],
    },
    targetId: mongoose.Schema.Types.ObjectId,
    targetModel: String,
    targetEmail: String,
    description: String,
    changes: mongoose.Schema.Types.Mixed, // Store what was changed
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "success",
    },
    metadata: mongoose.Schema.Types.Mixed, // Additional context
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ action: 1, createdAt: -1 });
adminLogSchema.index({ targetId: 1 });

const AdminLog = mongoose.model("AdminLog", adminLogSchema);

export default AdminLog;
