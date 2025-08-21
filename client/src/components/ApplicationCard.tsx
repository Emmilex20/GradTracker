/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, forwardRef } from 'react';
import type { Application } from '../types/Application';
import { FaGraduationCap, FaCheckCircle, FaTimesCircle, FaPaperPlane, FaDollarSign, FaCalendarAlt, FaEllipsisV, FaGripLines } from 'react-icons/fa';

interface ApplicationCardProps {
    application: Application;
    onViewDetailsModal: (application: Application) => void;
    onViewDashboardSections: (application: Application) => void;
    isDragging: boolean;
    dragHandleProps?: any;
    draggableProps?: any;
}

const getStatusBgClass = (status: string) => {
    switch (status) {
        case 'Accepted':
            return 'bg-green-100 text-green-700';
        case 'Rejected':
            return 'bg-red-100 text-red-700';
        case 'Submitted':
            return 'bg-blue-100 text-blue-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const getStatusBorderClass = (status: string) => {
    switch (status) {
        case 'Accepted':
            return 'border-green-500';
        case 'Rejected':
            return 'border-red-500';
        case 'Submitted':
            return 'border-blue-500';
        default:
            return 'border-gray-500';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Accepted':
            return <FaCheckCircle className="text-green-500" />;
        case 'Rejected':
            return <FaTimesCircle className="text-red-500" />;
        case 'Submitted':
            return <FaPaperPlane className="text-blue-500" />;
        default:
            return <FaGraduationCap className="text-gray-500" />;
    }
};

const ApplicationCard = forwardRef<HTMLDivElement, ApplicationCardProps>(
    ({ application, onViewDetailsModal, onViewDashboardSections, isDragging, dragHandleProps, draggableProps }, ref) => {
        const [isMenuOpen, setIsMenuOpen] = useState(false);
        const menuRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleOutsideClick = (event: MouseEvent) => {
                if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                    setIsMenuOpen(false);
                }
            };

            document.addEventListener('mousedown', handleOutsideClick);
            return () => {
                document.removeEventListener('mousedown', handleOutsideClick);
            };
        }, []);

        const handleMenuToggle = (event: React.MouseEvent) => {
            event.stopPropagation();
            setIsMenuOpen(prev => !prev);
        };

        const handleViewDetails = (event: React.MouseEvent) => {
            event.stopPropagation();
            onViewDetailsModal(application);
            setIsMenuOpen(false);
        };

        const handleViewDashboard = (event: React.MouseEvent) => {
            event.stopPropagation();
            onViewDashboardSections(application);
            setIsMenuOpen(false);
        };

        const formattedDeadline = application.deadline && application.deadline.trim() !== ''
            ? new Date(application.deadline).toLocaleDateString()
            : 'N/A';
        const isDeadlineValid = !isNaN(new Date(application.deadline).getTime());
        const isFundingAmountPresent = application.fundingAmount && application.fundingAmount.trim() !== '';

        return (
            <div
                ref={ref}
                {...draggableProps}
                className={`
                    relative bg-white rounded-xl p-5 mb-4 border-l-4
                    shadow-md transition-all duration-300
                    hover:shadow-lg
                    ${isDragging ? 'shadow-xl scale-105 opacity-80' : ''}
                    ${getStatusBorderClass(application.status)}
                `}
            >
                {/* Drag Handle on the left side */}
                <span
                    {...dragHandleProps}
                    className="absolute top-1/2 -translate-y-1/2 left-0 pl-2 cursor-grab text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FaGripLines className="text-2xl" />
                </span>

                {/* Menu Toggle on the top right */}
                <div className="absolute top-2 right-2">
                    <button onClick={handleMenuToggle} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
                        <FaEllipsisV />
                    </button>
                </div>
                
                {/* Card Content */}
                <div className="flex justify-between items-start mb-4 pr-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{application.schoolName}</h3>
                        <p className="text-gray-600 text-sm mt-1">{application.programName}</p>
                    </div>
                </div>
                
                <div className="flex-shrink-0 mb-4">
                    <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBgClass(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span>{application.status}</span>
                    </span>
                </div>

                {(isDeadlineValid || isFundingAmountPresent) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        {isDeadlineValid && (
                            <div className="flex items-center text-sm text-gray-500">
                                <FaCalendarAlt className="mr-2 text-gray-400" />
                                <span className="font-semibold text-gray-700">Deadline:</span>
                                <span className="ml-1">{formattedDeadline}</span>
                            </div>
                        )}
                        {isFundingAmountPresent && (
                            <div className="flex items-center text-sm text-gray-500">
                                <FaDollarSign className="mr-2 text-gray-400" />
                                <span className="font-semibold text-gray-700">Funding:</span>
                                <span className="ml-1">{application.fundingAmount}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Menu */}
                {isMenuOpen && (
                    <div ref={menuRef} className="absolute top-10 right-2 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <button
                            onClick={handleViewDetails}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            View Details
                        </button>
                        <button
                            onClick={handleViewDashboard}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Email & Docs
                        </button>
                    </div>
                )}
            </div>
        );
    }
);

ApplicationCard.displayName = 'ApplicationCard';

export default ApplicationCard;