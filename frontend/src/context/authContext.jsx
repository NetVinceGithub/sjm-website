import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      console.log('AuthContext: Token from localStorage:', token); // Debug
      
      if (token) {
        try {
          // Use the correct endpoint from your routes
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/current`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json'
            },
          });

          console.log('AuthContext: Verification response:', response.data); // Debug

          if (response.data.success) {
            setUser(response.data.user);
          } else {
            console.warn('AuthContext: Verification failed');
            setUser(null);
            localStorage.removeItem('token'); // Clear invalid token
          }
        } catch (error) {
          console.error('AuthContext: Verification error:', error);
          setUser(null);
          localStorage.removeItem('token'); // Clear invalid token
        }
      } else {
        console.log('AuthContext: No token found');
        setUser(null);
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = (userData) => {
    console.log('AuthContext: Login called with:', userData); // Debug
    // Don't overwrite the token - it's already stored in Login component
    // Just set the user data
    setUser(userData);
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    
    // Call logout API if token exists
    if (token) {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          },
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }
    
    // Clear local state and storage
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);

export default AuthContext;