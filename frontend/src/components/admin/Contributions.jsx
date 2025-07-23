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

  useEffect(() => {
    fetchContributions();
  }, []);

  // Fetch data from backend
  const fetchContributions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/payslip/contribution`
      );
      setContributions(response.data);
      console.log("data of contributions", response.data);
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

  // Get employee data from API response
  const employeeData = contributions.data.employees.map((employee) => ({
    name: employee.name,
    sssAccount: employee.employeeSSS,
    philhealthAccount: employee.employeePhilhealth,
    pagibigAccount: employee.employeePagibig,
    status: employee.status, // Default status since not provided in API
    sss: employee.contributions.sss.total,
    philhealth: employee.contributions.philhealth.total,
    pagibig: employee.contributions.pagibig.total,
    employeeShare: employee.grandTotal / 2, // Assuming 50/50 split
    employerSSSshare: employee.employerSSSshare, // Assuming 50/50 split
    employerPagibigShare: employee.employerPagibigShare, // Assuming 50/50 split
  }));

  // Use summary data from API for totals
  const totalContributions = {
    sss: contributions.data.summary.totalSSS,
    philhealth: contributions.data.summary.totalPhilhealth,
    pagibig: contributions.data.summary.totalPagibig,
    employeeTotal: contributions.data.summary.grandTotal / 2,
    employerTotal: contributions.data.summary.grandTotal / 2,
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

  const totalRow = {
    name: "TOTAL",
    sss: totalContributions.sss,
    philhealth: totalContributions.philhealth,
    pagibig: totalContributions.pagibig,
    employerShare: "", // Optional blank for unrelated columns
    employeeShare: "",
    isTotalRow: true, // Custom flag to identify it in the row rendering
  };

  const dataWithTotal = [...employeeData];
  const conditionalRowStyles = [
    {
      when: (row) => row.status === "RESIGNED",
      style: {
        display: "none",
      },
    },
  ];

  // DataTable columns
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
      selector: (row) => `₱${(row.employerShare || 0).toLocaleString()}`,
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
          Employeer Share
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
        <div className="col-span-3 row-span-6 col-start-4 row-start-1 bg-white rounded-lg border p-2">
          <h3 className="text-sm text-neutralDGray mb-4">
            Employee Contributions Details
          </h3>
          <DataTable
            columns={columns}
            data={dataWithTotal}
            progressPending={loading}
            conditionalRowStyles={conditionalRowStyles}
            progressComponent={
              <div className="flex justify-center items-center gap-2 py-4 text-gray-600 text-sm">
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></span>
                Loading data...
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
              <div className="text-center py-8 text-gray-500">
                No contribution data available.
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Contributions;
