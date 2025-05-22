import React, { useEffect, useState, useRef } from "react";
import "../payroll/payslip.css";
import LongLogo from "/public/long-logo.png";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import html2pdf from "html2pdf.js";

const PayslipModal = ({ isOpen, onClose, employeeId }) => {
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const payslipRef = useRef();

  useEffect(() => {
    if (!isOpen || !employeeId) return;

    const fetchPayslip = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/payslip/${employeeId}`
        );
        console.log(response.data);
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

  const downloadPDF = () => {
    if (!payslip) return alert("Payslip data is not available!");

    const element = payslipRef.current;
    const options = {
      margin: 10,
      filename: `payslip_${payslip?.ecode || "employee"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(element).set(options).save();
  };

  if (!isOpen) return null;

  const formatNumber = (value, fallback = "0.00") => {
    const num = Number(value);
    return isNaN(num)
      ? fallback
      : num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  return (
    <>
      <Modal show={isOpen} onHide={onClose} centered size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Employee Payslip</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <p>Loading payslip...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : !payslip ? (
            <p>No payslip data found.</p>
          ) : (
            <div className="payslip bg-white" ref={payslipRef}>
              <div className="payslip-header">
                <h1 className="header-title">e-PAYROLL SLIP</h1>
                <div className="logo">
                  <img
                    src={LongLogo}
                    alt="Company Logo"
                    className="header-img"
                  />
                </div>
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
                    <td className="bor">{formatNumber(payslip.dailyrate)}</td>
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
                    <td className="cell3 bor">
                      {formatNumber(payslip.dailyrate)}
                    </td>
                    <td className="cell3 bor GovCon">
                      GOVERNMENT CONTRIBUTIONS
                    </td>
                    <td className="cell3 bor"></td>
                  </tr>
                  <tr>
                    <td className="cell4 bor left">No. of Days</td>
                    <td className="cell4 bor">{payslip.noOfDays || "0"}</td>
                    <td className="cell4 bor left">SSS</td>
                    <td className="cell4 bor">{formatNumber(payslip.sss)}</td>
                  </tr>
                  <tr>
                    <td className="cell4 bor left">Overtime Pay</td>
                    <td className="cell4 bor">
                      {formatNumber(payslip.overtimePay)}
                    </td>
                    <td className="cell4 bor left">PHIC</td>
                    <td className="cell4 bor">{formatNumber(payslip.phic)}</td>
                  </tr>
                  <tr>
                    <td className="cell4 bor left">Overtime Hours</td>
                    <td className="cell4 bor">
                      {payslip.totalOvertime || "0.00"}
                    </td>
                    <td className="cell4 bor left">HDMF</td>
                    <td className="cell4 bor">{formatNumber(payslip.hdmf)}</td>
                  </tr>
                  <tr>
                    <td className="cell4 bor left">Holiday Pay</td>
                    <td className="cell4 bor">
                      {formatNumber(payslip.holidayPay)}
                    </td>
                    <td className="cell4 bor left">Cash Advance/Loan</td>
                    <td className="cell4 bor">{formatNumber(payslip.loan)}</td>
                  </tr>
                  <tr>
                    <td className="cell4 bor left">Night Differential</td>
                    <td className="cell4 bor">
                      {formatNumber(payslip.nightDifferential)}
                    </td>
                    <td className="cell4 bor left">Tardiness</td>
                    <td className="cell4 bor">
                      {formatNumber(payslip.totalTardiness)}
                    </td>
                  </tr>
                  <tr>
                    <td className="cell4 bor left">Allowance</td>
                    <td className="cell4 bor">
                      {formatNumber(payslip.allowance)}
                    </td>
                    <td className="cell4 bor left">Other Deductions</td>
                    <td className="cell4 bor">
                      {formatNumber(payslip.otherDeductions)}
                    </td>
                  </tr>
                  <tr>
                    <td className="cell4 bor left"></td>
                    <td className="cell4 bor"></td>
                    <td className="cell4 bor left">Total Deductions</td>
                    <td className="cell4 bor">
                      {formatNumber(payslip.totalDeductions)}
                    </td>
                  </tr>
                  <tr>
                    <td className="cell4 bor left"></td>
                    <td className="cell4 bor"></td>
                    <td className="cell4 bor left">Adjustments</td>
                    <td className="cell4 bor">
                      {formatNumber(payslip.adjusment)}
                    </td>
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
                      NETPAY: ₱{formatNumber(payslip.netPay)}
                    </td>
                    <td className="cell5" colSpan={2}>
                      {formatNumber(payslip.totalDeductions)}
                    </td>
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
                  <div className="words">
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
                  <div className="words">
                    <p>
                      <strong>Address:</strong>
                    </p>
                    <p className="word1">
                      8 Patron Central Plaza De Villa St., Poblacion
                      <br />
                      San Juan, Batangas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={downloadPDF}
            className="ms-[40rem] h-10 border bg-transparent border-neutralDGray hover:bg-neutralSilver"
            style={{ color: "#4d4d4d" }}
          >
            Download PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PayslipModal;
