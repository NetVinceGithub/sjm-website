import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./customCalendar.css"; // Custom styles for advanced styling

export default function CustomCalendar({ onDateChange }) {
  const [range, setRange] = useState([null, null]); // Store start and end dates

  const handleDateChange = (value) => {
    if (!range[0] || (range[0] && range[1])) {
      // Reset selection if no start date or both dates are set
      setRange([value, null]);
    } else if (value < range[0]) {
      // If selecting an earlier date, set it as the start date
      setRange([value, range[0]]);
    } else {
      // Set the second date normally
      setRange([range[0], value]);
    }
  };

  useEffect(() => {
    if (range[0] && range[1]) {
      // Format the date range and send it to the parent
      const formattedRange = `${range[0].toLocaleDateString()} - ${range[1].toLocaleDateString()}`;
      onDateChange(formattedRange);
    }
  }, [range, onDateChange]);

  const isDateInRange = (date) => {
    if (!range[0] || !range[1]) return false;
    return date >= range[0] && date <= range[1];
  };

  return (
    <div className="-mt-1 p-4 max-w-sm mx-auto bg-white rounded flex flex-col items-center">
      <div className="p-2 rounded border shadow-md w-full">
        <Calendar
          onClickDay={handleDateChange} // Handle range selection
          tileClassName={({ date, view }) =>
            view === "month" && isDateInRange(date) ? "highlighted" : ""
          }
        />
      </div>
    </div>
  );
}
