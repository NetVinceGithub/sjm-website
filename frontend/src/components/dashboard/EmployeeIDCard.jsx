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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [extraDetails, setExtraDetails] = useState("");
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const idCardRef = useRef(null);
  const [formData, setFormData] = useState({
    ecode: "",
    sss: "",
    tin: "",
    philhealth: "",
    pagibig: "",
    contact_name: "",
    contact_number: "",
    contact_address: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formDataToSend = new FormData();
  
    // Append text fields
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }
  
    // Append images if they exist
    if (image1) {
      formDataToSend.append("profileImage", image1);
    }
    if (image2) {
      formDataToSend.append("esignature", image2);
    }
  
    try {
      const response = await axios.put(
        `http://localhost:5000/api/employees/updateIDDetails/${employeeId}`, 
        formDataToSend, 
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      if (response.data.success) {
        alert("Employee details updated successfully!");
        setEmployee((prev) => ({
          ...prev,
          ...formData, 
          profileImage: response.data.employee.profileImage, 
          esignature: response.data.employee.esignature, 
        }));
        setShowDetailsModal(false);
      } else {
        alert("Failed to update employee details.");
      }
    } catch (error) {
      console.error("Error updating employee details:", error);
      alert("An error occurred while updating the details.");
    }
  };
  
  
  
  
  const handleImageChange = (e, setImage) => {
    setImage(e.target.files[0]);
  };


  useEffect(() => {
    if (employee) {
      setFormData({
        ecode: employee.ecode || "",
        sss: employee.sss || "",
        tin: employee.tin || "",
        philhealth: employee.philhealth || "",
        pagibig: employee.pagibig || "",
        contact_name: employee.contact_name || "",
        contact_number: employee.contact_number || "",
        contact_address: employee.contact_address || "",
      });
    }
  }, [employee]);

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
    <>
      {/* Employee ID Modal */}
      <Modal show={show} onHide={handleClose} centered size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Employee ID Card</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="id-container" ref={idCardRef}>
            {/* Front Side of ID */}
            <div className="id-front">
              <div className="id-header">
                <img src={logo} alt="Company Logo" className="id-logo" />
                <div className="id-title-container">
                  <h1 className="id-title">St. John Majore</h1>
                  <p className="id-subtitle">#8 De Villa St., Poblacion, San Juan, Batangas</p>
                </div>
              </div>
              <div className="id-content">
                <img src={profileImage} alt="Profile" className="user-img" />
                <p className="user-id">ID NO. {employee.ecode}</p>
                <p className="user-name">{employee.name || "No Name Available"}</p>
                <p className="user-position">{employee.designation}</p>
                <img src={signature} alt="Signature" className="user-signature" />
                <p className="user-signature-label">Signature</p>
              </div>
            </div>

            {/* Back Side of ID */}
            <div className="id-back">
              <p className="address">{employee.address}</p>
              <p className="sss">SSS: {employee.sss}</p>
              <p className="tin">TIN: {employee.tin}</p>
              <p className="philhealth">PHILHEALTH: {employee.philhealth}</p>
              <p className="pagibig">PAGIBIG: {employee.pagibig}</p>
              <p className="bday">DATE OF BIRTH: {formattedDOB}</p>
              <p className="emergency-title">In case of emergency, please notify:</p>
              <p className="emergency-name">{employee.contact_name}</p>
              <p className="emergency-contact">{employee.contact_number}</p>
              <p className="emergency-address">{employee.contact_address}</p>
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
          <Button variant="primary" onClick={() => setShowDetailsModal(true)}>
            Add Details
          </Button>
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
            <Form.Label>Enter SSS:</Form.Label>
            <Form.Control name="sss" value={formData.sss} placeholder="Enter SSS" onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Enter TIN:</Form.Label>
            <Form.Control name="tin" value={formData.tin} placeholder="Enter TIN" onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Enter PHILHEALTH:</Form.Label>
            <Form.Control name="philhealth" value={formData.philhealth} placeholder="Enter PHILHEALTH" onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Enter PAGIBIG:</Form.Label>
            <Form.Control name="pagibig" value={formData.pagibig} placeholder="Enter PAGIBIG" onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Enter Name of Contact:</Form.Label>
            <Form.Control name="contact_name" value={formData.contact_name} placeholder="Name of Contact" onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Enter Contact Number:</Form.Label>
            <Form.Control name="contact_number" value={formData.contact_number} placeholder="Contact Number" onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Enter Address:</Form.Label>
            <Form.Control name="contact_address" value={formData.contact_address} placeholder="Address of Contact" onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Upload First Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={(e) => handleImageChange(e, setImage1)} />
            {image1 && <img src={URL.createObjectURL(image1)} alt="First Upload" className="preview-image" />}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Upload Second Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={(e) => handleImageChange(e, setImage2)} />
            {image2 && <img src={URL.createObjectURL(image2)} alt="Second Upload" className="preview-image" />}
          </Form.Group>

          <Button type="submit" className="mt-3">Submit</Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Cancel</Button>
        <Button variant="primary" onClick={() => console.log({ formData, image1, image2 })}>
          Save Details
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default EmployeeIDCard;
