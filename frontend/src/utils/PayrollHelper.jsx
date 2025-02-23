import axios from "axios";
import { useEffect, useState } from "react";

export const PayrollButtons = ({ Id }) => {
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

      console.log("API Response:", response.data);

      if (response.data.success && response.data.payrollInformation) {
        setPayrollData(response.data.payrollInformation);
      } else {
        console.warn("No payroll data found for this employee.");
      }
    } catch (error) {
      console.error("Error fetching payroll information:", error);
    }
  };

  if (!Id) {
    console.error("Invalid Employee ID");
    return null;
  }

  return (
    <div className="flex gap-2 justify-center items-center flex-nowrap">
      <button
        className="px-4 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
        onClick={() => setIsModalOpen(true)}
      >
        Edit
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 z-50 relative">
            <h2 className="text-lg font-semibold mb-4">Edit Payroll Data</h2>

            {payrollData && (
              <>
                <label className="block mb-2">{payrollData.name}</label>
                <label className="block mb-2">Daily Rate:</label>
                <input
                  type="text"
                  value={payrollData.daily_rate || ""}
                  onChange={(e) =>
                    setPayrollData({ ...payrollData, daily_rate: e.target.value })
                  }
                  className="w-full p-2 border rounded mb-4"
                />

                <label className="block mb-2">Overtime Pay:</label>
                <input
                  type="text"
                  value={payrollData.overtime_pay || ""}
                  onChange={(e) =>
                    setPayrollData({ ...payrollData, overtime_pay: e.target.value })
                  }
                  className="w-full p-2 border rounded mb-4"
                />

                <label className="block mb-2">Holiday Pay:</label>
                <input
                  type="text"
                  value={payrollData.holiday_pay || ""}
                  onChange={(e) =>
                    setPayrollData({ ...payrollData, holiday_pay: e.target.value })
                  }
                  className="w-full p-2 border rounded mb-4"
                />

                <label className="block mb-2">Night Differential:</label>
                <input
                  type="text"
                  value={payrollData.night_differential || ""}
                  onChange={(e) =>
                    setPayrollData({ ...payrollData, night_differential: e.target.value })
                  }
                  className="w-full p-2 border rounded mb-4"
                />

                <label className="block mb-2">Allowance:</label>
                <input
                  type="text"
                  value={payrollData.allowance || ""}
                  onChange={(e) =>
                    setPayrollData({ ...payrollData, allowance: e.target.value })
                  }
                  className="w-full p-2 border rounded mb-4"
                />
              </>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                onClick={() => {
                  console.log("Saving changes for employee:", Id);
                  setIsModalOpen(false);
                }}
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
