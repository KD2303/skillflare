import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import MentorProfile from "../models/MentorProfile.js";
import MentorshipRequest from "../models/MentorshipRequest.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../utils/queryOptimization.js";
import logger from "../config/logger.js";

// @desc    Get all mentors (with pagination)
// @route   GET /api/mentors
// @access  Public
export const getMentors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const {
    skip,
    limit: pageLimit,
    page: pageNum,
  } = getPaginationParams({ page, limit });

  const [mentors, total] = await Promise.all([
    MentorProfile.find({ isActive: true })
      .select("userId bio skills")
      .populate("userId", "name email avatar isMentor")
      .skip(skip)
      .limit(pageLimit)
      .lean()
      .exec(),
    MentorProfile.countDocuments({ isActive: true }),
  ]);

  res.status(200).json({
    success: true,
    ...getPaginationMeta(total, pageNum, pageLimit),
    mentors,
  });
});

// @desc    Get mentor by ID
// @route   GET /api/mentors/:id
// @access  Public
export const getMentorById = asyncHandler(async (req, res) => {
  const mentor = await MentorProfile.findOne({
    userId: req.params.id,
  }).populate("userId", "name email avatar isMentor");

  if (!mentor) {
    res.status(404);
    throw new Error("Mentor not found");
  }

  res.status(200).json(mentor);
});

// @desc    Apply as mentor
// @route   POST /api/mentors/apply
// @access  Private
export const applyAsMentor = asyncHandler(async (req, res) => {
  const { bio, skills, socialLinks, codingPlatforms } = req.body;

  let mentorProfile = await MentorProfile.findOne({ userId: req.user._id });

  if (mentorProfile) {
    res.status(400);
    throw new Error("You have already applied as a mentor");
  }

  mentorProfile = await MentorProfile.create({
    userId: req.user._id,
    bio,
    skills: skills || [],
    socialLinks: socialLinks || {},
    codingPlatforms: codingPlatforms || {},
  });

  // Update user to be a mentor
  await User.findByIdAndUpdate(req.user._id, { isMentor: true });

  res.status(201).json(mentorProfile);
});

// @desc    Update mentor profile
// @route   PUT /api/mentors/update
// @access  Private
export const updateMentorProfile = asyncHandler(async (req, res) => {
  const { bio, isActive, skills, socialLinks, codingPlatforms } = req.body;

  const mentorProfile = await MentorProfile.findOne({ userId: req.user._id });

  if (!mentorProfile) {
    res.status(404);
    throw new Error("Mentor profile not found");
  }

  if (bio !== undefined) mentorProfile.bio = bio;
  if (isActive !== undefined) mentorProfile.isActive = isActive;
  if (socialLinks !== undefined) mentorProfile.socialLinks = socialLinks;
  if (codingPlatforms !== undefined)
    mentorProfile.codingPlatforms = codingPlatforms;
  if (skills !== undefined) {
    // Preserve verification status for existing skills, add new ones as pending
    const updatedSkills = skills.map((newSkill) => {
      const existing = mentorProfile.skills.find(
        (s) => s.name === newSkill.name,
      );
      if (existing) {
        return {
          ...existing.toObject(),
          level: newSkill.level || existing.level,
        };
      }
      return {
        name: newSkill.name,
        level: newSkill.level || "beginner",
        verificationStatus: "pending",
      };
    });
    mentorProfile.skills = updatedSkills;
  }

  await mentorProfile.save();

  const populated = await MentorProfile.findById(mentorProfile._id).populate(
    "userId",
    "name email avatar isMentor",
  );
  res.status(200).json(populated);
});

// @desc    Add skill to mentor profile
// @route   POST /api/mentors/add-skill
// @access  Private
export const addSkill = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const mentorProfile = await MentorProfile.findOne({ userId: req.user._id });

  if (!mentorProfile) {
    res.status(404);
    throw new Error("Mentor profile not found");
  }

  // Check if skill already exists
  const skillExists = mentorProfile.skills.find((s) => s.name === name);
  if (skillExists) {
    res.status(400);
    throw new Error("Skill already exists");
  }

  mentorProfile.skills.push({ name, verificationStatus: "pending" });
  await mentorProfile.save();

  res.status(200).json(mentorProfile);
});

// @desc    Upload verification document for a skill
// @route   POST /api/mentors/upload-verification
// @access  Private
export const uploadVerification = asyncHandler(async (req, res) => {
  const { skillName, verificationDoc } = req.body;

  const mentorProfile = await MentorProfile.findOne({ userId: req.user._id });

  if (!mentorProfile) {
    res.status(404);
    throw new Error("Mentor profile not found");
  }

  const skillIndex = mentorProfile.skills.findIndex(
    (s) => s.name === skillName,
  );

  if (skillIndex === -1) {
    res.status(404);
    throw new Error("Skill not found");
  }

  mentorProfile.skills[skillIndex].verificationDoc = verificationDoc;
  mentorProfile.skills[skillIndex].verificationStatus = "pending";

  await mentorProfile.save();

  res.status(200).json(mentorProfile);
});

// @desc    Verify skill (Admin only)
// @route   PUT /api/admin/verify-skill/:mentorId/:skillId
// @access  Private/Admin
export const verifySkill = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const mentorProfile = await MentorProfile.findOne({
    userId: req.params.mentorId,
  });

  if (!mentorProfile) {
    res.status(404);
    throw new Error("Mentor profile not found");
  }

  const skill = mentorProfile.skills.id(req.params.skillId);

  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  skill.verificationStatus = status;
  skill.isVerified = status === "approved";

  await mentorProfile.save();

  res.status(200).json(mentorProfile);
});

// @desc    Request mentorship session
// @route   POST /api/mentors/request-session
// @access  Private
export const requestSession = asyncHandler(async (req, res) => {
  const { mentorId, skill, message, sessionDate, creditsUsed } = req.body;

  // Validate mentorId is provided and is valid MongoDB ObjectId format
  if (!mentorId || !mongoose.Types.ObjectId.isValid(mentorId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid mentor ID provided",
    });
  }

  // Validate credit usage
  if (!creditsUsed || creditsUsed <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid credits amount",
    });
  }

  if (req.user._id.toString() === mentorId) {
    return res.status(400).json({
      success: false,
      message: "You cannot request a session with yourself",
    });
  }

  const mentorProfile = await MentorProfile.findOne({
    userId: mentorId,
    isActive: true,
  });
  if (!mentorProfile) {
    return res.status(404).json({
      success: false,
      message: "Mentor not found or inactive",
    });
  }

  const student = await User.findById(req.user._id);
  if (!student) {
    return res.status(401).json({
      success: false,
      message: "User not found",
    });
  }

  if (student.creditPoints < creditsUsed) {
    return res.status(400).json({
      success: false,
      message: `Insufficient credits. You have ${student.creditPoints} credits but need ${creditsUsed}`,
    });
  }

  // Use a transaction so credit deduction and request creation are atomic
  const dbSession = await mongoose.startSession();
  let request;
  try {
    await dbSession.withTransaction(async () => {
      student.creditPoints -= creditsUsed;
      await student.save({ session: dbSession });

      [request] = await MentorshipRequest.create(
        [
          {
            studentId: req.user._id,
            mentorId,
            skill,
            message,
            sessionDate,
            creditsUsed,
          },
        ],
        { session: dbSession },
      );
    });
  } catch (error) {
    logger.error("Failed to create mentorship request", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create mentorship request. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    await dbSession.endSession();
  }

  res.status(201).json({
    success: true,
    message: "Session request created successfully",
    request,
  });
});

// @desc    Get my mentorship requests (as student or mentor, with pagination)
// @route   GET /api/mentors/my-requests
// @access  Private
export const getMyRequests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const {
    skip,
    limit: pageLimit,
    page: pageNum,
  } = getPaginationParams({ page, limit });

  const [requestsAsStudent, requestsAsMentor] = await Promise.all([
    MentorshipRequest.find({ studentId: req.user._id })
      .populate("mentorId", "name avatar")
      .sort({ createdAt: -1 })
      .lean()
      .exec(),
    MentorshipRequest.find({ mentorId: req.user._id })
      .populate("studentId", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean()
      .exec(),
  ]);

  const totalAsMentor = await MentorshipRequest.countDocuments({
    mentorId: req.user._id,
  });

  res.status(200).json({
    success: true,
    asStudent: requestsAsStudent,
    asMentor: {
      requests: requestsAsMentor,
      ...getPaginationMeta(totalAsMentor, pageNum, pageLimit),
    },
  });
});

// @desc    Respond to mentorship request
// @route   PUT /api/mentors/respond/:requestId
// @access  Private
export const respondToRequest = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'

  if (!["accepted", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const request = await MentorshipRequest.findById(req.params.requestId);

  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  if (request.mentorId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }

  if (request.status !== "pending") {
    res.status(400);
    throw new Error("Request already processed");
  }

  request.status = status;
  await request.save();

  // If rejected, refund credits
  if (status === "rejected") {
    const student = await User.findById(request.studentId);
    student.creditPoints += request.creditsUsed;
    await student.save();
  }

  res.status(200).json(request);
});

// @desc    Complete mentorship session
// @route   PUT /api/mentors/complete/:requestId
// @access  Private
export const completeSession = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;

  const request = await MentorshipRequest.findById(req.params.requestId);

  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  if (request.studentId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Only student can complete and rate the session");
  }

  if (request.status !== "accepted") {
    res.status(400);
    throw new Error("Session must be accepted before completion");
  }

  request.status = "completed";
  if (rating) request.rating = rating;
  if (review) request.review = review;
  await request.save();

  // Transfer credits to mentor
  const mentor = await User.findById(request.mentorId);
  mentor.creditPoints += request.creditsUsed;
  await mentor.save();

  // Update mentor profile rating
  const mentorProfile = await MentorProfile.findOne({
    userId: request.mentorId,
  });
  if (mentorProfile) {
    const totalRatingSum = mentorProfile.rating * mentorProfile.totalSessions;
    mentorProfile.totalSessions += 1;
    mentorProfile.rating =
      (totalRatingSum + (rating || 0)) / mentorProfile.totalSessions;
    await mentorProfile.save();
  }

  res.status(200).json(request);
});
