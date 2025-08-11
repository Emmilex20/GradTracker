/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from 'firebase/auth';

import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'; // Import getDoc

import { auth } from '../firebase';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCX2B7vcjvOxnN4BbAzSbBNNwLFKt8Fjj4",
  authDomain: "grad-tracker-app.firebaseapp.com",
  projectId: "grad-tracker-app",
  storageBucket: "grad-tracker-app.firebasestorage.app",
  messagingSenderId: "533399239376",
  appId: "1:533399239376:web:55f4e35c20a1624f73fcd5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Define the UserProfile interface
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null; // Added userProfile to the context type
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<any>;
  loginWithPhoneNumber: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  saveUserData: (uid: string, data: UserProfile) => Promise<void>; // Updated type
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // New state for user profile
  const [loading, setLoading] = useState<boolean>(true);

  const googleProvider = new GoogleAuthProvider();

  const signup = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const loginWithPhoneNumber = (phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  const logout = () => {
    return signOut(auth);
  };

  // New function to save user data to Firestore
  const saveUserData = async (uid: string, data: UserProfile) => {
    try {
      await setDoc(doc(db, 'users', uid), data);
      setUserProfile(data); // Set profile state after saving
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  };

  // New function to handle password reset
  const sendPasswordResetEmail = (email: string) => {
    return firebaseSendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setCurrentUser(user);
      if (user) {
        // If a user is logged in, fetch their profile from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile, // Add userProfile to the context value
    login,
    signup,
    logout,
    loginWithGoogle,
    loginWithPhoneNumber,
    saveUserData,
    sendPasswordResetEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};