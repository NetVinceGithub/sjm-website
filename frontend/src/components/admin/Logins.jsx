import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Logins = () => {
  const [loginRecords, setLoginRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoginRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/login/login-history');
        console.log('API response:', response.data); // helpful log
        
        // Transform the data to match the previous component's structure
        const transformedRecords = response.data.data.map(record => ({
          id: record.id,
          userName: record.User.name,
          email: record.User.email,
          role: record.User.name === 'Admin' ? 'Admin' : 'User', // Adjust role logic as needed
          loginTime: record.loginTime,
          ipAddress: record.ipAddress,
          device: parseUserAgent(record.userAgent)
        }));

        setLoginRecords(transformedRecords);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching login records:', err);
        setError('Failed to fetch login records');
        setLoading(false);
      }
    };

    fetchLoginRecords();
  }, []);

  // Helper function to extract device information from user agent
  const parseUserAgent = (userAgent) => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Macintosh')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('iPhone')) return 'iOS';
    if (userAgent.includes('Android')) return 'Android';
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Website Access Log</h1>
      
      {loginRecords.length === 0 ? (
        <div className="text-center text-gray-500">
          No login records found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">User</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Role</th>
                <th className="py-3 px-6 text-left">Login Time</th>
                <th className="py-3 px-6 text-left">IP Address</th>
                <th className="py-3 px-6 text-left">Device</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {loginRecords.map((record) => (
                <tr 
                  key={record.id} 
                  className="border-b border-gray-200 hover:bg-gray-100 transition duration-200"
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium">{record.userName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span>{record.email}</span>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span 
                      className={`
                        px-3 py-1 rounded-full text-xs
                        ${record.role === 'Admin' ? 'bg-green-200 text-green-800' : 
                          record.role === 'User' ? 'bg-blue-200 text-blue-800' : 
                          'bg-gray-200 text-gray-800'}
                      `}
                    >
                      {record.role}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span>{new Date(record.loginTime).toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span>{record.ipAddress}</span>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span>{record.device}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Logins;