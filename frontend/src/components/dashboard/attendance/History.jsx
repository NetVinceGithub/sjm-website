import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Breadcrumb from "../dashboard/Breadcrumb";
import { FaPrint, FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";

// Define DataTable columns
const columns = [
  {
    name: "Ecode",
    selector: (row) => row.ecode,
    sortable: true,
  },
  {
    name: "Date",
    selector: (row) => row.ea_txndte,
    sortable: true,
  },
  {
    name: "Sched In",
    selector: (row) => row.schedin || "N/A",
  },
  {
    name: "Sched Out",
    selector: (row) => row.schedout || "N/A",
  },
  {
    name: "Time In",
    selector: (row) => row.timein || "N/A",
  },
  {
    name: "Time Out",
    selector: (row) => row.timeout2 || "N/A",
  },
  {
    name: "Total Hours",
    selector: (row) => row.total_hours,
  },
  {
    name: "Overtime",
    selector: (row) => row.overtime,
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
    <div className="fixed top-0 right-0 bottom-0 min-h-screen w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-16">
      <div className="">
        <Breadcrumb
          items={[
            { label: "Attendance", href: "/admin-dashboard/attendance" },
            { label: "Add Attendance", href: "/admin-dashboard/employees" },
            { label: "Attendance Computation", href: "/admin-dashboard/attendance-computation" },
            { label: "History", href: "" },
          ]}
        />
        <div className="-mt-2 bg-white p-3 py-3 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex border border-neutralDGray rounded h-8">
              <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center">
                <FaPrint title="Print" className="text-neutralDGray" />
              </button>
              <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray flex items-center justify-center">
                <FaRegFileExcel title="Export to Excel" className=" text-neutralDGray" />
              </button>
              <button className="px-3 w-20 h-full hover:bg-neutralSilver transition-all duration-300 rounded-r flex items-center justify-center">
                <FaRegFilePdf title="Export to PDF" className=" text-neutralDGray" />
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="flex rounded h-10 items-center border px-2 py-1">
                <input
                  type="text"
                  placeholder="Search ECode"
                  className="px-2  h-8 text-sm py-1 border border-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="ml-2 h-10 text-neutralDGray" />
              </div>
            </div>
          </div>

          <div className="border rounded">
            <DataTable
              columns={columns}
              data={filteredData}
              progressPending={loading}
              noDataComponent="No matching records found"
              pagination
              paginationPerPage={15}
              highlightOnHover
              striped
              dense
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
