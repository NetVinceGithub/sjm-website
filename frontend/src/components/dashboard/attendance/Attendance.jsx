import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeSummary, setEmployeeSummary] = useState({});
  const [isComputing, setIsComputing] = useState(false);

  // Function to parse time (HH:MM format)
  const parseTime = (time) => {
    if (!time) return 0;

    if (/^\d{4}$/.test(time)) {
      time = time.slice(0, 2) + ":" + time.slice(2);
    }

    const [hours, minutes] = time.split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  // Fetch attendance data from database
  const fetchAttendanceData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/attendance");
      const data = await response.json();
      console.log(data);
      setAttendanceData(data);
      computeSummary(data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  useEffect(() => {
    fetchAttendanceData(); // Load data on component mount
  }, []);

  // Compute summary of total working hours and tardiness per employee
  const computeSummary = (data) => {
    const summary = {};

    data.forEach((row) => {
      const empName = row.empname;
      const hoursWorked = parseFloat(row.totalHours) || 0;
      const tardiness = parseInt(row.tardiness) || 0;

      if (!summary[empName]) {
        summary[empName] = { totalHours: 0, totalTardiness: 0 };
      }

      summary[empName].totalHours += hoursWorked;
      summary[empName].totalTardiness += tardiness;
    });

    setEmployeeSummary(summary);
  };

  // Handle Excel file upload and process data
  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      setIsComputing(true);
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const headers = jsonData[0];
        const processedData = jsonData.slice(1).map((row) => {
          const rowData = Object.fromEntries(row.map((cell, index) => [headers[index], cell]));
          return {
            ...rowData,
            totalHours: parseFloat(calculateTotalHours(rowData.schedin, rowData.schedout, rowData.timein, rowData.timeout2)),
            isLate: checkLate(rowData.schedin, rowData.timein),
            tardiness: calculateTardiness(rowData.schedin, rowData.timein),
          };
        });

        setAttendanceData(processedData);
        computeSummary(processedData);
        setIsComputing(false);
      };
    }
  };

  // Calculate total worked hours
  const calculateTotalHours = (schedIn, schedOut, timeIn, timeOut) => {
    if (!schedIn || !schedOut || !timeIn || !timeOut) return 0;

    let schedInMinutes = parseTime(schedIn);
    let schedOutMinutes = parseTime(schedOut);
    let timeInMinutes = parseTime(timeIn);
    let timeOutMinutes = parseTime(timeOut);

    if (schedOutMinutes < schedInMinutes) schedOutMinutes += 1440;
    if (timeOutMinutes < timeInMinutes) timeOutMinutes += 1440;

    let totalWorked = (timeOutMinutes - timeInMinutes) / 60;
    return totalWorked > 0 ? totalWorked.toFixed(2) : "0.00";
  };

  // Check if employee is late
  const checkLate = (schedIn, timeIn) => {
    if (!schedIn || !timeIn) return "No";
    return parseTime(timeIn) > parseTime(schedIn) ? "Yes" : "No";
  };

  // Calculate tardiness minutes
  const calculateTardiness = (schedIn, timeIn) => {
    if (!schedIn || !timeIn) return 0;
    let schedInMinutes = parseTime(schedIn);
    let timeInMinutes = parseTime(timeIn);
    return timeInMinutes > schedInMinutes ? timeInMinutes - schedInMinutes : 0;
  };

  // Save attendance data to the database
  const saveToDatabase = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
      });

      const result = await response.json();
      alert(result.message);
      fetchAttendanceData(); // Refresh data after saving
    } catch (error) {
      console.error("Error saving to database:", error);
      alert("Failed to save attendance data.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Upload Attendance File</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-4" />
      <button className="mt-4 p-2 bg-blue-500 text-white rounded" onClick={saveToDatabase}>
        Save to Database
      </button>
      {isComputing && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-bold">Computing Attendance...</p>
          </div>
        </div>
      )}

      {attendanceData.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mt-4">Attendance Records</h3>
          <div className="overflow-auto max-h-96 border p-2">
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Employee Name</th>
                  <th className="border p-2">Total Hours Worked</th>
                  <th className="border p-2">Tardiness (mins)</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((row, index) => (
                  <tr key={index} className="border">
                    <td className="border p-2">{row.ea_txndte}</td>
                    <td className="border p-2">{row.empname}</td>
                    <td className="border p-2">{row.totalHours}</td>
                    <td className="border p-2">{row.tardiness}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-bold mt-4">Employee Summary ({Object.keys(employeeSummary).length})</h3>
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Employee Name</th>
                <th className="border p-2">Total Hours Worked</th>
                <th className="border p-2">Total Tardiness (mins)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(employeeSummary).map(([name, data], index) => (
                <tr key={index} className="border">
                  <td className="border p-2">{name}</td>
                  <td className="border p-2">{data.totalHours.toFixed(2)}</td>
                  <td className="border p-2">{data.totalTardiness}</td>
                </tr>
              ))}
            </tbody>
          </table>

         
        </div>
      )}
    </div>
  );
};

export default Attendance;
