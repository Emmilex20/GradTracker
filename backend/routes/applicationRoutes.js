import express from 'express';
import Application from '../models/Application.js';
import ical from 'ical-generator';

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
        res.json({ message: 'Application deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/:applicationId/emails', async (req, res) => {
    const { applicationId } = req.params;
    const { subject, body, recipient } = req.body;

    try {
        // Find the application by its ID
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).send('Application not found');
        }

        // Save the email as a record in the database
        application.emails.push({
            subject,
            body,
            recipient,
            sentAt: new Date(),
        });
        await application.save();

        // Optionally, send the email using a separate service function
        // await sendEmail(recipient, subject, body);

        res.status(201).send('Email record added successfully!');
    } catch (error) {
        console.error('Failed to add email record:', error);
        res.status(500).send('Failed to add email record');
    }
});

export default router;