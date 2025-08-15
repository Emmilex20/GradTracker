import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = API_URL;

interface Message {
    id: string;
    senderId: string;
    recipientId: string;
    text: string;
    createdAt: string;
}

const ChatComponent: React.FC<{ recipientId: string }> = ({ recipientId }) => {
    const { currentUser } = useAuth(); // `currentUser` is now used for `uid`
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatId = [currentUser?.uid, recipientId].sort().join('_'); // Use currentUser for uid

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!currentUser?.uid) return; // Use `currentUser?.uid` for the user ID

        socketRef.current = io(SOCKET_URL);

        socketRef.current.emit('join_chat', chatId);

        socketRef.current.on('receive_message', (message: Message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [currentUser, chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !currentUser?.uid) return;

        const messageData = {
            chatId,
            senderId: currentUser.uid, // Use `currentUser.uid`
            recipientId,
            text: newMessage,
        };

        socketRef.current?.emit('send_message', messageData);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-lg overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`} // Use `currentUser?.uid`
                    >
                        <div
                            className={`p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg ${
                                msg.senderId === currentUser?.uid ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
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

export default ChatComponent;