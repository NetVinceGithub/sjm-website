import React from 'react'
import { useAuth } from '../context/authContext'
import { Navigate } from 'react-router-dom'

const PrivateRoutes = ({ children }) => {
  const { user, loading } = useAuth();

  console.log("PrivateRoutes - user:", user); // Add this line
  console.log("PrivateRoutes - loading:", loading); // Add this line

  if (loading) {
    return <div>Loading.....</div>;
  }

  return user ? children : <Navigate to="/payroll-management-login" />;
};


export default PrivateRoutes