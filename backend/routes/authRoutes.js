// server/src/routes/authRoutes.js (ESM)

import { Router } from 'express';
import passport from '../auth/googleAuth.js';

const router = Router();

router.get('/google', passport.authenticate('google', { accessType: 'offline', prompt: 'consent' }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }), 
  (req, res) => {
    res.redirect('http://localhost:3000/dashboard'); 
  }
);

export default router;