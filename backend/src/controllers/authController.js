import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendTokenResponse } from "../utils/tokenUtils.js";
import jwt from "jsonwebtoken";

// Configuration for roles
const DOMAIN_ROLE_MAP = {
  "mitsgwalior.in": "teacher",
  "mitsgwl.ac.in": "student",
};

const isEmailDomainRestrictionEnabled =
  process.env.RESTRICT_EMAIL_DOMAIN === "true" ||
  process.env.NODE_ENV === "production";

const getRoleFromEmail = (email) => {
  if (!email || !email.includes("@")) return null;
  const domain = email.split("@").pop().toLowerCase();
  return DOMAIN_ROLE_MAP[domain] || null;
};

const resolveUserRole = (email, requestedRole) => {
  const derivedRole = getRoleFromEmail(email);
  if (derivedRole) return derivedRole;

  // If restriction is ON and domain doesn't match, block registration
  if (isEmailDomainRestrictionEnabled) return null;

  // If restriction is OFF (Dev mode), fallback to requested role or student
  return requestedRole === "teacher" ? "teacher" : "student";
};

// @desc    Register user
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, skills, role: requestedRole } = req.body;
  const normalizedEmail = (email || "").trim().toLowerCase();

  const role = resolveUserRole(normalizedEmail, requestedRole);
  if (!role) {
    return res.status(400).json({
      success: false,
      message: "Please use your institutional email (@mitsgwalior.in or @mitsgwl.ac.in)",
    });
  }

  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    return res.status(409).json({ success: false, message: "Email already registered" });
  }

  try {
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      skills: skills || [],
    });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    throw err;
  }
});

// @desc    Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get Session (Non-blocking)
export const getSession = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(200).json({ success: true, authenticated: false, user: null });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(200).json({ success: true, authenticated: false, user: null });

    res.status(200).json({ success: true, authenticated: true, user });
  } catch {
    res.status(200).json({ success: true, authenticated: false, user: null });
  }
});

// @desc    Logout
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({ success: false, message: "Current password incorrect" });
  }
  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});