import React, { useState } from "react";
import * as XLSX from "xlsx";
import Breadcrumb from "../dashboard/Breadcrumb";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file.name); // Store file name

      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert to JSON
        setAttendanceData(jsonData);
      };
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

      <div className="-mt-1 p-2 rounded border border-neutralDGray">
        <h2 className="text-lg font-semibold text-neutralDGray mb-2">Upload Attendance File</h2>
        <div className="relative flex items-center gap-3 border border-neutralDGray rounded-md p-2 w-full bg-slate-50">
          <label className="flex items-center w-auto text-nowrap justify-center px-4 py-2 bg-brandPrimary text-white rounded-md cursor-pointer hover:bg-opacity-90 transition-all">
            Upload File
            <input 
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <span className="text-sm text-neutralDGray truncate w-full">
            {selectedFile || "No file selected"}
          </span>
        </div>
      </div>

      {attendanceData.length > 0 && (
        <div className="overflow-auto max-h-96 border p-2 mt-4">
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                {attendanceData[0].map((header, index) => (
                  <th key={index} className="border p-2">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendanceData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex} className="border">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border p-2">{cell}</td>
                  ))}
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
