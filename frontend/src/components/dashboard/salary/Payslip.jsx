import React from 'react';
import './payslip.css';

const Payslip = () => {
    return (
        <>
            <div className="payslip">
                <table>
                    <tr>
                        <th className="cell">CUT OFF PERIOD</th>
                        <td className="cell2 cell-w">DEC 16 - 31, 2024</td>
                        <th className="cell1 align" colspan="2">CONTRIBUTIONS</th>
                    </tr>
                    <tr>
                        <th className="cell">EMPLOYEE</th>
                        <td className="cell-w"></td>
                        <th>PHIC</th>
                        <td className="cell3 cell-w">0.00</td>
                    </tr>
                    <tr>
                        <th className="cell">EMPLOYEE NUMBER</th>
                        <td className="cell-w"></td>
                        <th>SSS</th>
                        <td className="cell3 cell-w">338.00</td>
                    </tr>
                    <tr>
                        <th className="cell">DEPARTMENT</th>
                        <td className="cell-w"></td>
                        <th>HDMF</th>
                        <td className="cell3 cell-w">200.00</td>
                    </tr>
                    <tr>
                        <th className="none"></th>
                        <td className="none"></td>
                        <th className="none"></th>
                        <td className="none"></td>
                    </tr>
                    <tr>
                        <th className="cell4">BASIC PAY</th>
                        <td className="cell-w">5,200.00</td>
                        <th>CASH ADVANCE | LOAN</th>
                        <td className="cell7 cell-w"></td>
                    </tr>
                    <tr>
                        <th className="cell">NO. OF DAYS</th>
                        <td className="cell-w">10.00</td>
                        <th>TARDINESS</th>
                        <td className="cell7 cell-w">0.00</td>
                    </tr>
                    <tr>
                        <th className="cell">OVERTIME PAY</th>
                        <td className="cell-w">0.00</td>
                        <th>OTHER DEDUCTIONS</th>
                        <td className="cell7 cell-w"></td>
                    </tr>
                    <tr>
                        <th className="cell">OT HOURS</th>
                        <td className="cell-w"></td>
                        <th>TOTAL DEDUCTIONS</th>
                        <td className="cell7 cell-w">538.00</td>
                    </tr>
                    <tr>
                        <th className="cell">HOLIDAY PAY</th>
                        <td className="cell-w">1,040.00</td>
                        <th>ADJUSTMENTS</th>
                        <td className="cell7 cell-w">0.00</td>
                    </tr>
                    <tr>
                        <th className="cell5 cell-w">ND PAY</th>
                        <td className="cell6">0.00</td>
                        <th className="cell6 cell-w">NET PAY</th>
                        <td className="cell7">5,702</td>
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