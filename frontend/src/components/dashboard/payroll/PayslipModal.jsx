import React, { useEffect, useState, useRef } from "react";
import "../payroll/payslip.css";
import LongLogo from "/public/long-logo.png";
import Logo from "../../../assets/logo-rembg.png";
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

  const preloadImages = async () => {
    const images = payslipRef.current?.querySelectorAll("img") || [];
    const promises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (img.complete) return resolve();
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    });
    return Promise.all(promises);
  };

  const downloadPDF = async () => {
    const element = payslipRef.current;

    await preloadImages(); // Ensure all images are loaded before rendering

    const opt = {
      margin: 0,
      filename: `${payslip?.name || "payslip"}_${
        payslip?.cutoffDate || "cutoff"
      }.pdf`,
      image: { type: "jpeg", quality: 1.0 },
      html2canvas: {
        scale: 4,
        useCORS: true,
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a6",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf().set(opt).from(element).save();
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
        <Modal.Header className="py-2 px-3 text-[12px]" closeButton>
          <Modal.Title as="h6" className="text-lg">
            Employee Payslip
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="w-1/2">
            {loading ? (
              <p>Loading payslip...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : !payslip ? (
              <p>No payslip data found.</p>
            ) : (
              <div className="w-[105mm] h-[148mm] bg-white p-4 overflow-hidden text-[10px] font-sans">
                <div id="downloadpayslip">
                  <div className="relative w-full mb-3">
                    <img
                      src="https://stjohnmajore.com/images/header_payslip.png"
                      alt="St. John Majore Header"
                      className="w-full h-full object-contain max-h-32 sm:max-h-40 md:max-h-48"
                      style={{
                        imageRendering: "crisp-edges",
                        imageRendering: "-webkit-optimize-contrast",
                        imageRendering: "optimize-contrast",
                        msInterpolationMode: "nearest-neighbor",
                      }}
                      loading="eager"
                      decoding="sync"
                      crossOrigin="anonymous"
                    />
                  </div>

                  <table className="border-collapse text-xs mx-auto font-sans text-center">
                    <tr>
                      <th className="border  h-7 w-[10rem]  uppercase bg-gray-400 border-black font-bold">
                        E-code
                      </th>
                      <th className="border h-7 w-[20rem] uppercase bg-gray-400 border-black font-bold">
                        Employee Name
                      </th>
                      <th className="border h-7 w-[14rem] uppercase bg-gray-400 border-black font-bold">
                        Position
                      </th>
                    </tr>
                    <tr>
                      <td className="border h-7  border-black">
                        {payslip?.ecode || "N/A"}
                      </td>
                      <td className="border h-7  border-black">
                        {payslip?.name || "N/A"}
                      </td>
                      <td className="border h-7  border-black">
                        {payslip?.position || "N/A"}
                      </td>
                    </tr>
                  </table>
                  <table className="border-collapse text-xs -mt-7 mx-auto text-center font-sans">
                    <tr>
                      <td className="border h-7  w-[10rem]  uppercase bg-gray-400 border-black font-bold">
                        Daily Rate
                      </td>
                      <td className="border h-7 w-[20rem] uppercase bg-gray-400 border-black font-bold">
                        Project Site
                      </td>
                      <td className="border h-7 w-[14rem] uppercase bg-gray-400 border-black font-bold">
                        Cut-off date
                      </td>
                    </tr>
                    <tr>
                      <td className="border h-7 border-black">
                        {formatNumber(payslip?.dailyrate)}
                      </td>
                      <td className="border h-7 border-black"></td>
                      <td className="border h-7 border-black">
                        {payslip?.cutoffDate || "N/A"}
                      </td>
                    </tr>
                  </table>
                  <table className="border-collapse text-xs mx-auto -mt-7 font-sans">
                    <tr>
                      <td className="border  w-[14rem] h-7  uppercase bg-gray-400 border-black px-2  text-center font-bold">
                        Earnings
                      </td>
                      <td className="border w-[7rem] px-2 h-7  uppercase bg-gray-400 border-black  text-center  font-bold">
                        Figures
                      </td>
                      <td className="border  w-[14rem] px-2 h-7  uppercase bg-gray-400 border-black text-center  font-bold">
                        Deductions
                      </td>
                      <td className="border w-[7rem]  px-2 h-7  uppercase bg-gray-400 border-black text-center  font-bold">
                        Figures
                      </td>
                    </tr>
                    <tr>
                      <td className="border h-7 border-b-0 border-black px-2">
                        Basic Pay
                      </td>
                      <td className="border h-7 border-black px-2 border-t-0  border-b-0">
                        {formatNumber(payslip?.dailyrate)}
                      </td>
                      <td className="border h-7 border-black px-2 w-[14rem] border-t-0  border-b-0">
                        <div className="text-[9px] bg-[#AA396F] h-fit w-fit flex justify-center items-center text-white rounded-lg text-center font-bold">
                          <p>GOVERNMENT CONTRIBUTIONS</p>
                        </div>
                      </td>
                      <td className="border border-black h-7 border-t-0  border-b-0 "></td>
                    </tr>
                    <tr>
                      <td className="border border-t-0  border-b border-black h-7 px-2">
                        No. of Days Worked
                      </td>
                      <td className="border border-t-0  border-b-0  border-black h-7 px-2">
                        {payslip?.noOfDays || "0"}
                      </td>
                      <td className="border  border-t-0  border-b-0  border-black h-7 px-2">
                        SSS
                      </td>
                      <td className="border  border-t-0  border-b-0  border-black h-7 px-2">
                        {formatNumber(payslip?.sss)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border  border-t-0  border-b-0  border-black h-7 px-2">
                        Overtime Pay
                      </td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 ">
                        {formatNumber(payslip?.overtimePay)}
                      </td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 ">
                        PHIC
                      </td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 ">
                        {formatNumber(payslip?.phic)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border  border-t-0  border-b-0  border-black h-7 px-2">
                        Overtime Hours
                      </td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 ">
                        {payslip?.totalOvertime || "0.00"}
                      </td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 ">
                        HDMF
                      </td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 ">
                        {formatNumber(payslip?.hdmf)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border  border-t-0  border-b border-black h-7 px-2">
                        Night Differential
                      </td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 ">
                        {formatNumber(payslip?.nightDifferential)}
                      </td>
                      <td className="border border-black h-7 px-2  border-b-0 ">
                        SSS Loan
                      </td>
                      <td className="border border-black h-7 px-2 border-b-0 ">
                        {formatNumber(payslip?.loan)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border  border-t-0  border-b-0  border-black h-7 px-2">
                        Holiday Pay
                      </td>

                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 ">
                        {formatNumber(payslip?.holidayPay)}
                      </td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 ">
                        Pag-IBIG Loan
                      </td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 "></td>
                    </tr>
                    <tr>
                      <td className="border  border-t-0  border-b-0 px-2 border-black h-7">
                        - Regular
                      </td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 "></td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 ">
                        Tardiness
                      </td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 ">
                        {formatNumber(payslip?.totalTardiness)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black border-t-0  border-b  h-7 px-2">
                        - Special non-working
                      </td>
                      <td className="border border-black border-t-0  border-b-0  h-7 px-2"></td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 ">
                        Other Deductions
                      </td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 ">
                        {formatNumber(payslip?.otherDeductions)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black h-7 border-t-0  border-b-0  px-2">
                        Allowances
                      </td>
                      <td className="border border-black h-7 border-t-0  border-b-0  px-2">
                        {formatNumber(payslip?.allowance)}
                      </td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 "></td>
                      <td className="border border-black h-7 px-2 border-t-0  border-b-0 "></td>
                    </tr>
                    <tr>
                      <td className="border border-black h-7 border-t-0  border-b-0   px-2"></td>
                      <td className="border border-black h-7 border-t-0   border-b-0   px-2"></td>
                      <td className="border border-black h-7 border-t-0  border-b-0  font-bold px-2">
                        Total Deductions
                      </td>
                      <td className="border border-black h-7 border-t-0   border-b-0  px-2">
                        {formatNumber(payslip?.totalDeductions)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black h-7 border-t-0  border-b-0  px-2"></td>
                      <td className="border border-black h-7 border-t-0  border-b-0  px-2"></td>
                      <td className="border border-black h-7 border-t-0 italic border-b-0 px-2">
                        Adjustments
                      </td>
                      <td className="border border-black h-7 border-t-0  border-b-0 px-2">
                        {formatNumber(payslip?.adjusment)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black h-7 border-t-0    px-2"></td>
                      <td className="border border-black h-7 border-t-0    px-2"></td>
                      <td className="border border-black h-7 border-t-0 italic  px-2"></td>
                      <td className="border border-black h-7 border-t-0   px-2"></td>
                    </tr>
                  </table>
                  <table className="border-collapse mx-auto -mt-7 text-xs font-sans">
                    <tr>
                      <td
                        colSpan="2"
                        className="border border-black border-t-0 font-bold w-[22rem] uppercase bg-gray-400 text-center"
                      ></td>
                      <td
                        colSpan="2"
                        className="border border-black border-t-0 font-bold h-2 w-[22rem] uppercase bg-gray-400  text-center"
                      ></td>
                    </tr>
                    <tr>
                      <td
                        colSpan="2"
                        className="border border-t-0 text-center border-black h-7 w-[22rem] px-2"
                      >
                        Gross Pay
                      </td>
                      <td
                        colSpan="2"
                        className="border border-t-0 text-center border-black h-7 w-[22rem] px-2"
                      >
                        Net Pay
                      </td>
                    </tr>
                  </table>
                  <table className="border-collapse -mt-7 text-xs mx-auto font-sans">
                    <tr>
                      <td
                        colSpan="2"
                        className="border-t-0 border text-center border-black h-7 w-[22rem] px-2"
                      >
                        {formatNumber(payslip?.grossPay)}
                      </td>
                      <td
                        colSpan="2"
                        className="border border-t-0 text-center border-black h-7 w-[22rem] px-2"
                      >
                        {formatNumber(payslip?.netPay)}
                      </td>
                    </tr>
                  </table>

                  <div>
                    <img
                      src="https://stjohnmajore.com/images/FOOTER.png"
                      alt="St. John Majore Footer"
                      className="w-full h-auto object-contain"
                      style={{
                        imageRendering: "crisp-edges",
                        imageRendering: "-webkit-optimize-contrast",
                        imageRendering: "optimize-contrast",
                        msInterpolationMode: "nearest-neighbor",
                      }}
                      loading="eager"
                      decoding="sync"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={downloadPDF}
            disabled={!payslip || loading}
            className="ms-[40rem] p-3 rounded h-fit w-fit border bg-transparent text-sm border-neutralDGray hover:bg-neutralSilver disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: "#4d4d4d" }}
          >
            Download PDF
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PayslipModal;
