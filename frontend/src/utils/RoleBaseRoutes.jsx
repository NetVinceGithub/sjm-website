import React from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";

const RoleBaseRoutes = ({ children, requiredRole = [] }) => {
  const { user, loading } = useAuth();

  console.log("RoleBaseRoutes - user:", user);
  console.log("RoleBaseRoutes - loading:", loading);
  console.log("RoleBaseRoutes - requiredRole:", requiredRole);
  console.log("RoleBaseRoutes - user role:", user?.role);

  // If still loading, show nothing (parent PrivateRoutes will handle loading)
  if (loading) {
    return null;
  }

  // If no user, redirect to login (though PrivateRoutes should handle this)
  if (!user) {
    console.log("RoleBaseRoutes: No user, redirecting to login");
    return <Navigate to="/payroll-management-login" replace />;
  }

  // Check if user has required role
  const hasRequiredRole = Array.isArray(requiredRole) 
    ? requiredRole.includes(user.role)
    : user.role === requiredRole;

  console.log("RoleBaseRoutes - hasRequiredRole:", hasRequiredRole);

  if (!hasRequiredRole) {
    console.log(`RoleBaseRoutes: Access denied. Required roles: ${JSON.stringify(requiredRole)}, User role: ${user.role}`);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Required role(s): {Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole}
          </p>
          <p className="text-sm text-gray-500">
            Your role: {user.role}
          </p>RoleBaseRoutes: Access denied. Required roles: ["admin"], User role: hr
          <button 
            onClick={() => window.location.href = '/payroll-management-login'}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // User has required role, render children
  console.log("RoleBaseRoutes: Access granted, rendering children");
  return children;
};

export default RoleBaseRoutes;