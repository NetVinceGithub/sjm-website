import React, { useEffect, useState } from "react";
import axios from "axios";

const History = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/attendance/get-attendance");
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
    <div>
      <h2>Attendance History</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Ecode</th>
            <th>Date</th>
            <th>Sched In</th>
            <th>Sched Out</th>
            <th>Time In</th>
            <th>Time Out</th>
            <th>Total Hours</th>
            <th>Overtime</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.length > 0 ? (
            attendanceData.map((record) => (
              <tr key={record.id}>
                <td>{record.ecode}</td>
                <td>{record.ea_txndte}</td>
                <td>{record.schedin || "N/A"}</td>
                <td>{record.schedout || "N/A"}</td>
                <td>{record.timein || "N/A"}</td>
                <td>{record.timeout2 || "N/A"}</td>
                <td>{record.total_hours}</td>
                <td>{record.overtime}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9">No attendance records found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default History;
