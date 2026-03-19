import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { validate } from '../../src/middleware/validate.js';

// Helper to create mock req/res/next
const mockReqResNext = (body = {}) => {
  const req = { body };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

describe('validate middleware', () => {
  it('should call next() when all required fields are valid', () => {
    const middleware = validate([
      { field: 'name', type: 'string', required: true },
      { field: 'email', type: 'email', required: true },
    ]);

    const { req, res, next } = mockReqResNext({
      name: 'Test User',
      email: 'test@mitsgwl.ac.in',
    });

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 400 when required field is missing', () => {
    const middleware = validate([
      { field: 'name', type: 'string', required: true },
    ]);

    const { req, res, next } = mockReqResNext({});

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('should validate string min length', () => {
    const middleware = validate([
      { field: 'password', type: 'string', required: true, min: 6 },
    ]);

    const { req, res, next } = mockReqResNext({ password: '123' });

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should validate number min/max', () => {
    const middleware = validate([
      { field: 'rating', type: 'number', required: true, min: 1, max: 5 },
    ]);

    const { req, res, next } = mockReqResNext({ rating: 6 });

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should validate email format', () => {
    const middleware = validate([
      { field: 'email', type: 'email', required: true },
    ]);

    const { req, res, next } = mockReqResNext({ email: 'not-an-email' });

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should validate array type and min items', () => {
    const middleware = validate([
      { field: 'skills', type: 'array', required: true, min: 1 },
    ]);

    const { req, res, next } = mockReqResNext({ skills: [] });

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should validate future date', () => {
    const middleware = validate([
      { field: 'deadline', type: 'date', required: true, future: true },
    ]);

    const { req, res, next } = mockReqResNext({ deadline: '2020-01-01' });

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should skip optional fields that are not provided', () => {
    const middleware = validate([
      { field: 'bio', type: 'string', required: false },
    ]);

    const { req, res, next } = mockReqResNext({});

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
