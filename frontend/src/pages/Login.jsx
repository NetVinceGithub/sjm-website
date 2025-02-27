import axios from 'axios';
import React, { useState } from 'react'; 
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('');  
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState(null);
  const {login} = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => { 
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
  
      if (response.data.success) {
        login(response.data.user);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", response.data.user.role);  // ✅ Store role in localStorage
  
        if (response.data.user.role === "admin") {
          navigate('/admin-dashboard');
        } else {
          navigate('/admin-dashboard/employees'); // ✅ Redirect to employee dashboard instead
        }
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        setError(error.response.data.error);
      } else {
        setError("Server Error");
      }
    }
  };
  

  return (
    <div
      className="flex flex-col items-center h-screen justify-center bg-gradient-to-b from-teal-600 to-gray-100 space-y-6"
    >
      <h2 className="font-sevillana text-3xl text-white">Payroll System</h2>
      <div className="border shadow p-6 w-80 bg-white">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border"
              placeholder="Enter Email"
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"  // Added autocomplete attribute
            />

          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">Password</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border"
              placeholder="*********"
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"  // Added autocomplete attribute
            />

          </div>
          <div className="mb-4 flex items-center justify-between">
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2 text-gray-700">Remember me</span>
            </label>
            <a href="#" className="text-teal-600">
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2"
          >
            Login
          </button>
        </form>  
      </div>
    </div>
  )
}

export default Login;
