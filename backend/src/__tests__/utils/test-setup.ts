import express from 'express';
import cors from 'cors';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  auth: () => ({
    verifyIdToken: jest.fn(),
    createUser: jest.fn(),
    setCustomUserClaims: jest.fn()
  }),
  initializeApp: jest.fn(),
  apps: [],
  credential: {
    applicationDefault: jest.fn()
  },
  firestore: jest.fn(() => ({
    collection: jest.fn()
  }))
}));

// Mock Firestore
export const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  add: jest.fn(),
  orderBy: jest.fn().mockReturnThis()
};

// Create test app
export const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  return app;
};
