// applications.js
import express from 'express';
import Application from '../models/Application.js';
import ical from 'ical-generator';
import Document from '../models/Document.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// GET all applications for a specific user
router.get('/:userId', async (req, res) => {
    try {
        const applications = await Application.find({ userId: req.params.userId });
        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET calendar feed for a specific user
router.get('/:userId/calendar', async (req, res) => {
    try {
        const userId = req.params.userId;
        const applications = await Application.find({ userId });

        const cal = ical({ name: 'Grad Tracker Applications' });

        applications.forEach(app => {
            if (app.deadline) {
                cal.createEvent({
                    start: new Date(app.deadline),
                    end: new Date(app.deadline),
                    summary: `${app.programName} Application Deadline`,
                    description: `Deadline for ${app.schoolName} program.`,
                });
            }
        });

        cal.serve(res);
    } catch (error) {
        console.error('Error generating calendar:', error);
        res.status(500).send('Error generating calendar.');
    }
});

// POST a new application
router.post('/', async (req, res) => {
    try {
        const {
            userId,
            schoolName,
            programName,
            deadline,
            status,
            notes,
            funding,
            fundingAmount,
            greWaiver,
            ieltsWaiver,
            appFeeWaiver,
            requiredDocs,
            appLink,
            professors, // <-- Add professors here
        } = req.body;

        const existingApplication = await Application.findOne({
            userId,
            schoolName,
            programName,
        });

        if (existingApplication) {
            return res.status(409).json({ message: 'This program has already been added to your dashboard.' });
        }

        const newApplication = new Application({
            userId,
            schoolName,
            programName,
            deadline,
            status,
            notes,
            funding,
            fundingAmount,
            greWaiver,
            ieltsWaiver,
            appFeeWaiver,
            requiredDocs,
            appLink,
            professors, // <-- Add professors here
        });

        const application = await newApplication.save();
        res.status(201).json(application);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT/UPDATE an existing application
router.put('/:id', async (req, res) => {
    try {
        const updatedApplication = await Application.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedApplication) {
            return res.status(404).json({ message: 'Application not found' });
        }
        res.json(updatedApplication);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE an application
router.delete('/:id', async (req, res) => {
    try {
        const application = await Application.findByIdAndDelete(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        // --- Delete all associated documents from Cloudinary and MongoDB ---
        const documents = await Document.find({ applicationId: req.params.id });
        for (const doc of documents) {
            const publicId = doc.fileUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw', invalidate: true });
            await Document.findByIdAndDelete(doc._id);
        }

        res.json({ message: 'Application and associated documents deleted successfully' });
    } catch (err) {
        console.error('Error deleting application and documents:', err);
        res.status(500).json({ message: err.message });
    }
});

// --- DELETE a specific document from an application ---
router.delete('/:applicationId/documents/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Extract the public ID from the Cloudinary URL
        const publicId = document.fileUrl.split('/').pop().split('.')[0];
        
        // Delete the file from Cloudinary
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw', invalidate: true });

        // Delete the document record from the database
        await Document.findByIdAndDelete(documentId);

        res.json({ message: 'Document deleted successfully' });
    } catch (err) {
        console.error('Error deleting document:', err);
        res.status(500).json({ message: err.message });
    }
});

// --- NEW: Route to submit a document for review ---
router.put('/:applicationId/documents/:documentId/submit-for-review', async (req, res) => {
    try {
        const document = await Document.findByIdAndUpdate(
            req.params.documentId,
            { status: 'pending_review' },
            { new: true }
        );
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        // TODO: Add logic to send an email notification to the app owners
        res.status(200).json(document);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ... Existing email route
router.post('/:applicationId/emails', async (req, res) => {
    const { applicationId } = req.params;
    const { subject, body, recipient } = req.body;

    try {
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).send('Application not found');
        }

        application.emails.push({
            subject,
            body,
            recipient,
            sentAt: new Date(),
        });
        await application.save();

        res.status(201).send('Email record added successfully!');
    } catch (error) {
        console.error('Failed to add email record:', error);
        res.status(500).send('Failed to add email record');
    }
});

export default router;