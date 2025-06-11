import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import BG from '../assets/bg.png';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      if (res.data.success) {
        setSuccessMessage("A verification code has been sent to your email.");
        setIsCodeModalOpen(true);
        setError('');
      } else {
        setError(res.data.error);
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-code`, { email, code });
      if (res.data.success) {
        setIsCodeModalOpen(false);
        setIsPasswordModalOpen(true);
        navigate('/reset-password', {state:{email}});
      } else {
        setError(res.data.error);
      }
    } catch (err) {
      setError("Invalid code. Try again.");
    }
  };



  return (
    <div className="flex flex-col items-center h-screen justify-center bg-cover bg-center" style={{ backgroundImage: `url(${BG})` }}>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
        {error && <p className="text-red-500">{error}</p>}
        {successMessage && <p className="text-green-500">{successMessage}</p>}
        <form onSubmit={handleForgotPasswordSubmit}>
          <label className="block mb-2">Email Address</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Send Verification Code
          </button>
        </form>
      </div>

      <Modal
          isOpen={isCodeModalOpen}
          onRequestClose={() => setIsCodeModalOpen(false)}
          contentLabel="Verify Code"
          style={{
            content: {
              width: '400px',
              height: '250px',
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              padding: '2rem',
              borderRadius: '10px',
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 1000,
            },
          }}
        >
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-center">Enter Verification Code</h2>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
            <button
              onClick={handleVerifyCode}
              className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
            >
              Verify Code
            </button>
          </div>
        </Modal>


     
    </div>
  );
};

export default ForgotPassword;
