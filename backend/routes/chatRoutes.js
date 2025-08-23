// routes/chatRoutes.js

import express from 'express';
import { admin } from '../config/firebase-config.js';
import { FieldValue } from 'firebase-admin/firestore';

const router = express.Router();

// Get the Firestore database instance
const db = admin.firestore();

// === GET Route to fetch chat details and recipient info ===
router.get('/details/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const [user1Id, user2Id] = chatId.split('_');

        // We assume `req.user` is available from a `verifyToken` middleware
        const recipientId = req.user.uid === user1Id ? user2Id : user1Id;

        const recipientDoc = await db.collection('users').doc(recipientId).get();
        const recipient = recipientDoc.exists ? { id: recipientDoc.id, ...recipientDoc.data() } : null;

        res.status(200).json({ recipient });
    } catch (error) {
        console.error('Error fetching chat details:', error);
        res.status(500).json({ message: 'Failed to fetch chat details.' });
    }
});

// === PUT Route to mark a chat as read ===
router.put('/read/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const currentUserId = req.user.uid;

        await db.collection('chats').doc(chatId).update({
            [`lastRead.${currentUserId}`]: FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: 'Chat marked as read successfully.' });
    } catch (error) {
        console.error('Error marking chat as read:', error);
        res.status(500).json({ message: 'Failed to mark chat as read.' });
    }
});

// === GET Route to fetch unread chat counts ===
router.get('/unread-counts', async (req, res) => {
    const userId = req.user.uid; // Assumes your middleware authenticates the user

    try {
        const chatsSnapshot = await db.collection('chats')
            .where('members', 'array-contains', userId)
            .get();

        const unreadCounts = [];

        for (const chatDoc of chatsSnapshot.docs) {
            const chatData = chatDoc.data();
            const lastReadTimestamp = chatData.lastRead?.[userId];
            
            let unreadCount = 0;
            if (lastReadTimestamp) {
                // Get messages created AFTER the user's lastRead timestamp
                const messagesSnapshot = await chatDoc.ref.collection('messages')
                    .where('createdAt', '>', lastReadTimestamp)
                    .get();
                unreadCount = messagesSnapshot.size;
            } else {
                // If lastRead is not set, all messages are unread
                const messagesSnapshot = await chatDoc.ref.collection('messages').get();
                unreadCount = messagesSnapshot.size;
            }

            unreadCounts.push({
                chatId: chatDoc.id,
                unreadCount: unreadCount
            });
        }

        res.status(200).json(unreadCounts);
    } catch (error) {
        console.error('Failed to get unread counts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;