import axios from "axios";
import { useEffect, useState } from "react";
import { FaRegPenToSquare, FaXmark } from "react-icons/fa6";
import { useAuth } from '.././context/authContext'
import ModalPortal from "../utils/ModalPortal";
import { toast } from 'react-toastify';

export const PayrollButtons = ({ Id, refreshData }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [changeReason, setChangeReason] = useState("");

  const [payrollData, setPayrollData] = useState({
    name: "",
    daily_rate: "",
    overtime_pay: "",
    holiday_pay: "",
    night_differential: "",
    allowance: "",
    tax_deduction: "",
    sss_contribution: "",
    pagibig_contribution: "",
    philhealth_contribution: "",
    loan: "",
    designation: "Regular",
  });

  const [originalPayrollData, setOriginalPayrollData] = useState(null);

  useEffect(() => {
    if (Id) {
      fetchPayrollInformationsById();
    }
  }, [Id]);

  const fetchPayrollInformationsById = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/employee/payroll-informations/${Id}`
      );

      if (response.data.success && response.data.payrollInformation) {
        setPayrollData(response.data.payrollInformation);
        setOriginalPayrollData(response.data.payrollInformation);
      } else {
        console.warn("No payroll data found for this employee.");
      }
    } catch (error) {
      console.error("Error fetching payroll information:", error);
    }
  };

  const formatFieldName = (field) =>
    field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const getEditedFields = () => {
    if (!originalPayrollData) return [];

    return Object.entries(payrollData)
      .filter(([key, newValue]) => String(newValue) !== String(originalPayrollData[key]))
      .map(([key, value]) => ({
        key,
        value,
        displayName: formatFieldName(key),
      }));
  };

  // When "Request" button clicked in the Edit modal:
  const handleSave = () => {
    if (getEditedFields().length === 0) {
      alert("No changes to submit.");
      return;
    }
    setIsModalOpen(false);
    setChangeReason("");
    setIsReasonModalOpen(true); // open reason modal
  };

  // When user submits reason, this sends actual request
  const submitChangeRequest = async () => {
    if (!changeReason.trim()) {
      alert("Please provide a reason for the change.");
      return;
    }

    const changes = {};
    getEditedFields().forEach(({ key, value }) => {
      changes[key] = value;
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/employee/payroll-change-requests`,
        {
          payroll_info_id: Id,
          changes,
          reason: changeReason,
          requested_by: user ?.name || "Unknown User",
        }
      );

      if (response.data.success) {
        setIsReasonModalOpen(false);
        toast.success(
          <div style={{ fontSize: '0.9rem'}}>
            Payroll change request submitted for approval.
          </div>,
          {
            autoClose: 3000,        // auto close after 3 seconds
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            closeButton: false,
            position: "top-right",  // position of the toast
          }
        );
        refreshData();
      } else {
        alert(`Request submission failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error submitting change request:", error);
      alert("Error submitting request. Please try again.");
    }
  };

  return (
    <div className="flex gap-2 justify-center items-center flex-nowrap z-50">
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-3 py-0.5 w-auto h-8 border text-neutralDGray hover:bg-neutralSilver rounded flex items-center space-x-2 disabled:opacity-50"
      >
        <FaRegPenToSquare />
      </button>

      {/* Edit Modal */}
      {isModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50  px-4">
            <div className="relative bg-white p-6 mt-11 -mr-[75rem] rounded-xl shadow-2xl w-4/5 max-w-[22rem] max-h-[80vh] overflow-y-auto transform transition-all scale-100">
              <h2 className="text-base font-poppins mb-4 text-left -mt-3 text-neutralDGray">
                Edit Payroll Data
            </h2>
              <hr className="mb-3 -mt-3" />

              <button
                className="absolute flex justify-end top-3 right-4 text-gray-600 hover:text-red-500 transition"
                onClick={() => setIsModalOpen(false)}
              >
                <FaXmark size={20} />
              </button>

              <div className="space-y-2">
                <label className="block text-sm text-gray-700 font-medium">
                  EMPLOYEE: {payrollData.ecode} → {payrollData.name}
                </label>

                {[
                  { label: "Designation", key: "designation" },
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
                    <label className="text-xs text-left mb-1 font-medium text-gray-700">
                      {label}:
                  </label>
                    {key === "designation" ? (
                      <select
                        value={payrollData[key] || "Regular"}
                        onChange={(e) =>
                          setPayrollData({ ...payrollData, [key]: e.target.value })
                        }
                        className="w-72 text-[12px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Regular">Regular</option>
                        <option value="Team Leader">Team Leader</option>
                      </select>
                    ) : (
                        <input
                          type="text"
                          value={payrollData[key] || ""}
                          onChange={(e) =>
                            setPayrollData({ ...payrollData, [key]: e.target.value })
                          }
                          className="w-72 text-[12px] h-8 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                      )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 h-10 border text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
              </button>
                <button
                  className="px-4 py-2 h-10 border text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
                  onClick={handleSave}
                >
                  Request
              </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Reason Modal */}
      {isReasonModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="relative bg-white p-6 rounded-xl shadow-2xl w-4/5 max-w-md max-h-[60vh] overflow-y-auto transform transition-all scale-100">

              {/* Header */}
              <div className="flex  justify-center text-center justify-between mb-1">
                <h2 className="text-sm top-0 flex-justify-start font-poppins text-neutralDGray">
                  Reason for Change
              </h2>
                <button
                  className="text-gray-600 hover:text-red-500 flex justify-end transition"
                  onClick={() => setIsReasonModalOpen(false)}
                >
                  <FaXmark size={20} />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                className="w-full text-sm -mt-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
                rows={5}
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Please explain the reason for the payroll change request."
                maxLength={200}
              />

              <div className="text-xs text-center text-gray-300 mt-1">
                Maximum of {changeReason.length}/200 Characters
            </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-3">
                <button
                  className="px-4 py-2 w-24 h-8 border flex text-center justify-center text-sm items-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
                  onClick={() => setIsReasonModalOpen(false)}
                >
                  Cancel
              </button>
                <button
                  className="px-4 py-2 w-24 h-8 flex text-center justify-center items-center text-sm border text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
                  onClick={submitChangeRequest}
                >
                  Submit
              </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};
