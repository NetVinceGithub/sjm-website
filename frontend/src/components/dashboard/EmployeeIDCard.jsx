import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import logo from "../../assets/logo.png";
import hr_signature from "../../assets/hr-signature.png";

import defaultProfile from "../../assets/default-profile.png";
import dayjs from "dayjs"; // Import dayjs for date formatting
import './IDCard.css';

const EmployeeIDCard = () => {
  const [employee, setEmployee] = useState(null);
  const { id } = useParams();
  const idCardRef = useRef(null);

  // Helper function to convert ArrayBuffer to Base64
  const bufferToBase64 = (buffer) => {
    if (!buffer) return null;
    const binary = new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "");
    return `data:image/jpeg;base64,${window.btoa(binary)}`;
  };

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/employee/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("Fetching employee with ID:", id);

        if (response.data.success && response.data.employee) {
          const employeeData = response.data.employee;
          setEmployee(employeeData);
        } else {
          console.error("Failed to fetch employee data.");
        }
      } catch (error) {
        console.log("Id of employee: error");
       
      }
    };

    fetchEmployee();
  }, [id]);

  // Handle downloading the ID card as a PDF
  const handleDownload = async () => {
    if (!employee) return;

    if (idCardRef.current) {
      try {
        const dataUrl = await toPng(idCardRef.current, {
          cacheBust: true,
          width: idCardRef.current.offsetWidth,
          height: idCardRef.current.offsetHeight,
        });

        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // Ensure the pdfHeight is within the page height limit
        if (pdfHeight > pdf.internal.pageSize.getHeight()) {
          pdfHeight = pdf.internal.pageSize.getHeight();
        }

        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${employee?.name || "employee-id"}.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error.message);
      }
    }
  };

  // If employee data isn't loaded yet, show a loading message
  if (!employee) {
    return <div>Loading...</div>;
  }

  // Format DOB using dayjs to display as Month Day, Year (e.g., "December 08, 2003")
  const formattedDOB = dayjs(employee.dob).format("MMMM DD, YYYY");

  // Determine the profile image URL
  const profileImage = employee?.profileImage?.data
    ? bufferToBase64(employee.profileImage.data)
    : defaultProfile;

  const signature = employee?.signature?.data
    ? bufferToBase64(employee.signature.data)
    : defaultProfile;


  return (
    <div className="id-container" ref={idCardRef}>
      <div className="id-front">
        <div className="id-header">
          <div className="id-header-left">
            <img src={logo} alt="logo" className="id-logo" />
          </div>
          <div className="id-header-right">
            <h1 className="id-title">St.JohnMajore</h1>
            <p className="id-subtitle">#8 De Villa St., Poblacion, San Juan, Batangas</p>
          </div>
        </div>
        <div className="id-content">
          <div className="user-img">
            <img src={profileImage} alt="user" className="user-img" />
          </div>
          <div className="user-info">
            <p className="user-id">ID NO. {employee.employeeId}</p>
            <p className="user-name">{employee.name.toUpperCase()}</p>
            <p className="user-position">{employee.designation}</p>
          </div>
          <div className="user-signature">
            <img src={signature} alt="user" className="user-signature" />
          </div>
          <div className="user-signature-label">Signature</div>
        </div>
      </div>

      {/* Back of the ID */}
      <div className="id-back">
        <div className="id-content-back">
          <div className="user-info-back">
            <p className="address">{employee.address}</p>
            <p className="sss">SSS: {employee.sss}</p>
            <p className="tin">TIN: {employee.tin}</p>
            <p className="philhealth">PHILHEALTH: {employee.philHealth}</p>
            <p className="pagibig">PAGIBIG: {employee.pagibig}</p>
            <p className="bday">DATE OF BIRTH: {formattedDOB}</p>
          </div>
          <div className="emergency">
            <p className="emergency-title">In case of emergency, please notify:</p>
            <p className="emergency-name">{employee.nameOfContact.toUpperCase()}</p>
            <p className="emergency-contact">{employee.numberOfContact}</p>
            <p className="emergency-address">{employee.addressOfContact}</p>
          </div>
          <div className="hr">
            <div className="id-hr-signature">
              <img src={hr_signature} alt="hr-signature" className="hr-signature" />
            </div>
            <p className="hr-name">MIA MARY SORA</p>
            <p className="hr-title">Human Resources Department Head</p>
          </div>
        </div>
        <div className="id-footer">
          <div className="id-footer-left">
            <img src={logo} alt="logo" className="footer-logo" />
          </div>
          <div className="id-footer-right">
            <p className="footer-title">St.JohnMajore Services Company Inc.</p>
            <p className="footer-subtitle">#8 De Villa St., Poblacion, San Juan, Batangas</p>
            <p className="contact">+043 5755675 | 0917 1851909</p>
            <p className="email">sjmajore@gmail.com</p>
          </div>
        </div>
      </div>

      <button id="download-pdf" onClick={handleDownload}>Download as PDF</button>
    </div>
  );
};

export default EmployeeIDCard;
