import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Sector,
} from "recharts";
import DataTable from "react-data-table-component";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";

const COLORS = ["#4191D6", "#9D426E", "#80B646"];
const BAR_COLORS = ["#80B646", "#9D426E"];

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        fontWeight="bold"
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
        fontWeight="bold"
      >
        ₱{value.toLocaleString()}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {(percent * 100).toFixed(2)}%
      </text>
    </g>
  );
};

const Contributions = () => {
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [contributions, setContributions] = useState(null);

  // Add new state for filters
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    fetchContributions();
  }, []);

  // Add useEffect to extract available months and years when data loads
  useEffect(() => {
    if (contributions?.data?.employees) {
      extractAvailableFilters();
    }
  }, [contributions]);

  // Function to extract available months and years from data
  const extractAvailableFilters = () => {
    const months = new Set();
    const years = new Set();

    // Assuming your API data has date information - adjust this based on your actual data structure
    contributions.data.employees.forEach((employee) => {
      // If you have a date field in your employee data, extract month/year from it
      // For now, I'll create sample months/years - replace this with your actual date extraction
      if (employee.payrollDate) {
        const date = new Date(employee.payrollDate);
        months.add(date.getMonth() + 1); // getMonth() returns 0-11, so add 1
        years.add(date.getFullYear());
      }
    });

    // If no date data available, provide default options
    if (months.size === 0) {
      for (let i = 1; i <= 12; i++) {
        months.add(i);
      }
    }
    if (years.size === 0) {
      const currentYear = new Date().getFullYear();
      for (let i = currentYear - 5; i <= currentYear; i++) {
        years.add(i);
      }
    }

    setAvailableMonths(Array.from(months).sort((a, b) => a - b));
    setAvailableYears(Array.from(years).sort((a, b) => b - a));
  };

  // Function to filter contributions based on selected month and year
  const getFilteredContributions = () => {
    if (!contributions?.data?.employees) return { employees: [], summary: {} };

    let filteredEmployees = contributions.data.employees;

    // Apply month filter
    if (selectedMonth) {
      filteredEmployees = filteredEmployees.filter((employee) => {
        // Adjust this condition based on your actual date field structure
        if (employee.payrollDate) {
          const date = new Date(employee.payrollDate);
          return date.getMonth() + 1 === parseInt(selectedMonth);
        }
        return true; // If no date field, include all
      });
    }

    // Apply year filter
    if (selectedYear) {
      filteredEmployees = filteredEmployees.filter((employee) => {
        // Adjust this condition based on your actual date field structure
        if (employee.payrollDate) {
          const date = new Date(employee.payrollDate);
          return date.getFullYear() === parseInt(selectedYear);
        }
        return true; // If no date field, include all
      });
    }

    // Recalculate summary based on filtered employees
    const filteredSummary = {
      totalSSS: filteredEmployees.reduce(
        (sum, emp) => sum + (emp.contributions?.sss?.total || 0),
        0
      ),
      totalPhilhealth: filteredEmployees.reduce(
        (sum, emp) => sum + (emp.contributions?.philhealth?.total || 0),
        0
      ),
      totalPagibig: filteredEmployees.reduce(
        (sum, emp) => sum + (emp.contributions?.pagibig?.total || 0),
        0
      ),
    };
    filteredSummary.grandTotal =
      filteredSummary.totalSSS +
      filteredSummary.totalPhilhealth +
      filteredSummary.totalPagibig;

    return {
      employees: filteredEmployees,
      summary: filteredSummary,
    };
  };

  // Get month name from number
  const getMonthName = (monthNumber) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber - 1];
  };

  // Handle filter changes
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  // Clear filters function
  const clearFilters = () => {
    setSelectedMonth("");
    setSelectedYear("");
  };

  // Fetch data from backend
  const fetchContributions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payslip/contribution`);

      // response.data = { success: true, data: [...] }
      const rawData = response.data.data || [];

      const employees = rawData.map(item => ({
        name: item.name,
        status: "ACTIVE",
        employeeSSS: item.sss,
        employeePhilhealth: item.phic,
        employeePagibig: item.hdmf,
        contributions: {
          sss: { total: parseFloat(item.sss) || 0 },
          philhealth: { total: parseFloat(item.phic) || 0 },
          pagibig: { total: parseFloat(item.hdmf) || 0 }
        },
        grandTotal:
          (parseFloat(item.sss) || 0) +
          (parseFloat(item.phic) || 0) +
          (parseFloat(item.hdmf) || 0)
      }));

      setContributions({
        data: { employees }
      });
    } catch (error) {
      console.error("Error fetching contributions:", error);
    } finally {
      setLoading(false);
    }
  };



  // If no data loaded yet, show loading
  if (!contributions) {
    return (
      <div className="p-6 h-[calc(100vh-150px)] flex justify-center items-center">
        <div className="flex justify-center items-center gap-2 py-4 text-gray-600 text-sm">
          <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></span>
          Loading data...
        </div>
      </div>
    );
  }

  // Get filtered data
  const filteredData = getFilteredContributions();

  // Get employee data from filtered API response
  const employeeData = filteredData.employees.map((employee) => ({
    name: employee.name,
    sssAccount: employee.employeeSSS,
    philhealthAccount: employee.employeePhilhealth,
    pagibigAccount: employee.employeePagibig,
    status: employee.status,
    sss: employee.contributions.sss.total,
    philhealth: employee.contributions.philhealth.total,
    pagibig: employee.contributions.pagibig.total,
    employeeShare: employee.grandTotal / 2,
    employerSSSshare: employee.employerSSSshare,
    employerPagibigShare: employee.employerPagibigShare,
  }));

  // Use filtered summary data for totals
  const totalContributions = {
    sss: filteredData.summary.totalSSS || 0,
    philhealth: filteredData.summary.totalPhilhealth || 0,
    pagibig: filteredData.summary.totalPagibig || 0,
    employeeTotal: (filteredData.summary.grandTotal || 0) / 2,
    employerTotal: (filteredData.summary.grandTotal || 0) / 2,
  };

  // Pie chart data
  const pieData = [
    { name: "SSS", value: totalContributions.sss },
    { name: "PhilHealth", value: totalContributions.philhealth },
    { name: "Pag-IBIG", value: totalContributions.pagibig },
  ];

  // Bar chart data
  const barChartData = [
    {
      name: "SSS",
      Employee: Math.round(totalContributions.sss * 0.5),
      Employer: Math.round(totalContributions.sss * 0.5),
    },
    {
      name: "PhilHealth",
      Employee: Math.round(totalContributions.philhealth * 0.5),
      Employer: Math.round(totalContributions.philhealth * 0.5),
    },
    {
      name: "Pag-IBIG",
      Employee: Math.round(totalContributions.pagibig * 0.5),
      Employer: Math.round(totalContributions.pagibig * 0.5),
    },
  ];

  const dataWithTotal = [...employeeData];
  const conditionalRowStyles = [
    {
      when: (row) => row.status === "RESIGNED",
      style: {
        display: "none",
      },
    },
  ];

  // DataTable columns (unchanged)
  const columns = [
    {
      name: "Employee Name",
      selector: (row) => row.name || "",
      sortable: true,
      width: "220px",
    },
    {
      name: "SSS",
      selector: (row) => `${(row.sssAccount || 0).toLocaleString()}`,
      sortable: true,
      width: "150px",
    },
    {
      name: "PhilHealth",
      selector: (row) => `${(row.philhealthAccount || 0).toLocaleString()}`,
      sortable: true,
      width: "150px",
    },
    {
      name: "Pag-IBIG",
      selector: (row) => `${(row.pagibigAccount || 0).toLocaleString()}`,
      sortable: true,
      width: "150px",
    },
    {
      name: (
        <div style={{ textAlign: "center" }}>
          Employer Share
          <br />
          (SSS)
        </div>
      ),
      selector: (row) => `₱${(row.employerSSSshare || 0).toLocaleString()}`,
      sortable: true,
      width: "150px",
    },
    {
      name: (
        <div style={{ textAlign: "center" }}>
          Employee Share
          <br />
          (SSS)
        </div>
      ),
      selector: (row) => `₱${(row.employeeShare || 0).toLocaleString()}`,
      sortable: true,
      width: "150px",
    },
    {
      name: (
        <div style={{ textAlign: "center" }}>
          Employee Share
          <br />
          (PhilHealth)
        </div>
      ),
      selector: (row) => `₱${(row.philhealth || 0).toLocaleString()}`,
      sortable: true,
      width: "150px",
    },
    {
      name: (
        <div style={{ textAlign: "center" }}>
          Employer Share
          <br />
          (PhilHealth)
        </div>
      ),
      selector: (row) => `₱${(row.philhealth || 0).toLocaleString()}`,
      sortable: true,
      width: "150px",
    },
    {
      name: (
        <div style={{ textAlign: "center" }}>
          Employer Share
          <br />
          (Pag-IBIG)
        </div>
      ),
      selector: (row) => `₱${(row.pagibig || 0).toLocaleString()}`,
      sortable: true,
      width: "150px",
    },
    {
      name: (
        <div style={{ textAlign: "center" }}>
          Employee Share
          <br />
          (Pag-IBIG)
        </div>
      ),
      selector: (row) => `₱${(row.employerPagibigShare || 0).toLocaleString()}`,
      sortable: true,
      width: "150px",
    },
  ];

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="p-2 h-[calc(100vh-150px)]">
      <div className="-mt-5 flex justify-end mb-3 gap-1">
        <div className="h-8 w-full text-neutralDGray text-xs px-2 border border-neutralDGray bg-white rounded">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center">
              <span>Total Contributions:</span>
              <span className="ml-2">
                SSS: ₱{totalContributions.sss.toLocaleString()}
              </span>
              <span className="ml-5">
                PhilHealth: ₱{totalContributions.philhealth.toLocaleString()}
              </span>
              <span className="ml-5">
                Pag-IBIG: ₱{totalContributions.pagibig.toLocaleString()}
              </span>
            </div>
            {(selectedMonth || selectedYear) && (
              <span className="text-blue-600 font-medium">
                Filtered:{" "}
                {selectedMonth && getMonthName(parseInt(selectedMonth))}{" "}
                {selectedYear}
              </span>
            )}
          </div>
        </div>
        {/* Filter Month and Year */}
        <div className="flex flex-row gap-1 w-1/4">
          <select
            className="w-full h-8 p-2 border text-neutralDGray text-xs border-gray-300 rounded-md"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            <option value="">All Months</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {getMonthName(month)}
              </option>
            ))}
          </select>
          <select
            className="w-full h-8 p-2 border text-neutralDGray text-xs border-gray-300 rounded-md"
            value={selectedYear}
            onChange={handleYearChange}
          >
            <option value="">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {(selectedMonth || selectedYear) && (
            <button
              onClick={clearFilters}
              className="h-8 px-3 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-6 grid-rows-6 gap-2 min-h-[600px] w-full -mt-3">
        {/* PIE CHART - div1 */}
        <div className="col-span-3 row-span-3 bg-white rounded-lg border p-2">
          <h3 className="text-sm text-neutralDGray mb-4">
            Contribution Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                cursor="pointer"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: "12px" }}
                formatter={(value) => `₱${value.toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: "12px", marginTop: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART - div2 */}
        <div className="col-span-3 row-span-3 col-start-1 row-start-4 bg-white rounded-lg border p-2">
          <h3 className="text-sm text-neutralDGray mb-4">
            Employee and Employer Contribution Distribution
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={barChartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: "12px" }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ fontSize: "12px" }}
                formatter={(value) => `₱${value.toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: "12px", marginTop: "10px" }} />
              <Bar dataKey="Employee" fill={BAR_COLORS[0]} />
              <Bar dataKey="Employer" fill={BAR_COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* DATA TABLE - div3 */}
        <div className="col-span-3 row-span-6 col-start-4 row-start-1 bg-white rounded-lg border p-2 bottom-3">
          <h3 className="text-sm text-neutralDGray mb-4">
            Employee Contributions Details
          </h3>
          <DataTable
            columns={columns}
            data={dataWithTotal}
            progressPending={loading}
            conditionalRowStyles={conditionalRowStyles}
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
            pagination
            highlightOnHover
            fixedHeader
            fixedHeaderScrollHeight="530px"
            paginationPerPage={20}
            dense
            striped
            noDataComponent={
              <div className="text-gray-500 text-sm italic py-4 text-center">
                *** No data found ***
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Contributions;