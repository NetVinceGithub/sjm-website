import React, { useState, useEffect } from "react";

const FilterList = ({
  data = [],
  show,
  onFilterChange,
  handleCloseFilterList,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState({
    project: "",
    department: "",
    employmentStatus: "",
    employmentRank: "",
    civilStatus: "",
    sex: "",
    ...initialFilters,
  });

  // Extract unique values from data for dropdown options
  const getUniqueValues = (field) => {
    if (!data || data.length === 0) return [];
    const values = data.map((item) => item[field]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      project: "",
      department: "",
      employmentStatus: "",
      employmentRank: "",
      civilStatus: "",
      sex: "",
    };
    setFilters(resetFilters);
    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
  };

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
                value={filters.project}
                onChange={(e) => handleFilterChange("project", e.target.value)}
                className="w-full p-2 border text-xs border-gray-300 rounded-md"
              >
                <option value="">All Projects</option>
                {getUniqueValues("project").map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
                }
                className="w-full p-2 border text-xs border-gray-300 rounded-md"
              >
                <option value="">All Departments</option>
                {getUniqueValues("department").map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Employment Status
              </label>
              <select
                value={filters.employmentStatus}
                onChange={(e) =>
                  handleFilterChange("employmentStatus", e.target.value)
                }
                className="w-full p-2 border text-xs border-gray-300 rounded-md"
              >
                <option value="">All Employment Status</option>
                {getUniqueValues("employmentStatus").map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Employment Rank
              </label>
              <select
                value={filters.employmentRank}
                onChange={(e) =>
                  handleFilterChange("employmentRank", e.target.value)
                }
                className="w-full p-2 border text-xs border-gray-300 rounded-md"
              >
                <option value="">All Employment Rank</option>
                {getUniqueValues("employmentRank").map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Civil Status
              </label>
              <select
                value={filters.civilStatus}
                onChange={(e) =>
                  handleFilterChange("civilStatus", e.target.value)
                }
                className="w-full p-2 border text-xs border-gray-300 rounded-md"
              >
                <option value="">All Civil Status</option>
                {getUniqueValues("civilStatus").map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Sex
              </label>
              <select
                value={filters.sex}
                onChange={(e) => handleFilterChange("sex", e.target.value)}
                className="w-full p-2 border text-xs border-gray-300 rounded-md"
              >
                <option value="">All Sex</option>
                {getUniqueValues("sex").map((sex) => (
                  <option key={sex} value={sex}>
                    {sex}
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
              className="w-full h-8 px-4 py-2 ustify-center items-center text-xs text-neutralDGray border rounded-md hover:bg-red-400 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
