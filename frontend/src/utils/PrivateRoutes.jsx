import React from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import LOGO from "../assets/logo.png"; // Adjust the path as necessary

const PrivateRoutes = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen relative">
        <div className="relative w-[120px] h-[120px]">
          <TailSpin
            visible={true}
            height="120"
            width="120"
            color="#4fa94d"
            ariaLabel="tail-spin-loading"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={LOGO} alt="Logo" className="w-16 h-16" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/payroll-management-login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" />;
  }

  return children;
};


export default PrivateRoutes;