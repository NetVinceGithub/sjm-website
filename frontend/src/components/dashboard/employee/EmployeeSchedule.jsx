import React, { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "../dashboard/Breadcrumb";
import { FaSearch } from "react-icons/fa";
import { FaFilter } from "react-icons/fa6";

const EmployeeSchedule = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/employee`
      );
      setEmployees(response.data.employees);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleSelectEmployee = (emp) => {
    let scheduleData = [];

    try {
      // Parse schedule data with better error handling
      if (emp.schedule && typeof emp.schedule === "string") {
        const parsed = JSON.parse(emp.schedule);
        scheduleData = Array.isArray(parsed) ? parsed : [];
      } else if (Array.isArray(emp.schedule)) {
        scheduleData = emp.schedule;
      } else if (emp.schedule && typeof emp.schedule === "object") {
        // If it's an object, try to convert to array
        scheduleData = Object.values(emp.schedule);
      }
    } catch (error) {
      console.error("Error parsing schedule:", error, emp.schedule);
      scheduleData = [];
    }

    // Create a new object to avoid mutation
    setSelectedEmployee({
      ...emp,
      scheduleData: scheduleData,
    });
    setEditMode(false);
  };

  const handleScheduleChange = (day, field, value) => {
    // Ensure scheduleData is always an array
    const currentSchedule = Array.isArray(selectedEmployee.scheduleData)
      ? selectedEmployee.scheduleData
      : [];

    const updated = [...currentSchedule];
    const index = updated.findIndex((d) => d.dayName === day);

    if (index === -1) {
      // Day not yet in schedule → create a new one
      updated.push({
        dayName: day,
        startTime: field === "startTime" ? value : "",
        endTime: field === "endTime" ? value : "",
      });
    } else {
      updated[index][field] = value;
    }

    setSelectedEmployee({ ...selectedEmployee, scheduleData: updated });
  };

  const saveSchedule = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/employee/edit-schedule/${
          selectedEmployee.id
        }`,
        { schedule: selectedEmployee.scheduleData }
      );
      alert("Schedule updated!");
      setEditMode(false);
      // Refresh employees to get updated data
      fetchEmployees();
    } catch (err) {
      console.error("Error saving schedule:", err);
      alert("Failed to update schedule. Please try again.");
    }
  };

  // Function to truncate project names
  const truncateProject = (projectName, maxLength = 14) => {
    if (!projectName) return "";
    if (projectName.length <= maxLength) return projectName;
    return projectName.substring(0, maxLength) + "...";
  };

  // Get unique projects from employees
  const uniqueProjects = [
    ...new Set(
      employees
        .filter((emp) => emp.status !== "Inactive" && emp.project)
        .map((emp) => emp.project)
    ),
  ].sort();

  // Filter employees based on search term and selected project
  const filteredEmployees = employees.filter((emp) => {
    if (emp.status === "Inactive") {
      return false;
    }

    // Project filter
    if (selectedProject && emp.project !== selectedProject) {
      return false;
    }

    // Search filter
    const searchLower = searchTerm.toLowerCase().trim();
    const nameLower = (emp.complete_name || "").toLowerCase();
    const ecodeLower = (emp.ecode || "").toLowerCase();

    return nameLower.includes(searchLower) || ecodeLower.includes(searchLower);
  });

  return (
    <div className="right-0 bottom-0 min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <Breadcrumb
        items={[
          { label: "Employee" },
          { label: "Masterlist", href: "/admin-dashboard/employees" },
          {
            label: "Employee Schedule",
            href: "/admin-dashboard/employees/employee-schedule",
          },
        ]}
      />
      <div className="bg-white p-2 -mt-3 rounded-lg shadow">
        <div className="flex flex-row gap-2 w-1/2 ml-auto">
          <div className="flex w-full">
            <input
              type="text"
              placeholder="Search Employee"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2 text-xs rounded w-full h-8 py-0.5 border"
            />
            <FaSearch className="-ml-6 mt-1.5 text-neutralDGray/60" />
          </div>
          <div className="relative w-1/4">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="px-2 text-xs text-neutralDGray rounded w-full items-center hover:bg-neutralSilver flex justify-between h-8 py-0.5 border"
              title={selectedProject || "Filter Project"}
            >
              <span className="truncate">
                {truncateProject(selectedProject) || "Filter Project"}
              </span>
              <span className="ml-1 flex-shrink-0">
                <FaFilter className="mr-2" />
              </span>
            </button>
            {showProjectDropdown && (
              <div className="absolute top-9 left-0 w-full bg-white border rounded shadow-lg z-10 max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedProject("");
                    setShowProjectDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-neutralSilver"
                >
                  All Projects
                </button>
                {uniqueProjects.map((project) => (
                  <button
                    key={project}
                    onClick={() => {
                      setSelectedProject(project);
                      setShowProjectDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-neutralSilver"
                    title={project}
                  >
                    {project}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white p-3 mt-2 rounded-lg shadow mb-2">
        {/* Compact Employee Grid */}
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">
              {searchTerm || selectedProject
                ? "No employees found matching your filters"
                : "No employees available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="border p-3 rounded-lg shadow-sm hover:shadow-md bg-white transition-shadow"
              >
                <h3 className="font-medium text-sm">{emp.complete_name}</h3>
                <p className="text-xs text-gray-500 -mt-2 mb-2">
                  E-Code: {emp.ecode}
                </p>
                <p
                  className="text-xs text-gray-500 -mt-2 mb-2 truncate"
                  title={emp.project}
                >
                  Project: {emp.project}
                </p>
                <button
                  onClick={() => handleSelectEmployee(emp)}
                  className="px-2 text-xs text-neutralDGray rounded w-full text-center items-center hover:bg-neutralSilver h-8 py-0.5 border transition-colors"
                >
                  View Schedule
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Drawer/Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white p-3 rounded w-[600px] max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center -mt-3">
              <h2 className="text-sm font-regular mb-2">
                <span className="italic">{selectedEmployee.complete_name}</span>
                's Schedule
              </h2>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-sm w-fit mb-2 px-2 py-1 text-neutralDGray rounded hover:text-red-600"
              >
                X
              </button>
            </div>

            {/* Weekly Calendar View */}
            <div className="grid grid-cols-7 gap-28 overflow-x-auto text-center text-xs">
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => {
                // Safely find day schedule with array check
                const scheduleArray = Array.isArray(
                  selectedEmployee.scheduleData
                )
                  ? selectedEmployee.scheduleData
                  : [];
                const daySchedule = scheduleArray.find(
                  (d) => d.dayName === day
                );

                return (
                  <div
                    key={day}
                    className="border rounded p-2 min-h-[140px] min-w-[100px] flex flex-col"
                  >
                    <h4 className="font-semibold text-xs mb-3">{day}</h4>

                    {editMode ? (
                      <div className="flex flex-col gap-2 flex-1">
                        <input
                          type="time"
                          value={daySchedule?.startTime || ""}
                          className="w-full border rounded text-center text-[10px] p-0.5"
                          onChange={(e) =>
                            handleScheduleChange(
                              day,
                              "startTime",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="time"
                          value={daySchedule?.endTime || ""}
                          className="w-full border rounded text-center text-xs p-2"
                          onChange={(e) =>
                            handleScheduleChange(day, "endTime", e.target.value)
                          }
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-gray-700 flex-1 flex items-center justify-center">
                        {daySchedule
                          ? `${daySchedule.startTime} - ${daySchedule.endTime}`
                          : "Off"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CRUD Buttons */}
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="px-2 text-xs text-neutralDGray rounded w-1/4 items-center hover:bg-neutralSilver mt-3 ml-auto h-8 py-0.5 border"
              >
                Edit Schedule
              </button>
            ) : (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={saveSchedule}
                  className="px-2 text-xs text-neutralDGray rounded w-1/4 items-center hover:bg-green-500 hover:text-white h-8 py-0.5 border"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-2 text-xs text-neutralDGray rounded w-1/4 items-center hover:bg-red-500 hover:text-white h-8 py-0.5 border"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSchedule;
