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
      // Filter payslips for June 16-31 (assuming current year)
      const currentYear = new Date().getFullYear();
      const filteredPayslips = payslips.filter((pay) => {
        const payDate = new Date(pay.date);
        const payYear = payDate.getFullYear();
        const payMonth = payDate.getMonth(); // 0-based, so June = 5
        const payDay = payDate.getDate();

        // Filter for June (month 5) and days 16-31 of current year
        return (
          payYear === currentYear &&
          payMonth === 5 &&
          payDay >= 16 &&
          payDay <= 31
        );
      });

      // Calculate totals from filtered data
      const totalPayroll = filteredPayslips.reduce(
        (sum, pay) => sum + parseFloat(pay.netPay || 0),
        0
      );
      const totalGrossSalary = filteredPayslips.reduce(
        (sum, pay) => sum + parseFloat(pay.gross_pay || 0),
        0
      );
      const totalBenefits = filteredPayslips.reduce(
        (sum, pay) => sum + parseFloat(pay.allowance || 0),
        0
      );

      setTotals({
        payroll: totalPayroll,
        grossSalary: totalGrossSalary,
        benefits: totalBenefits,
      });

      // Group payslips by cutoff periods and format data for chart
      const groupedData = {};

      filteredPayslips.forEach((pay) => {
        const payDate = new Date(pay.date);
        const day = payDate.getDate();
        const monthShort = payDate.toLocaleDateString("en-US", {
          month: "short",
        });

        // Determine cutoff period (customize these ranges as needed)
        let cutoffPeriod;
        if (day >= 1 && day <= 15) {
          cutoffPeriod = `${monthShort} 1-15`;
        } else {
          cutoffPeriod = `${monthShort} 16-31`;
        }

        if (!groupedData[cutoffPeriod]) {
          groupedData[cutoffPeriod] = {
            date: cutoffPeriod,
            payroll: 0,
            grossSalary: 0,
            benefits: 0,
          };
        }

        groupedData[cutoffPeriod].payroll += parseFloat(pay.netPay) || 0;
        groupedData[cutoffPeriod].grossSalary += parseFloat(pay.gross_pay) || 0;
        groupedData[cutoffPeriod].benefits += parseFloat(pay.allowance) || 0;
      });

      const formattedData = Object.values(groupedData);

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
      <ResponsiveContainer width="100%" height={280}>
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
