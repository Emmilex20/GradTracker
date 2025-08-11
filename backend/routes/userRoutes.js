import express from 'express';
import { db } from '../config/firebase-config.js';

const router = express.Router();

// PUT /api/users/:uid/notifications
// Updates a user's email notification preference in Firestore
router.put('/:uid/notifications', async (req, res) => {
    const { uid } = req.params;
    const { receiveNotifications } = req.body;

    if (typeof receiveNotifications !== 'boolean') {
        return res.status(400).json({ error: 'Invalid input for notifications setting.' });
    }

    try {
        const userRef = db.collection('users').doc(uid);
        await userRef.update({
            receiveNotifications: receiveNotifications
        });
        res.status(200).json({ message: 'Notification settings updated successfully.' });
    } catch (error) {
        console.error('Error updating notification settings:', error);
        res.status(500).json({ error: 'Failed to update notification settings.' });
    }
});

export default router;