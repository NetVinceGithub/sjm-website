import React from 'react';
import './payslip.css';
import LongLogo from '/public/long-logo.png';

const Payslip = () => {
    return (
        <>
            <div className="payslip">
                <div className="payslip-header">
                    <h1 className="header-title">e-PAYROLL<br />SLIP</h1>
                    <img src={LongLogo} alt="Company Logo" className="header-img" />
                </div>
                <h2 className="header-two">
                    Payslip No.:
                </h2>
                <table>
                    <tr>
                        <th className="cell align">ECODE</th>
                        <th className="cell-w align">EMPLOYEE NAME</th>
                        <th className="cell-w align">PROJECT SITE</th>
                        <th className="cell-w align">RATE</th>
                    </tr>
                    <tr className="cell1">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <th className="cell align" colSpan={2}>POSITION</th>
                        <th className="cell align" colSpan={2}>CUT-OFF DATE</th>
                    </tr>
                    <tr>
                        <td className="cell1" colSpan={2}></td>
                        <td className="cell1" colSpan={2}></td>
                    </tr>
                    <tr>
                        <th className="cell-w align">EARNINGS</th>
                        <th className="cell-w align">FIGURES</th>
                        <th className="cell-w align">DEDUCTIONS</th>
                        <th className="cell-w align">FIGURES</th>
                    </tr>
                    <tr>
                        <td className="cell3">Basic Pay</td>
                        <td className="cell3"></td>
                        <td className="cell3">
                            <div className="GovCon">GOVERNMENT CONTRIBUTIONS</div>
                        </td>
                        <td className="cell3"></td>
                    </tr>
                    <tr>
                        <td className="cell4">No. of Days</td>
                        <td className="cell4"></td>
                        <td className="cell4">SSS</td>
                        <td className="cell4"></td>
                    </tr>
                    <tr>
                        <td className="cell4">Overtime Pay</td>
                        <td className="cell4"></td>
                        <td className="cell4">PHIC</td>
                        <td className="cell4"></td>
                    </tr>
                    <tr>
                        <td className="cell4">Overtime Hours</td>
                        <td className="cell4"></td>
                        <td className="cell4">HDMF</td>
                        <td className="cell4"></td>
                    </tr>
                    <tr>
                        <td className="cell4">Holiday Pay</td>
                        <td className="cell4"></td>
                        <td className="cell3">Cash Advance/Loan</td>
                        <td className="cell4"></td>
                    </tr>
                    <tr>
                        <td className="cell4">Night Differential</td>
                        <td className="cell4"></td>
                        <td className="cell4">Tardiness</td>
                        <td className="cell4"></td>
                    </tr>
                    <tr>
                        <td className="cell4">Allowance</td>
                        <td className="cell4"></td>
                        <td className="cell4">Other Deductions</td>
                        <td className="cell4"></td>
                    </tr>
                    <tr>
                        <td className="cell4"></td>
                        <td className="cell4"></td>
                        <td className="cell4">Total Deductions</td>
                        <td className="cell4"></td>
                    </tr>
                    <tr>
                        <td className="cell4"></td>
                        <td className="cell4"></td>
                        <td className="cell4">Adjustment</td>
                        <td className="cell4"></td>
                    </tr>
                    <tr>
                        <th className="cell align" colSpan={2}>NET PAY</th>
                        <th className="cell align" colSpan={2}>AMOUNT</th>
                    </tr>
                    <tr className='cell5'>
                        <td className="cell5" colSpan={2}>NETPAY: </td>
                        <td className="cell5" colSpan={2}></td>
                    </tr>
                </table>
            </div>
            <div className="container">
                <button>Download payslip</button>
            </div>
        </>
    );
};

export default Payslip;