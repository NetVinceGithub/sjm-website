import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import DataTable from "react-data-table-component";
import { ThreeDots } from "react-loader-spinner";

export default function BatchPayslipsModal({ batch, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!batch) return null;

  const filteredPayslips = useMemo(() => {
    if (!searchTerm) return batch.payslips;
    return batch.payslips.filter((payslip) =>
      Object.values(payslip).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [batch.payslips, searchTerm]);

  const handleFilter = (e) => setSearchTerm(e.target.value);

  const columns = [
    {
      name: "Employee Name",
      selector: (row) => row.name,
      sortable: true,
      width: "300px",
    },
    {
      name: "Net Pay",
      selector: (row) =>
        `₱${parseFloat(row.netPay).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      sortable: true,
      width: "200px",
    },
    {
      name: "Gross Pay",
      selector: (row) =>
        `₱${parseFloat(row.gross_pay).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      sortable: true,
      width: "200px",
    },
    {
      name: "No. of Days",
      selector: (row) =>
        `${parseFloat(row.noOfDays).toLocaleString("en-US")}`,
      sortable: true,
      width: "200px",
    },
    {
      name: "Status",
      selector: (row) =>
        row.status.charAt(0).toUpperCase() + row.status.slice(1),
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            row.status === "approved"
              ? "bg-green-100 text-green-700"
              : row.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
      width: "150px",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-3 rounded-lg w-3/4 max-h-[85vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-800">
            Payslips for {batch.cutoffDate}
          </h2>
        </div>

        {/* Search Bar */}
        <div className="mb-4 flex justify-end">
          <div className="flex rounded w-full md:w-1/2 items-center -mt-6 justify-end relative">
            <input
              type="text"
              placeholder="Search payslips..."
              value={searchTerm}
              onChange={handleFilter}
              className="px-2 pr-8 h-8 text-xs w-full rounded py-0.5 border"
            />
            <Search className="absolute right-2 h-4 w-4 text-gray-500" />
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto rounded-md border border-gray-200">
          <DataTable
            columns={columns}
            data={filteredPayslips}
            noDataComponent={
              <div className="text-gray-500 text-sm italic py-4 text-center">
                *** No data found ***
              </div>
            }
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: "#f9fafb",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  padding: "8px",
                },
              },
              rows: {
                style: {
                  fontSize: "13px",
                  color: "#4B5563",
                  minHeight: "50px",
                  borderBottom: "1px solid #e5e7eb",
                },
              },
              cells: { style: { padding: "8px" } },
            }}
            responsive
            highlightOnHover
            striped
            dense
          />
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end">
          <button
            className="px-2 text-xs text-neutralDGray rounded w-18 text-center justify-center items-center hover:bg-red-400 hover:text-white flex h-8 py-0.5 border"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
