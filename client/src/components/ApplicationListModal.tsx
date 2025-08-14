import React from 'react';
import type { Application } from '../types/Application';
import { FaTimes } from 'react-icons/fa';

interface ApplicationListModalProps {
    isOpen: boolean;
    onClose: () => void;
    applications: Application[];
    status: string;
}

const ApplicationListModal: React.FC<ApplicationListModalProps> = ({ isOpen, onClose, applications, status }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-6 w-11/12 md:w-1/2 lg:w-1/3 bg-white rounded-xl shadow-lg transform transition-all duration-300 scale-100">
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    onClick={onClose}
                >
                    <FaTimes />
                </button>
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                    {status} Applications ({applications.length})
                </h3>
                <ul className="space-y-3 max-h-80 overflow-y-auto">
                    {applications.map((app) => (
                        <li key={app._id} className="p-3 bg-gray-100 rounded-lg shadow-sm">
                            <p className="font-semibold text-sm text-gray-700">{app.programName}</p>
                            <p className="text-xs text-gray-500">{app.schoolName}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ApplicationListModal;