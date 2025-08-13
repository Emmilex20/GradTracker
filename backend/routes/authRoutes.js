import { Router } from 'express';
import admin from 'firebase-admin';

const router = Router();
const db = admin.firestore();

// Endpoint for Firebase email/password registration
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const userRecord = await admin.auth().createUser({ email, password, displayName: name });
        
        // Save the user's data to Firestore
        await db.collection('users').doc(userRecord.uid).set({
            firebaseUid: userRecord.uid,
            email: userRecord.email,
            name: userRecord.displayName,
            mentorId: null,
            isConnectedToMentor: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        // ... (error handling)
    }
});

// Endpoint for all Firebase logins (email/password, Google, etc.)
router.post('/firebase-login', async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ message: 'ID token is required.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name } = decodedToken;

        // Find or create the user document in Firestore
        const userDocRef = db.collection('users').doc(uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
             // Create the user document if it doesn't exist
            await userDocRef.set({
                firebaseUid: uid,
                email: email,
                name: name || 'User',
                mentorId: null,
                isConnectedToMentor: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        
        res.status(200).json({ message: 'User logged in successfully' });
    } catch (error) {
        // ... (error handling)
    }
});

export default router;