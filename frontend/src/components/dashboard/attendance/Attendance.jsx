// Updated Attendance.jsx - Add these missing pieces to your existing component

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Breadcrumb from "../dashboard/Breadcrumb";
import DataTable from "react-data-table-component";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Attendance = () => {
  // Add these missing state variables
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Column definitions for attendance table
  const attendanceColumns = [
    {
      name: "Ecode",
      selector: (row) => row.employeeName,
      sortable: true,
      width: "150px",
    },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleDateString(),
      sortable: true,
      width: "100px",
    },
    {
      name: "Punch In",
      selector: (row) => row.punchIn || "N/A",
      width: "90px",
    },
    {
      name: "Punch Out",
      selector: (row) => row.punchOut || "N/A",
      width: "90px",
    },
    {
      name: "Work Time",
      selector: (row) => row.workTime || "N/A",
      width: "90px",
    },
    {
      name: "Late",
      selector: (row) => row.lateTime || "00:00:00",
      width: "80px",
    },
    {
      name: "Overtime",
      selector: (row) => row.overtime || "00:00:00",
      width: "90px",
    },
    {
      name: "Status",
      selector: (row) => row.status,
      width: "80px",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            row.status === "present"
              ? "bg-green-100 text-green-800"
              : row.status === "absent"
              ? "bg-red-100 text-red-800"
              : row.status === "late"
              ? "bg-yellow-100 text-yellow-800"
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
      name: "Employee Name",
      selector: (row) => row.employeeName,
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
      name: "Late Days",
      selector: (row) => row.lateDays,
      width: "80px",
    },
    {
      name: "Total Work Hours",
      selector: (row) => row.totalWorkHours,
      width: "120px",
    },
    {
      name: "Total Overtime",
      selector: (row) => row.totalOvertimeHours,
      width: "120px",
    },
  ];

  // Handle file upload
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

          // Process and display preview data
          const processedData = jsonData.map((row, index) => ({
            id: index + 1,
            employeeName: row.Name || row.name || "",
            date: row.Date || row.date || "",
            dutyTime: row["Duty time"] || row["duty time"] || "",
            punchIn: row["Punch In"] || row["punch in"] || "",
            punchOut: row["Punch Out"] || row["punch out"] || "",
            workTime: row["Work time"] || row["work time"] || "",
            lateTime: row.Late || row.late || "00:00:00",
            overtime: row.Overtime || row.overtime || "00:00:00",
            absentTime: row["Absent time"] || row["absent time"] || "00:00:00",
            status:
              !row["Punch In"] && !row["Punch Out"] ? "absent" : "present",
          }));

          setAttendanceData(processedData);

          // Generate summary data
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
      const name = record.employeeName;
      if (!summary[name]) {
        summary[name] = {
          employeeName: name,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          totalWorkHours: "00:00",
          totalOvertimeHours: "00:00",
        };
      }

      summary[name].totalDays++;
      if (record.status === "present") {
        summary[name].presentDays++;
      } else if (record.status === "absent") {
        summary[name].absentDays++;
      }

      if (record.lateTime && record.lateTime !== "00:00:00") {
        summary[name].lateDays++;
      }
    });

    setSummaryData(Object.values(summary));
  };

  // Handle form submission
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
        setShowModal(true);
        toast.success("Attendance data saved successfully!", {
          closeButton: false,
        });

        // Refresh the data after successful upload
        fetchAttendanceData();
      } else {
        toast.error(result.message || "Failed to save attendance data");
        if (result.errors) {
          result.errors.forEach((error) => toast.error(error));
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload attendance file");
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
        setAttendanceData(data.data.attendance);

        // Generate summary from fetched data
        generateSummary(data.data.attendance);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Failed to fetch attendance data");
    }
  };

  // Fetch attendance summary from API
  const fetchAttendanceSummary = async (startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/attendance/summary?${params}`
      );
      if (!response.ok) throw new Error("Failed to fetch attendance summary");

      const data = await response.json();
      if (data.success) {
        setSummaryData(data.data.summary);
      }
    } catch (error) {
      console.error("Error fetching attendance summary:", error);
      toast.error("Failed to fetch attendance summary");
    }
  };

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
              className="px-4 text-sm py-2 h-auto bg-brandPrimary hover:bg-neutralDGray cursor-pointer text-white rounded-md"
            >
              Save Attendance
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
              />
            ) : (
              <p className="text-center text-gray-500">
                No attendance data available.
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
              />
            ) : (
              <p className="text-center text-gray-500">
                No summary data available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
