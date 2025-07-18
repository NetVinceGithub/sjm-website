import React from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import LOGO from "../assets/logo.png"; // Adjust the path as necessary

const PrivateRoutes = ({ children }) => {
  const { user, loading } = useAuth();

  console.log("PrivateRoutes - user:", user); // Add this line
  console.log("PrivateRoutes - loading:", loading); // Add this line

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
  return user ? children : <Navigate to="/payroll-management-login" />;
};

export default PrivateRoutes;
