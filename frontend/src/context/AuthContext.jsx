import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../services/authService";
import { cancelAllRequests } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authService.getSession();
      setUser(response.user || null);
      setIsAuthenticated(Boolean(response.authenticated));
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${response.user.name}!`);
      return response;
    } catch (error) {
      let message = error.response?.data?.message || "Login failed";
      if (error.code === "ERR_NETWORK") {
        message =
          "Cannot connect to server. Please ensure the backend is running.";
      }
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success("Account created successfully!");
      return response;
    } catch (error) {
      let message = error.response?.data?.message || "Registration failed";
      if (error.code === "ERR_NETWORK") {
        message =
          "Cannot connect to server. Please ensure the backend is running.";
      }
      toast.error(message);
      throw error;
    }
  };

  // Cleanup function for logout
  const logout = useCallback(async () => {
    try {
      // Attempt server logout
      await authService.logout();
    } catch (_) {
      // Fail silently, proceed with client-side cleanup
    }

    // Cancel all pending API requests to prevent memory leaks
    cancelAllRequests();

    // Clear user state
    setUser(null);
    setIsAuthenticated(false);

    // Clear any cached data (optional, add if there's caching in localStorage)
    // sessionStorage.clear(); // Only if you're using sessionStorage

    toast.success("Logged out successfully");
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
