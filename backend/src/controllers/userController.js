import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/sanitize.js';
import { cache } from '../config/cache.js';
import { getPaginationParams, getPaginationMeta } from '../utils/queryOptimization.js';

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

// Helper for URL validation
const isSafeUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
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
    return res.status(404).json({ success: false, message: 'User not found' });
  }

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

// @desc    Get leaderboard (cached for performance)
// @route   GET /api/users/leaderboard
// @access  Public
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { role, limit, page } = req.query;
  
  // Use utility for standardized pagination
  const { page: pageNum, limit: limitNum, skip } = getPaginationParams({ page, limit });
  const cacheKey = `leaderboard:${role || 'all'}:${limitNum}:${pageNum}`;

  // Try cache
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    return res.status(200).json({
      success: true,
      ...cachedResult,
      fromCache: true,
    });
  }

  const query = role ? { role } : {};

  const [users, total] = await Promise.all([
    User.find(query)
      .select('name email role avatar creditPoints ratingPoints totalPoints tasksCompleted averageRating')
      .sort({ totalPoints: -1, tasksCompleted: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query),
  ]);

  const rankedUsers = users.map((user, index) => ({
    ...user,
    rank: skip + index + 1,
  }));

  const result = {
    users: rankedUsers,
    ...getPaginationMeta(total, pageNum, limitNum),
  };

  // Cache result for 5 minutes (300 seconds)
  cache.set(cacheKey, result, 300);

  res.status(200).json({
    success: true,
    ...result,
  });
});

// @desc    Get all users (with search and filter)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, search } = req.query;
  const { page: pageNum, limit: pageLimit, skip } = getPaginationParams({ page, limit });

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

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean(),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    users,
    ...getPaginationMeta(total, pageNum, pageLimit),
  });
});

// @desc    Rate a user
// @route   POST /api/users/:id/rate
// @access  Private
export const rateUser = asyncHandler(async (req, res) => {
  const { rating, review, taskId } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot rate yourself' });
  }

  if (taskId) {
    const existingRating = user.ratings.find(
      (r) => r.taskId?.toString() === taskId && r.ratedBy.toString() === req.user.id
    );

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this user for this task',
      });
    }
  }

  user.ratings.push({
    rating,
    review: review || '',
    ratedBy: req.user.id,
    taskId: taskId || null,
  });

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
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const usersAbove = await User.countDocuments({
    totalPoints: { $gt: user.totalPoints },
  });

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
      rank: usersAbove + 1,
    },
  });
});