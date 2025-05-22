import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Breadcrumb from '../dashboard/Breadcrumb';

const Conversion = () => {
  const [rows, setRows] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const lines = content.trim().split('\n');

        const parsed = lines.map(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length < 2) return null;
          const empId = parts[0];
          const date = parts[1];
          const time = parts[2];
          return { empId, date, time };
        }).filter(Boolean);

        const grouped = {};

        parsed.forEach(entry => {
          const key = `${entry.empId}_${entry.date}`;
          if (!grouped[key]) {
            grouped[key] = {
              ECode: entry.empId,
              Date: entry.date,
              TimeIn: entry.time,
              TimeOut: entry.time,
            };
          } else {
            if (entry.time < grouped[key].TimeIn) {
              grouped[key].TimeIn = entry.time;
            }
            if (entry.time > grouped[key].TimeOut) {
              grouped[key].TimeOut = entry.time;
            }
          }
        });

        const finalRows = Object.values(grouped);
        setRows(finalRows);
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    };

    reader.readAsText(file);
  };

  const downloadExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'attendance.xlsx');
    } catch (error) {
      console.error('Error generating Excel:', error);
    }
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 min-h-screen w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-16">
      <Breadcrumb
          items={[
            { label: "Attendance", href: "/admin-dashboard/attendance" },
            { label: "Add Attendance", href: "/admin-dashboard/employees" },
            {
              label: "Attendance Computation",
              href: "/admin-dashboard/attendance-computation",
            },
            { label: "History", href: "/admin-dashboard/attendance/history" },
            { label: "Holidays", href: "/admin-dashboard/holidays" },
            { label: "Conversion", href: "" },
          ]}
        />
      <h2 className="text-xl font-bold mb-4">Convert .dat to Excel</h2>

      <input type="file" accept=".dat" onChange={handleFileChange} className="mb-4" />

      {rows.length > 0 && (
        <>
          <button
            onClick={downloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded mb-4"
          >
            Download Excel
          </button>

          <table className="table-auto border-collapse w-full text-center">
            <thead>
              <tr>
                <th className="border px-4 py-2">ECode</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Time In</th>
                <th className="border px-4 py-2">Time Out</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{row.ECode}</td>
                  <td className="border px-4 py-2">{row.Date}</td>
                  <td className="border px-4 py-2">{row.TimeIn}</td>
                  <td className="border px-4 py-2">{row.TimeOut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Conversion;
