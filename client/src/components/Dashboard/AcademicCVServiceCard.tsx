/* eslint-disable no-irregular-whitespace */
// src/components/Dashboard/AcademicCVServiceCard.tsx
import React from 'react';
import { FaFileAlt, FaCalendarAlt, FaDownload, FaVideo } from 'react-icons/fa';

interface AcademicCVServiceCardProps {
    onRequestCVService: () => void;
    requestStatus: 'pending' | 'scheduled' | 'completed' | 'none'; // Add a status prop
    scheduledDate?: string; // Optional scheduled date
    scheduledTime?: string; // NEW: Optional scheduled time
    zoomLink?: string; // NEW: Optional Zoom link
    downloadUrl?: string; // Optional download URL for the CV file
}

const AcademicCVServiceCard: React.FC<AcademicCVServiceCardProps> = ({ 
    onRequestCVService, 
    requestStatus, 
    scheduledDate,
    scheduledTime,
    zoomLink,
    downloadUrl 
}) => {
    // === Logic to render based on status ===
    const renderContent = () => {
        switch (requestStatus) {
            case 'pending':
                return (
                    <div className="flex items-center space-x-2 text-neutral-dark">
                        <FaFileAlt className="animate-pulse text-yellow-500" />
                        <span>Request submitted. An admin will contact you shortly.</span>
                    </div>
                );
            case 'scheduled':
                return (
                    <div className="flex flex-col space-y-2 text-neutral-dark">
                        <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-primary" />
                            <span className="font-semibold">Scheduled:</span>
                            <span>{scheduledDate ? `${scheduledDate} at ${scheduledTime}` : 'Date to be confirmed'}</span>
                        </div>
                        {zoomLink && (
                            <a 
                                href={zoomLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-primary hover:underline"
                            >
                                <FaVideo />
                                <span>Join Zoom Meeting</span>
                            </a>
                        )}
                    </div>
                );
            case 'completed':
                return (
                    <div className="flex items-center space-x-2">
                        <FaDownload className="text-green-500" />
                        <span className="font-semibold text-neutral-dark">Your CV is ready!</span>
                        {downloadUrl && (
                            <a 
                                href={downloadUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-primary text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                            >
                                Download CV
                            </a>
                        )}
                    </div>
                );
            default: // 'none'
                return (
                    <button
                        onClick={onRequestCVService}
                        className="bg-primary text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 w-full sm:w-auto"
                    >
                        <span>Request Service</span>
                        <FaFileAlt />
                    </button>
                );
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-6 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 transform hover:scale-[1.01]">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
                <h3 className="text-lg sm:text-xl font-bold text-secondary flex items-center">
                    <FaFileAlt className="mr-2 text-primary" /> Academic CV Writing Service
                </h3>
                <p className="text-neutral-dark mt-1 text-sm sm:text-base">
                    Request a professional review and writing service for your Academic CV.
                </p>
            </div>
            <div className="mt-4 sm:mt-0 w-full sm:w-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default AcademicCVServiceCard;