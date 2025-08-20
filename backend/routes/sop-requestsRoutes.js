import express from 'express';
import { admin } from '../config/firebase-config.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();
const db = admin.firestore();

// Helper function to create a new notification
const createNotification = async (recipientId, senderId, message, type) => {
    try {
        await db.collection('notifications').add({
            recipientId,
            senderId,
            message,
            type,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// New: Route for a user to request an SOP session
router.post('/', verifyToken, async (req, res) => {
    const { applicationId } = req.body;
    const userId = req.user.uid;

    if (!applicationId) {
        return res.status(400).json({ message: 'Application ID is required.' });
    }

    try {
        // Find the user's name
        const userDoc = await db.collection('users').doc(userId).get();
        const userName = userDoc.exists ? userDoc.data().name : 'A user';

        // Find the admin user ID
        const adminSnapshot = await db.collection('users').where('role', '==', 'admin').limit(1).get();
        const adminId = adminSnapshot.docs[0]?.id;

        if (!adminId) {
            return res.status(500).json({ message: 'Admin user not found.' });
        }

        // Create the SOP request document
        const newRequestRef = await db.collection('sop_requests').add({
            userId,
            applicationId,
            status: 'pending',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create a notification for the admin
        const message = `A new SOP writing request has been submitted by ${userName}.`;
        await createNotification(adminId, userId, message, 'sop_request_received');

        res.status(201).json({ 
            message: 'SOP request submitted successfully.', 
            requestId: newRequestRef.id 
        });
    } catch (error) {
        console.error('Error submitting SOP request:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// New: Route for admin to update the status of an SOP session
router.put('/:requestId/status', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Only administrators can update request status.' });
    }

    const { requestId } = req.params;
    const { status, details } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
    }

    try {
        const requestRef = db.collection('sop_requests').doc(requestId);
        const requestDoc = await requestRef.get();

        if (!requestDoc.exists) {
            return res.status(404).json({ message: 'SOP request not found.' });
        }

        const requestData = requestDoc.data();
        const userId = requestData.userId;
        let updateData = { status, timestamp: admin.firestore.FieldValue.serverTimestamp() };

        let notificationMessage = '';
        let notificationType = 'sop_request_status_update';
        let applicationName = '';

        // Fetch application details for the notification message
        const appDoc = await db.collection('applications').doc(requestData.applicationId).get();
        if (appDoc.exists) {
            applicationName = appDoc.data().schoolName || 'an application';
        }

        switch (status) {
            case 'accepted':
                updateData.acceptanceDetails = details;
                notificationMessage = `Your SOP request for ${applicationName} has been accepted.`;
                break;
            case 'declined':
                updateData.declineReason = details.reason;
                notificationMessage = `Your SOP request for ${applicationName} has been declined.`;
                break;
            case 'rescheduled':
                updateData.rescheduleDetails = details;
                notificationMessage = `Your SOP request for ${applicationName} has been rescheduled.`;
                break;
            case 'completed':
                notificationMessage = `Your SOP session for ${applicationName} has been completed.`;
                break;
            case 'not completed':
                updateData.uncompletionReason = details.reason;
                notificationMessage = `Your SOP session for ${applicationName} was not completed.`;
                break;
            default:
                return res.status(400).json({ message: 'Invalid status provided.' });
        }

        await requestRef.update(updateData);
        await createNotification(userId, req.user.uid, notificationMessage, notificationType);

        res.status(200).json({ message: 'SOP request status updated successfully.' });
    } catch (error) {
        console.error('Error updating SOP request status:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

export default router;