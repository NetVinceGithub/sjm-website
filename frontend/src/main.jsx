import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Ensure the BrowserRouter is imported
import './index.css';
import App from './App';
import AuthContext from './context/authContext'; // Import the AuthContext

// Wrap the app with Router and AuthContext
ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <AuthContext>
      <App />
    </AuthContext>
  </Router>
);
