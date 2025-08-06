export interface MockUser {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'editor' | 'viewer' | 'unassigned';
    organizationId: string;
  }
  
  export let mockUsers: MockUser[] = [
    {
      userId: 'admin-user-id',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      organizationId: 'org-1'
    },
    {
      userId: 'second-admin-user-id',
      email: 'second-admin@example.com',
      firstName: 'Second',
      lastName: 'Admin',
      role: 'admin',
      organizationId: 'org-1'
    },
    {
      userId: 'editor-user-id',
      email: 'editor@example.com',
      firstName: 'Editor',
      lastName: 'User',
      role: 'editor',
      organizationId: 'org-1'
    },
    {
      userId: 'viewer-user-id',
      email: 'viewer@example.com',
      firstName: 'Viewer',
      lastName: 'User',
      role: 'viewer',
      organizationId: 'org-1'
    },
    {
      userId: 'other-org-user-id',
      email: 'other@example.com',
      firstName: 'Other',
      lastName: 'User',
      role: 'admin',
      organizationId: 'org-2'
    }
  ];
  
  export const resetMockUsers = () => {
    mockUsers = [
      {
        userId: 'admin-user-id',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        organizationId: 'org-1'
      },
      {
        userId: 'second-admin-user-id',
        email: 'second-admin@example.com',
        firstName: 'Second',
        lastName: 'Admin',
        role: 'admin',
        organizationId: 'org-1'
      },
      {
        userId: 'editor-user-id',
        email: 'editor@example.com',
        firstName: 'Editor',
        lastName: 'User',
        role: 'editor',
        organizationId: 'org-1'
      },
      {
        userId: 'viewer-user-id',
        email: 'viewer@example.com',
        firstName: 'Viewer',
        lastName: 'User',
        role: 'viewer',
        organizationId: 'org-1'
      },
      {
        userId: 'other-org-user-id',
        email: 'other@example.com',
        firstName: 'Other',
        lastName: 'User',
        role: 'admin',
        organizationId: 'org-2'
      }
    ];
  };
  
  export const createMockAuthMiddleware = (skipPaths: string[] = []) => {
    return (req: any, res: any, next: any) => {
      // Skip auth for specified paths
      if (skipPaths.includes(req.path)) {
        return next();
      }
      
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No valid authorization header found'
        });
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      // Mock different users based on token
      if (token === 'admin-token') {
        req.user = mockUsers[0]; // admin user
      } else if (token === 'second-admin-token') {
        req.user = mockUsers[1]; // second admin user
      } else if (token === 'editor-token') {
        req.user = mockUsers[2]; // editor user
      } else if (token === 'viewer-token') {
        req.user = mockUsers[3]; // viewer user
      } else if (token === 'test-token') {
        req.user = {
          userId: 'test-user-id',
          email: 'test@example.com',
          role: 'admin',
          organizationId: 'test-org-id'
        };
      } else {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'Token is invalid or expired'
        });
      }
      
      next();
    };
  };
  