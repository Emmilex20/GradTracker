/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaUsers, FaPlusCircle, FaUserPlus, FaCheckCircle, FaTimesCircle, FaLink } from 'react-icons/fa';
import { IoIosChatbubbles } from "react-icons/io";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role?: string;
}

interface Group {
  id: string;
  name: string;
}

interface ConnectionRequest {
  requestId: string;
  sender: User;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

const CommunityPage: React.FC = () => {
  const { currentUser, token } = useAuth();
  const [connections, setConnections] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'connections' | 'groups' | 'findUsers' | 'requests'>('connections');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser?.uid || !token) {
      setLoading(false);
      setError('User not authenticated or token is missing.');
      return;
    }

    // CommunityPage.tsx

const fetchData = async () => {
    setLoading(true);
    try {
        const [connectionsResponse, groupsResponse, allUsersResponse] = await Promise.all([
            axios.get(`${API_URL}/connections`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API_URL}/groups`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const connectionsData: User[] = Array.isArray(connectionsResponse.data.acceptedConnections) ? connectionsResponse.data.acceptedConnections : [];
        setConnections(connectionsData);

        const groupsData: Group[] = Array.isArray(groupsResponse.data) ? groupsResponse.data : [];
        setGroups(groupsData);

        const allUsersData: User[] = Array.isArray(allUsersResponse.data) ? allUsersResponse.data : [];
        const pendingRequestsData: ConnectionRequest[] = Array.isArray(connectionsResponse.data.pendingRequests) ? connectionsResponse.data.pendingRequests : [];
        setPendingRequests(pendingRequestsData);

        // --- THE FIX IS HERE ---
        // Provide a default empty array [] if connectionsResponse.data.sentRequests is undefined
        const sentRequestsData = connectionsResponse.data.sentRequests || [];
        const sentRequestUserIds = sentRequestsData.map((req: any) => req.recipient.id);
        setSentRequests(sentRequestUserIds);
        // --- END OF FIX ---
        
        const connectedUserIds = new Set([...connectionsData.map(conn => conn.id), ...sentRequestUserIds, currentUser.uid]);
        
        const unconnectedUsers = allUsersData.filter(user => !connectedUserIds.has(user.id));
        setAllUsers(unconnectedUsers);

    } catch (err) {
        console.error('Failed to fetch community data:', err);
        setError('Failed to load community data.');
        setConnections([]);
        setGroups([]);
        setAllUsers([]);
        setPendingRequests([]);
    } finally {
        setLoading(false);
    }
};

    fetchData();
  }, [currentUser, token]);

  // Scroll to top of content section on tab change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const handleConnectRequest = async (recipientId: string) => {
    if (!currentUser?.uid || !token) {
      setError('Authentication is required to send a connection request.');
      return;
    }
    try {
      await axios.post(`${API_URL}/connections/request/${recipientId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSentRequests(prev => [...prev, recipientId]);
    } catch (err) {
      console.error('Failed to send connection request:', err);
      alert('Failed to send connection request. Check console for details.');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!token) return;
    try {
      await axios.put(`${API_URL}/connections/accept/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const acceptedRequest = pendingRequests.find(req => req.requestId === requestId);
      if (acceptedRequest) {
        setConnections(prev => [...prev, acceptedRequest.sender]);
        setPendingRequests(prev => prev.filter(req => req.requestId !== requestId));
        setAllUsers(prev => prev.filter(user => user.id !== acceptedRequest.sender.id));
      }
    } catch (err) {
      console.error('Failed to accept connection request:', err);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    if (!token) return;
    try {
      await axios.put(`${API_URL}/connections/decline/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(prev => prev.filter(req => req.requestId !== requestId));
    } catch (err) {
      console.error('Failed to decline connection request:', err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || selectedMembers.length === 0) {
      alert('Group name and members are required.');
      return;
    }
    setIsCreatingGroup(true);
    try {
      const response = await axios.post(`${API_URL}/groups/create`, { groupName: newGroupName, memberIds: selectedMembers }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(prev => [...prev, { id: response.data.groupId, name: newGroupName }]);
      setActiveTab('groups');
      setNewGroupName('');
      setSelectedMembers([]);
    } catch (err) {
      console.error('Failed to create group:', err);
      alert('Failed to create group. Check console for details.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleToggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900 bg-opacity-75 z-50">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  if (error) return <div className="text-center mt-24 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center py-16 px-4 relative overflow-hidden">
      {/* Background Gradients and Particles */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-0 w-80 h-80 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>
      
      {/* Main Glassmorphism Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto backdrop-blur-3xl bg-white/10 rounded-3xl shadow-2xl p-6 md:p-10 border border-white/20 transform-gpu animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400 animate-slide-in-up">
          Community Hub
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-white/20 mb-6 sticky top-0 bg-white/10 backdrop-blur-lg z-20 rounded-t-2xl">
          <button
            className={`flex-1 py-4 text-center font-medium transition duration-500 ease-in-out transform hover:scale-105 ${activeTab === 'connections' ? 'text-blue-300 border-b-2 border-blue-300 scale-100' : 'text-gray-300 hover:text-white'}`}
            onClick={() => setActiveTab('connections')}
          >
            <IoIosChatbubbles className="inline-block mr-2" /> Connections
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium transition duration-500 ease-in-out transform hover:scale-105 ${activeTab === 'groups' ? 'text-blue-300 border-b-2 border-blue-300 scale-100' : 'text-gray-300 hover:text-white'}`}
            onClick={() => setActiveTab('groups')}
          >
            <FaUsers className="inline-block mr-2" /> Groups
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium transition duration-500 ease-in-out transform hover:scale-105 ${activeTab === 'findUsers' ? 'text-blue-300 border-b-2 border-blue-300 scale-100' : 'text-gray-300 hover:text-white'}`}
            onClick={() => setActiveTab('findUsers')}
          >
            <FaUserPlus className="inline-block mr-2" /> Find Users
          </button>
          <button
            className={`relative flex-1 py-4 text-center font-medium transition duration-500 ease-in-out transform hover:scale-105 ${activeTab === 'requests' ? 'text-blue-300 border-b-2 border-blue-300 scale-100' : 'text-gray-300 hover:text-white'}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-ping-once">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Section with Scroll */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar" ref={contentRef}>
          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <div className="space-y-4 animate-fade-in-up">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">Your Connections</h2>
              {connections.length === 0 ? (
                <div className="text-center text-gray-400 p-8">
                  <p className="mb-2">You have no connections yet.</p>
                  <button
                    className="inline-flex items-center text-blue-300 hover:underline transition transform hover:translate-x-1"
                    onClick={() => setActiveTab('findUsers')}
                  >
                    <FaUserPlus className="mr-2 animate-bounce-horizontal" /> Find People to Connect With
                  </button>
                </div>
              ) : (
                connections.map((connection) => (
                  <Link
                    key={connection.id}
                    to={`/chat/${connection.id}`}
                    className="flex items-center space-x-4 p-4 border border-white/10 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 hover:bg-white/10 cursor-pointer animate-list-item-enter"
                  >
                    {connection.avatar ? (
                      <img src={connection.avatar} alt={`${connection.firstName} ${connection.lastName}`} className="w-12 h-12 rounded-full object-cover border-2 border-blue-300/50" />
                    ) : (
                      <FaUserCircle size={48} className="text-gray-400" />
                    )}
                    <span className="text-lg font-medium text-white">{connection.firstName} {connection.lastName}</span>
                    <IoIosChatbubbles size={24} className="ml-auto text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-semibold text-white">Your Groups</h2>
                <button
                  onClick={() => setActiveTab('findUsers')}
                  className="flex items-center text-blue-300 hover:underline transition transform hover:translate-x-1"
                >
                  <FaPlusCircle className="mr-2" /> Create Group
                </button>
              </div>
              {groups.length === 0 ? (
                <p className="text-center text-gray-400 p-8">You are not a member of any groups.</p>
              ) : (
                groups.map((group) => (
                  <Link
                    key={group.id}
                    to={`/group-chat/${group.id}`}
                    className="flex items-center space-x-4 p-4 border border-white/10 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 hover:bg-white/10 cursor-pointer animate-list-item-enter"
                  >
                    <FaUsers size={48} className="text-gray-400" />
                    <span className="text-lg font-medium text-white">{group.name}</span>
                    <IoIosChatbubbles size={24} className="ml-auto text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Find Users / Create Group Tab */}
          {activeTab === 'findUsers' && (
            <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4 animate-fade-in-up">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">Find Users & Create Groups</h2>
              {/* Group Creation Form */}
              <form onSubmit={handleCreateGroup} className="mb-6 space-y-4">
                <div>
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-300 mb-1">Group Name</label>
                  <input
                    type="text"
                    id="groupName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., Study Group"
                    className="w-full p-2 bg-white/5 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-white transition"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white">Select Members</h3>
                  <ul className="divide-y divide-white/10 max-h-48 overflow-y-auto custom-scrollbar">
                    {allUsers.length > 0 ? allUsers.map((user) => (
                      <li key={user.id} className="py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-8 h-8 rounded-full object-cover border border-white/20" />
                          ) : (
                            <FaUserCircle size={32} className="text-gray-500" />
                          )}
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(user.id)}
                          onChange={() => handleToggleMember(user.id)}
                          className="form-checkbox h-5 w-5 text-blue-500 bg-white/10 border-white/20 rounded-full cursor-pointer transition transform hover:scale-110"
                        />
                      </li>
                    )) : (
                      <p className="text-center text-gray-500 py-4">No users available to add to a group.</p>
                    )}
                  </ul>
                </div>
                <button
                  type="submit"
                  disabled={isCreatingGroup || selectedMembers.length === 0 || !newGroupName.trim()}
                  className={`w-full py-3 px-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105
                    ${isCreatingGroup ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'}
                  `}
                >
                  {isCreatingGroup ? 'Creating...' : 'Create Group'}
                </button>
              </form>

              <div className="h-px bg-white/10 my-8"></div>
              
              <h3 className="text-lg font-semibold mb-4 text-white">Users to Connect With</h3>
              <ul className="space-y-4">
                {allUsers.length > 0 ? allUsers.map((user) => (
                  <li key={user.id} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between animate-list-item-enter transition duration-300 hover:bg-white/10 transform hover:scale-105">
                    <div className="flex items-center space-x-4">
                      {user.avatar ? (
                        <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-12 h-12 rounded-full object-cover border-2 border-blue-300/50" />
                      ) : (
                        <FaUserCircle size={48} className="text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                        {user.role && <p className="text-sm text-gray-400">{user.role}</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {sentRequests.includes(user.id) ? (
                          <span className="text-yellow-400 text-sm italic">Pending...</span>
                        ) : (
                          <button
                            onClick={() => handleConnectRequest(user.id)}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-full hover:bg-green-600 transition duration-300 transform hover:scale-110"
                            title="Connect"
                          >
                            <FaLink />
                          </button>
                        )}
                    </div>
                  </li>
                )) : (
                  <p className="text-center text-gray-500 p-8">No new users to connect with.</p>
                )}
              </ul>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4 animate-fade-in-up">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">Connection Requests</h2>
              {pendingRequests.length === 0 ? (
                <p className="text-center text-gray-400 p-8">You have no pending connection requests.</p>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request.requestId} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between space-x-4 animate-list-item-enter transition duration-300 hover:bg-white/10 transform hover:scale-105">
                    <div className="flex items-center space-x-4">
                      {request.sender.avatar ? (
                        <img src={request.sender.avatar} alt={`${request.sender.firstName} ${request.sender.lastName}`} className="w-12 h-12 rounded-full object-cover border-2 border-green-300/50" />
                      ) : (
                        <FaUserCircle size={48} className="text-gray-400" />
                      )}
                      <span className="text-lg font-medium text-white">{request.sender.firstName} {request.sender.lastName}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request.requestId)}
                        className="p-2 text-green-400 hover:text-green-500 transition-colors duration-300 transform hover:scale-125"
                        title="Accept"
                      >
                        <FaCheckCircle size={24} />
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.requestId)}
                        className="p-2 text-red-400 hover:text-red-500 transition-colors duration-300 transform hover:scale-125"
                        title="Decline"
                      >
                        <FaTimesCircle size={24} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;