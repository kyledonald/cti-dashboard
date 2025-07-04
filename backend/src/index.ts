import express from 'express';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import * as functions from 'firebase-functions';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
import { organizationRouter } from './routes/organization.routes';
import { userRouter } from './routes/user.routes';
import { threatActorRouter } from './routes/threat_actor.routes';
import { incidentRouter } from './routes/incident.routes';
import { cveRouter } from './routes/cve.routes';

let firestoreConfig: any = {};

if (process.env.FUNCTIONS_EMULATOR) {
  console.log(
    'Running in FUNCTIONS_EMULATOR environment. Connecting to local Firestore emulator.',
  );
  firestoreConfig.host = 'localhost:8080';
  firestoreConfig.ssl = false;
  firestoreConfig.credentials = {
    client_email: 'firebase-emulator',
    private_key: 'firebase-emulator',
  };
  firestoreConfig.databaseId = '(default)';
} else {
  console.log(
    `Running in PRODUCTION environment. Connecting to GCP Firestore for project: ${process.env.GCP_PROJECT}`,
  );
  firestoreConfig.projectId = process.env.GCP_PROJECT;
  firestoreConfig.databaseId = 'cti-db';
}

export const db = new Firestore(firestoreConfig);

const app = express();
app.use(express.json());

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

app.use('/organizations', organizationRouter(db));

app.use('/users', userRouter(db));

app.use('/threat-actors', threatActorRouter(db));

app.use('/incidents', incidentRouter(db));

app.use('/cves', cveRouter());

module.exports.api = functions.https.onRequest(app);
