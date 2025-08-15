// src/components/AdminDashboard.tsx

import React from 'react';
import { FaFileAlt, FaBullhorn } from 'react-icons/fa';
import AdminReviewPage from './AdminReviewPage';
import AdminNotificationForm from '../components/AdminDashboard/AdminNotificationForm';

const AdminDashboard: React.FC = () => {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section for Sending Notifications */}
                <div>
                    <div className="flex items-center px-4 py-2 font-medium text-sm text-blue-600 border-b-2 border-blue-600 mb-6">
                        <FaBullhorn className="mr-2" /> Global Notifications
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <AdminNotificationForm />
                    </div>
                </div>

                {/* Section for Document Review */}
                <div>
                    <div className="flex items-center px-4 py-2 font-medium text-sm text-blue-600 border-b-2 border-blue-600 mb-6">
                        <FaFileAlt className="mr-2" /> Document Review
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <AdminReviewPage />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;