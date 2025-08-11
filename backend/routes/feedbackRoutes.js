// routes/feedback.js

import express from 'express';
import Feedback from '../models/Feedback.js';

const router = express.Router();

// POST new feedback
router.post('/', async (req, res) => {
  try {
    const { userId, message } = req.body;
    const newFeedback = new Feedback({ userId, message });
    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully!' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;