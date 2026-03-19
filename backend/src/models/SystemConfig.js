import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
  {
    featureFlags: {
      tasksEnabled: {
        type: Boolean,
        default: true,
      },
      mentorshipEnabled: {
        type: Boolean,
        default: true,
      },
      aiEnabled: {
        type: Boolean,
        default: true,
      },
      leaderboardEnabled: {
        type: Boolean,
        default: true,
      },
      chatEnabled: {
        type: Boolean,
        default: true,
      },
    },
    aiSettings: {
      temperature: {
        type: Number,
        min: 0,
        max: 2,
        default: 0.7,
      },
      maxTokens: {
        type: Number,
        default: 2000,
      },
      systemPrompt: {
        type: String,
        default:
          "You are a helpful, friendly, and professional AI assistant for the SkillFlare platform.",
      },
      blockedKeywords: [String],
      safeMode: {
        type: Boolean,
        default: true,
      },
    },
    systemLimits: {
      maxTasksPerUser: {
        type: Number,
        default: 10,
      },
      maxTasksAssignedPerUser: {
        type: Number,
        default: 5,
      },
      creditPerTask: {
        type: Number,
        default: 100,
      },
      minCreditsForMentor: {
        type: Number,
        default: 500,
      },
      maintenanceMode: {
        type: Boolean,
        default: false,
      },
      maintenanceMessage: String,
    },
    creditRewardSystem: {
      taskCompletion: {
        type: Number,
        default: 50,
      },
      taskPosting: {
        type: Number,
        default: 25,
      },
      mentorship: {
        type: Number,
        default: 30,
      },
      helpfulRating: {
        type: Number,
        default: 10,
      },
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastModifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);

export default SystemConfig;
