import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";

// Default schedules (will appear even without manual input)
const defaultScheduleOptions = [
  {
    id: 1,
    value: "8-17",
    label: "Day Shift",
    start: 8,
    end: 17,
    isDefault: true,
  },
  {
    id: 2,
    value: "17-21",
    label: "Evening Shift",
    start: 17,
    end: 21,
    isDefault: true,
  },
  {
    id: 3,
    value: "21-6",
    label: "Night Shift",
    start: 21,
    end: 6,
    isDefault: true,
  },
];

const ScheduleSelectionModal = ({
  show,
  onClose,
  onConfirm,
  schedules = [],
  defaultSelected = [],
  onAddSchedule,
  onRemoveSchedule,
}) => {
  const [newSchedule, setNewSchedule] = useState({
    label: "",
    start: "",
    end: "",
  });

  const [scheduleList, setScheduleList] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState(defaultSelected);

  useEffect(() => {
    if (show) {
      setNewSchedule({ label: "", start: "", end: "" });
      setSelectedSchedules(defaultSelected);

      // Ensure default schedules are loaded only once per open
      const uniqueSchedules = [
        ...defaultScheduleOptions,
        ...schedules.filter(
          (s) => !defaultScheduleOptions.some((d) => d.id === s.id)
        ),
      ];
      setScheduleList(uniqueSchedules);
    }
  }, [show, defaultSelected, schedules]);

  const handleToggleSelection = (schedule) => {
    setSelectedSchedules((prev) =>
      prev.some((s) => s.id === schedule.id)
        ? prev.filter((s) => s.id !== schedule.id)
        : [...prev, schedule]
    );
  };

  const handleAddSchedule = () => {
    if (
      newSchedule.label &&
      newSchedule.start !== "" &&
      newSchedule.end !== ""
    ) {
      const newId = Date.now();
      const newEntry = {
        id: newId,
        ...newSchedule,
        start: parseInt(newSchedule.start),
        end: parseInt(newSchedule.end),
        isDefault: false,
      };
      setScheduleList((prev) => [...prev, newEntry]);
      onAddSchedule && onAddSchedule(newEntry);
      setNewSchedule({ label: "", start: "", end: "" });
    }
  };

  const handleRemove = (id) => {
    setScheduleList((prev) => prev.filter((s) => s.id !== id));
    onRemoveSchedule && onRemoveSchedule(id);
    setSelectedSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg" backdrop="static">
      <Modal.Header className="py-3 px-4">
        <Modal.Title as="h6" className="text-base text-neutralDGray">
          Manage Work Schedules
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Add New Schedule */}
        <div className="mb-3 p-2 border rounded-lg bg-gray-50">
          <h6 className="text-sm text-neutralDGray mb-3">Add New Schedule</h6>
          <div className="flex flex-row gap-3 -mt-2">
            <input
              type="text"
              placeholder="Schedule Name"
              value={newSchedule.label}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, label: e.target.value })
              }
              className="p-1 h-10 flex-1 border rounded text-xs"
            />
            <input
              type="number"
              placeholder="Start Hour (0-23)"
              min="0"
              max="23"
              value={newSchedule.start}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, start: e.target.value })
              }
              className="p-1 h-10 border flex-1 rounded text-xs"
            />
            <input
              type="number"
              placeholder="End Hour (0-23)"
              min="0"
              max="23"
              value={newSchedule.end}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, end: e.target.value })
              }
              className="p-1 h-10 border flex-1 rounded text-xs"
            />
            <button
              onClick={handleAddSchedule}
              className="px-3 py-2 w-fit h-10 border text-neutralDGray rounded text-xs hover:bg-green-400 hover:text-white flex items-center justify-center gap-1"
            >
              Add
            </button>
          </div>
        </div>

        {/* Schedule Selection List */}
        <div>
          <h6 className="text-xs font-medium text-neutralDGray mb-2">
            Select Active Schedules ({selectedSchedules.length} selected)
          </h6>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {scheduleList.map((schedule) => {
              const isSelected = selectedSchedules.some(
                (s) => s.id === schedule.id
              );
              return (
                <div
                  key={schedule.id}
                  className={`h-14 px-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 hover:border-green-300"
                  }`}
                  onClick={() => handleToggleSelection(schedule)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-green-400 bg-green-400"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded"></div>
                      )}
                    </div>
                    <div>
                      <h6 className="font-medium mt-3 text-neutralDGray">
                        {schedule.label}
                      </h6>
                      <p className="text-xs -mt-2 text-gray-600">
                        {schedule.start}:00 -{" "}
                        {schedule.end === 6 && schedule.start === 21
                          ? "06:00 (next day)"
                          : `${schedule.end}:00`}
                      </p>
                    </div>
                  </div>
                  {!schedule.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(schedule.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="p-2">
        <button
          onClick={() => onConfirm(selectedSchedules)}
          disabled={selectedSchedules.length === 0}
          className={`px-6 py-2 h-10 rounded-md text-xs transition-all ${
            selectedSchedules.length > 0
              ? "bg-green-400 text-white hover:bg-green-500"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Confirm Schedule
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ScheduleSelectionModal;