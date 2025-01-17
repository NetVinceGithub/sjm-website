import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import logo from "../../assets/logo.png";
import defaultProfile from "../../assets/default-profile.png"; // Fallback image if no profile exists
import dayjs from "dayjs";
import '../../styles/IDCard.css';

const EmployeeIDCard = () => {
  const [employee, setEmployee] = useState(null);
  const { id } = useParams();
  const idCardRef = useRef(null);

  const bufferToBase64 = (buffer) => {
    if (!buffer) return null;
    const binary = new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "");
    return `data:image/jpeg;base64,${window.btoa(binary)}`;
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/employee/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("API Response:", response.data);

        if (response.data.success) {
          setEmployee(response.data.employee);
        } else {
          console.error("Failed to fetch employee data.");
        }
      } catch (error) {
        console.error("Error fetching employee:", error.message);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleDownload = async () => {
    if (idCardRef.current) {
      try {
        const dataUrl = await toPng(idCardRef.current, { cacheBust: true });
        const pdf = new jsPDF();
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (pdfWidth * dataUrl.height) / dataUrl.width;

        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${employee?.name || "employee-id"}.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    }
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  const profileImage = employee?.profileImage?.data
    ? bufferToBase64(employee.profileImage.data)
    : defaultProfile; // Fallback to default profile image if no image is provided

  return (
    <div>
      <div
        ref={idCardRef}
        style={{
          display: "inline-flex",
          justifyContent: "space-between",
          gap: "20px",
          padding: "20px",
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        {/* Front Side */}
        <div
          style={{
            border: "2px solid #000",
            width: "300px",
            height: "450px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div> 
            <img src={logo} alt="logo" style={{ width: "80px", height: "80px", padding:'0' }} /> 
          </div> 
          
          <div className="id-header-rigth" style={{marginBottom:"10px"}}> 
            <h1 className="id-title"> St.JohnMajore </h1> 
            <p className="id-subtitle"> #8 De Villa St., Poblacion, San Juan, Batangas </p> 
          </div>
          <div style={{ textAlign: "center" }}>
            <img
              src={profileImage}
              alt="Profile"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                objectFit: "cover",
                margin: "10px auto", // Center the image horizontally
                display: "block",

              }}
            />
            <p style={{ fontSize: "14px", fontWeight: "bold" }}>
              ID NO: {employee?.employeeId || "M-XXXXX"}
            </p>
            <p style={{ fontSize: "16px", fontWeight: "bold" }}>
              {employee?.name || "Name not available"}
            </p>
            <p style={{ fontSize: "12px" }}>{employee?.designation || "Designation not available"}</p>
          </div>
          <div style={{ textAlign: "center", marginTop: "20px", fontWeight: "bold" }}>
            Signature
          </div>
        </div>

        {/* Back Side */}
        <div
          style={{
            border: "2px solid #000",
            width: "300px",
            height: "450px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: "12px", margin: "5px 0" }}>
              Address: {employee?.address || "Address not available"}
            </p>
            <p style={{ fontSize: "12px", margin: "5px 0" }}>
              SSS: {employee?.sss || "SSS not available"}
            </p>
            <p style={{ fontSize: "12px", margin: "5px 0" }}>
              TIN: {employee?.tin || "TIN not available"}
            </p>
            <p style={{ fontSize: "12px", margin: "5px 0" }}>
              PhilHealth: {employee?.philHealth || "PhilHealth not available"}
            </p>
            <p style={{ fontSize: "12px", margin: "5px 0" }}>
              Pag-IBIG: {employee?.pagibig || "Pag-IBIG not available"}
            </p>
            <p style={{ fontSize: "12px", margin: "5px 0" }}>
              Date of Birth: {dayjs(employee?.dob).format("MMMM DD, YYYY") || "N/A"}
            </p>
          </div>
          <div>
            <p style={{ fontSize: "12px", margin: "5px 0" }}>
              Emergency Contact: {employee?.nameOfContact || "N/A"}
            </p>
            <p style={{ fontSize: "12px", margin: "5px 0" }}>
              Address: {employee?.addressOfContact || "N/A"}
            </p>
            <p style={{ fontSize: "12px", margin: "5px 0" }}>
              Contact Number: {employee?.numberOfContact || "N/A"}
            </p>
          </div>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <p style={{ fontSize: "14px", fontWeight: "bold" }}>MIA MARY SORA</p>
            <p style={{ fontSize: "12px" }}>Human Resources Department Head</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        style={{
          marginTop: "20px",
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Download as PDF
      </button>
    </div>
  );
};

export default EmployeeIDCard;
