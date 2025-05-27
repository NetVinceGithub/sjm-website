import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';

const Logins = () => {
  const [loginRecords, setLoginRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parseUserAgent = (userAgent) => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Macintosh')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('iPhone')) return 'iOS';
    if (userAgent.includes('Android')) return 'Android';
    return 'Unknown';
  };

  useEffect(() => {
    const fetchLoginRecords = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/login/login-history`);
        const transformedRecords = response.data.data.map(record => ({
          id: record.id,
          userName: record.User.name,
          email: record.User.email,
          role: record.User.name === 'Admin' ? 'Admin' : 'User',
          loginTime: new Date(record.loginTime).toLocaleString(),
          ipAddress: record.ipAddress,
          device: parseUserAgent(record.userAgent),
        }));
        setLoginRecords(transformedRecords);
      } catch (err) {
        setError('Failed to fetch login records');
      } finally {
        setLoading(false);
      }
    };

    fetchLoginRecords();
  }, []);

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#f9fafb',
        fontSize: '13px',
        fontWeight: '600',
        color: '#374151',
        padding: '8px',
      },
    },
    rows: {
      style: {
        fontSize: '13px',
        color: '#4B5563',
        minHeight: '40px',
        borderBottom: '1px solid #e5e7eb',
      },
    },
    cells: {
      style: {
        padding: '8px',
      },
    },
  };

  return (
    <div className="p-6 h-[calc(100vh-150px)] ">
      <h1 className="text-neutralDGray text-lg font-semibold -mt-3 mb-4">Website Access Log</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      <div className="-mt-3 rounded-lg border">
        <DataTable
          columns={[
            {
              name: 'User',
              selector: row => row.userName,
              sortable: true,
              wrap: true,
            },
            {
              name: 'Email',
              selector: row => row.email,
              sortable: true,
              wrap: true,
            },
            {
              name: 'Activity Type',
              selector: row => 'Login',
              sortable: false,
            },
            {
              name: 'Role',
              selector: row => row.role,
              sortable: true,
              cell: row => (
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    row.role === 'Admin'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-blue-200 text-blue-800'
                    }`}
                >
                  {row.role}
                </span>
              ),
            },
            {
              name: 'Timestamp',
              selector: row => row.loginTime,
              sortable: true,
              wrap: true,
            },
            {
              name: 'Device',
              selector: row => row.device,
              sortable: false,
              width: '80px',
            },
          ]}
          data={loginRecords}
          paginationPerPage={12}
          progressPending={loading}
          pagination
          responsive
          highlightOnHover
          striped
          customStyles={customStyles}
          noDataComponent="No login records found."
        />
      </div>
    </div>
  );
};

export default Logins;
