/**
 * Centralized logging configuration for production-grade observability.
 * Logs errors, warnings, and critical info with timestamps and context.
 */

const LogLevel = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  CRITICAL: "CRITICAL",
};

const getCurrentLogLevel = () => {
  if (process.env.NODE_ENV === "production") return LogLevel.INFO;
  return LogLevel.DEBUG;
};

const formatLog = (level, message, context = {}) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    pid: process.pid,
    env: process.env.NODE_ENV,
    ...context,
  });
};

const logger = {
  debug: (message, context) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(formatLog(LogLevel.DEBUG, message, context));
    }
  },

  info: (message, context) => {
    console.log(formatLog(LogLevel.INFO, message, context));
  },

  warn: (message, context) => {
    console.warn(formatLog(LogLevel.WARN, message, context));
  },

  error: (message, error, context) => {
    console.error(
      formatLog(LogLevel.ERROR, message, {
        error: error?.message,
        stack: process.env.NODE_ENV === "production" ? undefined : error?.stack,
        ...context,
      }),
    );
  },

  critical: (message, error, context) => {
    console.error(
      formatLog(LogLevel.CRITICAL, message, {
        error: error?.message,
        stack: error?.stack,
        ...context,
      }),
    );
  },
};

export default logger;
