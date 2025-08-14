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

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    receiveNotifications: boolean; // New property
}

// Define the type for the data being passed to the profile update function
export type UserProfileUpdate = {
    firstName: string;
    lastName: string;
    role: UserRole;
    email: string;
    receiveNotifications: boolean;
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
    saveUserData: (uid: string, data: Omit<UserProfile, 'role'>) => Promise<void>;
    saveUserProfile: (uid: string, data: UserProfileUpdate) => Promise<void>; // Corrected function signature
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

    const saveUserData = async (uid: string, data: Omit<UserProfile, 'role'>) => {
        try {
            if (db) {
                const userDataWithRole = { ...data, role: 'user' as const };
                await setDoc(doc(db, 'users', uid), userDataWithRole);
                setUserProfile(userDataWithRole as UserProfile);
            }
        } catch (error) {
            console.error("Error writing document: ", error);
        }
    };
    
    // Corrected function signature to accept all required fields
    const saveUserProfile = async (uid: string, data: UserProfileUpdate) => {
        try {
            if (db) {
                const userDocRef = doc(db, 'users', uid);
                // Use `merge: true` to combine new data with existing data, such as `email` from Auth
                await setDoc(userDocRef, data, { merge: true });
                
                // Get the updated profile to reflect changes immediately
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