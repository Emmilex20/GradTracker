// index.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import Airtable from 'airtable'; // Keep this line
import applicationRoutes from './routes/applicationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import programRoutes from './routes/programRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import passport from './auth/googleAuth.js';
import startCronJob from './services/cron-job.js'; 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Route handlers - now all program-related routes are handled by programRoutes
app.use('/api/applications', applicationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/programs', programRoutes); // This route handles all program-related logic
app.use('/api/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/api/emails', emailRoutes);

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