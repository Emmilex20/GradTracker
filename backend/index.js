// index.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import applicationRoutes from './routes/applicationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import programRoutes from './routes/programRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import passport from './auth/googleAuth.js';
import startCronJob from './services/cron-job.js';
import Document from './models/Document.js';
import adminRoutes from './routes/admin.js';
import fs from 'fs';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import admin from 'firebase-admin';
import verifyToken from './middleware/auth.js';

try {
  const serviceAccountPath = './config/grad-tracker-app-firebase-adminsdk.json';
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } else {
    console.log('Firebase Admin SDK already initialized.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK. Check your service account key file.');
  console.error(error);
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Get userId and applicationId from the request, depending on the route
    const userId = req.user?.uid;
    const applicationId = req.params.id;

    const originalName = path.parse(file.originalname).name;
    const publicId = `${originalName}-${Date.now()}`;

    // Ensure the folder path is consistent
    let folderPath = `grad-tracker/${userId}/${applicationId}`;
    if (!userId || !applicationId) {
      console.warn('Could not determine folder path for upload, using generic folder.');
      folderPath = 'grad-tracker/misc';
    }

    return {
            folder: `grad-tracker/${userId}/${applicationId}`,
            public_id: `${originalName}-${Date.now()}`,
      resource_type: 'raw',
      format: file.mimetype.split('/')[1],
    };
  },
});

const upload = multer({ storage: storage });

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
        const isRawFile = req.file.mimetype.startsWith('application/');
        let filePublicId;

        if (isRawFile) {
            filePublicId = req.file.filename;
        } else {
            filePublicId = req.file.filename.replace(/\.[^/.]+$/, "");
        }

    const newDocument = new Document({
      applicationId: id,
      userId,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
            filePublicId: filePublicId,
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

app.get('/api/applications/:id/documents', verifyToken, async (req, res) => {
  try {
    const documents = await Document.find({ applicationId: req.params.id, userId: req.user.uid });
    res.status(200).json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).send('Server error.');
  }
});

app.get('/api/documents/:docId/download-url', verifyToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.docId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

        const signedUrl = cloudinary.url(document.filePublicId, {
      resource_type: 'raw',
      flags: 'attachment',
            attachment: document.fileName,
      sign_url: true,
      secure: true,
    });

    res.json({ downloadUrl: signedUrl });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Use the new mentor routes
app.use('/api/mentors', verifyToken, mentorRoutes); 

app.use('/api/applications', verifyToken, applicationRoutes);
app.use('/api/feedback', verifyToken, feedbackRoutes);
app.use('/api/programs', verifyToken, programRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/emails', verifyToken, emailRoutes);
app.use('/api/admin', verifyToken, adminRoutes);

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected successfully');
    startCronJob();
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Grad School Application API is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});