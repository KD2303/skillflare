import { useState, useCallback } from "react";

/**
 * Custom hook for date formatting and conversion
 */
export const useDateFormatter = () => {
  /**
   * Format date from YYYY-MM-DD to DD-MM-YYYY
   */
  const formatToDDMMYYYY = useCallback((isoDate) => {
    if (!isoDate) return "";
    try {
      const [year, month, day] = isoDate.split("-");
      if (!year || !month || !day) return "";
      return `${day}-${month}-${year}`;
    } catch {
      return "";
    }
  }, []);

  /**
   * Format date from YYYY-MM-DD to readable format
   */
  const formatToReadable = useCallback((isoDate) => {
    if (!isoDate) return "";
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  }, []);

  /**
   * Format date to readable format with time
   */
  const formatToReadableDateTime = useCallback((datetime) => {
    if (!datetime) return "";
    try {
      const date = new Date(datetime);
      return date.toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, []);

  /**
   * Get days until deadline
   */
  const getDaysUntil = useCallback((isoDate) => {
    if (!isoDate) return null;
    try {
      const deadline = new Date(isoDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);
      const diffTime = deadline - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  }, []);

  /**
   * Check if deadline is overdue
   */
  const isOverdue = useCallback(
    (isoDate) => {
      if (!isoDate) return false;
      const daysUntil = getDaysUntil(isoDate);
      return daysUntil !== null && daysUntil < 0;
    },
    [getDaysUntil],
  );

  /**
   * Check if deadline is today
   */
  const isToday = useCallback(
    (isoDate) => {
      if (!isoDate) return false;
      const daysUntil = getDaysUntil(isoDate);
      return daysUntil === 0;
    },
    [getDaysUntil],
  );

  /**
   * Get deadline status text
   */
  const getDeadlineStatus = useCallback(
    (isoDate) => {
      if (isOverdue(isoDate)) return "Overdue";
      const daysUntil = getDaysUntil(isoDate);
      if (daysUntil === null) return "Invalid";
      if (daysUntil === 0) return "Due Today";
      if (daysUntil === 1) return "Due Tomorrow";
      if (daysUntil < 0) return "Overdue";
      return `${daysUntil} days left`;
    },
    [getDaysUntil, isOverdue],
  );

  /**
   * Get deadline status color
   */
  const getDeadlineColor = useCallback(
    (isoDate) => {
      if (isOverdue(isoDate)) return "text-red-500";
      const daysUntil = getDaysUntil(isoDate);
      if (daysUntil === null) return "text-gray-400";
      if (daysUntil === 0) return "text-orange-500";
      if (daysUntil <= 2) return "text-yellow-500";
      return "text-green-500";
    },
    [getDaysUntil, isOverdue],
  );

  /**
   * Convert DD-MM-YYYY to YYYY-MM-DD
   */
  const convertToISO = useCallback((ddmmyyyy) => {
    if (!ddmmyyyy) return "";
    try {
      const parts = ddmmyyyy.split("-");
      if (parts.length !== 3) return "";
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  }, []);

  return {
    formatToDDMMYYYY,
    formatToReadable,
    formatToReadableDateTime,
    getDaysUntil,
    isOverdue,
    isToday,
    getDeadlineStatus,
    getDeadlineColor,
    convertToISO,
  };
};

export default useDateFormatter;
