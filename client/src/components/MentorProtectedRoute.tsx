// src/components/MentorProtectedRoute.tsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MentorProtectedRoute: React.FC = () => {
    const { userProfile, loading } = useAuth();

    if (loading) {
        // You might want a better loading state here
        return <div>Loading...</div>;
    }

    // Check if the user is authenticated and has the 'mentor' role
    if (userProfile && userProfile.role === 'mentor') {
        return <Outlet />;
    } else {
        // Redirect to a dashboard or a page showing an error
        return <Navigate to="/dashboard" replace />;
    }
};

export default MentorProtectedRoute;