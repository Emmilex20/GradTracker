// src/components/ProfileSetupModal.tsx

import React, { useState, useEffect } from 'react';
import { useAuth, type UserRole } from '../context/AuthContext';

const ProfileSetupModal: React.FC = () => {
    const { currentUser, showProfileModal, setShowProfileModal, saveUserProfile } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [receiveNotifications, setReceiveNotifications] = useState(true);
    const role: UserRole = 'user'; 
    const [loading, setLoading] = useState(false);

    // Pre-populate the email field from the current user's data
    useEffect(() => {
        if (currentUser && currentUser.email) {
            setEmail(currentUser.email);
        }
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !firstName || !lastName || !email) {
            alert('Please fill out all required fields.');
            return;
        }

        setLoading(true);
        try {
            await saveUserProfile(currentUser.uid, {
                firstName,
                lastName,
                email,
                role,
                receiveNotifications,
            });
            setShowProfileModal(false); // Close modal on success
        } catch (error) {
            console.error('Failed to save user profile:', error);
            alert('Failed to save your profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!showProfileModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Complete your profile</h2>
                <p className="mb-4">
                    Please provide your first name, last name, and preferences to continue.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            readOnly // Email is read-only for Google sign-ups
                            className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            id="receiveNotifications"
                            checked={receiveNotifications}
                            onChange={(e) => setReceiveNotifications(e.target.checked)}
                            className="mr-2"
                            disabled={loading}
                        />
                        <label htmlFor="receiveNotifications" className="text-sm font-medium">
                            I would like to receive email notifications.
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white p-2 rounded-md font-semibold hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {loading ? 'Saving...' : 'Save and Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetupModal;