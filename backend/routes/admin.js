import express from 'express';
import admin from 'firebase-admin'; // Import the Firebase Admin SDK
import Document from '../models/Document.js';
import verifyToken from '../middleware/auth.js'; // Import the authentication middleware
import multer from 'multer'; // Import multer for file uploads
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    // Check if the `req.user` object exists and has the 'admin' role.
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
};

// Cloudinary configuration (assuming it's already set up in index.js)
// You may need to move this configuration into a shared file or redefine it here.
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
            folder: `grad-tracker/corrected-documents`, // Folder for corrected docs
            public_id: `corrected-${documentId}-${Date.now()}`,
            resource_type: 'raw',
            format: file.mimetype.split('/')[1],
        };
    },
});

const uploadCorrected = multer({ storage: correctedStorage });

// GET all documents awaiting review
router.get('/documents/for-review', verifyToken, isAdmin, async (req, res) => {
    try {
        const documents = await Document.find({ status: 'pending_review' }).populate('applicationId', 'schoolName programName');
        res.json(documents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// NEW: Route to handle admin uploading a corrected document
router.post('/documents/correct/:documentId', verifyToken, isAdmin, uploadCorrected.single('correctedDocument'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const { documentId } = req.params;
        const correctedFileUrl = req.file.path; // URL from Cloudinary

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

// Existing route to change a user's role
router.post('/set-user-role', verifyToken, isAdmin, async (req, res) => {
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

export default router;