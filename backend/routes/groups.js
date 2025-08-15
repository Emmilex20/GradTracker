// backend/routes/groups.js

import express from 'express';
import admin from 'firebase-admin';
import verifyToken from '../middleware/auth.js';

const router = express.Router();
const db = admin.firestore();

// Endpoint to get all groups a user is a member of
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const groupsSnapshot = await db.collection('groups')
            .where('members', 'array-contains', userId)
            .get();
        
        const groups = groupsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// New Endpoint to get a single group by its ID
router.get('/:groupId', verifyToken, async (req, res) => {
    try {
        const { groupId } = req.params;
        const groupRef = db.collection('groups').doc(groupId);
        const doc = await groupRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Group not found.' });
        }

        const groupData = {
            id: doc.id,
            ...doc.data(),
        };

        res.status(200).json(groupData);
    } catch (error) {
        console.error('Error fetching group by ID:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Endpoint to create a new group
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { groupName, memberIds } = req.body;
        const ownerId = req.user.uid;

        if (!groupName || !Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({ message: 'Group name and at least one member are required.' });
        }

        // Add the owner to the members list if not already there
        if (!memberIds.includes(ownerId)) {
            memberIds.push(ownerId);
        }

        const newGroup = {
            name: groupName,
            members: memberIds,
            owner: ownerId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const groupRef = await db.collection('groups').add(newGroup);
        res.status(201).json({ groupId: groupRef.id, message: 'Group created successfully.' });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;