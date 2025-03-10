import axios from "axios";
import { useEffect, useState } from "react";
import { FaRegPenToSquare, FaXmark } from "react-icons/fa6";

export const PayrollButtons = ({ Id, refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payrollData, setPayrollData] = useState({
    name: "",
    daily_rate: "",
    overtime_pay: "",
    holiday_pay: "",
    night_differential: "",
    allowance: "",
  });

  useEffect(() => {
    if (Id) {
      fetchPayrollInformationsById();
    }
  }, [Id]);

  const fetchPayrollInformationsById = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/employee/payroll-informations/${Id}`
      );

      if (response.data.success && response.data.payrollInformation) {
        setPayrollData(response.data.payrollInformation);
      } else {
        console.warn("No payroll data found for this employee.");
      }
    } catch (error) {
      console.error("Error fetching payroll information:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/employee/payroll-informations/${Id}`,
        payrollData
      );

      if (response.data.success) {
        console.log("Payroll updated successfully:", response.data);

        // Close the modal
        setIsModalOpen(false);

        // Refresh parent data
        if (refreshData) {
          refreshData();
        }
      } else {
        console.warn("Failed to update payroll:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating payroll data:", error);
    }
  };

  return (
    <div className="flex gap-2 justify-center items-center flex-nowrap">
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-3 py-0.5 w-auto h-8 border text-neutralDGray hover:bg-neutralSilver rounded flex items-center space-x-2 disabled:opacity-50"
      >
        <FaRegPenToSquare />
      </button>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div className="relative bg-white p-6 mt-11 -mr-[60rem] rounded-xl shadow-2xl w-4/5 max-w-[22rem] max-h-[80vh] overflow-y-auto transform transition-all scale-100">
            {/* Close Button */}
            <button
              className="absolute left-5 top-1 right-4 text-gray-600 hover:text-red-500 transition"
              onClick={() => setIsModalOpen(false)}
            >
              <FaXmark size={20} />
            </button>

            <h2 className="text-xl font-poppins font-semibold mb-4 -mt-2 text-center text-neutralDGray">
              Edit Payroll Data
            </h2>
            <hr className="mb-3 -mt-3" />

            <div className="space-y-4">
              <label className="block text-gray-700 font-medium">
               EMPLOYEE: {payrollData.ecode} - {payrollData.name}
              </label>

              {[
                { label: "Daily Rate", key: "daily_rate" },
                { label: "Overtime Pay", key: "overtime_pay" },
                { label: "Holiday Pay", key: "holiday_pay" },
                { label: "Night Differential", key: "night_differential" },
                { label: "Allowance", key: "allowance" },
                { label: "Tax", key: "tax_deduction" },
                { label: "SSS", key: "sss_contribution" },
                { label: "Pagibig", key: "pagibig_contribution" },
                { label: "PhilHealth", key: "philhealth_contribution" },
                { label: "Loan", key: "loan" },
              ].map(({ label, key }) => (
                <div key={key} className="flex flex-col">
                  <label className="text-sm text-left mb-1 font-medium text-gray-700">
                    {label}:
                  </label>
                  <input
                    type="text"
                    value={payrollData[key] || 0}
                    onChange={(e) =>
                      setPayrollData({ ...payrollData, [key]: e.target.value })
                    }
                    className="w-72 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 border text-neutralDGray rounded-lg hover:bg-red-400 transition-all"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 border text-neutralDGray rounded-lg hover:bg-green-400 transition-all"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
