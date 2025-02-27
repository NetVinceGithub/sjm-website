import React, { useState } from "react";
import * as XLSX from "xlsx";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
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
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Upload Attendance File</h2>
      
      <input 
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {attendanceData.length > 0 && (
        <div className="overflow-auto max-h-96 border p-2">
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
