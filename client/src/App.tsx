import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Signup from './components/Signup';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import ProgramList from './components/ProgramList';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import ContactPage from './pages/ContactPage';
import ProgramSearch from './components/ProgramSearch';
import ScrollToTop from './components/ScrollToTop';
import AdminDashboard from './components/AdminDashboard'; // Import the new dashboard
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

                {/* Authenticated Routes (for all logged-in users) */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                </Route>

                {/* Admin-Only Route */}
                <Route element={<AdminProtectedRoute />}>
                    {/* The single route for the Admin Dashboard */}
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>
            </Routes>
        </Layout>
    );
};

export default App;