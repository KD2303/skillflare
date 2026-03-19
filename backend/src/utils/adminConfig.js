/**
 * Admin Configuration - Backend
 * Centralized admin user emails and constants
 */

export const ADMIN_EMAILS = [
  "24cd10vi76@mitsgwl.ac.in",
  "24cd10ar15@mitsgwl.ac.in",
  "24cd10kr34@mitsgwl.ac.in",
];

/**
 * Check if a user email is an admin email
 * @param {string} email - User email to check
 * @returns {boolean} - True if email is in admin list
 */
export const isAdminEmail = (email) => {
  return email && ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

/**
 * Check if a user is an admin based on their email
 * @param {object} user - User object
 * @returns {boolean} - True if user is admin
 */
export const isAdminUser = (user) => {
  return user && isAdminEmail(user.email);
};
