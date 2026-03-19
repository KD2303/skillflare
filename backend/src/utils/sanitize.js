/**
 * Escape special regex characters in user input to prevent ReDoS attacks.
 * Use this before passing user input to MongoDB $regex queries.
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
export const escapeRegex = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Sanitize an object by stripping keys that start with '$' or contain '.'
 * to prevent MongoDB NoSQL injection.
 * @param {any} value - The value to sanitize
 * @returns {any} The sanitized value
 */
export const sanitizeInput = (value) => {
  if (value instanceof Object) {
    for (const key in value) {
      if (/^\$/.test(key) || /\./.test(key)) {
        delete value[key];
      } else {
        sanitizeInput(value[key]);
      }
    }
  }
  return value;
};

/**
 * Express middleware to sanitize req.body, req.query, and req.params
 * against NoSQL injection attacks.
 */
export const sanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitizeInput(req.body);
  if (req.query) sanitizeInput(req.query);
  if (req.params) sanitizeInput(req.params);
  next();
};
