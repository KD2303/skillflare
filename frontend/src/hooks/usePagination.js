import { useState, useCallback, useEffect } from "react";

/**
 * Custom hook to manage pagination state and logic
 * Provides utilities for pagination in list components
 */
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate derived values
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Handler to go to next page
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  // Handler to go to previous page
  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setPage((prev) => prev - 1);
    }
  }, [hasPrevPage]);

  // Handler to go to specific page
  const goToPage = useCallback(
    (pageNumber) => {
      const validPage = Math.max(1, Math.min(pageNumber, totalPages || 1));
      setPage(validPage);
    },
    [totalPages],
  );

  // Handler to change limit (resets to page 1)
  const changeLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  // Handler to update total count
  const setPageInfo = useCallback((newTotal, newPage = 1) => {
    setTotal(newTotal);
    if (newPage) setPage(newPage);
  }, []);

  // Reset pagination
  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setTotal(0);
    setError(null);
    setLoading(false);
  }, [initialPage, initialLimit]);

  return {
    // State
    page,
    limit,
    total,
    loading,
    error,

    // Derived
    totalPages,
    hasNextPage,
    hasPrevPage,

    // Setters
    setPage,
    setLimit,
    setLoading,
    setError,
    setTotal,
    setPageInfo,

    // Handlers
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    reset,

    // Utility for API calls
    getQueryParams: () => ({ page, limit }),
  };
};

export default usePagination;
