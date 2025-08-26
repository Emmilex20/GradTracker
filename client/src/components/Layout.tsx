import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import NotificationBell from './common/NotificationBell';
import VercelAnalytics from './VercelAnalytics'; // Import the new component

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            {/* The notification bell is placed here to be present on all pages */}
            <div className="fixed bottom-6 right-6 z-50">
                <NotificationBell />
            </div>
            <Footer />
            {/* Vercel Analytics component added here for global tracking */}
            <VercelAnalytics />
        </div>
    );
};

export default Layout;