import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  FileText,
} from "lucide-react";
import Breadcrumb from "../dashboard/Breadcrumb";
import { href } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
export default function AddClientForm() {
  function getNextClientCode(lastCode = "MCL00000") {
    const nextNumber = parseInt(lastCode.slice(3)) + 1;
    return "MCL" + String(nextNumber).padStart(5, "0");
  }

  const [formData, setFormData] = useState({
    clientCode: getNextClientCode(),
    clientName: "",
    address: "",
    contactPerson: "",
    email: "",
    phone: "",
    joinDate: "",
    expiryDate: "",
    billingFrequency: "",
    remarks: "",
    tin: "",
  });

  const [errors, setErrors] = useState({});

const { user } = useAuth();

  // Create refs for all input fields in order
  const inputRefs = {
    clientName: useRef(null),
    address: useRef(null),
    tin: useRef(null),
    contactPerson: useRef(null),
    phone: useRef(null),
    email: useRef(null),
    joinDate: useRef(null),
    expiryDate: useRef(null),
    billingFrequency: useRef(null),
    remarks: useRef(null),
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClientCode, setIsLoadingClientCode] = useState(false);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  }

  // Define the order of fields for navigation
  const fieldOrder = [
    "clientName",
    "address",
    "tin",
    "contactPerson",
    "phone",
    "email",
    "joinDate",
    "expiryDate",
    "billingFrequency",
    "remarks",
  ];

  const handleKeyDown = (e, currentField) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const currentIndex = fieldOrder.indexOf(currentField);
      const nextIndex = currentIndex + 1;

      if (nextIndex < fieldOrder.length) {
        const nextField = fieldOrder[nextIndex];
        inputRefs[nextField].current?.focus();
      } else {
        // If it's the last field, submit the form
        handleSubmit();
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = "Client/Business name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.joinDate) {
      newErrors.joinDate = "Contract effectivity date is required";
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = "Contract expiry date is required";
    }

    if (!formData.billingFrequency) {
      newErrors.billingFrequency = "Billing frequency is required";
    }

    if (!formData.tin.trim()) {
      newErrors.tin = "TIN is required";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const apiData = {
          client_name: formData.clientName,
          address: formData.address,
          tin: formData.tin,
          contact_person: formData.contactPerson,
          phone: formData.phone,
          email: formData.email,
          join_date: formData.joinDate,
          expiry_date: formData.expiryDate,
          billing_frequency: formData.billingFrequency,
          remarks: formData.remarks || null,
        };

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/clients/add`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData),
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          alert("Client added successfully!");
          
          setFormData({
            clientCode: "",
            clientName: "",
            address: "",
            contactPerson: "",
            email: "",
            phone: "",
            joinDate: "",
            expiryDate: "",
            billingFrequency: "",
            remarks: "",
            tin: "",
          });

          await fetchNextClientCode();
          inputRefs.clientName.current?.focus();
        } else {
          if (result.errors) {
            const apiErrors = {};
            Object.keys(result.errors).forEach(key => {
              const fieldMap = {
                'client_name': 'clientName',
                'contact_person': 'contactPerson',
                'join_date': 'joinDate',
                'expiry_date': 'expiryDate',
                'billing_frequency': 'billingFrequency',
              };
              const formField = fieldMap[key] || key;
              apiErrors[formField] = result.errors[key][0];
            });
            setErrors(apiErrors);
          } else {
            alert(result.message || "Failed to add client. Please try again.");
          }
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        alert("Network error. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
      const firstErrorField = fieldOrder.find((field) => newErrors[field]);
      if (firstErrorField) {
        inputRefs[firstErrorField].current?.focus();
      }
    }
  };


  const today = new Date().toISOString().split("T")[0];



const fetchNextClientCode = async () => {
  setIsLoadingClientCode(true);
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/clients/next-code`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        clientCode: data.data.client_code
      }));
    }
  } catch (error) {
    console.error('Error fetching client code:', error);
    setFormData(prev => ({
      ...prev,
      clientCode: getNextClientCode()
    }));
  } finally {
    setIsLoadingClientCode(false);
  }
};


useEffect(() => {
  fetchNextClientCode();
}, []);

  return (
    <div className=" right-0 bottom-0  min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <Breadcrumb
        items={[
          { label: "Clients" },
          { label: "Masterlist", href: "/admin-dashboard/client-list" },
          { label: "Add Client", href: "/admin-dashboard/client/add-client" },
        ]}
      />

      <div
        className="bg-white p-3 rounded-lg border-t-4 shadow-md mb-2 -mt-2 h-20"
        style={{ borderTopColor: "#974364" }}
      >
        <h2 className="text-sm font-medium text-neutralDGray mb-2 flex items-center gap-2">
          Add New Client
        </h2>
        <p className="text-neutralDGray text-xs">
          Fill out the form below to add a new client to the system. Double
          check the information for accuracy before submitting. Press Enter to
          move to the next field.
        </p>
      </div>

      {/* Client Information */}
      <div className="bg-white p-3 rounded-lg shadow-md mb-2">
        <div className="bg-red-50 px-2 rounded">
          <h3 className="text-sm  text-neutralDGray mb-3 flex items-center gap-2">
            Client Information
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Client Code<span className="text-red-500">*</span>
            </label>
            <input
              name="clientCode"
              value={formData.clientCode}
              disabled
              className="w-full p-2 border text-xs border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Client Name<span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRefs.clientName}
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "clientName")}
              className={`w-full p-2 border text-xs border-gray-300 rounded-md ${
                errors.clientName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter client or business name"
            />
            {errors.clientName && (
              <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Site Location<span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRefs.address}
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "address")}
              placeholder="Enter complete address"
              className={`w-full p-2 border text-xs border-gray-300 rounded-md ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Tax Identification Number (TIN)
              <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRefs.tin}
              type="text"
              id="tin"
              name="tin"
              value={formData.tin}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "tin")}
              className={`w-full p-2 border text-xs border-gray-300 rounded-md ${
                errors.tin ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter TIN number"
            />
            {errors.tin && (
              <p className="mt-1 text-sm text-red-600">{errors.tin}</p>
            )}
          </div>
        </div>
      </div>

      {/* Client Contact Information */}
      <div className="bg-white p-3 rounded-lg shadow-md mb-2">
        <div className="bg-red-50 px-2 rounded">
          <h3 className="text-sm  text-neutralDGray mb-3 flex items-center gap-2">
            Contact Information
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Contact Person<span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRefs.contactPerson}
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "contactPerson")}
              className={`w-full p-2 border text-xs border-gray-300 rounded-md ${
                errors.contactPerson ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter contact person's name"
            />
            {errors.contactPerson && (
              <p className="mt-1 text-sm text-red-600">
                {errors.contactPerson}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Contact Number<span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRefs.phone}
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "phone")}
              className={`w-full p-2 border text-xs border-gray-300 rounded-md ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="09XX-XXX-XXXX"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Email Address<span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRefs.email}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "email")}
              className={`w-full p-2 border text-xs border-gray-300 rounded-md ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="example@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Partnership Information */}
      <div className="bg-white p-3 rounded-lg shadow-md mb-2">
        <div className="bg-red-50 px-2 rounded">
          <h3 className="text-sm  text-neutralDGray mb-3 flex items-center gap-2">
            Partnership Information
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Contract Effectivity Date<span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRefs.joinDate}
              type="date"
              id="joinDate"
              name="joinDate"
              value={formData.joinDate}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "joinDate")}
              max={today}
              className={`w-full p-2 border text-xs border-gray-300 rounded-md ${
                errors.joinDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.joinDate && (
              <p className="mt-1 text-sm text-red-600">{errors.joinDate}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Contract Expiry Date<span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRefs.expiryDate}
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "expiryDate")}
              max={today}
              className={`w-full p-2 border text-xs border-gray-300 rounded-md ${
                errors.expiryDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Billing Frequency<span className="text-red-500">*</span>
            </label>
            <select
              ref={inputRefs.billingFrequency}
              className={`w-full p-2 border text-xs border-gray-300 rounded-md ${
                errors.billingFrequency ? "border-red-500" : "border-gray-300"
              }`}
              required
              id="billingFrequency"
              name="billingFrequency"
              value={formData.billingFrequency}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "billingFrequency")}
            >
              <option value="">Select</option>
              <option value="monthly">Monthly</option>
              <option value="semi-monthly">Semi-Monthly</option>
            </select>
            {errors.billingFrequency && (
              <p className="mt-1 text-sm text-red-600">
                {errors.billingFrequency}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="bg-white p-3 rounded-lg shadow-md mb-2">
        <div className="bg-red-50 px-2 rounded">
          <h3 className="text-sm  text-neutralDGray mb-3 flex items-center gap-2">
            Remarks
          </h3>
        </div>
        <div>
          <textarea
            ref={inputRefs.remarks}
            name="remarks"
            id="remarks"
            value={formData.remarks}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, "remarks")}
            rows="2"
            placeholder="Enter any additional remarks or notes about the client"
            className="w-full p-2 border text-xs border-gray-300 rounded-md"
          ></textarea>
        </div>
      </div>

      {/* Submit Buttons */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className={`w-full h-10 ${
          isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-[#974364] hover:bg-[#5f263d]'
        } disabled:bg-blue-400 text-white text-sm py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2`}
      >
        {isLoading ? 'Adding Client...' : 'Add Client'}
      </button>

    </div>
  );
}