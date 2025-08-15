import React from 'react';
import axios from 'axios';
import type { Application } from '../types/Application';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook
import { FaTimes, FaEdit, FaTrashAlt, FaGraduationCap, FaLink, FaCalendarAlt, FaDollarSign, FaUserGraduate, FaFileAlt } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface ApplicationDetailProps {
    application: Application;
    onClose: () => void;
    onDelete: (id: string) => void;
    onEdit: () => void;
    onApplicationUpdated: () => void;
}

const getStatusBgClass = (status: string) => {
    switch (status) {
        case 'Accepted':
            return 'bg-green-600 text-white';
        case 'Rejected':
            return 'bg-red-600 text-white';
        case 'Submitted':
            return 'bg-purple-600 text-white';
        case 'Applying':
            return 'bg-yellow-400 text-yellow-900';
        default:
            return 'bg-blue-600 text-white';
    }
};

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({ application, onClose, onDelete, onEdit }) => {
    // CORRECTED: Get the authentication token from the AuthContext
    const { token } = useAuth();

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
            try {
                // CORRECTED: Include the Authorization header with the token
                await axios.delete(
                    `${API_URL}/applications/${application._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                onDelete(application._id);
                onClose();
            } catch (err) {
                console.error('Failed to delete application:', err);
                // You might want to add a user-facing error message here
            }
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'No deadline set';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    };

    const formatRequiredDocs = (docs: string[] | string): string => {
        if (Array.isArray(docs)) {
            return docs.join(', ');
        }
        return docs || 'Not specified';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-gray-900 bg-opacity-70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform scale-95 transition-all duration-300 ease-in-out">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 md:p-8 border-b border-gray-200">
                    <div className="flex-1 mb-2 sm:mb-0">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                            {application.schoolName}
                        </h2>
                        <p className="text-md sm:text-lg text-blue-600 mt-1 flex items-center space-x-2">
                            <FaGraduationCap />
                            <span>{application.programName}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                        <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-md ${getStatusBgClass(application.status)}`}>
                            {application.status}
                        </span>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-red-500 transition-colors text-2xl sm:text-3xl p-2 rounded-full hover:bg-gray-100"
                            title="Close"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8 overflow-y-auto">
                    
                    {/* Key Information Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-2xl shadow-inner p-4 sm:p-6 border-l-4 border-blue-500">
                        <div className="flex items-start space-x-4">
                            <FaCalendarAlt className="text-2xl text-blue-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-500">Deadline</p>
                                <p className="text-lg font-semibold text-gray-900">{formatDate(application.deadline)}</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <FaDollarSign className="text-2xl text-green-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-500">Funding</p>
                                <p className="text-lg font-semibold text-gray-900">{application.funding || 'Not specified'}</p>
                            </div>
                        </div>
                        {application.appLink && (
                            <div className="flex items-start space-x-4 col-span-full">
                                <FaLink className="text-2xl text-purple-500 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500">Application Link</p>
                                    <a href={application.appLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline transition-colors duration-200 truncate block max-w-full">
                                        {application.appLink}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Required Documents & Waivers Card */}
                    <div className="bg-gray-50 rounded-2xl shadow-inner p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                            <FaFileAlt className="text-blue-500" />
                            <span>Required Documents & Waivers</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-gray-700 text-sm">
                            <div><span className="font-semibold text-gray-800">Required:</span> {formatRequiredDocs(application.requiredDocs)}</div>
                            <div><span className="font-semibold text-gray-800">GRE Waiver:</span> {application.greWaiver || 'N/A'}</div>
                            <div><span className="font-semibold text-gray-800">IELTS Waiver:</span> {application.ieltsWaiver || 'N/A'}</div>
                            <div><span className="font-semibold text-gray-800">App Fee Waiver:</span> {application.appFeeWaiver || 'N/A'}</div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-gray-50 rounded-2xl shadow-inner p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                            <FaUserGraduate className="text-purple-500" />
                            <span>Notes</span>
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-sm">{application.notes || 'No notes added.'}</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                        <button
                            onClick={onEdit}
                            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 text-sm"
                        >
                            <FaEdit />
                            <span>Edit Application</span>
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 transition-all transform hover:scale-105 text-sm"
                        >
                            <FaTrashAlt />
                            <span>Delete Application</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetail;