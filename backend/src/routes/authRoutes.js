import express from "express";
import {
  register,
  login,
  getSession,
  getMe,
  logout,
  updatePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  registerRules,
  loginRules,
  updatePasswordRules,
} from "../middleware/validate.js";

const router = express.Router();

router.post("/register", authLimiter, registerRules, register);
router.post("/login", authLimiter, loginRules, login);
router.get("/session", getSession);
router.get("/logout", logout); // No need for protect to logout safely

// Forgot Password & Reset Password Routes
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.get("/me", protect, getMe);
router.put(
  "/updatepassword",
  protect,
  authLimiter,
  updatePasswordRules,
  updatePassword,
);

export default router;
