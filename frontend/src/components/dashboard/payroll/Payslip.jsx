import React, { useEffect, useState } from 'react';
import './payslip.css';
import LongLogo from '/public/long-logo.png';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Payslip = () => {
    const [employee, setEmployee] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [ratesAndDeductions, setRatesAndDeductions] = useState([]);
    const { id } = useParams();

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/employee/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });

                if (response.data.success) {
                    const employeeData = response.data.employee;
                    setEmployee(employeeData);

                    if (employeeData.project) {
                        try {
                            const projectResponse = await axios.get(`http://localhost:5000/api/project/${employeeData.project}`);
                            setProjectName(projectResponse.data.success ? projectResponse.data.project.name : 'Project Not Found');
                        } catch (error) {
                            setProjectName('Project Not Found');
                        }
                    } else {
                        setProjectName('No Project Assigned');
                    }
                }
            } catch (error) {
                console.error('Error fetching employee data:', error);
            }
        };

        fetchEmployee();
    }, [id]);

    useEffect(() => {
        const fetchRatesAndDeductions = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/rates`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });

                if (response.data.success) {
                    setRatesAndDeductions(response.data.rates);
                }
            } catch (error) {
                console.error("Error fetching rates and deductions:", error);
            }
        };

        fetchRatesAndDeductions();
    }, []);

    if (!employee) return <div>Loading...</div>;

    const dailyRate = parseFloat(ratesAndDeductions[0]?.dailyRate?.$numberDecimal || 0);
    const basicPay = parseFloat(ratesAndDeductions[0]?.basicPay?.$numberDecimal || 0);
    const sss = parseFloat(employee[0]?.sss?.$numberDecimal || 0);
    const phic = parseFloat(employee[0]?.phic?.$numberDecimal || 0);
    const hdmf = parseFloat(employee[0]?.hdmf?.$numberDecimal || 0);
    const holidayPay = parseFloat(ratesAndDeductions[0]?.regularHolidayRate?.$numberDecimal || 0);
    const allowance = parseFloat(employee.allowance || 0);
    const overtimePay = parseFloat(employee.regularholidaypay || 0);
    
    const holidaySalary = holidayPay * 2;
    const totalEarnings = (dailyRate * 10) + allowance + holidaySalary ;
    const totalDeductions = sss + phic + hdmf;
    const netPay = totalEarnings - totalDeductions;

    const handleCreatePayslip = async () => {
        if (!employee) {
            alert("No employee data available!");
            return;
        }

        const payslipData = {
            ecode: employee.ecode || "N/A",
            email: employee.emailaddress || "N/A",
            employeeId: employee._id || "N/A",
            name: employee.name || "N/A",
            project: projectName || "N/A",
            position: employee.positiontitle || "N/A",
            dailyRate: dailyRate || 0,
            basicPay: basicPay || 0,
            overtimePay: overtimePay || 0,
            holidaySalary: holidaySalary || 0,
            allowance: allowance || 0,
            sss: sss || 0,
            phic: phic || 0,
            hdmf: hdmf || 0,
            totalEarnings: totalEarnings || 0,
            totalDeductions: totalDeductions || 0,
            netPay: netPay || 0,
        };
        
        

        try {
            console.log("Sending payslip data:", JSON.stringify(payslipData, null, 2));

            const response = await axios.post('http://localhost:5000/api/payslip', payslipData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.success) {
                alert('Payslip created successfully!');
            } else {
                alert('Failed to create payslip');
            }
        } catch (error) {
            console.error('Error saving payslip:', error);
            alert('Error saving payslip');
        }
    };

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
                        <td>{employee.ecode}</td>
                        <td>{employee.name || '-'}</td>
                        <td>{employee.area || '-'}</td>
                        <td>
                            {ratesAndDeductions[0]?.dailyRate?.$numberDecimal 
                                ? parseFloat(ratesAndDeductions[0].dailyRate.$numberDecimal).toFixed(2) 
                                : "0.00"}
                        </td>


                    </tr>
                    <tr>
                        <th className="cell align" colSpan={2}>POSITION</th>
                        <th className="cell align" colSpan={2}>CUT-OFF DATE</th>
                    </tr>
                    <tr>
                        <td className="cell1" colSpan={2}>{employee.positiontitle || '-'}</td>
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
                        <td className="cell3">{ratesAndDeductions[0]?.dailyRate?.$numberDecimal 
                                ? (parseFloat(ratesAndDeductions[0].dailyRate.$numberDecimal) *10).toFixed(2) 
                                : "0.00"}</td>
                        <td className="cell3">
                            <div className="GovCon">GOVERNMENT CONTRIBUTIONS</div>
                        </td>
                        <td className="cell3"></td>
                    </tr>
                    <tr>
                        <td className="cell4">No. of Days</td>
                        <td className="cell4">10</td>
                        <td className="cell4">SSS</td>
                        <td className="cell4">{ratesAndDeductions[0]?.sss?.$numberDecimal 
                                ? parseFloat(ratesAndDeductions[0].sss.$numberDecimal).toFixed(2) 
                                : "0.00"}</td>
                    </tr>
                    <tr>
                        <td className="cell4">Overtime Pay</td>
                        <td className="cell4">{employee.regularholidaypay}</td>
                        <td className="cell4">PHIC</td>
                        <td className="cell4">{ratesAndDeductions[0]?.phic?.$numberDecimal 
                                ? parseFloat(ratesAndDeductions[0].phic.$numberDecimal).toFixed(2) 
                                : "0.00"}</td>
                    </tr>
                    <tr>
                        <td className="cell4">Overtime Hours</td>
                        <td className="cell4">0</td>
                        <td className="cell4">HDMF</td>
                        <td className="cell4">{ratesAndDeductions[0]?.hdmf?.$numberDecimal 
                                ? parseFloat(ratesAndDeductions[0].hdmf.$numberDecimal).toFixed(2) 
                                : "0.00"}</td>
                    </tr>
                    <tr>
                        <td className="cell4">Holiday Pay</td>
                        <td className="cell4">{holidaySalary}</td>
                        <td className="cell3">Cash Advance/Loan</td>
                        <td className="cell4">0</td>
                    </tr>
                    <tr>
                        <td className="cell4">Night Differential</td>
                        <td className="cell4">0</td>
                        <td className="cell4">Tardiness</td>
                        <td className="cell4">0</td>
                    </tr>
                    <tr>
                        <td className="cell4">Allowance</td>
                        <td className="cell4">{employee.allowance}</td>
                        <td className="cell4">Other Deductions</td>
                        <td className="cell4">0</td>
                    </tr>
                    <tr>
                        <td className="cell4"></td>
                        <td className="cell4"></td>
                        <td className="cell4">Total Deductions</td>
                        <td className="cell4">0</td>
                    </tr>
                    <tr>
                        <td className="cell4"></td>
                        <td className="cell4"></td>
                        <td className="cell4">Adjustment</td>
                        <td className="cell4">0</td>
                    </tr>
                    <tr>
                        <th className="cell align" colSpan={2}>NET PAY</th>
                        <th className="cell align" colSpan={2}>AMOUNT</th>
                    </tr>
                    <tr className='cell5'>
                        <td className="cell5" colSpan={2}>NETPAY: {netPay}</td>
                        <td className="cell5" colSpan={2}>{totalDeductions}</td>
                    </tr>
                </tbody>
            </table>
            <div className="container">
                <button onClick={handleCreatePayslip}>Create Payslip</button>            
            </div>
        </div>
    );
};

export default Payslip;
