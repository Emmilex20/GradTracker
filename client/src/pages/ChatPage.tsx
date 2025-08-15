import React from 'react';
import { useParams } from 'react-router-dom';
import ChatComponent from '../components/ChatComponent';

const ChatPage: React.FC = () => {
    const { recipientId } = useParams<{ recipientId: string }>();

    if (!recipientId) {
        return <p className="text-center mt-24">Select a connection to start chatting.</p>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-24 h-[calc(100vh-10rem)]">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Chat</h1>
            <div className="h-full">
                <ChatComponent recipientId={recipientId} />
            </div>
        </div>
    );
};

export default ChatPage;