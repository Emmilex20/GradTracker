// routes/cvServiceRoutes.js

import express from 'express';
import admin from 'firebase-admin';
import verifyToken from '../middleware/auth.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();
const db = admin.firestore();

// Cloudinary config
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

// ** ACADEMIC CV SERVICE ROUTES **
router.post('/submit', verifyToken, uploadInitialCV.single('cvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded. Please submit a CV.' });
        }
        
        const userId = req.user.uid;
        const userEmail = req.user.email;

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
        });

    } catch (error) {
        console.error('Error fetching user\'s CV request:', error);
        res.status(500).json({ message: 'Failed to retrieve your request status.' });
    }
});

// Export the router
export default router;