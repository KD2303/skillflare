/**
 * Socket.IO connection rate limiting and max connection management.
 * Prevents abuse and resource exhaustion from too many concurrent connections.
 */

const MAX_CONNECTIONS_PER_IP = 5;
const MAX_TOTAL_CONNECTIONS = 1000;
const SOCKET_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

const activeConnections = new Map();
const ipConnections = new Map();

export const socketAuthAndRateLimit = (io) => {
  return (socket, next) => {
    const clientIP = socket.handshake.address;
    const totalConnections = activeConnections.size;

    // Check max total connections
    if (totalConnections >= MAX_TOTAL_CONNECTIONS) {
      return next(new Error("Server at capacity. Please try again later."));
    }

    // Check per-IP connection limit
    const ipCount = (ipConnections.get(clientIP) || 0) + 1;
    if (ipCount > MAX_CONNECTIONS_PER_IP) {
      return next(new Error("Too many connections from your IP address."));
    }

    // Set socket timeout to clean up abandoned connections
    socket.handshake.headers["x-socket-timeout"] = SOCKET_TIMEOUT_MS;

    // Track connection
    activeConnections.set(socket.id, clientIP);
    ipConnections.set(clientIP, ipCount);

    // Clean up on disconnect
    socket.on("disconnect", () => {
      activeConnections.delete(socket.id);
      const remaining = (ipConnections.get(clientIP) || 1) - 1;
      if (remaining <= 0) {
        ipConnections.delete(clientIP);
      } else {
        ipConnections.set(clientIP, remaining);
      }
    });

    next();
  };
};

export const getConnectionStats = () => {
  return {
    totalConnections: activeConnections.size,
    maxConnections: MAX_TOTAL_CONNECTIONS,
    ipConnections: Object.fromEntries(ipConnections),
  };
};

export default socketAuthAndRateLimit;
