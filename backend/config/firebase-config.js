import admin from 'firebase-admin';
import 'dotenv/config'; // Use this to load environment variables

const firebaseServiceAccountString = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!firebaseServiceAccountString) {
  throw new Error('FIREBASE_ADMIN_PRIVATE_KEY environment variable is not set. Please set it in your .env file or environment settings.');
}

const serviceAccount = JSON.parse(firebaseServiceAccountString);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Add other options if needed, like databaseURL
});

const db = admin.firestore();

export { db };