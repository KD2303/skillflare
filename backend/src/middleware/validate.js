/**
 * Request body validation middleware factory.
 * Validates required fields and types before reaching the controller.
 *
 * @param {Array<{field: string, type: string, required?: boolean, min?: number, max?: number, message?: string}>} rules
 * @returns {Function} Express middleware
 */
export const validate = (rules) => {
  return (req, res, next) => {
    const errors = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      // Check required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(rule.message || `${rule.field} is required`);
        continue;
      }

      // Skip further checks if value is not present and not required
      if (value === undefined || value === null) continue;

      // Type checks
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${rule.field} must be a string`);
      }

      if (rule.type === 'number' && typeof value !== 'number') {
        errors.push(`${rule.field} must be a number`);
      }

      if (rule.type === 'array' && !Array.isArray(value)) {
        errors.push(`${rule.field} must be an array`);
      }

      if (rule.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${rule.field} must be a boolean`);
      }

      if (rule.type === 'date') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`${rule.field} must be a valid date`);
        } else if (rule.future && date <= new Date()) {
          errors.push(`${rule.field} must be a future date`);
        }
      }

      // Min/Max for strings
      if (rule.type === 'string' && typeof value === 'string') {
        if (rule.min && value.length < rule.min) {
          errors.push(`${rule.field} must be at least ${rule.min} characters`);
        }
        if (rule.max && value.length > rule.max) {
          errors.push(`${rule.field} must be at most ${rule.max} characters`);
        }
      }

      // Min/Max for numbers
      if (rule.type === 'number' && typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`${rule.field} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(`${rule.field} must be at most ${rule.max}`);
        }
      }

      // Min length for arrays
      if (rule.type === 'array' && Array.isArray(value)) {
        if (rule.min && value.length < rule.min) {
          errors.push(`${rule.field} must have at least ${rule.min} items`);
        }
      }

      // Email pattern
      if (rule.type === 'email') {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${rule.field} must be a valid email`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.length === 1 ? errors[0] : 'Validation failed',
        errors,
      });
    }

    next();
  };
};

// Pre-built validation rules
export const registerRules = validate([
  { field: 'name', type: 'string', required: true, min: 1, max: 50 },
  { field: 'email', type: 'email', required: true },
  { field: 'password', type: 'string', required: true, min: 8 },
]);

export const loginRules = validate([
  { field: 'email', type: 'email', required: true },
  { field: 'password', type: 'string', required: true },
]);

export const updatePasswordRules = validate([
  { field: 'currentPassword', type: 'string', required: true, message: 'Current password is required' },
  { field: 'newPassword', type: 'string', required: true, min: 8, message: 'New password must be at least 8 characters' },
]);

export const createTaskRules = validate([
  { field: 'title', type: 'string', required: true, min: 1, max: 100 },
  { field: 'description', type: 'string', required: true, min: 1, max: 2000 },
  { field: 'skills', type: 'array', required: true, min: 1 },
  { field: 'deadline', type: 'date', required: true, future: true },
]);

export const submitTaskRules = validate([
  { field: 'content', type: 'string', required: true, min: 1 },
]);

export const reviewTaskRules = validate([
  { field: 'satisfied', type: 'boolean', required: true },
]);

export const rateUserRules = validate([
  { field: 'rating', type: 'number', required: true, min: 1, max: 5 },
]);

export const sendMessageRules = validate([
  { field: 'content', type: 'string', required: true, min: 1, max: 2000 },
]);
