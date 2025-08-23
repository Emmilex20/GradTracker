// routes/admin.js

import express from 'express';
import admin from 'firebase-admin';
import verifyToken from '../middleware/auth.js';
import checkRole from '../middleware/checkRole.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Create a new Express Router instance
const router = express.Router();
const db = admin.firestore();

// Cloudinary configuration (this is fine to keep here as it's specific to file uploads)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage setup for corrected documents
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

// Cloudinary storage setup for corrected CVs
const correctedCVStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        const requestId = req.params.requestId;
        return {
            folder: `grad-tracker/corrected-cvs`,
            public_id: `corrected-cv-${requestId}-${Date.now()}`,
            resource_type: 'raw',
            format: file.mimetype.split('/')[1],
        };
    },
});
const uploadCorrectedCV = multer({ storage: correctedCVStorage });

// Cloudinary storage setup for initial CV uploads from users
const initialCVStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        const userId = req.user.uid;
        return {
            folder: `grad-tracker/initial-cvs/${userId}`,
            public_id: `initial-cv-${userId}-${Date.now()}`,
            resource_type: 'raw',
            format: file.mimetype.split('/')[1],
        };
    },
});
const uploadInitialCV = multer({ storage: initialCVStorage });

// ** ACADEMIC CV SERVICE ROUTES **
// 1. Route for a user to submit their CV for review
router.post('/cv-service/submit', verifyToken, uploadInitialCV.single('cvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded. Please submit a CV.' });
        }
        
        const userId = req.user.uid;
        const userEmail = req.user.email;

        // Check if a pending request already exists for this user
        const existingRequest = await db.collection('cv_requests')
            .where('userId', '==', userId)
            .where('status', '==', 'pending')
            .limit(1)
            .get();

        if (!existingRequest.empty) {
            return res.status(409).json({ message: 'You already have a pending CV review request.' });
        }

        const cvRequestsRef = db.collection('cv_requests');
        const newRequestDoc = await cvRequestsRef.add({
            userId,
            userEmail,
            cvUrl: req.file.path,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({
            message: 'Academic CV service request submitted successfully.',
            requestId: newRequestDoc.id,
            cvUrl: req.file.path
        });
    } catch (error) {
        console.error('Error submitting CV service request:', error);
        res.status(500).json({ message: 'Server error: Failed to submit request.' });
    }
});

// New route for a user to get their CV request status
router.get('/cv-service/my-request', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        
        const userRequestSnapshot = await db.collection('cv_requests')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (userRequestSnapshot.empty) {
            return res.status(200).json({ status: 'none', message: 'No CV request found.' });
        }

        const doc = userRequestSnapshot.docs[0];
        const data = doc.data();

        res.status(200).json({
            id: doc.id,
            status: data.status,
            createdAt: data.createdAt?.toDate().toISOString(),
            correctedCvUrl: data.correctedCvUrl || null,
        });

    } catch (error) {
        console.error('Error fetching user\'s CV request:', error);
        res.status(500).json({ message: 'Failed to retrieve your request status.' });
    }
});

// 2. Route for admin to get ALL CV requests (pending and completed)
router.get('/cv-service/all-reviews', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const cvRequestsSnapshot = await db.collection('cv_requests')
            .orderBy('createdAt', 'desc')
            .get();

        const cvRequests = cvRequestsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toISOString()
            };
        });
        res.status(200).json(cvRequests);
    } catch (error) {
        console.error('Error fetching all CV requests:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// 3. Route for admin to upload the corrected CV
router.post('/cv-service/correct/:requestId', verifyToken, checkRole('admin'), uploadCorrectedCV.single('correctedCV'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const { requestId } = req.params;
        const correctedFileUrl = req.file.path;

        const cvRequestRef = db.collection('cv_requests').doc(requestId);
        const cvRequestDoc = await cvRequestRef.get();

        if (!cvRequestDoc.exists) {
            return res.status(404).json({ message: 'CV request not found.' });
        }

        const cvRequestData = cvRequestDoc.data();
        const userId = cvRequestData.userId;

        await cvRequestRef.update({
            correctedCvUrl: correctedFileUrl,
            status: 'review_complete',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await db.collection('notifications').add({
            userId,
            message: 'Your academic CV review is complete. You can now download the corrected version.',
            type: 'cv_review_complete',
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).json({ message: 'CV review complete and corrected file uploaded.', correctedFileUrl });
    } catch (err) {
        console.error('Error uploading corrected CV:', err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// ** EXISTING GENERAL ADMIN ROUTES (MIGRATED TO FIRESTORE) **

// GET all documents awaiting review
router.get('/documents/for-review', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const documentsSnapshot = await db.collection('documents').where('status', '==', 'pending_review').get();
        const documents = documentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

        const documentRef = db.collection('documents').doc(documentId);
        const documentDoc = await documentRef.get();

        if (!documentDoc.exists) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        await documentRef.update({
            correctedFileUrl: correctedFileUrl,
            status: 'review_complete',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).json({ message: 'Document review complete and corrected file uploaded.', document: { id: documentId, ...documentDoc.data(), correctedFileUrl, status: 'review_complete' } });
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

// NEW: Route to handle admin sending a response to a financial support request
router.post('/financial-support/send-response', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { requestId, message, scheduledDate, scheduledTime, zoomLink, status } = req.body;

        if (!requestId || !status) {
            return res.status(400).json({ message: 'Request ID and status are required.' });
        }

        const requestRef = db.collection('financial_support_requests').doc(requestId);
        const updateData = {
            adminResponse: message,
            status: status,
            respondedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (status === 'scheduled') {
            if (!scheduledDate || !scheduledTime || !zoomLink) {
                return res.status(400).json({ message: 'Date, time, and Zoom link are required for scheduled requests.' });
            }
            updateData.scheduledDate = scheduledDate;
            updateData.scheduledTime = scheduledTime;
            updateData.zoomLink = zoomLink;
        }

        await requestRef.update(updateData);

        const requestDoc = await requestRef.get();
        if (requestDoc.exists) {
            const requestData = requestDoc.data();
            const userId = requestData?.userId;
            const userEmail = requestData?.userEmail;
            
            if (userId) {
                let notificationMessage = '';
                if (status === 'scheduled') {
                    notificationMessage = `Your financial support session for ${requestData?.universityName} has been scheduled for ${scheduledDate} at ${scheduledTime}.`;
                } else if (status === 'declined') {
                    notificationMessage = `Your financial support request for ${requestData?.universityName} has been declined.`;
                } else {
                    notificationMessage = `Your financial support request for ${requestData?.universityName} has been updated.`;
                }

                await db.collection('notifications').add({
                    userId,
                    userEmail,
                    message: notificationMessage,
                    type: 'financial_support_response',
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        }

        res.status(200).json({ message: 'Financial support response sent successfully.' });
    } catch (error) {
        console.error('Error sending financial support response:', error);
        res.status(500).json({ message: 'Failed to send response.', error: error.message });
    }
});

export default router;