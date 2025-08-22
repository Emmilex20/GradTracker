// src/routes/visaInterviewPrepRoutes.js

import express from 'express';
import { admin } from '../config/firebase-config.js';

const router = express.Router();

// Route to handle visa interview prep requests
router.post('/requests', async (req, res) => {
    try {
        const { userId, userEmail, country, embassy, visaType, interviewDate, notes } = req.body;

        // Basic validation for required fields
        if (!userId || !userEmail || !country || !embassy || !visaType || !interviewDate) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const newRequest = {
            userId,
            userEmail,
            country,
            embassy,
            visaType,
            interviewDate,
            notes: notes || '',
            status: 'pending',
            requestedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await admin.firestore().collection('visa_interview_prep_requests').add(newRequest);

        res.status(201).json({
            message: 'Visa interview prep request sent successfully.',
            requestId: docRef.id
        });
    } catch (error) {
        console.error('Error submitting visa interview prep request:', error);
        res.status(500).json({ message: 'Server error: Failed to submit request.' });
    }
});

export default router;