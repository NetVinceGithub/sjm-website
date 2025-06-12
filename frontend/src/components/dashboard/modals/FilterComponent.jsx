import React, { useState } from "react";
import { ChevronDown, ChevronUp, X, Plus, Trash2 } from "lucide-react";

const FilterComponent = ({ show, onClose, onSchedulesSelected }) => {
  const [isOpen, setIsOpen] = useState({
    schedules: true,
  });

  const [filters, setFilters] = useState({
    schedules: {
      dayShift: false,
      eveningShift: false,
      nightShift: false,
    },
  });


  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });

  const [scheduleOptions, setScheduleOptions] = useState([
    { 
      key: "dayShift", 
      label: "Day Shift: 8am - 5pm", 
      color: "bg-yellow-400",
      value: "08:00-17:00",
      isDefault: true
    },
    {
      key: "eveningShift",
      label: "Evening Shift: 4pm - 1am",
      color: "bg-orange-500",
      value: "16:00-01:00",
      isDefault: true
    },
    {
      key: "nightShift",
      label: "Night Shift: 12am - 9am",
      color: "bg-indigo-600",
      value: "00:00-09:00",
      isDefault: true
    },
  ]);

  // Don't render anything if show is false
  if (!show) return null;

  const toggleSection = (section) => {
    setIsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleScheduleChange = (schedule) => {
    setFilters((prev) => ({
      ...prev,
      schedules: { ...prev.schedules, [schedule]: !prev.schedules[schedule] },
    }));
  };

  const handleDateChange = (value) => {
    setFilters((prev) => ({ ...prev, dateUpdated: value }));
  };

  const handleInputChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSchedule = () => {
    if (newSchedule.name && newSchedule.startTime && newSchedule.endTime) {
      const key = newSchedule.name.toLowerCase().replace(/\s+/g, "");
      const label = `${newSchedule.name}: ${newSchedule.startTime} - ${newSchedule.endTime}`;
      const value = `${newSchedule.startTime}-${newSchedule.endTime}`;

      // Add to schedule options
      setScheduleOptions((prev) => [
        ...prev,
        {
          key,
          label,
          color: `bg-${
            ["blue", "green", "purple", "pink", "teal", "red"][
              Math.floor(Math.random() * 6)
            ]
          }-500`,
          value,
          isDefault: false
        },
      ]);

      // Add to filters state
      setFilters((prev) => ({
        ...prev,
        schedules: { ...prev.schedules, [key]: false },
      }));

      // Reset form
      setNewSchedule({ name: "", startTime: "", endTime: "" });
      setShowAddForm(false);
    }
  };

  const handleRemoveSchedule = (keyToRemove) => {
    // Remove from scheduleOptions
    setScheduleOptions((prev) => prev.filter(option => option.key !== keyToRemove));
    
    // Remove from filters state
    setFilters((prev) => {
      const newSchedules = { ...prev.schedules };
      delete newSchedules[keyToRemove];
      return { ...prev, schedules: newSchedules };
    });
  };

  const resetFilters = () => {
    const resetSchedules = {};
    scheduleOptions.forEach((option) => {
      resetSchedules[option.key] = false;
    });

    setFilters({
      schedules: resetSchedules,
    });
  };

  // Get selected schedules with their values for backend
  const getSelectedSchedules = () => {
    const selected = [];
    Object.keys(filters.schedules).forEach(key => {
      if (filters.schedules[key]) {
        const option = scheduleOptions.find(opt => opt.key === key);
        if (option) {
          selected.push({
            key: option.key,
            label: option.label,
            value: option.value
          });
        }
      }
    });
    return selected;
  };

  const handleApplyFilters = () => {
    const selectedSchedules = getSelectedSchedules();
    console.log("✅ FilterComponent - Selected schedules:", selectedSchedules);
    
    // Ensure we're passing a consistent data structure
    const formattedSchedules = selectedSchedules.map(schedule => ({
      key: schedule.key,
      label: schedule.label,
      value: schedule.value,
      color: scheduleOptions.find(opt => opt.key === schedule.key)?.color || 'bg-gray-500'
    }));
    
    if (onSchedulesSelected) {
      onSchedulesSelected(formattedSchedules);
    }
    
    onClose();
  };

  return (
    // Modal backdrop
    <div className="fixed top-[12rem] right-[30rem] bg-opacity-50 z-50">
      {/* Modal content */}
      <div className="w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <h3 className="font-medium flex mt-2 text-sm text-gray-900">Filters</h3>
          <X
            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
            onClick={onClose}
          />
        </div>

        {/* Schedules Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("schedules")}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <span className="text-sm text-gray-900">Schedules</span>
            {isOpen.schedules ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isOpen.schedules && (
            <div className="px-4 pb-4 space-y-3">
              <div className="space-y-3">
                {scheduleOptions.map((option) => (
                  <div key={option.key} className="flex items-center justify-between">
                    <label className="flex text-sm items-center space-x-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={filters.schedules[option.key] || false}
                        onChange={() => handleScheduleChange(option.key)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded ${option.color}`}></div>
                        <span className="text-sm text-gray-700">
                          {option.label}
                        </span>
                      </div>
                    </label>
                    {!option.isDefault && (
                      <button
                        onClick={() => handleRemoveSchedule(option.key)}
                        className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Remove schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Schedule Button */}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full h-10 flex items-center justify-center space-x-2 p-2 border border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50 text-gray-600"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Schedule</span>
              </button>

              {/* Add Schedule Form */}
              {showAddForm && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-md border">
                  <input
                    type="text"
                    placeholder="Schedule name (e.g., Weekend Shift)"
                    value={newSchedule.name}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      placeholder="Start time"
                      value={newSchedule.startTime}
                      onChange={(e) =>
                        setNewSchedule((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="time"
                      placeholder="End time"
                      value={newSchedule.endTime}
                      onChange={(e) =>
                        setNewSchedule((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddSchedule}
                      className="flex-1 h-10 px-3 py-2 text-sm font-medium text-neutralDGray border rounded-md hover:bg-green-400 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewSchedule({
                          name: "",
                          startTime: "",
                          endTime: "",
                        });
                      }}
                      className="flex-1 h-10 px-3 py-2 text-sm font-medium text-gray-700  border border-gray-300 rounded-md hover:bg-red-400 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-2">
          <button
            onClick={resetFilters}
            className="w-full h-10 px-4 py-2 text-sm font-medium text-neutralDGray border rounded-md hover:bg-red-400 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="w-full h-10 px-4 py-2 text-sm font-medium text-neutralDGray border rounded-md hover:bg-green-400 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;