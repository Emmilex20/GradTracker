// routes/cvServiceRoutes.js

import express from 'express';
import admin from 'firebase-admin';
import verifyToken from '../middleware/auth.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();
const db = admin.firestore();

// Cloudinary config (must be configured at the top of the file)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage setup for initial CV uploads
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

// Cloudinary storage setup for corrected CV uploads
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

// ** ACADEMIC CV SERVICE ROUTES **

// Route to submit a new CV upload request
router.post('/submit', verifyToken, uploadInitialCV.single('cvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded. Please submit a CV.' });
        }
        
        const userId = req.user.uid;
        const userEmail = req.user.email;

        const existingRequest = await db.collection('cv_requests')
            .where('userId', '==', userId)
            .where('status', 'in', ['pending', 'scheduled'])
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
            type: 'cv_upload',
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

// Route for users to check their request status
router.get('/my-request', verifyToken, async (req, res) => {
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
            scheduledDate: data.scheduledDate || null,
            scheduledTime: data.scheduledTime || null,
            zoomLink: data.zoomLink || null,
        });

    } catch (error) {
        console.error('Error fetching user\'s CV request:', error);
        res.status(500).json({ message: 'Failed to retrieve your request status.' });
    }
});

// Route for users to submit a new CV request with notes
router.post('/new-request', verifyToken, async (req, res) => {
    try {
        const { notes } = req.body;
        if (!notes) {
            return res.status(400).json({ message: 'Notes are required for this request type.' });
        }

        const userId = req.user.uid;
        const userEmail = req.user.email;

        const existingRequest = await db.collection('cv_requests')
            .where('userId', '==', userId)
            .where('status', 'in', ['pending', 'scheduled'])
            .limit(1)
            .get();

        if (!existingRequest.empty) {
            return res.status(409).json({ message: 'You already have a pending CV review request.' });
        }

        const newRequestDoc = await db.collection('cv_requests').add({
            userId,
            userEmail,
            notes,
            status: 'pending',
            type: 'new_cv_request',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({
            message: 'New CV request with notes submitted successfully.',
            requestId: newRequestDoc.id,
        });
    } catch (error) {
        console.error('Error submitting new CV request:', error);
        res.status(500).json({ message: 'Server error: Failed to submit new request.' });
    }
});

// ** ADMIN ROUTES **

// Route to get all CV review requests for admin dashboard
router.get('/admin/cv-service/all-reviews', verifyToken, async (req, res) => {
    try {
        // Check if the user is an admin
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        if (!userDoc.exists || userDoc.data().role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admin access required.' });
        }

        const requestsSnapshot = await db.collection('cv_requests')
            .orderBy('createdAt', 'desc')
            .get();
        
        const allRequests = requestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString(),
        }));
        res.status(200).json(allRequests);
    } catch (error) {
        console.error('Error fetching all CV requests:', error);
        res.status(500).json({ message: 'Server error: Failed to fetch requests.' });
    }
});

// New route for admin to upload a corrected CV
router.post('/admin/cv-service/correct/:requestId', verifyToken, uploadCorrectedCV.single('correctedCV'), async (req, res) => {
    try {
        const { requestId } = req.params;

        // Validate admin role
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        if (!userDoc.exists || userDoc.data().role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admin access required.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const requestRef = db.collection('cv_requests').doc(requestId);
        const requestDoc = await requestRef.get();

        if (!requestDoc.exists) {
            return res.status(404).json({ message: 'CV request not found.' });
        }

        await requestRef.update({
            status: 'review_complete',
            correctedCvUrl: req.file.path,
            reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // TODO: Implement logic to send an email notification to the user
        // const userEmail = requestDoc.data().userEmail;
        // sendEmailWithLink(userEmail, req.file.path);

        res.status(200).json({ message: 'Corrected CV uploaded and request updated successfully.', correctedCvUrl: req.file.path });
    } catch (error) {
        console.error('Error uploading corrected CV:', error);
        res.status(500).json({ message: 'Server error: Failed to process corrected CV.' });
    }
});

// New route for admin to schedule a live session
router.post('/admin/cv-service/schedule-session/:requestId', verifyToken, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { scheduledDate, scheduledTime, zoomLink } = req.body;

        // Validate admin role
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        if (!userDoc.exists || userDoc.data().role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admin access required.' });
        }

        if (!scheduledDate || !scheduledTime || !zoomLink) {
            return res.status(400).json({ message: 'Missing required scheduling information.' });
        }

        const requestRef = db.collection('cv_requests').doc(requestId);
        const requestDoc = await requestRef.get();
        
        if (!requestDoc.exists) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        await requestRef.update({
            status: 'scheduled',
            scheduledDate,
            scheduledTime,
            zoomLink,
            reviewedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // TODO: Implement email sending logic here
        // const userEmail = requestDoc.data().userEmail;
        // sendEmailToUser(userEmail, scheduledDate, scheduledTime, zoomLink);

        res.status(200).json({ message: 'Session scheduled successfully.' });

    } catch (error) {
        console.error('Error scheduling session:', error);
        res.status(500).json({ message: 'Server error: Failed to schedule session.' });
    }
});

// Export the router
export default router;