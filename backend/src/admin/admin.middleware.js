/**
 * Admin Authorization Middleware
 * Ensures that only users with admin emails can access admin routes
 */

import { isAdminUser } from "../utils/adminConfig.js";

export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized. Please mail to dargarkrish@gmail.com",
      });
    }

    if (!isAdminUser(req.user)) {
      return res.status(403).json({
        error:
          "Forbidden. Admin access required. Please mail to dargarkrish@gmail.com",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: "Server error in admin authorization",
    });
  }
};

export default isAdmin;
