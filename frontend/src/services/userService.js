import api from './api';

export const userService = {
  // Get user profile
  getProfile: async (id) => {
    const response = await api.get(`/users/profile/${id}`);
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (params = {}) => {
    const response = await api.get('/users/leaderboard', { params });
    return response.data;
  },

  // Get all users
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Rate a user
  rateUser: async (userId, ratingData) => {
    const response = await api.post(`/users/${userId}/rate`, ratingData);
    return response.data;
  },

  // Get user stats
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};

export default userService;
