/**
 * Request timeout middleware to prevent hung requests from consuming resources indefinitely.
 * Ensures graceful timeout for long-running operations.
 */

export const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeoutHandle = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: "Request timeout",
        });
      }
    }, timeoutMs);

    // Clear timeout on response
    res.on("finish", () => clearTimeout(timeoutHandle));
    res.on("close", () => clearTimeout(timeoutHandle));

    next();
  };
};

export default requestTimeout;
