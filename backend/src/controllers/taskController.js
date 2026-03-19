import Task from "../models/Task.js";
import User from "../models/User.js";
import ChatRoom from "../models/ChatRoom.js";
import asyncHandler from "../utils/asyncHandler.js";
import { escapeRegex } from "../utils/sanitize.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../utils/queryOptimization.js";
import { validateDeadline } from "../utils/dateUtils.js";
import logger from "../config/logger.js";

// @desc    Get all tasks (with pagination)
// @route   GET /api/tasks
// @access  Public
export const getTasks = asyncHandler(async (req, res) => {
  const { status, posterRole, skill, search, page = 1, limit = 10 } = req.query;
  const {
    skip,
    limit: pageLimit,
    page: pageNum,
  } = getPaginationParams({ page, limit });

  const query = {};

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by poster role (teacher/student)
  if (posterRole) {
    query.posterRole = posterRole;
  }

  // Filter by skill
  if (skill) {
    query.skills = { $in: [skill] };
  }

  // Search in title and description (escape user input to prevent ReDoS)
  if (search) {
    const escapedSearch = escapeRegex(search);
    query.$or = [
      { title: { $regex: escapedSearch, $options: "i" } },
      { description: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .select(
        "title description skills status posterRole creditPoints deadline postedBy takenBy",
      )
      .populate("postedBy", "name email role avatar")
      .populate("takenBy", "name email role avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean()
      .exec(),
    Task.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: tasks.length,
    ...getPaginationMeta(total, pageNum, pageLimit),
    tasks,
  });
});

// @desc    Get single task (with lean for read-only operations)
// @route   GET /api/tasks/:id
// @access  Public
export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("postedBy", "name email role avatar skills bio")
    .populate("takenBy", "name email role avatar skills bio")
    .populate("chatRoom")
    .lean()
    .exec();

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  res.status(200).json({
    success: true,
    task,
  });
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, skills, creditPoints, deadline } = req.body;

  // Validate deadline is in the future
  const deadlineDate = new Date(deadline);
  const validationResult = validateDeadline(deadlineDate, 0);

  if (!validationResult.valid) {
    return res.status(400).json({
      success: false,
      message: validationResult.error,
    });
  }

  // Students cannot assign credit points
  let taskCreditPoints = 0;
  if (req.user.role === "teacher") {
    taskCreditPoints = creditPoints || 20; // Default 20 for teachers
  }

  const task = await Task.create({
    title,
    description,
    skills,
    creditPoints: taskCreditPoints,
    deadline: deadlineDate,
    postedBy: req.user.id,
    posterRole: req.user.role,
  });

  // Update user's tasksPosted count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { tasksPosted: 1 },
  });

  const populatedTask = await Task.findById(task._id).populate(
    "postedBy",
    "name email role avatar",
  );

  logger.info("Task created", {
    taskId: task._id,
    userId: req.user.id,
    title,
    deadline: deadline,
  });

  res.status(201).json({
    success: true,
    task: populatedTask,
  });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Task poster only)
export const updateTask = asyncHandler(async (req, res) => {
  const { title, description, skills, creditPoints, deadline } = req.body;
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  // Check if user is the task poster
  if (task.postedBy.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this task",
    });
  }

  // Can only edit open tasks
  if (task.status !== "open") {
    return res.status(400).json({
      success: false,
      message: "Cannot edit a task that has been taken",
    });
  }

  // Validate deadline if provided
  if (deadline) {
    const deadlineDate = new Date(deadline);
    const validationResult = validateDeadline(deadlineDate, 0);

    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        message: validationResult.error,
      });
    }

    task.deadline = deadlineDate;
  }

  // Update fields
  if (title) task.title = title;
  if (description) task.description = description;
  if (skills) task.skills = skills;
  if (creditPoints !== undefined && req.user.role === "teacher") {
    task.creditPoints = creditPoints;
  }

  await task.save();

  const updatedTask = await Task.findById(task._id).populate(
    "postedBy",
    "name email role avatar",
  );

  logger.info("Task updated", {
    taskId: task._id,
    userId: req.user.id,
    title,
  });

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    task: updatedTask,
  });
});

// @desc    Take a task
// @route   PUT /api/tasks/:id/take
// @access  Private (Students only)
export const takeTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  // Check if task is available
  if (task.status !== "open" && task.status !== "reassigned") {
    return res.status(400).json({
      success: false,
      message: "This task is not available",
    });
  }

  // Check if student is trying to take their own task
  if (task.postedBy.toString() === req.user.id) {
    return res.status(400).json({
      success: false,
      message: "You cannot take your own task",
    });
  }

  // Check if user was previously assigned to this task
  const wasPreviouslyAssigned = task.previousAssignees.some(
    (assignee) => assignee.user.toString() === req.user.id,
  );

  if (wasPreviouslyAssigned) {
    return res.status(400).json({
      success: false,
      message:
        "You were previously assigned to this task and cannot take it again",
    });
  }

  // Create chat room for task
  const chatRoom = await ChatRoom.create({
    task: task._id,
    participants: [task.postedBy, req.user.id],
    messages: [
      {
        sender: req.user.id,
        content: `${req.user.name} has taken this task`,
        messageType: "system",
        readBy: [req.user.id],
      },
    ],
  });

  // Update task
  task.status = "in_progress";
  task.takenBy = req.user.id;
  task.chatRoom = chatRoom._id;
  await task.save();

  const updatedTask = await Task.findById(task._id)
    .select(
      "title description skills status posterRole creditPoints deadline postedBy takenBy chatRoom",
    )
    .populate("postedBy", "name email role avatar")
    .populate("takenBy", "name email role avatar")
    .populate("chatRoom");

  res.status(200).json({
    success: true,
    message: "Task taken successfully",
    task: updatedTask,
  });
});

// @desc    Submit task work
// @route   PUT /api/tasks/:id/submit
// @access  Private
export const submitTask = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  // Check if user is the one who took the task
  if (task.takenBy.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "You are not assigned to this task",
    });
  }

  // Check if task is in progress
  if (task.status !== "in_progress") {
    return res.status(400).json({
      success: false,
      message: "Task cannot be submitted at this stage",
    });
  }

  // Update task submission
  task.status = "submitted";
  task.submission = {
    content,
    submittedAt: new Date(),
  };
  await task.save();

  // Add system message to chat
  if (task.chatRoom) {
    await ChatRoom.findByIdAndUpdate(
      task.chatRoom,
      {
        $push: {
          messages: {
            sender: req.user.id,
            content: "Work has been submitted for review",
            messageType: "system",
            readBy: [req.user.id],
          },
        },
      },
      { new: false },
    );
  }

  const updatedTask = await Task.findById(task._id)
    .select("title description status postedBy takenBy submission")
    .populate("postedBy", "name email role avatar")
    .populate("takenBy", "name email role avatar");

  res.status(200).json({
    success: true,
    message: "Work submitted successfully",
    task: updatedTask,
  });
});

// @desc    Review task submission
// @route   PUT /api/tasks/:id/review
// @access  Private (Task poster only)
export const reviewTask = asyncHandler(async (req, res) => {
  const { satisfied, feedback, rating } = req.body;
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  // Check if user is the task poster
  if (task.postedBy.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Only the task poster can review submissions",
    });
  }

  // Check if task is submitted
  if (task.status !== "submitted") {
    return res.status(400).json({
      success: false,
      message: "Task has not been submitted yet",
    });
  }

  task.review = {
    satisfied,
    feedback,
    reviewedAt: new Date(),
  };

  if (satisfied) {
    task.status = "completed";

    // Award credits if teacher task
    const takenByUser = await User.findById(task.takenBy);

    if (task.posterRole === "teacher" && task.creditPoints > 0) {
      takenByUser.creditPoints += task.creditPoints;
    }

    // Add rating if provided (rating points are ONLY awarded here during task review,
    // NOT in the separate rateUser endpoint, to prevent double-awarding)
    if (rating && rating >= 1 && rating <= 5) {
      takenByUser.ratings.push({
        rating,
        review: feedback,
        ratedBy: req.user.id,
        taskId: task._id,
      });
      takenByUser.calculateAverageRating();
    }

    takenByUser.tasksCompleted += 1;
    takenByUser.calculateTotalPoints();
    await takenByUser.save();

    // Add system message to chat
    if (task.chatRoom) {
      await ChatRoom.findByIdAndUpdate(
        task.chatRoom,
        {
          $push: {
            messages: {
              sender: req.user.id,
              content: `Task completed! ${task.posterRole === "teacher" ? `${task.creditPoints} credits awarded.` : ""}`,
              messageType: "system",
              readBy: [req.user.id],
            },
          },
          isActive: false,
        },
        { new: false },
      );
    }
  }

  await task.save();

  const updatedTask = await Task.findById(task._id)
    .select(
      "title description status review posterRole creditPoints postedBy takenBy",
    )
    .populate("postedBy", "name email role avatar")
    .populate("takenBy", "name email role avatar");

  res.status(200).json({
    success: true,
    message: satisfied ? "Task completed successfully" : "Review submitted",
    task: updatedTask,
  });
});

// @desc    Reassign task
// @route   PUT /api/tasks/:id/reassign
// @access  Private (Task poster only)
export const reassignTask = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  // Check if user is the task poster
  if (task.postedBy.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Only the task poster can reassign tasks",
    });
  }

  // Check if task can be reassigned
  if (!["in_progress", "submitted"].includes(task.status)) {
    return res.status(400).json({
      success: false,
      message: "Task cannot be reassigned at this stage",
    });
  }

  // Add current assignee to previous assignees
  task.previousAssignees.push({
    user: task.takenBy,
    reason: reason || "Task reassigned",
  });

  // Reset task
  task.status = "reassigned";
  task.takenBy = null;
  task.submission = { content: "", submittedAt: null, files: [] };
  task.review = { satisfied: null, feedback: "", reviewedAt: null };
  task.reassignCount += 1;

  // Deactivate old chat room
  if (task.chatRoom) {
    await ChatRoom.findByIdAndUpdate(
      task.chatRoom,
      {
        isActive: false,
        $push: {
          messages: {
            sender: req.user.id,
            content: `Task has been reassigned. Reason: ${reason || "Not specified"}`,
            messageType: "system",
            readBy: [req.user.id],
          },
        },
      },
      { new: false },
    );
  }

  task.chatRoom = null;
  await task.save();

  const updatedTask = await Task.findById(task._id)
    .select(
      "title description status posterRole reassignCount postedBy takenBy",
    )
    .populate("postedBy", "name email role avatar");

  res.status(200).json({
    success: true,
    message: "Task reassigned successfully",
    task: updatedTask,
  });
});

// @desc    Get tasks by user (with pagination)
// @route   GET /api/tasks/user/:userId
// @access  Public
export const getTasksByUser = asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;
  const {
    skip,
    limit: pageLimit,
    page: pageNum,
  } = getPaginationParams({ page, limit });

  let query = {};
  if (type === "posted") {
    query.postedBy = req.params.userId;
  } else if (type === "taken") {
    query.takenBy = req.params.userId;
  } else {
    query.$or = [
      { postedBy: req.params.userId },
      { takenBy: req.params.userId },
    ];
  }

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .select(
        "title description skills status posterRole creditPoints deadline postedBy takenBy",
      )
      .populate("postedBy", "name email role avatar")
      .populate("takenBy", "name email role avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean()
      .exec(),
    Task.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: tasks.length,
    ...getPaginationMeta(total, pageNum, pageLimit),
    tasks,
  });
});

// @desc    Get my tasks (posted and taken) with pagination
// @route   GET /api/tasks/my-tasks
// @access  Private
export const getMyTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const {
    skip,
    limit: pageLimit,
    page: pageNum,
  } = getPaginationParams({ page, limit });

  const [postedTasks, takenTasks, postedCount, takenCount] = await Promise.all([
    Task.find({ postedBy: req.user.id })
      .select(
        "title description skills status posterRole creditPoints deadline postedBy takenBy",
      )
      .populate("postedBy", "name email role avatar")
      .populate("takenBy", "name email role avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean()
      .exec(),
    Task.find({ takenBy: req.user.id })
      .select(
        "title description skills status posterRole creditPoints deadline postedBy takenBy",
      )
      .populate("postedBy", "name email role avatar")
      .populate("takenBy", "name email role avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean()
      .exec(),
    Task.countDocuments({ postedBy: req.user.id }),
    Task.countDocuments({ takenBy: req.user.id }),
  ]);

  res.status(200).json({
    success: true,
    postedTasks: {
      tasks: postedTasks,
      ...getPaginationMeta(postedCount, pageNum, pageLimit),
    },
    takenTasks: {
      tasks: takenTasks,
      ...getPaginationMeta(takenCount, pageNum, pageLimit),
    },
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Task poster only)
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  // Check if user is the task poster
  if (task.postedBy.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this task",
    });
  }

  // Can only delete open tasks
  if (task.status !== "open") {
    return res.status(400).json({
      success: false,
      message: "Cannot delete a task that has been taken",
    });
  }

  await task.deleteOne();

  // Update user's tasksPosted count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { tasksPosted: -1 },
  });

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
});
