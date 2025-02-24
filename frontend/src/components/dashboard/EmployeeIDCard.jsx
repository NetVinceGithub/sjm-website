import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import logo from "../../assets/logo.png";
import hr_signature from "../../assets/hr-signature.png";
import defaultProfile from "../../assets/default-profile.png";
import dayjs from "dayjs";
import "./IDCard.css";

const EmployeeIDCard = ({ show, handleClose, employeeId }) => {
  const [employee, setEmployee] = useState(null);
  const idCardRef = useRef(null);

  useEffect(() => {
    if (!employeeId) return;

    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/employee/${employeeId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
        if (response.data.success) {
          setEmployee(response.data.employee);
        } else {
          console.error("Failed to fetch employee data.");
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  const handleDownload = async () => {
    if (!employee || !idCardRef.current) return;

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

      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
        pdfHeight = pdf.internal.pageSize.getHeight();
      }

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${employee?.name || "employee-id"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error.message);
    }
  };

  if (!employee) {
    return null;
  }

  const formattedDOB = dayjs(employee.dob).format("MMMM DD, YYYY");

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return defaultProfile;
    try {
      return new URL(`http://localhost:5000/uploads/${imagePath}`).href;
    } catch (error) {
      return defaultProfile;
    }
  };

  const profileImage = getProfileImageUrl(employee.profileImage);
  const signature = getProfileImageUrl(employee.signature);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Employee ID Card</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="id-container" ref={idCardRef}>
          <div className="id-front">
            <div className="id-header">
              <img src={logo} alt="Company Logo" className="id-logo" />
              <h1 className="id-title">St. John Majore</h1>
              <p className="id-subtitle">#8 De Villa St., Poblacion, San Juan, Batangas</p>
            </div>
            <div className="id-content">
              <img src={profileImage} alt="Profile" className="user-img" onError={(e) => (e.target.src = defaultProfile)} />
              <p className="user-id">ID NO. {employee.ecode}</p>
              <p className="user-name">{employee.name || "No Name Available"}</p>
              <p className="user-position">{employee.designation}</p>
              <img src={signature} alt="Signature" className="user-signature" onError={(e) => (e.target.src = defaultProfile)} />
              <p className="user-signature-label">Signature</p>
            </div>
          </div>

          <div className="id-back">
            <p className="address">{employee.address}</p>
            <p className="sss">SSS: {employee.sss}</p>
            <p className="tin">TIN: {employee.tin}</p>
            <p className="philhealth">PHILHEALTH: {employee.philHealth}</p>
            <p className="pagibig">PAGIBIG: {employee.pagibig}</p>
            <p className="bday">DATE OF BIRTH: {formattedDOB}</p>
            <p className="emergency-title">In case of emergency, please notify:</p>
            <p className="emergency-name">{employee.nameOfContact}</p>
            <p className="emergency-contact">{employee.numberOfContact}</p>
            <p className="emergency-address">{employee.addressOfContact}</p>
            <img src={hr_signature} alt="HR Signature" className="hr-signature" />
            <p className="hr-name">MIA MARY SORA</p>
            <p className="hr-title">Human Resources Department Head</p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleDownload}>
          Download PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EmployeeIDCard;
