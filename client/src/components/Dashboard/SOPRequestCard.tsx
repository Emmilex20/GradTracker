import React from 'react';
import type { Application } from '../../types/Application';
import { FaPenFancy } from 'react-icons/fa';

interface SOPRequestCardProps {
    applications: Application[];
    sopRequests: string[];
    onRequestSOPWriting: (applicationId: string) => void;
    loading: boolean;
}

const SOPRequestCard: React.FC<SOPRequestCardProps> = ({ applications, sopRequests, onRequestSOPWriting, loading }) => {
    
    // Filter applications to find those that are ready for an SOP request
    const requestableApplications = applications.filter(app => 
        app.status !== 'Submitted' && 
        app.status !== 'Accepted' && 
        app.status !== 'Rejected' && 
        !sopRequests.includes(app._id)
    );

    const requestedApplications = applications.filter(app => sopRequests.includes(app._id));

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-secondary">Loading requests...</span>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Display applications where an SOP has already been requested */}
            {requestedApplications.length > 0 && (
                <div className="bg-neutral-light rounded-xl p-4 shadow-sm col-span-full mb-4">
                    <h3 className="font-bold text-secondary mb-2">Sent Requests</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {requestedApplications.map(app => (
                            <div key={app._id} className="bg-white p-3 rounded-lg border border-neutral-200 flex justify-between items-center">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm text-secondary truncate">{app.schoolName}</h4>
                                    <p className="text-xs text-neutral-dark truncate">{app.programName}</p>
                                </div>
                                <span className="text-xs font-medium text-primary-dark ml-2">Requested</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Display applications that are eligible for a new SOP request */}
            {requestableApplications.length > 0 ? (
                requestableApplications.map(app => (
                    <div key={app._id} className="bg-neutral-light rounded-xl p-4 shadow-sm border border-transparent hover:border-primary-light transition-colors duration-200">
                        <h3 className="font-bold text-secondary truncate">{app.schoolName}</h3>
                        <p className="text-sm text-neutral-dark truncate">{app.programName}</p>
                        <button
                            onClick={() => onRequestSOPWriting(app._id)}
                            className="mt-4 w-full bg-primary text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-indigo-700 transform transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                            <FaPenFancy />
                            <span>Request SOP Help</span>
                        </button>
                    </div>
                ))
            ) : (
                <div className="bg-white p-6 rounded-xl text-center text-neutral-dark italic shadow-sm border border-neutral-300">
                    <p className="mb-2">No applications eligible for a new SOP request.</p>
                    <p>Check your <strong>Interested</strong> applications or add a new one.</p>
                </div>
            )}
        </div>
    );
};

export default SOPRequestCard;