import express from 'express';
import { Firestore, FieldValue } from '@google-cloud/firestore';

// firestore config
const db = new Firestore({
    projectId: process.env.GCP_PROJECT,
    databaseId: 'cti-db',
});

// express app setup
const app = express();
app.use(express.json());

// health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('API is healthy!');
});

// server time endpoint
app.get('/server-time', (req, res) => {
    res.status(200).json({ currentTime: new Date().toISOString() });
});

// connectivity test
app.get('/firestore-test', async (req, res) => {
    try {
        const testCollectionRef = db.collection('testCollection');
        const testDocRef = testCollectionRef.doc('testDocument');

        // check if the document exists
        const doc = await testDocRef.get();

        if (!doc.exists) {
            await testDocRef.set({
                message: 'Hello from Firestore! This is a test document.',
                createdAt: FieldValue.serverTimestamp()
            });
            console.log('Test document created.');
            return res.status(201).json({ message: 'Test document created and fetched!', data: (await testDocRef.get()).data() });
        } else {
            console.log('Test document fetched.');
            return res.status(200).json({ message: 'Test document fetched!', data: doc.data() });
        }
    } catch (error: any) {
        console.error('Error accessing Firestore:', error);
        res.status(500).json({ error: 'Failed to access Firestore', details: error.message });
    }
});

// entry point for the Cloud Function.
module.exports.api = app;