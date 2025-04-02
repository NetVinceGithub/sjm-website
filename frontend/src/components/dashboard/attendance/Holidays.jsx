import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default calendar styles
import './CalendarStyles.css'; // Custom styles

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
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
      await axios.post("http://localhost:5000/api/holidays/add", { name, date });
      fetchHolidays();
      setName('');
      setDate('');
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
    const holiday = holidays.find((h) => new Date(h.date).toDateString() === date.toDateString());
    setSelectedHoliday(holiday ? holiday.name : "No holiday");
  };

  const tileClassName = ({ date }) => {
    return holidays.some((h) => new Date(h.date).toDateString() === date.toDateString())
      ? "holiday-highlight"
      : "";
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h3 className="text-2xl font-bold text-center mb-4">📆 Holiday Calendar</h3>

      <Calendar 
        onClickDay={handleDateClick}
        tileClassName={tileClassName}
        className="custom-calendar"
      />

      {selectedDate && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-lg font-semibold">📅 {selectedDate.toDateString()}</p>
          <p className="text-blue-500 text-xl font-bold">{selectedHoliday}</p>
        </div>
      )}

      {/* Add Holiday */}
      <div className="flex flex-col gap-4 mt-6">
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
        <button
          onClick={addHoliday}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          ➕ Add Holiday
        </button>
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
                {holiday.date} - <span className="text-blue-600">{holiday.name}</span>
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
          <p className="text-center text-gray-500 font-medium">No holidays available.</p>
        )}
      </ul>

    </div>
  );
};

export default Holidays;
