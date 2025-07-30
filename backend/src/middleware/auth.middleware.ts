import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { Firestore } from '@google-cloud/firestore';
import { User } from '../models/user.model';

// Initialize Firebase Admin if not already initialized  
if (!admin.apps.length) {
  console.error('🔥 INITIALIZING FIREBASE ADMIN - FRESH START');
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Let Firebase auto-detect project from environment
  });
  console.error('✅ FIREBASE ADMIN INITIALIZED');
}

// Extend Express Request interface to include user data
export interface AuthenticatedRequest extends Request {
  user?: User;
  firebaseUser?: admin.auth.DecodedIdToken;
}

export const authenticateToken = (db: Firestore) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      console.error('🔍 AUTH MIDDLEWARE START:', req.path);
      
      // Skip authentication for health check endpoints and user registration
      if (req.path === '/health' || req.path === '/warmup' || req.path === '/server-time' || req.path === '/users/register') {
        console.error('✅ SKIPPING AUTH for:', req.path);
        return next();
      }

      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'No valid authorization header found'
        });
      }

      const idToken = authHeader.split('Bearer ')[1];
      
      if (!idToken) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'No token provided'
        });
      }

      // Verify the Firebase ID token
      console.error('🔍 VERIFYING TOKEN, first 50 chars:', idToken.substring(0, 50));
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.error('✅ TOKEN VERIFIED:', { uid: decodedToken.uid, email: decodedToken.email });
      req.firebaseUser = decodedToken;

      // Fetch user data from Firestore using the Firebase UID
      console.error('🔍 AUTH DEBUG: Looking up user with Firebase UID:', decodedToken.uid);
      const usersCollection = db.collection('users');
      const userQuery = await usersCollection.where('googleId', '==', decodedToken.uid).get();
      
      console.error('🔍 AUTH DEBUG: User query result:', { empty: userQuery.empty, size: userQuery.size });
      
      if (userQuery.empty) {
        console.error('❌ AUTH FAILED: User not found in database for Firebase UID:', decodedToken.uid);
        return res.status(404).json({ 
          error: 'User not found',
          message: 'User record not found in database'
        });
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data() as User;
      
      // Ensure user has userId field
      if (!userData.userId) {
        userData.userId = userDoc.id;
      }
      
      console.error('✅ AUTH SUCCESS: User found:', { 
        email: userData.email, 
        role: userData.role, 
        organizationId: userData.organizationId 
      });
      
      req.user = userData;
      
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      
      if (error instanceof Error) {
        // Handle specific Firebase Auth errors
        if (error.message.includes('id token')) {
          return res.status(401).json({ 
            error: 'Invalid token',
            message: 'The provided token is invalid or expired'
          });
        }
      }
      
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Unable to verify authentication token'
      });
    }
  };
};

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      console.error('🔍 ROLE CHECK:', {
        path: req.path,
        method: req.method,
        user: req.user ? { email: req.user.email, role: req.user.role } : 'NO USER',
        allowedRoles
      });

      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      // Ensure role is a string and handle null/undefined cases
      const userRole = req.user.role || 'unassigned';
      
      if (!allowedRoles.includes(userRole)) {
        console.error('❌ ROLE DENIED:', { userRole, allowedRoles });
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          message: `This action requires one of the following roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`
        });
      }

      console.error('✅ ROLE ALLOWED:', { userRole, allowedRoles });
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      return res.status(500).json({
        error: 'Authorization error',
        message: 'Error checking user permissions'
      });
    }
  };
};

// Convenience middleware for common role combinations
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.error('🚨 ADMIN CHECK CALLED');
  console.error('🚨 USER DATA:', req.user ? { email: req.user.email, role: req.user.role } : 'NO USER DATA');
  
  if (!req.user) {
    console.error('❌ NO USER ATTACHED TO REQUEST');
    return res.status(401).json({ error: 'No user data found' });
  }
  
  if (req.user.role !== 'admin') {
    console.error('❌ USER IS NOT ADMIN:', req.user.role);
    return res.status(403).json({ 
      error: 'Admin access required',
      userRole: req.user.role,
      userEmail: req.user.email
    });
  }
  
  console.error('✅ ADMIN ACCESS GRANTED');
  next();
};
export const requireAdminOrEditor = requireRole(['admin', 'editor']);
export const requireAnyRole = requireRole(['admin', 'editor', 'viewer']);

// Special middleware for basic read access (includes unassigned users)
export const requireAnyAuthenticated = requireRole(['admin', 'editor', 'viewer', 'unassigned']); 