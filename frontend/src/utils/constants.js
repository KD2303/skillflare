export const SKILLS = [
  'JavaScript',
  'Python',
  'Java',
  'C++',
  'C',
  'React',
  'Node.js',
  'HTML/CSS',
  'SQL',
  'MongoDB',
  'TypeScript',
  'Angular',
  'Vue.js',
  'Flutter',
  'React Native',
  'Android',
  'iOS',
  'Machine Learning',
  'Data Science',
  'AI',
  'Cloud Computing',
  'AWS',
  'Azure',
  'Docker',
  'Kubernetes',
  'DevOps',
  'Git',
  'Linux',
  'Networking',
  'Cybersecurity',
  'UI/UX Design',
  'Graphic Design',
  'Video Editing',
  'Content Writing',
  'Technical Writing',
  'Research',
  'Data Analysis',
  'Excel',
  'PowerPoint',
  'Public Speaking',
  'Leadership',
  'Project Management',
  'Marketing',
  'SEO',
  'Social Media',
];

export const TASK_STATUSES = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  COMPLETED: 'completed',
  REASSIGNED: 'reassigned',
};

export const USER_ROLES = {
  TEACHER: 'teacher',
  STUDENT: 'student',
};

export const CREDIT_POINTS = {
  TEACHER_TASK_COMPLETION: 20,
  STUDENT_TASK_COMPLETION: 0,
  RATING_RECEIVED: 5,
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  BROWSE: '/browse',
  LEADERBOARD: '/leaderboard',
  TASK_DETAILS: '/tasks/:id',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  POST_TASK: '/post-task',
  EDIT_PROFILE: '/profile/edit',
  USER_PROFILE: '/user/:id',
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    UPDATE_PASSWORD: '/auth/updatepassword',
  },
  TASKS: {
    BASE: '/tasks',
    MY_TASKS: '/tasks/my-tasks',
    BY_USER: '/tasks/user',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    LEADERBOARD: '/users/leaderboard',
    STATS: '/users/stats',
    RATE: '/users/rate',
  },
  CHAT: {
    BASE: '/chat',
    MY_CHATS: '/chat/my-chats',
    BY_TASK: '/chat/task',
  },
};
