// src/components/AdminDashboard.tsx

import React from 'react';
import { FaFileAlt } from 'react-icons/fa';
// Import the AdminReviewPage component
import AdminReviewPage from './AdminReviewPage';

const AdminDashboard: React.FC = () => {
    // The state for active tab is no longer needed since there's only one tab.
    // We can directly render the AdminReviewPage.

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Admin Dashboard</h1>

            {/* The tab navigation is removed as there is only one component to display. */}
            <div className="flex items-center px-4 py-2 font-medium text-sm text-blue-600 border-b-2 border-blue-600 mb-6">
                <FaFileAlt className="mr-2" /> Document Review
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Directly render the AdminReviewPage */}
                <AdminReviewPage />
            </div>
        </div>
    );
};

export default AdminDashboard;