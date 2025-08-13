import express from 'express';
import verifyToken from '../middleware/auth.js'; 
import User from '../models/User.js'; 
import Mentor from '../models/Mentor.js'; 

const router = express.Router();

router.post('/connect', verifyToken, async (req, res) => {
    try {
        const userId = req.user.firebaseUid; // Use firebaseUid as the unique identifier

        // Find an available mentor
        const mentor = await Mentor.findOne({ isAvailable: true });

        if (!mentor) {
            return res.status(404).json({ message: 'No mentors are currently available.' });
        }
        
        // Find the user by their Firebase UID and update their record
        const user = await User.findOneAndUpdate(
            { firebaseUid: userId },
            { 
                mentorId: mentor._id,
                isConnectedToMentor: true,
            },
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Add the user to the mentor's list of connected users
        await Mentor.findByIdAndUpdate(mentor._id, {
            $push: { connectedUsers: user._id }
        });

        res.status(200).json({ message: 'You have been successfully connected with a mentor!' });
    } catch (error) {
        console.error('Error connecting with mentor:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

export default router;