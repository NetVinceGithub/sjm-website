import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import BG from "../assets/bg.png";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = new URLSearchParams(location.search).get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!email) {
      setError("Missing email. Please restart the reset process.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        {
          email,
          newPassword,
        }
      );

      if (response.data.success) {
        setSuccessMessage("Password has been reset!");
        setTimeout(() => navigate("/payroll-management-login"), 2000);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div
      className="flex flex-col items-center h-screen justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${BG})` }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-base text-red-500 mb-2 text-center">
          Reset Password
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {successMessage && (
          <p className="text-green-500 text-center">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3 relative">
            <label
              className="block text-sm mb-1 text-neutralDGray"
              htmlFor="newPassword"
            >
              New Password
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              className="w-full border px-3 py-2 text-sm rounded pr-10"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter your new password"
            />
            <span
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 cursor-pointer text-gray-600"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <div className="mb-3 relative">
            <label
              className="block text-sm mb-1 text-neutralDGray"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="w-full border px-3 py-2 text-sm rounded pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your new password"
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 cursor-pointer text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full border text-neutralDGray h-10 hover:text-white py-2 rounded hover:bg-green-400 transition-all duration-300"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
