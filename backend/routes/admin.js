import express from 'express';
import admin from 'firebase-admin';
import Document from '../models/Document.js';
import verifyToken from '../middleware/auth.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import checkRole from '../middleware/checkRole.js';

const router = express.Router();
const db = admin.firestore();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const correctedStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const documentId = req.params.documentId;
        return {
            folder: `grad-tracker/corrected-documents`,
            public_id: `corrected-${documentId}-${Date.now()}`,
            resource_type: 'raw',
            format: file.mimetype.split('/')[1],
        };
    },
});

const uploadCorrected = multer({ storage: correctedStorage });

// GET all documents awaiting review
router.get('/documents/for-review', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const documents = await Document.find({ status: 'pending_review' }).populate('applicationId', 'schoolName programName');
        res.json(documents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to handle admin uploading a corrected document
router.post('/documents/correct/:documentId', verifyToken, checkRole('admin'), uploadCorrected.single('correctedDocument'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const { documentId } = req.params;
        const correctedFileUrl = req.file.path;

        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        document.correctedFileUrl = correctedFileUrl;
        document.status = 'review_complete';
        await document.save();

        res.status(200).json({ message: 'Document review complete and corrected file uploaded.', document });
    } catch (err) {
        console.error('Error uploading corrected document:', err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// NEW route to get all mentorship connections for admin
router.get('/mentorship/connections', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const connectionsSnapshot = await db.collection('mentorRequests')
            .where('status', 'in', ['accepted', 'pending'])
            .get();

        const connections = await Promise.all(connectionsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const menteeDoc = await db.collection('users').doc(data.menteeId).get();
            const mentorDoc = await db.collection('users').doc(data.mentorId).get();

            return {
                id: doc.id,
                menteeName: `${menteeDoc.data()?.firstName || ''} ${menteeDoc.data()?.lastName || ''}`.trim(),
                mentorName: `${mentorDoc.data()?.firstName || ''} ${mentorDoc.data()?.lastName || ''}`.trim(),
                status: data.status,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        }));
        res.status(200).json(connections);
    } catch (error) {
        console.error('Error fetching all mentorship connections:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Existing route to change a user's role
router.post('/set-user-role', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { email, role } = req.body;
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { role });
        await admin.firestore().collection('users').doc(user.uid).update({ role });
        res.status(200).json({ message: `Successfully updated role for user ${email} to ${role}.` });
    } catch (error) {
        console.error('Error setting user role:', error);
        res.status(500).json({ message: 'Failed to update user role.', error: error.message });
    }
});

// NEW: Route to allow an admin to revoke a mentorship connection
router.delete('/mentorship/connections/:requestId', verifyToken, checkRole('admin'), async (req, res) => {
    const { requestId } = req.params;
    try {
        const requestRef = db.collection('mentorRequests').doc(requestId);
        const requestDoc = await requestRef.get();

        if (!requestDoc.exists) {
            return res.status(404).json({ message: 'Mentorship request not found.' });
        }

        const data = requestDoc.data();
        const menteeId = data.menteeId;
        const mentorId = data.mentorId;
        
        const menteeRef = db.collection('users').doc(menteeId);
        const mentorRef = db.collection('users').doc(mentorId);

        // Fetch user documents to get names for notifications.
        const menteeDoc = await menteeRef.get();
        const mentorDoc = await mentorRef.get();

        const batch = db.batch();
        
        // 1. Update the mentor request status to 'revoked'
        batch.update(requestRef, { status: 'revoked' });

        // 2. Remove the connection from the mentee's profile
        batch.update(menteeRef, {
            mentorId: admin.firestore.FieldValue.delete(),
            isConnectedToMentor: false,
        });

        // 3. Remove the mentee from the mentor's connected users array
        batch.update(mentorRef, {
            connectedUsers: admin.firestore.FieldValue.arrayRemove(menteeId),
        });

        // 4. Create a notification for both the mentor and the mentee
        const notificationMenteeRef = db.collection('notifications').doc();
        batch.set(notificationMenteeRef, {
            recipientId: menteeId,
            senderId: req.user.uid, // Admin ID
            type: 'mentorship_revoked',
            message: `Your mentorship with ${mentorDoc.data()?.firstName || 'a mentor'} was revoked by an admin.`,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        const notificationMentorRef = db.collection('notifications').doc();
        batch.set(notificationMentorRef, {
            recipientId: mentorId,
            senderId: req.user.uid, // Admin ID
            type: 'mentorship_revoked',
            message: `Your mentorship with ${menteeDoc.data()?.firstName || 'a user'} was revoked by an admin.`,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await batch.commit();

        res.status(200).json({ message: 'Mentorship connection successfully revoked by admin.' });
    } catch (error) {
        console.error('Error revoking mentorship:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Route to handle admin sending a response to an interview prep request
router.post('/interview-prep/send-response', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { requestId, message, scheduledDate, scheduledTime, zoomLink } = req.body;

        if (!requestId || !message || !scheduledDate || !scheduledTime || !zoomLink) {
            return res.status(400).json({ message: 'Request ID, message, date, time, and Zoom link are required.' });
        }

        const requestRef = db.collection('interview_prep_requests').doc(requestId);
        await requestRef.update({
            adminResponse: message,
            scheduledDate,
            scheduledTime,
            zoomLink,
            status: 'scheduled',
            respondedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Get the request data to craft a specific notification message
        const requestDoc = await requestRef.get();
        if (requestDoc.exists) {
            const requestData = requestDoc.data();
            const userId = requestData?.userId;
            if (userId) {
                await db.collection('notifications').add({
                    userId,
                    message: `Your interview prep session for ${requestData?.schoolName} has been scheduled for ${scheduledDate} at ${scheduledTime}. The Zoom link is: ${zoomLink}.`,
                    type: 'interview_prep_response',
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        }

        res.status(200).json({ message: 'Response sent successfully.' });
    } catch (error) {
        console.error('Error sending admin response:', error);
        res.status(500).json({ message: 'Failed to send response.' });
    }
});

// NEW: Route to handle admin sending a response to a visa interview prep request
router.post('/visa-prep/send-response', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { requestId, message, scheduledDate, scheduledTime, zoomLink } = req.body;

        if (!requestId || !message || !scheduledDate || !scheduledTime || !zoomLink) {
            return res.status(400).json({ message: 'Request ID, message, date, time, and Zoom link are required.' });
        }

        const requestRef = db.collection('visa_interview_prep_requests').doc(requestId);
        await requestRef.update({
            adminResponse: message,
            scheduledDate,
            scheduledTime,
            zoomLink,
            status: 'scheduled',
            respondedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const requestDoc = await requestRef.get();
        if (requestDoc.exists) {
            const requestData = requestDoc.data();
            const userId = requestData?.userId;
            if (userId) {
                await db.collection('notifications').add({
                    userId,
                    message: `Your visa prep session for ${requestData?.visaType} has been scheduled for ${scheduledDate} at ${scheduledTime}. The Zoom link is: ${zoomLink}.`,
                    type: 'visa_prep_response',
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        }

        res.status(200).json({ message: 'Visa prep response sent successfully.' });
    } catch (error) {
        console.error('Error sending admin visa prep response:', error);
        res.status(500).json({ message: 'Failed to send response.' });
    }
});

export default router;