import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with timeout for reliability
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send httpOnly cookies on every request
  timeout: 30000, // 30-second timeout for all requests
});

// Map to track pending requests for deduplication
const pendingRequests = new Map();

/**
 * Generate a unique key for a request to enable deduplication
 */
const generateRequestKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

/**
 * Cancel a pending request by key
 */
const cancelPendingRequest = (key) => {
  const source = pendingRequests.get(key);
  if (source) {
    source.cancel("Duplicate request cancelled");
    pendingRequests.delete(key);
  }
};

// Request interceptor — add abort controller for cancellation support
api.interceptors.request.use(
  (config) => {
    // Skip deduplication for GET requests (allow parallel queries)
    // Only deduplicate POST/PUT/DELETE to prevent duplicate mutations
    const shouldDeduplicate = config.method !== "get";

    if (shouldDeduplicate) {
      const requestKey = generateRequestKey(config);

      // Cancel duplicate requests in flight only for mutations
      if (pendingRequests.has(requestKey)) {
        const source = pendingRequests.get(requestKey);
        source.cancel("Duplicate request cancelled");
      }

      // Create new cancel source for this request
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      pendingRequests.set(requestKey, source);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle errors and cleanup
api.interceptors.response.use(
  (response) => {
    // Remove from pending map on success
    const requestKey = generateRequestKey(response.config);
    pendingRequests.delete(requestKey);
    return response;
  },
  (error) => {
    // Remove from pending map on error
    if (error.config) {
      const requestKey = generateRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }

    // Log global request timeout errors
    if (error.code === "ECONNABORTED") {
      console.warn("Request timeout (30s exceeded):", error.config?.url);
    }

    return Promise.reject(error);
  },
);

/**
 * Export utility function to cancel all pending requests
 * Useful during logout or component unmount
 */
export const cancelAllRequests = () => {
  pendingRequests.forEach((source) => {
    source.cancel("All requests cancelled");
  });
  pendingRequests.clear();
};

export default api;
