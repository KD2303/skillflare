import api from "./api";

export const taskService = {
  // Get all tasks with filters
  getTasks: async (params = {}) => {
    const response = await api.get("/tasks", { params });
    return response.data;
  },

  // Get single task by ID
  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create new task
  createTask: async (taskData) => {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  // Update task
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Take a task (student only)
  takeTask: async (id) => {
    const response = await api.put(`/tasks/${id}/take`);
    return response.data;
  },

  // Submit task work
  submitTask: async (id, content) => {
    const response = await api.put(`/tasks/${id}/submit`, { content });
    return response.data;
  },

  // Review task submission
  reviewTask: async (id, reviewData) => {
    const response = await api.put(`/tasks/${id}/review`, reviewData);
    return response.data;
  },

  // Reassign task
  reassignTask: async (id, reason) => {
    const response = await api.put(`/tasks/${id}/reassign`, { reason });
    return response.data;
  },

  // Get tasks by user
  getTasksByUser: async (userId, type) => {
    const response = await api.get(`/tasks/user/${userId}`, {
      params: { type },
    });
    return response.data;
  },

  // Get my tasks (posted and taken)
  getMyTasks: async () => {
    const response = await api.get("/tasks/my-tasks");
    return response.data;
  },

  // Delete task
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default taskService;
