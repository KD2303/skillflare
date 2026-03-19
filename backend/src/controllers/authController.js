import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendTokenResponse } from "../utils/tokenUtils.js";
import jwt from "jsonwebtoken";
import {
  normalizeEmail,
  validateEmailForRegistration,
  resolveUserRole as resolveEmailRole,
  validateEmailForPasswordOp,
} from "../utils/emailValidator.js";

// Generic security responses to prevent user enumeration
const GENERIC_AUTH_ERROR = {
  success: false,
  message: "Invalid credentials or account not found",
};

const GENERIC_REGISTRATION_ERROR = {
  success: false,
  message:
    "Registration could not be completed. Please ensure you're using your institutional email.",
};

const GENERIC_PASSWORD_RESET_RESPONSE = {
  success: true,
  message:
    "If an account with this email exists, a password reset link has been sent.",
};

/**
 * @desc    Register user - Strict email domain validation
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, skills, role: requestedRole } = req.body;
  const normalizedEmailValue = normalizeEmail(email);

  // Validate email format and domain approval
  const emailValidation = validateEmailForRegistration(normalizedEmailValue);
  if (!emailValidation.valid) {
    return res.status(400).json({
      success: false,
      message: emailValidation.error,
    });
  }

  // Resolve role based on email domain
  const role = resolveEmailRole(normalizedEmailValue, requestedRole);
  if (!role) {
    return res.status(400).json(GENERIC_REGISTRATION_ERROR);
  }

  // Check if email already registered
  const userExists = await User.findOne({ email: normalizedEmailValue });
  if (userExists) {
    return res.status(409).json({
      success: false,
      message: "This email is already registered",
    });
  }

  try {
    const user = await User.create({
      name,
      email: normalizedEmailValue,
      password,
      role,
      skills: skills || [],
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered",
      });
    }
    throw err;
  }
});

/**
 * @desc    Login user - Registered email verification
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmailValue = normalizeEmail(email);

  if (!normalizedEmailValue || !password) {
    return res.status(401).json(GENERIC_AUTH_ERROR);
  }

  // Find user by EXACT registered email
  const user = await User.findOne({ email: normalizedEmailValue }).select(
    "+password",
  );

  // Generic error to prevent account enumeration
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json(GENERIC_AUTH_ERROR);
  }

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Get Session - Verify JWT token
 * @route   GET /api/auth/session
 * @access  Public
 */
export const getSession = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  if (!token)
    return res
      .status(200)
      .json({ success: true, authenticated: false, user: null });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res
        .status(200)
        .json({ success: true, authenticated: false, user: null });

    res.status(200).json({ success: true, authenticated: true, user });
  } catch {
    res.status(200).json({ success: true, authenticated: false, user: null });
  }
});

/**
 * @desc    Logout - Clear authentication token
 * @route   GET /api/auth/logout
 * @access  Public
 */
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

/**
 * @desc    Get Current User Profile
 * @route   GET /api/auth/me
 * @access  Protected
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  res.status(200).json({ success: true, user });
});

/**
 * @desc    Update Password - Authenticated user only
 * @route   PUT /api/auth/updatepassword
 * @access  Protected
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+password");

  // Verify current password matches registered user
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  // Update password
  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Forgot Password - Registered Email Only
 * @route   POST /api/auth/forgot-password
 * @access  Public
 *
 * Security: Generic response to prevent user enumeration
 * Email must match registered account email exactly
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate and normalize email input
  const emailValidation = validateEmailForPasswordOp(email);
  if (!emailValidation.valid) {
    return res.status(200).json(GENERIC_PASSWORD_RESET_RESPONSE);
  }

  const normalizedEmailValue = emailValidation.normalizedEmail;

  // Find user by EXACT registered email
  const user = await User.findOne({ email: normalizedEmailValue });

  // Always respond with generic message (prevents user enumeration)
  if (!user) {
    return res.status(200).json(GENERIC_PASSWORD_RESET_RESPONSE);
  }

  // Verify email matches
  if (user.email !== normalizedEmailValue) {
    return res.status(200).json(GENERIC_PASSWORD_RESET_RESPONSE);
  }

  // Generate reset token tied to registered email
  const resetToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.RESET_TOKEN_SECRET,
    { expiresIn: process.env.RESET_TOKEN_EXPIRE || "15m" },
  );

  // Store token and expiry in database
  const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
  user.resetToken = resetToken;
  user.resetTokenExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // Send reset link to registered email ONLY
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const { sendEmail } = await import("../utils/emailService.js");
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request - SkillFlare",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset for your SkillFlare account (${user.email}).</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Or copy: <a href="${resetUrl}">${resetUrl}</a></p>
        <p><strong>Security Notice:</strong></p>
        <ul>
          <li>This link expires in 15 minutes</li>
          <li>Never share this link with anyone</li>
          <li>Resets only work for your registered email: ${user.email}</li>
          <li>Ignore this if you didn't request it</li>
        </ul>
        <p>Best regards,<br>SkillFlare Security Team</p>
      `,
    });

    res.status(200).json(GENERIC_PASSWORD_RESET_RESPONSE);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save({ validateBeforeSave: false });
    res.status(200).json(GENERIC_PASSWORD_RESET_RESPONSE);
  }
});

/**
 * @desc    Reset Password - Verify Token & Update via Registered Email
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 *
 * Security: Token must match user's registered email
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing password reset token",
    });
  }

  if (!password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide password and confirm password",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters",
    });
  }

  try {
    // Verify the reset token
    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);

    // Find user matching email and token
    const user = await User.findOne({
      _id: decoded.id,
      email: decoded.email,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    }).select("+resetToken +resetTokenExpiry");

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired password reset link. Please request a new one.",
      });
    }

    // Update password
    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    // Send confirmation to registered email
    try {
      const { sendEmail } = await import("../utils/emailService.js");
      await sendEmail({
        to: user.email,
        subject: "Password Reset Successful - SkillFlare",
        html: `
          <h2>Password Reset Successful</h2>
          <p>Your password for ${user.email} has been reset.</p>
          <p>If this wasn't you, contact support immediately.</p>
          <p>Best regards,<br>SkillFlare Security Team</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
    }

    res.status(200).json({
      success: true,
      message:
        "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        success: false,
        message: "Invalid password reset token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Password reset token has expired",
      });
    }
    throw error;
  }
});

export default {
  register,
  login,
  getSession,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
};
