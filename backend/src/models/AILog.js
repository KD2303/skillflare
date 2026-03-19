import mongoose from "mongoose";

const aiLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: String,
    tokens: {
      input: Number,
      output: Number,
    },
    model: {
      type: String,
      default: "gpt-3.5-turbo",
    },
    duration: Number, // milliseconds
    ipAddress: String,
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
aiLogSchema.index({ userId: 1, createdAt: -1 });
aiLogSchema.index({ isFlagged: 1, createdAt: -1 });
aiLogSchema.index({ createdAt: -1 });

const AILog = mongoose.model("AILog", aiLogSchema);

export default AILog;
