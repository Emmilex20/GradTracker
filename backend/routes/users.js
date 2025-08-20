import express from 'express';
import { admin } from '../config/firebase-config.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();
const db = admin.firestore();

// POST /api/users/signup - Handles user registration and profile creation
router.post('/signup', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'Email, password, first name, and last name are required.' });
        }

        // 1. Create a user in Firebase Authentication
        const userRecord = await admin.auth().createUser({ email, password });

        // 2. Create a user profile document in Firestore with the provided details
        await db.collection('users').doc(userRecord.uid).set({
            email: userRecord.email,
            firstName,
            lastName,
            role: 'user', // Default role
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({ message: 'User created successfully.', uid: userRecord.uid });
    } catch (error) {
        console.error('Error during user signup:', error);
        if (error.code === 'auth/email-already-in-use') {
            return res.status(409).json({ message: 'Email already in use.' });
        }
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// GET /api/users/profile - Fetches the currently authenticated user's profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Failed to fetch user profile.' });
    }
});

// PUT /api/users/profile - Updates the currently authenticated user's profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { firstName, lastName, photoURL, bio } = req.body;
        
        const updates = {};
        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (photoURL) updates.photoURL = photoURL;
        if (bio) updates.bio = bio;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No fields provided for update.' });
        }

        const userRef = db.collection('users').doc(userId);
        await userRef.update(updates);

        res.status(200).json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Failed to update user profile.' });
    }
});

// GET /api/users - Fetches all users
router.get('/', verifyToken, async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});

// GET /api/users/:userId - Fetches a single user by ID
router.get('/:userId', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Error fetching single user:', error);
        res.status(500).json({ message: 'Failed to fetch user.' });
    }
});

export default router;