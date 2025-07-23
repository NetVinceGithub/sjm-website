import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarStyles.css"; // Add custom styling here
import Breadcrumb from "../dashboard/Breadcrumb";
import DataTable from "react-data-table-component";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { label } from "framer-motion/client";
import { href } from "react-router-dom";

// Setup the localizer for React Big Calendar
const localizer = momentLocalizer(moment);

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHoliday, setSelectedHoliday] = useState("");
  const [showDateModal, setShowDateModal] = useState(false);

  // Added state for holiday rates modal and rates data
  const [showRateModal, setShowRateModal] = useState(false);
  const [holidayRates, setHolidayRates] = useState({
    regular: 0,
    special: 0,
    specialNonWorking: 0,
  });
  const [loadingRates, setLoadingRates] = useState(false);

  useEffect(() => {
    fetchHolidays();
    fetchHolidayRates();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/holidays`
      );
      setHolidays(response.data.holidays || []);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setHolidays([]);
    }
  };

  const addHoliday = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/holidays/add`, {
        name,
        date,
        type,
      });
      fetchHolidays();
      setName("");
      setDate("");
      setType("");
    } catch (error) {
      console.error("Error adding holiday:", error);
    }
  };

  const columns = [
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
    },
    {
      name: "Holiday Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => deleteHoliday(row.id)}
          className="bg-red-500/40 text-white h-10 w-18 py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200"
        >
          Delete
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const deleteHoliday = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/holidays/delete/${id}`
      );
      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  // Transform holidays data for React Big Calendar
  const calendarEvents = holidays.map((holiday) => ({
    id: holiday.id,
    title: holiday.name,
    start: new Date(holiday.date),
    end: new Date(holiday.date),
    allDay: true,
    resource: {
      type: holiday.type,
      originalData: holiday,
    },
  }));

  // Handle event selection in Big Calendar
  const handleSelectEvent = (event) => {
    setSelectedDate(event.start);
    setSelectedHoliday(`${event.title} (${event.resource.type})`);
    setShowDateModal(true);
  };

  // Handle date selection (clicking on empty date)
  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    const holiday = holidays.find(
      (h) => new Date(h.date).toDateString() === slotInfo.start.toDateString()
    );
    setSelectedHoliday(
      holiday ? `${holiday.name} (${holiday.type})` : "No holiday"
    );
    setShowDateModal(true);
  };

  // Close date modal
  const closeDateModal = () => {
    setShowDateModal(false);
    setSelectedDate(null);
    setSelectedHoliday("");
  };

  // Custom event style based on holiday type
  const eventStyleGetter = (event) => {
    let backgroundColor = "#3174ad";
    let borderColor = "#3174ad";

    switch (event.resource.type) {
      case "Regular":
        backgroundColor = "#dc2626"; // Red for regular holidays
        borderColor = "#dc2626";
        break;
      case "Special":
        backgroundColor = "#16a34a"; // Green for special holidays
        borderColor = "#16a34a";
        break;
      case "Special Non-Working":
        backgroundColor = "#ea580c"; // Orange for special non-working
        borderColor = "#ea580c";
        break;
      default:
        backgroundColor = "#3174ad";
        borderColor = "#3174ad";
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: "white",
        border: `2px solid ${borderColor}`,
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "bold",
      },
    };
  };

  // --- HOLIDAY RATE FUNCTIONS (unchanged) ---

  // Fetch current holiday rates from backend or use defaults
  const fetchHolidayRates = async () => {
    setLoadingRates(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/holidays/holiday-rates`
      );
      if (res.data && res.data.rates) {
        setHolidayRates({
          regular: res.data.rates.regular ?? 1,
          special: res.data.rates.special ?? 1,
          specialNonWorking: res.data.rates.specialNonWorking ?? 1,
        });
      } else {
        setHolidayRates({ regular: 1, special: 1, specialNonWorking: 1 });
      }
    } catch (err) {
      console.error("Failed to load holiday rates, using defaults", err);
      setHolidayRates({ regular: 1, special: 1, specialNonWorking: 1 });
    } finally {
      setLoadingRates(false);
    }
  };

  // Open modal and fetch current rates
  const openRateModal = () => {
    fetchHolidayRates();
    setShowRateModal(true);
  };

  // Close modal
  const closeRateModal = () => {
    setShowRateModal(false);
  };

  // Handle input changes inside modal
  const handleRateChange = (e) => {
    const { name, value } = e.target;
    setHolidayRates((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Save holiday rates to backend
  const saveHolidayRates = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/holidays/holiday-rates`,
        holidayRates
      );
      alert("Holiday rates saved successfully!");
      closeRateModal();
    } catch (error) {
      console.error("Error saving holiday rates:", error);
      alert("Failed to save holiday rates.");
    }
  };

  return (
    <div className="top-0 right-0 bottom-0 h-screen w-[calc(100vw-17rem)] bg-neutralSilver p-3 pt-16 overflow-hidden">
      <div className="h-full flex flex-col overflow-hidden">
        <Breadcrumb
          items={[
            { label: "Attendance" },
            { label: "Add Attendance", href: "/admin-dashboard/attendance" },
            { label: "History", href: "/admin-dashboard/attendance/history" },
            { label: "Holidays", href: "/admin-dashboard/holidays" },
          ]}
        />

        <div className="parent grid grid-cols-4 grid-rows-7 gap-2 -mt-3 h-full">
          {/* Calendar Section - div1 */}
          <div className="div1 col-span-3 row-span-4 bg-white rounded-lg p-3 flex flex-col overflow-hidden shadow border">
            <div className="flex justify-between">
              <h2 className="text-sm mb-4 text-neutralDGrey">
                Holiday Calendar
              </h2>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-2 -mt-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded"></div>
                  <span>Regular Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded"></div>
                  <span>Special Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-600 rounded"></div>
                  <span>Special Non-Working</span>
                </div>
              </div>
            </div>
            {/* React Big Calendar */}
            <div className="flex-1 -mt-4 overflow-hidden">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                eventPropGetter={eventStyleGetter}
                views={["month", "week", "day", "agenda"]}
                defaultView="month"
                popup
                tooltipAccessor="title"
                showMultiDayTimes
                step={60}
                showAllEvents
                className="compact-calendar"
                style={{ height: "100%" }}
                components={{
                  toolbar: ({ label, onNavigate, onView, view, views }) => (
                    <div className="rbc-toolbar flex items-center justify-between mb-1 p-1">
                      <div className="flex items-center">
                        <button
                          onClick={() => onNavigate("PREV")}
                          className="px-2 py-1 h-7 w-fit bg-white border hover:bg-gray-100 text-xs"
                        >
                          <FaAngleLeft />
                        </button>
                        <button
                          onClick={() => onNavigate("TODAY")}
                          className="px-2 py-1 h-7 w-fit bg-blue-500 text-neutralDGray hover:bg-blue-600 text-xs"
                        >
                          Today
                        </button>
                        <button
                          onClick={() => onNavigate("NEXT")}
                          className="px-2 py-1 h-7 w-fit bg-white border hover:bg-gray-100 text-xs"
                        >
                          <FaAngleRight />
                        </button>
                      </div>

                      <div className="rbc-toolbar-label text-sm font-medium">
                        {label}
                      </div>

                      <div className="flex">
                        {views
                          .filter(
                            (viewName) =>
                              viewName === "month" || viewName === "agenda"
                          )
                          .map((viewName) => (
                            <button
                              key={viewName}
                              onClick={() => onView(viewName)}
                              className={`px-2 py-1 h-7 w-fit text-xs capitalize transition-colors ${
                                view === viewName
                                  ? "bg-blue-500 text-neutralDGray"
                                  : "bg-white border hover:bg-gray-100"
                              }`}
                            >
                              {viewName}
                            </button>
                          ))}
                      </div>
                    </div>
                  ),
                  month: {
                    header: ({ label }) => (
                      <div className="text-xs font-medium p-1 text-center">
                        {label}
                      </div>
                    ),
                    dateHeader: ({ label, date }) => (
                      <div className="text-xs p-1">{label}</div>
                    ),
                  },
                }}
              />
            </div>
          </div>

          {/* Add Holiday Section - div2 */}
          <div className="div2 row-span-4 col-start-4 bg-white p-3 rounded-lg flex flex-col overflow-y-auto border shadow">
            <h3 className="text-sm mb-4 text-neutralDGray">Add Holiday</h3>
            <div className="flex flex-col gap-3 -space-y-3 -mt-4">
              <label htmlFor="name" className="text-xs text-neutralDGray">
                Holiday Name
              </label>
              <input
                type="text"
                placeholder="e.g. Independence Day"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border text-xs border-gray-300 rounded-md"
              />
              <label htmlFor="date" className="text-xs -mt-1 text-neutralDGray">
                Holiday Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-2 text-xs -mt-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <label htmlFor="type" className="text-xs -mt-1 text-neutralDGray">
                Holiday Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="p-2 text-xs -mt-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="" disabled>
                  Select Type
                </option>
                <option value="Regular">Regular Holiday</option>
                <option value="Special">Special Holiday</option>
                <option value="Special Non-Working">
                  Special Non-Working Holiday
                </option>
              </select>

              <button
                onClick={addHoliday}
                className="p-2 text-xs h-8 w-full text-neutralDGray border hover:text-white hover:bg-green-400 rounded flex items-center justify-center transition duration-200"
              >
                Add Holiday
              </button>

              {/* Holiday Rates Display */}
              <div className="mt-0.5 p-2 bg-gray-50 rounded-lg">
                <div className="text-sm italic font-medium text-neutralDGray mb-2">
                  Current Rates:
                </div>
                <div className="text-sm text-neutralDGray -space-y-1 -mt-2">
                  <div>
                    Regular: <strong>{holidayRates.regular}x</strong>
                  </div>
                  <div>
                    Special: <strong>{holidayRates.special}x</strong>
                  </div>
                  <div>
                    Special Non-Working:{" "}
                    <strong>{holidayRates.specialNonWorking}x</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={openRateModal}
                className="p-2 text-xs h-8 w-full text-neutralDGray border hover:text-white hover:bg-green-400 rounded flex items-center justify-center transition duration-200"
              >
                Edit Holiday Rates
              </button>
            </div>
          </div>

          {/* Holiday List Section - div3 */}
          <div className="div3 col-span-4 row-span-3 row-start-5 bg-white p-3 rounded-lg overflow-auto border shadow">
            <h3 className="text-sm text-neutralDGray">Holiday List</h3>
            <div className="text-xs">
              <DataTable
                columns={columns}
                data={holidays}
                noDataComponent="No holidays available."
                pagination
                paginationRowsPerPageOptions={[10, 15, 20, 30]}
                dense
                highlightOnHover
                striped
              />
            </div>
          </div>
        </div>

        {/* Date Selection Modal */}
        {showDateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-base mb-3">Date Information</h3>
              <div className="p-4 h-fit bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Selected Date:
                </p>
                <p className="text-lg italic text-blue-800">
                  {selectedDate?.toDateString()}
                </p>
              </div>

              <div className="p-4 bg-gray-50 mt-2 rounded-lg">
                <p className="text-sm  font-medium text-gray-700 mb-1">
                  Holiday Status:
                </p>
                <p className="text-sm italic font-medium text-gray-800">
                  {selectedHoliday}
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeDateModal}
                  className="px-4 py-2 w-full h-10 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-gray-100 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Holiday Rates Modal */}
        {showRateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg mb-4">Edit Holiday Rates</h3>

              {loadingRates ? (
                <div className="text-center py-4">Loading rates...</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Regular Holiday Rate (multiplier)
                    </label>
                    <input
                      type="number"
                      name="regular"
                      value={holidayRates.regular}
                      onChange={handleRateChange}
                      step="0.1"
                      min="0"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Special Holiday Rate (multiplier)
                    </label>
                    <input
                      type="number"
                      name="special"
                      value={holidayRates.special}
                      onChange={handleRateChange}
                      step="0.1"
                      min="0"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Special Non-Working Rate (multiplier)
                    </label>
                    <input
                      type="number"
                      name="specialNonWorking"
                      value={holidayRates.specialNonWorking}
                      onChange={handleRateChange}
                      step="0.1"
                      min="0"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveHolidayRates}
                  disabled={loadingRates}
                  className="px-4 py-2 w-1/2 h-10 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
                >
                  Save Rates
                </button>
                <button
                  onClick={closeRateModal}
                  className="px-4 py-2 w-1/2 h-10 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Holidays;
