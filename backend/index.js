// Load environment variables
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from './auth/googleAuth.js';
import MongoStore from 'connect-mongo';
import http from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

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

// === NEW AI ROUTES IMPORT ===
import aiRoutes from './routes/aiRoutes.js';


const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
    path: '/api/socket.io',
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
        startCronJob();
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
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

// === NEW GET Route for fetching historical messages ===
app.get('/api/messages/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const messagesRef = admin.firestore().collection('chats').doc(chatId).collection('messages');
        const snapshot = await messagesRef.orderBy('createdAt', 'asc').get();

        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString() || null,
        }));

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching historical messages:', error);
        res.status(500).json({ message: 'Failed to fetch messages.' });
    }
});


// Root route
app.get('/', (req, res) => {
    res.send('Grad School Application API is running!');
});

// === Socket.IO Connection Handling ===
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    const db = admin.firestore();

    // Join a room for one-on-one chat or group chat
    socket.on('join_chat', (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat room: ${chatId}`);
    });

    // Handle sending and receiving messages for both one-on-one and group chats
    socket.on('send_message', async (data) => {
        const { chatId, senderId, text } = data;

        try {
            // Save message to Firestore
            const messageRef = await db.collection('chats').doc(chatId).collection('messages').add({
                senderId,
                text,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            const messageDoc = await messageRef.get();
            const messageData = messageDoc.data();

            // Ensure a valid createdAt string is always present
            const createdAt = messageData.createdAt ? messageData.createdAt.toDate().toISOString() : new Date().toISOString();

            // Emit the message to all clients in the chat room
            io.to(chatId).emit('receive_message', {
                id: messageDoc.id,
                senderId: messageData.senderId,
                text: messageData.text,
                createdAt,
            });
        } catch (error) {
            console.error('Error saving message to Firestore:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Start server (use the http server, not the express app)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 