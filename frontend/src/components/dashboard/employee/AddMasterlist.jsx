import React, { useState } from "react";
import * as XLSX from "exceljs";
import axios from "axios";

const AddMasterlist = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    try {
      const workbook = new XLSX.Workbook();
      const reader = new FileReader();

      reader.onload = async (e) => {
        const buffer = e.target.result;
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.worksheets[0];
        const employees = [];

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header

          const formatDate = (cell) => {
            const value = cell?.value;
            if (typeof value === "number") {
              const date = new Date(Math.round((value - 25569) * 86400 * 1000));
              return isNaN(date) ? null : date.toISOString().split("T")[0];
            }
            if (value instanceof Date) {
              return isNaN(value) ? null : value.toISOString().split("T")[0];
            }
            if (typeof value === "string") {
              const parsedDate = new Date(value);
              return isNaN(parsedDate) ? null : parsedDate.toISOString().split("T")[0];
            }
            return null;
          };

          const employee = {
            ecode: String(row.getCell(2)?.value || "").trim(),
            name: String(row.getCell(3)?.value || "").trim(),
            lastname: String(row.getCell(4)?.value || "").trim(),
            firstname: String(row.getCell(5)?.value || "").trim(),
            middlename: String(row.getCell(6)?.value || "").trim(),
            position: String(row.getCell(7)?.value || ""),
            department: String(row.getCell(8)?.value || ""),
            area: String(row.getCell(9)?.value || ""),
            hireDate: formatDate(row.getCell(10)),
            employmentStatus: String(row.getCell(11)?.value || ""),
            civilStatus: String(row.getCell(12)?.value || ""),
            gender: String(row.getCell(13)?.value || ""),
            birthdate: formatDate(row.getCell(14)),
            age: String(row.getCell(15)?.value || ""),
            address: String(row.getCell(16)?.value || ""),
            contact: String(row.getCell(17)?.value || ""),
            email: String(row.getCell(18)?.value || ""),
            govId: String(row.getCell(19)?.value || ""),
          };

          console.log("Processed Employee:", employee);

          if (employee.ecode && employee.name) {
            employees.push(employee);
          }
        });

        console.log("Employees Data Before Sending:", employees);

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/employee/add`,
            employees,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`, // Add auth token
              },
              timeout: 10000,
            }
          );

          console.log("Server Response:", response.data);
          alert(`Successfully uploaded ${response.data.message}`);
        } catch (error) {
          console.error("Upload Error:", {
            response: error.response,
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
          alert("Upload failed. Check console for details.");
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("File Processing Error:", error);
      alert(`File processing failed: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Upload Employee Masterlist</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default AddMasterlist;
