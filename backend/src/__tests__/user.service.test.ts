import { jest } from '@jest/globals';
import { UserService } from '../services/user.service';

describe('UserService', () => {
  let userService: UserService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        })),
        where: jest.fn(() => ({
          get: jest.fn(),
          limit: jest.fn(() => ({
            get: jest.fn(),
          })),
        })),
        add: jest.fn(),
        get: jest.fn(),
      })),
    };

    userService = new UserService(mockDb);
  });

  describe('constructor', () => {
    it('should create UserService instance', () => {
      expect(userService).toBeInstanceOf(UserService);
    });

    it('should call collection with users', () => {
      expect(mockDb.collection).toHaveBeenCalledWith('users');
    });
  });

  describe('service methods', () => {
    it('should have getAllUsers method', () => {
      expect(typeof userService.getAllUsers).toBe('function');
    });

    it('should have getUserById method', () => {
      expect(typeof userService.getUserById).toBe('function');
    });

    it('should have createUser method', () => {
      expect(typeof userService.createUser).toBe('function');
    });

    it('should have updateUser method', () => {
      expect(typeof userService.updateUser).toBe('function');
    });

    it('should have deleteUser method', () => {
      expect(typeof userService.deleteUser).toBe('function');
    });
  });
}); 