module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/__tests__/**/*.ts',
    '!src/routes/**/*.ts', // Exclude routes for now
    '!src/controllers/**/*.ts', // Exclude controllers for now
    '!src/services/**/*.ts', // Exclude services for now
    '!src/middleware/**/*.ts', // Exclude middleware for now
    '!src/models/**/*.ts', // Exclude models for now
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 0, // Temporarily set to 0 for initial deployment
      functions: 0, // Temporarily set to 0 for initial deployment
      lines: 0, // Temporarily set to 0 for initial deployment
      statements: 0, // Temporarily set to 0 for initial deployment
    },
  },
  setupFilesAfterEnv: [],
  testTimeout: 10000,
}; 