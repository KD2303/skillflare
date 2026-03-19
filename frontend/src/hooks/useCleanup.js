import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook to manage cleanup and prevent memory leaks
 * Provides utilities for:
 * - Safe effect cleanup
 * - AbortController for fetch/axios requests
 * - Timer cleanup
 * - Event listener cleanup
 */
export const useCleanup = () => {
  const abortControllerRef = useRef(new AbortController());
  const timersRef = useRef(new Set());
  const listenersRef = useRef(new Set());

  // Cleanup function to run on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      abortControllerRef.current.abort();

      // Clear all timers
      timersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
        clearInterval(timerId);
      });
      timersRef.current.clear();

      // Remove all event listeners
      listenersRef.current.forEach(({ target, event, handler }) => {
        target.removeEventListener(event, handler);
      });
      listenersRef.current.clear();
    };
  }, []);

  // Utility to create a timeout with automatic cleanup
  const setTimeout = useCallback((callback, delay) => {
    const timerId = window.setTimeout(callback, delay);
    timersRef.current.add(timerId);
    return timerId;
  }, []);

  // Utility to create an interval with automatic cleanup
  const setInterval = useCallback((callback, delay) => {
    const timerId = window.setInterval(callback, delay);
    timersRef.current.add(timerId);
    return timerId;
  }, []);

  // Utility to add event listeners with automatic cleanup
  const addEventListener = useCallback((target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    listenersRef.current.add({ target, event, handler });
    return () => {
      target.removeEventListener(event, handler, options);
      listenersRef.current.delete({ target, event, handler });
    };
  }, []);

  // Get the abort controller signal for fetch/axios requests
  const getAbortSignal = useCallback(() => {
    return abortControllerRef.current.signal;
  }, []);

  return {
    setTimeout,
    setInterval,
    addEventListener,
    getAbortSignal,
    abortController: abortControllerRef.current,
  };
};

export default useCleanup;
