// src/routes/interviewPrepRoutes.js

import express from 'express';
import { admin } from '../config/firebase-config.js';

const router = express.Router();

// Route to handle interview prep requests
router.post('/requests', async (req, res) => {
    try {
        const { userId, userEmail, applicationId, schoolName, programName, interviewDate, notes } = req.body;

        // Basic validation
        if (!userId || !userEmail || !applicationId || !schoolName || !programName || !interviewDate) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const newRequest = {
            userId,
            userEmail,
            applicationId,
            schoolName,
            programName,
            interviewDate,
            notes: notes || '',
            status: 'pending',
            requestedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await admin.firestore().collection('interview_prep_requests').add(newRequest);

        res.status(201).json({
            message: 'Interview prep request sent successfully.',
            requestId: docRef.id
        });
    } catch (error) {
        console.error('Error submitting interview prep request:', error);
        res.status(500).json({ message: 'Server error: Failed to submit request.' });
    }
});

export default router;