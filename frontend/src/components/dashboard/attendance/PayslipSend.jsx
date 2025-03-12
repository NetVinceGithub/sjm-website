import axios from "axios";
import React, { useEffect, useState } from "react";

const PayslipSend = () => {

    const [payslips, setPayslips] = useState([]);

    console.log("payslipsend ito yung tama hohoh");

    useEffect(()=>{
        fetchPayslip();
    }, [])

    const fetchPayslip = async() =>{
        try{
            const response = await axios.get("http://localhost:5000/api/payslip");
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className="payslip bg-white">
                      <div className="bg-[#0093DD] w-[200px] h-[100px] border-2 border-[#0093DD] rounded-b-[30px] ml-[45px]">
                        <h1 className="text-white font-bold text-[25px] text-center mt-[10px]">e-PAYROLL SLIP</h1>
                        <img  alt="Company Logo" className="mt-[-65px] ml-[265px] w-[140px] h-auto" />
                      </div>
          
                      <h2 className="font-bold mt-[30px] ml-[40px] text-[18px]">Payslip No.:</h2>
                      <table>
                        <thead>
                          <tr className="border-[3px] border-[#AA396F]">
                            <th className="border-[3px] border-[#AA396F] text-center">ECODE</th>
                            <th className="w-[200px] border-[3px] border-[#AA396F] text-center">EMPLOYEE NAME</th>
                            <th className="w-[200px] border-[3px] border-[#AA396F] text-center">PROJECT SITE</th>
                            <th className="w-[200px] border-[3px] border-[#AA396F] text-center">RATE</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="h-[45px]">
                            <td className="border-[3px] border-[#AA396F]">${payslip.ecode || "N/A"}</td>
                            <td className="border-[3px] border-[#AA396F] w-[290px]">${
                              payslip.name || "N/A"
                            }</td>
                            <td className="border-[3px] border-[#AA396F]">${payslip.project || "N/A"}</td>
                            <td className="border-[3px] border-[#AA396F]">${
                              payslip.dailyrate || "0.00"
                            }</td>
                          </tr>
                          <tr>
                            <th className="border-[3px] border-[#AA396F] text-center" colSpan={2}>
                              POSITION
                            </th>
                            <th className="border-[3px] border-[#AA396F] text-center" colSpan={2}>
                              CUT-OFF DATE
                            </th>
                          </tr>
                          <tr>
                            <td className="h-[45px] border-[3px] border-[#AA396F]" colSpan={2}>
                              ${payslip.position || "N/A"}
                            </td>
                            <td className="h-[45px] border-[3px] border-[#AA396F]" colSpan={2}>
                              ${payslip.cutoff_date || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <th className="w-[200px] border-[3px] border-[#AA396F] text-center">EARNINGS</th>
                            <th className="w-[200px] border-[3px] border-[#AA396F] text-center">FIGURES</th>
                            <th className="w-[200px] border-[3px] border-[#AA396F] text-center">DEDUCTIONS</th>
                            <th className="w-[200px] border-[3px] border-[#AA396F] text-center">FIGURES</th>
                          </tr>
                          <tr>
                            <td className="border-b-0 border-[3px] border-[#AA396F] text-left">Basic Pay</td>
                            <td className="border-b-0 border-[3px] border-[#AA396F]">${
                              payslip.dailyrate || "0.00"
                            }</td>
                            <td className="border-b-0 border-[3px] border-[#AA396F] font-normal w-[280px] text-[9px] bg-[#AA396F] rounded-[10px] p-[1px] text-center">GOVERNMENT CONTRIBUTIONS</td>
                            <td className="border-b-0 border-[3px] border-[#AA396F]"></td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left">No. of Days</td>
                            <td className="cell4 bor">${
                              payslip.no_of_days || "0"
                            }</td>
                            <td className="cell4 bor left">SSS</td>
                            <td className="cell4 bor">${
                              payslip.sss || "0.00"
                            }</td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left">Overtime Pay</td>
                            <td className="cell4 bor">${
                              payslip.overtime_pay || "0.00"
                            }</td>
                            <td className="cell4 bor left">PHIC</td>
                            <td className="cell4 bor">${
                              payslip.phic || "0.00"
                            }</td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left">Overtime Hours</td>
                            <td className="cell4 bor">${
                              payslip.overtime_hours
                            }</td>
                            <td className="cell4 bor down left">HDMF</td>
                            <td className="cell4 bor down">${payslip.hdmf}</td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left">Holiday Pay</td>
                            <td className="cell4 bor">${
                              payslip.holiday_pay
                            }</td>
                            <td className="cell4  bor left">Cash Advance/Loan</td>
                            <td className="cell4 bor">${payslip.loan}</td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left">Night Differenctial</td>
                            <td className="cell4 bor">${
                              payslip.night_differential
                            }</td>
                            <td className="cell4 bor left">Tardiness</td>
                            <td className="cell4 bor">${payslip.tardiness}</td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left">Allowance</td>
                            <td className="cell4 bor">${payslip.allowance}</td>
                            <td className="cell4 bor left">Other Deductions</td>
                            <td className="cell4 bor">${
                              payslip.other_deductions
                            }</td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left"></td>
                            <td className="cell4 bor"></td>
                            <td className="cell4 bor left">Total Deductions</td>
                            <td className="cell4 bor">
                              ${payslip.total_deductions || "0.00"}
                            </td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left"></td>
                            <td className="cell4 bor"></td>
                            <td className="cell4 bor left">Adjustments</td>
                            <td className="cell4 bor">${payslip.adjustment}</td>
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
                              NETPAY: ₱${payslip.net_pay || "0.00"}
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

    );
}

export default PayslipSend;