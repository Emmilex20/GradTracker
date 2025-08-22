// src/components/InterviewPrepForm.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaTimes, FaSave, FaSpinner, FaCalendarAlt } from 'react-icons/fa';
import type { Application } from '../types/Application';

const API_URL = import.meta.env.VITE_API_URL;

interface InterviewPrepFormProps {
    applications: Application[];
    onClose: () => void;
    onInterviewRequestSent: () => void;
}

const InterviewPrepForm: React.FC<InterviewPrepFormProps> = ({ applications, onClose, onInterviewRequestSent }) => {
    const { currentUser, token } = useAuth();
    const [selectedApplicationId, setSelectedApplicationId] = useState('');
    const [interviewDate, setInterviewDate] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!currentUser || !token) {
            setError('User not authenticated. Please log in.');
            return;
        }

        if (!selectedApplicationId || !interviewDate) {
            setError('Please select an application and a date.');
            return;
        }

        setLoading(true);

        const selectedApplication = applications.find(app => app._id === selectedApplicationId);
        if (!selectedApplication) {
            setError('Selected application not found.');
            setLoading(false);
            return;
        }

        const requestData = {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            applicationId: selectedApplication._id,
            schoolName: selectedApplication.schoolName,
            programName: selectedApplication.programName,
            interviewDate,
            notes,
            status: 'pending',
        };

        try {
            await axios.post(`${API_URL}/interview-prep/requests`, requestData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onInterviewRequestSent();
            onClose();
        } catch (err) {
            console.error('Failed to send interview prep request:', err);
            setError('Failed to send request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8 transform transition-all duration-300 scale-100 animate-slide-up-fade h-fit max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
                <h2 className="text-3xl font-extrabold text-gray-800 flex items-center">
                    <FaCalendarAlt className="mr-3 text-primary" /> Request Interview Prep
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-red-500 transition-colors text-2xl p-2 rounded-full hover:bg-gray-100"
                >
                    <FaTimes />
                </button>
            </div>
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Select Application</label>
                        <select
                            value={selectedApplicationId}
                            onChange={(e) => setSelectedApplicationId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                            required
                        >
                            <option value="">-- Choose an application --</option>
                            {applications.map(app => (
                                <option key={app._id} value={app._id}>
                                    {app.schoolName} - {app.programName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tentative Interview Date</label>
                        <input
                            type="date"
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                            rows={4}
                            placeholder="e.g., specific professor, type of interview (technical/behavioral), any specific questions you have."
                        />
                    </div>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-gray-600 font-bold rounded-full hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 disabled:bg-gray-400 disabled:transform-none disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <FaSave />
                                <span>Send Request</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InterviewPrepForm; 