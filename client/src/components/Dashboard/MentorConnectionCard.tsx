import React from 'react';
import { FaUserGraduate, FaSpinner } from 'react-icons/fa';

interface MentorConnectionCardProps {
    mentorConnectionStatus: 'idle' | 'connecting' | 'success' | 'error';
    handleConnectWithMentor: () => void;
}

const MentorConnectionCard: React.FC<MentorConnectionCardProps> = ({ mentorConnectionStatus, handleConnectWithMentor }) => {
    const isConnecting = mentorConnectionStatus === 'connecting';
    const isSuccess = mentorConnectionStatus === 'success';

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-10 flex flex-col sm:flex-row items-center justify-between animate-fade-in transition-all duration-300 transform hover:scale-[1.01]">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="bg-blue-100 p-3 sm:p-4 rounded-full">
                    <FaUserGraduate className="text-blue-600 h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Connect with a Mentor</h3>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">Get personalized guidance and support on your application journey.</p>
                </div>
            </div>
            <button
                onClick={handleConnectWithMentor}
                className={`flex items-center space-x-2 py-2 px-4 sm:py-3 sm:px-6 rounded-full font-semibold transition-all duration-300 ${
                    isConnecting
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : isSuccess
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                }`}
                disabled={isConnecting || isSuccess}
            >
                {isConnecting && <FaSpinner className="animate-spin" />}
                <span>{isConnecting ? 'Connecting...' : isSuccess ? 'Connected!' : 'Find a Mentor'}</span>
            </button>
        </div>
    );
};

export default MentorConnectionCard;