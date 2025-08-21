import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import path from 'path';

// Import Firebase Admin from a single source
import { admin } from '../config/firebase-config.js';
import verifyToken from '../middleware/auth.js';

const router = Router();
const localUpload = multer({ dest: 'uploads/' });

// Helper function to extract text from a file
const extractText = async (filePath) => {
  const fileType = path.extname(filePath).toLowerCase();
  let content = '';
  try {
    const data = await fs.readFile(filePath);
    if (fileType === '.pdf') {
      const result = await pdfParse(data);
      content = result.text;
    } else if (fileType === '.docx') {
      const result = await mammoth.extractRawText({ buffer: data });
      content = result.value;
    } else {
      content = 'Unsupported file type.';
    }
  } catch (e) {
    console.error(`Error extracting text from ${filePath}:`, e);
    content = 'Extraction failed.';
  }
  return content;
};

// Placeholder for the AI model
const runPredictionModel = (sopText, transcriptText, cvText) => {
  const totalLength = sopText.length + transcriptText.length + cvText.length;
  const score = 30 + (totalLength % 65);
  return parseFloat(score.toFixed(2));
};

// The AI prediction endpoint
router.post('/predict', verifyToken, localUpload.fields([
  { name: 'sop', maxCount: 1 },
  { name: 'transcript', maxCount: 1 },
  { name: 'cv', maxCount: 1 }
]), async (req, res) => {
  const { user } = req;
  const files = req.files;

  if (!files || !files.sop || !files.transcript || !files.cv) {
    return res.status(400).json({ error: 'Missing one or more files (sop, transcript, cv)' });
  }

  try {
    const sopFilePath = files.sop[0].path;
    const transcriptFilePath = files.transcript[0].path;
    const cvFilePath = files.cv[0].path;

    const sopText = await extractText(sopFilePath);
    const transcriptText = await extractText(transcriptFilePath);
    const cvText = await extractText(cvFilePath);

    const predictionScore = runPredictionModel(sopText, transcriptText, cvText);

    await admin.firestore().collection('predictions').add({
      userId: user.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      sop_summary: sopText.substring(0, 100) + '...',
      transcript_summary: transcriptText.substring(0, 100) + '...',
      cv_summary: cvText.substring(0, 100) + '...',
      predicted_score: predictionScore,
    });

    await Promise.all([
      fs.unlink(sopFilePath),
      fs.unlink(transcriptFilePath),
      fs.unlink(cvFilePath)
    ]);

    res.json({ score: predictionScore });
  } catch (error) {
    console.error('Prediction endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;