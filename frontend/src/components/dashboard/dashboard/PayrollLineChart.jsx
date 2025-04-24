import axios from "axios";
import { useState, useEffect } from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from "recharts";


export default function PayrollLineChart() {
  const [payslips, setPayslips] = useState([]);
  const [totals, setTotals] = useState({
    payroll: 0,
    grossSalary: 0,
    benefits: 0,
  });

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/payslip");
        const payslipData = response.data;

        // Calculate total payroll, gross salary, and benefits
        const totalPayroll = payslipData.reduce(
          (sum, pay) => sum + parseFloat(pay.netPay || 0),
          0
        );
        const totalGrossSalary = payslipData.reduce(
          (sum, pay) => sum + parseFloat(pay.gross_pay || 0),
          0
        );
        const totalBenefits = payslipData.reduce(
          (sum, pay) => sum + parseFloat(pay.allowance || 0),
          0
        );

        setTotals({
          payroll: totalPayroll,
          grossSalary: totalGrossSalary,
          benefits: totalBenefits,
        });

        // Format data for chart
        const formattedData = payslipData.map((pay) => ({
          date: new Date(pay.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          payroll: parseFloat(pay.netPay) || 0,
          grossSalary: parseFloat(pay.gross_pay) || 0,
          benefits: parseFloat(pay.allowance) || 0,
        }));

        setPayslips(formattedData);
      } catch (error) {
        console.error("Error fetching payslips:", error);
      }
    };

    fetchPayslips();
  }, []);

  return (
    <div className="p-2 bg-white shadow-sm rounded border border-neutral-300">
      {/* Payroll Chart */}
      <h2 className="text-lg -mt-1 font-semibold text-neutralDGray mb-3">
        Payroll Overview
      </h2>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={payslips}>
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
