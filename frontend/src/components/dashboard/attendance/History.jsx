import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Breadcrumb from "../dashboard/Breadcrumb";
import { FaPrint, FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ThreeDots } from "react-loader-spinner";

const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(filteredData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance History");

  // Create buffer
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  // Create Blob and download
  const fileData = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(fileData, "attendance-history.xlsx");
};

// Define DataTable columns
const columns = [
  {
    name: "Ecode",
    selector: (row) => row.ecode,
    sortable: true,
  },
  {
    name: "Date",
    selector: (row) => row.date,
    sortable: true,
  },
  {
    name: "Duty Start",
    selector: (row) => row.dutyStart || "N/A",
  },
  {
    name: "Duty End",
    selector: (row) => row.dutyEnd || "N/A",
  },
  {
    name: "Punch In",
    selector: (row) => row.punchIn || "N/A",
  },
  {
    name: "Punch Out",
    selector: (row) => row.punchOut || "N/A",
  },
];

const History = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/attendance/get-history`
        );
        if (response.data.attendance) {
          console.log(response.data.attendance);
          setAttendanceData(response.data.attendance);
        } else {
          setError("Invalid data format from API");
        }
      } catch (err) {
        setError("Failed to fetch attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const filteredData = attendanceData.filter((record) =>
    record.ecode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className=" right-0 bottom-0  min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <div className="">
        <Breadcrumb
          items={[
            { label: "Attendance" },
            { label: "Add Attendance", href: "/admin-dashboard/attendance" },
            { label: "History", href: "/admin-dashboard/attendance/history" },
          ]}
        />
        <div className="bg-white p-2 -mt-3 rounded-lg shadow flex justify-between">
          <div className="inline-flex border border-neutralDGray rounded h-8">
            <button
              onClick={exportToExcel} // Export as Excel
              className="px-3 w-20 h-full hover:bg-neutralSilver border-l-0 transition-all duration-300 rounded-r flex items-center justify-center"
            >
              <FaRegFileExcel
                title="Export to PDF"
                className=" text-neutralDGray"
              />
            </button>
          </div>

          <div className="flex flex-row gap-2 w-1/2 justify-end">
            <div className="flex w-full">
              <input
                type="text"
                placeholder="Search Employee"
                value={searchQuery}
                className="px-2 text-xs rounded w-full h-8 py-0.5 border"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="-ml-6 mt-1.5 text-neutralDGray/60" />
            </div>
          </div>
        </div>

        <div className="border mt-2 rounded shadow">
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
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              </div>
            }
            noDataComponent={
              <div className="text-gray-500 text-sm italic py-4 text-center">
                *** No data found ***
              </div>
            }
            pagination
            paginationPerPage={15}
            highlightOnHover
            striped
            dense
          />
        </div>
      </div>
    </div>
  );
};

export default History;
