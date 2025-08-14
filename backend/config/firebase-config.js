import admin from 'firebase-admin';
import 'dotenv/config';

if (!admin.apps.length) {
  const firebaseServiceAccountString = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
  if (!firebaseServiceAccountString) {
    throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT is not set in environment variables');
  }

  const serviceAccount = JSON.parse(firebaseServiceAccountString);
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✅ Firebase Admin SDK initialized successfully.');
}

const db = admin.firestore();
export { admin, db };
