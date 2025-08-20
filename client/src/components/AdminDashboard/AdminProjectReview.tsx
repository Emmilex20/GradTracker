/* eslint-disable react-hooks/exhaustive-deps */
// src/components/AdminDashboard/AdminProjectReview.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaUserCheck, FaFileAlt } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface Project {
    id: string;
    title: string;
    description: string;
    goals: string;
    creatorName: string;
    creatorId: string;
    status: 'pending_approval' | 'active' | 'declined';
    createdAt: string;
    pendingRequests: { userId: string, userName: string, requestedAt: string }[];
}

interface JoinRequest {
    userId: string;
    userName: string;
    projectId: string;
    projectTitle: string;
    requestedAt: string;
}

const AdminProjectReview: React.FC = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('projectApprovals'); // State for tabs
    const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
    const [pendingJoinRequests, setPendingJoinRequests] = useState<JoinRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPendingProjects = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await axios.get<Project[]>(`${API_URL}/projects/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingProjects(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching pending projects:', err);
            setError('Failed to fetch pending projects. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingJoinRequests = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await axios.get<JoinRequest[]>(`${API_URL}/projects/join-requests/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingJoinRequests(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching pending join requests:', err);
            setError('Failed to fetch pending join requests. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'projectApprovals') {
            fetchPendingProjects();
        } else {
            fetchPendingJoinRequests();
        }
    }, [token, activeTab]);

    const handleProjectAction = async (projectId: string, action: 'approve' | 'decline' | 'delete') => {
        if (!token) return;
        try {
            const endpoint = `${API_URL}/projects/${projectId}/${action}`;
            await axios.put(endpoint, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPendingProjects();
        } catch (err) {
            console.error(`Error ${action} project:`, err);
            setError(`Failed to ${action} project.`);
        }
    };

    const handleJoinRequestAction = async (projectId: string, userId: string, action: 'approve' | 'decline') => {
        if (!token) return;
        try {
            const endpoint = `${API_URL}/projects/${projectId}/join-requests/${action}`;
            await axios.put(endpoint, { userId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPendingJoinRequests();
        } catch (err) {
            console.error(`Error ${action} join request:`, err);
            setError(`Failed to ${action} join request.`);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500 flex items-center justify-center"><FaSpinner className="animate-spin mr-2" /> Loading...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
        <div>
            <div className="flex mb-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('projectApprovals')}
                    className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === 'projectApprovals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaFileAlt className="inline mr-2" /> Project Approvals
                </button>
                <button
                    onClick={() => setActiveTab('joinRequests')}
                    className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === 'joinRequests' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaUserCheck className="inline mr-2" /> Join Requests
                </button>
            </div>

            {activeTab === 'projectApprovals' && (
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Pending Project Approvals</h2>
                    {pendingProjects.length === 0 ? (
                        <div className="text-center py-10 text-gray-500"><p className="text-lg">No projects are currently awaiting approval. ✨</p></div>
                    ) : (
                        <div className="space-y-4">
                            {pendingProjects.map((project) => (
                                <div key={project.id} className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">Created by: {project.creatorName}</p>
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        <button onClick={() => handleProjectAction(project.id, 'approve')} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center text-sm"><FaCheckCircle className="mr-2" /> Approve</button>
                                        <button onClick={() => handleProjectAction(project.id, 'decline')} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center text-sm"><FaTimesCircle className="mr-2" /> Decline</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'joinRequests' && (
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Pending Join Requests</h2>
                    {pendingJoinRequests.length === 0 ? (
                        <div className="text-center py-10 text-gray-500"><p className="text-lg">No new join requests. ✅</p></div>
                    ) : (
                        <div className="space-y-4">
                            {pendingJoinRequests.map((request, index) => (
                                <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-900">Request from: {request.userName}</h3>
                                    <p className="text-sm text-gray-600 mt-1">Project: {request.projectTitle}</p>
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        <button onClick={() => handleJoinRequestAction(request.projectId, request.userId, 'approve')} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center text-sm"><FaCheckCircle className="mr-2" /> Approve</button>
                                        <button onClick={() => handleJoinRequestAction(request.projectId, request.userId, 'decline')} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center text-sm"><FaTimesCircle className="mr-2" /> Decline</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminProjectReview;