// server/src/routes/emailRoutes.js (ESM)

import { Router } from 'express';
import { google } from 'googleapis';
import { createMimeMessage } from 'mimetext';

const router = Router();

// Middleware to check if the user is authenticated and has an access token
const isAuthenticated = (req, res, next) => {
  if (req.user && req.user.accessToken) {
    return next();
  }
  res.status(401).send('Unauthorized');
};

router.post('/send', isAuthenticated, async (req, res) => {
  const { to, subject, body } = req.body;
  const accessToken = req.user.accessToken;
  const userEmail = req.user.email;

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth });

    const message = createMimeMessage();
    message.setSender(userEmail);
    message.setRecipient(to);
    message.setSubject(subject);
    message.setMessage('text/html', body);

    const encodedMessage = Buffer.from(message.toString()).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).send('Failed to send email');
  }
});

export default router;