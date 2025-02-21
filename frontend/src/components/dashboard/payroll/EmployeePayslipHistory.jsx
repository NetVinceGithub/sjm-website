import React, { useEffect, useState } from 'react';
import './payslip.css';
import LongLogo from '/public/long-logo.png';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EmployeePayslipHistory = () => {
    const [payslipHistories, setPayslipHistories] = useState(null);
    const { id } = useParams(); // Assume 'id' is the ecode parameter

    useEffect(() => {
      console.log('Fetching payslips for ecode:', id);  // Log the ecode
      const fetchPayslipHistories = async () => {
          try {
              const response = await axios.get(`http://localhost:5000/api/payslip/history/${id}`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              });
  
              if (response.data.success) {
                  setPayslipHistories(response.data.payslips);
              }
          } catch (error) {
              console.error('Error fetching payslip histories:', error);
          }
      };
  
      fetchPayslipHistories();
  }, [id]);
  
    

    if (!payslipHistories) return <div>Loading...</div>;

    return (
        <div className="payslip">
            <div className="payslip-header">
                <h1 className="header-title">e-PAYROLL<br />SLIP</h1>
                <img src={LongLogo} alt="Company Logo" className="header-img" />
            </div>
            <h2 className="header-two">Payslip History</h2>
            <table>
                <thead>
                    <tr>
                        <th className="cell align">Payslip No.</th>
                        <th className="cell-w align">Amount</th>
                        <th className="cell-w align">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {payslipHistories.map((payslip) => (
                        <tr key={payslip._id}>
                            <td>{payslip.payslipNumber}</td>
                            <td>{payslip.amount}</td>
                            <td>{new Date(payslip.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeePayslipHistory;
