/**
 * Moderation Service
 * Filters and validates user requests for safety and policy compliance
 */

import logger from "../../config/logger.js";

// Banned keywords and phrases
const BANNED_PATTERNS = {
  cheatingAssistance: [
    "solve this for me",
    "complete the code",
    "write the solution",
    "do my assignment",
    "finish my task",
    "give me the answer",
    "just tell me the code",
    "complete solution",
  ],
  abusiveContent: ["stupid", "idiot", "dumb", "harass"],
  spam: [
    "buy now",
    "click here",
    "free money",
    "limited time offer",
    "act now",
  ],
};

// Allowed topics for AI assistance
const ALLOWED_TOPICS = [
  "concepts",
  "approaches",
  "hints",
  "explanations",
  "resources",
  "best practices",
  "debugging strategy",
  "algorithms",
  "data structures",
  "design patterns",
];

/**
 * Moderate user message
 * @param {string} message - User message to moderate
 * @returns {object} - Moderation result
 */
export const moderateMessage = (message) => {
  if (!message || typeof message !== "string") {
    return {
      approved: false,
      reason: "Invalid message format",
      severity: "high",
    };
  }

  const lowerMessage = message.toLowerCase();
  const result = {
    approved: true,
    reason: null,
    severity: "none",
    flags: [],
  };

  // Check for cheating assistance requests
  const cheatingMatch = checkPatterns(
    lowerMessage,
    BANNED_PATTERNS.cheatingAssistance,
  );
  if (cheatingMatch) {
    result.approved = false;
    result.reason = "Request appears to seek complete solution assistance";
    result.severity = "high";
    result.flags.push("cheating_attempt");
    logger.warn("Cheating attempt detected", {
      message: message.substring(0, 100),
    });
    return result;
  }

  // Check for abusive content
  const abuseMatch = checkPatterns(
    lowerMessage,
    BANNED_PATTERNS.abusiveContent,
  );
  if (abuseMatch) {
    result.approved = false;
    result.reason = "Message contains inappropriate language";
    result.severity = "high";
    result.flags.push("abusive_content");
    logger.warn("Abusive content detected", {
      message: message.substring(0, 100),
    });
    return result;
  }

  // Check for spam
  const spamMatch = checkPatterns(lowerMessage, BANNED_PATTERNS.spam);
  if (spamMatch) {
    result.approved = false;
    result.reason = "Message appears to be spam";
    result.severity = "medium";
    result.flags.push("spam");
    logger.warn("Spam detected", { message: message.substring(0, 100) });
    return result;
  }

  // Check message length
  if (message.length > 5000) {
    result.flags.push("excessive_length");
    result.severity = "low";
  }

  if (message.length < 3) {
    result.approved = false;
    result.reason = "Message is too short";
    result.severity = "medium";
    return result;
  }

  logger.debug("Message moderation passed", {
    messageLength: message.length,
    flags: result.flags,
  });

  return result;
};

/**
 * Check if message contains banned patterns
 * @param {string} text - Text to check
 * @param {array} patterns - Patterns to search for
 * @returns {boolean} - Whether pattern found
 */
const checkPatterns = (text, patterns) => {
  return patterns.some((pattern) => {
    const lowerPattern = pattern.toLowerCase();
    const lowerText = text.toLowerCase();

    // For multi-word patterns, use simple includes
    if (pattern.includes(" ")) {
      return lowerText.includes(lowerPattern);
    }

    // For single words, use word boundaries to avoid false positives
    // Match whole words only
    const wordBoundaryRegex = new RegExp(`\\b${lowerPattern}\\b`, "i");
    return wordBoundaryRegex.test(lowerText);
  });
};

/**
 * Moderate AI response before sending to user
 * Note: We trust our AI to be safe. This moderation is lenient and logs
 * potential issues rather than rejecting responses. The AI is designed
 * to be educational and safe through its system prompts.
 * @param {string} response - AI generated response
 * @returns {object} - Moderation result
 */
export const moderateResponse = (response) => {
  if (!response || typeof response !== "string") {
    return {
      approved: false,
      reason: "Invalid response format",
      cleanedResponse: "",
    };
  }

  const result = {
    approved: true, // Default to approval - trust the AI
    reason: null,
    cleanedResponse: response,
    warnings: [],
  };

  // Log if response might provide too much detail (warning only, don't reject)
  if (containsCompleteSolution(response)) {
    result.warnings.push("Response contains detailed implementation details");
    logger.debug("AI response has detailed content", {
      responseLength: response.length,
    });
  }

  // Log if response contains policy terms (warning only, don't reject)
  // These checks are just for monitoring, not for blocking
  const lowerResponse = response.toLowerCase();
  if (lowerResponse.includes("but don't") || lowerResponse.includes("avoid")) {
    result.warnings.push("Response includes cautionary content");
  }

  logger.debug("Response moderation completed", {
    approved: result.approved,
    warnings: result.warnings.length,
  });

  return result;
};

/**
 * Check if response might contain complete solution
 * @param {string} response - Response text
 * @returns {boolean} - Whether solution detected
 */
const containsCompleteSolution = (response) => {
  const solutionIndicators = [
    "here is the complete code",
    "complete solution is",
    "full answer is",
    "here' your code",
    "```javascript\n.*\n```",
  ];

  return solutionIndicators.some((indicator) =>
    response.toLowerCase().includes(indicator.toLowerCase()),
  );
};

/**
 * Filter out complete solutions from response
 * @param {string} response - Response with potential solution
 * @returns {string} - Filtered response
 */
const filterSolution = (response) => {
  // Remove code blocks that appear to be complete solutions
  let filtered = response.replace(/```[\s\S]*?```/g, "[Code example removed]");

  // Keep explanatory content
  return filtered;
};

/**
 * Check if response violates platform policies
 * @param {string} response - Response to check
 * @returns {boolean} - Whether policy violated
 */
const violatesPolicy = (response) => {
  const lowerResponse = response.toLowerCase();

  // Check for cheating encouragement
  if (lowerResponse.includes("cheat") || lowerResponse.includes("dishonest")) {
    return true;
  }

  // Check for harmful content
  if (lowerResponse.includes("harm") || lowerResponse.includes("abuse")) {
    return true;
  }

  return false;
};

/**
 * Validate request against rate limits
 * @param {object} params - Rate limit parameters
 * @returns {object} - Validation result
 */
export const validateRateLimit = (params = {}) => {
  const { userId, requestsInLastHour = 0, maxRequestsPerHour = 50 } = params;

  const result = {
    allowed: true,
    reason: null,
    remainingRequests: maxRequestsPerHour - requestsInLastHour,
  };

  if (requestsInLastHour >= maxRequestsPerHour) {
    result.allowed = false;
    result.reason = `Rate limit exceeded. Max ${maxRequestsPerHour} requests per hour.`;
    logger.warn("Rate limit exceeded", { userId, requestsInLastHour });
  }

  return result;
};

/**
 * Create safe response wrapper
 * @param {string} originalResponse - Original AI response
 * @param {object} context - Request context
 * @returns {string} - Wrapped response with safety notes
 */
export const createSafeResponse = (originalResponse, context = {}) => {
  let response = originalResponse;

  // Add disclaimer for code assistance
  if (context.intent === "code_explanation") {
    response +=
      "\n\n💡 **Remember:** This explanation is meant to help you understand the concept. Try to implement the solution yourself!";
  }

  // Add encouragement for task help
  if (context.intent === "task_help") {
    response +=
      "\n\n✨ You've got this! Break down the problem into smaller parts and tackle them one by one.";
  }

  // Add learning resource suggestion
  if (context.intent === "learning_explanation") {
    response +=
      "\n\n📚 **Next Step:** Try to find additional resources on this topic to deepen your understanding!";
  }

  return response;
};

export default {
  moderateMessage,
  moderateResponse,
  validateRateLimit,
  createSafeResponse,
  BANNED_PATTERNS,
  ALLOWED_TOPICS,
};
