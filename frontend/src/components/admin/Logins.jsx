import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

const Logins = () => {
  const [loginRecords, setLoginRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  const parseUserAgent = (userAgent) => {
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Macintosh")) return "Mac";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("iPhone")) return "iOS";
    if (userAgent.includes("Android")) return "Android";
    return "Unknown";
  };

  const fetchUserActivities = async (userId, sessionId) => {
    try {
      // Fetch user activities for the specific session
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/activity/user-activities/${userId}?sessionId=${sessionId}`
      );
      return response.data.data || [];
    } catch (err) {
      console.error("Failed to fetch user activities:", err);
      return [];
    }
  };

  const toggleRowExpansion = async (recordId, userId, sessionId) => {
    if (expandedRows[recordId]) {
      // Collapse row
      setExpandedRows((prev) => ({
        ...prev,
        [recordId]: null,
      }));
    } else {
      // Expand row and fetch activities
      const activities = await fetchUserActivities(userId, sessionId);
      setExpandedRows((prev) => ({
        ...prev,
        [recordId]: activities,
      }));
    }
  };

  const ActivityRow = ({ activities }) => {
    if (!activities || activities.length === 0) {
      return (
        <div className="p-4 bg-gray-50 border-t">
          <p className="text-sm text-gray-500 italic">
            No activities recorded for this session
          </p>
        </div>
      );
    }

    return (
      <div className="p-2 bg-gray-50 border-t">
        <h4 className="font-semibold text-sm text-gray-700 mb-3">
          Session Activities:
        </h4>
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white p-3 rounded border text-sm"
            >
              <div className="flex-1">
                <span className="font-medium text-gray-800">
                  {activity.action}
                </span>
                {activity.resource && (
                  <span className="text-gray-600 ml-2">
                    on {activity.resource}
                  </span>
                )}
                {activity.details && (
                  <div className="text-gray-500 text-xs mt-1">
                    {activity.details}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchLoginRecords = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/login/login-history`
        );
        const transformedRecords = response.data.data.map((record) => ({
          id: record.id,
          userId: record.User.id,
          userName: record.User.name,
          email: record.User.email,
          role: record.User.name === "Approver" ? "Admin" : "Approver",
          loginTime: new Date(record.loginTime).toLocaleString(),
          ipAddress: record.ipAddress,
          device: parseUserAgent(record.userAgent),
          sessionId: record.sessionId || record.id, // Use sessionId if available, fallback to record id
        }));
        setLoginRecords(transformedRecords);
      } catch (err) {
        setError("Failed to fetch login records");
      } finally {
        setLoading(false);
      }
    };

    fetchLoginRecords();
  }, []);

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#f9fafb",
        fontSize: "13px",
        fontWeight: "600",
        color: "#374151",
        padding: "8px",
      },
    },
    rows: {
      style: {
        fontSize: "13px",
        color: "#4B5563",
        minHeight: "40px",
        borderBottom: "1px solid #e5e7eb",
      },
    },
    cells: {
      style: {
        padding: "8px",
      },
    },
    expanderButton: {
      style: {
        color: "#6B7280",
        fontSize: "16px",
        padding: "0 8px",
      },
    },
  };

  const columns = [
    {
      name: "User",
      selector: (row) => row.userName,
      sortable: true,
      wrap: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      wrap: true,
    },
    {
      name: "Activity Type",
      selector: (row) => "Login",
      sortable: false,
    },
    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            row.role === "Approver"
              ? "bg-green-200 text-green-800"
              : "bg-blue-200 text-blue-800"
          }`}
        >
          {row.role}
        </span>
      ),
    },
    {
      name: "Timestamp",
      selector: (row) => row.loginTime,
      sortable: true,
      wrap: true,
    },
    {
      name: "Device",
      selector: (row) => row.device,
      sortable: false,
      width: "80px",
    },
  ];

  return (
    <div className="p-2">
      <h1 className="text-neutralDGray text-lg font-semibold -mt-3 mb-4">
        Website Access Log
      </h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      <div className="-mt-3 rounded-lg border">
        <DataTable
          columns={columns}
          data={loginRecords}
          expandableRows
          expandableRowsComponent={({ data }) => (
            <ActivityRow activities={expandedRows[data.id]} />
          )}
          expandableRowExpanded={(row) => !!expandedRows[row.id]}
          progressPending={loading}
          progressComponent={
            <div className="flex justify-center items-center gap-2 py-4 text-gray-600 text-sm">
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></span>
              Loading data...
            </div>
          }
          paginationPerPage={12}
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
