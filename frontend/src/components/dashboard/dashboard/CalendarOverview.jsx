import { useState, useEffect } from "react";

export default function CustomCalendar({ onDateChange }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notice1, setNotice1] = useState("");
  const [notice2, setNotice2] = useState("");
  const [notice3, setNotice3] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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
    return day >= 16 && day <= 30;
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
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      let dayClasses = "h-10 w-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200 hover:bg-gray-100";
      
      if (isSalaryDay(day)) {
        dayClasses += " bg-green-600 text-white font-bold transform scale-105 hover:bg-green-700";
      } else if (isFirstCutoff(day)) {
        dayClasses += " bg-blue-100 text-blue-800";
      } else if (isSecondCutoff(day)) {
        dayClasses += " bg-yellow-100 text-yellow-800";
      }

      if (isSelectedDate(day)) {
        dayClasses += " ring-2 ring-blue-500 ring-offset-1";
      }

      days.push(
        <div
          key={day}
          className={dayClasses}
          onClick={() => handleDateSelect(new Date(currentYear, currentMonth, day))}
        >
          {day}
        </div>
      );
    }

    return (
      <div>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(dayName => (
            <div key={dayName} className="h-8 flex items-center justify-center text-xs font-semibold text-gray-500">
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
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Payroll Calendar</h2>
            <p className="text-blue-100 text-xs mt-1">Track your payroll schedule</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{selectedDate.getDate()}</div>
            <div className="text-xs text-blue-100 uppercase tracking-wide">
              {selectedDate.toLocaleDateString("en-US", { 
                weekday: "short",
                month: "short"
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Notice Panel */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 p-4">
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Today's Notice</h3>
          
          {/* Legend - Inline */}
          <div className="ml-auto flex items-center space-x-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-600 rounded mr-1"></div>
              <span className="text-xs text-gray-600">Salary</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-200 rounded mr-1"></div>
              <span className="text-xs text-gray-600">1st Cut</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-200 rounded mr-1"></div>
              <span className="text-xs text-gray-600">2nd Cut</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {notice1 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                <p className="text-xs text-gray-700 leading-relaxed">{notice1}</p>
              </div>
            </div>
          )}
          
          {(notice2 || notice3) && (
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                <p className="text-xs text-gray-700 leading-relaxed">{notice2 || notice3}</p>
              </div>
            </div>
          )}

          {!notice1 && !notice2 && !notice3 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-center text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs">All caught up!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Section */}
      <div className="p-6">
        {renderCalendar()}
      </div>
    </div>
  );
}