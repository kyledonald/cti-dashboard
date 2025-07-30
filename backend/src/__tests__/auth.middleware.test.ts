import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole, requireAdmin } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// Mock Firestore
const mockDb = {
  collection: jest.fn(() => ({
    where: jest.fn(() => ({
      get: jest.fn(),
    })),
  })),
};

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    applicationDefault: jest.fn(),
  },
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
  apps: [],
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      path: '/test',
    } as any;
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    mockNext = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should skip authentication for health check endpoints', async () => {
      (mockReq as any).path = '/health';
      
      const middleware = authenticateToken(mockDb as any);
      await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should skip authentication for user registration', async () => {
      (mockReq as any).path = '/users/register';
      
      const middleware = authenticateToken(mockDb as any);
      await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 401 when no authorization header', async () => {
      const middleware = authenticateToken(mockDb as any);
      await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'No valid authorization header found',
      });
    });

    it('should return 401 when authorization header is malformed', async () => {
      mockReq.headers = { authorization: 'InvalidToken' };
      
      const middleware = authenticateToken(mockDb as any);
      await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'No valid authorization header found',
      });
    });
  });

  describe('requireRole', () => {
    it('should call next when user has required role', () => {
      mockReq.user = { role: 'admin' } as any;
      
      requireRole(['admin'])(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 when user does not have required role', () => {
      mockReq.user = { role: 'viewer' } as any;
      
      requireRole(['admin'])(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        message: 'This action requires one of the following roles: admin. Your role: viewer',
      });
    });
  });

  describe('requireAdmin', () => {
    it('should call next when user is admin', () => {
      mockReq.user = { role: 'admin' } as any;
      
      requireAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 when user is not admin', () => {
      mockReq.user = { role: 'viewer' } as any;
      
      requireAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Admin access required',
        userEmail: undefined,
        userRole: 'viewer',
      });
    });
  });
}); 