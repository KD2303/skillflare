import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/sanitize.js';

// @desc    Get user profile
// @route   GET /api/users/profile/:id
// @access  Public
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Only allow https:// and http:// URLs to prevent javascript: URI XSS
const isSafeUrl = (value) => {
  if (!value) return true;
  try {
    const { protocol } = new URL(value);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, skills, portfolio, avatar } = req.body;

  if (portfolio && !isSafeUrl(portfolio)) {
    return res.status(400).json({ success: false, message: 'Invalid portfolio URL' });
  }
  if (avatar && !isSafeUrl(avatar)) {
    return res.status(400).json({ success: false, message: 'Invalid avatar URL' });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Update fields
  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (skills) user.skills = skills;
  if (portfolio !== undefined) user.portfolio = portfolio;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { role, limit = 20 } = req.query;

  const query = {};
  if (role) {
    query.role = role;
  }

  const users = await User.find(query)
    .select('name email role avatar creditPoints ratingPoints totalPoints tasksCompleted averageRating')
    .sort({ totalPoints: -1, tasksCompleted: -1 })
    .limit(parseInt(limit));

  // Add rank to each user
  const rankedUsers = users.map((user, index) => ({
    ...user.toObject(),
    rank: index + 1,
  }));

  res.status(200).json({
    success: true,
    count: rankedUsers.length,
    users: rankedUsers,
  });
});

// @desc    Get all users (for admin)
// @route   GET /api/users
// @access  Private (Admin only - future enhancement)
export const getUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 10 } = req.query;

  const query = {};

  if (role) {
    query.role = role;
  }

  if (search) {
    const escapedSearch = escapeRegex(search);
    query.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { email: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    users,
  });
});

// @desc    Rate a user
// @route   POST /api/users/:id/rate
// @access  Private
export const rateUser = asyncHandler(async (req, res) => {
  const { rating, review, taskId } = req.body;

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5',
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Can't rate yourself
  if (req.params.id === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot rate yourself',
    });
  }

  // Check if already rated for this task
  if (taskId) {
    const existingRating = user.ratings.find(
      (r) => r.taskId && r.taskId.toString() === taskId && r.ratedBy.toString() === req.user.id
    );

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this user for this task',
      });
    }
  }

  // Add rating
  user.ratings.push({
    rating,
    review: review || '',
    ratedBy: req.user.id,
    taskId: taskId || null,
  });

  // Calculate average rating and total points
  // Note: ratingPoints are only awarded via task review (reviewTask in taskController),
  // NOT here, to prevent double-awarding of points.
  user.calculateAverageRating();
  user.calculateTotalPoints();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Rating added successfully',
    averageRating: user.averageRating,
    totalRatings: user.ratings.length,
  });
});

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Get user's rank
  const usersAbove = await User.countDocuments({
    totalPoints: { $gt: user.totalPoints },
  });
  const rank = usersAbove + 1;

  res.status(200).json({
    success: true,
    stats: {
      creditPoints: user.creditPoints,
      ratingPoints: user.ratingPoints,
      totalPoints: user.totalPoints,
      tasksCompleted: user.tasksCompleted,
      tasksPosted: user.tasksPosted,
      averageRating: user.averageRating,
      totalRatings: user.ratings.length,
      rank,
    },
  });
});
