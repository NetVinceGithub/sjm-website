import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    sss: "",
    tin: "",
    philhealth: "",
    pagibig: "",
    contact_name: "",
    contact_number: "",
    contact_address: "",
  });
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);

  useEffect(() => {
    if (!employeeId) return;

    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee/${employeeId}`, {
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

  const handleImageWithBackgroundRemoval = (e, setImage) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const img = new Image();
    img.crossOrigin = "anonymous"; // for canvas usage
    img.onload = () => {
      // Step 1: Remove background on full image
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      tempCtx.drawImage(img, 0, 0);
  
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
  
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
  
        // Remove light/white background pixels
        if (r > 230 && g > 230 && b > 230) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }
  
      tempCtx.putImageData(imageData, 0, 0);
  
      // Step 2: Scale to 192x192 px (2in x 2in @ 96dpi)
      const scaleSize = 192;
      const scaleCanvas = document.createElement("canvas");
      const scaleCtx = scaleCanvas.getContext("2d");
      scaleCanvas.width = scaleSize;
      scaleCanvas.height = scaleSize;
  
      // Clear and draw scaled image on the scaleCanvas
      scaleCtx.clearRect(0, 0, scaleSize, scaleSize);
      scaleCtx.drawImage(tempCanvas, 0, 0, img.width, img.height, 0, 0, scaleSize, scaleSize);
  
      // Convert scaled canvas to blob then file
      scaleCanvas.toBlob((blob) => {
        const bgRemovedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".png"), { type: "image/png" });
        setImage(bgRemovedFile);
      }, "image/png");
    };
  
    img.src = URL.createObjectURL(file);
  };
  

  const handleDownload = async () => {
    if (!employee || !idCardRef.current) return;
  
    try {
      // Increase pixelRatio for higher resolution capture
      const dataUrl = await toPng(idCardRef.current, {
        cacheBust: true,
        pixelRatio: 3 // Higher = better quality (2–4 is common)
      });
  
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "letter", // 8.5 x 11 inches
      });
  
      // ID card dimensions in inches
      const idCardWidth = 3.34;
      const idCardHeight = 2.25;
  
      // Position (in inches from top-left of page)
      const xPosition = 1;
      const yPosition = 1;
  
      // Add the high-res image
      pdf.addImage(dataUrl, "PNG", xPosition, yPosition, idCardWidth, idCardHeight);
  
      // Save with filename
      pdf.save(`${employee?.name || "employee-id"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };
  


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataObj = new FormData();

      // Append text fields
      Object.keys(formData).forEach((key) => {
        formDataObj.append(key, formData[key]);
      });

      // Append images
      if (image1) {
        formDataObj.append("profileImage", image1);
      }
      if (image2) {
        formDataObj.append("esignature", image2);
      }

      // Debugging: Log FormData
      for (let [key, value] of formDataObj.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/employee/update-details/${employeeId}`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data"
          },
        }
      );

      if (response.data.success) {
        setEmployee((prev) => ({ ...prev, ...response.data.employee }));

        setShowDetailsModal(false);
        setImage1(null);
        setImage2(null);

        refreshEmployees(); // Calls fetchEmployees() from List.jsx

      } else {
        console.error("Failed to update employee details.");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };


  const handleImageChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  if (!employee) {
    return null;
  }

  const formattedDOB = dayjs(employee.dob).format("MMMM DD, YYYY");

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath || imagePath === "N/A") {
      return defaultProfile; // Use default profile picture
    }
    return `${import.meta.env.VITE_API_URL}/uploads/${imagePath}`;
  };


  const profileImage = getProfileImageUrl(employee.profileImage);
  const signature = getProfileImageUrl(employee.esignature);


  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg" scrollable>
        <Modal.Header className="py-2 px-3 text-[12px]" closeButton>
          <Modal.Title as="h6" className="text-lg">Employee ID Card</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                  <p className="user-id">ID NO. {employee.ecode}</p>
                  <p className="user-name">{employee.name || "No Name Available"}</p>
                  <p className="user-position">{employee.positiontitle}</p>
                </div>
                <div>
                  <img src={signature} alt="user" className="user-sig" />
                </div>
                <div className="user-signature">Signature</div>
              </div>
            </div>

            <div className="id-back">
              <div className="id-content-back">
                <div className="user-info-back">
                  <p className="address">{employee.address}</p>
                  <p className="sss">SSS: {employee.sss}</p>
                  <p className="tin">TIN: {employee.tin}</p>
                  <p className="philhealth">PHILHEALTH: {employee.philhealth}</p>
                  <p className="pagibig">PAGIBIG: {employee.pagibig}</p>
                  <p className="bday">DATE OF BIRTH: {formattedDOB}</p>
                </div>
                <div className="emergency">
                  <p className="emergency-title">In case of emergency, please notify:</p>
                  <p className="emergency-name">{employee.contact_name || "No name available"}</p>
                  <p className="emergency-contact">{employee.contact_number || "No contact available"}</p>
                  <p className="emergency-address">{employee.contact_address || "No address avaible"}</p>
                </div>
                <div className="hr">
                  <img src={hr_signature} alt="HR Signature" className="hr-signature" />
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
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button variant="primary" className="px-4 py-2 w-40 h-8 border flex justify-center text-sm items-center text-center text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all" onClick={handleDownload}>Download PDF</button>
          <button
            className="px-4 py-2 w-36 h-8 border flex justify-center text-sm items-center text-center text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
            variant="primary"
            onClick={() => {
              setFormData({
                sss: employee ?.sss || "",
                tin: employee ?.tin || "",
                philhealth: employee ?.philhealth || "",
                pagibig: employee ?.pagibig || "",
                contact_name: employee ?.contact_name || "",
                contact_number: employee ?.contact_number || "",
                contact_address: employee ?.contact_address || "",
              });
              setShowDetailsModal(true);
            }}
          >
            Edit Details
          </button>

        </Modal.Footer>
      </Modal>

      {/* Second Modal - Add Details */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>SSS</Form.Label>
              <Form.Control name="sss" value={formData.sss} placeholder="Enter SSS" onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>TIN</Form.Label>
              <Form.Control name="tin" value={formData.tin} placeholder="Enter TIN" onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>PHILHEALTH</Form.Label>
              <Form.Control name="philhealth" value={formData.philhealth} placeholder="Enter PHILHEALTH" onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>PAGIBIG</Form.Label>
              <Form.Control name="pagibig" value={formData.pagibig} placeholder="Enter PAGIBIG" onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Contact Name</Form.Label>
              <Form.Control name="contact_name" value={formData.contact_name} placeholder="Enter Contact Name" onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Contact Number</Form.Label>
              <Form.Control name="contact_number" value={formData.contact_number} placeholder="Enter Contact Number" onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Contact Address</Form.Label>
              <Form.Control name="contact_address" value={formData.contact_address} placeholder="Enter Contact Address" onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Profile Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => handleImageWithBackgroundRemoval(e, setImage1)}
              />

            </Form.Group>
            <Form.Group>
              <Form.Label>E signature</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => handleImageWithBackgroundRemoval(e, setImage2)}
              />

            </Form.Group>
            {image1 && <img src={URL.createObjectURL(image1)} alt="Preview" className="preview-image" />}
            {image2 && <img src={URL.createObjectURL(image2)} alt="Preview" className="preview-image" />}
          </Form>



        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" type="submit" onClick={handleSubmit}>
            Save Changes
            </Button>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EmployeeIDCard;
