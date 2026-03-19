/**
 * Date utility functions for SkillFlare backend
 * Handles date conversions between frontend (DD-MM-YYYY) and database formats
 */

/**
 * Convert DD-MM-YYYY string to Date object
 * @param {string} dateStr - Date string in DD-MM-YYYY format
 * @returns {Date|null} - Date object or null if invalid
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;

  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return null;

  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  // Validate ranges
  if (
    dayNum < 1 ||
    dayNum > 31 ||
    monthNum < 1 ||
    monthNum > 12 ||
    yearNum < 1900
  ) {
    return null;
  }

  const date = new Date(yearNum, monthNum - 1, dayNum);

  // Validate date exists (e.g., Feb 30 should be invalid)
  if (
    date.getFullYear() !== yearNum ||
    date.getMonth() !== monthNum - 1 ||
    date.getDate() !== dayNum
  ) {
    return null;
  }

  return date;
};

/**
 * Convert Date object to DD-MM-YYYY string
 * @param {Date} date - Date object
 * @returns {string} - Date string in DD-MM-YYYY format
 */
export const formatDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

/**
 * Convert Date object to ISO string (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @returns {string} - ISO date string
 */
export const toISODate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return "";
  }
  return date.toISOString().split("T")[0];
};

/**
 * Get days remaining until deadline
 * @param {Date} deadline - Deadline date
 * @returns {number} - Days remaining (negative if overdue)
 */
export const getDaysUntilDeadline = (deadline) => {
  if (!deadline || !(deadline instanceof Date)) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Check if date is overdue
 * @param {Date} deadline - Deadline date
 * @returns {boolean} - True if overdue
 */
export const isDeadlineOverdue = (deadline) => {
  return getDaysUntilDeadline(deadline) < 0;
};

/**
 * Check if date is today
 * @param {Date} deadline - Deadline date
 * @returns {boolean} - True if deadline is today
 */
export const isDeadlineToday = (deadline) => {
  return getDaysUntilDeadline(deadline) === 0;
};

/**
 * Get date range (from to) for filtering
 * @param {string} rangeType - 'today', 'week', 'month', 'year'
 * @returns {object} - {startDate, endDate}
 */
export const getDateRange = (rangeType = "month") => {
  const now = new Date();
  let startDate, endDate;

  switch (rangeType) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;

    case "week":
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      break;

    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;

    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear() + 1, 0, 1);
      break;

    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  return { startDate, endDate };
};

/**
 * Format date for display with time
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
export const formatDateTime = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

/**
 * Validate if deadline is valid for task creation
 * @param {Date} deadline - Deadline date
 * @param {number} minDays - Minimum days in future (default: 0)
 * @returns {object} - {valid: boolean, error?: string}
 */
export const validateDeadline = (deadline, minDays = 0) => {
  if (!deadline || !(deadline instanceof Date) || isNaN(deadline)) {
    return {
      valid: false,
      error: "Deadline must be a valid date",
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const daysUntil = getDaysUntilDeadline(deadlineDate);

  if (daysUntil < minDays) {
    return {
      valid: false,
      error: `Deadline must be at least ${minDays} day(s) in the future`,
    };
  }

  return { valid: true };
};

export default {
  parseDate,
  formatDate,
  toISODate,
  getDaysUntilDeadline,
  isDeadlineOverdue,
  isDeadlineToday,
  getDateRange,
  formatDateTime,
  validateDeadline,
};
