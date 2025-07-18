import React, { useState, useEffect } from "react";

const FilterList = ({
  data = [],
  onFilterChange,
  onClose,
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
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Filter Options</h2>
        <button
          type="button"
          className="text-red-500 hover:text-red-700 transition-colors"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            value={filters.project}
            onChange={(e) => handleFilterChange("project", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employment Status
          </label>
          <select
            value={filters.employmentStatus}
            onChange={(e) =>
              handleFilterChange("employmentStatus", e.target.value)
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employment Rank
          </label>
          <select
            value={filters.employmentRank}
            onChange={(e) =>
              handleFilterChange("employmentRank", e.target.value)
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Employment Ranks</option>
            {getUniqueValues("employmentRank").map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Civil Status
          </label>
          <select
            value={filters.civilStatus}
            onChange={(e) => handleFilterChange("civilStatus", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sex
          </label>
          <select
            value={filters.sex}
            onChange={(e) => handleFilterChange("sex", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All</option>
            {getUniqueValues("sex").map((sex) => (
              <option key={sex} value={sex}>
                {sex}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterList;
