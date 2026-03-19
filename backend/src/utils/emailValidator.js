/**
 * Email Validation and Domain Verification Utility
 * Handles institutional email domain validation and verification logic
 * for SkillFlare platform access control
 */

/**
 * Approved institutional email domains
 * Students: @mitsgwl.ac.in
 * Faculty/Teachers: @mitsgwalior.in
 */
const DOMAIN_ROLE_MAP = {
  "mitsgwalior.in": "teacher",
  "mitsgwl.ac.in": "student",
};

/**
 * List of approved domains for platform access
 */
const APPROVED_DOMAINS = Object.keys(DOMAIN_ROLE_MAP);

/**
 * Check if email domain restriction is enabled
 * Always enabled in production, can be overridden via env variable in dev
 */
export const isEmailDomainRestrictionEnabled = () => {
  return (
    process.env.RESTRICT_EMAIL_DOMAIN === "true" ||
    process.env.NODE_ENV === "production"
  );
};

/**
 * Normalize email address - trim and lowercase
 * @param {string} email - Raw email input
 * @returns {string} Normalized email or empty string
 */
export const normalizeEmail = (email) => {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase();
};

/**
 * Extract domain from email
 * @param {string} email - Email address
 * @returns {string} Domain or null
 */
export const getEmailDomain = (email) => {
  if (!email || !email.includes("@")) return null;
  return email.split("@").pop().toLowerCase();
};

/**
 * Validate email format using regex pattern
 * Matches: username@domain.ext format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmailFormat = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Check if email domain is in approved list
 * @param {string} email - Email address to check
 * @returns {boolean} True if domain is approved
 */
export const isApprovedDomain = (email) => {
  const domain = getEmailDomain(email);
  return domain ? APPROVED_DOMAINS.includes(domain) : false;
};

/**
 * Get role based on email domain
 * @param {string} email - Email address
 * @returns {string|null} Role (student/teacher) or null if domain not recognized
 */
export const getRoleFromEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !normalizedEmail.includes("@")) return null;
  const domain = getEmailDomain(normalizedEmail);
  return DOMAIN_ROLE_MAP[domain] || null;
};

/**
 * Resolve user role - returns role from domain mapping, with fallback logic
 * @param {string} email - Email address
 * @param {string} requestedRole - Optional role requested by user
 * @returns {string|null} Resolved role or null if domain restriction prevents registration
 */
export const resolveUserRole = (email, requestedRole = null) => {
  const normalizedEmail = normalizeEmail(email);

  // Get role from domain
  const derivedRole = getRoleFromEmail(normalizedEmail);
  if (derivedRole) return derivedRole;

  // If domain doesn't map, check if restriction is enabled
  if (isEmailDomainRestrictionEnabled()) {
    // Restriction ON - only approved domains allowed
    return null;
  }

  // Restriction OFF (dev mode) - fallback to requested role or default to student
  return requestedRole === "teacher" ? "teacher" : "student";
};

/**
 * Validate email for registration
 * Checks: format validity, domain approval
 * @param {string} email - Email to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validateEmailForRegistration = (email) => {
  const normalizedEmail = normalizeEmail(email);

  // Check if email provided
  if (!normalizedEmail) {
    return {
      valid: false,
      error: "Email is required",
    };
  }

  // Check email format
  if (!isValidEmailFormat(normalizedEmail)) {
    return {
      valid: false,
      error: "Please provide a valid email address",
    };
  }

  // Check domain approval
  if (!isApprovedDomain(normalizedEmail)) {
    return {
      valid: false,
      error: "Please use your institutional email (@mitsgwalior.in for faculty or @mitsgwl.ac.in for students)",
    };
  }

  return { valid: true };
};

/**
 * Validate email exists in system (for forgot password, etc.)
 * Returns generic response to prevent user enumeration
 * @param {string} email - Email to validate
 * @returns {Object} { valid: boolean, genericMessage: string }
 */
export const validateEmailExistsGeneric = (email) => {
  const normalizedEmail = normalizeEmail(email);

  // Generic message always used for security
  const genericMessage =
    "If an account with this email exists, a password reset link has been sent.";

  // Check if email provided
  if (!normalizedEmail) {
    // Note: Frontend should validate, but we return generic for security
    return {
      valid: false,
      genericMessage,
    };
  }

  // Check email format
  if (!isValidEmailFormat(normalizedEmail)) {
    return {
      valid: false,
      genericMessage,
    };
  }

  return { valid: true, genericMessage };
};

/**
 * Validate email belongs to approved institution
 * @param {string} email - Email to validate
 * @returns {boolean} True if institutional email
 */
export const isInstitutionalEmail = (email) => {
  return isApprovedDomain(normalizeEmail(email));
};

/**
 * Get list of approved institutional domains
 * @returns {Array<string>} Array of domain strings
 */
export const getApprovedDomains = () => {
  return APPROVED_DOMAINS;
};

/**
 * Get domain to role mapping
 * @returns {Object} DOMAIN_ROLE_MAP
 */
export const getDomainRoleMap = () => {
  return { ...DOMAIN_ROLE_MAP };
};

/**
 * Validate email for password operations (generic to prevent enumeration)
 * @param {string} email - Email address
 * @returns {Object} { valid: boolean, normalizedEmail: string }
 */
export const validateEmailForPasswordOp = (email) => {
  const normalizedEmail = normalizeEmail(email);

  // Always normalize for consistency
  return {
    valid: !!normalizedEmail,
    normalizedEmail,
  };
};

export default {
  normalizeEmail,
  getEmailDomain,
  isValidEmailFormat,
  isApprovedDomain,
  getRoleFromEmail,
  resolveUserRole,
  isEmailDomainRestrictionEnabled,
  validateEmailForRegistration,
  validateEmailExistsGeneric,
  isInstitutionalEmail,
  getApprovedDomains,
  getDomainRoleMap,
  validateEmailForPasswordOp,
  DOMAIN_ROLE_MAP,
  APPROVED_DOMAINS,
};
