import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import DataTable from "react-data-table-component";

// Mock DataTable component since react-data-table-component isn't available
const RequestStatus = () => {
  // Sample data - replace with your actual data source
  const [originalData] = useState([
    {
      "Request ID": "REQ-001",
      "Request Type": "Leave Request",
      "Date Created": "2024-01-15",
      Requestor: "John Doe",
      "Request Status": "Pending",
      "Action Taken By": "HR Manager",
    },
    {
      "Request ID": "REQ-002",
      "Request Type": "Equipment Request",
      "Date Created": "2024-01-16",
      Requestor: "Jane Smith",
      "Request Status": "Approved",
      "Action Taken By": "IT Manager",
    },
    {
      "Request ID": "REQ-003",
      "Request Type": "Training Request",
      "Date Created": "2024-01-17",
      Requestor: "Bob Johnson",
      "Request Status": "Rejected",
      "Action Taken By": "Training Coordinator",
    },
    {
      "Request ID": "REQ-004",
      "Request Type": "Travel Request",
      "Date Created": "2024-01-18",
      Requestor: "Alice Brown",
      "Request Status": "Under Review",
      "Action Taken By": "Finance Manager",
    },
  ]);

  const customStyles = {
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
        minHeight: "40px",
        borderBottom: "1px solid #e5e7eb",
      },
    },
    cells: {
      style: {
        padding: "8px",
      },
    },
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [loading] = useState(false);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return originalData;

    return originalData.filter((row) =>
      Object.values(row).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [originalData, searchTerm]);

  const handleFilter = (e) => {
    setSearchTerm(e.target.value);
  };

  const columns = [
    {
      name: "Request ID",
      sortable: true,
    },
    {
      name: "Request Type",
      sortable: true,
    },
    {
      name: "Date Created",
      sortable: true,
    },
    {
      name: "Requestor",
      sortable: true,
    },
    {
      name: "Request Status",
      sortable: true,
    },
    {
      name: "Action Taken By",
      sortable: true,
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mt-2 mb-2">
        <div className="text-left">
          <h3 className="text-base -mt-2 font-medium text-gray-700"></h3>
        </div>
        <div className="flex justify-end items-center w-1/2 -mt-12 gap-3">
          <div className="flex rounded w-full items-center relative">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={handleFilter}
              className="px-2 pr-8 h-8 text-xs bg-neutralSilver w-full rounded py-0.5 border"
            />
            <Search className="absolute right-2 h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>
      {/* Display search results info */}
      {searchTerm && (
        <div className="-mt-4 text-sm text-gray-600 mb-2">
          Showing {filteredData.length} of {originalData.length} results for "
          {searchTerm}"
        </div>
      )}
      <div className="-mt-1 overflow-auto rounded-md border border-gray-200">
        <DataTable
          columns={columns}
          data={filteredData}
          progressPending={loading}
          progressComponent={
            <div className="flex justify-center items-center gap-2 text-gray-600 text-sm">
              <ThreeDots
                visible={true}
                height="60"
                width="60"
                color="#4fa94d"
                radius="9"
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                wrapperClass=""
              />
            </div>
          }
          noDataComponent={
            <div className="text-gray-500 text-sm italic py-4 text-center">
              *** No data found ***
            </div>
          }
          pagination
          customStyles={customStyles}
          responsive
          highlightOnHover
          striped
          dense
        />
      </div>
    </div>
  );
};

export default RequestStatus;
