import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import logo from "../../assets/logo.png";
import defaultProfile from "../../assets/default-profile.png";
import dayjs from "dayjs"; // Import dayjs for date formatting
import './IDCard.css';

const EmployeeIDCard = () => {
  const [employee, setEmployee] = useState(null);
  const [transparentImage, setTransparentImage] = useState(null); // For the transparent image
  const [apiCallCount, setApiCallCount] = useState(0); // Track API call count
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
        console.error("Error fetching employee:", error.message);
        if (error.response) {
          console.error("Response Data:", error.response.data); // Log the error response data
        }
      }
    };

    fetchEmployee();
  }, [id]);

  // Process image background using Remove.bg API
  const processImageBackground = async (imageBase64) => {
    if (apiCallCount >= 50) {
      console.log("API call limit reached. No further background removal can be done.");
      return;
    }

    try {
      const apiKey = "oruvkch3tc5T59PkvwtZupij"; // Replace with your API key
      const response = await axios.post(
        "https://api.remove.bg/v1.0/removebg",
        { image_file_b64: imageBase64 },
        {
          headers: {
            "X-Api-Key": apiKey,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer", // Ensure binary response
        }
      );

      // Convert ArrayBuffer to Base64 string
      const base64Image = arrayBufferToBase64(response.data);
      setTransparentImage(base64Image); // Set the transparent image
      setApiCallCount(apiCallCount + 1); // Increment API call count
    } catch (error) {
      console.error("Error removing background:", error.message);
      if (error.response) {
        console.error("Response Data:", error.response.data); // Log the error response data
      }
      setTransparentImage(null); // Fallback if background removal fails
    }
  };

  // Helper function to convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary); // Base64 encode the binary string
  };

  // Handle downloading the ID card as a PDF
  const handleDownload = async () => {
    if (!employee) return;

    // Check if we need to remove the background first
    if (employee?.profileImage?.data && !transparentImage) {
      const imageBase64 = bufferToBase64(employee.profileImage.data);
      await processImageBackground(imageBase64); // Process background removal
    }

    // After background removal is completed, proceed to generate the PDF
    if (transparentImage || employee?.profileImage?.data) {
      if (idCardRef.current) {
        try {
          // Wait for background removal to complete before generating PDF
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
    } else {
      console.error("Failed to generate ID card: Background removal not successful.");
    }
  };

  // If employee data isn't loaded yet, show a loading message
  if (!employee) {
    return <div>Loading...</div>;
  }

  // Format DOB using dayjs to display as Month Day, Year (e.g., "December 08, 2003")
  const formattedDOB = dayjs(employee.dob).format("MMMM DD, YYYY");

  // Determine the profile image URL
  const profileImage = transparentImage
    ? `data:image/png;base64,${transparentImage}`
    : employee?.profileImage?.data
    ? bufferToBase64(employee.profileImage.data)
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
          <div className="user-signature">Signature</div>
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
            <p className="bday">DATE OF BIRTH: {formattedDOB}</p> {/* Use formatted DOB */}
          </div>
          <div className="emergency">
            <p className="emergency-title">In case of emergency, please notify:</p>
            <p className="emergency-name">{employee.nameOfContact.toUpperCase()}</p>
            <p className="emergency-contact">{employee.numberOfContact}</p>
            <p className="emergency-address">{employee.addressOfContact}</p>
          </div>
          <div className="hr">
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
