import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('errorHandler middleware', () => {
  let errorHandler;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const mod = await import('../../src/middleware/errorHandler.js');
    errorHandler = mod.default;
  });

  it('should handle CastError (bad ObjectId)', () => {
    const err = { name: 'CastError', message: 'Cast failed' };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Resource not found' })
    );
  });

  it('should handle duplicate key error (code 11000)', () => {
    const err = { code: 11000, message: 'Duplicate' };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Duplicate field value entered' })
    );
  });

  it('should handle ValidationError', () => {
    const err = {
      name: 'ValidationError',
      message: 'Validation failed',
      errors: {
        field1: { message: 'Field1 is required' },
        field2: { message: 'Field2 is invalid' },
      },
    };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should handle JsonWebTokenError', () => {
    const err = { name: 'JsonWebTokenError', message: 'jwt malformed' };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid token' })
    );
  });

  it('should handle TokenExpiredError', () => {
    const err = { name: 'TokenExpiredError', message: 'jwt expired' };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Token expired' })
    );
  });

  it('should default to 500 for unknown errors', () => {
    const err = { message: 'Something broke' };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
