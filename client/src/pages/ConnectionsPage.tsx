import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaUserPlus, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface ConnectionRequest {
    id: string;
    sender: string;
    senderId: string;
    status: 'pending';
    createdAt: string;
}

const ConnectionsPage: React.FC = () => {
    const { token } = useAuth();
    const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
    const [acceptedConnections, setAcceptedConnections] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Wrap fetchConnections in useCallback to memoize the function
    const fetchConnections = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/connections`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAcceptedConnections(response.data.acceptedConnections);
            setPendingRequests(response.data.pendingRequests);
        } catch (err) {
            console.error('Failed to fetch connections:', err);
            setError('Failed to load connections.');
        } finally {
            setLoading(false);
        }
    }, [token]); // The dependency is 'token' because `fetchConnections` uses it.

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]); // Now we only need `fetchConnections` in the dependency array.

    const handleAcceptRequest = async (requestId: string) => {
        if (!token) return;
        try {
            await axios.put(`${API_URL}/connections/accept/${requestId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Request accepted!');
            fetchConnections();
        } catch (err) {
            console.error('Failed to accept request:', err);
            alert('Failed to accept request.');
        }
    };

    const handleDeclineRequest = async (requestId: string) => {
        if (!token) return;
        try {
            await axios.put(`${API_URL}/connections/decline/${requestId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Request declined.');
            fetchConnections();
        } catch (err) {
            console.error('Failed to decline request:', err);
            alert('Failed to decline request.');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-8 text-center mt-24">
                <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto" />
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-500 mt-24">{error}</p>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-24">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Connections</h1>

            {/* Pending Requests */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">Pending Requests</h2>
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-8">
                <ul className="divide-y divide-gray-200">
                    {pendingRequests.length > 0 ? (
                        pendingRequests.map(request => (
                            <li key={request.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <FaUserPlus className="text-gray-500 text-xl" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{request.sender}</p>
                                        <p className="text-sm text-gray-500">Sent on: {new Date(request.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleAcceptRequest(request.id)}
                                        className="p-2 text-green-600 hover:text-green-800 transition-colors duration-200 rounded-full"
                                        aria-label="Accept connection"
                                    >
                                        <FaCheck />
                                    </button>
                                    <button
                                        onClick={() => handleDeclineRequest(request.id)}
                                        className="p-2 text-red-600 hover:text-red-800 transition-colors duration-200 rounded-full"
                                        aria-label="Decline connection"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </li>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">No pending requests.</div>
                    )}
                </ul>
            </div>

            {/* Accepted Connections */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">Accepted Connections</h2>
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {acceptedConnections.length > 0 ? (
                        acceptedConnections.map(connId => (
                            <li key={connId} className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <FaUserPlus className="text-blue-600 text-xl" />
                                    <p className="font-semibold text-gray-800">Connection with User ID: {connId}</p>
                                </div>
                            </li>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">No accepted connections.</div>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ConnectionsPage;