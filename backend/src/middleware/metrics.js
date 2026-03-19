import logger from "../config/logger.js";

/**
 * Middleware to track and report system metrics
 * Tracks memory usage, request count, response times, and error rates
 */

// Metrics storage
const metrics = {
  startTime: Date.now(),
  requestCount: 0,
  errorCount: 0,
  totalResponseTime: 0,
  statusCodes: {},
  socketConnections: 0,
  failedRequests: {},
  averageResponseTime: 0,
};

// Track request metrics
export const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Increment request count
  metrics.requestCount++;

  // Store original send function
  const originalSend = res.send;

  // Override send to capture response metrics
  res.send = function (data) {
    const duration = Date.now() - startTime;
    metrics.totalResponseTime += duration;
    metrics.averageResponseTime =
      metrics.totalResponseTime / metrics.requestCount;

    // Track status code
    if (!metrics.statusCodes[res.statusCode]) {
      metrics.statusCodes[res.statusCode] = 0;
    }
    metrics.statusCodes[res.statusCode]++;

    // Track errors
    if (res.statusCode >= 400) {
      metrics.errorCount++;
      const endpoint = `${req.method} ${req.path}`;
      metrics.failedRequests[endpoint] =
        (metrics.failedRequests[endpoint] || 0) + 1;
    }

    // Call original send
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Get current metrics snapshot
 */
export const getMetrics = () => {
  const uptime = Date.now() - metrics.startTime;
  const memoryUsage = process.memoryUsage();

  return {
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 1000)} seconds`,
    requests: {
      total: metrics.requestCount,
      errors: metrics.errorCount,
      errorRate:
        metrics.requestCount > 0
          ? ((metrics.errorCount / metrics.requestCount) * 100).toFixed(2) + "%"
          : "0%",
      averageResponseTime: `${metrics.averageResponseTime.toFixed(2)}ms`,
      byStatusCode: metrics.statusCodes,
      failedByEndpoint: metrics.failedRequests,
    },
    memory: {
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)}MB`,
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`,
    },
    database: {
      activeConnections: metrics.socketConnections, // This will be set by socket handlers
    },
  };
};

/**
 * Reset metrics (useful for performance testing)
 */
export const resetMetrics = () => {
  metrics.startTime = Date.now();
  metrics.requestCount = 0;
  metrics.errorCount = 0;
  metrics.totalResponseTime = 0;
  metrics.statusCodes = {};
  metrics.failedRequests = {};
  metrics.averageResponseTime = 0;
};

/**
 * Update socket connection metrics (call from socket.io handlers)
 */
export const updateSocketMetrics = (connectionCount) => {
  metrics.socketConnections = connectionCount;
};

export default metrics;
