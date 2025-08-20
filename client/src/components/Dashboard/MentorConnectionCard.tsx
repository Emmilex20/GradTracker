// src/components/Dashboard/MentorConnectionCard.tsx

import React, { useState } from 'react';
import { FaUserGraduate, FaSpinner, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import MentorSelectionModal from '../MentorSelectionModal';

interface MentorRequest {
    id: string;
    mentorId: string;
    mentorName: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
}

interface MentorConnectionCardProps {
    currentRequests: MentorRequest[];
    loadingRequests: boolean;
    onSendRequest: (mentorId: string) => Promise<void>;
}

const MentorConnectionCard: React.FC<MentorConnectionCardProps> = ({ currentRequests, loadingRequests, onSendRequest }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const pendingRequest = currentRequests.find(req => req.status === 'pending');
    const acceptedRequest = currentRequests.find(req => req.status === 'accepted');

    const renderButton = () => {
        if (loadingRequests) {
            return (
                <button
                    disabled
                    className="flex items-center space-x-2 py-2 px-4 sm:py-3 sm:px-6 rounded-full font-semibold bg-gray-400 text-white cursor-not-allowed"
                >
                    <FaSpinner className="animate-spin" />
                    <span>Loading...</span>
                </button>
            );
        }

        if (acceptedRequest) {
            return (
                <div className="flex items-center space-x-2 text-green-600 font-semibold">
                    <FaCheckCircle className="h-6 w-6" />
                    <span>Connected with {acceptedRequest.mentorName}!</span>
                </div>
            );
        }

        if (pendingRequest) {
            return (
                <div className="flex items-center space-x-2 text-yellow-600 font-semibold">
                    <FaHourglassHalf className="h-6 w-6" />
                    <span>Request Pending...</span>
                </div>
            );
        }

        return (
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 py-2 px-4 sm:py-3 sm:px-6 rounded-full font-semibold transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105"
            >
                <span>Find a Mentor</span>
            </button>
        );
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-10 sm:p-8 mb-6 sm:mb-10 flex flex-col sm:flex-row items-center justify-between animate-fade-in transition-all duration-300 transform hover:scale-[1.01]">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className="bg-blue-100 p-3 sm:p-4 rounded-full">
                        <FaUserGraduate className="text-blue-600 h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Connect with a Mentor</h3>
                        <p className="text-gray-500 mt-1 text-sm sm:text-base">Get personalized guidance and support on your application journey.</p>
                    </div>
                </div>
                {renderButton()}
            </div>

            {isModalOpen && <MentorSelectionModal onClose={() => setIsModalOpen(false)} onSendRequest={onSendRequest} />}
        </>
    );
};

export default MentorConnectionCard;