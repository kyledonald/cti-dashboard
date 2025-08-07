import express from 'express';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import * as functions from 'firebase-functions';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();
import { organizationRouter } from './routes/organization.routes';
import { userRouter } from './routes/user.routes';
import { threatActorRouter } from './routes/threat_actor.routes';
import { incidentRouter } from './routes/incident.routes';
import { cveRouter } from './routes/cve.routes';
import { authenticateToken } from './middleware/auth.middleware';
import { sanitizeInput } from './middleware/sanitization.middleware';
import { securityHeaders, generalRateLimit } from './middleware/security.middleware';

let firestoreConfig: any = {};

// Production configuration only
const projectId = process.env.GCLOUD_PROJECT || 'cti-dashboard-459422';
const databaseId = process.env.FIRESTORE_DATABASE_ID || 'cti-db';

firestoreConfig.projectId = projectId;
firestoreConfig.databaseId = databaseId;

export const db = new Firestore(firestoreConfig);

const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: true, // Allow all origins in production
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Limit request body size

// Apply security middleware
app.use(securityHeaders);
app.use(generalRateLimit);
app.use(sanitizeInput);

// Public health check endpoints (no authentication required)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/warmup', (req, res) => {
  res.status(200).json({ 
    status: 'warmed', 
    message: 'Function is now warm',
    timestamp: new Date().toISOString()
  });
});

app.get('/server-time', (req, res) => {
  res.status(200).json({ currentTime: new Date().toISOString() });
});

// Public CVE routes (no authentication required)
// These are utility endpoints that don't expose sensitive data
app.use('/cves', cveRouter(db));

// Apply authentication middleware to all other routes
app.use(authenticateToken(db));

// Protected routes (authentication required)
app.use('/organizations', organizationRouter(db));

app.use('/users', userRouter(db));

app.use('/threat-actors', threatActorRouter(db));

app.use('/incidents', incidentRouter(db));

module.exports.api = functions.https.onRequest(app);
