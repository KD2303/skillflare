// Email domain validation
const ALLOWED_DOMAINS = {
  "mitsgwalior.in": "teacher",
  "mitsgwl.ac.in": "student",
};

const RESTRICT_EMAIL_DOMAIN =
  import.meta.env.VITE_RESTRICT_EMAIL_DOMAIN === "true";

export const getEmailDomain = (email) => {
  if (!email || !email.includes("@")) return null;
  return email.split("@").pop().toLowerCase();
};

export const getRoleFromEmail = (email) => {
  const domain = getEmailDomain(email);
  if (!domain) return null;
  return ALLOWED_DOMAINS[domain] || null;
};

export const isAllowedEmailDomain = (email) => {
  if (!RESTRICT_EMAIL_DOMAIN) return true;
  const domain = getEmailDomain(email);
  return domain ? Object.keys(ALLOWED_DOMAINS).includes(domain) : false;
};

export const getAllowedDomains = () => Object.keys(ALLOWED_DOMAINS);
export const isEmailDomainRestricted = () => RESTRICT_EMAIL_DOMAIN;

// Date formatting utilities
export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRelativeTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return formatDate(date);
};

export const getDaysUntil = (date) => {
  if (!date) return null;

  const now = new Date();
  const target = new Date(date);
  const diffInDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

  return diffInDays;
};

export const isOverdue = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

// Status helpers
export const getStatusColor = (status) => {
  const colors = {
    open: "status-open",
    in_progress: "status-in-progress",
    submitted: "status-submitted",
    completed: "status-completed",
    reassigned: "status-reassigned",
  };
  return colors[status] || "status-open";
};

export const getStatusLabel = (status) => {
  const labels = {
    open: "Open",
    in_progress: "In Progress",
    submitted: "Submitted",
    completed: "Completed",
    reassigned: "Reassigned",
  };
  return labels[status] || status;
};

// Role helpers
export const getRoleBadge = (role) => {
  return role === "teacher" ? "badge-teacher" : "badge-student";
};

export const getRoleLabel = (role) => {
  return role === "teacher" ? "T" : "S";
};

// String helpers
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Avatar helpers
export const getInitials = (name) => {
  if (!name) return "?";
  const names = name.split(" ");
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

export const getAvatarColor = (name) => {
  if (!name) return "bg-gray-500";
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Validation helpers
export const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  return password && password.length >= 8;
};

// Number formatting
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return num.toLocaleString();
};

// Points display
export const formatPoints = (points) => {
  if (points === 0) return "0";
  return `+${formatNumber(points)}`;
};
