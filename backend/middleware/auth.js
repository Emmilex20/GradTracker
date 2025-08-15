// src/middleware/auth.js

// Make sure you have 'firebase-admin' installed and the SDK initialized in your index.js
import admin from 'firebase-admin';

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Use the Firebase Admin SDK to securely verify the token.
        // It handles public keys, algorithms (RS256), and expiration automatically.
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Extract the custom role from the decoded token.
        // The `role` claim must be set on the user's account by an admin.
        const role = decodedToken.role || 'user';
        
        // Attach the user information, including the role, to the request object.
        req.user = { 
            uid: decodedToken.uid, 
            firebaseUid: decodedToken.uid,
            email: decodedToken.email, 
            role: role 
        };
        next();
    } catch (error) {
        console.error('Firebase Auth Token verification error:', error);
        // The error could be 'auth/id-token-expired' or 'auth/argument-error'
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

export default verifyToken;