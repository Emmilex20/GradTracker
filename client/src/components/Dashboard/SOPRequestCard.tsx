import React, { useEffect, useState } from 'react';
import { FaSpinner, FaPenFancy, FaClock, FaCheckCircle, FaTimesCircle, FaLink, FaCalendarAlt, FaHistory, FaTimes } from 'react-icons/fa';
import type { Application } from '../../types/Application';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface SOPRequest {
    id: string;
    applicationId: string;
    userId: string;
    status: 'pending' | 'accepted' | 'declined' | 'completed' | 'rescheduled' | 'not completed';
    timestamp: string;
    acceptanceDetails?: {
        date: string;
        time: string;
        zoomLink: string;
    };
    declineReason?: string;
    rescheduleDetails?: {
        newDate: string;
        newTime: string;
        reason?: string;
    };
    uncompletionReason?: string;
}

interface Props {
    applications: Application[];
    onRequestSOPWriting: (applicationId: string) => void;
    currentUserUid: string;
}

const SOPRequestCard: React.FC<Props> = ({ applications, onRequestSOPWriting, currentUserUid }) => {
    const [allSopRequests, setAllSopRequests] = useState<SOPRequest[]>([]);
    const [mostRecentRequest, setMostRecentRequest] = useState<SOPRequest | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false); // New state for the request modal

    useEffect(() => {
        if (!currentUserUid) {
            setIsLoading(false);
            return;
        }

        const q = query(
            collection(db, "sop_requests"),
            where("userId", "==", currentUserUid)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedRequests: SOPRequest[] = [];
            querySnapshot.forEach((doc) => {
                fetchedRequests.push({ ...doc.data(), id: doc.id } as SOPRequest);
            });
            
            fetchedRequests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            setAllSopRequests(fetchedRequests);
            setMostRecentRequest(fetchedRequests.length > 0 ? fetchedRequests[0] : null);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching SOP requests:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [currentUserUid]);

    const getApplicationById = (id: string) => applications.find(app => app._id === id);

    const hasActiveRequest = (appId: string) =>
        allSopRequests.some(
            req => req.applicationId === appId && (req.status === 'pending' || req.status === 'accepted' || req.status === 'rescheduled')
        );

    const renderRequestCardContent = (request: SOPRequest) => {
        const app = getApplicationById(request.applicationId);
        if (!app) return null;

        switch (request.status) {
            case 'pending':
                return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 shadow-sm">
                        <h4 className="font-semibold text-yellow-800 flex items-center">
                            <FaClock className="text-yellow-500 mr-2" />
                            Request Submitted for: <strong>{app.schoolName}</strong>
                        </h4>
                        <p className="text-yellow-700 mt-2">
                            Your request is currently being reviewed by an admin.
                        </p>
                    </div>
                );
            case 'accepted':
                if (!request.acceptanceDetails) return null;
                return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 shadow-sm">
                        <h4 className="font-semibold text-green-800 flex items-center">
                            <FaCheckCircle className="text-green-500 mr-2" />
                            Live Writing Session Confirmed for: <strong>{app.schoolName}</strong>
                        </h4>
                        <p className="mt-2 text-green-700"><strong>Date:</strong> {request.acceptanceDetails.date}</p>
                        <p className="text-green-700"><strong>Time:</strong> {request.acceptanceDetails.time}</p>
                        <a
                            href={request.acceptanceDetails.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center mt-2"
                        >
                            <FaLink className="mr-1" /> Join the Session
                        </a>
                    </div>
                );
            case 'rescheduled':
                if (!request.rescheduleDetails) return null;
                return (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 shadow-sm">
                        <h4 className="font-semibold text-blue-800 flex items-center">
                            <FaCalendarAlt className="text-blue-500 mr-2" />
                            Session Rescheduled for: <strong>{app.schoolName}</strong>
                        </h4>
                        <p className="mt-2 text-blue-700"><strong>New Date:</strong> {request.rescheduleDetails.newDate}</p>
                        <p className="text-blue-700"><strong>New Time:</strong> {request.rescheduleDetails.newTime}</p>
                        {request.rescheduleDetails.reason && (
                            <p className="text-blue-700 mt-2 italic"><strong>Reason:</strong> {request.rescheduleDetails.reason}</p>
                        )}
                        <p className="text-blue-700 mt-2">
                            Please check back on the new date for your session link.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-6 relative">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary flex items-center mb-6">
                <FaPenFancy className="mr-2 text-primary" />
                SOP Live Writing
            </h2>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mb-4">
                <button
                    onClick={() => setShowRequestModal(true)}
                    className="flex items-center text-sm text-white font-semibold py-2 px-4 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-300"
                >
                    <FaPenFancy className="sm:mr-2" />
                    <span className="hidden sm:inline">Request New Session</span>
                </button>
                <button
                    onClick={() => setShowHistoryModal(true)}
                    className="flex items-center text-sm text-primary-dark font-semibold py-2 px-4 rounded-full bg-primary-light hover:bg-primary transition-all duration-300"
                >
                    <FaHistory className="sm:mr-2" />
                    <span className="hidden sm:inline">View History</span>
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <FaSpinner className="animate-spin text-3xl text-primary" />
                    <span className="ml-3 text-gray-600">Loading requests...</span>
                </div>
            ) : (
                <div className="text-center text-gray-500">
                    <p>Use the buttons above to manage your SOP writing sessions.</p>
                </div>
            )}

            {/* Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl my-auto">
                        <button onClick={() => setShowRequestModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                            <FaTimes className="text-2xl" />
                        </button>
                        <h3 className="text-2xl font-bold text-secondary mb-6">SOP Live Writing Session</h3>

                        {mostRecentRequest && (mostRecentRequest.status === 'pending' || mostRecentRequest.status === 'accepted' || mostRecentRequest.status === 'rescheduled') ? (
                            <>
                                <h4 className="text-lg font-bold text-secondary mb-4">Current Active Request</h4>
                                {renderRequestCardContent(mostRecentRequest)}
                            </>
                        ) : (
                            <p className="text-gray-500 mb-6">You have no active SOP writing requests.</p>
                        )}
                        
                        <h4 className="text-lg font-bold text-secondary mb-4 mt-6">Request a New Session</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {applications.map(app => (
                                <div
                                    key={app._id}
                                    className={`p-4 rounded-xl shadow-md border-2 transition-all duration-300 ${
                                        hasActiveRequest(app._id)
                                            ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                                            : 'bg-white border-primary-light hover:shadow-lg'
                                    }`}
                                >
                                    <h4 className="font-bold text-lg text-secondary">{app.schoolName}</h4>
                                    <p className="text-sm text-neutral-dark mb-2">{app.programName}</p>
                                    {hasActiveRequest(app._id) ? (
                                        <div className="flex items-center text-sm font-semibold text-gray-500 mt-2">
                                            <FaTimesCircle className="mr-1" /> An active request exists
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onRequestSOPWriting(app._id)}
                                            className="mt-2 w-full bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition-colors"
                                        >
                                            Request SOP Writing
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl my-auto">
                        <button onClick={() => setShowHistoryModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                            <FaTimes className="text-2xl" />
                        </button>
                        <h3 className="text-2xl font-bold text-secondary mb-6">SOP Request History</h3>
                        <div className="space-y-4">
                            {allSopRequests.length > 0 ? (
                                allSopRequests.map(req => {
                                    const app = getApplicationById(req.applicationId);
                                    if (!app) return null;
                                    
                                    const statusColor = 
                                        req.status === 'accepted' ? 'green' : 
                                        req.status === 'rescheduled' ? 'blue' :
                                        req.status === 'pending' ? 'yellow' :
                                        req.status === 'completed' ? 'gray' :
                                        'red';

                                    const formattedDate = new Date(req.timestamp).toLocaleDateString();

                                    return (
                                        <div key={req.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`font-semibold text-${statusColor}-700 text-lg`}>{app.schoolName}</span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white bg-${statusColor}-500`}>{req.status}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                <FaClock className="inline mr-1" /> Requested on: {formattedDate}
                                            </p>
                                            {req.status === 'accepted' && req.acceptanceDetails && (
                                                <div className="mt-2 text-sm text-gray-700">
                                                    <p>Confirmed Date: {req.acceptanceDetails.date}</p>
                                                    <p>Confirmed Time: {req.acceptanceDetails.time}</p>
                                                    <a href={req.acceptanceDetails.zoomLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Session Link</a>
                                                </div>
                                            )}
                                            {req.status === 'rescheduled' && req.rescheduleDetails && (
                                                <div className="mt-2 text-sm text-gray-700">
                                                    <p>New Date: {req.rescheduleDetails.newDate}</p>
                                                    <p>New Time: {req.rescheduleDetails.newTime}</p>
                                                    {req.rescheduleDetails.reason && <p className="italic">Reason: {req.rescheduleDetails.reason}</p>}
                                                </div>
                                            )}
                                            {(req.status === 'declined' || req.status === 'not completed') && (
                                                <p className="mt-2 text-sm text-gray-700 italic">Reason: {req.declineReason || req.uncompletionReason || 'No reason provided.'}</p>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-gray-500">No requests found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SOPRequestCard;