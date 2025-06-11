import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import BG from '../assets/bg.png';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const {email} = location.state || {};

const token = new URLSearchParams(location.search).get('token');

const handleSubmit = async (e) => {
  e.preventDefault();

  if (newPassword !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  if (!email) {
    setError('Missing email. Please restart the reset process.');
    return;
  }

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
      email,
      newPassword,
    });

    if (response.data.success) {
      setSuccessMessage('Password has been reset!');
      setTimeout(() => navigate('/payroll-management-login'), 2000);
    } else {
      setError(response.data.error);
    }
  } catch (err) {
    setError('Something went wrong. Try again.');
  }
};



  return (
    <div
      className="flex flex-col items-center h-screen justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${BG})` }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded mb-4"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter your new password"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full border px-3 py-2 rounded mb-4"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your new password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
