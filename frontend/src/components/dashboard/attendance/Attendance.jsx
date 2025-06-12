// Updated Attendance.jsx - Fixed with proper time conversion

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Breadcrumb from "../dashboard/Breadcrumb";
import DataTable from "react-data-table-component";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Attendance = () => {
  // State variables
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper function to convert Excel time decimals to HH:MM format
  const convertExcelTimeToString = (excelTime) => {
    if (!excelTime || excelTime === '' || isNaN(excelTime)) {
      return null;
    }
    
    // Convert decimal to total minutes in a day
    const totalMinutes = Math.round(Number(excelTime) * 24 * 60);
    
    // Calculate hours and minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // Format as HH:MM
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Column definitions for attendance table - matching backend fields
  const attendanceColumns = [
    {
      name: "Employee Code",
      selector: (row) => row.ecode,
      sortable: true,
      width: "150px",
    },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleDateString(),
      sortable: true,
      width: "120px",
    },
    {
      name: "On Duty",
      selector: (row) => row.onDuty || "N/A",
      width: "100px",
    },
    {
      name: "Off Duty",
      selector: (row) => row.offDuty || "N/A",
      width: "100px",
    },
    {
      name: "Status",
      selector: (row) => row.status,
      width: "100px",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            row.status === "present"
              ? "bg-green-100 text-green-800"
              : row.status === "absent"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  // Column definitions for summary table
  const summaryColumns = [
    {
      name: "Employee Code",
      selector: (row) => row.ecode,
      sortable: true,
      width: "150px",
    },
    {
      name: "Total Days",
      selector: (row) => row.totalDays,
      width: "100px",
    },
    {
      name: "Present",
      selector: (row) => row.presentDays,
      width: "80px",
    },
    {
      name: "Absent",
      selector: (row) => row.absentDays,
      width: "80px",
    },
    {
      name: "Attendance Rate",
      selector: (row) => `${((row.presentDays / row.totalDays) * 100).toFixed(1)}%`,
      width: "120px",
    },
  ];

  // Handle file upload and preview
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file.name);

      // Preview the Excel data
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Process data to match backend expectations
          const processedData = jsonData.map((row, index) => {
            // Convert date if it's an Excel serial number
            let formattedDate = '';
            const dateRaw = row.Date || row.date || '';
            
            if (!isNaN(dateRaw) && Number(dateRaw) > 0) {
              // Excel serial date conversion
              const excelDate = new Date((Number(dateRaw) - 25569) * 86400 * 1000);
              formattedDate = excelDate.toISOString().split('T')[0];
            } else if (dateRaw) {
              // Try to parse as regular date
              const parsedDate = new Date(dateRaw);
              if (!isNaN(parsedDate)) {
                formattedDate = parsedDate.toISOString().split('T')[0];
              }
            }

            const ecode = String(row.Name || row.name || '').trim();
            
            // Convert Excel time decimals to HH:MM format
            const onDutyRaw = row['ON Duty'] || row['on duty'] || row['onDuty'] || null;
            const offDutyRaw = row['OFF Duty'] || row['off duty'] || row['offDuty'] || null;
            
            const onDuty = convertExcelTimeToString(onDutyRaw);
            const offDuty = convertExcelTimeToString(offDutyRaw);
            
            // Determine status based on duty times
            const status = (!onDuty && !offDuty) ? 'absent' : 'present';

            return {
              id: index + 1,
              ecode,
              date: formattedDate,
              onDuty,
              offDuty,
              status
            };
          }).filter(record => record.date && record.ecode); // Filter out invalid records

          setAttendanceData(processedData);
          generateSummary(processedData);
        } catch (error) {
          console.error("Error reading file:", error);
          toast.error("Error reading Excel file. Please check the format.");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Generate summary data from attendance
  const generateSummary = (data) => {
    const summary = {};

    data.forEach((record) => {
      const ecode = record.ecode;
      if (!summary[ecode]) {
        summary[ecode] = {
          ecode: ecode,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
        };
      }

      summary[ecode].totalDays++;
      if (record.status === "present") {
        summary[ecode].presentDays++;
      } else if (record.status === "absent") {
        summary[ecode].absentDays++;
      }
    });

    setSummaryData(Object.values(summary));
  };

  // Handle form submission and save summary
  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput.files[0];

    if (!file) {
      toast.error("No file selected");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload attendance Excel file to backend
      const formData = new FormData();
      formData.append("attendanceFile", file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/attendance/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Attendance data saved successfully!");

        // Step 2: Send attendance summary to /add-attendance-summary
        const summaryPayload = summaryData.map((row) => ({
          ecode: row.ecode,
          daysPresent: row.totalDays,
        }));

        const summaryResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/attendance/add-attendance-summary`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ summaryData: summaryPayload }),
          }
        );

        const summaryResult = await summaryResponse.json();

        if (summaryResponse.ok) {
          toast.success("Summary saved successfully!");
          setShowModal(true);
          fetchAttendanceData();
        } else {
          toast.error("Failed to save attendance summary");
          console.error(summaryResult.message);
        }
      } else {
        toast.error(result.message || "Failed to save attendance data");
        if (result.details?.errors) {
          result.details.errors.forEach((error) =>
            toast.error(`${error.record?.ecode}: ${error.error}`)
          );
        }
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("An error occurred while saving attendance.");
    } finally {
      setLoading(false);
    }
  };


  // Fetch attendance data from API
  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/attendance/get-attendance`
      );
      if (!response.ok) throw new Error("Failed to fetch attendance data");

      const data = await response.json();
      if (data.success) {
        // Process fetched data to match frontend expectations
        const processedData = data.data.map(record => ({
          ...record,
          status: (!record.onDuty && !record.offDuty) ? 'absent' : 'present'
        }));
        
        setAttendanceData(processedData);
        generateSummary(processedData);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Failed to fetch attendance data");
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAttendanceData();
  }, []);

  return (
    <div className="fixed top-0 right-0 bottom-0 min-h-screen w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-16">
      <div className=" h-[calc(100vh-150px)]">
        <Breadcrumb
          items={[
            { label: "Attendance", href: "" },
            { label: "Add Attendance", href: "/admin-dashboard/employees" },
          ]}
        />
        <div>
          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            style={{ position: "fixed", top: "28%", left: "5%" }}
          >
            <Modal.Header className="py-2 px-3 text-sm">
              <Modal.Title as="h6" className="text-base text-green-500">
                Success!
              </Modal.Title>
            </Modal.Header>
            <Modal.Body as="h6" className="text-sm p-2 text-justify ml-2 -mb-0">
              Attendance saved successfully!
            </Modal.Body>
            <Modal.Footer>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 w-24 h-8 text-sm border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
              >
                Close
              </button>
              <button
                onClick={() => navigate("/admin-dashboard/payroll-summary")}
                className="px-4 py-2 w-36 h-8 border flex justify-center text-sm items-center text-center text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
              >
                Create Payroll
              </button>
            </Modal.Footer>
          </Modal>
        </div>

        <div className="p-2 -mt-3 rounded border bg-white shadow-sm border-neutralDGray">
          <h2 className="text-base text-neutralDGray mb-2">
            Upload Attendance File
          </h2>
          <div className="flex items-center justify-between border border-neutralDGray rounded-md p-2 bg-slate-50">
            <label className="px-4 text-sm py-2 bg-brandPrimary hover:bg-neutralDGray text-white rounded-md cursor-pointer">
              Upload File
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-sm text-neutralDGray">
              {selectedFile || "No file selected"}
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 text-sm py-2 h-auto bg-brandPrimary hover:bg-neutralDGray cursor-pointer text-white rounded-md disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </div>
        
        <div className="grid mt-3 grid-cols-2 gap-3">
          {/* Attendance Table */}
          <div className="overflow-auto h-full rounded border bg-white shadow-sm p-2">
            <h2 className="text-base italic text-neutralDGray mb-2">
              Detailed Attendance
            </h2>
            {attendanceData.length > 0 ? (
              <DataTable
                columns={attendanceColumns}
                data={attendanceData}
                highlightOnHover
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 25, 50]}
              />
            ) : (
              <p className="text-center text-gray-500">
                No attendance data available. Upload a file to see data.
              </p>
            )}
          </div>

          {/* Summary Table */}
          <div className="overflow-auto h-full rounded border bg-white shadow-sm p-2">
            <h2 className="text-base italic text-neutralDGray mb-2">
              Attendance Summary
            </h2>
            {summaryData.length > 0 ? (
              <DataTable
                columns={summaryColumns}
                data={summaryData}
                pagination
                highlightOnHover
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 25, 50]}
              />
            ) : (
              <p className="text-center text-gray-500">
                No summary data available. Upload a file to see summary.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;