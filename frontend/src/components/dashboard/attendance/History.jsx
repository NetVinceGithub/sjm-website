import React, { useEffect, useState } from "react";
import axios from "axios";
import Breadcrumb from "../dashboard/Breadcrumb";
import { FaSearch } from "react-icons/fa";
import { FaPrint, FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";

const History = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/attendance/get-history"
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

  if (loading) return <p>Loading attendance data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="p-6 pt-20">
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
      <div className="-mt-1 bg-white p-3 py-3 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="inline-flex border border-neutralDGray rounded h-8">
            <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center">
              <FaPrint
                title="Print"
                className="text-neutralDGray] transition-all duration-300"
              />
            </button>

            <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray flex items-center justify-center">
              <FaRegFileExcel
                title="Export to Excel"
                className=" text-neutralDGray"
              />
            </button>
            <button className="px-3 w-20 h-full hover:bg-neutralSilver transition-all duration-300 rounded-r flex items-center justify-center">
              <FaRegFilePdf
                title="Export to PDF"
                className=" text-neutralDGray"
              />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded items-center">
              <input
                type="text"
                placeholder="Search Employee"
                className="px-2 rounded py-0.5 border"
              />
              <FaSearch className="ml-[-20px] text-neutralDGray" />
            </div>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <div className="w-full max-w-[75rem]">
            <div className="max-h-[50rem] overflow-y-auto text-neutralDGray border rounded-md">
              <table className="w-[70rem] border-collapse mb-[11px] overflow-hidden rounded-lg" border="1" cellPadding="5" cellSpacing="0">
                <thead className="rounded">
                  <tr>
                    <th className="px-4 border text-center  py-2 first:rounded-tl-lg last:rounded-tr-lg">Ecode</th>
                    <th className="px-4 border text-center  py-2">Date</th>
                    <th className="px-4 border text-center  py-2">Sched In</th>
                    <th className="px-4 border text-center  py-2">Sched Out</th>
                    <th className="px-4 border text-center  py-2">Time In</th>
                    <th className="px-4 border text-center  py-2">Time Out</th>
                    <th className="px-4 border text-center  py-2">Total Hours</th>
                    <th className="px-4 border text-center  py-2">Overtime</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.length > 0 ? (
                    attendanceData.map((record) => (
                      <tr key={record.id}>
                        <td className="border text-center  px-4 py-2">{record.ecode}</td>
                        <td className="border text-center  px-4 py-2">{record.ea_txndte}</td>
                        <td className="border text-center  px-4 py-2">{record.schedin || "N/A"}</td>
                        <td className="border text-center  px-4 py-2">{record.schedout || "N/A"}</td>
                        <td className="border text-center  px-4 py-2">{record.timein || "N/A"}</td>
                        <td className="border text-center  px-4 py-2">{record.timeout2 || "N/A"}</td>
                        <td className="border text-center  px-4 py-2">{record.total_hours}</td>
                        <td className="border text-center  px-4 py-2">{record.overtime}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border text-center  px-4 py-2" colSpan="9">No attendance records found</td>
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
