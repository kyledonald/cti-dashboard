import express from 'express';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import * as functions from 'firebase-functions'; // <<< ADD THIS IMPORT

// firestore config
const db = new Firestore({
  projectId: process.env.GCP_PROJECT,
  databaseId: 'cti-db', // Assuming this is your database ID. Confirm in console.
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

// Organizations API

// Create a new organization
app.post('/organizations', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organization name is required.' });
    }

    const organizationRef = db.collection('organizations').doc();
    const organizationId = organizationRef.id;

    const newOrganization = {
      organizationId: organizationId,
      name: name,
      description: description || null,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await organizationRef.set(newOrganization);
    console.log(`Organization created: ${organizationId}`);
    res.status(201).json({
      message: 'Organization created successfully',
      organization: newOrganization,
    });
  } catch (error: any) {
    console.error('Error creating organization:', error);
    res
      .status(500)
      .json({ error: 'Failed to create organization', details: error.message });
  }
});

// GET /organizations: Get all organizations
app.get('/organizations', async (req, res) => {
  try {
    console.log('Received GET request for all organizations.');
    const organizationsRef = db.collection('organizations');
    const snapshot = await organizationsRef.orderBy('name').get();

    const organizations: any[] = [];
    snapshot.forEach((doc) => {
      organizations.push(doc.data());
    });

    res.status(200).json({ organizations: organizations });
  } catch (error: any) {
    console.error('Error fetching all organizations:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch organizations', details: error.message });
  }
});

// GET /organizations/{id}: Get a single organization by ID (using path parameter)
app.get('/organizations/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;

    console.log(
      `Received GET request for organizationId: "${organizationId}" (from path param)`,
    );
    console.log(`Type of organizationId: ${typeof organizationId}`);
    if (organizationId && organizationId.length === 0) {
      console.log('organizationId is an empty string!');
    } else if (!organizationId) {
      console.log('organizationId is null or undefined (missing path param).');
      return res
        .status(400)
        .json({ error: 'Organization ID path parameter is required.' });
    }

    const organizationRef = db.collection('organizations').doc(organizationId);
    const doc = await organizationRef.get();

    if (!doc.exists) {
      console.log(
        `Organization with ID "${organizationId}" not found in Firestore.`,
      );
      return res.status(404).json({ error: 'Organization not found.' });
    }

    res.status(200).json({ organization: doc.data() });
  } catch (error: any) {
    console.error('Error fetching organization by ID:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch organization', details: error.message });
  }
});

// PUT /organizations/{id}: Update an organization
app.put('/organizations/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { name, description, status } = req.body;

    const organizationRef = db.collection('organizations').doc(organizationId);
    const doc = await organizationRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Organization not found.' });
    }

    const updateData: any = { updatedAt: FieldValue.serverTimestamp() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    await organizationRef.update(updateData);
    console.log(`Organization updated: ${organizationId}`);
    res.status(200).json({ message: 'Organization updated successfully' });
  } catch (error: any) {
    console.error('Error updating organization:', error);
    res
      .status(500)
      .json({ error: 'Failed to update organization', details: error.message });
  }
});

// DELETE /organizations/{id}: Delete an organization
app.delete('/organizations/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const organizationRef = db.collection('organizations').doc(organizationId);
    const doc = await organizationRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Organization not found.' });
    }

    await organizationRef.delete();
    console.log(`Organization deleted: ${organizationId}`);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    res
      .status(500)
      .json({ error: 'Failed to delete organization', details: error.message });
  }
});

// Main entry point for the Cloud Function.
// NEW: Explicitly wrap the Express app as an HTTP function for the emulator.
module.exports.api = functions.https.onRequest(app); // <<< CHANGE THIS LINE
