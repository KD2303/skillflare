import api from './api';

export const chatService = {
  // Get chat room by task
  getChatByTask: async (taskId) => {
    const response = await api.get(`/chat/task/${taskId}`);
    return response.data;
  },

  // Get chat room by ID
  getChatRoom: async (id) => {
    const response = await api.get(`/chat/${id}`);
    return response.data;
  },

  // Send message
  sendMessage: async (chatRoomId, content, messageType = 'text') => {
    const response = await api.post(`/chat/${chatRoomId}/message`, {
      content,
      messageType,
    });
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (chatRoomId) => {
    const response = await api.put(`/chat/${chatRoomId}/read`);
    return response.data;
  },

  // Get user's chat rooms
  getMyChats: async () => {
    const response = await api.get('/chat/my-chats');
    return response.data;
  },
};

export default chatService;
