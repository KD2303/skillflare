import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock jsonwebtoken
const mockVerify = jest.fn();
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { verify: mockVerify },
}));

// Mock User model
const mockFindById = jest.fn();
jest.unstable_mockModule('../../src/models/User.js', () => ({
  default: {
    findById: mockFindById,
  },
}));

// Import after mocks
const { protect, authorize, isTeacher, isStudent } = await import(
  '../../src/middleware/auth.js'
);

const mockReqResNext = (headers = {}) => {
  const req = { headers, user: null };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

describe('auth middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('protect', () => {
    it('should return 401 if no token provided', async () => {
      const { req, res, next } = mockReqResNext({});

      await protect(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: expect.stringContaining('no token') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', async () => {
      mockVerify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      const { req, res, next } = mockReqResNext({
        authorization: 'Bearer invalid_token',
      });

      await protect(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found', async () => {
      mockVerify.mockReturnValue({ id: '123' });
      mockFindById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      const { req, res, next } = mockReqResNext({
        authorization: 'Bearer valid_token',
      });

      await protect(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next and set req.user on valid token', async () => {
      const mockUser = { _id: '123', name: 'Test', role: 'student' };
      mockVerify.mockReturnValue({ id: '123' });
      mockFindById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const { req, res, next } = mockReqResNext({
        authorization: 'Bearer valid_token',
      });

      await protect(req, res, next);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should call next if user role is in allowed roles', () => {
      const { req, res, next } = mockReqResNext({});
      req.user = { role: 'teacher' };

      authorize('teacher', 'admin')(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user role is not in allowed roles', () => {
      const { req, res, next } = mockReqResNext({});
      req.user = { role: 'student' };

      authorize('teacher', 'admin')(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('isTeacher', () => {
    it('should call next for teacher role', () => {
      const { req, res, next } = mockReqResNext({});
      req.user = { role: 'teacher' };
      isTeacher(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 for non-teacher role', () => {
      const { req, res, next } = mockReqResNext({});
      req.user = { role: 'student' };
      isTeacher(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('isStudent', () => {
    it('should call next for student role', () => {
      const { req, res, next } = mockReqResNext({});
      req.user = { role: 'student' };
      isStudent(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 for non-student role', () => {
      const { req, res, next } = mockReqResNext({});
      req.user = { role: 'teacher' };
      isStudent(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
