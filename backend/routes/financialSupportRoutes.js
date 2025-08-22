import express from 'express';
import { admin } from '../config/firebase-config.js';

const router = express.Router();

// Route to handle financial support requests
router.post('/requests', async (req, res) => {
    try {
        const { userId, userEmail, applicationId, universityName, notes, requestedAmount } = req.body;

        // Basic validation for required fields
        if (!userId || !userEmail || !applicationId || !universityName || !requestedAmount) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const newRequest = {
            userId,
            userEmail,
            applicationId,
            universityName,
            requestedAmount,
            notes: notes || '',
            status: 'pending', // Initial status
            requestedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await admin.firestore().collection('financial_support_requests').add(newRequest);

        res.status(201).json({
            message: 'Financial support request sent successfully.',
            requestId: docRef.id
        });
    } catch (error) {
        console.error('Error submitting financial support request:', error);
        res.status(500).json({ message: 'Server error: Failed to submit request.' });
    }
});

export default router;