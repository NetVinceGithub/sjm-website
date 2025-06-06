import React, { useEffect, useState, useRef } from "react";
import "../payroll/payslip.css";
import LongLogo from "/public/long-logo.png";
import axios from "axios";
import { Modal, Button, Form, ModalFooter } from "react-bootstrap";
import html2pdf from "html2pdf.js";

const PayslipHistoryModal
  = ({ isOpen, onClose, employeeId }) => {
    const [payslip, setPayslip] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const payslipRef = useRef();


    useEffect(() => {
      if (!isOpen || !employeeId) {
        console.log("Payslip modal is closed or employeeId is missing.");
        return;
      }

      console.log(`Fetching payslip for Employee ID: ${employeeId}`);

      const fetchPayslip = async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/payslip/history/${employeeId}`
          );

          console.log("API Response:", response.data);
          setPayslip(response.data?.payslip ?? []);
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

    return (

      <>

        <Modal show={isOpen} onHide={onClose} centered size="xl" scrollable>
          <Modal.Header className="py-2 px-3 text-[12px]" closeButton  >

            <Modal.Title as="h6" className="text-lg">Employee Payslip</Modal.Title>

          </Modal.Header>
          <Modal.Body>
            {loading ? (
              <p>Loading payslip...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : !payslip ? (
              <p>No payslip data found.</p>
            ) : (
              <div ref={payslipRef}>
                <div className="relative h-24 rounded-tr-lg rounded-tl-lg border bg-[#0093DD] mb-3 overflow-hidden p-4 text-white">
                  <img src={Logo}
                    alt="company-logo" className="absolute top-0 left-0 m-2 w-20" />

                  <div className="ml-20 -mt-2">
                    <p style={{ fontFamily: "'AR Julian', sans-serif" }} className="font-semibold text-2xl">ST. JOHN MAJORE</p>
                    <p className="text-sm -mt-4 italic">SERVICES COMPANY INC.</p>
                  </div>
                  <p className="absolute bottom-0 text-right right-0 mx-3 my-1 font-semibold">Electronic Payslip <br /><span
                    className="text-sm">Payslip No.:</span></p>
                </div>
                <table className="border-collapse text-xs mx-auto font-sans text-center">
                  <tr>
                    <td className="border-2 h-8 w-[5rem] border-[#AA396F] font-bold">E-code</td>
                    <td className="border-2 h-8 w-64 border-[#AA396F] font-bold">Employee Name</td>
                    <td className="border-2 h-8 w-56 border-[#AA396F] font-bold">Project Site</td>
                    <td className="border-2 h-8 w-[7rem] border-[#AA396F] font-bold">Rate</td>
                  </tr>
                  <tr>
                    <td className="border-2 h-8 w- border-[#AA396F]">{payslip.ecode || "N/A"}</td>
                    <td className="border-2 h-8 w- border-[#AA396F]">{payslip.name || "N/A"}</td>
                    <td className="border-2 h-8 w- border-[#AA396F]">{payslip.project || "N/A"}</td>
                    <td className="border-2 h-8 w- border-[#AA396F]">{formatNumber(payslip.dailyrate)}</td>
                  </tr>
                </table>
                <table className="border-collapse -mt-8 text-xs mx-auto text-center font-sans">
                  <tr>
                    <td colspan="2" className="border-2 h-8 w-[21rem] border-[#AA396F] font-bold">Position</td>
                    <td colspan="2" className="border-2 h-8 w-[21rem] border-[#AA396F] font-bold">Cutoff Date</td>
                  </tr>
                  <tr>
                    <td colspan="2" className="border-2 h-8 border-[#AA396F]">{payslip.position || "N/A"}</td>
                    <td colspan="2" className="border-2 h-8 border-[#AA396F]">{payslip.cutoffDate || "N/A"}</td>
                  </tr>
                </table>
                <table className="border-collapse -mt-8 text-xs mx-auto font-sans">
                  <tr>
                    <td className="border-2 h-8 w-[16rem] border-[#AA396F] px-2 font-bold">Earnings</td>
                    <td className="border-2 h-8 w-[5rem] border-[#AA396F] px-2 font-bold">Figures</td>
                    <td className="border-2 h-8 w-[14rem] border-[#AA396F] px-2 font-bold">Deductions</td>
                    <td className="border-2 h-8 w-[7rem] border-[#AA396F] px-2 font-bold">Figures</td>
                  </tr>
                  <tr>
                    <td className="border-r-2 border-l-2 border-[#AA396F] px-2">Basic Pay</td>
                    <td className="border-r-2 border-l-2 border-[#AA396F] px-2 ">{formatNumber(payslip.dailyrate)}</td>
                    <td className="border-r-2 border-l-2  h-8 border-[#AA396F] px-2 w-[14rem] p-0 border-t-0  border-b-0">
                      <div className="text-xs bg-[#AA396F] px-5 py-1 flex justify-center items-center text-white rounded-lg font-bold">
                        GOV'T CONTRIBUTION
                      </div>
                    </td>
                    <td className=" border-[#AA396F] h-8 border-r-2 border-l-2"></td>
                  </tr>
                  <tr>
                    <td className="border-r-2 border-l-2 border-[#AA396F] h-8 px-2">No. of Days</td>
                    <td className="border-r-2 border-l-2 border-b-0  border-[#AA396F] h-8 px-2">{payslip.noOfDays || "0"}</td>
                    <td className="border-r-2 border-l-2 border-t-0 border-[#AA396F] h-8 px-2">SSS</td>
                    <td className="border-r-2 border-l-2  border-b-0  border-[#AA396F] h-8 px-2">{formatNumber(payslip.sss)}</td>
                  </tr>
                  <tr>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2">Overtime Pay</td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">{formatNumber(payslip.overtimePay)}</td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">PHIC</td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">{formatNumber(payslip.phic)}</td>
                  </tr>
                  <tr>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2">Overtime Hours</td>
                    <td className=" border-[#AA396F] h-8 px-2 border-r-2 border-l-2  ">{payslip.totalOvertime || "0.00"}</td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">HDMF</td>
                    <td className="border-r-2 border-l-2   border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">{formatNumber(payslip.hdmf)}</td>
                  </tr>
                  <tr>
                    <td className="border-r-2 border-l-2   border-t-0  border-b-0  border-[#AA396F] h-8 px-2">Holiday Pay</td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">{formatNumber(payslip.holidayPay)}</td>
                    <td className="border-r-2 border-l-2 border-t-2  border-[#AA396F] h-8 px-2  border-b-0 ">Cash Advance/Loan</td>
                    <td className="border-r-2 border-l-2 border-t-2  border-[#AA396F] h-8 px-2 border-b-0 ">{formatNumber(payslip.loan)}</td>
                  </tr>
                  <tr>
                    <td className="border-r-2 border-l-2   border-t-0  border-b-0  border-[#AA396F] h-8 px-2">Night Differential</td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">{formatNumber(payslip.nightDifferential)}</td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">Tardiness</td>
                    <td className="border-r-2 border-l-2 border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">{formatNumber(payslip.totalTardiness)}</td>
                  </tr>
                  <tr>
                    <td className="border-r-2 border-l-2   border-t-0  border-b-0 px-2 border-[#AA396F] h-8">Allowance</td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">{formatNumber(payslip.allowance)}</td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">Other Deductions</td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">{formatNumber(payslip.otherDeductions)}</td>
                  </tr>
                  <tr>
                    <td className="border-r-2 border-l-2  border-[#AA396F] border-t-0  border-b-0  h-8 px-2"></td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] border-t-0  border-b-0  h-8 px-2"></td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">Total Deductions</td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">{formatNumber(payslip.totalDeductions)}</td>
                  </tr>
                  <tr>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 border-t-0  border-b-0  px-2"></td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 border-t-0  border-b-0  px-2"></td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">Adjustments</td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 px-2 border-t-0  border-b-0 ">{formatNumber(payslip.adjusment)}</td>
                  </tr>
                  <tr>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 border-t-0    px-2"></td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 border-t-0    px-2"></td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 border-t-0   px-2"></td>
                    <td className="border-r-2 border-l-2  border-[#AA396F] h-8 border-t-0   px-2"></td>
                  </tr>
                </table>
                <table className="border-collapse -mt-8 mx-auto text-xs font-sans">
                  <tr>
                    <td colspan="2" className="border-2 border-[#AA396F] font-bold h-8 w-[21rem] text-center">Netpay</td>
                    <td colspan="2" className="border-2 border-[#AA396F] font-bold h-8 w-[21rem] text-center">Amount</td>
                  </tr>
                </table>
                <table className="border-collapse -mt-8 text-xs mx-auto font-sans">
                  <tr>
                    <td colspan="2" className="border-2 border-[#AA396F] h-8 w-[21rem] px-2">Netpay: NETPAY: ₱{formatNumber(payslip.netPay)}</td>
                    <td colspan="2" className="border-2 border-[#AA396F] h-8 w-[21rem] px-2">{formatNumber(payslip.totalDeductions)}</td>
                  </tr>
                </table>

                <div className=" bg-[#bbe394] border rounded-br-lg rounded-bl-lg mt-5 py-4">
                  <table className="w-[40rem] border-collapse text-xs mx-auto font-sans">
                    <tr>
                      <td className="px-2 w-[5rem]  font-bold ">Company</td>
                      <td className="px-2 w-64  text-nowrap">St. John Majore Services Company Inc.</td>
                      <td className="px-2 w-[21rem]" rowspan="3">
                        <strong>Address:</strong><br />
                        Patron Central Plaza 8, De Villa St.,<br />
                        Poblacion San Juan Batangas
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 font-bold  w-[5rem]">Email</td>
                      <td className="px-2  w-[14rem]">sjmajore@gmail.com</td>
                    </tr>
                    <tr>
                      <td className="px-2 font-bold  w-[5rem]">Web</td>
                      <td className="px-2  w-[14rem]">www.stjohnmajore.com</td>
                    </tr>
                  </table>
                </div>
              </div>
            )}
          </Modal.Body>
          <ModalFooter>
            <Button onClick={downloadPDF} className="ms-[40rem] w-fit h-fit border bg-transparent border-neutralDGray hover:bg-gray-500" style={{ color: "#4d4d4d" }}>
              Download PDF
            </Button>
          </ModalFooter>
        </Modal>


      </>
    );
  };

export default PayslipHistoryModal;
