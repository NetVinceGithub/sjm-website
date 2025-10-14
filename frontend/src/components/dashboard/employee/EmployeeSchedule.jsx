import React, { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "../dashboard/Breadcrumb";
import { FaSearch } from "react-icons/fa";

const EmployeeSchedule = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");

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
      console.log(err);
    }
  };

  const handleSelectEmployee = (emp) => {
    let scheduleData = [];
    try {
      if (emp.schedule) {
        const parsed = JSON.parse(emp.schedule);
        scheduleData = Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      scheduleData = [];
    }
    setSelectedEmployee({ ...emp, scheduleData });
    setEditMode(false);
  };

  const handleScheduleChange = (day, field, value) => {
    const updated = [...selectedEmployee.scheduleData];
    const index = updated.findIndex((d) => d.dayName === day);

    if (index === -1) {
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
    } catch (err) {
      console.log(err);
    }
  };

  const handleFilter = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Filter active employees
  const activeEmployees = employees.filter((emp) => emp.status === "Active");

  // Filter employees based on search term
  const filteredEmployees = activeEmployees.filter((emp) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      emp.complete_name?.toLowerCase().includes(searchLower) ||
      emp.ecode?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Pagination handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className=" right-0 bottom-0  min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <Breadcrumb
        items={[
          { label: "Employee" },
          { label: "Masterlist", href: "/admin-dashboard/employees" },
          {
            label: "Add New Employee",
            href: "/admin-dashboard/employees/add-employee",
          },
          {
            label: "Employee Schedule",
            href: "/admin-dashboard/employees/employee-schedule",
          },
        ]}
      />
      <div className="bg-white p-2 -mt-3 rounded-lg shadow w-[calc(100vw-310px)] flex justify-end">
        <div className="flex flex-row gap-2 w-1/2 justify-end">
          <div className="flex w-full relative">
            <input
              type="text"
              placeholder="Search Employee"
              value={searchTerm}
              onChange={handleFilter}
              className="px-3 text-xs rounded w-full h-9 py-0.5 border"
            />
            <FaSearch className="-ml-6 mt-1.5 text-neutralDGray/60" />
          </div>
        </div>
      </div>

      <div className="bg-white p-2 mt-3 shadow rounded-lg">
        <h2 className=" text-lg font-medium text-neutralDGray italic mb-3">
          Employee Schedules
        </h2>

        {/* Show message if no results */}
        {currentEmployees.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            No employees found matching "{searchTerm}"
          </div>
        )}

        {/* Compact Employee Grid */}
        {currentEmployees.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {currentEmployees.map((emp) => (
              <div
                key={emp.id}
                className="border p-2 rounded-lg shadow-sm hover:shadow-md bg-white"
              >
                <h3 className="font-medium text-sm">{emp.complete_name}</h3>
                <p className="text-xs text-gray-500 mb-2 italic">
                  E-Code: {emp.ecode}
                </p>
                <button
                  onClick={() => handleSelectEmployee(emp)}
                  className="px-2 text-xs text-neutralDGray rounded w-full text-center items-center hover:bg-neutralSilver flex justify-center h-8 py-0.5 border"
                >
                  View Schedule
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-2 border-t">
            <div className="text-xs text-gray-600">
              Showing {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredEmployees.length)} of{" "}
              {filteredEmployees.length} employees
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className="px-2 text-xs text-neutralDGray rounded w-full text-center items-center hover:bg-neutralSilver flex justify-center h-8 py-0.5 border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`px-2 text-xs py-1 h-8 w-10 border rounded ${
                          currentPage === pageNumber
                            ? "bg-blue-500 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span key={pageNumber} className="px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={goToNext}
                disabled={currentPage === totalPages}
                className="px-2 text-xs text-neutralDGray rounded w-full text-center items-center hover:bg-neutralSilver flex justify-center h-8 py-0.5 border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {selectedEmployee && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2"
          onClick={() => setSelectedEmployee(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative flex items-center h-16 justify-between p-3 border-b bg-gray-50">
              <div>
                <h2 className="text-base font-bold text-neutralDGray mt-3">
                  {selectedEmployee.complete_name}'s Schedule
                </h2>
                <p className="text-xs text-gray-500 -mt-2 italic">
                  E-Code: {selectedEmployee.ecode}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-2 right-2 w-fit text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-auto flex-1">
              {/* Weekly Calendar View */}
              <div className="grid grid-cols-7 gap-3 text-center">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => {
                  const daySchedule = selectedEmployee.scheduleData.find(
                    (d) => d.dayName === day
                  );
                  return (
                    <div
                      key={day}
                      className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-bold text-sm mb-2 text-neutralDGray">
                        {day.slice(0, 3)}
                      </h4>

                      {editMode ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="time"
                            value={daySchedule?.startTime || ""}
                            className="w-full border rounded text-xs p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full border rounded text-xs p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) =>
                              handleScheduleChange(
                                day,
                                "endTime",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      ) : (
                        <div className="text-sm">
                          {daySchedule ? (
                            <div>
                              <p className="font-medium text-green-600">
                                {daySchedule.startTime}
                              </p>
                              <p className="text-gray-400 text-xs">to</p>
                              <p className="font-medium text-blue-600">
                                {daySchedule.endTime}
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">Off</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end p-3 h-14 border-t bg-gray-50">
              <div className="flex gap-2">
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-2 text-xs text-neutralDGray rounded w-full items-center hover:bg-green-400 hover:text-white flex justify-between h-8 py-0.5 border"
                  >
                    Edit Schedule
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-2 text-xs text-neutralDGray rounded w-full items-center hover:bg-red-400 hover:text-white flex justify-between h-8 py-0.5 border"
                    >
                      Discard
                    </button>
                    <button
                      onClick={saveSchedule}
                      className="px-2 text-xs text-neutralDGray rounded w-full items-center hover:bg-green-400 hover:text-white flex justify-between h-8 py-0.5 border"
                    >
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSchedule;
