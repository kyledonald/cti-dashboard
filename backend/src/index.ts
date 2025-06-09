import express from 'express';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import * as functions from 'firebase-functions';
import { organizationRouter } from './routes/organization.routes';
import { userRouter } from './routes/user.routes';
import { threatActorRouter } from './routes/threat_actor.routes';
import { incidentRouter } from './routes/incident.routes';

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

app.use('/organizations', organizationRouter(db));

app.use('/users', userRouter(db));

app.use('/threat-actors', threatActorRouter(db));

app.use('/incidents', incidentRouter(db));

module.exports.api = functions.https.onRequest(app);
