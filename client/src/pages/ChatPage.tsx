import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

const ChatPage: React.FC = () => {
  const { recipientId } = useParams<{ recipientId: string }>();
  const { currentUser, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [recipient, setRecipient] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef<Socket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!currentUser?.uid || !recipientId || !token) {
      setLoading(false);
      setError('Authentication, token, or recipient ID missing.');
      return;
    }

    // Generate a unique, consistent chatId for one-on-one chat
    const chatId = [currentUser.uid, recipientId].sort().join('_');

    // Fetch initial messages and recipient data from the backend API
    const fetchChatData = async () => {
      try {
        // Fetch recipient's user data
        const userResponse = await axios.get(`${API_URL}/users/${recipientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecipient(userResponse.data);

        // Fetch initial messages for the chat
        const messagesResponse = await axios.get(`${API_URL}/messages/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(messagesResponse.data);
      } catch (err) {
        console.error('Failed to fetch chat data:', err);
        setError('Failed to load chat data.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();

    // Set up Socket.IO for real-time updates
    const socket = io(API_URL);
    socketRef.current = socket;

    socket.emit('join_chat', chatId);

    socket.on('receive_message', (message: Message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, [currentUser, recipientId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessageText.trim() === '' || !currentUser?.uid || !recipientId) return;

    // Generate the consistent chatId again for the message data
    const chatId = [currentUser.uid, recipientId].sort().join('_');

    const messageData = {
      chatId,
      senderId: currentUser.uid,
      text: newMessageText,
    };

    try {
      // Send message to the backend via Socket.IO
      socketRef.current?.emit('send_message', messageData);
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };



  if (loading) return <div className="text-center mt-24">Loading chat...</div>;
  if (error) return <div className="text-center mt-24 text-red-500">{error}</div>;

  const chatTitle = recipient ? `Chat with ${recipient.firstName} ${recipient.lastName}` : 'Chat';

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-24 h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex justify-between items-center bg-white shadow-md p-4 rounded-t-lg">
        <h1 className="text-xl font-bold text-gray-800">{chatTitle}</h1>
        {/* Video call link */}
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

export default ChatPage;