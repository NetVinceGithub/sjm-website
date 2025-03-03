import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./customCalendar.css"; // Custom styles for advanced styling

export default function DatePicker() {
  const [date, setDate] = useState(new Date());
  return (
    <div className="-mt-1 p-4 max-w-sm mx-auto bg-white rounded flex flex-col items-center">
      <div className="p-2 rounded border shadow-md w-full">
        <Calendar
          onChange={setDate}
          value={date}
          className="custom-calendar"
        />
      </div>
    </div>
  );
}
