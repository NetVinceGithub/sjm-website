import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Logins = () => {
  const [loginRecords, setLoginRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoginRecords = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/login/login-history`);
        console.log('API response:', response.data);

        const transformedRecords = response.data.data.map(record => ({
          id: record.id,
          userName: record.User.name,
          email: record.User.email,
          role: record.User.name === 'Admin' ? 'Admin' : 'User', // Adjust role logic as needed
          loginTime: record.loginTime,
          ipAddress: record.ipAddress,
          device: parseUserAgent(record.userAgent),
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
    <div className="p-6 h-full">
      <div className="flex justify-between items-center -mt-3 mb-8">
        <h1 className="text-neutralDGray text-lg font-semibold">Website Access Log</h1>
      </div>
  
      {loginRecords.length === 0 ? (
        <div className="text-center text-gray-500">No login records found.</div>
      ) : (
        <div
          className="-mt-5 h-[70vh] mr-5 overflow-y-auto flex justify-center"
        >
          <table
            className="bg-white shadow-md rounded-lg overflow-hidden table-fixed w-full" // fixed table width matching container
          >
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-4 text-left" style={{ width: '15%' }}>User</th>
                <th className="py-3 px-4 text-left" style={{ width: '20%' }}>Email</th> {/* Adjusted */}
                <th className="py-3 px-4 text-left" style={{width: '20%'}}>Activity Type</th>
                <th className="py-3 px-4 text-left" style={{ width: '15%' }}>Role</th>
                <th className="py-3 px-4 text-left" style={{ width: '20%' }}>Timestamp</th> {/* Adjusted */}
                <th className="py-3 px-4 text-left" style={{ width: '10%' }}>Device</th>
              </tr>
            </thead>
  
            <tbody className="text-gray-600 text-sm font-light">
              {loginRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-gray-200 hover:bg-gray-100 transition duration-200"
                >
                  <td
                    className="py-3 px-4 text-left whitespace-nowrap truncate"
                    title={record.userName}
                  >
                    <span className="font-medium">{record.userName}</span>
                  </td>
                  <td className="py-3 px-4 text-left truncate" title={record.email}>
                    <span>{record.email}</span>
                  </td>
                  <td className="py-3 px-4 text-left truncate">
                      <span></span>
                  </td>
                  <td className="py-3 px-4 text-left">
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
                  <td
                    className="py-3 px-4 text-left truncate"
                    title={new Date(record.loginTime).toLocaleString()}
                  >
                    <span>{new Date(record.loginTime).toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4 text-left truncate" title={record.device}>
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
