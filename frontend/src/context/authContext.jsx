import React, { createContext, useContext, useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Create a context
const UserContext = createContext();

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  // Initialize navigate from useNavigate hook

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://localhost:5000/api/auth/verify', {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          if (response.data.success) {
            setUser(response.data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    sessionStorage.removeItem("token");

    // Reset user state in context
    setUser(null);
    navigate("/login");  // Redirect to login page
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);

export default AuthContext;
