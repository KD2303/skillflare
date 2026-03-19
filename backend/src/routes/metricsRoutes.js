import express from "express";
import { getMetrics, resetMetrics } from "../middleware/metrics.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../config/logger.js";

const router = express.Router();

/**
 * @desc    Get current system metrics
 * @route   GET /api/metrics
 * @access  Public (should be restricted in production)
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const metrics = getMetrics();

    logger.info("Metrics endpoint accessed", {
      endpoint: "/api/metrics",
      metrics: JSON.stringify(metrics),
    });

    res.status(200).json({
      success: true,
      data: metrics,
    });
  }),
);

/**
 * @desc    Reset metrics (for testing)
 * @route   POST /api/metrics/reset
 * @access  Public (should be restricted in production)
 */
router.post(
  "/reset",
  asyncHandler(async (req, res) => {
    resetMetrics();

    logger.warn("Metrics reset via API", {
      endpoint: "/api/metrics/reset",
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Metrics reset successfully",
    });
  }),
);

export default router;
