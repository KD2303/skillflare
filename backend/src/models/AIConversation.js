/**
 * AI Conversation Model
 * Schema for storing AI conversation history
 */

import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ["user", "assistant", "system"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        intent: {
          type: String,
          enum: [
            "task_help",
            "submission_feedback",
            "mentorship_inquiry",
            "learning_explanation",
            "platform_help",
            "code_explanation",
            "task_recommendation",
            "general_inquiry",
          ],
        },
        confidence: Number,
        metadata: mongoose.Schema.Types.Mixed,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    context: {
      taskId: mongoose.Schema.Types.ObjectId,
      submissionId: mongoose.Schema.Types.ObjectId,
      relatedEntity: String,
    },
    summary: String,
    resolved: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback: String,
  },
  {
    timestamps: true,
    indexes: [
      { userId: 1, createdAt: -1 },
      { userId: 1, "context.taskId": 1 },
    ],
  },
);

/**
 * Index for efficient queries
 */
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, "context.taskId": 1 });

/**
 * Get recent conversations for user
 */
conversationSchema.statics.getRecentConversations = function (
  userId,
  limit = 10,
) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("messages context summary rating createdAt");
};

/**
 * Get conversations for specific task
 */
conversationSchema.statics.getTaskConversations = function (userId, taskId) {
  return this.find({
    userId,
    "context.taskId": taskId,
  }).sort({ createdAt: -1 });
};

/**
 * Add message to conversation
 */
conversationSchema.methods.addMessage = function (message) {
  this.messages.push({
    sender: message.sender,
    content: message.content,
    intent: message.intent,
    confidence: message.confidence,
    metadata: message.metadata,
    timestamp: new Date(),
  });
  return this.save();
};

/**
 * Rate conversation
 */
conversationSchema.methods.rateConversation = function (rating, feedback) {
  this.rating = rating;
  this.feedback = feedback;
  this.resolved = true;
  return this.save();
};

/**
 * Get conversation summary
 */
conversationSchema.methods.generateSummary = function () {
  const userMessages = this.messages.filter((msg) => msg.sender === "user");
  const intents = [...new Set(userMessages.map((msg) => msg.intent))];

  this.summary = `Conversation with ${userMessages.length} user messages. Topics: ${intents.join(", ")}`;
  return this.save();
};

/**
 * Middleware to update summary before save
 */
conversationSchema.pre("save", function (next) {
  if (this.isModified("messages") && this.messages.length > 0) {
    this.generateSummary();
  }
  next();
});

const AIConversation = mongoose.model("AIConversation", conversationSchema);

export default AIConversation;
