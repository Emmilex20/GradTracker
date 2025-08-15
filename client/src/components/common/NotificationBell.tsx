/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import NotificationModal from './NotificationModal';

const API_URL = import.meta.env.VITE_API_URL;

const NotificationBell: React.FC = () => {
    const { token, userProfile } = useAuth(); // Get currentUser from context
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mentorRequests, setMentorRequests] = useState<any[]>([]); // New state for mentor requests

    const fetchNotifications = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            // Fetch regular notifications
            const notifResponse = await axios.get(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifResponse.data);
            let unread = notifResponse.data.filter((n: any) => !n.read).length;

            // Conditionally fetch mentor requests if the user is a mentor
            if (userProfile?.role === 'mentor') {
                const requestsResponse = await axios.get(`${API_URL}/mentors/requests`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMentorRequests(requestsResponse.data);
                unread += requestsResponse.data.length; // Add pending requests to the unread count
            }

            setUnreadCount(unread);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!token || unreadCount === 0) return;
        try {
            await axios.put(`${API_URL}/notifications/mark-as-read`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };
    
    // New handler function to accept a mentor request
    const handleAcceptRequest = async (requestId: string) => {
        if (!token) return;
        try {
            await axios.post(`${API_URL}/mentors/accept`, { requestId }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Request accepted successfully!');
            // Refresh notifications and requests
            fetchNotifications(); 
        } catch (error) {
            console.error('Error accepting request:', error);
            alert('Failed to accept request.');
        }
    };

    // New handler function to decline a mentor request
    const handleDeclineRequest = async (requestId: string) => {
        if (!token) return;
        try {
            await axios.post(`${API_URL}/mentors/decline`, { requestId }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Request declined.');
            // Refresh notifications and requests
            fetchNotifications();
        } catch (error) {
            console.error('Error declining request:', error);
            alert('Failed to decline request.');
        }
    };


    useEffect(() => {
        fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, userProfile]); // Add currentUser to dependency array

    const handleBellClick = () => {
        setIsModalOpen(true);
        if (unreadCount > 0) {
            handleMarkAllAsRead();
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <button
                onClick={handleBellClick}
                className="relative p-2 rounded-full bg-white shadow-lg text-primary hover:bg-gray-100 transition-colors"
            >
                <FaBell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>
            {isModalOpen && (
                <NotificationModal
                    notifications={notifications}
                    mentorRequests={mentorRequests} // Pass mentor requests to the modal
                    unreadCount={unreadCount}
                    isLoading={isLoading}
                    onClose={handleCloseModal}
                    onAcceptRequest={handleAcceptRequest} // Pass new handler
                    onDeclineRequest={handleDeclineRequest} // Pass new handler
                />
            )}
        </>
    );
};

export default NotificationBell;