/**
 * Context Builder Service
 * Collects and prepares platform context for AI requests
 */

import Task from "../../models/Task.js";
import User from "../../models/User.js";
import MentorProfile from "../../models/MentorProfile.js";
import logger from "../../config/logger.js";

/**
 * Build comprehensive context for AI request
 * @param {object} params - Context parameters
 * @returns {Promise<object>} - Built context
 */
export const buildContext = async (params = {}) => {
  try {
    const { userId, taskId, role = "student", submissionId } = params;

    const context = {
      user: null,
      task: null,
      submission: null,
      mentor: null,
      userRole: role,
      platformRules: getPlatformRules(),
      platformOverview: getPlatformOverview(),
      roleFeaturesAccess: getRoleFeatures(role),
      timestamp: new Date(),
    };

    // Fetch user information
    if (userId) {
      context.user = await fetchUserContext(userId);
    }

    // Fetch task information
    if (taskId) {
      context.task = await fetchTaskContext(taskId);
    }

    // Fetch submission information
    if (submissionId && taskId) {
      context.submission = await fetchSubmissionContext(taskId, submissionId);
    }

    // Fetch mentor information
    if (role === "mentor" && userId) {
      context.mentor = await fetchMentorContext(userId);
    }

    logger.debug("Context built successfully", {
      userId,
      taskId,
      role,
      hasUser: !!context.user,
      hasTask: !!context.task,
    });

    return context;
  } catch (error) {
    logger.error("Error building context", { error: error.message });
    throw error;
  }
};

/**
 * Fetch user context information
 * @param {string} userId - User ID
 * @returns {Promise<object>} - User context
 */
const fetchUserContext = async (userId) => {
  try {
    const user = await User.findById(userId).select(
      "name email role skillLevel tasksCompleted tasksPosted averageRating",
    );

    if (!user) {
      return null;
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skillLevel: user.skillLevel || "intermediate",
      tasksCompleted: user.tasksCompleted || 0,
      tasksPosted: user.tasksPosted || 0,
      averageRating: user.averageRating || 0,
    };
  } catch (error) {
    logger.error("Error fetching user context", {
      error: error.message,
      userId,
    });
    return null;
  }
};

/**
 * Fetch task context information
 * @param {string} taskId - Task ID
 * @returns {Promise<object>} - Task context
 */
const fetchTaskContext = async (taskId) => {
  try {
    const task = await Task.findById(taskId)
      .select(
        "title description skills creditPoints difficulty status deadline",
      )
      .lean();

    if (!task) {
      return null;
    }

    return {
      id: task._id,
      title: task.title,
      description: task.description,
      skills: task.skills,
      creditPoints: task.creditPoints,
      difficulty: task.difficulty || "medium",
      status: task.status,
      deadline: task.deadline,
    };
  } catch (error) {
    logger.error("Error fetching task context", {
      error: error.message,
      taskId,
    });
    return null;
  }
};

/**
 * Fetch submission context information
 * @param {string} taskId - Task ID
 * @param {string} submissionId - Submission ID
 * @returns {Promise<object>} - Submission context
 */
const fetchSubmissionContext = async (taskId, submissionId) => {
  try {
    const task = await Task.findById(taskId).select("submission");

    if (!task || !task.submission) {
      return null;
    }

    return {
      id: task.submission._id,
      content: task.submission.content?.substring(0, 500),
      submittedAt: task.submission.submittedAt,
      hasFiles: task.submission.files?.length > 0,
    };
  } catch (error) {
    logger.error("Error fetching submission context", { error: error.message });
    return null;
  }
};

/**
 * Fetch mentor context information
 * @param {string} userId - Mentor user ID
 * @returns {Promise<object>} - Mentor context
 */
const fetchMentorContext = async (userId) => {
  try {
    const mentor = await MentorProfile.findOne({ userId }).select(
      "expertise experience successRate mentoringStyle",
    );

    if (!mentor) {
      return null;
    }

    return {
      expertise: mentor.expertise || [],
      experience: mentor.experience || "beginner",
      successRate: mentor.successRate || 0,
      mentoringStyle: mentor.mentoringStyle || "collaborative",
    };
  } catch (error) {
    logger.error("Error fetching mentor context", { error: error.message });
    return null;
  }
};

/**
 * Get comprehensive platform overview
 * Provides AI with full website structure and capabilities
 * @returns {object} - Platform overview
 */
export const getPlatformOverview = () => {
  return {
    name: "SkillFlare",
    type: "Collaborative Skill-Building Platform",
    description:
      "A comprehensive platform for learning, skill development, and peer mentorship",

    // Website structure and pages
    pages: {
      home: {
        path: "/",
        title: "Home",
        description: "Landing page with platform overview and features",
        accessible: "public",
      },
      dashboard: {
        path: "/dashboard",
        title: "Dashboard",
        description:
          "User's personalized dashboard with tasks, progress, and statistics",
        accessible: "authenticated",
      },
      browseTasks: {
        path: "/browse",
        title: "Browse Tasks",
        description: "Explore and discover available tasks to work on",
        accessible: "authenticated",
      },
      postTask: {
        path: "/post-task",
        title: "Post Task",
        description: "Create and share new tasks for others",
        accessible: "authenticated",
      },
      taskDetails: {
        path: "/task/:id",
        title: "Task Details",
        description:
          "View full task description, requirements, and submit work",
        accessible: "authenticated",
      },
      mentors: {
        path: "/mentors",
        title: "Browse Mentors",
        description: "Find and connect with experienced mentors",
        accessible: "authenticated",
      },
      mentorProfile: {
        path: "/mentor/:id",
        title: "Mentor Profile",
        description: "View mentor details, expertise, and track record",
        accessible: "authenticated",
      },
      leaderboard: {
        path: "/leaderboard",
        title: "Leaderboard",
        description: "See top users and their achievements",
        accessible: "authenticated",
      },
      profile: {
        path: "/profile",
        title: "User Profile",
        description: "Manage personal profile, skills, and preferences",
        accessible: "authenticated",
      },
      editProfile: {
        path: "/profile/edit",
        title: "Edit Profile",
        description: "Update profile information and settings",
        accessible: "authenticated",
      },
      developers: {
        path: "/developers",
        title: "Developers",
        description: "View platform developers and creators",
        accessible: "public",
      },
    },

    // Core Features
    features: {
      taskManagement: {
        title: "Task Management",
        description: "Create, browse, and complete skill-building tasks",
        items: [
          "Post new tasks with requirements",
          "Browse and filter available tasks",
          "Track task progress and deadline",
          "Submit work for evaluation",
          "Receive feedback on submissions",
        ],
      },
      mentorship: {
        title: "Mentorship System",
        description: "Connect with mentors for guidance",
        items: [
          "Find mentors by expertise",
          "Send mentorship requests",
          "Chat with mentors",
          "Get personalized guidance",
          "Track mentor interactions",
        ],
      },
      socialEngine: {
        title: "Social & Collaboration",
        description: "Interact with other users",
        items: [
          "Rate and review submissions",
          "Comment on tasks",
          "Follow other users",
          "Build reputation",
          "Connect with peers",
        ],
      },
      gamification: {
        title: "Gamification",
        description: "Earn rewards and track progress",
        items: [
          "Earn credit points",
          "Gain skill badges",
          "Climb leaderboard",
          "Unlock achievements",
          "Track statistics",
        ],
      },
      aiAssistant: {
        title: "Buddy AI Assistant",
        description: "Get intelligent help and guidance",
        items: [
          "Ask questions about tasks",
          "Get concept explanations",
          "Receive code reviews",
          "Get learning suggestions",
          "Access 24/7 support",
        ],
      },
    },

    // User types and their primary functions
    userTypes: {
      student: {
        role: "Student",
        primaryGoal: "Learn and earn credits",
        mainActivities: [
          "Browse and complete tasks",
          "Request mentorship",
          "Submit work for feedback",
          "Improve skills",
          "Earn credit points",
        ],
        limitations: [
          "Cannot review others' submissions initially",
          "Limited mentorship requests",
          "Tasks limited based on skill level",
        ],
      },
      mentor: {
        role: "Mentor",
        primaryGoal: "Guide students and build reputation",
        mainActivities: [
          "Mentor students",
          "Review submissions",
          "Share expertise",
          "Complete tasks",
          "Post guideline tasks",
        ],
        benefits: [
          "Earn reputation points",
          "Build portfolio",
          "Higher credit rewards",
          "Priority task visibility",
        ],
      },
      teacher: {
        role: "Teacher",
        primaryGoal: "Manage learning and oversee platform",
        mainActivities: [
          "Create curated tasks",
          "Monitor student progress",
          "Review content quality",
          "Provide structured learning paths",
          "Moderate discussions",
        ],
        powers: [
          "Content moderation",
          "User management",
          "Task curation",
          "Progress analytics",
        ],
      },
    },

    // Statistics and Data Points
    statistics: {
      metrics: [
        "Total Users",
        "Active Tasks",
        "Completed Submissions",
        "Mentorship Connections",
        "Total Credit Points Earned",
        "Average User Rating",
      ],
      userMetrics: [
        "Tasks Completed",
        "Tasks Posted",
        "Average Rating",
        "Skill Level",
        "Credit Points Balance",
        "Mentoring Connections",
      ],
    },

    // Skills and Categories
    skillCategories: [
      "Programming",
      "Web Development",
      "Mobile Development",
      "Data Science",
      "Design",
      "Writing",
      "Marketing",
      "Project Management",
      "Leadership",
      "Communication",
    ],

    // Difficulty levels
    difficultyLevels: [
      "Beginner - Foundational skills",
      "Intermediate - Building on basics",
      "Advanced - Specialized knowledge",
      "Expert - Cutting-edge topics",
    ],
  };
};

/**
 * Get role-specific features and access
 * @param {string} role - User role (student, mentor, teacher)
 * @returns {object} - Role-specific features
 */
export const getRoleFeatures = (role) => {
  const baseFeatures = {
    chat: true,
    profile: true,
    messaging: true,
    notifications: true,
  };

  const roleFeatures = {
    student: {
      ...baseFeatures,
      browseTasks: true,
      postTask: false,
      submitWork: true,
      requestMentorship: true,
      becomeMentor: "after_verification",
      accessAIAssistant: true,
      rateLimit: "50/hour",
      features: [
        "View task details",
        "Submit solutions",
        "Request feedback",
        "Chat with mentors",
        "Ask AI assistant",
        "View leaderboard",
        "Earn credits",
      ],
    },
    mentor: {
      ...baseFeatures,
      browseTasks: true,
      postTask: true,
      submitWork: true,
      reviewSubmissions: true,
      mentorStudents: true,
      accessAIAssistant: true,
      rateLimit: "100/hour",
      features: [
        "Create and post tasks",
        "Review student submissions",
        "Mentor multiple students",
        "Higher credit rewards",
        "Access analytics",
        "Ask AI for guidance",
        "Build reputation",
      ],
    },
    teacher: {
      ...baseFeatures,
      browseTasks: true,
      postTask: true,
      submitWork: true,
      reviewSubmissions: true,
      moderateContent: true,
      accessAnalytics: true,
      accessAIAssistant: true,
      rateLimit: "200/hour",
      features: [
        "Full task management",
        "Content moderation",
        "View platform analytics",
        "Manage users",
        "Create learning paths",
        "Get AI insights",
        "Set platform guidelines",
      ],
    },
    admin: {
      ...baseFeatures,
      fullAccess: true,
      rateLimit: "unlimited",
      features: [
        "System administration",
        "User management",
        "Content management",
        "Platform configuration",
        "Advanced analytics",
      ],
    },
  };

  return roleFeatures[role.toLowerCase()] || baseFeatures;
};

/**
 * Get platform rules and guidelines
 * @returns {object} - Platform rules
 */
export const getPlatformRules = () => {
  return {
    academicIntegrity: {
      noCompleteSolutions: true,
      encourageLearning: true,
      promoteIndependentWork: true,
    },
    aiGuidelines: {
      tone: "professional and respectful",
      focus: "education and guidance",
      restrictions: ["no cheating assistance", "no complete solutions"],
    },
    communicationStandards: {
      requiresExplanations: true,
      encouragesHints: true,
      supportsConceptualLearning: true,
    },
  };
};

/**
 * Format context for prompt construction
 * @param {object} context - Built context
 * @returns {string} - Formatted context string
 */
export const formatContextForPrompt = (context) => {
  let contextStr = "";

  // Platform Overview
  contextStr += "=== PLATFORM CONTEXT ===\n";
  contextStr +=
    "Platform: SkillFlare - A collaborative skill-building platform\n";
  contextStr += `Your Name: Buddy AI - Your helpful learning assistant\n\n`;

  // Role and Access
  if (context.userRole) {
    contextStr += `=== USER CONTEXT ===\n`;
    contextStr += `User Role: ${context.userRole}\n`;
    if (context.roleFeaturesAccess) {
      contextStr += `Available Features: ${context.roleFeaturesAccess.features?.join(", ")}\n\n`;
    }
  }

  // User Information
  if (context.user) {
    contextStr += `=== USER PROFILE ===\n`;
    contextStr += `Name: ${context.user.name}\n`;
    contextStr += `Skill Level: ${context.user.skillLevel}\n`;
    contextStr += `Experience: ${context.user.tasksCompleted} tasks completed\n`;
    contextStr += `Rating: ${context.user.averageRating} stars\n\n`;
  }

  // Task Context
  if (context.task) {
    contextStr += `=== CURRENT TASK ===\n`;
    contextStr += `Title: ${context.task.title}\n`;
    contextStr += `Skills: ${context.task.skills.join(", ")}\n`;
    contextStr += `Difficulty: ${context.task.difficulty}\n`;
    contextStr += `Deadline: ${context.task.deadline}\n\n`;
  }

  // Submission Context
  if (context.submission) {
    contextStr += `=== SUBMISSION PREVIEW ===\n`;
    contextStr += `${context.submission.content?.substring(0, 300)}...\n\n`;
  }

  // Mentor Context
  if (context.mentor) {
    contextStr += `=== MENTOR INFO ===\n`;
    contextStr += `Expertise: ${context.mentor.expertise.join(", ")}\n`;
    contextStr += `Style: ${context.mentor.mentoringStyle}\n\n`;
  }

  // Platform Rules
  if (context.platformRules) {
    contextStr += `=== PLATFORM GUIDELINES ===\n`;
    contextStr += `- Focus on education and learning\n`;
    contextStr += `- Provide hints, not complete solutions\n`;
    contextStr += `- Encourage independent problem-solving\n`;
    contextStr += `- Maintain academic integrity\n\n`;
  }

  // Available Website Features
  if (context.platformOverview) {
    contextStr += `=== PLATFORM FEATURES YOU CAN REFERENCE ===\n`;
    contextStr += `- Task Management: Browse, create, and complete skill-building tasks\n`;
    contextStr += `- Mentorship System: Connect students with experienced mentors\n`;
    contextStr += `- Social Features: Rate, review, and comment on work\n`;
    contextStr += `- Gamification: Earn credits, badges, and climb leaderboards\n`;
    contextStr += `- AI Assistant (You): Provide 24/7 help and guidance\n\n`;
  }

  contextStr += `=== YOUR CAPABILITIES AS BUDDY AI ===\n`;
  contextStr += `You can help users with:\n`;
  contextStr += `- Understanding and explaining task requirements\n`;
  contextStr += `- Providing conceptual explanations for any topic\n`;
  contextStr += `- Suggesting learning approaches and study strategies\n`;
  contextStr += `- Code review and constructive feedback\n`;
  contextStr += `- Mentorship connection guidance\n`;
  contextStr += `- Platform navigation and feature assistance\n`;
  contextStr += `- Learning path recommendations\n`;
  contextStr += `- Skill development strategies\n`;

  return contextStr;
};

/**
 * Sanitize context for security
 * @param {object} context - Context to sanitize
 * @returns {object} - Sanitized context
 */
export const sanitizeContext = (context) => {
  const sanitized = { ...context };

  // Remove sensitive data
  if (sanitized.user) {
    delete sanitized.user.email;
  }

  // Limit submission content
  if (sanitized.submission && sanitized.submission.content) {
    sanitized.submission.content = sanitized.submission.content.substring(
      0,
      1000,
    );
  }

  return sanitized;
};

export default {
  buildContext,
  getPlatformRules,
  getPlatformOverview,
  getRoleFeatures,
  formatContextForPrompt,
  sanitizeContext,
};
