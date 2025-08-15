// backend/routes/users.js
import express from 'express';
import { admin } from '../config/firebase-config.js'; 
import verifyToken from '../middleware/auth.js';

const router = express.Router();
const db = admin.firestore();

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