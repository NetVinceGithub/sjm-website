import React, { useEffect, useState } from 'react';
import './payslip.css';
import LongLogo from '/public/long-logo.png';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Payslip = () => {
    const [employee, setEmployee] = useState(null);
    const [projectName, setProjectName] = useState('');
    const { id } = useParams();

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/employee/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
    
                if (response.data.success) {
                    const employeeData = response.data.employee;
                    console.log('Employee Data:', employeeData); // Debugging step
                    setEmployee(employeeData);
    
                    if (employeeData.project) {
                        try {
                            const projectResponse = await axios.get(`http://localhost:5000/api/project/${employeeData.project}`);
                            if (projectResponse.data.success) {
                                setProjectName(projectResponse.data.project.name);
                            } else {
                                console.log('Project not found');
                                setProjectName('Project Not Found');
                            }
                        } catch (error) {
                            console.error('Error fetching project details:', error.message);
                            setProjectName('Project Not Found');
                        }
                    } else {
                        setProjectName('No Project Assigned');
                    }
                    
                    
                } else {
                    console.log('Failed to fetch employee data');
                }
            } catch (error) {
                console.error('Error fetching employee data:', error);
            }
        };
    
        fetchEmployee();
    }, [id]);
    

    if (!employee) {
        // Render a loading state while fetching data
        return <div>Loading...</div>;
    }

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
                        <td></td>
                        <td>{employee.name || '-'}</td>
                        <td>{projectName || '-'}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <th className="cell align" colSpan={2}>POSITION</th>
                        <th className="cell align" colSpan={2}>CUT-OFF DATE</th>
                    </tr>
                    <tr>
                        <td className="cell1" colSpan={2}>{employee.designation || '-'}</td>
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
                </tbody>
            </table>
            <div className="container">
                <button>Create payslip</button>
            </div>
        </div>
    );
};

export default Payslip;
