import React, { useState, useMemo, useEffect } from "react";
import { Search, Eye, X } from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import DataTable from "react-data-table-component";
import axios from "axios";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import PayslipModal from "../dashboard/payroll/PayslipModal";

dayjs.extend(duration);

const RequestStatus = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelId, setCancelId] = useState(null);



  // Update current time every second for coun tdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchPayslips();
  }, []);

   const fetchPayslips = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payslip`);
        const approvedPayslips = response.data.filter(
          (p) => p.status?.toLowerCase() === "approved"
        );

        // Compute releaseDate for each payslip
        const payslipsWithRelease = approvedPayslips.map((p) => {
          const match = p.cutoffDate.match(/^([A-Za-z]+)\s+(\d+)-\d+,\s*(\d+)$/);
          if (!match) return { ...p, releaseDate: null };

          const [, monthName, startDayStr, yearStr] = match;
          const startDay = parseInt(startDayStr, 10);
          const year = parseInt(yearStr, 10);
          const releaseDay = startDay <= 15 ? 4 : 19;

          const monthNames = {
            January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
            July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
          };

          const monthIndex = monthNames[monthName]; // 0-indexed month

          const releaseDate = dayjs()
            .year(year)
            .month(monthIndex)
            .date(releaseDay)
            .startOf("day");

          return { ...p, releaseDate };
        });

        setPayslips(payslipsWithRelease);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching payslips:", error);
        setLoading(false);
      }
    };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm) return payslips;
    return payslips.filter((row) =>
      Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [payslips, searchTerm]);

  const handleFilter = (e) => setSearchTerm(e.target.value);

  // Format countdown display
  const formatCountdown = (releaseDate) => {
    if (!releaseDate) return <span className="text-gray-400">-</span>;
    
    const now = currentTime;
    const diff = releaseDate.diff(now);
    
    if (diff <= 0) {
      return (
        <div className="text-center">
          <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
            Released!
          </span>
        </div>
      );
    }
    
    const duration = dayjs.duration(diff);
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    
    
    if (days > 0) {
      return (
        <div className="text-center">
          <div className="text-blue-600 font-mono text-sm font-semibold">
            {days}d {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {releaseDate.format("MMM DD, YYYY")}
          </div>
        </div>
      );
    } else if (hours > 0) {
      return (
        <div className="text-center">
          <div className="text-orange-600 font-mono text-sm font-semibold">
            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500 mt-1">Today</div>
        </div>
      );
    } else {
      return (
        <div className="text-center">
          <div className="text-red-600 font-mono text-sm font-semibold animate-pulse">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-red-500 mt-1">Releasing soon!</div>
        </div>
      );
    }
  };

  // Handle button actions
  const handleViewDetails = (row) => {
    // Implement details view logic
    console.log("View details for:", row);
    // You can open a modal, navigate to details page, etc.
    alert(`Details for Request ID: ${row.batchId}`);
  };

  const handleCancelRequest = (row) => {
    // Implement cancel logic
    console.log("Cancel request:", row);
    // You can show confirmation dialog and make API call
    if (window.confirm(`Are you sure you want to cancel request ${row.batchId}?`)) {
      // Make API call to cancel
      console.log("Request cancelled");
      // Refresh data after cancellation
    }
  };

  const handleOpenModal = (employeeId) => {
    setSelectedEmployee(employeeId);
    setModalOpen(true);
  };


  const handleCancelPayslip = async(employeeId) => {

    console.log("Deleting the id", employeeId);
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/payslip/${employeeId}`);
      console.log("Successfully cancelled the payslip", response);
    }catch (err) {
      console.log("Error cancelling Payslip", employeeId);
    }

    fetchPayslips();

  }
  const columns = [
    { name: "Request ID", selector: (row) => row.batchId, sortable: true, width: "120px" },
    { name: "Request Type", selector: (row) => row.payrollType, sortable: true, width: "130px" },
    { name: "Date Created", selector: (row) => row.date, sortable: true, width: "120px" },
    { name: "Cut off Date", selector: (row) => row.cutoffDate, sortable: true, width: "150px" },
    { name: "Requestor", selector: (row) => row.requestedBy, sortable: true, width: "130px" },
    { name: "Status", selector: (row) => row.status, sortable: true, width: "100px" },
    {
      name: "Release Countdown",
      cell: (row) => formatCountdown(row.releaseDate),
      sortable: true,
      width: "180px",
    },
    {
      name: "Release Countdown",
      cell: (row) => formatCountdown(row.releaseDate),
      sortable: true,
      width: "180px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <button
            onClick={() => {
              console.log('Details button clicked for:', row);
              handleOpenModal(row.employeeId);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition-all duration-200 font-medium"
            title="View Details"
          >
            <Eye size={12} />
            Details
          </button>
          <button
            onClick={() => {
              setCancelId(row.employeeId);   // store ID to delete
              setShowConfirmModal(true);     // show modal
            }}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-all duration-200 font-medium"
            title="Cancel Request"
          >
            <X size={12} />
            Cancel
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "150px",
    },
  ];

  const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-80">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Confirm Deletion
        </h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this payslip? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

  return (

    
    <div className="p-4">
      <div className="flex justify-between items-center mt-2 mb-2">
        <div className="text-left">
          <h3 className="text-base -mt-2 font-medium text-gray-700"></h3>
        </div>
        <div className="flex justify-end items-center w-1/2 -mt-12 gap-3">
          <div className="flex rounded w-full items-center relative">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={handleFilter}
              className="px-2 pr-8 h-8 text-xs bg-neutralSilver w-full rounded py-0.5 border"
            />
            <Search className="absolute right-2 h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>

      {searchTerm && (
        <div className="-mt-4 text-sm text-gray-600 mb-2">
          Showing {filteredData.length} of {payslips.length} results for "{searchTerm}"
        </div>
      )}

        <PayslipModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          employeeId={selectedEmployee}
        />

      <div className="-mt-1 overflow-auto rounded-md border border-gray-200">
        <DataTable
          columns={columns}
          data={filteredData}
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
              />
            </div>
          }
          noDataComponent={
            <div className="text-gray-500 text-sm italic py-4 text-center">
              *** No data found ***
            </div>
          }
          pagination
          customStyles={{
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
                minHeight: "50px",
                borderBottom: "1px solid #e5e7eb",
              },
            },
            cells: { style: { padding: "8px" } },
          }}
          responsive
          highlightOnHover
          striped
          dense
        />
      </div>
      <ConfirmDeleteModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          handleCancelPayslip(cancelId);
          setShowConfirmModal(false);
        }}
      />

      

    </div>

  );



};

export default RequestStatus;