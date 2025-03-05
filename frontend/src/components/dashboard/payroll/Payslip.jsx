import React, { useEffect, useState } from 'react';
import './payslip.css';
import LongLogo from '/public/long-logo.png';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Payslip = () => {
    const { id } = useParams();
    const [payslip, setPayslip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchPayslip = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/payslip/${id}`);
                setPayslip(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Error fetching payslip");
            } finally {
                setLoading(false);
            }
        };
    
        if (id) fetchPayslip();
    }, [id]);
    

    if (loading) return <p>Loading payslip...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!payslip) return <p>No payslip data found.</p>;

    // Destructuring for easier use
    return (
        <div className="payslip">
            <div className="payslip-header">
                <h1 className="header-title">e-PAYROLL<br />SLIP</h1>
                <img src={LongLogo} alt="Company Logo" className="header-img" />
            </div>
            <h2 className="header-two">Payslip No.:</h2>
            <table>
                <thead>
                    <tr>
                        <th className="cell align">ECODE</th>
                        <th className="cell-w align">EMPLOYEE NAME</th>
                        <th className="cell-w align">PROJECT SITE</th>
                        <th className="cell-w align">RATE</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="cell1">
                        <td>{payslip.ecode}</td>
                        <td>{payslip.name || '-'}</td>
                        <td>{payslip.project || '-'}</td>
                        <td>
                            {payslip.dailyrate
                                || "0.00"}
                        </td>


                    </tr>
                    <tr>
                        <th className="cell align" colSpan={2}>POSITION</th>
                        <th className="cell align" colSpan={2}>CUT-OFF DATE</th>
                    </tr>
                    <tr>
                        <td className="cell1" colSpan={2}>{payslip.position || '-'}</td>
                        <td className="cell1" colSpan={2}>{payslip.cutoffDate}</td>
                    </tr>
                    <tr>
                        <th className="cell-w align">EARNINGS</th>
                        <th className="cell-w align">FIGURES</th>
                        <th className="cell-w align">DEDUCTIONS</th>
                        <th className="cell-w align">FIGURES</th>
                    </tr>
                    <tr>
                        <td className="cell3">Basic Pay</td>
                        <td className="cell3">{payslip.dailyrate 
                                || "0.00"}</td>
                        <td className="cell3">
                            <div className="GovCon">GOVERNMENT CONTRIBUTIONS</div>
                        </td>
                        <td className="cell3"></td>
                    </tr>
                    <tr>
                        <td className="cell4">No. of Days</td>
                        <td className="cell4">{payslip.noOfDays}</td>
                        <td className="cell4">SSS</td>
                        <td className="cell4">{payslip.sss
                                || "0.00"}</td>
                    </tr>
                    <tr>
                        <td className="cell4">Overtime Pay</td>
                        <td className="cell4">{payslip.overtimePay}</td>
                        <td className="cell4">PHIC</td>
                        <td className="cell4">{payslip.phic
                                || "0.00"}</td>
                    </tr>
                    <tr>
                        <td className="cell4">Overtime Hours</td>
                        <td className="cell4">{payslip.totalOvertime}</td>
                        <td className="cell4">HDMF</td>
                        <td className="cell4">{payslip.hdmf
                                || "0.00"}</td>
                    </tr>
                    <tr>
                        <td className="cell4">Holiday Pay</td>
                        <td className="cell4">{payslip.holidayPay}</td>
                        <td className="cell3">Cash Advance/Loan</td>
                        <td className="cell4">{payslip.loan}</td>
                    </tr>
                    <tr>
                        <td className="cell4">Night Differential</td>
                        <td className="cell4">{payslip.nightDifferential}</td>
                        <td className="cell4">Tardiness</td>
                        <td className="cell4">{payslip.totalTardiness}</td>
                    </tr>
                    <tr>
                        <td className="cell4">Allowance</td>
                        <td className="cell4">{payslip.allowance}</td>
                        <td className="cell4">Other Deductions</td>
                        <td className="cell4">{payslip.otherDeductions}</td>
                    </tr>
                    <tr>
                        <td className="cell4"></td>
                        <td className="cell4"></td>
                        <td className="cell4">Total Deductions</td>
                        <td className="cell4">{payslip.totalDeductions}</td>
                    </tr>
                    <tr>
                        <td className="cell4"></td>
                        <td className="cell4"></td>
                        <td className="cell4">Adjustment</td>
                        <td className="cell4">{payslip.adjustment}</td>
                    </tr>
                    <tr>
                        <th className="cell align" colSpan={2}>NET PAY</th>
                        <th className="cell align" colSpan={2}>AMOUNT</th>
                    </tr>
                    <tr className='cell5'>
                        <td className="cell5" colSpan={2}>NETPAY: {payslip.netPay}</td>
                        <td className="cell5" colSpan={2}>{payslip.totalDeductions}</td>
                    </tr>
                </tbody>
            </table>
        
        </div>
    );
};

export default Payslip;
