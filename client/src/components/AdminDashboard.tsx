// src/components/AdminDashboard.tsx

import React, { useState } from 'react';
import { FaFileAlt, FaBullhorn, FaPenFancy, FaTasks } from 'react-icons/fa'; // Import FaTasks icon
import AdminReviewPage from './AdminReviewPage';
import AdminNotificationForm from '../components/AdminDashboard/AdminNotificationForm';
import AdminSOPRequests from './AdminDashboard/AdminSOPRequests';
import AdminProjectReview from './AdminDashboard/AdminProjectReview'; // Import the new component

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('sopRequests');

    const renderContent = () => {
        switch (activeTab) {
            case 'sopRequests':
                return <AdminSOPRequests />;
            case 'documentReview':
                return <AdminReviewPage />;
            case 'notifications':
                return <AdminNotificationForm />;
            case 'projectReview': // New case for project review
                return <AdminProjectReview />;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Admin Dashboard</h1>

            {/* Tab Navigation */}
            <div className="flex flex-wrap mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('sopRequests')}
                    className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === 'sopRequests'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaPenFancy className="inline mr-2" /> SOP Requests
                </button>
                <button
                    onClick={() => setActiveTab('documentReview')}
                    className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === 'documentReview'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaFileAlt className="inline mr-2" /> Document Review
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === 'notifications'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaBullhorn className="inline mr-2" /> Global Notifications
                </button>
                <button
                    onClick={() => setActiveTab('projectReview')} // New button for project review
                    className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === 'projectReview'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaTasks className="inline mr-2" /> Project Reviews
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;