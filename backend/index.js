// Load environment variables
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from './auth/googleAuth.js';
import MongoStore from 'connect-mongo';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Services & Models
import startCronJob from './services/cron-job.js';
import Document from './models/Document.js';

// Import Firebase Admin from a single source
import { admin } from './config/firebase-config.js';
import verifyToken from './middleware/auth.js';

// Routes
import applicationRoutes from './routes/applicationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import programRoutes from './routes/programRoutes.js';
import userRoutes from './routes/users.js';
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import adminRoutes from './routes/admin.js';
import mentorsRouter from './routes/mentorRoutes.js';
import menteeRoutes from './routes/menteeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import sopRequestsRoutes from './routes/sopRequestsRoutes.js';
import connectionsRoutes from './routes/connections.js';
import groupsRoutes from './routes/groups.js';
import agoraRoutes from './routes/agoraRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import interviewPrepRoutes from './routes/interviewPrepRoutes.js';
import financialSupportRoutes from './routes/financialSupportRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import cvServiceRoutes from './routes/cvServiceRoutes.js';

// === NEW AI ROUTES IMPORT ===
import aiRoutes from './routes/aiRoutes.js';

// === NEW ROUTE IMPORT ===
import visaInterviewPrepRoutes from './routes/visaInterviewPrepRoutes.js';

const app = express();

// **ES Module fix for __dirname**
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
        startCronJob();
    })
    .catch(err => console.error('MongoDB connection error:', err));

const corsOptions = {
  origin: process.env.CLIENT_URL, // Use the variable from .env
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());

// === Express Session Configuration ===
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-very-long-and-secure-random-string',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'native'
    }),
    cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage setup
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const userId = req.user?.uid;
        const applicationId = req.params.id;

        const originalName = path.parse(file.originalname).name;
        const publicId = `${originalName}-${Date.now()}`;

        let folderPath = `grad-tracker/${userId}/${applicationId}`;
        if (!userId || !applicationId) {
            console.warn('Could not determine folder path for upload, using generic folder.');
            folderPath = 'grad-tracker/misc';
        }

        return {
            folder: folderPath,
            public_id: publicId,
            resource_type: 'raw',
            format: file.mimetype.split('/')[1],
        };
    },
});

const upload = multer({ storage: storage });

// === ROUTES ===

// Upload document
app.post('/api/applications/:id/documents', verifyToken, upload.single('document'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const { id } = req.params;
    const { fileType } = req.body;
    const userId = req.user.uid;

    if (!fileType || !userId) {
        if (req.file) {
            cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
        }
        return res.status(400).send('Missing file type or user ID.');
    }

    try {
        const newDocument = new Document({
            applicationId: id,
            userId,
            fileName: req.file.originalname,
            fileUrl: req.file.path,
            filePublicId: req.file.filename,
            fileType
        });
        await newDocument.save();
        res.status(201).json(newDocument);
    } catch (error) {
        console.error('Document upload error:', error);
        if (req.file) {
            cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
        }
        res.status(500).send('Server error.');
    }
});

// Upload corrected document (Admin only)
app.post('/api/applications/:id/documents/:docId/corrected-version', verifyToken, upload.single('document'), async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Only administrators can upload corrected documents.' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        const { docId } = req.params;
        const document = await Document.findById(docId);

        if (!document) {
            await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
            return res.status(404).json({ message: 'Document not found.' });
        }

        if (document.correctedFilePublicId) {
            await cloudinary.uploader.destroy(document.correctedFilePublicId, { resource_type: 'raw' });
        }

        document.correctedFileUrl = req.file.path;
        document.correctedFilePublicId = req.file.filename;
        document.status = 'review_complete';
        await document.save();

        res.status(200).json({ message: 'Corrected document uploaded successfully', document });
    } catch (error) {
        console.error('Error uploading corrected document:', error);
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
        }
        res.status(500).json({ message: 'Server error.' });
    }
});

// Get documents for an application
app.get('/api/applications/:id/documents', verifyToken, async (req, res) => {
    try {
        const documents = await Document.find({ applicationId: req.params.id, userId: req.user.uid });
        res.status(200).json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).send('Server error.');
    }
});

// Generate download URL
app.get('/api/documents/:docId/download-url', verifyToken, async (req, res) => {
    try {
        const document = await Document.findById(req.params.docId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (document.userId !== req.user.uid && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const fileUrlToSign = document.correctedFilePublicId || document.filePublicId;
        const fileName = document.correctedFilePublicId
            ? `${document.fileName}_corrected`
            : document.fileName;

        const signedUrl = cloudinary.url(fileUrlToSign, {
            resource_type: 'raw',
            flags: 'attachment',
            attachment: fileName,
            sign_url: true,
            secure: true,
        });

        res.json({ downloadUrl: signedUrl });
    } catch (error) {
        console.error('Error generating download URL:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// === SOP LIVE WRITING REQUEST ROUTE ===
app.post('/api/sop-requests', verifyToken, async (req, res) => {
    try {
        const { applicationId } = req.body;
        const userId = req.user.uid;

        if (!applicationId || !userId) {
            return res.status(400).json({ message: 'Application ID and User ID are required.' });
        }

        const sopRequestRef = admin.firestore().collection('sop_requests');
        const newRequestDoc = await sopRequestRef.add({
            applicationId,
            userId,
            status: 'pending',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ 
            message: 'SOP request submitted successfully.',
            requestId: newRequestDoc.id
        });
    } catch (error) {
        console.error('Error submitting SOP request:', error);
        res.status(500).json({ message: 'Server error: Failed to submit request.' });
    }
});

// === USE THE NEW AI ROUTES ===
app.use('/api/v1', aiRoutes);

// Other routes
app.use('/api/applications', verifyToken, applicationRoutes);
app.use('/api/feedback', verifyToken, feedbackRoutes);
app.use('/api/programs', verifyToken, programRoutes);
app.use('/api/emails', verifyToken, emailRoutes);
app.use('/api/admin', verifyToken, adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mentors', mentorsRouter);
app.use('/api/mentee', menteeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sopRequestsRoutes', sopRequestsRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/agora', agoraRoutes);
app.use('/api/projects', verifyToken, projectRoutes);
app.use('/api/interview-prep', verifyToken, interviewPrepRoutes);
app.use('/api/chats', verifyToken, chatRoutes);
app.use('/api/cv-service', verifyToken, cvServiceRoutes);

// === NEW VISA INTERVIEW PREP ROUTE ===
app.use('/api/visa-prep', verifyToken, visaInterviewPrepRoutes);
app.use('/api/financial-support', verifyToken, financialSupportRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Grad School Application API is running!');
});

// The catch-all route that serves your frontend application's index.html file.
// This must be placed AFTER all API routes to prevent them from being intercepted.


// Start server (use the express app directly since there's no Socket.IO)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 