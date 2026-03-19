import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["user", "task", "mentor", "message"],
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetModel: {
      type: String,
      enum: ["User", "Task", "Message"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: [1000, "Reason cannot exceed 1000 characters"],
    },
    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "under_review", "resolved", "dismissed"],
      default: "open",
    },
    adminAction: {
      type: String,
      enum: ["ignore", "warning", "suspend", "ban", "delete"],
    },
    actionTakenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    actionNotes: String,
    evidence: [String], // URLs to screenshots or evidence
    resolvedAt: Date,
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ targetId: 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
