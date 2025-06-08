// backend/src/index.ts (MAIN APP FILE)
import express from 'express';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import * as functions from 'firebase-functions';
import { organizationRouter } from './routes/organization.routes';
import { userRouter } from './routes/user.routes'; // <<< NEW IMPORT

// firestore config
let firestoreConfig: any = {
  // projectId is picked up automatically by the library based on firebase init or GCP_PROJECT env var
  // databaseId will be conditionally set
};

if (process.env.FUNCTIONS_EMULATOR) {
  console.log(
    'Running in FUNCTIONS_EMULATOR environment. Connecting to local Firestore emulator.',
  );
  firestoreConfig.host = 'localhost:8080'; // Firestore emulator default port
  firestoreConfig.ssl = false; // Disable SSL for local emulator connection
  firestoreConfig.credentials = {
    client_email: 'firebase-emulator',
    private_key: 'firebase-emulator',
  }; // Dummy credentials for local
  firestoreConfig.databaseId = '(default)'; // Set to (default) for emulator
} else {
  console.log(
    `Running in PRODUCTION environment. Connecting to GCP Firestore for project: ${process.env.GCP_PROJECT}`,
  );
  firestoreConfig.projectId = process.env.GCP_PROJECT;
  firestoreConfig.databaseId = 'cti-db'; // Set to 'cti-db' for production
}

export const db = new Firestore(firestoreConfig); // Make db accessible globally for services

// --- Express App Setup ---
const app = express();
app.use(express.json());

// --- API Routes ---
app.get('/health', (req, res) => {
  res.status(200).send('API is healthy!');
});

app.get('/server-time', (req, res) => {
  res.status(200).json({ currentTime: new Date().toISOString() });
});

app.get('/firestore-test', async (req, res) => {
  try {
    const testCollectionRef = db.collection('testCollection');
    const testDocRef = testCollectionRef.doc('testDocument');

    const doc = await testDocRef.get();

    if (!doc.exists) {
      await testDocRef.set({
        message: 'Hello from Firestore! This is a test document.',
        createdAt: FieldValue.serverTimestamp(),
      });
      console.log('Test document created.');
      return res.status(201).json({
        message: 'Test document created and fetched!',
        data: (await testDocRef.get()).data(),
      });
    } else {
      console.log('Test document fetched.');
      return res
        .status(200)
        .json({ message: 'Test document fetched!', data: doc.data() });
    }
  } catch (error: any) {
    console.error('Error accessing Firestore:', error);
    res
      .status(500)
      .json({ error: 'Failed to access Firestore', details: error.message });
  }
});

// --- Organization API (using router) ---
app.use('/organizations', organizationRouter(db));

// --- User API (using router) ---
app.use('/users', userRouter(db)); // <<< NEW: Use the user router

// Main entry point for the Cloud Function.
module.exports.api = functions.https.onRequest(app);
