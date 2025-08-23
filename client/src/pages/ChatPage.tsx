import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaArrowDown, FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { IoIosChatbubbles } from 'react-icons/io';

// Import Firestore functions and types
import { db } from '../firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    doc,
    setDoc,
    updateDoc, // Import updateDoc
    serverTimestamp,
    type DocumentData
} from 'firebase/firestore';

const API_URL = import.meta.env.VITE_API_URL;

interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: Date;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
}

const ChatPage: React.FC = () => {
    const { recipientId } = useParams<{ recipientId: string }>();
    const { currentUser, token } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessageText, setNewMessageText] = useState('');
    const [recipient, setRecipient] = useState<User | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [chatDocReady, setChatDocReady] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            const isScrollAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
            setIsAtBottom(isScrollAtBottom);
        }
    };

    // New useEffect to create the chat document first
    useEffect(() => {
        if (!currentUser?.uid || !recipientId) return;

        const chatId = [currentUser.uid, recipientId].sort().join('_');
        const chatDocRef = doc(db, 'chats', chatId);

        const createChatDocument = async () => {
            try {
                await setDoc(chatDocRef, {
                    members: [currentUser.uid, recipientId].sort(),
                    lastMessage: '',
                    updatedAt: serverTimestamp(),
                }, { merge: true });
                setChatDocReady(true);
            } catch (err) {
                console.error('Failed to create chat document:', err);
                setError('Failed to initialize chat.');
            }
        };

        createChatDocument();
    }, [currentUser, recipientId]);

    // This useEffect now depends on chatDocReady
    useEffect(() => {
        if (!currentUser?.uid || !recipientId || !token || !chatDocReady) {
            if (!chatDocReady) {
                setLoading(true);
                return;
            }
            setLoading(false);
            setError('Authentication, token, or recipient ID missing.');
            return;
        }

        const chatId = [currentUser.uid, recipientId].sort().join('_');

        const fetchChatData = async () => {
            try {
                const userResponse = await axios.get(`${API_URL}/users/${recipientId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRecipient(userResponse.data);
            } catch (err) {
                console.error('Failed to fetch chat data:', err);
                setError('Failed to load chat data.');
            } finally {
                setLoading(false);
            }
        };

        fetchChatData();

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages: Message[] = [];
            snapshot.forEach(doc => {
                const data = doc.data() as DocumentData;
                fetchedMessages.push({
                    id: doc.id,
                    senderId: data.senderId,
                    text: data.text,
                    createdAt: data.createdAt?.toDate() || new Date(),
                });
            });
            setMessages(fetchedMessages);
        }, (err) => {
            console.error('Failed to listen to messages:', err);
            setError('Failed to load messages in real-time. Check permissions.');
        });

        return () => unsubscribe();
    }, [currentUser, recipientId, token, chatDocReady]);

    // === NEW useEffect to update lastRead timestamp ===
    useEffect(() => {
        if (!currentUser?.uid || !recipientId) return;

        const chatId = [currentUser.uid, recipientId].sort().join('_');
        const chatDocRef = doc(db, 'chats', chatId);

        const updateLastRead = async () => {
            try {
                await updateDoc(chatDocRef, {
                    [`lastRead.${currentUser.uid}`]: serverTimestamp(),
                });
            } catch (error) {
                console.error("Failed to update last read timestamp:", error);
            }
        };

        updateLastRead();
    }, [currentUser, recipientId]);
    // ====================================================

    useEffect(() => {
        if (isAtBottom) {
            scrollToBottom();
        }
    }, [messages, isAtBottom]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const messageText = newMessageText.trim();
        if (messageText === '' || !currentUser?.uid || !recipientId) return;

        const chatId = [currentUser.uid, recipientId].sort().join('_');
        const chatDocRef = doc(db, 'chats', chatId);

        try {
            // Add the new message to the messages subcollection
            await addDoc(collection(chatDocRef, 'messages'), {
                senderId: currentUser.uid,
                text: messageText,
                createdAt: serverTimestamp(),
            });

            // Update the main chat document with the last message and timestamp
            await updateDoc(chatDocRef, {
                lastMessage: messageText,
                updatedAt: serverTimestamp(),
            });

            // Reset the input field
            setNewMessageText('');
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message.');
        }
    };

    if (loading) return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950 text-white z-50">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-fuchsia-500"></div>
        </div>
    );
    if (error) return <div className="text-center mt-24 text-red-500">{error}</div>;

    const chatTitle = recipient ? `${recipient.firstName} ${recipient.lastName}` : 'Chat';

    return (
        <div className="min-h-screen w-full bg-slate-950 text-white flex justify-center items-center py-16 px-4 mt-8 relative overflow-hidden">
            {/* Background Gradients and Particles */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-0 left-0 w-80 h-80 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl mx-auto backdrop-blur-3xl bg-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] md:h-[90vh]">

                <div className="p-4 md:p-6 bg-white/5 border-b border-white/10 flex items-center space-x-4 animate-fade-in-down">
                    <button onClick={() => navigate('/community')} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors duration-200">
                        <FaArrowLeft className="text-white text-xl" />
                    </button>
                    {recipient?.avatar ? (
                        <img src={recipient.avatar} alt={`${recipient.firstName}`} className="w-12 h-12 rounded-full object-cover border-2 border-fuchsia-300" />
                    ) : (
                        <FaUserCircle size={48} className="text-gray-400" />
                    )}
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">{chatTitle}</h1>
                </div>

                <div
                    className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar"
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                >
                    {messages.length > 0 ? (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex animate-message-enter ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`p-4 rounded-3xl max-w-[80%] md:max-w-[70%] text-sm md:text-base backdrop-blur-sm transition-all duration-300 transform hover:scale-[1.02] ${
                                        msg.senderId === currentUser?.uid
                                            ? 'bg-blue-600/60 text-white shadow-lg'
                                            : 'bg-gray-700/60 text-gray-200 shadow-md'
                                    }`}
                                >
                                    {msg.text}
                                    <span className={`block mt-1 text-[10px] opacity-70 ${msg.senderId === currentUser?.uid ? 'text-right' : 'text-left'}`}>
                                        {msg.createdAt.toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 animate-fade-in">
                            <IoIosChatbubbles size={64} className="mx-auto mb-4 text-gray-600" />
                            <p className="text-lg">Start the conversation!</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {!isAtBottom && (
                    <button
                        onClick={scrollToBottom}
                        className="absolute bottom-24 right-8 p-3 rounded-full bg-fuchsia-500 text-white shadow-xl hover:bg-fuchsia-600 transition-all duration-300 transform hover:scale-110 animate-bounce-faded"
                        aria-label="Scroll to bottom"
                    >
                        <FaArrowDown />
                    </button>
                )}

                <form onSubmit={handleSendMessage} className="p-4 md:p-6 bg-white/5 border-t border-white/10 flex space-x-3 items-center">
                    <input
                        type="text"
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 p-3 bg-gray-800/80 rounded-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500 placeholder-gray-400 text-white transition-all duration-300"
                    />
                    <button
                        type="submit"
                        disabled={!newMessageText.trim()}
                        className="p-3 bg-gradient-to-r from-blue-500 to-fuchsia-600 text-white rounded-full hover:from-blue-600 hover:to-fuchsia-700 transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        <FaPaperPlane />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;