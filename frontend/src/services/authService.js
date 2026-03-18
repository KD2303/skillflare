import api from "./api";

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Check auth session without triggering 401 for guests
  getSession: async () => {
    const response = await api.get("/auth/session");
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.get("/auth/logout");
    return response.data;
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put("/auth/updatepassword", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default authService;
