/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    type User,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    getAdditionalUserInfo,
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

export type UserRole = 'user' | 'mentor' | 'admin';

// --- UPDATED: UserProfile interface to match Firestore schema ---
export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    mentorId: string | null;
    isConnectedToMentor: boolean;
    notificationSettings: {
        email: boolean;
        push: boolean;
    };
}

// --- UPDATED: UserProfileUpdate type for the `saveUserProfile` function ---
export type UserProfileUpdate = {
    firstName: string;
    lastName: string;
    role: UserRole;
    email: string;
    notificationSettings: {
        email: boolean;
        push: boolean;
    };
};

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    token: string | null;
    showProfileModal: boolean;
    login: (email: string, password: string) => Promise<any>;
    signup: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<any>;
    // --- UPDATED: `saveUserData` now accepts the new notificationSettings object
    saveUserData: (uid: string, data: Omit<UserProfile, 'role' | 'mentorId' | 'isConnectedToMentor'>) => Promise<void>;
    saveUserProfile: (uid: string, data: UserProfileUpdate) => Promise<void>;
    sendPasswordResetEmail: (email: string) => Promise<void>;
    setShowProfileModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [token, setToken] = useState<string | null>(null);
    const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

    const googleProvider = new GoogleAuthProvider();

    const signup = async (email: string, password: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('token', token);
        setToken(token);
        return userCredential;
    };

    const login = async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('token', token);
        setToken(token);
        return userCredential;
    };

    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const token = await result.user.getIdToken();
        localStorage.setItem('token', token);
        setToken(token);

        const additionalUserInfo = getAdditionalUserInfo(result);
        if (additionalUserInfo?.isNewUser) {
            console.log('New user signed up with Google!');
            setShowProfileModal(true);
        }

        return result;
    };

    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem('token');
        setToken(null);
    };

    // --- UPDATED: saveUserData function to handle new schema
    const saveUserData = async (uid: string, data: Omit<UserProfile, 'role' | 'mentorId' | 'isConnectedToMentor'>) => {
        try {
            if (db) {
                const userDataWithDefaults = {
                    ...data,
                    role: 'user' as const,
                    mentorId: null,
                    isConnectedToMentor: false,
                };
                await setDoc(doc(db, 'users', uid), userDataWithDefaults);
                setUserProfile(userDataWithDefaults as UserProfile);
            }
        } catch (error) {
            console.error("Error writing document: ", error);
        }
    };
    
    // --- UPDATED: saveUserProfile function to handle new schema
    const saveUserProfile = async (uid: string, data: UserProfileUpdate) => {
        try {
            if (db) {
                const userDocRef = doc(db, 'users', uid);
                // The `data` object now includes notificationSettings, role, etc.
                await setDoc(userDocRef, data, { merge: true });
                
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserProfile(userDocSnap.data() as UserProfile);
                }
            }
        } catch (error: any) {
            console.error("Error updating user profile: ", error);
        }
    };

    const sendPasswordResetEmail = (email: string) => {
        return firebaseSendPasswordResetEmail(auth, email);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
            setCurrentUser(user);
            if (user && db) {
                const idToken = await user.getIdToken();
                setToken(idToken);
                localStorage.setItem('token', idToken);

                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserProfile(userDocSnap.data() as UserProfile);
                } else {
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
                setToken(null);
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
        token,
        showProfileModal,
        login,
        signup,
        logout,
        loginWithGoogle,
        saveUserData,
        saveUserProfile,
        sendPasswordResetEmail,
        setShowProfileModal,
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