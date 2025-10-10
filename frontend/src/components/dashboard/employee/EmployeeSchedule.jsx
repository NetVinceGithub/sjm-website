import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeSchedule = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee`);
      setEmployees(response.data.employees);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSelectEmployee = (emp) => {
    try {
      emp.scheduleData = emp.schedule ? JSON.parse(emp.schedule) : [];
    } catch {
      emp.scheduleData = [];
    }
    setSelectedEmployee(emp);
    setEditMode(false);
  };

    const handleScheduleChange = (day, field, value) => {
    const updated = [...selectedEmployee.scheduleData];
    const index = updated.findIndex(d => d.dayName === day);

    if (index === -1) {
        // Day not yet in schedule → create a new one
        updated.push({
        dayName: day,
        startTime: field === "startTime" ? value : "",
        endTime: field === "endTime" ? value : ""
        });
    } else {
        updated[index][field] = value;
    }

    setSelectedEmployee({ ...selectedEmployee, scheduleData: updated });
    };

    const saveSchedule = async () => {
    try {
        await axios.put(
        `${import.meta.env.VITE_API_URL}/api/employee/edit-schedule/${selectedEmployee.id}`,
        { schedule: selectedEmployee.scheduleData }
        );
        alert("Schedule updated!");
        setEditMode(false);
    } catch (err) {
        console.log(err);
    }
    };


  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Employee Schedules</h2>

      {/* Compact Employee Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="border p-3 rounded-lg shadow-sm hover:shadow-md bg-white"
          >
            <h3 className="font-medium text-sm">{emp.complete_name}</h3>
            <p className="text-xs text-gray-500 mb-2">E-Code: {emp.ecode}</p>
            <button
              onClick={() => handleSelectEmployee(emp)}
              className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
            >
              View Schedule
            </button>
          </div>
        ))}
      </div>

      {/* Schedule Drawer/Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-[600px] max-h-[80vh] overflow-auto">
            <h2 className="text-md font-bold mb-2">{selectedEmployee.complete_name}'s Schedule</h2>

            <button onClick={() => setSelectedEmployee(null)} className="text-xs mb-3 px-2 py-1 bg-red-500 text-white rounded">
              Close
            </button>

            {/* Weekly Calendar View */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                const daySchedule = selectedEmployee.scheduleData.find(d => d.dayName === day);
                return (
                  <div key={day} className="border rounded p-2">
                    <h4 className="font-bold">{day}</h4>

                {editMode ? (
                <div className="flex flex-col gap-1">
                    <input
                    type="time"
                    value={daySchedule?.startTime || ""}
                    className="w-full border text-xs p-1"
                    onChange={(e) => handleScheduleChange(day, "startTime", e.target.value)}
                    />
                    <input
                    type="time"
                    value={daySchedule?.endTime || ""}
                    className="w-full border text-xs p-1"
                    onChange={(e) => handleScheduleChange(day, "endTime", e.target.value)}
                    />
                </div>
                ) : (
                <p>{daySchedule ? `${daySchedule.startTime} - ${daySchedule.endTime}` : "Off"}</p>
                )}

                  </div>
                );
              })}
            </div>

            {/* CRUD Buttons */}
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="mt-4 px-3 py-1 bg-yellow-500 text-white text-xs rounded">
                Edit Schedule
              </button>
            ) : (
              <button onClick={saveSchedule} className="mt-4 px-3 py-1 bg-green-600 text-white text-xs rounded">
                Save Changes
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSchedule;
