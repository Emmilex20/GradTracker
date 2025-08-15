import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Application from '../models/Application.js';
import { db } from '../config/firebase-config.js';
import scrapeMastersportal from './mastersportalScraper.js';

// Create a Nodemailer transporter with SendGrid's SMTP settings
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
    }
});

// Finds applications that are 'Interested' or 'Applying'
// and have a deadline within the next 7 days.
const findApplicationsToRemind = async () => {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return Application.find({
        status: { $in: ['Interested', 'Applying'] },
        deadline: {
            $gte: today,
            $lte: sevenDaysFromNow
        }
    });
};

// Sends a reminder email and logs it to the application document
const sendReminderEmail = async (application) => {
    try {
        // Fetch the user's document from Firestore using the userId
        const userDoc = await db.collection('users').doc(application.userId).get();
        
        if (!userDoc.exists) {
            console.error(`User with ID ${application.userId} not found in Firestore.`);
            return;
        }

        const userData = userDoc.data();
        const { email, receiveNotifications } = userData;

        // Check if the user has email notifications enabled
        if (receiveNotifications === false) {
            console.log(`Notifications disabled for user ${email}. Skipping.`);
            return;
        }
        
        const deadlineDate = new Date(application.deadline).toLocaleDateString();
        const subject = `[Grad Manager] Deadline Approaching for ${application.schoolName}`;
        const body = `<p>Hello,</p>
            <p>This is a friendly reminder that the deadline for your application to <b>${application.programName}</b> at <b>${application.schoolName}</b> is on <b>${deadlineDate}</b>.</p>
            <p>Don't miss out! You can check your progress here:</p>
            <a href="http://localhost:3000/dashboard">Go to Dashboard</a>
            <p>Best regards,<br/>The Grad Manager Team</p>`;
        
        const mailOptions = {
            from: 'aginaemmanuel6@gmail.com', // Replace with your verified SendGrid sender email
            to: email, // Use the email fetched from Firestore
            subject: subject,
            html: body
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent to ${email} for ${application.schoolName}.`);

        // Log the email to the application document
        const sentEmail = {
            subject: subject,
            body: body,
            recipient: email,
            sentAt: new Date(),
        };

        await Application.findByIdAndUpdate(
            application._id,
            { $push: { emails: sentEmail } },
            { new: true, runValidators: true }
        );

    } catch (error) {
        console.error(`Error in sendReminderEmail for application ${application._id}:`, error);
    }
};

// The main scheduled task that checks deadlines and sends emails.
const startCronJob = () => {
    // Daily email reminder job (runs every day at 8:00 AM)
    cron.schedule('0 8 * * *', async () => {
        console.log('Running daily deadline check...');
        const applications = await findApplicationsToRemind();

        if (applications.length > 0) {
            console.log(`Found ${applications.length} applications with upcoming deadlines.`);
            for (const app of applications) {
                await sendReminderEmail(app);
            }
        } else {
            console.log('No applications found with upcoming deadlines.');
        }
    });

    // Monthly program discovery job (Mastersportal, runs on the 1st of every month at midnight)
    cron.schedule('0 0 1 * *', async () => {
        console.log('Running Mastersportal program discovery...');
        await scrapeMastersportal();
    });

    console.log('Cron jobs have been scheduled.');
};

export default startCronJob; 