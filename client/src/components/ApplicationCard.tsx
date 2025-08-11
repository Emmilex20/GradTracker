/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import type { Application } from '../types/Application';
import { FaGraduationCap, FaCheckCircle, FaTimesCircle, FaPaperPlane, FaHourglassHalf, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';

interface ApplicationCardProps {
    application: Application;
    onClick: () => void;
    isDragging: boolean;
    dragHandleProps?: any;
}

// Map status to a Tailwind CSS background color class
const getStatusBgClass = (status: string) => {
    switch (status) {
        case 'Accepted':
            return 'bg-green-100 text-green-700';
        case 'Rejected':
            return 'bg-red-100 text-red-700';
        case 'Submitted':
            return 'bg-blue-100 text-blue-700';
        case 'Applying':
            return 'bg-yellow-100 text-yellow-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

// Map status to a Tailwind CSS border color class
const getStatusBorderClass = (status: string) => {
    switch (status) {
        case 'Accepted':
            return 'border-green-500';
        case 'Rejected':
            return 'border-red-500';
        case 'Submitted':
            return 'border-blue-500';
        case 'Applying':
            return 'border-yellow-500';
        default:
            return 'border-gray-500';
    }
};

// Map status to an appropriate icon
const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Accepted':
            return <FaCheckCircle className="text-green-500" />;
        case 'Rejected':
            return <FaTimesCircle className="text-red-500" />;
        case 'Submitted':
            return <FaPaperPlane className="text-blue-500" />;
        case 'Applying':
            return <FaHourglassHalf className="text-yellow-500 animate-pulse" />;
        default:
            return <FaGraduationCap className="text-gray-500" />;
    }
};

const ApplicationCard = React.forwardRef<HTMLDivElement, ApplicationCardProps>(
    ({ application, onClick, isDragging, ...props }, ref) => {
        // Safely format the deadline date.
        // It checks if the deadline string is not empty and can be successfully parsed into a valid date.
        const formattedDeadline = application.deadline && application.deadline.trim() !== ''
            ? new Date(application.deadline).toLocaleDateString()
            : 'N/A';

        // Check for a valid date after parsing.
        const isDeadlineValid = !isNaN(new Date(application.deadline).getTime());

        // Check if the funding amount is a non-empty string.
        const isFundingAmountPresent = application.fundingAmount && application.fundingAmount.trim() !== '';

        return (
            <div
                ref={ref}
                {...props.dragHandleProps}
                {...props}
                onClick={onClick}
                className={`
                    relative bg-white rounded-xl p-5 mb-4 border-l-4 cursor-grab
                    shadow-sm transition-all duration-300
                    hover:shadow-md hover:scale-[1.02]
                    ${isDragging ? 'shadow-xl scale-105 opacity-80' : ''}
                    ${getStatusBorderClass(application.status)}
                `}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{application.schoolName}</h3>
                        <p className="text-gray-600 text-sm mt-1">{application.programName}</p>
                    </div>
                    <div className="flex-shrink-0">
                        <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBgClass(application.status)}`}>
                            {getStatusIcon(application.status)}
                            <span>{application.status}</span>
                        </span>
                    </div>
                </div>
                
                {/* Only render the details section if there is at least one piece of data to show. */}
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
            </div>
        );
    }
);

ApplicationCard.displayName = 'ApplicationCard';

export default ApplicationCard;