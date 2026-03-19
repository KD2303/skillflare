/**
 * Intent Detection Service
 * Analyzes user messages to determine request intent
 */

import logger from "../../config/logger.js";

// Intent categories
export const INTENT_TYPES = {
  TASK_HELP: "task_help",
  SUBMISSION_FEEDBACK: "submission_feedback",
  MENTORSHIP_INQUIRY: "mentorship_inquiry",
  LEARNING_EXPLANATION: "learning_explanation",
  PLATFORM_HELP: "platform_help",
  CODE_EXPLANATION: "code_explanation",
  TASK_RECOMMENDATION: "task_recommendation",
  GENERAL_INQUIRY: "general_inquiry",
};

// Keywords for intent detection
const INTENT_KEYWORDS = {
  [INTENT_TYPES.TASK_HELP]: [
    "task",
    "mission",
    "requirement",
    "understand",
    "how do i",
    "help with",
    "what does",
    "explain",
    "confused about",
  ],
  [INTENT_TYPES.SUBMISSION_FEEDBACK]: [
    "feedback",
    "review",
    "submitted",
    "submission",
    "code review",
    "check my",
    "is this correct",
    "how did i do",
  ],
  [INTENT_TYPES.MENTORSHIP_INQUIRY]: [
    "mentor",
    "mentorship",
    "guidance",
    "advice",
    "guidance",
    "career",
    "suggest a mentor",
    "find mentor",
  ],
  [INTENT_TYPES.LEARNING_EXPLANATION]: [
    "explain",
    "how does",
    "what is",
    "concept",
    "theory",
    "learn about",
    "tell me about",
    "why",
    "understand",
  ],
  [INTENT_TYPES.PLATFORM_HELP]: [
    "how to",
    "platform help",
    "feature",
    "navigate",
    "profile",
    "settings",
    "where is",
    "how do i",
    "submit",
    "upload",
  ],
  [INTENT_TYPES.CODE_EXPLANATION]: [
    "code",
    "function",
    "function",
    "algorithm",
    "logic",
    "syntax",
    "debug",
    "error",
    "line by line",
  ],
  [INTENT_TYPES.TASK_RECOMMENDATION]: [
    "recommend",
    "suggest",
    "task for me",
    "what task",
    "based on",
    "my level",
    "suitable task",
  ],
};

// Confidence thresholds
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
};

/**
 * Detect intent from user message
 * @param {string} message - User message
 * @param {object} context - Additional context (role, currentPage, etc.)
 * @returns {object} - Intent detection result
 */
export const detectIntent = (message, context = {}) => {
  if (!message || typeof message !== "string") {
    logger.warn("Invalid message for intent detection", { message });
    return {
      intent: INTENT_TYPES.GENERAL_INQUIRY,
      confidence: 0,
      keywords: [],
    };
  }

  const lowerMessage = message.toLowerCase();
  const intentScores = {};

  // Calculate scores for each intent
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let matchCount = 0;

    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      intentScores[intent] = matchCount / keywords.length;
    }
  }

  // Find best matching intent
  let bestIntent = INTENT_TYPES.GENERAL_INQUIRY;
  let bestScore = 0;
  const matchedKeywords = [];

  for (const [intent, score] of Object.entries(intentScores)) {
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  // Get matched keywords
  if (bestScore > 0) {
    const keywords = INTENT_KEYWORDS[bestIntent];
    matchedKeywords.push(
      ...keywords.filter((keyword) =>
        lowerMessage.includes(keyword.toLowerCase()),
      ),
    );
  }

  // Determine confidence level
  let confidenceLevel = "low";
  if (bestScore >= CONFIDENCE_THRESHOLDS.HIGH) {
    confidenceLevel = "high";
  } else if (bestScore >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    confidenceLevel = "medium";
  }

  const result = {
    intent: bestIntent,
    confidence: bestScore,
    confidenceLevel,
    keywords: matchedKeywords,
    context: {
      role: context.role || "student",
      currentPage: context.currentPage,
      hasTask: !!context.taskId,
      taskId: context.taskId,
    },
  };

  logger.debug("Intent detected", {
    message: message.substring(0, 100),
    intent: result.intent,
    confidence: result.confidence,
  });

  return result;
};

/**
 * Get intent display name
 * @param {string} intent - Intent type
 * @returns {string} - Human-readable intent name
 */
export const getIntentName = (intent) => {
  const names = {
    [INTENT_TYPES.TASK_HELP]: "Task Assistance",
    [INTENT_TYPES.SUBMISSION_FEEDBACK]: "Submission Review",
    [INTENT_TYPES.MENTORSHIP_INQUIRY]: "Mentorship Inquiry",
    [INTENT_TYPES.LEARNING_EXPLANATION]: "Learning Explanation",
    [INTENT_TYPES.PLATFORM_HELP]: "Platform Guidance",
    [INTENT_TYPES.CODE_EXPLANATION]: "Code Explanation",
    [INTENT_TYPES.TASK_RECOMMENDATION]: "Task Recommendation",
    [INTENT_TYPES.GENERAL_INQUIRY]: "General Inquiry",
  };

  return names[intent] || "General Inquiry";
};

/**
 * Validate intent has sufficient confidence
 * @param {object} intentResult - Intent detection result
 * @param {number} minConfidence - Minimum confidence threshold
 * @returns {boolean} - Whether intent is valid
 */
export const isValidIntent = (
  intentResult,
  minConfidence = CONFIDENCE_THRESHOLDS.MEDIUM,
) => {
  return intentResult.confidence >= minConfidence;
};

export default {
  INTENT_TYPES,
  detectIntent,
  getIntentName,
  isValidIntent,
};
