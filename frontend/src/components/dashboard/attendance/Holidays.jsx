import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarStyles.css"; // Add custom styling here
import Breadcrumb from "../dashboard/Breadcrumb";

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHoliday, setSelectedHoliday] = useState("");

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/holidays");
      setHolidays(response.data.holidays || []);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setHolidays([]);
    }
  };

  const addHoliday = async () => {
    try {
      await axios.post("http://localhost:5000/api/holidays/add", {
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

  const deleteHoliday = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/holidays/delete/${id}`);
      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const holiday = holidays.find(
      (h) => new Date(h.date).toDateString() === date.toDateString()
    );
    setSelectedHoliday(
      holiday ? `${holiday.name} (${holiday.type})` : "No holiday"
    );
  };

  const tileClassName = ({ date }) => {
    const holiday = holidays.find(
      (h) => new Date(h.date).toDateString() === date.toDateString()
    );
    if (holiday) {
      return holiday.type === "Regular" ? "holiday-regular" : "holiday-special";
    }
    return "";
  };

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
          { label: "History", href: "/admin-dashboard/attendance/history" },
          { label: "Holidays", href: "" },
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        {/* Calendar on the left */}
        <div className="lg:w-1/2">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
            className="custom-calendar"
          />

          {selectedDate && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-lg font-semibold">
                📅 {selectedDate.toDateString()}
              </p>
              <p className="text-blue-500 text-xl font-bold">
                {selectedHoliday}
              </p>
            </div>
          )}
        </div>

        {/* Add Holiday Form on the right */}
        <div className="lg:w-1/2">
          <h3 className="text-xl font-semibold mb-4 text-neutralDGray">
            Add Holiday
          </h3>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Holiday Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Type</option>
              <option value="Regular">Regular Holiday</option>
              <option value="Special">Special Holiday</option>
            </select>
            <button
              onClick={addHoliday}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              ➕ Add Holiday
            </button>
          </div>
        </div>
      </div>

      {/* List Holidays */}
      <ul className="space-y-3 mt-6 max-h-96 overflow-y-auto">
        {holidays.length > 0 ? (
          holidays.map((holiday) => (
            <li
              key={holiday.id}
              className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-sm hover:bg-gray-200 transition-all duration-200"
            >
              <span className="font-medium text-gray-800">
                {holiday.date} -{" "}
                <span className="text-blue-600">{holiday.name}</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({holiday.type})
                </span>
              </span>
              <button
                onClick={() => deleteHoliday(holiday.id)}
                className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200"
              >
                ❌ Delete
              </button>
            </li>
          ))
        ) : (
          <p className="text-center text-gray-500 font-medium">
            No holidays available.
          </p>
        )}
      </ul>
      <div className="fixed top-0 right-0 bottom-0 min-h-screen w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-16">
        <Breadcrumb
          items={[
            { label: "Attendance", href: "/admin-dashboard/attendance" },
            { label: "Add Attendance", href: "/admin-dashboard/employees" },
            {
              label: "Attendance Computation",
              href: "/admin-dashboard/attendance-computation",
            },
            { label: "History", href: "/admin-dashboard/attendance/history" },
            { label: "Holidays", href: "" },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-4 mt-8">
          {" "}
          {/* Reduced gap from 8 to 4 */}
          {/* Calendar on the left */}
          <div className="lg:w-1/2">
            <Calendar
              onClickDay={handleDateClick}
              tileClassName={tileClassName}
              className="custom-calendar"
            />

            {selectedDate && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
                <p className="text-lg font-semibold">
                  📅 {selectedDate.toDateString()}
                </p>
                <p className="text-blue-500 text-xl font-bold">
                  {selectedHoliday}
                </p>
              </div>
            )}
          </div>
          {/* Add Holiday Form on the right */}
          <div className="lg:w-1/2">
            <h3 className="text-xl font-semibold mb-4 text-neutralDGray">
              Add Holiday
            </h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Holiday Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Type</option>
                <option value="Regular">Regular Holiday</option>
                <option value="Special">Special Holiday</option>
              </select>
              <button
                onClick={addHoliday}
                className="bg-green-500 h-10 text-white py-1 px-4 rounded-lg hover:bg-green-900 transition duration-200"
              >
                ➕ Add Holiday
              </button>
            </div>
          </div>
        </div>

        {/* List Holidays */}
        <ul className="space-y-3 p-2 mt-6 h-[35vh] w-full bg-white rounded-lg overflow-y-auto">
          {holidays.length > 0 ? (
            holidays.map((holiday) => (
              <li
                key={holiday.id}
                className="flex justify-between items-center bg-gray-100 p-2 rounded-lg shadow-sm hover:bg-gray-200 transition-all duration-200"
              >
                <span className="font-medium text-gray-800">
                  {holiday.date} -{" "}
                  <span className="text-blue-600">{holiday.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({holiday.type})
                  </span>
                </span>
                <button
                  onClick={() => deleteHoliday(holiday.id)}
                  className="border text-red-500 bg-red-200 py-1 p-1 h-10 w-24 text-center rounded-lg hover:bg-red-600 transition duration-200"
                >
                  ❌ Delete
                </button>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500 font-medium">
              No holidays available.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Holidays;
