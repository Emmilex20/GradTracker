import express from 'express';
import { admin } from '../config/firebase-config.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();
const db = admin.firestore();

// Route for admin to send a message to all users
router.post('/admin', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Only administrators can send global notifications.' });
    }

    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ message: 'Notification message is required.' });
    }

    try {
        const usersSnapshot = await db.collection('users').get();
        const batch = db.batch();
        const notificationsRef = db.collection('notifications');

        usersSnapshot.forEach(doc => {
            const userId = doc.id;
            const newNotificationRef = notificationsRef.doc();
            batch.set(newNotificationRef, {
                recipientId: userId,
                senderId: req.user.uid,
                type: 'admin_message',
                message,
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        await batch.commit();
        res.status(200).json({ message: 'Global notification sent successfully.' });
    } catch (error) {
        console.error('Error sending global notification:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// New: Route to fetch a user's notifications
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const notificationsSnapshot = await db.collection('notifications')
            .where('recipientId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const notifications = notificationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() // Convert Firestore Timestamp to JavaScript Date
        }));

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// New: Route to mark all notifications as read
router.put('/mark-as-read', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const notificationsSnapshot = await db.collection('notifications')
            .where('recipientId', '==', userId)
            .where('read', '==', false)
            .get();

        const batch = db.batch();
        notificationsSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });

        await batch.commit();
        res.status(200).json({ message: 'Notifications marked as read.' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

export default router;