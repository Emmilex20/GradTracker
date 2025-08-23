import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaUsers, FaPlusCircle, FaUserPlus, FaCheckCircle, FaTimesCircle, FaLink } from 'react-icons/fa';
import { IoIosChatbubbles } from "react-icons/io";
import { db } from '../firebase';
import { collection, query, where, onSnapshot, type DocumentData } from 'firebase/firestore';

// Import the new service functions
import { fetchMyGroups, fetchAllGroups, joinGroup, createGroup, type Group } from '../services/groupService';

const API_URL = import.meta.env.VITE_API_URL;

interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role?: string;
}

interface ConnectionRequest {
  requestId: string;
  sender: User;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

// New interface for group join requests
interface GroupJoinRequest {
  requestId: string;
  sender: User;
  group: {
    id: string;
    name: string;
  };
  createdAt: string;
}

// New service function to be added to groupService.ts
const fetchPendingGroupRequests = async (token: string): Promise<GroupJoinRequest[]> => {
  const response = await axios.get(`${API_URL}/groups/requests`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.requests;
};

const CommunityPage: React.FC = () => {
  const { currentUser, token } = useAuth();
  const [connections, setConnections] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [pendingGroupRequests, setPendingGroupRequests] = useState<GroupJoinRequest[]>([]); // New state
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [sentGroupRequests, setSentGroupRequests] = useState<string[]>([]);
  const [unreadChatCounts, setUnreadChatCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'connections' | 'groups' | 'findUsers' | 'requests' | 'allGroups'>('connections');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser?.uid || !token) {
      setLoading(false);
      setError('User not authenticated or token is missing.');
      return;
    }

    const fetchData = async () => {
      try {
        const [connectionsResponse, myGroupsData, allUsersResponse, allGroupsData, pendingGroupRequestsData] = await Promise.all([
          axios.get(`${API_URL}/connections`, { headers: { Authorization: `Bearer ${token}` } }),
          fetchMyGroups(currentUser.uid, token),
          axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
          fetchAllGroups(token),
          fetchPendingGroupRequests(token) // New call
        ]);

        const connectionsData: User[] = Array.isArray(connectionsResponse.data.acceptedConnections) ? connectionsResponse.data.acceptedConnections : [];
        setConnections(connectionsData);
        setGroups(myGroupsData);

        const allUsersData: User[] = Array.isArray(allUsersResponse.data) ? allUsersResponse.data : [];
        const pendingRequestsData: ConnectionRequest[] = Array.isArray(connectionsResponse.data.pendingRequests) ? connectionsResponse.data.pendingRequests : [];
        setPendingRequests(pendingRequestsData);
        setPendingGroupRequests(pendingGroupRequestsData); // Set new state

        const sentRequestsData = connectionsResponse.data.sentRequests || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sentRequestUserIds = sentRequestsData.map((req: any) => req.recipient.id);
        setSentRequests(sentRequestUserIds);

        const myGroupsIds = new Set(myGroupsData.map(g => g.id));
        const availableGroups = allGroupsData.groups.filter(g => !myGroupsIds.has(g.id) && !allGroupsData.sentRequests.includes(g.id));
        setAllGroups(availableGroups);
        setSentGroupRequests(allGroupsData.sentRequests);

        const connectedUserIds = new Set([...connectionsData.map(conn => conn.id), ...sentRequestUserIds, currentUser.uid]);
        const unconnectedUsers = allUsersData.filter(user => !connectedUserIds.has(user.id));
        setAllUsers(unconnectedUsers);
      } catch (err) {
        console.error('Failed to fetch community data:', err);
        setError('Failed to load community data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time listener for chat unread counts
    const q = query(
      collection(db, 'chats'),
      where('members', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedUnreadCounts: { [key: string]: number } = {};
      querySnapshot.forEach((doc) => {
        const chatData = doc.data() as DocumentData;
        const chatId = doc.id;
        const lastReadTimestamp = chatData.lastRead?.[currentUser.uid]?.toDate();
        const updatedAtTimestamp = chatData.updatedAt?.toDate();

        let unreadCount = 0;
        if (updatedAtTimestamp && (!lastReadTimestamp || updatedAtTimestamp > lastReadTimestamp)) {
          unreadCount = 1;
        }
        fetchedUnreadCounts[chatId] = unreadCount;
      });
      setUnreadChatCounts(fetchedUnreadCounts);
    }, (error) => {
      console.error("Error fetching real-time chat data:", error);
    });

    return () => unsubscribe();
  }, [currentUser, token]);

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

  // New handler for approving group join requests
  const handleApproveGroupRequest = async (requestId: string) => {
    if (!token) return;
    try {
      await axios.put(`${API_URL}/groups/requests/${requestId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const approvedRequest = pendingGroupRequests.find(req => req.requestId === requestId);
      if (approvedRequest) {
        setPendingGroupRequests(prev => prev.filter(req => req.requestId !== requestId));
        // You might want to update the 'Your Groups' list or show a notification
        // For now, simply removing the request is sufficient
      }
    } catch (err) {
      console.error('Failed to approve group join request:', err);
    }
  };

  // New handler for declining group join requests
  const handleDeclineGroupRequest = async (requestId: string) => {
    if (!token) return;
    try {
      await axios.put(`${API_URL}/groups/requests/${requestId}/decline`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingGroupRequests(prev => prev.filter(req => req.requestId !== requestId));
    } catch (err) {
      console.error('Failed to decline group join request:', err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || selectedMembers.length === 0) {
      alert('Group name and members are required.');
      return;
    }
    if (!token) return;
    setIsCreatingGroup(true);
    try {
      const response = await createGroup(newGroupName, selectedMembers, token);
      setGroups(prev => [...prev, { id: response.groupId, name: newGroupName }]);
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

  const handleJoinGroup = async (groupId: string) => {
    if (!token) return;
    try {
      await joinGroup(groupId, token);
      setSentGroupRequests(prev => [...prev, groupId]);
    } catch (err) {
      console.error('Failed to send group join request:', err);
      alert('Failed to send group join request. Check console for details.');
    }
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900 bg-opacity-75 z-50">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  if (error) return <div className="text-center mt-24 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center py-16 px-4 mt-8 relative overflow-hidden">
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
        <div className="flex overflow-x-auto md:overflow-x-visible md:flex-row md:justify-center md:space-x-2 border-b border-white/20 mb-6 sticky top-0 bg-white/10 backdrop-blur-lg z-20 rounded-t-2xl custom-scrollbar-hidden">
          <button
            className={`flex-none md:flex-1 py-4 px-4 md:px-0 text-center font-medium transition duration-500 ease-in-out transform hover:scale-105 ${activeTab === 'connections' ? 'text-blue-300 border-b-2 border-blue-300 scale-100' : 'text-gray-300 hover:text-white'}`}
            onClick={() => setActiveTab('connections')}
          >
            <IoIosChatbubbles className="inline-block mr-2" /> Connections
          </button>
          <button
            className={`flex-none md:flex-1 py-4 px-4 md:px-0 text-center font-medium transition duration-500 ease-in-out transform hover:scale-105 ${activeTab === 'groups' ? 'text-blue-300 border-b-2 border-blue-300 scale-100' : 'text-gray-300 hover:text-white'}`}
            onClick={() => setActiveTab('groups')}
          >
            <FaUsers className="inline-block mr-2" /> Your Groups
          </button>
          <button
            className={`flex-none md:flex-1 py-4 px-4 md:px-0 text-center font-medium transition duration-500 ease-in-out transform hover:scale-105 ${activeTab === 'allGroups' ? 'text-blue-300 border-b-2 border-blue-300 scale-100' : 'text-gray-300 hover:text-white'}`}
            onClick={() => setActiveTab('allGroups')}
          >
            <FaUsers className="inline-block mr-2" /> Find Groups
          </button>
          <button
            className={`flex-none md:flex-1 py-4 px-4 md:px-0 text-center font-medium transition duration-500 ease-in-out transform hover:scale-105 ${activeTab === 'findUsers' ? 'text-blue-300 border-b-2 border-blue-300 scale-100' : 'text-gray-300 hover:text-white'}`}
            onClick={() => setActiveTab('findUsers')}
          >
            <FaUserPlus className="inline-block mr-2" /> Find Users
          </button>
          <button
            className={`flex-none md:flex-1 relative py-4 px-4 md:px-0 text-center font-medium transition duration-500 ease-in-out transform hover:scale-105 ${activeTab === 'requests' ? 'text-blue-300 border-b-2 border-blue-300 scale-100' : 'text-gray-300 hover:text-white'}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests
            {(pendingRequests.length > 0 || pendingGroupRequests.length > 0) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-ping-once">
                {pendingRequests.length + pendingGroupRequests.length}
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
                connections.map((connection) => {
                  const chatId = [currentUser!.uid, connection.id].sort().join('_');
                  const unreadCount = unreadChatCounts[chatId] || 0;
                  return (
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
                      {unreadCount > 0 && (
                        <span className="ml-auto flex items-center justify-center bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full animate-ping-once">
                          {unreadCount}
                        </span>
                      )}
                      <IoIosChatbubbles size={24} className="text-blue-300 ml-2" />
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {/* Your Groups Tab */}
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
                groups.map((group) => {
                  const unreadCount = unreadChatCounts[group.id] || 0;
                  return (
                    <Link
                      key={group.id}
                      to={`/group-chat/${group.id}`}
                      className="flex items-center space-x-4 p-4 border border-white/10 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 hover:bg-white/10 cursor-pointer animate-list-item-enter"
                    >
                      <FaUsers size={48} className="text-gray-400" />
                      <span className="text-lg font-medium text-white">{group.name}</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto flex items-center justify-center bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full animate-ping-once">
                          {unreadCount}
                        </span>
                      )}
                      <IoIosChatbubbles size={24} className="text-blue-300 ml-2" />
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {/* All Groups Tab */}
          {activeTab === 'allGroups' && (
            <div className="space-y-4 animate-fade-in-up">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">Find Groups</h2>
              {allGroups.length === 0 ? (
                <p className="text-center text-gray-400 p-8">No public groups available at the moment.</p>
              ) : (
                allGroups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between space-x-4 animate-list-item-enter transition duration-300 hover:bg-white/10 transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-4">
                      <FaUsers size={48} className="text-gray-400" />
                      <span className="text-lg font-medium text-white">{group.name}</span>
                    </div>
                    <div className="flex space-x-2">
                      {sentGroupRequests.includes(group.id) ? (
                        <span className="text-yellow-400 text-sm italic">Pending...</span>
                      ) : (
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 transition duration-300 transform hover:scale-110"
                          title="Join Group"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Find Users / Create Group Tab */}
          {activeTab === 'findUsers' && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Group Creation Section */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">Create a New Group</h2>
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
                    <h3 className="text-lg font-medium text-white">Select Members (Connections)</h3>
                    <ul className="divide-y divide-white/10 max-h-48 overflow-y-auto custom-scrollbar">
                      {connections.length > 0 ? connections.map((user) => (
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
                        <p className="text-center text-gray-500 py-4">Connect with users to create a group.</p>
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
              </div>

              <div className="h-px bg-white/10 my-8"></div>

              {/* Find Users Section */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white">Users to Connect With</h3>
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
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Connection Requests Section */}
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

              {/* Group Join Requests Section */}
              <div className="h-px bg-white/10 my-8"></div>
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">Group Join Requests</h2>
              {pendingGroupRequests.length === 0 ? (
                <p className="text-center text-gray-400 p-8">You have no new group join requests.</p>
              ) : (
                pendingGroupRequests.map((request) => (
                  <div key={request.requestId} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between space-x-4 animate-list-item-enter transition duration-300 hover:bg-white/10 transform hover:scale-105">
                    <div className="flex items-center space-x-4">
                      <FaUsers size={48} className="text-gray-400" />
                      <div>
                        <span className="text-lg font-medium text-white">{request.sender.firstName} {request.sender.lastName}</span>
                        <p className="text-gray-400 text-sm">wants to join "{request.group.name}"</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveGroupRequest(request.requestId)}
                        className="p-2 text-green-400 hover:text-green-500 transition-colors duration-300 transform hover:scale-125"
                        title="Approve"
                      >
                        <FaCheckCircle size={24} />
                      </button>
                      <button
                        onClick={() => handleDeclineGroupRequest(request.requestId)}
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