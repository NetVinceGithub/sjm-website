import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const PayrollCalendar = () => {
  const [date, setDate] = useState(new Date());

  // Example payroll events (You can replace this with real data)
  const payrollEvents = [
    { date: "2025-02-28", title: "Payroll Cutoff" },
    { date: "2025-03-05", title: "Salary Disbursement" },
  ];

  // Check if a date has an event
  const getEventForDate = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    return payrollEvents.find((event) => event.date === formattedDate);
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-lg w-full md:w-[40%]">
      <h3 className="text-lg font-semibold mb-4">Payroll Calendar</h3>
      <Calendar
        onChange={setDate}
        value={date}
        tileContent={({ date }) => {
          const event = getEventForDate(date);
          return event ? (
            <p className="text-xs text-red-500 mt-1">{event.title}</p>
          ) : null;
        }}
      />
      <p className="mt-4 text-sm text-gray-600">
        Selected Date: <span className="font-semibold">{date.toDateString()}</span>
      </p>
    </div>
  );
};

export default PayrollCalendar;
