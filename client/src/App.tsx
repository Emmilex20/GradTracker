import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import essential, small components directly for the initial load
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';

// Lazily import the larger page components to be loaded on demand
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const MentorsPage = lazy(() => import('./pages/MentorsPage'));
const MentorshipConnectionsPage = lazy(() => import('./pages/MentorshipConnectionsPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const SupportPage = lazy(() => import('./components/Support'));
const FAQsPage = lazy(() => import('./components/FAQs'));

// Authentication components
const Signup = lazy(() => import('./components/Signup'));
const Login = lazy(() => import('./components/Login'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));

// Application-specific components
const Dashboard = lazy(() => import('./components/Dashboard'));
const ProgramList = lazy(() => import('./components/ProgramList'));
const ProgramSearch = lazy(() => import('./components/ProgramSearch'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

// Social Communication components
const ConnectionsPage = lazy(() => import('./pages/ConnectionsPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const GroupsPage = lazy(() => import('./pages/GroupsPage'));
const GroupChatPage = lazy(() => import('./pages/GroupChatPage'));
const GroupCallComponent = lazy(() => import('./components/GroupCallComponent'));

// Protected Routes
import AdminProtectedRoute from './components/AdminProtectedRoute';
import MentorProtectedRoute from './components/MentorProtectedRoute';

// A simple protected route that checks for authentication
const ProtectedRoute: React.FC = () => {
    const { currentUser } = useAuth();
    return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
    return (
        <Layout>
            <ScrollToTop />
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/programs" element={<ProgramList />} />
                    <Route path="/search" element={<ProgramSearch />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/mentors" element={<MentorsPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/faqs" element={<FAQsPage />} />
                    
                    {/* Authenticated Routes (for all logged-in users) */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/connections" element={<ConnectionsPage />} />
                        <Route path="/chat/:recipientId" element={<ChatPage />} />
                        <Route path="/groups" element={<GroupsPage />} />
                        <Route path="/group-chat/:groupId" element={<GroupChatPage />} />
                        <Route path="/group-call/:groupId" element={<GroupCallComponent />} />
                        <Route path="/community" element={<CommunityPage />} />
                    </Route>

                    {/* Admin-Only Routes */}
                    <Route element={<AdminProtectedRoute />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/mentorship-connections" element={<MentorshipConnectionsPage />} />
                    </Route>

                    {/* Mentor-Only Routes */}
                    <Route element={<MentorProtectedRoute />}>
                        <Route path="/mentor/connections" element={<MentorshipConnectionsPage />} />
                    </Route>
                </Routes>
                <ProfileSetupModal />
            </Suspense>
        </Layout>
    );
};

export default App;