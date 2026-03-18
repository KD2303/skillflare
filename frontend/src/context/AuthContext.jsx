import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
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
    }
    setLoading(false);
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

  const logout = () => {
    authService.logout().catch(() => {});
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

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
