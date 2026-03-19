import api from './api';

export const getMentors = async () => {
  const response = await api.get('/mentors');
  return response.data;
};

export const getMentorById = async (id) => {
  const response = await api.get(`/mentors/${id}`);
  return response.data;
};

export const applyAsMentor = async (data) => {
  const response = await api.post('/mentors/apply', data);
  return response.data;
};

export const updateMentorProfile = async (data) => {
  const response = await api.put('/mentors/update', data);
  return response.data;
};

export const addSkill = async (data) => {
  const response = await api.post('/mentors/add-skill', data);
  return response.data;
};

export const uploadVerification = async (data) => {
  const response = await api.post('/mentors/upload-verification', data);
  return response.data;
};

export const verifySkill = async (mentorId, skillId, status) => {
  const response = await api.put(`/mentors/admin/verify-skill/${mentorId}/${skillId}`, { status });
  return response.data;
};

export const requestSession = async (data) => {
  const response = await api.post('/mentors/request-session', data);
  return response.data;
};

export const getMyRequests = async () => {
  const response = await api.get('/mentors/my-requests');
  return response.data;
};

export const respondToRequest = async (requestId, status) => {
  const response = await api.put(`/mentors/respond/${requestId}`, { status });
  return response.data;
};

export const completeSession = async (requestId, data) => {
  const response = await api.put(`/mentors/complete/${requestId}`, data);
  return response.data;
};
