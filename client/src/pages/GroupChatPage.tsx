// client/src/pages/GroupChatPage.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaVideo } from 'react-icons/fa';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

// Define the API URL for your backend server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Define the message interface to match the data from your backend
interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: string; // The backend now sends a string ISO date
}

const GroupChatPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef<Socket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!groupId || !currentUser?.uid) {
      setLoading(false);
      setError('Authentication or group ID missing.');
      return;
    }

    // 1. Fetch initial messages from the backend API
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/messages/${groupId}`);
        setMessages(response.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        setError('Failed to load messages.');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    // 2. Set up Socket.IO for real-time updates
    const socket = io(API_URL);
    socketRef.current = socket;

    socket.emit('join_chat', groupId); // Use 'join_chat' as defined in your backend
    
    socket.on('receive_message', (message: Message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, [groupId, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessageText.trim() === '' || !currentUser?.uid) return;

    const messageData = {
      chatId: groupId,
      senderId: currentUser.uid,
      text: newMessageText,
    };

    try {
      // 3. Send message to the backend via Socket.IO
      socketRef.current?.emit('send_message', messageData);
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
      // You could handle this error more gracefully, e.g., show a toast notification
    }
  };

  if (loading) return <div className="text-center mt-24">Loading messages...</div>;
  if (error) return <div className="text-center mt-24 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-24 h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex justify-between items-center bg-white shadow-md p-4 rounded-t-lg">
        <h1 className="text-xl font-bold text-gray-800">Group Chat: {groupId}</h1>
        <Link to={`/group-call/${groupId}`} className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-green-600 transition">
          <FaVideo />
          <span>Join Call</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg ${
                  msg.senderId === currentUser?.uid ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex rounded-b-lg">
        <input
          type="text"
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="ml-2 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default GroupChatPage;