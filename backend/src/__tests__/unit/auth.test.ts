import { UserService } from '../../services/user.service';

// Mock Firestore
const mockDb = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  add: jest.fn(),
  batch: jest.fn(() => ({
    set: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    commit: jest.fn()
  }))
} as any;

describe('Authentication Unit Tests', () => {
  let userService: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(mockDb);
  });

  test('should create user successfully', async () => {
    const userData = {
      googleId: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'unassigned' as const
    };

    mockDb.add.mockResolvedValue({ id: 'test-user-id' });

    const result = await userService.createUser(userData);

    expect(mockDb.collection).toHaveBeenCalledWith('users');
    expect(mockDb.add).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  test('should get user by ID successfully', async () => {
    const userId = 'test-user-id';
    const mockUserData = {
      userId: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin'
    };

    mockDb.get.mockResolvedValue({
      exists: true,
      data: () => mockUserData
    });

    const result = await userService.getUserById(userId);

    expect(mockDb.collection).toHaveBeenCalledWith('users');
    expect(mockDb.doc).toHaveBeenCalledWith(userId);
    expect(result).toEqual(mockUserData);
  });

  test('should handle user not found', async () => {
    const userId = 'non-existent-user';

    mockDb.get.mockResolvedValue({
      exists: false
    });

    await expect(userService.getUserById(userId)).rejects.toThrow('User not found');
  });
}); 