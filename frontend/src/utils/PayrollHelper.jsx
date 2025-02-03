import axios from "axios";
import { useNavigate } from "react-router-dom";


export const PayrollButtons = ({ Id }) => {
  const navigate = useNavigate();

  if (!Id) {
    console.error("Invalid Employee ID");
    return null;
  }

  return (
    <div className="flex gap-2 justify-center items-center flex-nowrap">
      <button
        className="px-4 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
        onClick={() => navigate(`/admin-dashboard/employees/payroll-data/${Id}`)}
      >
        Create Payroll
      </button>

      <button
        className="px-4 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
        onClick={() => navigate(`/admin-dashboard/employees/payslip/${Id}`)}
      >
        Payslip
      </button>

      
    </div>
  );
};
