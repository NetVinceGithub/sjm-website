import React, { useEffect, useState } from "react";
import axios from "axios";
import Breadcrumb from "../dashboard/Breadcrumb";
import { FaSearch } from "react-icons/fa";
import { FaPrint, FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";

const History = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // State for search input

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/attendance/get-history`
        );
        console.log("Fetched Attendance Data:", response.data);

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

  // Filtered data based on search input
  const filteredData = attendanceData.filter((record) =>
    record.ecode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p>Loading attendance data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

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
          { label: "History", href: "" },
        ]}
      />
      <div className="-mt-2 bg-white p-3 py-3 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="inline-flex border border-neutralDGray rounded h-8">
            <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center">
              <FaPrint title="Print" className="text-neutralDGray]" />
            </button>

            <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray flex items-center justify-center">
              <FaRegFileExcel title="Export to Excel" className=" text-neutralDGray" />
            </button>
            <button className="px-3 w-20 h-full hover:bg-neutralSilver transition-all duration-300 rounded-r flex items-center justify-center">
              <FaRegFilePdf title="Export to PDF" className=" text-neutralDGray" />
            </button>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-3">
            <div className="flex rounded items-center border px-2 py-1">
              <input
                type="text"
                placeholder="Search ECode"
                className="px-2 py-1 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state
              />
              <FaSearch className="ml-2 text-neutralDGray" />
            </div>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <div className="">
            <div className="h-[70vh] overflow-y-auto text-neutralDGray border rounded-md">
              <table className="w-[90rem] border-collapse mb-[11px] overflow-hidden rounded-lg" border="1" cellPadding="5" cellSpacing="0">
                <thead className="rounded">
                  <tr>
                    <th className="px-4 border text-center py-2 first:rounded-tl-lg last:rounded-tr-lg">Ecode</th>
                    <th className="px-4 border text-center py-2">Date</th>
                    <th className="px-4 border text-center py-2">Sched In</th>
                    <th className="px-4 border text-center py-2">Sched Out</th>
                    <th className="px-4 border text-center py-2">Time In</th>
                    <th className="px-4 border text-center py-2">Time Out</th>
                    <th className="px-4 border text-center py-2">Total Hours</th>
                    <th className="px-4 border text-center py-2">Overtime</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((record) => (
                      <tr key={record.id}>
                        <td className="border text-center px-4 py-2">{record.ecode}</td>
                        <td className="border text-center px-4 py-2">{record.ea_txndte}</td>
                        <td className="border text-center px-4 py-2">{record.schedin || "N/A"}</td>
                        <td className="border text-center px-4 py-2">{record.schedout || "N/A"}</td>
                        <td className="border text-center px-4 py-2">{record.timein || "N/A"}</td>
                        <td className="border text-center px-4 py-2">{record.timeout2 || "N/A"}</td>
                        <td className="border text-center px-4 py-2">{record.total_hours}</td>
                        <td className="border text-center px-4 py-2">{record.overtime}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border text-center px-4 py-2" colSpan="8">No matching records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
