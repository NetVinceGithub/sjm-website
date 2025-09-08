import React, { useState, useEffect } from "react";

const FilterList = ({
  employees = [],
  show,
  onFilterChange,
  handleCloseFilterList,
  onClearFilters,
  activeFilters = {},
}) => {
  const [filters, setFilters] = useState({
    project: [],
    department: [],
    employmentStatus: [],
    employmentRank: [],
    civilStatus: [],
    sex: [],
    status: [],
    position: [],
    classification: [], // <-- added
    ...activeFilters,
  });

  useEffect(() => {
    setFilters({
      project: [],
      department: [],
      employmentStatus: [],
      employmentRank: [],
      civilStatus: [],
      sex: [],
      status: [],
      position: [],
      ...activeFilters,
    });
  }, [activeFilters]);

  // Fixed getUniqueValues function based on your DataTable columns
  const getUniqueValues = (field) => {
    if (!employees || employees.length === 0) return [];

    let values = [];

    switch (field) {
      case "project":
        values = employees.map((item) => item.project || "N/A").filter(Boolean);
        break;
      case "department":
        values = employees.map((item) => item.department).filter(Boolean);
        break;
      case "employmentStatus":
        // This maps to "employmentstatus" in your data
        values = employees
          .map((item) => item.employment_status)
          .filter(Boolean);
        break;
      case "employmentRank":
        // This maps to "employmentrank" in your data
        values = employees.map((item) => item.employment_rank).filter(Boolean);
        break;
      case "civilStatus":
        // This maps to "civilstatus" in your data
        values = employees.map((item) => item.civil_status).filter(Boolean);
        break;
      case "sex":
        // This maps to "gender" in your data (as shown in your DataTable columns)
        values = employees.map((item) => item.gender).filter(Boolean);
        break;
      case "status":
        // Handle effective status (considering resigned employees)
        values = employees
          .map((item) => {
            return item.employmentstatus === "RESIGNED"
              ? "Inactive"
              : item.status;
          })
          .filter(Boolean);
        break;
      case "position":
        values = employees.map((item) => item.position_title).filter(Boolean);
        break;
      case "classification":
        values = employees
          .map((item) => item.employment_classification)
          .filter(Boolean);
        break;

      default:
        values = employees.map((item) => item[field]).filter(Boolean);
    }

    return [...new Set(values)].sort();
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const processedFilters = {};

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].length > 0) {
        processedFilters[key] = filters[key];
      }
    });

    if (onFilterChange) {
      onFilterChange(processedFilters);
    }

    handleCloseFilterList();
  };

  const handleReset = () => {
    const resetFilters = {
      project: [],
      department: [],
      employmentStatus: [],
      employmentRank: [],
      civilStatus: [],
      sex: [],
      status: [],
      position: [],
      classification: [], // <-- added
    };

    setFilters(resetFilters);

    if (onClearFilters) {
      onClearFilters();
    }

    handleCloseFilterList();
  };

  const handleSelectChange = (field, value) => {
    const newFilters = { ...filters, [field]: value === "" ? [] : [value] };
    setFilters(newFilters);
  };

  const toSentenceCase = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-3 rounded-lg z-50 mx-auto shadow-lg max-w-md w-full">
        <div className="flex justify-between mb-2">
          <h2 className="text-base text-neutralDGray">Filter Options</h2>
          <button
            type="button"
            className="text-neutralDGray hover:text-red-700 transition-colors h-fit w-fit flex justify-end"
            onClick={handleCloseFilterList}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                value={filters.project?.[0] || ""}
                onChange={(e) => handleSelectChange("project", e.target.value)}
                className="w-full p-2 border text-xs border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Projects</option>
                {getUniqueValues("project").map((project) => (
                  <option key={project} value={project} title={project}>
                    {toSentenceCase(project)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={filters.department?.[0] || ""}
                onChange={(e) =>
                  handleSelectChange("department", e.target.value)
                }
                className="w-full p-2 border text-xs border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {getUniqueValues("department").map((department) => (
                  <option
                    key={department}
                    value={department}
                    title={department}
                  >
                    {toSentenceCase(department)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Employment Classification
              </label>
              <select
                value={filters.classification?.[0] || ""}
                onChange={(e) =>
                  handleSelectChange("classification", e.target.value)
                }
                className="w-full p-2 border text-xs border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Employment Classifications</option>
                {getUniqueValues("classification").map((classification) => (
                  <option
                    key={classification}
                    value={classification}
                    title={classification}
                  >
                    {toSentenceCase(classification)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Employment Status
              </label>
              <select
                value={filters.status?.[0] || ""}
                onChange={(e) => handleSelectChange("status", e.target.value)}
                className="w-full p-2 border text-xs border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                {getUniqueValues("status").map((status) => (
                  <option key={status} value={status} title={status}>
                    {toSentenceCase(status)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                value={filters.position?.[0] || ""}
                onChange={(e) => handleSelectChange("position", e.target.value)}
                className="w-full p-2 border text-xs border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Positions</option>
                {getUniqueValues("position").map((position) => (
                  <option key={position} value={position} title={position}>
                    {toSentenceCase(position)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Employment Rank
              </label>
              <select
                value={filters.employmentRank?.[0] || ""}
                onChange={(e) =>
                  handleSelectChange("employmentRank", e.target.value)
                }
                className="w-full p-2 border text-xs border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Employment Ranks</option>
                {getUniqueValues("employmentRank").map((rank) => (
                  <option key={rank} value={rank} title={rank}>
                    {toSentenceCase(rank)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Civil Status
              </label>
              <select
                value={filters.civilStatus?.[0] || ""}
                onChange={(e) =>
                  handleSelectChange("civilStatus", e.target.value)
                }
                className="w-full p-2 border text-xs border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Civil Status</option>
                {getUniqueValues("civilStatus").map((status) => (
                  <option key={status} value={status} title={status}>
                    {toSentenceCase(status)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Sex
              </label>
              <select
                value={filters.sex?.[0] || ""}
                onChange={(e) => handleSelectChange("sex", e.target.value)}
                className="w-full p-2 border text-xs border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sex</option>
                {getUniqueValues("sex").map((sex) => (
                  <option key={sex} value={sex} title={sex}>
                    {toSentenceCase(sex)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="w-full h-8 flex justify-center items-center px-4 py-2 text-xs text-neutralDGray border rounded-md hover:bg-green-400 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full h-8 px-4 py-2 flex justify-center items-center text-xs text-neutralDGray border rounded-md hover:bg-red-400 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FilterList;
