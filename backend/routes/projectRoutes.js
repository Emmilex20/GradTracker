import express from 'express';
import { admin } from '../config/firebase-config.js';
import verifyToken from '../middleware/auth.js';
import { createNotification } from './notificationRoutes.js';

const router = express.Router();
const db = admin.firestore();

// Helper function to check for admin role
const isAdmin = async (uid) => {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        // Check if the document exists AND has a role field
        const role = userDoc.data()?.role;
        return userDoc.exists && role === 'admin';
    } catch (error) {
        // Log the error for debugging
        console.error("Error checking admin role:", error); 
        return false;
    }
};

// Route to create a new project
// Accessible by all users, but requires admin approval
router.post('/', verifyToken, async (req, res) => {
    const { title, goals, description } = req.body;
    const userId = req.user.uid;

    if (!title || !goals || !description) {
        return res.status(400).json({ message: 'Project title, goals, and description are required.' });
    }

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const userName = userData.firstName && userData.lastName ? 
                         `${userData.firstName} ${userData.lastName}` : 
                         'A user';

        const adminSnapshot = await db.collection('users').where('role', '==', 'admin').limit(1).get();
        const adminId = adminSnapshot.docs[0]?.id;

        if (!adminId) {
            return res.status(500).json({ message: 'Admin user not found.' });
        }

        const newProjectRef = await db.collection('projects').add({
            title,
            goals,
            description,
            creatorId: userId,
            creatorName: userName,
            status: 'pending_approval',
            members: [],
            pendingRequests: [userId],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const notificationMessage = `A new project "${title}" has been created by ${userName} and is pending your approval.`;
        await createNotification(adminId, userId, notificationMessage, 'project_approval_request');

        res.status(201).json({
            message: 'Project created successfully and is awaiting admin approval.',
            projectId: newProjectRef.id,
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// Admin route to approve a project
router.put('/:projectId/approve', verifyToken, async (req, res) => {
    if (!await isAdmin(req.user.uid)) {
        return res.status(403).json({ message: 'Forbidden: Only administrators can approve projects.' });
    }

    const { projectId } = req.params;

    try {
        const projectRef = db.collection('projects').doc(projectId);
        const projectDoc = await projectRef.get();

        if (!projectDoc.exists) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        const projectData = projectDoc.data();
        const pendingRequests = projectData.pendingRequests || [];
        const creatorId = projectData.creatorId;

        await projectRef.update({
            status: 'active',
            members: [creatorId], // Add the creator as the first member
            pendingRequests: [],
            approvedBy: req.user.uid,
            approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const notificationMessage = `Your project "${projectData.title}" has been approved and is now active!`;
        await createNotification(creatorId, req.user.uid, notificationMessage, 'project_approved');

        res.status(200).json({ message: 'Project approved successfully.' });
    } catch (error) {
        console.error('Error approving project:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// Admin route to decline a project
router.put('/:projectId/decline', verifyToken, async (req, res) => {
    if (!await isAdmin(req.user.uid)) {
        return res.status(403).json({ message: 'Forbidden: Only administrators can decline projects.' });
    }

    const { projectId } = req.params;

    try {
        const projectRef = db.collection('projects').doc(projectId);
        const projectDoc = await projectRef.get();

        if (!projectDoc.exists) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        await projectRef.update({
            status: 'declined',
            declinedBy: req.user.uid,
            declinedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const projectData = projectDoc.data();
        const notificationMessage = `Your project "${projectData.title}" has been declined by an admin.`;
        await createNotification(projectData.creatorId, req.user.uid, notificationMessage, 'project_declined');

        res.status(200).json({ message: 'Project declined successfully.' });
    } catch (error) {
        console.error('Error declining project:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// Route to get a list of all active projects
router.get('/', verifyToken, async (req, res) => {
    try {
        const projectsSnapshot = await db.collection('projects')
            .where('status', '==', 'active')
            .get();

        const projects = projectsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// Route to send a request to join a project
router.post('/:projectId/join-request', verifyToken, async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.uid;

    try {
        const projectRef = db.collection('projects').doc(projectId);
        const projectDoc = await projectRef.get();

        if (!projectDoc.exists) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        const projectData = projectDoc.data();
        const isMember = projectData.members && projectData.members.includes(userId);
        const hasPendingRequest = projectData.pendingRequests && projectData.pendingRequests.some(request => request.userId === userId);

        if (isMember || hasPendingRequest) {
            return res.status(409).json({ message: 'You have already joined or requested to join this project.' });
        }

        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const userName = userData.firstName && userData.lastName ? 
                         `${userData.firstName} ${userData.lastName}` : 
                         'A user';
        
        await projectRef.update({
            pendingRequests: admin.firestore.FieldValue.arrayUnion({
                userId,
                userName,
                requestedAt: admin.firestore.FieldValue.serverTimestamp(),
            }),
        });

        const creatorId = projectData.creatorId;
        if (creatorId) {
            const notificationMessage = `${userName} has requested to join your project "${projectData.title}".`;
            await createNotification(creatorId, userId, notificationMessage, 'project_join_request');
        }

        res.status(200).json({ message: 'Join request sent successfully.' });
    } catch (error) {
        console.error('Error sending join request:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// Admin route to get a list of all pending projects (Admin only)
router.get('/pending', verifyToken, async (req, res) => {
    if (!await isAdmin(req.user.uid)) {
        return res.status(403).json({ message: 'Forbidden: Only administrators can view pending projects.' });
    }
    
    try {
        const projectsSnapshot = await db.collection('projects')
            .where('status', '==', 'pending_approval')
            .orderBy('createdAt', 'asc')
            .get();

        const projects = projectsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
        }));

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching pending projects:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// Admin route to delete a project
router.delete('/:projectId', verifyToken, async (req, res) => {
    if (!await isAdmin(req.user.uid)) {
        return res.status(403).json({ message: 'Forbidden: Only administrators can delete projects.' });
    }

    const { projectId } = req.params;

    try {
        const projectRef = db.collection('projects').doc(projectId);
        await projectRef.delete();
        res.status(200).json({ message: 'Project deleted successfully.' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

export default router;