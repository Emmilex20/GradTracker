import express from 'express';
import { db } from '../config/firebase-config.js'; 
import admin from 'firebase-admin';

const router = express.Router();

// GET /api/messages/:groupId - Fetches all messages for a specific group
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const messagesRef = db.collection('chats').doc(groupId).collection('messages');
    const snapshot = await messagesRef.orderBy('createdAt', 'asc').get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to a simple JavaScript object
      createdAt: doc.data().createdAt?.toDate().toISOString() || null, 
    }));

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
});

// POST /api/messages/:groupId - Adds a new message to a specific group
router.post('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { senderId, text } = req.body;

    const messagesRef = db.collection('chats').doc(groupId).collection('messages');
    const newMessageRef = await messagesRef.add({
      senderId,
      text,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const newMessage = await newMessageRef.get();
    res.status(201).json({ 
      id: newMessage.id, 
      ...newMessage.data(),
      // Convert Firestore Timestamp for the response
      createdAt: newMessage.data().createdAt?.toDate().toISOString() || null,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

export default router;