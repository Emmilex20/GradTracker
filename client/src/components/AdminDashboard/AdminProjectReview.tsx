// src/components/AdminDashboard/AdminProjectReview.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaCheckCircle, FaTimesCircle, FaTrashAlt, FaSpinner } from 'react-icons/fa';

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
}

const AdminProjectReview: React.FC = () => {
    const { token } = useAuth();
    const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
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
        } catch (err) {
            console.error('Error fetching pending projects:', err);
            setError('Failed to fetch pending projects. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleAction = async (projectId: string, action: 'approve' | 'decline' | 'delete') => {
        if (!token) return;
        try {
            const endpoint = `${API_URL}/projects/${projectId}/${action}`;
            await axios.put(endpoint, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refetch the list to update the UI
            fetchPendingProjects();
        } catch (err) {
            console.error(`Error ${action} project:`, err);
            setError(`Failed to ${action} project.`);
        }
    };

    const handleApprove = (projectId: string) => handleAction(projectId, 'approve');
    const handleDecline = (projectId: string) => handleAction(projectId, 'decline');
    const handleDelete = (projectId: string) => handleAction(projectId, 'delete');

    if (loading) {
        return <div className="text-center py-8 text-gray-500 flex items-center justify-center"><FaSpinner className="animate-spin mr-2" /> Loading pending projects...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
        <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Pending Project Approvals</h2>
            {pendingProjects.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p className="text-lg">No projects are currently awaiting approval. ✨</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingProjects.map((project) => (
                        <div key={project.id} className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">Created by: {project.creatorName}</p>
                            <p className="text-sm text-gray-600">Status: <span className="font-semibold text-yellow-600">{project.status}</span></p>
                            <div className="mt-4 border-t pt-4">
                                <p className="text-gray-700 font-medium">Description:</p>
                                <p className="text-gray-600 italic">{project.description}</p>
                                <p className="text-gray-700 font-medium mt-2">Goals:</p>
                                <p className="text-gray-600 italic">{project.goals}</p>
                            </div>
                            <div className="mt-6 flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleApprove(project.id)}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center text-sm"
                                >
                                    <FaCheckCircle className="mr-2" /> Approve
                                </button>
                                <button
                                    onClick={() => handleDecline(project.id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center text-sm"
                                >
                                    <FaTimesCircle className="mr-2" /> Decline
                                </button>
                                <button
                                    onClick={() => handleDelete(project.id)}
                                    className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors flex items-center text-sm"
                                >
                                    <FaTrashAlt className="mr-2" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminProjectReview;