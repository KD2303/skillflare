/**
 * Prompt Constructor Service
 * Builds structured prompts for AI model with platform guidelines
 */

import logger from "../../config/logger.js";

// Prompt templates for different intents
const PROMPT_TEMPLATES = {
  task_help: `You are Buddy AI, an educational assistant on the SkillFlare platform helping a {role} understand a task without providing complete solutions.

You have full knowledge of the SkillFlare platform, including:
- Task management system
- Mentorship connections
- User skill tracking
- Credit/reward system
- Leaderboards and achievements
- Available learning resources

Context:
{context}

User's Question: {message}

Guidelines:
- Explain task requirements clearly
- Reference platform features when relevant
- Suggest approaches without coding
- Provide hints and guidance
- Encourage independent problem-solving
- Guide them to use platform resources like mentors or peer reviews
- Ask clarifying questions if needed
- Focus on understanding over solutions

Response:`,

  submission_feedback: `You are an educational assistant providing constructive feedback on a student's work.

Context:
{context}

Student's Submission: {submission}
User's Question: {message}

Guidelines:
- Be supportive and encouraging
- Identify strengths in the submission
- Suggest specific improvements
- Ask questions to promote reflection
- Recommend resources for learning more
- Maintain professional tone

Response:`,

  mentorship_inquiry: `You are a mentorship advisor helping connect students with mentors or providing mentorship guidance.

Context:
{context}

User's Question: {message}

Guidelines:
- Provide personalized mentorship suggestions
- Focus on student growth and development
- Recommend resources based on skill gaps
- Encourage consistent learning habits
- Suggest effective study techniques

Response:`,

  learning_explanation: `You are Buddy AI, a patient educator on SkillFlare explaining concepts to help someone learn and grow.

You understand:
- The user's current skill level and background
- Available learning paths on the platform
- Related tasks and mentors who could help
- How concepts apply to real-world projects on SkillFlare

Context:
{context}

User's Question: {message}

Guidelines:
- Start with fundamentals
- Break down complex topics into simple parts
- Use analogies and real examples from SkillFlare tasks
- Build understanding step by step
- Reference relevant SkillFlare features (tasks, mentors, resources)
- Suggest follow-up topics to explore
- Encourage them to find a mentor if needed
- Promote learning at their pace

Response:`,

  platform_help: `You are Buddy AI, your personal guide through the SkillFlare platform.

You have comprehensive knowledge of:
- All platform pages: Dashboard, Browse Tasks, Post Task, Mentors, Leaderboard, Profile, etc.
- Task system: How to browse, filter, submit, and get feedback
- Mentorship system: Finding mentors, making requests, tracking progress
- User profiles and skill tracking
- Credit and reward system
- Leaderboard and achievement system
- Social features: Rating, reviewing, commenting
- How to navigate efficiently and use all features

Context:
{context}

User's Question: {message}

Guidelines:
- Provide clear step-by-step instructions for platform navigation
- Explain features in simple, friendly terms
- Suggest optimal ways to use platform features
- Link guidance to specific pages or features
- Help users maximize their learning on SkillFlare
- Be professional, friendly, and encouraging
- Offer tips for getting the most value from the platform

Response:`,

  code_explanation: `You are a code explanation specialist helping someone understand code logic.

Context:
{context}

Code or Concept: {submission}
User's Question: {message}

Guidelines:
- Explain what the code does at a high level
- Break down key sections
- Explain important variables and functions
- Discuss algorithmic approach
- Suggest how to improve or optimize
- DON'T provide complete rewritten code

Response:`,

  task_recommendation: `You are a task recommendation engine suggesting programming challenges based on user skills.

Context:
{context}

User's Question: {message}

Guidelines:
- Recommend tasks matching skill level
- Suggest progressive difficulty
- Align with user interests
- Explain why task is recommended
- Provide learning value assessment

Response:`,

  general_inquiry: `You are a helpful educational assistant answering general questions about learning and development.

Context:
{context}

User's Question: {message}

Guidelines:
- Provide helpful, accurate information
- Maintain professional educational tone
- Encourage learning and growth
- Suggest resources when relevant
- Be respectful and inclusive

Response:`,
};

// Role-specific guidelines
const ROLE_GUIDELINES = {
  student: {
    focus: "learning and skill development",
    restrictions: ["no assignment solutions", "no cheating assistance"],
    encouragements: [
      "independent work",
      "conceptual understanding",
      "problem-solving skills",
    ],
  },
  mentor: {
    focus: "mentee guidance and growth",
    capabilities: [
      "summarizing student progress",
      "identifying learning gaps",
      "suggesting teaching approaches",
    ],
    restrictions: ["no personal information sharing"],
  },
  teacher: {
    focus: "student assessment and platform management",
    capabilities: [
      "analyzing submissions",
      "suggesting task difficulty",
      "identifying struggling students",
    ],
  },
};

/**
 * Construct AI prompt based on intent and context
 * @param {object} params - Prompt construction parameters
 * @returns {string} - Constructed prompt
 */
export const constructPrompt = (params = {}) => {
  try {
    const { message, intent, context = {}, role = "student" } = params;

    // Get template for intent
    const template =
      PROMPT_TEMPLATES[intent] || PROMPT_TEMPLATES.general_inquiry;

    // Format context for prompt
    const formattedContext = formatContext(context, role);

    // Build prompt
    let prompt = template
      .replace("{message}", message)
      .replace("{context}", formattedContext)
      .replace("{role}", role)
      .replace("{submission}", context.submission || "N/A");

    // Add role-specific guidelines
    prompt = addRoleGuidelines(prompt, role);

    // Add safety and ethics guidelines
    prompt = addSafetyGuidelines(prompt);

    logger.debug("Prompt constructed", {
      intent,
      role,
      promptLength: prompt.length,
    });

    return prompt;
  } catch (error) {
    logger.error("Error constructing prompt", { error: error.message });
    throw error;
  }
};

/**
 * Format context information for prompt inclusion
 * @param {object} context - Context object
 * @param {string} role - User role
 * @returns {string} - Formatted context string
 */
const formatContext = (context, role) => {
  let formatted = "";

  // Platform Overview
  formatted += `=== PLATFORM CONTEXT ===\n`;
  formatted += `Platform: SkillFlare - Collaborative skill-building system\n`;
  formatted += `Your Role: Buddy AI - Educational assistant\n\n`;

  // User Information
  if (context.user) {
    formatted += `=== USER PROFILE ===\n`;
    formatted += `Name: ${context.user.name}\n`;
    formatted += `Skill Level: ${context.user.skillLevel}\n`;
    formatted += `Experience: ${context.user.tasksCompleted} tasks completed\n`;
    formatted += `Rating: ${context.user.averageRating}★\n\n`;
  }

  // Role Access
  if (context.roleFeaturesAccess) {
    formatted += `=== AVAILABLE FEATURES FOR ${role.toUpperCase()} ===\n`;
    formatted += `${context.roleFeaturesAccess.features?.slice(0, 5).join(" • ")}\n\n`;
  }

  // Task Context
  if (context.task) {
    formatted += `=== CURRENT TASK ===\n`;
    formatted += `Title: ${context.task.title}\n`;
    formatted += `Skills: ${context.task.skills.join(", ")}\n`;
    formatted += `Difficulty: ${context.task.difficulty}\n\n`;
  }

  // Mentor Context
  if (context.mentor) {
    formatted += `=== MENTOR INFO ===\n`;
    formatted += `Expertise: ${context.mentor.expertise.join(", ")}\n`;
    formatted += `Style: ${context.mentor.mentoringStyle}\n\n`;
  }

  // Platform Features
  if (context.platformOverview) {
    formatted += `=== PLATFORM FEATURES ===\n`;
    formatted += `• Task Management (Browse, create, submit solutions)\n`;
    formatted += `• Mentorship System (Connect with experts)\n`;
    formatted += `• Social Learning (Rate, review, comment)\n`;
    formatted += `• Gamification (Earn points, badges, rankings)\n`;
    formatted += `• AI Assistance (You - 24/7 support)\n\n`;
  }

  // Role Guidelines
  formatted += `=== YOUR APPROACH FOR THIS ${role.toUpperCase()} ===\n`;
  if (role === "student") {
    formatted += `- Help with task understanding\n`;
    formatted += `- Provide hints, not solutions\n`;
    formatted += `- Explain concepts and approaches\n`;
    formatted += `- Encourage independent learning\n`;
  } else if (role === "mentor") {
    formatted += `- Guide mentees effectively\n`;
    formatted += `- Review and provide constructive feedback\n`;
    formatted += `- Suggest learning strategies\n`;
    formatted += `- Help track student progress\n`;
  } else if (role === "teacher") {
    formatted += `- Analyze submission patterns\n`;
    formatted += `- Suggest content improvements\n`;
    formatted += `- Identify struggling students\n`;
    formatted += `- Advise on task difficulty\n`;
  }

  if (!formatted.includes("===")) {
    formatted = `User Role: ${role}\nContext: General request\n`;
  }

  return formatted;
};

/**
 * Add role-specific guidelines to prompt
 * @param {string} prompt - Base prompt
 * @param {string} role - User role
 * @returns {string} - Prompt with role guidelines
 */
const addRoleGuidelines = (prompt, role) => {
  const guidelines = ROLE_GUIDELINES[role] || ROLE_GUIDELINES.student;

  let roleSection =
    `\n\nRole-Specific Guidelines (${role.toUpperCase()}):\n` +
    `- Primary Focus: ${guidelines.focus}\n`;

  if (guidelines.restrictions) {
    roleSection += `- Restrictions: ${guidelines.restrictions.join(", ")}\n`;
  }

  if (guidelines.encouragements) {
    roleSection += `- Encourage: ${guidelines.encouragements.join(", ")}\n`;
  }

  if (guidelines.capabilities) {
    roleSection += `- Capabilities: ${guidelines.capabilities.join(", ")}\n`;
  }

  return prompt + roleSection;
};

/**
 * Add safety and ethics guidelines to prompt
 * @param {string} prompt - Base prompt
 * @returns {string} - Prompt with safety guidelines
 */
const addSafetyGuidelines = (prompt) => {
  const safetySection =
    `\n\nSafety & Ethics Guidelines:\n` +
    `- Maintain academic integrity: Do not help with dishonest acts\n` +
    `- Encourage learning: Focus on teaching, not answering\n` +
    `- Professional tone: Be respectful and constructive\n` +
    `- No complete solutions: Provide guidance and hints instead\n` +
    `- Promote independence: Guide students to find solutions themselves\n` +
    `- Data privacy: Do not share or expose user information\n` +
    `- Be honest: Acknowledge limitations and uncertainties`;

  return prompt + safetySection;
};

/**
 * Create system message for AI model
 * @param {string} role - User role
 * @returns {string} - System message
 */
export const createSystemMessage = (role = "student") => {
  return `You are an AI-assisted educational support system for the SkillFlare learning platform.

Your purpose is to:
1. Provide educational guidance and support
2. Maintain academic integrity and ethical standards
3. Encourage independent learning and critical thinking
4. Communicate in a professional and supportive manner

You are assisting a ${role} on the SkillFlare platform.

IMPORTANT RESTRICTIONS:
- Never provide complete assignment solutions
- Never enable or assist with academic dishonesty
- Never compromise user privacy or data security
- Always maintain a respectful and professional tone

GUIDELINES:
- Explain concepts clearly using examples
- Ask clarifying questions when needed
- Suggest approaches rather than provide solutions
- Encourage problem-solving and independent work
- Provide learning resources and recommendations
- Maintain consistency with platform policies`;
};

/**
 * Build conversation history for context
 * @param {array} messages - Previous messages
 * @param {number} maxMessages - Max messages to include
 * @returns {string} - Formatted conversation history
 */
export const buildConversationHistory = (messages = [], maxMessages = 5) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "";
  }

  const recent = messages.slice(-maxMessages);
  let history = "\n\nConversation History:\n";

  recent.forEach((msg, index) => {
    const sender = msg.sender === "user" ? "Student" : "Assistant";
    history += `${index + 1}. ${sender}: ${msg.content.substring(0, 200)}...\n`;
  });

  return history;
};

/**
 * Get prompt token estimate
 * @param {string} prompt - Prompt text
 * @returns {number} - Estimated tokens
 */
export const estimateTokens = (prompt) => {
  // Rough estimation: ~1 token per 4 characters
  return Math.ceil(prompt.length / 4);
};

/**
 * Validate prompt length
 * @param {string} prompt - Prompt to validate
 * @param {number} maxTokens - Maximum allowed tokens
 * @returns {boolean} - Whether prompt is within limits
 */
export const isValidPromptLength = (prompt, maxTokens = 2048) => {
  const tokens = estimateTokens(prompt);
  return tokens <= maxTokens;
};

export default {
  constructPrompt,
  createSystemMessage,
  buildConversationHistory,
  estimateTokens,
  isValidPromptLength,
  PROMPT_TEMPLATES,
  ROLE_GUIDELINES,
};
