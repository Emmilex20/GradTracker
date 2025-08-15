// src/components/MentorSelectionModal.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaSpinner, FaUserGraduate } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

interface Mentor {
    id: string;
    firstName: string;
    lastName: string;
}

interface MentorSelectionModalProps {
    onClose: () => void;
    onSendRequest: (mentorId: string) => Promise<void>;
}

const MentorSelectionModal: React.FC<MentorSelectionModalProps> = ({ onClose, onSendRequest }) => {
    const { token } = useAuth();
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMentors = async () => {
            if (!token) {
                setError('Authentication token is missing.');
                setIsLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${API_URL}/mentors`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMentors(response.data);
            } catch (err) {
                console.error('Error fetching mentors:', err);
                setError('Failed to load mentors.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMentors();
    }, [token]);

    const handleSendRequest = async (mentorId: string) => {
        await onSendRequest(mentorId);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-2/3 lg:w-1/2 max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold">Select a Mentor</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FaTimes />
                    </button>
                </div>
                <div className="p-4 flex-grow overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <FaSpinner className="animate-spin text-blue-500 text-3xl" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500">{error}</div>
                    ) : mentors.length > 0 ? (
                        <ul className="space-y-4">
                            {mentors.map(mentor => (
                                <li key={mentor.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <FaUserGraduate className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{mentor.firstName} {mentor.lastName}</p>
                                            <p className="text-sm text-gray-500">Available for connection</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSendRequest(mentor.id)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition-colors"
                                    >
                                        Send Request
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-gray-500">No mentors are currently available.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MentorSelectionModal;