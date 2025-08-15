import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaUsers, FaPlusCircle, FaUserPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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

  useEffect(() => {
    if (!currentUser?.uid || !token) {
      setLoading(false);
      setError('User not authenticated or token is missing.');
      return;
    }

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
        
        // Correctly type the incoming data from the API
        const allUsersData: User[] = Array.isArray(allUsersResponse.data) ? allUsersResponse.data : [];
        const pendingRequestsData: ConnectionRequest[] = Array.isArray(connectionsResponse.data.pendingRequests) ? connectionsResponse.data.pendingRequests : [];
        setPendingRequests(pendingRequestsData);

        const sentRequestUserIds = new Set(pendingRequestsData.map(req => req.sender.id));
        setSentRequests(Array.from(sentRequestUserIds));
        
        const connectedUserIds = new Set(connectionsData.map(conn => conn.id));
        
        const unconnectedUsers = allUsersData.filter(user =>
          user.id !== currentUser.uid && !connectedUserIds.has(user.id) && !sentRequestUserIds.has(user.id)
        );
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

  const handleConnectRequest = async (recipientId: string) => { // Corrected type for recipientId
    if (!currentUser?.uid || !token) {
      setError('Authentication is required to send a connection request.');
      return;
    }
    try {
      await axios.post(`${API_URL}/connections/request/${recipientId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSentRequests(prev => [...prev, recipientId]);
      alert('Connection request sent successfully!');
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
      setPendingRequests(prev => prev.filter(req => req.requestId !== requestId));
      alert('Connection request accepted!');
      if (currentUser && token) {
        const response = await axios.get(`${API_URL}/connections`, { headers: { Authorization: `Bearer ${token}` } });
        setConnections(Array.isArray(response.data.acceptedConnections) ? response.data.acceptedConnections : []);
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
      alert('Connection request declined.');
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
      alert('Group created successfully!');
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

  if (loading) return <div className="text-center mt-24">Loading community...</div>;
  if (error) return <div className="text-center mt-24 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 mt-24">
      <h1 className="text-3xl font-bold text-center mb-6">Community Hub</h1>
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 text-center font-medium transition duration-300 ${activeTab === 'connections' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('connections')}
          >
            <IoIosChatbubbles className="inline-block mr-2" /> Connections
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium transition duration-300 ${activeTab === 'groups' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('groups')}
          >
            <FaUsers className="inline-block mr-2" /> Groups
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium transition duration-300 ${activeTab === 'findUsers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('findUsers')}
          >
            <FaUserPlus className="inline-block mr-2" /> Find Users
          </button>
          <button
            className={`relative flex-1 py-4 text-center font-medium transition duration-300 ${activeTab === 'requests' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Your Connections</h2>
              {connections.length === 0 ? (
                <div className="text-center text-gray-500">
                  <p>You have no connections yet.</p>
                  <button
                    className="mt-4 inline-flex items-center text-blue-600 hover:underline"
                    onClick={() => setActiveTab('findUsers')}
                  >
                    <FaUserPlus className="mr-2" /> Find People to Connect With
                  </button>
                </div>
              ) : (
                connections.map((connection) => (
                  <Link
                    key={connection.id}
                    to={`/chat/${connection.id}`}
                    className="flex items-center space-x-4 p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition rounded-lg"
                  >
                    {connection.avatar ? (
                      <img src={connection.avatar} alt={`${connection.firstName} ${connection.lastName}`} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <FaUserCircle size={48} className="text-gray-400" />
                    )}
                    <span className="text-lg font-medium">{connection.firstName} {connection.lastName}</span>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Groups</h2>
                <button
                  onClick={() => setActiveTab('findUsers')}
                  className="flex items-center text-blue-600 hover:underline"
                >
                  <FaPlusCircle className="mr-2" /> Create Group
                </button>
              </div>
              {groups.length === 0 ? (
                <p className="text-center text-gray-500">You are not a member of any groups.</p>
              ) : (
                groups.map((group) => (
                  <Link
                    key={group.id}
                    to={`/group-chat/${group.id}`}
                    className="flex items-center space-x-4 p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition rounded-lg"
                  >
                    <FaUsers size={48} className="text-gray-400" />
                    <span className="text-lg font-medium">{group.name}</span>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Find Users / Create Group Tab */}
          {activeTab === 'findUsers' && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Find Users & Create Groups</h2>
              {/* Group Creation Form */}
              <form onSubmit={handleCreateGroup} className="mb-6">
                <div className="mb-4">
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">Group Name</label>
                  <input
                    type="text"
                    id="groupName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., Study Group"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreatingGroup || selectedMembers.length === 0 || !newGroupName.trim()}
                  className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isCreatingGroup ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isCreatingGroup ? 'Creating...' : 'Create Group'}
                </button>
              </form>
              <h3 className="text-lg font-semibold mb-2">Users to Connect With</h3>
              <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                {allUsers.length > 0 ? allUsers.map((user) => (
                  <li key={user.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {user.avatar ? (
                        <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <FaUserCircle size={40} className="text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {sentRequests.includes(user.id) ? (
                          <span className="text-yellow-600">Pending...</span>
                        ) : (
                          <button
                            onClick={() => handleConnectRequest(user.id)}
                            className="px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition"
                          >
                              Connect
                          </button>
                        )}
                        <input
                            type="checkbox"
                            checked={selectedMembers.includes(user.id)}
                            onChange={() => handleToggleMember(user.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                    </div>
                  </li>
                )) : (
                    <p className="text-center text-gray-500">No new users to connect with.</p>
                )}
              </ul>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Connection Requests</h2>
              {pendingRequests.length === 0 ? (
                <p className="text-center text-gray-500">You have no pending connection requests.</p>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request.requestId} className="flex items-center justify-between space-x-4 p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition rounded-lg">
                    <div className="flex items-center space-x-4">
                      {request.sender.avatar ? (
                        <img src={request.sender.avatar} alt={`${request.sender.firstName} ${request.sender.lastName}`} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <FaUserCircle size={48} className="text-gray-400" />
                      )}
                      <span className="text-lg font-medium">{request.sender.firstName} {request.sender.lastName}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request.requestId)}
                        className="p-2 text-green-500 hover:text-green-700 transition"
                        title="Accept"
                      >
                        <FaCheckCircle size={24} />
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.requestId)}
                        className="p-2 text-red-500 hover:text-red-700 transition"
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