import React, { useState } from "react";
import * as XLSX from "xlsx";
import Breadcrumb from "../dashboard/Breadcrumb";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const requiredColumns = ["ecode", "ea_txndte", "schedin", "schedout", "timein", "timeout2"];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file.name);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (jsonData.length <= 1) {
        alert("The file is empty or improperly formatted.");
        return;
      }

      const headers = jsonData[0];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      if (missingColumns.length > 0) {
        alert(`Missing columns: ${missingColumns.join(", ")}`);
        return;
      }

      const columnIndexes = requiredColumns.map(col => headers.indexOf(col));

      const processedData = jsonData.slice(1).map(row => {
        const rowData = columnIndexes.map(index => row[index] || "");
        const [ecode, ea_txndte, schedin, schedout, timein, timeout2] = rowData;

        return {
          ecode,
          ea_txndte,
          schedin,
          schedout,
          timein,
          timeout2,
          tardiness: computeTardiness(schedin, timein),
          total_hours: computeTotalHours(timein, timeout2),
          overtime: computeOvertime(schedout, timeout2),
        };
      });

      setAttendanceData(processedData);
      generateSummary(processedData);
    };
  };

  const computeTardiness = (schedin, timein) => {
    if (!schedin || !timein) return 0;
    return Math.max(0, convertToMinutes(timein) - convertToMinutes(schedin));
  };

  const computeTotalHours = (timein, timeout2) => {
    if (!timein || !timeout2) return 0;
    const startTime = convertToMinutes(timein);
    const endTime = convertToMinutes(timeout2);
    return ((endTime >= startTime ? endTime - startTime : (1440 - startTime) + endTime) / 60).toFixed(2);
  };

  const computeOvertime = (schedout, timeout2) => {
    if (!schedout || !timeout2) return 0;
    const schedOutMinutes = convertToMinutes(schedout);
    const actualOutMinutes = convertToMinutes(timeout2);
    return actualOutMinutes > schedOutMinutes ? ((actualOutMinutes - schedOutMinutes) / 60).toFixed(2) : 0;
  };

  const convertToMinutes = (timeStr) => {
    if (!timeStr) return 0;

    let hours, minutes;

    if (timeStr.includes("AM") || timeStr.includes("PM")) {
      let [time, modifier] = timeStr.split(" ");
      [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) {
        hours += 12;
      } else if (modifier === "AM" && hours === 12) {
        hours = 0;
      }
    } else {
      [hours, minutes] = timeStr.includes(":")
        ? timeStr.split(":").map(Number)
        : [Math.floor(timeStr / 100), timeStr % 100];
    }

    return hours * 60 + minutes;
  };

  const generateSummary = (data) => {
    const summary = data.reduce((acc, row) => {
      const { ecode, tardiness, total_hours, overtime } = row;
  
      if (!acc[ecode]) {
        acc[ecode] = { ecode, totalTardiness: 0, totalHours: 0, totalOvertime: 0 };
      }
  
      acc[ecode].totalTardiness += tardiness;
      acc[ecode].totalHours += parseFloat(total_hours) || 0;
      acc[ecode].totalOvertime += parseFloat(overtime) || 0;
  
      return acc;
    }, {});
  
    // Convert values to 2 decimal places
    const formattedSummary = Object.values(summary).map((item) => ({
      ecode: item.ecode,
      totalTardiness: item.totalTardiness.toFixed(2), 
      totalHours: item.totalHours.toFixed(2), 
      totalOvertime: item.totalOvertime.toFixed(2),
    }));
  
    setSummaryData(formattedSummary);
  };
  

  const handleSubmit = async () => {
    if (attendanceData.length === 0 || summaryData.length === 0) {
      alert("No attendance data to submit.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/attendance/add-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceData }),
      });

      if (!response.ok) throw new Error("Failed to save attendance");

      const summaryResponse = await fetch("http://localhost:5000/api/attendance/add-attendance-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryData }),
      });

      if (!summaryResponse.ok) throw new Error("Failed to save summary");

      alert("Attendance data and summary saved successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving attendance data.");
    }
  };

  return (
    <div className="p-6 pt-20">
      <Breadcrumb
        items={[
          { label: "Attendance", href: "" },
          { label: "Add Attendance", href: "/admin-dashboard/employees" },
        ]}
      />
  
      <div className="p-2 rounded border border-neutralDGray">
        <h2 className="text-lg font-semibold text-neutralDGray mb-2">
          Upload Attendance File
        </h2>
        <button
          onClick={handleSubmit}
          className="mt-4 px-4 py-2 bg-brandPrimary text-white rounded-md"
        >
          Save Attendance
        </button>
        <div className="flex items-center gap-3 border border-neutralDGray rounded-md p-2 bg-slate-50">
          <label className="px-4 py-2 bg-brandPrimary text-white rounded-md cursor-pointer">
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
        </div>
      </div>
  
      {/* Detailed Attendance Table */}
      {attendanceData.length > 0 && (
        <div className="overflow-auto border p-2 mt-4">
          <h2 className="text-lg font-semibold text-neutralDGray mb-2">
            Detailed Attendance
          </h2>
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                {Object.keys(attendanceData[0]).map((header, index) => (
                  <th key={index} className="border p-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((row, rowIndex) => (
                <tr key={rowIndex} className="border">
                  {Object.values(row).map((cell, cellIndex) => (
                    <td key={cellIndex} className="border p-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
  
      {/* Summary Table */}
      {summaryData.length > 0 && (
        <div className="overflow-auto border p-2 mt-4">
          <h2 className="text-lg font-semibold text-neutralDGray mb-2">
            Attendance Summary
          </h2>
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Employee Code</th>
                <th className="border p-2">Total Tardiness (mins)</th>
                <th className="border p-2">Total Hours Worked</th>
                <th className="border p-2">Total Overtime (hrs)</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map((row, rowIndex) => (
                <tr key={rowIndex} className="border">
                  <td className="border p-2">{row.ecode}</td>
                  <td className="border p-2">{parseFloat(row.totalTardiness).toFixed(2)}</td>
                  <td className="border p-2">{parseFloat(row.totalHours).toFixed(2)}</td>
                  <td className="border p-2">{parseFloat(row.totalOvertime).toFixed(2)}</td>
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
