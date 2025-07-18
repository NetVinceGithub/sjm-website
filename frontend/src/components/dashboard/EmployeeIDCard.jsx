import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { removeBackground } from '@imgly/background-removal';
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
  const [removeBgProfile, setRemoveBgProfile] = useState(true);
  const [removeBgSignature, setRemoveBgSignature] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!employeeId) return;

    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee/${employeeId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data.success) {
          console.log(response.data.employee);
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

  // Improved image preprocessing before background removal
  const preprocessImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas size to maintain aspect ratio while ensuring good quality
        const maxSize = 1024;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Apply image enhancements for better background removal
        ctx.filter = 'contrast(1.1) brightness(1.05) saturate(1.1)';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          const enhancedFile = new File([blob], file.name, { type: "image/png" });
          resolve(enhancedFile);
        }, "image/png", 0.95);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Enhanced background removal with better error handling and fallbacks
  const handleImageWithBackgroundRemoval = async (e, setImage) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      console.log('Starting background removal process...');

      // Preprocess the image for better results
      const preprocessedFile = await preprocessImage(file);
      console.log('Image preprocessing completed');

      // Configure background removal with specific options
      const imageBlob = await removeBackground(preprocessedFile, {
        // Add configuration options if supported by the library
        publicPath: '/node_modules/@imgly/background-removal/dist/',
        debug: true,
        progress: (key, current, total) => {
          console.log(`Background removal progress: ${key} ${current}/${total}`);
        }
      });

      console.log('Background removal completed successfully');

      // Convert to File object
      const processedFile = new File([imageBlob], file.name.replace(/\.[^/.]+$/, ".png"), {
        type: "image/png"
      });

      // Scale to target size (192x192 px)
      const scaledFile = await scaleImage(processedFile, 192);

      setImage(scaledFile);
      console.log('Image processing completed successfully');

    } catch (error) {
      console.error('Background removal failed:', error);

      // Enhanced fallback: try manual background removal for brown backgrounds
      try {
        console.log('Attempting fallback background removal...');
        const fallbackFile = await manualBackgroundRemoval(file);
        const scaledFile = await scaleImage(fallbackFile, 192);
        setImage(scaledFile);
        console.log('Fallback background removal successful');
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        // Final fallback: use original image with scaling
        const scaledOriginal = await scaleImage(file, 192);
        setImage(scaledOriginal);
        alert('Background removal failed. Using original image. For better results, try using an image with a solid, contrasting background.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Advanced background removal using flood-fill and edge detection
  const manualBackgroundRemoval = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Create a mask for pixels to remove
        const mask = new Uint8Array(width * height);

        // Sample multiple edge points to get better background color detection
        const edgePoints = [];
        const edgeSize = 20; // Sample from 20px border

        // Top and bottom edges
        for (let x = 0; x < width; x += 5) {
          for (let y = 0; y < edgeSize; y++) {
            edgePoints.push([x, y]);
            edgePoints.push([x, height - 1 - y]);
          }
        }

        // Left and right edges
        for (let y = 0; y < height; y += 5) {
          for (let x = 0; x < edgeSize; x++) {
            edgePoints.push([x, y]);
            edgePoints.push([width - 1 - x, y]);
          }
        }

        // Get background colors from edge points
        const backgroundColors = [];
        edgePoints.forEach(([x, y]) => {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = (y * width + x) * 4;
            backgroundColors.push({
              r: data[index],
              g: data[index + 1],
              b: data[index + 2]
            });
          }
        });

        // Cluster background colors to find dominant background
        const dominantColor = findDominantColor(backgroundColors);
        console.log(`Detected dominant background color: RGB(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`);

        // Flood fill from edges with similar colors
        const visited = new Set();
        const tolerance = 35; // Adjusted tolerance

        // Start flood fill from edge points
        edgePoints.forEach(([startX, startY]) => {
          if (startX >= 0 && startX < width && startY >= 0 && startY < height) {
            floodFill(data, mask, width, height, startX, startY, dominantColor, tolerance, visited);
          }
        });

        // Apply edge smoothing to reduce artifacts
        smoothEdges(data, mask, width, height);

        // Apply the mask to make background transparent
        for (let i = 0; i < mask.length; i++) {
          if (mask[i] === 1) {
            data[i * 4 + 3] = 0; // Make transparent
          }
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
          const processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".png"), {
            type: "image/png"
          });
          resolve(processedFile);
        }, "image/png");
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Find dominant color from a set of colors
  const findDominantColor = (colors) => {
    const colorMap = new Map();
    const tolerance = 30;

    colors.forEach(color => {
      let found = false;
      for (let [key, value] of colorMap) {
        const diff = Math.sqrt(
          Math.pow(color.r - key.r, 2) +
          Math.pow(color.g - key.g, 2) +
          Math.pow(color.b - key.b, 2)
        );
        if (diff < tolerance) {
          value.count++;
          value.r = (value.r * (value.count - 1) + color.r) / value.count;
          value.g = (value.g * (value.count - 1) + color.g) / value.count;
          value.b = (value.b * (value.count - 1) + color.b) / value.count;
          found = true;
          break;
        }
      }
      if (!found) {
        colorMap.set(color, { ...color, count: 1 });
      }
    });

    let dominant = { r: 0, g: 0, b: 0, count: 0 };
    for (let [, value] of colorMap) {
      if (value.count > dominant.count) {
        dominant = value;
      }
    }

    return { r: Math.round(dominant.r), g: Math.round(dominant.g), b: Math.round(dominant.b) };
  };

  // Flood fill algorithm to mark background pixels
  const floodFill = (data, mask, width, height, startX, startY, targetColor, tolerance, visited) => {
    const stack = [[startX, startY]];

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;

      if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }

      const index = y * width + x;
      const dataIndex = index * 4;

      // Check if pixel is similar to target color
      const r = data[dataIndex];
      const g = data[dataIndex + 1];
      const b = data[dataIndex + 2];

      const diff = Math.sqrt(
        Math.pow(r - targetColor.r, 2) +
        Math.pow(g - targetColor.g, 2) +
        Math.pow(b - targetColor.b, 2)
      );

      if (diff > tolerance || mask[index] === 1) {
        continue;
      }

      visited.add(key);
      mask[index] = 1;

      // Add neighboring pixels to stack
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }
  };

  // Smooth edges to reduce artifacts
  const smoothEdges = (data, mask, width, height) => {
    const newMask = new Uint8Array(mask);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const index = y * width + x;

        if (mask[index] === 0) continue;

        // Check if this is an edge pixel
        let neighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nIndex = (y + dy) * width + (x + dx);
            if (mask[nIndex] === 0) neighbors++;
          }
        }

        // If it's an edge pixel, apply gradient transparency
        if (neighbors > 0) {
          const dataIndex = index * 4;
          const alpha = Math.max(0, 255 - (neighbors * 40));
          data[dataIndex + 3] = Math.min(data[dataIndex + 3], alpha);
          newMask[index] = 0; // Don't make completely transparent
        }
      }
    }
  };

  const scaleImage = (file, targetSize) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Calculate dimensions to maintain aspect ratio
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        ctx.drawImage(img, x, y, size, size, 0, 0, targetSize, targetSize);

        canvas.toBlob((blob) => {
          const scaledFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".png"), {
            type: "image/png"
          });
          resolve(scaledFile);
        }, "image/png", 0.95);
      };
      img.src = URL.createObjectURL(file);
    });
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
      const idCardWidth = 4.39;
      const idCardHeight = 3.36;

      // Position (in inches from top-left of page)
      const xPosition = 0.5;
      const yPosition = 0.5;

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

  const formattedDOB = dayjs(employee.birthdate).format("MMMM DD, YYYY");

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
                  
                </div>
                <div className="user-signature">Signature</div>
              </div>
            </div>

            <div className="id-back">
              <div className="id-content-back">
                <div className="user-info-back">
                  <p className="address">{employee.currentaddress}</p>
                  <p className="sss">SSS: {employee.sss}</p>
                  <p className="tin">TIN: {employee.tin}</p>
                  <p className="philhealth">PHILHEALTH: {employee.philhealth}</p>
                  <p className="pagibig">PAGIBIG: {employee["pag-ibig"]}</p>
                  <p className="bday">DATE OF BIRTH: {formattedDOB}</p>
                </div>
                <div className="emergency">
                  <p className="emergency-title">In case of emergency, please notify:</p>
                  <p className="emergency-name">{employee.emergencyContact || "No name available"}</p>
                  <p className="emergency-contact">{employee.emergencyContactNumber || "No contact available"}</p>
                  <p className="emergency-address address">{employee.emergencycontactAddress || "No address avaible"}</p>
                </div>
                <div className="hr">
                  <img src={hr_signature} alt="HR Signature" className="hr-signature" />
                  <p className="hr-name">PAT PINEDA</p>
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
                sss: employee?.sss || "",
                tin: employee?.tin || "",
                philhealth: employee?.philhealth || "",
                pagibig: employee?.pagibig || "",
                contact_name: employee?.contact_name || "",
                contact_number: employee?.contact_number || "",
                contact_address: employee?.contact_address || "",
              });
              setShowDetailsModal(true);
            }}
          >
            Edit Details
          </button>
        </Modal.Footer>
      </Modal>

      {/* Second Modal - Add Details */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="lg" scrollable>
        <Modal.Header className="py-2 px-3 text-[12px]" closeButton>
          <Modal.Title as="h6" className="text-lg">Add Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit} className="space-y-2 text-sm">
            {/* Section Header */}
            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-2 text-gray-500 text-xs font-medium uppercase tracking-wide">Account Contributions</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Contributions */}
            {["sss", "tin", "philhealth", "pagibig"].map((field) => (
              <Form.Group key={field} className="mb-1">
                <Form.Label className="text-xs capitalize">{field}</Form.Label>
                <Form.Control
                  name={field}
                  value={formData[field]}
                  placeholder={`Enter ${field.toUpperCase()}`}
                  onChange={handleChange}
                  className="text-[12px] h-8"
                />
              </Form.Group>
            ))}

            {/* Section Header */}
            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-2 text-gray-500 text-xs font-medium uppercase tracking-wide">Contact Information</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Contact Info */}
            {[
              { name: "contact_name", label: "Contact Name" },
              { name: "contact_number", label: "Contact Number" },
              { name: "contact_address", label: "Contact Address" },
            ].map(({ name, label }) => (
              <Form.Group key={name} className="mb-1">
                <Form.Label className="text-xs">{label}</Form.Label>
                <Form.Control
                  name={name}
                  value={formData[name]}
                  placeholder={`Enter ${label}`}
                  onChange={handleChange}
                  className="text-[12px] h-8"
                />
              </Form.Group>
            ))}

            {/* Section Header */}
            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-2 text-gray-500 text-xs font-medium uppercase tracking-wide">Profile Image</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Profile Image Upload */}
            <Form.Group className="mb-1">
              <Form.Label className="text-xs">Profile Image</Form.Label>
              <Form.Check
                type="checkbox"
                label="Remove background automatically"
                checked={removeBgProfile}
                onChange={(e) => setRemoveBgProfile(e.target.checked)}
                className="mb-1 text-xs text-neutral-600"
              />
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) =>
                  removeBgProfile
                    ? handleImageWithBackgroundRemoval(e, setImage1)
                    : handleImageChange(e, setImage1)
                }
                disabled={isProcessing}
                className="text-xs h-8"
              />
              {isProcessing && (
                <small className="text-info block mt-0.5">Processing image... Please wait.</small>
              )}
            </Form.Group>

            {/* Image Previews */}
            {(image1) && (
              <div className="mt-2 flex gap-4">
                {image1 && (
                  <img
                    src={URL.createObjectURL(image1)}
                    alt="Profile Preview"
                    className="w-28 h-auto rounded shadow"
                  />
                )}
              </div>
            )}

          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" type="submit" onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Save Changes'}
          </Button>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EmployeeIDCard;