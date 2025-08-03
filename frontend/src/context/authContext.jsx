import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fixed: Using the correct API endpoint that matches your routes
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success) {
            setUser(response.data.user);
          } else {
            console.log('Invalid token response:', response.data);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
          }
        } catch (error) {
          console.error('Auth verification error:', error);
          console.log('Error response:', error.response?.data);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
    // Make sure the role is also set in localStorage if not already done
    if (userData.role) {
      localStorage.setItem('userRole', userData.role);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    
    // Call logout endpoint to invalidate token on server
    if (token) {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout API error:', error);
        // Continue with client-side logout even if API call fails
      }
    }

    // Clear all auth-related data
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    localStorage.removeItem("rememberMe");
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);
export default AuthContext;