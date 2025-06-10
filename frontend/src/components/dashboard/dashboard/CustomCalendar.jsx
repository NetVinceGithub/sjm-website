import { useState, useEffect } from "react";
import { FaAngleRight, FaAngleLeft, FaCircleInfo } from "react-icons/fa6";

export default function CustomCalendar({ onDateChange }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notice1, setNotice1] = useState("");
  const [notice2, setNotice2] = useState("");
  const [notice3, setNotice3] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hoveredCutoffType, setHoveredCutoffType] = useState(null);

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

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (onDateChange) {
      onDateChange(date.toLocaleDateString());
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const isSalaryDay = (day) => {
    return day === 5 || day === 20;
  };

  const isFirstCutoff = (day) => {
    return day >= 1 && day <= 15;
  };

  const isSecondCutoff = (day) => {
    const lastDay = getDaysInMonth(currentMonth, currentYear);
    return day >= 16 && day <= lastDay;
  };


  const isSelectedDate = (day) => {
    return selectedDate &&
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear;
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      let dayClasses = "h-7 w-7 flex items-center justify-center text-xs cursor-pointer rounded-lg transition-all duration-200";

      if (isSalaryDay(day)) {
        dayClasses += " bg-green-600 text-white font-bold transform scale-105 hover:bg-green-700";
      } else if (isFirstCutoff(day)) {
        // Apply blue background when hovering over any first cutoff date
        dayClasses += hoveredCutoffType === 'first'
          ? " bg-blue-100 text-blue-800"
          : " text-blue-800 hover:bg-blue-100";
      } else if (isSecondCutoff(day)) {
        // Apply yellow background when hovering over any second cutoff date
        dayClasses += hoveredCutoffType === 'second'
          ? " bg-yellow-100 text-yellow-800"
          : " text-yellow-800 hover:bg-yellow-100";
      } else {
        dayClasses += " hover:bg-gray-100";
      }

      if (isSelectedDate(day)) {
        dayClasses += " ring-2 ring-blue-500 ring-offset-1";
      }

      days.push(
        <div
          key={day}
          className={dayClasses}
          onClick={() => handleDateSelect(new Date(currentYear, currentMonth, day))}
          onMouseEnter={() => {
            if (isFirstCutoff(day)) {
              setHoveredCutoffType('first');
            } else if (isSecondCutoff(day)) {
              setHoveredCutoffType('second');
            }
          }}
          onMouseLeave={() => {
            if (isFirstCutoff(day) || isSecondCutoff(day)) {
              setHoveredCutoffType(null);
            }
          }}
        >
          {day}
        </div>
      );
    }

    return (
      <div>
        {/* Calendar Header */}
        <div className="flex h-10 items-center justify-center gap-2 mb-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 flex justify-start hover:text-gray-300 rounded-lg transition-colors"
          >
            <FaAngleLeft className="w-3 h-3" />
          </button>

          <h3 className="text-sm text-gray-800 flex justify-center font-medium whitespace-nowrap">
            {monthNames[currentMonth]} {currentYear}
          </h3>

          <button
            onClick={() => navigateMonth('next')}
            className="p-1 hover:text-gray-300 rounded-lg flex justify-end transition-colors"
          >
            <FaAngleRight className="w-3 h-3" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 -ml-1.5 mb-2">
          {dayNames.map(dayName => (
            <div key={dayName} className="h-6 flex items-center justify-center text-xs font-semibold text-gray-500">
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm">Payroll Calendar</h2>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">{selectedDate.getDate()}</div>
            <div className="text-xs text-blue-100 uppercase tracking-wide">
              {selectedDate.toLocaleDateString("en-US", { month: "short" }) + ", " +
                selectedDate.toLocaleDateString("en-US", { weekday: "short" })}
            </div>
          </div>
        </div>
      </div>

      {/* Notice Panel */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 p-2">
        <div className="flex items-center mb-1">
          <h3 className="text-xs font-semibold text-gray-800">Today's Notice</h3>

          {/* Compact Legend */}
          <div className="ml-auto flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-600 rounded mr-1"></div>
              <span className="text-xs text-gray-600">Salary</span>
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-200 rounded mr-1"></div>
              <span className="text-xs text-gray-600">1st</span>
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-yellow-200 rounded mr-1"></div>
              <span className="text-xs text-gray-600">2nd</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {notice1 && (
            <div className="bg-white rounded px-2 py-1 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full flex-shrink-0" />
                <p className="text-xs text-gray-700 leading-normal">{notice1}</p>
              </div>
            </div>
          )}

          {(notice2 || notice3) && (
            <div className="bg-white rounded px-2 py-1 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full flex-shrink-0" />
                <p className="text-xs text-gray-700 leading-normal">{notice2 || notice3}</p>
              </div>
            </div>
          )}

          {!notice1 && !notice2 && !notice3 && (
            <div className="bg-white rounded p-2 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-center text-gray-500">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs">All caught up!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Section */}
      <div className="p-2">
        {renderCalendar()}
      </div>
    </div>
  );
}