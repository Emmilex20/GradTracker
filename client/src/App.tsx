import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import essential, small components directly for the initial load
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';

// Lazily import the larger page components to be loaded on demand
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));

// Authentication components
const Signup = lazy(() => import('./components/Signup'));
const Login = lazy(() => import('./components/Login'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));

// Application-specific components
const Dashboard = lazy(() => import('./components/Dashboard'));
const ProgramList = lazy(() => import('./components/ProgramList'));
const ProgramSearch = lazy(() => import('./components/ProgramSearch'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

// Protected Routes
import AdminProtectedRoute from './components/AdminProtectedRoute';

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

                    {/* Authenticated Routes (for all logged-in users) */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Route>

                    {/* Admin-Only Route */}
                    <Route element={<AdminProtectedRoute />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                </Routes>
            </Suspense>
        </Layout>
    );
};

export default App;