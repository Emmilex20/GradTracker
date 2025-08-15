// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize the Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Configure the email transport using a mail service like Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password,
    },
});

// This Cloud Function is triggered when a user's document is updated
exports.notifyMentorOnConnection = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
        const afterData = change.after.data();
        const beforeData = change.before.data();

        // Check if the mentorId was just added and wasn't present before
        if (afterData.mentorId && !beforeData.mentorId) {
            const mentorId = afterData.mentorId;
            const menteeEmail = afterData.email;
            const menteeName = afterData.firstName || 'A new mentee';

            // Get the mentor's document to find their email and name
            const mentorDoc = await db.collection('users').doc(mentorId).get();
            if (!mentorDoc.exists) {
                console.error(`Mentor document with ID ${mentorId} not found.`);
                return null;
            }
            const mentorData = mentorDoc.data();
            const mentorEmail = mentorData.email;
            const mentorName = mentorData.firstName || 'Mentor';

            // Prepare the email content
            const mailOptions = {
                from: 'Your Grad App Tracker <noreply@yourdomain.com>',
                to: mentorEmail,
                subject: `🎉 You have a new mentee!`,
                html: `
                    <p>Hello ${mentorName},</p>
                    <p>You have been successfully connected with a new mentee, ${menteeName} (${menteeEmail}).</p>
                    <p>Please reach out to them to begin your mentoring journey!</p>
                    <p>Best regards,<br/>The Grad App Tracker Team</p>
                `,
            };

            // Send the email
            try {
                await transporter.sendMail(mailOptions);
                console.log(`Notification email sent to mentor: ${mentorEmail}`);
            } catch (error) {
                console.error('Error sending email:', error);
                throw new Error('Email sending failed.');
            }
        }
        return null;
    });