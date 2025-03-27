import React, { useState } from "react";
import * as XLSX from "xlsx";
import Breadcrumb from "../dashboard/Breadcrumb";
import DataTable from "react-data-table-component";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

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
      const { ecode, ea_txndte, tardiness, total_hours, overtime } = row;
  
      if (!acc[ecode]) {
        acc[ecode] = { 
          ecode, 
          totalTardiness: 0, 
          totalHours: 0, 
          totalOvertime: 0, 
          daysPresent: new Set() // Use a Set to track unique dates
        };
      }
  
      acc[ecode].totalTardiness += tardiness;
      acc[ecode].totalHours += parseFloat(total_hours) || 0;
      acc[ecode].totalOvertime += parseFloat(overtime) || 0;
      acc[ecode].daysPresent.add(ea_txndte); // Add unique date
  
      return acc;
    }, {});
  
    // Convert values to 2 decimal places
    const formattedSummary = Object.values(summary).map((item) => ({
      ecode: item.ecode,
      totalTardiness: item.totalTardiness.toFixed(2),
      totalHours: item.totalHours.toFixed(2),
      totalOvertime: item.totalOvertime.toFixed(2),
      daysPresent: item.daysPresent.size, // Count unique dates
    }));
  
    setSummaryData(formattedSummary);
  };
  
  

  const handleSubmit = async () => {
    if (attendanceData.length === 0 || summaryData.length === 0) {
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
      setShowModal(true);

    } catch (error) {
      console.error("Error:", error);
    }
  };

  const attendanceColumns = [
    { name: "E-Code", selector: row => row.ecode, sortable: true, width: "100px", center: true },
    { name: "Date", selector: row => row.ea_txndte, sortable: true, center: true },
    { name: "Scheduled In", selector: row => row.schedin, sortable: true, width: "120px", center: true },
    { name: "Scheduled Out", selector: row => row.schedout, sortable: true, width: "130px", center: true },
    { name: "Time In", selector: row => row.timein, sortable: true, center: true },
    { name: "Time Out", selector: row => row.timeout2, sortable: true, center: true },
    { name: "Tardiness (mins)", selector: row => row.tardiness, sortable: true, width: "140px", center: true },
    { name: "Total Hours Worked", selector: row => row.total_hours, sortable: true, width: "170px", center: true },
    { name: "Overtime (hrs)", selector: row => row.overtime, sortable: true, width: "130px", center: true },
  ];

  const summaryColumns = [
    { name: "E-Code", selector: row => row.ecode, sortable: true, width: "100px", center: true },
    { name: "Days Present", selector: row => row.daysPresent, sortable: true, width: "130px", center: true },
    { name: "Total Tardiness (mins)", selector: row => row.totalTardiness, sortable: true, width: "170px", center: true  },
    { name: "Total Hours Worked", selector: row => row.totalHours, sortable: true, width: "160px", center: true  },
    { name: "Total Overtime (hrs)", selector: row => row.totalOvertime, sortable: true, width: "160px", center: true  },
  ];
  

  return (

    
    <div className="fixed p-6 pt-16">
      <Breadcrumb
        items={[
          { label: "Attendance", href: "" },
          { label: "Add Attendance", href: "/admin-dashboard/employees" },
        ]}
      />
       <div>

      <Modal show={showModal} onHide={() => setShowModal(false)} style={{ position: "fixed", top: "28%", left: "5%" }}>
        <Modal.Header closeButton>
          <Modal.Title>Success!</Modal.Title>
        </Modal.Header>
        <Modal.Body>Attendance saved successfully!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={() => navigate("/admin-dashboard/payroll-summary")}>Go to Payroll</Button>
        </Modal.Footer>
      </Modal>

      
    </div>
    
  
      <div className="p-2 -mt-3 rounded border w-[77rem] bg-white shadow-sm border-neutralDGray">
        <h2 className="text-lg font-semibold text-neutralDGray mb-2">
          Upload Attendance File
        </h2>
        <div className="flex items-center justify-between border border-neutralDGray rounded-md p-2 bg-slate-50">
          <label className="px-4 py-2 bg-brandPrimary hover:bg-neutralDGray text-white rounded-md cursor-pointer">
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
            className="px-4 py-2 h-auto bg-brandPrimary hover:bg-neutralDGray cursor-pointer text-white rounded-md"
          >
            Save Attendance
          </button>
        </div>
      </div>
      <div className="grid mt-3 grid-cols-2 gap-3">
        {/* Attendance Table */}
        <div className="overflow-auto h-[458px] rounded border bg-white shadow-sm p-2">
          <h2 className="text-lg font-semibold text-neutralDGray mb-2">Detailed Attendance</h2>
          {attendanceData.length > 0 ? (
            <DataTable columns={attendanceColumns} data={attendanceData} pagination highlightOnHover />
          ) : (
            <p className="text-center text-gray-500">No attendance data available.</p>
          )}
        </div>

        {/* Summary Table */}
        <div className="overflow-auto h-[458px] rounded border bg-white shadow-sm p-2">
          <h2 className="text-lg font-semibold text-neutralDGray mb-2">Attendance Summary</h2>
          {summaryData.length > 0 ? (
            <DataTable columns={summaryColumns} data={summaryData} pagination highlightOnHover />
          ) : (
            <p className="text-center text-gray-500">No summary data available.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Attendance;
