import React, { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import DataTable from "react-data-table-component";
import axios from "axios";
import dayjs from "dayjs";

const RequestStatus = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payslip`);
        const approvedPayslips = response.data.filter(
          (p) => p.status?.toLowerCase() === "approved"
        );

        // Compute releaseDate for each payslip
        const payslipsWithRelease = approvedPayslips.map((p) => {
          const match = p.cutoffDate.match(/^([A-Za-z]+)\s+(\d+)-\d+,\s*(\d+)$/);
          if (!match) return { ...p, releaseDate: null };

          const [, monthName, startDayStr, yearStr] = match;
          const startDay = parseInt(startDayStr, 10);
          const year = parseInt(yearStr, 10);
          const releaseDay = startDay <= 15 ? 4 : 19;

          const monthNames = {
            January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
            July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
          };

          const monthIndex = monthNames[monthName]; // 0-indexed month

          const releaseDate = dayjs()
            .year(year)
            .month(monthIndex)
            .date(releaseDay)
            .startOf("day");

          return { ...p, releaseDate };
        });

        setPayslips(payslipsWithRelease);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching payslips:", error);
        setLoading(false);
      }
    };

    fetchPayslips();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm) return payslips;
    return payslips.filter((row) =>
      Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [payslips, searchTerm]);

  const handleFilter = (e) => setSearchTerm(e.target.value);

  const columns = [
    { name: "Request ID", selector: (row) => row.batchId, sortable: true },
    { name: "Request Type", selector: (row) => row.payrollType, sortable: true },
    { name: "Date Created", selector: (row) => row.date, sortable: true },
    { name: "Cut off Date", selector: (row) => row.cutoffDate, sortable: true },
    { name: "Requestor", selector: (row) => row.requestedBy, sortable: true },
    { name: "Request Status", selector: (row) => row.status, sortable: true },
    {
      name: "Release Date",
      selector: (row) => row.releaseDate?.format("YYYY-MM-DD") || "-",
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

      {searchTerm && (
        <div className="-mt-4 text-sm text-gray-600 mb-2">
          Showing {filteredData.length} of {payslips.length} results for "{searchTerm}"
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
              />
            </div>
          }
          noDataComponent={
            <div className="text-gray-500 text-sm italic py-4 text-center">
              *** No data found ***
            </div>
          }
          pagination
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
                minHeight: "40px",
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
    </div>
  );
};

export default RequestStatus;
