import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Connect mo to don sa mga summary card sa taas
const data = [
  { date: "Feb 14", payroll: 20000, grossSalary: 18000, benefits: 2000 },
  { date: "Feb 15", payroll: 21000, grossSalary: 19000, benefits: 2500 },
  { date: "Feb 16", payroll: 19500, grossSalary: 17500, benefits: 2200 },
  { date: "Feb 18", payroll: 23000, grossSalary: 21000, benefits: 3000 },
  { date: "Feb 19", payroll: 22500, grossSalary: 20500, benefits: 2800 },
  { date: "Feb 20", payroll: 24000, grossSalary: 22000, benefits: 3200 },
];

export default function PayrollLineChart() {
  return (
    <div className="p-3 bg-white shadow-sm rounded border border-neutralDGray ">
      <h2 className="text-lg text-neutralDGray font-semibold">Payroll Overview</h2>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }} 
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ fontSize: "12px" }}  
            formatter={(value) => [`$${value}`, "Amount"]} 
          />
          <Legend 
            layout="horizontal" 
            align="center" 
            verticalAlign="bottom"  // Moves legend to bottom
            wrapperStyle={{ fontSize: "12px", marginTop: "10px" }}  // Adds spacing
          />
          <Line type="monotone" dataKey="payroll" stroke="#80B646" name="Total Payroll" />
          <Line type="monotone" dataKey="grossSalary" stroke="#9D426E" name="Gross Salary" />
          <Line type="monotone" dataKey="benefits" stroke="#4191D6" name="Total Benefits" />
        </LineChart>
      </ResponsiveContainer>

    </div>

  );
}