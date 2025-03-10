import React, { useEffect, useState } from "react";
import "../payroll/payslip.css";
import LongLogo from "/public/long-logo.png";
import axios from "axios";

const PayslipModal = ({ isOpen, onClose, employeeId }) => {
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !employeeId) return;

    const fetchPayslip = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `http://localhost:5000/api/payslip/${employeeId}`
        );
        setPayslip(response.data);
      } catch (err) {
        console.error("Error fetching payslip:", err);
        setError("Failed to load payslip.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayslip();
  }, [isOpen, employeeId]);

  if (!isOpen) return null;

  return (
    <div className="payslip-modal">
      <div className="payslip-overlay" onClick={onClose}></div>
      <div className="payslip-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        {loading ? (
          <p>Loading payslip...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : !payslip ? (
          <p>No payslip data found.</p>
        ) : (
          <div className="payslip bg-white">
            <div className="payslip-header">
              <h1 className="header-title">e-PAYROLL SLIP</h1>
              <img src={LongLogo} alt="Company Logo" className="header-img" />
            </div>

            <h2 className="header-two">Payslip No.:</h2>
            <table>
              <thead>
                <tr className="bor">
                  <th className="cell bor align">ECODE</th>
                  <th className="cell-w bor align">EMPLOYEE NAME</th>
                  <th className="cell-w bor align">PROJECT SITE</th>
                  <th className="cell-w bor align">RATE</th>
                </tr>
              </thead>
              <tbody>
                <tr className="cell1">
                  <td className="bor">{payslip.ecode || "N/A"}</td>
                  <td className="bor name">{payslip.name || "N/A"}</td>
                  <td className="bor">{payslip.project || "N/A"}</td>
                  <td className="bor">{payslip.dailyrate || "0.00"}</td>
                </tr>
                <tr>
                  <th className="cell bor align" colSpan={2}>
                    POSITION
                  </th>
                  <th className="cell bor align" colSpan={2}>
                    CUT-OFF DATE
                  </th>
                </tr>
                <tr>
                  <td className="cell1 bor" colSpan={2}>
                    {payslip.position || "N/A"}
                  </td>
                  <td className="cell1 bor" colSpan={2}>
                    {payslip.cutoffDate || "N/A"}
                  </td>
                </tr>
                <tr>
                  <th className="cell-w bor align">EARNINGS</th>
                  <th className="cell-w bor align">FIGURES</th>
                  <th className="cell-w bor align">DEDUCTIONS</th>
                  <th className="cell-w bor align">FIGURES</th>
                </tr>
                <tr>
                  <td className="cell3 bor left">Basic Pay</td>
                  <td className="cell3 bor">{payslip.dailyrate || "0.00"}</td>
                  <td className="cell3 bor GovCon">GOVERNMENT CONTRIBUTIONS</td>
                  <td className="cell3 bor"></td>
                </tr>
                <tr>
                  <td className="cell4 bor left">No. of Days</td>
                  <td className="cell4 bor">{payslip.noOfDays || "0"}</td>
                  <td className="cell4 bor left">SSS</td>
                  <td className="cell4 bor">{payslip.sss || "0.00"}</td>
                </tr>
                <tr>
                  <td className="cell4 bor left">Overtime Pay</td>
                  <td className="cell4 bor">{payslip.overtimePay || "0.00"}</td>
                  <td className="cell4 bor left">PHIC</td>
                  <td className="cell4 bor">{payslip.phic || "0.00"}</td>
                </tr>
                <tr>
                  <td className="cell4 bor left">Overtime Hours</td>
                  <td className="cell4 bor"></td>
                  <td className="cell4 bor down left">HDMF</td>
                  <td className="cell4 bor down"></td>
                </tr>
                <tr>
                  <td className="cell4 bor left">Holiday Pay</td>
                  <td className="cell4 bor"></td>
                  <td className="cell4  bor left">Cash Advance/Loan</td>
                  <td className="cell4 bor"></td>
                </tr>
                <tr>
                  <td className="cell4 bor left">Night Differenctial</td>
                  <td className="cell4 bor"></td>
                  <td className="cell4 bor left">Tardiness</td>
                  <td className="cell4 bor"></td>
                </tr>
                <tr>
                  <td className="cell4 bor left">Allowance</td>
                  <td className="cell4 bor"></td>
                  <td className="cell4 bor left">Other Deductions</td>
                  <td className="cell4 bor"></td>
                </tr>
                <tr>
                  <td className="cell4 bor left"></td>
                  <td className="cell4 bor"></td>
                  <td className="cell4 bor left">Total Deductions</td>
                  <td className="cell4 bor">
                    {payslip.totalDeductions || "0.00"}
                  </td>
                </tr>
                <tr>
                  <td className="cell4 bor left"></td>
                  <td className="cell4 bor"></td>
                  <td className="cell4 bor left">Adjustments</td>
                  <td className="cell4 bor"></td>
                </tr>
                <tr>
                  <th className="cell bor align" colSpan={2}>
                    NET PAY
                  </th>
                  <th className="cell bor align" colSpan={2}>
                    AMOUNT
                  </th>
                </tr>
                <tr className="cell5">
                  <td className="cell5 net" colSpan={2}>
                    NETPAY: ₱{payslip.netPay || "0.00"}
                  </td>
                  <td className="cell5" colSpan={2}></td>
                </tr>
              </tbody>
            </table>
            <div className="footer">
              <div className="block">
                <h6 className="font-bold text-[14px] text-center">
                  Mia Mary Sora
                </h6>
                <p className="-mt-3 text-[12px] text-center">
                  Human Resource Head
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[12px] -mt-1">
                {/* Left Column: Company Info */}
                <div>
                  <p>
                    <strong>Company:</strong> St. John Majore Services Company
                    Inc.
                  </p>
                  <p>
                    <strong>Email:</strong> sjmajore@gmail.com
                  </p>
                  <p>
                    <strong>Web:</strong> N/A
                  </p>
                </div>

                {/* Right Column: Address */}
                <div>
                  <p>
                    <strong>Address:</strong>
                  </p>
                  <p>
                    8 Patron Central Plaza De Villa St., Poblacion <br />
                    San Juan, Batangas
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayslipModal;
