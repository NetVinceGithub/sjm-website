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
import axios from 'axios';
const COLORS = ["#4191D6", "#9D426E", "#80B646"];
const BAR_COLORS = ["#80B646", "#9D426E"];

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, innerRadius, outerRadius,
    startAngle, endAngle, fill, payload,
    percent, value,
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
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontWeight="bold">
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
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontWeight="bold">
        ₱{value.toLocaleString()}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {(percent * 100).toFixed(2)}%
      </text>
    </g>
  );
};

const Contributions = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [employeeShare, setEmployeeShare] = useState([]);

  useEffect(() => {
    fetchEmployeeData();
    fetchEmployeeContribution();
  }, [])

  // Fetch data from backend

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee`);
      setEmployeeData(response.data.employees);
    } catch (error) {
      console.error("Error fetching contributions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeContribution = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payslip/history`);
      setEmployeeShare(response.data.payslips);
      console.log("data of employee shares history", employeeShare);
    } catch (error) {
      console.error("Error fetching employee history:", error);
    } finally {
      setLoading(false);
    }
  };



  // Calculate totals from employee data
  const totalContributions = employeeData.reduce(
    (acc, employee) => {
      acc.sss += employee.sss || 0;
      acc.philhealth += employee.philhealth || 0;
      acc.pagibig += employee.pagibig || 0;
      acc.employeeTotal += employee.employeeShare || 0;
      acc.employerTotal += employee.employerShare || 0;
      return acc;
    },
    { sss: 0, philhealth: 0, pagibig: 0, employeeTotal: 0, employerTotal: 0 }
  );

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
    isTotalRow: true,  // Custom flag to identify it in the row rendering
  };

  const dataWithTotal = [...employeeData];
  const conditionalRowStyles = [
    {
      when: row => row.employmentstatus === 'RESIGNED',
      style: {
        display: 'none', // This will completely hide the row
      },
    },
  ];

  // DataTable columns
  const columns = [
    {
      name: "Employee Name",
      selector: (row) => row.name || "",
      sortable: true,
    },
    {
      name: "SSS",
      selector: (row) => `${(row.sss || 0).toLocaleString()}`,
      sortable: true,
    },
    {
      name: "PhilHealth",
      selector: (row) => `${(row.philhealth || 0).toLocaleString()}`,
      sortable: true,
    },
    {
      name: "Pag-IBIG",
      selector: (row) => `${(row.pagibig || 0).toLocaleString()}`,
      sortable: true,
    },
    {
      name: "Employee Share",
      selector: (row) => `₱${(row.employeeShare || 0).toLocaleString()}`,
      sortable: true,
    },
    {
      name: "Employer Share",
      selector: (row) => `₱${(row.employerShare || 0).toLocaleString()}`,
      sortable: true,
    },
    {
      name: "SSS Share",
      selector: (row) => `₱${(row.sss || 0).toLocaleString()}`,
      sortable: true,
    },
    {
      name: "Phil Health Share",
      selector: (row) => `₱${(row.philhealth || 0).toLocaleString()}`,
      sortable: true,
    },
    {
      name: "PAGIBIG Share",
      selector: (row) => `₱${(row.pagibig || 0).toLocaleString()}`,
      sortable: true,
    },
  ];

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="p-6 h-[calc(100vh-150px)]">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 -mt-3">
        {/* PIE CHART */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border p-2">
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: "12px" }} formatter={(value) => `₱${value.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: "12px", marginTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* BAR CHART */}
          <div className="bg-white rounded-lg border p-2">
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
                <Tooltip contentStyle={{ fontSize: "12px" }} formatter={(value) => `₱${value.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: "12px", marginTop: "10px" }} />
                <Bar dataKey="Employee" fill={BAR_COLORS[0]} />
                <Bar dataKey="Employer" fill={BAR_COLORS[1]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="lg:col-span-2 bg-white rounded-lg border p-2">
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
