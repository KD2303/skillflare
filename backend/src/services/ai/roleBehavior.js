/**
 * Role-Based Behavior Service
 * Adapts AI responses based on user role and permissions
 */

import logger from "../../config/logger.js";

// Role capabilities and restrictions
export const ROLE_CAPABILITIES = {
  student: {
    allowedIntents: [
      "task_help",
      "submission_feedback",
      "learning_explanation",
      "code_explanation",
      "platform_help",
      "mentorship_inquiry",
      "general_inquiry",
    ],
    restrictions: [
      "no_complete_solutions",
      "no_answer_generation",
      "readonly_other_submissions",
    ],
    features: [
      "explain_task",
      "get_hints",
      "understand_concepts",
      "ask_for_feedback",
      "request_mentor",
      "platform_navigation",
    ],
    rateLimit: 50, // Requests per hour
  },

  mentor: {
    allowedIntents: [
      "task_help",
      "mentorship_inquiry",
      "learning_explanation",
      "submission_feedback",
      "code_explanation",
      "platform_help",
      "general_inquiry",
    ],
    restrictions: ["no_violation_of_privacy"],
    features: [
      "review_student_progress",
      "suggest_guidance",
      "explain_concepts",
      "provide_feedback",
      "match_with_students",
      "platform_navigation",
    ],
    rateLimit: 100, // Requests per hour
  },

  teacher: {
    allowedIntents: [
      "task_help",
      "submission_feedback",
      "learning_explanation",
      "code_explanation",
      "platform_help",
      "task_recommendation",
      "general_inquiry",
    ],
    restrictions: ["no_violation_of_student_privacy"],
    features: [
      "analyze_submissions",
      "track_class_progress",
      "suggest_difficulty_adjustments",
      "generate_analytics",
      "bulk_feedback",
      "platform_management",
    ],
    rateLimit: 150, // Requests per hour
  },
};

/**
 * Check if user role can access given intent
 * @param {string} role - User role
 * @param {string} intent - Intent type
 * @returns {boolean} - Whether role can access intent
 */
export const canAccessIntent = (role, intent) => {
  const capabilities = ROLE_CAPABILITIES[role];

  if (!capabilities) {
    logger.warn("Unknown role", { role });
    return false;
  }

  const canAccess = capabilities.allowedIntents.includes(intent);

  if (!canAccess) {
    logger.warn("Role cannot access intent", {
      role,
      intent,
      allowedIntents: capabilities.allowedIntents,
    });
  }

  return canAccess;
};

/**
 * Get role-specific rate limit
 * @param {string} role - User role
 * @returns {number} - Requests per hour
 */
export const getRateLimit = (role) => {
  const capabilities = ROLE_CAPABILITIES[role];
  return capabilities?.rateLimit || 20;
};

/**
 * Get role-specific response context
 * @param {string} role - User role
 * @returns {object} - Response context for role
 */
export const getRoleContext = (role) => {
  const capabilities = ROLE_CAPABILITIES[role];

  if (!capabilities) {
    return ROLE_CAPABILITIES.student;
  }

  return {
    role,
    allowedIntents: capabilities.allowedIntents,
    features: capabilities.features,
    restrictions: capabilities.restrictions,
    rateLimit: capabilities.rateLimit,
  };
};

/**
 * Adapt response based on role
 * @param {string} response - Original response
 * @param {string} role - User role
 * @param {object} context - Request context
 * @returns {string} - Adapted response
 */
export const adaptResponseForRole = (response, role, context = {}) => {
  let adapted = response;

  switch (role) {
    case "student":
      adapted = adaptForStudent(adapted, context);
      break;
    case "mentor":
      adapted = adaptForMentor(adapted, context);
      break;
    case "teacher":
      adapted = adaptForTeacher(adapted, context);
      break;
  }

  return adapted;
};

/**
 * Adapt response for student role
 * @param {string} response - Original response
 * @param {object} context - Request context
 * @returns {string} - Student-adapted response
 */
const adaptForStudent = (response, context = {}) => {
  let adapted = response;

  // Add encouragement
  const encouragements = [
    "\n\n💪 You can do this! Break it down into smaller parts.",
    "\n\n🎯 Great question! Keep exploring and learning.",
    "\n\n📚 This is a great opportunity to deepen your understanding.",
    "\n\n✨ Your effort on this will help you grow as a developer.",
  ];

  const randomEncouragement =
    encouragements[Math.floor(Math.random() * encouragements.length)];
  adapted += randomEncouragement;

  // Add resource suggestions
  if (
    context.intent === "learning_explanation" ||
    context.intent === "code_explanation"
  ) {
    adapted +=
      "\n\n📖 **Further Reading:** Try searching for tutorials or documentation on this topic!";
  }

  // Add task-related hints
  if (context.intent === "task_help") {
    adapted +=
      "\n\n💡 **Hint:** Try approaching this problem step by step. What's the first thing you need to do?";
  }

  return adapted;
};

/**
 * Adapt response for mentor role
 * @param {string} response - Original response
 * @param {object} context - Request context
 * @returns {string} - Mentor-adapted response
 */
const adaptForMentor = (response, context = {}) => {
  let adapted = response;

  // Add mentee-focused suggestions
  if (context.intent === "submission_feedback") {
    adapted +=
      "\n\n🎓 **Mentee Development:** Consider asking your mentee these questions to guide their learning.";
  }

  // Add progress tracking suggestions
  if (context.intent === "mentorship_inquiry") {
    adapted +=
      "\n\n📊 **Progress Tracking:** Keep regular updates on your mentee's growth and challenges.";
  }

  return adapted;
};

/**
 * Adapt response for teacher role
 * @param {string} response - Original response
 * @param {object} context - Request context
 * @returns {string} - Teacher-adapted response
 */
const adaptForTeacher = (response, context = {}) => {
  let adapted = response;

  // Add classroom management insights
  if (context.intent === "submission_feedback") {
    adapted +=
      "\n\n📋 **Class Insights:** Consider this for curriculum adjustments or additional support.";
  }

  // Add difficulty assessment
  if (context.intent === "task_recommendation") {
    adapted +=
      "\n\n⚙️ **Task Calibration:** Review this suggestion against your class abilities and goals.";
  }

  return adapted;
};

/**
 * Check if role can perform action
 * @param {string} role - User role
 * @param {string} action - Action to perform
 * @returns {boolean} - Whether action is allowed
 */
export const canPerformAction = (role, action) => {
  const capabilities = ROLE_CAPABILITIES[role];

  if (!capabilities) {
    return false;
  }

  // Check both allowlisted features and restrictions
  if (capabilities.features && capabilities.features.includes(action)) {
    return true;
  }

  if (
    capabilities.restrictions &&
    capabilities.restrictions.includes(`no_${action}`)
  ) {
    logger.warn("Action restricted for role", { role, action });
    return false;
  }

  return false;
};

/**
 * Get role-specific UI features
 * @param {string} role - User role
 * @returns {array} - Available UI features
 */
export const getRoleFeatures = (role) => {
  const capabilities = ROLE_CAPABILITIES[role];
  return capabilities?.features || [];
};

/**
 * Validate role permissions
 * @param {string} role - User role
 * @returns {object} - Permission validation result
 */
export const validateRolePermissions = (role) => {
  const validRoles = Object.keys(ROLE_CAPABILITIES);
  const isValid = validRoles.includes(role);

  return {
    valid: isValid,
    role: role,
    message: isValid
      ? `${role} role is valid`
      : `${role} role is not recognized`,
    availableRoles: validRoles,
  };
};

export default {
  ROLE_CAPABILITIES,
  canAccessIntent,
  getRateLimit,
  getRoleContext,
  adaptResponseForRole,
  canPerformAction,
  getRoleFeatures,
  validateRolePermissions,
};
