import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export default function PayrollLineChart({ payslips = [] }) {
  const [chartData, setChartData] = useState([]);
  const [totals, setTotals] = useState({
    payroll: 0,
    grossSalary: 0,
    benefits: 0,
  });

  useEffect(() => {
    // Process the payslips data passed from parent component
    if (payslips && payslips.length > 0) {
      // Calculate totals
      const totalPayroll = payslips.reduce(
        (sum, pay) => sum + parseFloat(pay.netPay || 0),
        0
      );
      const totalGrossSalary = payslips.reduce(
        (sum, pay) => sum + parseFloat(pay.gross_pay || 0),
        0
      );
      const totalBenefits = payslips.reduce(
        (sum, pay) => sum + parseFloat(pay.allowance || 0),
        0
      );

      setTotals({
        payroll: totalPayroll,
        grossSalary: totalGrossSalary,
        benefits: totalBenefits,
      });

      // Format data for chart
      const formattedData = payslips.map((pay) => ({
        date: new Date(pay.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        payroll: parseFloat(pay.netPay) || 0,
        grossSalary: parseFloat(pay.gross_pay) || 0,
        benefits: parseFloat(pay.allowance) || 0,
      }));

      setChartData(formattedData);
    } else {
      // Reset data when no payslips
      setChartData([]);
      setTotals({
        payroll: 0,
        grossSalary: 0,
        benefits: 0,
      });
    }
  }, [payslips]); // Watch for changes in payslips prop

  return (
    <div className="p-2">
      {/* Payroll Chart */}
      <h2 className=" -mt-1 text-sm text-neutralDGray mb-3">
        Payroll Overview
      </h2>
      <ResponsiveContainer width="100%" height={313}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#ccc" }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `₱${value.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{ fontSize: "12px" }}
            formatter={(value) => [`₱${value.toLocaleString()}`, "Amount"]}
          />
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: "12px", marginTop: "10px" }}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

          <Bar
            dataKey="payroll"
            fill="#4191D6 "
            name="Total Payroll"
            barSize={30}
            radius={[5, 5, 0, 0]}
          />
          <Bar
            dataKey="grossSalary"
            fill="#80B646"
            name="Gross Salary"
            barSize={30}
            radius={[5, 5, 0, 0]}
          />
          <Bar
            dataKey="benefits"
            fill="#9D426E"
            name="Total Benefits"
            barSize={30}
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
