import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./customCalendar.css"; // Custom styles for advanced styling

export default function CustomCalendar({ onDateChange }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notice1, setNotice1] = useState("");
  const [notice2, setNotice2] = useState("");
  const [notice3, setNotice3] = useState("");

  useEffect(() => {
    const today = new Date();
    const date = today.getDate();
    let cutOffNotice = "";
    let salaryNotice = "";
    let payrollNotice = "";

    // Cut-off period notice
    if (date >= 1 && date <= 15) {
      cutOffNotice = "You are currently at the first cut-off period.";
    } else if (date >= 16 && date <= 30) {
      cutOffNotice = "You are currently at the second cut-off period.";
    }

    // Salary reminder notice
    if (date >= 2 && date <= 4) {
      salaryNotice =
        "Salary day is approaching! Remember to create payroll for the 5th.";
    } else if (date >= 17 && date <= 19) {
      salaryNotice =
        "Salary day is approaching! Remember to create payroll for the 20th.";
    }

    // Payroll day notice
    if (date === 5 || date === 20) {
      payrollNotice = "Payroll Day!";
    }

    setNotice1(cutOffNotice);
    setNotice2(salaryNotice);
    setNotice3(payrollNotice);
  }, []);

  const handleDateChange = (value) => {
    setSelectedDate(value);
    onDateChange(value.toLocaleDateString());
  };

  const getTileClassName = ({ date, view }) => {
    if (view !== "month") return "";

    const day = date.getDate();
    if (day === 5 || day === 20) return "salary-day";
    if (day >= 1 && day <= 15) return "first-cutoff";
    if (day >= 16 && day <= 30) return "second-cutoff";
    return "";
  };

  return (
    <div className="flex flex-col-reverse w-[50%] mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Top Panel - Calendar */}
      <div className="w-full border border-neutralDGray p-2">
        <Calendar
          onClickDay={handleDateChange}
          tileClassName={({ date }) =>
            selectedDate?.toDateString() === date.toDateString()
              ? "custom-calendar-tile"
              : ""
          }
        />
      </div>

      {/* Bottom Panel - Notice */}
      <div className="w-full bg-brandPrimary text-white p-2">
        <div className="flex items-center ml-3">
          <div className="text-center mr-3">
            <h1 className="text-4xl laptop:text-2xl font-bold">{selectedDate.getDate()}</h1>
            <p className="text-md laptop:text-sm uppercase">
              {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
            </p>
          </div>

          {/* Vertical divider */}
          <div className="w-px bg-gray-200 opacity-60 h-28 mx-3"></div>

          <div className="flex-1">
            <strong className="text-md laptop:text-xs">Notice!</strong>
            <ul className="space-y-1 mt-1">
              <li className="list-disc text-sm">
                <p className="m-0 text-[12px]">{notice1}</p>
              </li>
              {(notice2 || notice3) && (
                <li className="list-disc ml-2 text-sm">
                  <p className="m-0">{notice2 || notice3}</p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
