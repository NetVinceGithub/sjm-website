// Simplified Login.jsx - No CSRF, Pure API Token Authentication
import axios from 'axios';
import React, { useState, useEffect } from 'react'; 
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import BG from '../assets/bg.png';

// Configure axios defaults for API-only authentication
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const Login = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only remember email, NEVER store passwords in localStorage
    const savedEmail = localStorage.getItem('email');
    const savedChecked = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && savedChecked) {
      setEmail(savedEmail);
      setIsChecked(true);
    }

    // Set up axios interceptor to include token in all requests
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    try {
      console.log('API URL:', import.meta.env.VITE_API_URL);
      console.log('Attempting login...');
  
      // Direct API call - No CSRF cookie needed
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { 
          email: email.trim(), 
          password: password 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );
  
      console.log('Login response:', response.data);
  
      // Handle successful login
      if (response.data.success) {
        const { user, token } = response.data;
        
        // Set up axios for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Store token and user info
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', user.role);
        
        // Update auth context
        login(user, token);
  
        // Handle remember me
        if (isChecked) {
          localStorage.setItem('email', email);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('email');
          localStorage.removeItem('rememberMe');
        }
  
        // Navigate based on role
        if (user.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/admin-dashboard/employees');
        }
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
  
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.log('Error response:', { status, data });
        
        switch (status) {
          case 422:
            setError(data.error || 'Please check your input and try again.');
            break;
          case 401:
            setError(data.error || 'Invalid email or password.');
            break;
          case 403:
            setError(data.error || 'Access denied. Please contact administrator.');
            break;
          case 404:
            setError('Service not found. Please contact support.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(data.error || `Error ${status}: Please try again.`);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        console.error('Request setup error:', error.message);
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div
      className="flex flex-col items-center h-screen backdrop-blur-lg justify-center space-y-6 absolute inset-0 bg-cover bg-center px-4"
      style={{
        backgroundImage: `url(${BG})`,
        opacity: 0.7,
        zIndex: -1,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="border shadow-black rounded-lg shadow-lg p-6 bg-white w-full sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] max-w-md">
        <h2 className="font-inter text-[28px] text-center font-bold text-neutralDGray">
          Payroll Management Login
        </h2>
        <hr className="my-3 mb-4" />

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="block mb-2 text-neutralGray">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brandPrimary"
              placeholder={isEmailFocused ? "" : "Enter Email"}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="block mb-2 text-neutralGray">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brandPrimary"
              placeholder={isPasswordFocused ? "" : "Enter Password"}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <div className="mb-5 flex items-center justify-between">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox accent-neutralDGray checked:accent-brandPrimary"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
                disabled={isLoading}
              />
              <span
                className={`ml-2 text-sm transition-colors ${
                  isChecked ? "text-brandPrimary" : "text-neutralGray"
                }`}
              >
                Remember me
              </span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-brandPrimary text-sm hover:text-neutralDGray no-underline hover:underline"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-brandPrimary hover:bg-neutralDGray rounded-md text-white py-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Debug info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
            <strong>Debug Info:</strong><br />
            API URL: {import.meta.env.VITE_API_URL}<br />
            Test credentials: admin@example.com / password123
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;