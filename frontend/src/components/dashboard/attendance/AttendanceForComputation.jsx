import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DeleteAttendanceModal from "../modals/DeleteAttendanceModal";
import Breadcrumb from "../dashboard/Breadcrumb";

const AttendanceForComputation = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Manage modal state
  const navigate = useNavigate();

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/attendance/get-attendance"
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

  const fetchSummary = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/attendance/get-summary"
      );
      console.log("Fetched Summary Data:", response.data);

      setAttendanceSummary(response.data.summary || []);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    fetchSummary();
  }, []);

  const deleteAllAttendance = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/attendance/delete-all-attendance",
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete");

      // Update the UI state and refresh data
      setAttendanceData([]);
      fetchSummary();
      fetchAttendance();
      setIsModalOpen(false); // Close the modal after deletion
    } catch (error) {
      console.error("Error deleting attendance:", error);
    }
  };

  if (loading) return <p>Loading attendance data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="fixed p-6 pt-20">
      <Breadcrumb
        items={[
          { label: "Attendance", href: "/admin-dashboard/attendance" },
          { label: "Add Attendance", href: "/admin-dashboard/employees" },
          { label: "Attendance Computation", href: "" },
        ]}
      />
      <div className="-mt-1 bg-white p-3 py-3 rounded-lg shadow">
        <div className="mt-4 overflow-x-auto">
          <div className="w-[75rem]">
            <div className="max-h-[75rem] overflow-y-auto text-neutralDGray border rounded-md">
              <p className="italic font-poppins text-neutralDGray p-2">* This is the summary of attendance, that contains useful info for payroll generation.</p>
              <table
                className="w-[70rem] mb-1 mt-2 border-collapse overflow-hidden rounded-lg"
                border="1"
                cellPadding="5"
                cellSpacing="0"
              >
                <thead>
                  <tr>
                    <th className="border text-center px-4 py-2 first:rounded-tl-lg last:rounded-tr-lg">
                      Ecode
                    </th>
                    <th className="border text-center  px-4 py-2">
                      Total Tardiness
                    </th>
                    <th className="border text-center  px-4 py-2">
                      Total Hours
                    </th>
                    <th className="border text-center  px-4 py-2">
                      Total Overtime
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceSummary?.length > 0 ? (
                    attendanceSummary.map((record) => (
                      <tr key={record.id}>
                        <td className="border text-center  px-4 py-2">
                          {record.ecode}
                        </td>
                        <td className="border text-center  px-4 py-2">
                          {record.totalTardiness}
                        </td>
                        <td className="border text-center  px-4 py-2">
                          {record.totalHours || "N/A"}
                        </td>
                        <td className="border text-center  px-4 py-2">
                          {record.totalOvertime || "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No attendance summary found</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="flex justify-end gap-2 mb-3 mr-4">
                <button
                  onClick={() => navigate("/admin-dashboard/payroll-summary")}
                  className="mt-4 h-auto px-3 py-2 border text-neutralDGray rounded hover:bg-neutralSilver"
                >
                  Generate Payroll
                </button>

                <button
                  onClick={() => navigate("/admin-dashboard/attendance")}
                  className="mt-4 h-auto px-3 py-2 border text-neutralDGray rounded  hover:bg-neutralSilver"
                >
                  Add Attendance
                </button>

                <button
                  className="mt-4 h-auto px-3 py-2 border text-neutralDGray rounded  hover:bg-neutralSilver"
                  onClick={() => setIsModalOpen(true)} // Open modal
                >
                  Delete Attendance
                </button>
              </div>

              {/* Delete Attendance Confirmation Modal */}
              <DeleteAttendanceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={deleteAllAttendance} // Calls delete function
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceForComputation;
