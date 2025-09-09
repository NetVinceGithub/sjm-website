import axios from "axios";
import { useEffect, useState } from "react";
import { FaRegPenToSquare, FaXmark } from "react-icons/fa6";
import { useAuth } from ".././context/authContext";
import ModalPortal from "../utils/ModalPortal";
import { toast } from "react-toastify";

export const PayrollButtons = ({ Id, refreshData }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [changeReason, setChangeReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false); // Added separate loading state for data fetching

  const [payrollData, setPayrollData] = useState({
    name: "",
    ecode: "", // Added ecode field
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

  // Fetch data when modal opens instead of on component mount
  const handleOpenModal = async () => {
    setIsModalOpen(true);
    if (Id) {
      await fetchPayrollInformationsById();
    }
  };

  console.log("PayrollButtons received ID:", Id);

  // 2. Check the API endpoint URL
  console.log(
    "API URL being called:",
    `${import.meta.env.VITE_API_URL}/api/employee/payroll-informations/${Id}`
  );

  const fetchPayrollInformationsById = async () => {
    setDataLoading(true);
    try {
      console.log("Fetching payroll data for ID:", Id);

      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/employee/payroll-informations/${Id}`
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        // Handle case where payrollInformation exists
        if (response.data.payrollInformation) {
          const data = response.data.payrollInformation;

          const processedData = {
            name: data.name || "",
            ecode: data.ecode || "",
            daily_rate: data.daily_rate || "",
            overtime_pay: data.overtime_pay || "",
            holiday_pay: data.holiday_pay || "",
            night_differential: data.night_differential || "",
            allowance: data.allowance || "",
            tax_deduction: data.tax_deduction || "",
            sss_contribution: data.sss_contribution || "",
            pagibig_contribution: data.pagibig_contribution || "",
            philhealth_contribution: data.philhealth_contribution || "",
            loan: data.loan || "",
            designation: data.designation || "Regular",
          };

          console.log("Using payroll data:", processedData);
          setPayrollData(processedData);
          setOriginalPayrollData(processedData);
        }
        // Handle case where payrollInformation is null but employee exists
        else if (response.data.employee) {
          const employeeData = response.data.employee;

          const processedData = {
            name: employeeData.name || "",
            ecode: employeeData.ecode || "",
            daily_rate: "", // Empty since no payroll data exists yet
            overtime_pay: "",
            holiday_pay: "",
            night_differential: "",
            allowance: "",
            tax_deduction: "",
            sss_contribution: "",
            pagibig_contribution: "",
            philhealth_contribution: "",
            loan: "",
            designation: employeeData.designation || "Regular",
          };

          console.log(
            "Using employee data (no payroll data found):",
            processedData
          );
          setPayrollData(processedData);
          setOriginalPayrollData(processedData);
        } else {
          console.warn("No payroll data or employee data found.");
          // Set default values
          setPayrollData({
            name: "Unknown Employee",
            ecode: "N/A",
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
        }
      } else {
        console.error("API returned success: false");
        toast("Failed to load employee data.", {
          position: "top-right",
          autoClose: 2000,
          closeButton: false,
          closeOnClick: true,
          hideProgressBar: true,
          icon: <span style={{ fontSize: "13px" }}>⚠️</span>,
          style: {
            fontSize: "13px",
            padding: "6px 12px",
            width: "auto",
            minHeight: "10px",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching payroll information:", error);
      toast("Failed to load payroll data. Please try again.", {
        position: "top-right",
        autoClose: 2000,
        closeButton: false,
        closeOnClick: true,
        hideProgressBar: true,
        icon: <span style={{ fontSize: "13px" }}>⚠️</span>,
        style: {
          fontSize: "13px",
          padding: "6px 12px",
          width: "auto",
          minHeight: "10px",
        },
      });
    } finally {
      setDataLoading(false);
    }
  };

  const formatFieldName = (field) =>
    field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const getEditedFields = () => {
    if (!originalPayrollData) return [];

    return Object.entries(payrollData)
      .filter(
        ([key, newValue]) =>
          String(newValue) !== String(originalPayrollData[key])
      )
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
    setLoading(true);
    if (!changeReason.trim()) {
      alert("Please provide a reason for the change.");
      setLoading(false);
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
          requested_by: user?.name || "Unknown User",
        }
      );

      if (response.data.success) {
        setIsReasonModalOpen(false);
        toast("Payroll change request submitted for approval.", {
          position: "top-right",
          autoClose: 2000,
          closeButton: false,
          closeOnClick: true,
          hideProgressBar: true,
          icon: <span style={{ fontSize: "13px" }}>✅</span>,
          style: {
            fontSize: "13px",
            padding: "6px 12px",
            width: "auto",
            minHeight: "10px",
          },
        });
        refreshData();
      } else {
        alert(`Request submission failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error submitting change request:", error);
      alert("Error submitting request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset data when closing modal
    setPayrollData({
      name: "",
      ecode: "",
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
    setOriginalPayrollData(null);
  };

  return (
    <div className="flex gap-2 justify-center items-center flex-nowrap z-50">
      <button
        onClick={handleOpenModal} // Changed to use handleOpenModal
        className="px-3 py-0.5 w-auto h-8 border text-neutralDGray hover:bg-neutralSilver rounded flex items-center space-x-2 disabled:opacity-50"
      >
        <FaRegPenToSquare />
      </button>

      {/* Edit Modal */}
      {isModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="relative bg-white p-6 mt-11 -mr-[75rem] rounded-xl shadow-2xl w-4/5 max-w-[22rem] max-h-[80vh] overflow-y-auto transform transition-all scale-100">
              <h2 className="text-base font-poppins mb-4 text-left -mt-3 text-neutralDGray">
                Edit Payroll Data
              </h2>
              <hr className="mb-3 -mt-3" />

              <button
                className="absolute flex justify-end top-3 right-4 text-gray-600 hover:text-red-500 transition"
                onClick={handleCloseModal} // Changed to use handleCloseModal
              >
                <FaXmark size={20} />
              </button>

              {/* Loading indicator */}
              {dataLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : (
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
                            setPayrollData({
                              ...payrollData,
                              [key]: e.target.value,
                            })
                          }
                          className="w-72 text-[12px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="Regular">Supervisor/Officer</option>
                          <option value="Team Leader">Rank & File</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={payrollData[key] || ""}
                          onChange={(e) =>
                            setPayrollData({
                              ...payrollData,
                              [key]: e.target.value,
                            })
                          }
                          className="w-72 text-[12px] h-8 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 h-10 border text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
                  onClick={handleCloseModal}
                  disabled={dataLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 h-10 border text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all disabled:opacity-50"
                  onClick={handleSave}
                  disabled={dataLoading}
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
              <div className="flex justify-center text-center justify-between mb-1">
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

              <div className="flex justify-end gap-3 mt-3">
                <button
                  className="px-4 py-2 w-24 h-8 border flex text-center justify-center text-sm items-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
                  onClick={() => setIsReasonModalOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 min-w-24 h-8 flex text-center justify-center items-center text-sm border text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all disabled:opacity-50"
                  onClick={submitChangeRequest}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};
