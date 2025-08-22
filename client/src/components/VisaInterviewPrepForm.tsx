/* eslint-disable no-irregular-whitespace */
// src/components/VisaInterviewPrepForm.tsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaTimes, FaCalendarAlt, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface VisaInterviewPrepFormProps {
    onClose: () => void;
    onVisaRequestSent: () => void;
}

const VisaInterviewPrepForm: React.FC<VisaInterviewPrepFormProps> = ({ onClose, onVisaRequestSent }) => {
    const { currentUser, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [embassyName, setEmbassyName] = useState('');
    const [description, setDescription] = useState('');
    const [country, setCountry] = useState('');
    const [visaType, setVisaType] = useState('');
    const [interviewDate, setInterviewDate] = useState('');


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !token) {
            alert('You must be logged in to submit a request.');
            return;
        }

        setIsLoading(true);

        try {
            // Send the request to your backend API
            const requestData = {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                country,
                embassy: embassyName,
                visaType,
                interviewDate,
                notes: description,
            };
            
            await axios.post(`${API_URL}/visa-prep/requests`, requestData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            onVisaRequestSent();
        } catch (error) {
            console.error('Error sending visa prep request:', error);
            alert('Failed to send visa prep request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors text-2xl p-2 rounded-full hover:bg-gray-100"
                >
                    <FaTimes />
                </button>
                <h2 className="text-2xl font-bold text-secondary mb-4 flex items-center">
                    <FaCalendarAlt className="mr-2 text-primary" /> Request Visa Interview Prep
                </h2>
                <p className="text-neutral-dark mb-6">
                    Fill out the form below to request a one-on-one visa interview preparation session.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="country" className="block text-sm font-semibold text-gray-700">
                            Country
                        </label>
                        <input
                            type="text"
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out p-3 border"
                            placeholder="e.g., United States"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="embassyName" className="block text-sm font-semibold text-gray-700">
                            Embassy Name
                        </label>
                        <input
                            type="text"
                            id="embassyName"
                            value={embassyName}
                            onChange={(e) => setEmbassyName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out p-3 border"
                            placeholder="e.g., U.S. Embassy, London"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="visaType" className="block text-sm font-semibold text-gray-700">
                            Visa Type
                        </label>
                        <input
                            type="text"
                            id="visaType"
                            value={visaType}
                            onChange={(e) => setVisaType(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out p-3 border"
                            placeholder="e.g., F-1 Student Visa"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="interviewDate" className="block text-sm font-semibold text-gray-700">
                            Interview Date
                        </label>
                        <input
                            type="date"
                            id="interviewDate"
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out p-3 border"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                            Description of your case
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out p-3 border"
                            placeholder="e.g., F-1 visa for the United States, I'm concerned about answering questions about my financial sponsors."
                            required
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        {isLoading ? 'Sending Request...' : 'Send Request'}
                        <FaPaperPlane className="ml-2" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VisaInterviewPrepForm;