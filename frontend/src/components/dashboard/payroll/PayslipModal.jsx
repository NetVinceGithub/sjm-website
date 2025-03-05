import React, { useEffect, useState } from 'react';
import '../payroll/payslip.css';
import LongLogo from '/public/long-logo.png';
import axios from 'axios';

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
                const response = await axios.get(`http://localhost:5000/api/payslip/${employeeId}`);
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
                <button className="close-button" onClick={onClose}>×</button>

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
                                <tr>
                                    <th className="cell align">ECODE</th>
                                    <th className="cell-w align">EMPLOYEE NAME</th>
                                    <th className="cell-w align">PROJECT SITE</th>
                                    <th className="cell-w align">RATE</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="cell1">
                                    <td>{payslip.ecode || "N/A"}</td>
                                    <td>{payslip.name || "N/A"}</td>
                                    <td>{payslip.project || "N/A"}</td>
                                    <td>{payslip.dailyrate || "0.00"}</td>
                                </tr>
                                <tr>
                                    <th className="cell align" colSpan={2}>POSITION</th>
                                    <th className="cell align" colSpan={2}>CUT-OFF DATE</th>
                                </tr>
                                <tr>
                                    <td className="cell1" colSpan={2}>{payslip.position || "N/A"}</td>
                                    <td className="cell1" colSpan={2}>{payslip.cutoffDate || "N/A"}</td>
                                </tr>
                                <tr>
                                    <th className="cell-w align">EARNINGS</th>
                                    <th className="cell-w align">FIGURES</th>
                                    <th className="cell-w align">DEDUCTIONS</th>
                                    <th className="cell-w align">FIGURES</th>
                                </tr>
                                <tr>
                                    <td className="cell3">Basic Pay</td>
                                    <td className="cell3">{payslip.dailyrate || "0.00"}</td>
                                    <td className="cell3">GOVERNMENT CONTRIBUTIONS</td>
                                    <td className="cell3"></td>
                                </tr>
                                <tr>
                                    <td className="cell4">No. of Days</td>
                                    <td className="cell4">{payslip.noOfDays || "0"}</td>
                                    <td className="cell4">SSS</td>
                                    <td className="cell4">{payslip.sss || "0.00"}</td>
                                </tr>
                                <tr>
                                    <td className="cell4">Overtime Pay</td>
                                    <td className="cell4">{payslip.overtimePay || "0.00"}</td>
                                    <td className="cell4">PHIC</td>
                                    <td className="cell4">{payslip.phic || "0.00"}</td>
                                </tr>
                                <tr>
                                    <td className="cell4">Total Deductions</td>
                                    <td className="cell4"></td>
                                    <td className="cell4">{payslip.totalDeductions || "0.00"}</td>
                                </tr>
                                <tr>
                                    <th className="cell align" colSpan={2}>NET PAY</th>
                                    <th className="cell align" colSpan={2}>AMOUNT</th>
                                </tr>
                                <tr className="cell5">
                                    <td className="cell5" colSpan={2}>₱{payslip.netPay || "0.00"}</td>
                                    <td className="cell5" colSpan={2}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PayslipModal;
