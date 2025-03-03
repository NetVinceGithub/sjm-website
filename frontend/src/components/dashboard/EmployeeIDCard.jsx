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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form:", formData);
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
    return imagePath ? `http://localhost:5000/uploads/${imagePath}` : defaultProfile;
  };

  const profileImage = getProfileImageUrl(employee.profileImage);
  const signature = getProfileImageUrl(employee.signature);

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Employee ID Card</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="id-container"  ref={idCardRef}>
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
                        <p className="user-position">{employee.designation}</p>
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
                        <p className="philhealth">PHILHEALTH: {employee.philHealth}</p>
                        <p className="pagibig">PAGIBIG: {employee.pagibig}</p>
                        <p className="bday">DATE OF BIRTH: {formattedDOB}</p>
                    </div>
                    <div className="emergency">
                        <p className="emergency-title">In case of emergency, please notify:</p>
                        <p className="emergency-name">{employee.nameOfContact || "No name available"}</p>
                        <p className="emergency-contact">{employee.numberOfContact || "No contact available"}</p>
                        <p className="emergency-address">{employee.addressOfContact || "No address avaible"}</p>
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
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={handleDownload}>Download PDF</Button>
          <Button variant="primary" onClick={() => setShowDetailsModal(true)}>Add Details</Button>
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

            <Button type="submit" className="mt-3">Submit</Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EmployeeIDCard;
