import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminProtectedRoute: React.FC = () => {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; 
    }

    return currentUser && userProfile?.role === 'admin' ? (
        <Outlet />
    ) : (
        <Navigate to="/" replace />
    );
};

export default AdminProtectedRoute;