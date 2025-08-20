// frontend/src/components/JoinProjectsModal.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaTimes, FaPlus, FaSpinner } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface Project {
  id: string;
  title: string;
  goals: string;
  description: string;
  creatorName: string;
  members: string[]; // List of user IDs
}

interface JoinProjectsModalProps {
  onClose: () => void;

}

const JoinProjectsModal: React.FC<JoinProjectsModalProps> = ({ onClose }) => {
  const { currentUser, token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', goals: '', description: '' });
  const [joinStatus, setJoinStatus] = useState<Record<string, 'requested' | 'member' | 'none'>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`${API_URL}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data);
        const initialStatus = response.data.reduce((acc: Record<string, 'requested' | 'member' | 'none'>, project: Project) => {
          if (project.members.includes(currentUser?.uid as string)) {
            acc[project.id] = 'member';
          } else {
            acc[project.id] = 'none';
          }
          return acc;
        }, {});
        setJoinStatus(initialStatus);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token, currentUser]);

  const handleJoinRequest = async (projectId: string) => {
    if (!token || joinStatus[projectId] !== 'none') return;

    setJoinStatus(prev => ({ ...prev, [projectId]: 'requested' }));
    try {
      await axios.post(`${API_URL}/projects/${projectId}/join-request`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Join request sent successfully! An admin will review it.');
    } catch (error) {
      console.error('Error sending join request:', error);
      setJoinStatus(prev => ({ ...prev, [projectId]: 'none' })); // Revert on failure
      alert('Failed to send join request. Please try again.');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitLoading(true);
    try {
      await axios.post(`${API_URL}/projects`, newProject, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Project submitted for admin approval!');
      setNewProject({ title: '', goals: '', description: '' });
      setIsCreatingProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getButtonText = (projectId: string) => {
    switch (joinStatus[projectId]) {
      case 'member':
        return 'Joined';
      case 'requested':
        return 'Requested';
      default:
        return 'Join';
    }
  };

  const getButtonClassName = (projectId: string) => {
    const baseClass = 'font-semibold py-2 px-4 rounded-full transition-all duration-300';
    switch (joinStatus[projectId]) {
      case 'member':
        return `${baseClass} bg-green-500 text-white cursor-not-allowed`;
      case 'requested':
        return `${baseClass} bg-neutral-400 text-white cursor-not-allowed`;
      default:
        return `${baseClass} bg-primary text-white hover:bg-indigo-700 transform hover:scale-105`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-dark hover:text-red-500 transition-colors text-2xl" title="Close">
          <FaTimes />
        </button>
        <h2 className="text-2xl font-bold text-secondary mb-6">Ongoing Projects</h2>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsCreatingProject(!isCreatingProject)}
            className="bg-primary text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          >
            <FaPlus />
            <span>{isCreatingProject ? 'Cancel' : 'Create New Project'}</span>
          </button>
        </div>

        {isCreatingProject && (
          <div className="bg-neutral-light p-6 rounded-xl mb-6 animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4">Propose a New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-dark mb-1">Title</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-dark mb-1">Goals</label>
                <textarea
                  value={newProject.goals}
                  onChange={(e) => setNewProject({ ...newProject, goals: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-20"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-dark mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-24"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white font-semibold py-2 px-6 rounded-full hover:bg-indigo-700 transition-colors"
                disabled={submitLoading}
              >
                {submitLoading ? <FaSpinner className="animate-spin" /> : 'Submit for Approval'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center p-8">
            <FaSpinner className="animate-spin mx-auto text-primary text-4xl" />
            <p className="mt-4 text-neutral-dark">Loading projects...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-center text-neutral-dark italic p-8">No active projects available. Be the first to create one!</p>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="bg-neutral-light p-6 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <h3 className="text-xl font-bold text-secondary">{project.title}</h3>
                    <p className="text-neutral-dark mt-1 text-sm">Created by: {project.creatorName}</p>
                    <p className="text-neutral-dark mt-2">
                      <span className="font-semibold">Goals:</span> {project.goals}
                    </p>
                  </div>
                  <button
                    onClick={() => handleJoinRequest(project.id)}
                    className={`mt-4 sm:mt-0 ${getButtonClassName(project.id)}`}
                    disabled={joinStatus[project.id] !== 'none'}
                  >
                    {getButtonText(project.id)}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinProjectsModal;