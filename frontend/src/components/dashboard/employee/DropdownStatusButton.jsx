import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaMinusSquare, FaChevronDown } from "react-icons/fa";

const DropdownStatusButton = ({ row, effectiveStatus, handleToggleStatus }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update dropdown position when it opens
  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.top - 8,
        left: rect.right - 150,
      });
    }
  }, [isDropdownOpen]);

  const handleOptionSelect = (option) => {
    // Enhanced debugging
    console.log("🔍 DropdownStatusButton Debug:", {
      selectedOption: option,
      rowId: row.id,
      rowEmployeeId: row.employeeId,
      effectiveStatus,
      employmentStatus: row.employmentstatus,
      fullRowKeys: Object.keys(row),
    });

    // Use consistent ID logic - try both fields
    const employeeId = row.employeeId || row.id;

    if (!employeeId) {
      console.error("❌ No valid employee ID found in row:", row);
      return;
    }

    // Pass all required parameters
    handleToggleStatus(
      employeeId,
      effectiveStatus,
      row.employmentstatus,
      option
    );
    setIsDropdownOpen(false);
  };

  const handleMainButtonClick = () => {
    const employeeId = row.employeeId || row.id;
    console.log("🔘 Main button clicked for employee:", employeeId);

    if (!employeeId) {
      console.error("❌ No valid employee ID found for main button");
      return;
    }

    // For main button click, don't pass newStatus (4th parameter)
    handleToggleStatus(employeeId, effectiveStatus, row.employmentstatus);
  };

  // Determine what options to show based on current status
  const getAvailableOptions = () => {
    const options = [];

    // Always show Block and Inactive options
    if (effectiveStatus !== "Block") {
      options.push("Block");
    }
    if (effectiveStatus !== "Inactive") {
      options.push("Inactive");
    }

    return options;
  };

  const availableOptions = getAvailableOptions();

  const DropdownMenu = () => (
    <div
      ref={dropdownRef}
      className="fixed w-32 divide-y bg-white border border-gray-200 rounded shadow-lg z-[9999]"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
      }}
    >
      {availableOptions.includes("Block") && (
        <button
          className="w-full p-2 text-center h-10 text-xs text-gray-700 hover:bg-red-50 hover:text-red-700 transition"
          onClick={() => handleOptionSelect("Block")}
        >
          Block
        </button>
      )}
      {availableOptions.includes("Inactive") && (
        <button
          className="w-full p-2 text-center text-xs h-10 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition"
          onClick={() => handleOptionSelect("Inactive")}
        >
          Inactive
        </button>
      )}
      {/* Add Active option for blocked/inactive employees */}
      {(effectiveStatus === "Block" || effectiveStatus === "Inactive") && (
        <button
          className="w-full p-2 text-center text-xs h-10 text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
          onClick={() => handleOptionSelect("Active")}
        >
          Activate
        </button>
      )}
    </div>
  );

  return (
    <div className="relative">
      <div className="flex">
        <button
          ref={buttonRef}
          className={`w-10 h-8 border border-neutralDGray rounded-r flex items-center flex-row gap-1 justify-center transition ${
            effectiveStatus === "Active"
              ? "bg-green-500 text-white hover:bg-green-600"
              : effectiveStatus === "Block"
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-yellow-500 text-white hover:bg-yellow-600" // For Inactive
          }`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          title={`Current status: ${effectiveStatus}. Click to see options.`}
        >
          <FaMinusSquare title="Toggle Status" className="w-4 h-4" />
          {"  "}
          <FaChevronDown className="w-2 h-2 top-0" />
        </button>
      </div>

      {/* Render dropdown using portal */}
      {isDropdownOpen &&
        availableOptions.length > 0 &&
        createPortal(<DropdownMenu />, document.body)}
    </div>
  );
};

export default DropdownStatusButton;