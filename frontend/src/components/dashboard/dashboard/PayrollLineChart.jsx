import axios from "axios";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
        const totalPayroll = payslipData.reduce((sum, pay) => sum + parseFloat(pay.netPay || 0), 0);
        const totalGrossSalary = payslipData.reduce((sum, pay) => sum + parseFloat(pay.gross_pay || 0), 0);
        const totalBenefits = payslipData.reduce((sum, pay) => sum + parseFloat(pay.allowance || 0), 0);

        setTotals({
          payroll: totalPayroll,
          grossSalary: totalGrossSalary,
          benefits: totalBenefits,
        });

        // Format data for chart
        const formattedData = payslipData.map((pay) => ({
          date: new Date(pay.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
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
    <div className="p-4 bg-white shadow-sm rounded border border-neutral-300">
 

      {/* Payroll Chart */}
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Payroll Overview</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={payslips}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ fontSize: "12px" }} formatter={(value) => [`₱${value}`, "Amount"]} />
          <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: "12px", marginTop: "10px" }} />
          <Line type="monotone" dataKey="payroll" stroke="#80B646" name="Total Payroll" />
          <Line type="monotone" dataKey="grossSalary" stroke="#9D426E" name="Gross Salary" />
          <Line type="monotone" dataKey="benefits" stroke="#4191D6" name="Total Benefits" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
