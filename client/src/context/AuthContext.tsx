/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    type User,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { auth } from '../firebase';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;

if (!firebaseConfig.apiKey) {
    console.error("Firebase config is missing environment variables. App will not be initialized.");
} else {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
}

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    token: string | null; // <-- Added token to the interface
    login: (email: string, password: string) => Promise<any>;
    signup: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<any>;
    saveUserData: (uid: string, data: Omit<UserProfile, 'role'>) => Promise<void>;
    sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [token, setToken] = useState<string | null>(null); // <-- Added state for the token

    const googleProvider = new GoogleAuthProvider();

    const signup = async (email: string, password: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('token', token);
        setToken(token); // Set the new token
        return userCredential;
    };

    const login = async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('token', token);
        setToken(token); // Set the new token
        return userCredential;
    };

    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const token = await result.user.getIdToken();
        localStorage.setItem('token', token);
        setToken(token); // Set the new token
        return result;
    };

    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem('token');
        setToken(null); // Clear the token state on logout
    };

    const saveUserData = async (uid: string, data: Omit<UserProfile, 'role'>) => {
        try {
            if (db) {
                const userDataWithRole = { ...data, role: 'user' as const };
                await setDoc(doc(db, 'users', uid), userDataWithRole);
                setUserProfile(userDataWithRole);
            }
        } catch (error) {
            console.error("Error writing document: ", error);
        }
    };

    const sendPasswordResetEmail = (email: string) => {
        return firebaseSendPasswordResetEmail(auth, email);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
            setCurrentUser(user);
            if (user && db) {
                // Get the ID token for the authenticated user
                const idToken = await user.getIdToken();
                setToken(idToken); // Set the token state
                localStorage.setItem('token', idToken); // Keep local storage in sync

                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserProfile(userDocSnap.data() as UserProfile);
                } else {
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
                setToken(null); // Clear token on user logout/null
                localStorage.removeItem('token');
            }
            setLoading(false);
        });
        
        return unsubscribe;
    }, []);

    const value: AuthContextType = {
        currentUser,
        userProfile,
        loading,
        token, // <-- Provided the new token state
        login,
        signup,
        logout,
        loginWithGoogle,
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