// setAdminRole.js

import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'fs'; // <-- Add this import

// Correctly load the JSON service account key file
try {
  const serviceAccountPath = './config/grad-tracker-app-firebase-adminsdk.json';
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully for script.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  process.exit(1);
}

const userEmail = 'test@gmail.com';

const setAdminClaim = async () => {
  try {
    const user = await admin.auth().getUserByEmail(userEmail);
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    console.log(`Successfully set 'admin' role for user: ${userEmail}`);
  } catch (error) {
    console.error('Error setting custom claim:', error);
  }
};

setAdminClaim();