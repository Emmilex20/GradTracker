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
        // Create the user in Firebase Auth
        const userRecord = await admin.auth().createUser({ email, password, displayName: name });
        
        // Save the user's data to Firestore. This creates a new document.
        await db.collection('users').doc(userRecord.uid).set({
            firebaseUid: userRecord.uid,
            email: userRecord.email,
            name: userRecord.displayName,
            mentorId: null,
            isConnectedToMentor: false,
            role: 'user', // Assign a default role
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            notificationSettings: {
                email: true,
                push: false
            }
        });

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error during user registration:', error);
        if (error.code === 'auth/email-already-in-use') {
            return res.status(409).json({ message: 'The email address is already in use.' });
        }
        res.status(500).json({ message: 'Failed to register user.', error });
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
        
        const userDocRef = db.collection('users').doc(uid);

        // Check if the user document already exists
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            // Document does not exist, create it with all default fields
            await userDocRef.set({
                firebaseUid: uid,
                email: email,
                name: name || 'User',
                mentorId: null,
                isConnectedToMentor: false,
                role: 'user',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                notificationSettings: {
                    email: true,
                    push: false
                }
            });
        } else {
            // Document exists, update a field like last login time
            await userDocRef.update({
                lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Fetch the user's full profile to return to the client
        const updatedUserDoc = await userDocRef.get();
        const userProfile = updatedUserDoc.data();

        res.status(200).json({ message: 'User logged in successfully', userProfile });
    } catch (error) {
        console.error('Error during Firebase login:', error);
        res.status(500).json({ message: 'Failed to process login.', error });
    }
});

export default router;