// /server/src/auth/googleAuth.js

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import 'dotenv/config';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL, 
  scope: [
    'profile', 
    'email', 
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly'
  ]
}, (accessToken, refreshToken, profile, done) => {
  const user = {
    googleId: profile.id,
    displayName: profile.displayName,
    accessToken,
    refreshToken,
    email: profile.emails[0].value,
  };
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;