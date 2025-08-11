import React, { useState } from 'react';
import axios from 'axios';
import type { Application } from '../types/Application';
import EmailTracker from './EmailTracker';
import { FaTimes, FaEdit, FaTrashAlt, FaGraduationCap, FaLink, FaCalendarAlt, FaDollarSign, FaUserGraduate, FaFileAlt } from 'react-icons/fa';
import EmailForm from './EmailForm'; // Ensure this import is correct

const API_URL = import.meta.env.VITE_API_URL;

interface ApplicationDetailProps {
    application: Application;
    onClose: () => void;
    onDelete: (id: string) => void;
    onEdit: (application: Application) => void;
    onApplicationUpdated: () => void;
}

// Helper function to get status background color
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

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({ application, onClose, onDelete, onEdit, onApplicationUpdated }) => {
    const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
            try {
                await axios.delete(`${API_URL}/api/applications/${application._id}`);
                onDelete(application._id);
                onClose();
            } catch (err) {
                console.error('Failed to delete application:', err);
            }
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) {
            return 'No deadline set';
        }
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
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-gray-900 bg-opacity-70 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row transform scale-95 md:scale-100 transition-all duration-300 ease-in-out">
                    
                    {/* Left Column - Details */}
                    <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-gradient-to-br from-white to-blue-50">
                        {/* Header with Title and Close Button */}
                        <div className="flex justify-between items-start mb-6 border-b pb-4 border-gray-200">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{application.schoolName}</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-red-500 transition-colors text-2xl p-2 rounded-full hover:bg-gray-100"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Basic Information Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-gray-700 mt-4">
                            <div className="flex items-start space-x-3">
                                <FaGraduationCap className="text-xl text-blue-500 mt-1" />
                                <div>
                                    <span className="font-semibold text-gray-800 block">Program:</span>
                                    <span className="block">{application.programName || 'Not specified'}</span>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <FaCalendarAlt className="text-xl text-blue-500 mt-1" />
                                <div>
                                    <span className="font-semibold text-gray-800 block">Deadline:</span>
                                    <span className="block">{formatDate(application.deadline)}</span>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="font-semibold text-gray-800 block">Status:</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBgClass(application.status)}`}>
                                    {application.status}
                                </span>
                            </div>
                            {application.appLink && (
                                <div className="flex items-start space-x-3">
                                    <FaLink className="text-xl text-blue-500 mt-1" />
                                    <div>
                                        <span className="font-semibold text-gray-800 block">Application Link:</span>
                                        <a href={application.appLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all block transition-colors duration-200">
                                            Click here
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Funding & Waivers Section */}
                        <div className="mt-8 border-t pt-6 border-gray-200">
                            <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center space-x-2">
                                <FaDollarSign className="text-green-500" />
                                <span>Funding & Waivers</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-gray-700">
                                <div>
                                    <span className="font-semibold text-gray-800">Funding: </span>
                                    {application.funding || 'Not specified'}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-800">Funding Amount: </span>
                                    {application.fundingAmount || 'Not specified'}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-800">GRE Waiver: </span>
                                    {application.greWaiver || 'Not specified'}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-800">App Fee Waiver: </span>
                                    {application.appFeeWaiver || 'Not specified'}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-800">IELTS Waiver: </span>
                                    {application.ieltsWaiver || 'Not specified'}
                                </div>
                            </div>
                        </div>

                        {/* Required Documents Section */}
                        <div className="mt-8 border-t pt-6 border-gray-200">
                            <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center space-x-2">
                                <FaFileAlt className="text-blue-500" />
                                <span>Required Documents</span>
                            </h3>
                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                                {formatRequiredDocs(application.requiredDocs)}
                            </p>
                        </div>

                        {/* Notes Section */}
                        <div className="mt-8 border-t pt-6 border-gray-200">
                            <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center space-x-2">
                                <FaUserGraduate className="text-purple-500" />
                                <span>Notes</span>
                            </h3>
                            <p className="bg-gray-50 p-4 rounded-lg text-gray-700 leading-relaxed">{application.notes || 'No notes added.'}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t pt-6 border-gray-200">
                            <button
                                onClick={() => onEdit(application)}
                                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
                            >
                                <FaEdit />
                                <span>Edit</span>
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 transition-all transform hover:scale-105"
                            >
                                <FaTrashAlt />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Email Tracker */}
                    <div className="w-full md:w-96 flex-shrink-0 bg-gray-50 border-l border-gray-200 p-6 sm:p-8 overflow-y-auto">
                        <EmailTracker application={application} onEmailAdded={onApplicationUpdated} />
                    </div>

                </div>
            </div>

            {/* Email Form Modal (conditionally rendered) */}
            {isEmailFormOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
                    <EmailForm
                        to={application.contactEmail || 'No email specified'}
                        onClose={() => setIsEmailFormOpen(false)}
                    />
                </div>
            )}
        </>
    );
};

export default ApplicationDetail;