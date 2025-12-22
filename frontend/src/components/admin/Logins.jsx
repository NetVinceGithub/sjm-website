import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { ThreeDots } from "react-loader-spinner";
import { toast } from "react-toastify";

const Logins = () => {
  const [loginRecords, setLoginRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parseUserAgent = (userAgent) => {
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Macintosh")) return "Mac";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("iPhone")) return "iOS";
    if (userAgent.includes("Android")) return "Android";
    return "Unknown";
  };

  const getLogoutTime = (sessionId) => {
    const logoutData = localStorage.getItem(`logout_${sessionId}`);
    return logoutData ? JSON.parse(logoutData) : null;
  };

  useEffect(() => {
    const fetchLoginRecords = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/login/login-history`
        );
        const transformedRecords = response.data.data.map((record) => {
          const sessionId = record.sessionId || record.id;
          const logoutInfo = getLogoutTime(sessionId);

          return {
            id: record.id,
            userId: record.User.id,
            userName: record.User.name,
            email: record.User.email,
            role: record.User.name === "Approver" ? "Admin" : "Approver",
            loginTime: new Date(record.loginTime).toLocaleString(),
            logoutTime: logoutInfo
              ? new Date(logoutInfo.logoutTime).toLocaleString()
              : "Still logged in",
            ipAddress: record.ipAddress,
            device: parseUserAgent(record.userAgent),
            sessionId: sessionId,
          };
        });
        setLoginRecords(transformedRecords);
      } catch (err) {
        toast("Failed to fetch login records.", {
          position: "top-right",
          autoClose: 2000,
          closeButton: false,
          closeOnClick: true,
          hideProgressBar: true,
          icon: <span style={{ fontSize: "13px" }}>⚠️</span>,
          style: {
            fontSize: "13px",
            padding: "6px 12px",
            width: "auto",
            minHeight: "10px",
          },
        });
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
      name: "Login Time",
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
    <div className="p-2 bg-white rounded shadow -mt-3">
      <h1 className="text-neutralDGray text-base font-medium mb-4">
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
          progressPending={loading}
          progressComponent={
            <div className="flex justify-center items-center gap-2 text-gray-600 text-sm">
              <ThreeDots
                visible={true}
                height="60"
                width="60"
                color="#4fa94d"
                radius="9"
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                wrapperClass=""
              />
            </div>
          }
          noDataComponent={
            <div className="text-gray-500 text-sm italic py-4 text-center">
              *** No data found ***
            </div>
          }
          paginationPerPage={12}
          pagination
          responsive
          highlightOnHover
          striped
          customStyles={customStyles}
        />
      </div>
    </div>
  );
};

export default Logins;
