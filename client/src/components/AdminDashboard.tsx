// src/pages/AdminDashboard.tsx

import React, { useState } from 'react';
import { 
    FaFileAlt, 
    FaBullhorn, 
    FaPenFancy, 
    FaTasks, 
    FaCalendarCheck, 
    FaPassport, 
    FaMoneyBillWave, 
    FaFilePdf,
    FaBars, 
    FaTimes 
} from 'react-icons/fa';
import AdminReviewPage from './AdminReviewPage';
import AdminNotificationForm from './AdminDashboard/AdminNotificationForm';
import AdminSOPRequests from './AdminDashboard/AdminSOPRequests';
import AdminProjectReview from './AdminDashboard/AdminProjectReview';
import AdminInterviewPrepRequests from './AdminDashboard/AdminInterviewPrepRequests';
import AdminVisaPrepRequests from './AdminDashboard/AdminVisaPrepRequests';
import AdminFinancialSupportRequests from './AdminDashboard/AdminFinancialSupportRequests';
import AdminAcademicCVService from './AdminDashboard/AdminAcademicCVService';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('sopRequests');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case 'sopRequests':
                return <AdminSOPRequests />;
            case 'documentReview':
                return <AdminReviewPage />;
            case 'notifications':
                return <AdminNotificationForm />;
            case 'projectReview':
                return <AdminProjectReview />;
            case 'interviewPrepRequests':
                return <AdminInterviewPrepRequests />;
            case 'visaPrepRequests':
                return <AdminVisaPrepRequests />;
            case 'financialSupportRequests':
                return <AdminFinancialSupportRequests />;
            case 'academicCVService':
                return <AdminAcademicCVService />;
            default:
                return null;
        }
    };

    const navItems = [
        { name: 'SOP Requests', key: 'sopRequests', icon: <FaPenFancy /> },
        { name: 'Document Review', key: 'documentReview', icon: <FaFileAlt /> },
        { name: 'Global Notifications', key: 'notifications', icon: <FaBullhorn /> },
        { name: 'Project Reviews', key: 'projectReview', icon: <FaTasks /> },
        { name: 'Interview Prep', key: 'interviewPrepRequests', icon: <FaCalendarCheck /> },
        { name: 'Visa Prep', key: 'visaPrepRequests', icon: <FaPassport /> },
        { name: 'Financial Support', key: 'financialSupportRequests', icon: <FaMoneyBillWave /> },
        { name: 'Academic CV Service', key: 'academicCVService', icon: <FaFilePdf /> },
    ];

    const handleTabClick = (key: string) => {
        setActiveTab(key);
        setIsSidebarOpen(false);
    };

    return (
        <div className="bg-gray-100 mt-24 min-h-screen flex">
            {/* Mobile Menu Button (visible only when sidebar is closed) */}
            {!isSidebarOpen && (
                <div className="md:hidden fixed top-0 left-0 z-50 p-4">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-gray-800 mt-16 bg-white rounded-md shadow"
                    >
                        <FaBars size={20} />
                    </button>
                </div>
            )}

            {/* Sidebar Navigation */}
            <div className={`
                fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
                w-64 bg-gray-800 text-white p-6 mt-12 lg:-mt-8 flex flex-col z-40
            `}>
                {/* Close Button on the right inside the sidebar */}
                <div className="flex justify-between items-center mb-8">
                    <div className="text-2xl font-bold">Admin Portal</div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)} 
                        className="md:hidden p-2 text-gray-300 hover:text-white"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>
                
                <nav>
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.key}>
                                <button
                                    onClick={() => handleTabClick(item.key)}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors duration-200 ${
                                        activeTab === item.key
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    <span className="mr-3 text-lg">{item.icon}</span>
                                    <span className="font-medium">{item.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 p-8 overflow-y-auto ${isSidebarOpen ? 'ml-64' : ''} md:ml-0 transition-all duration-300 ease-in-out`}>
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {navItems.find(item => item.key === activeTab)?.name}
                    </h1>
                    <p className="text-gray-500 mt-1">Manage all requests and services from here.</p>
                </header>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;