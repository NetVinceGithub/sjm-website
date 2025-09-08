import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Breadcrumb from "../dashboard/Breadcrumb";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AddNew = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Personal Information
    ecode: "",
    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "",
    completeName: "",
    positionTitle: "",
    project: "",
    department: "",
    areaSection: "",
    employmentRank: "",
    dateOfHire: "",
    employmentClassification: "",
    civilStatus: "",
    gender: "",
    birthdate: "",
    age: "",
    currentAddress: "",
    permanentAddress: "",
    contactNo: "",
    emailAddress: "",

    // Government ID
    governmentIdType: "",
    governmentIdNumber: "",
    customGovernmentIdType: "",

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactNumber: "",
    emergencyContactAddress: "",
    emergencyContactBirthplace: "",
    emergencyContactRelationship: "",
    emergencyContactReligion: "",

    // Compensation
    dailyRate: "",
    salaryPackage: "",

    // Training/Certification Dates
    medicalDate: "",
    healthCardDate: "",
    gmpDate: "",
    prpDate: "",
    housekeepingDate: "",
    safetyDate: "",
    crrDate: "",
    haccpDate: "",

    // Government Benefits
    sss: "",
    philHealth: "",
    pagIbig: "",
    tin: "",

    // Employment Status
    dateOfSeparation: "",
  });

  const [sameAsCurrent, setSameAsCurrent] = useState(false);
  const inputRefs = useRef({});

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
  };

  useEffect(() => {
    fetchNextEcode();
  }, []);

  const fetchNextEcode = async () => {
    try {
      const response = await apiClient.get("/employees/next-ecode");

      if (response.data.success) {
        setFormData((prev) => ({
          ...prev,
          ecode: response.data.data.ecode,
        }));
      }
    } catch (error) {
      console.error("Error fetching next ecode:", error);
      // Fallback to manual generation if API fails
      const generateEcode = () => {
        const baseCode = "M";
        const startingNumber = 2;
        const paddedNumber = String(startingNumber).padStart(5, "0");
        return baseCode + paddedNumber;
      };
      setFormData((prev) => ({
        ...prev,
        ecode: generateEcode(),
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "currentAddress" && sameAsCurrent
        ? { permanentAddress: value }
        : {}),
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  useEffect(() => {
    if (sameAsCurrent) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: prev.currentAddress,
      }));
    }
  }, [sameAsCurrent, formData.currentAddress]);

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const completeName = `${formData.firstName} ${
    formData.middleName ? formData.middleName.charAt(0) + "." : ""
  } ${formData.lastName}${
    formData.suffix ? ", " + formData.suffix : ""
  }`.trim();

  const govID = (() => {
    if (!formData.governmentIdNumber) return "";

    if (formData.governmentIdType === "other") {
      return formData.customGovernmentIdType
        ? `${formData.customGovernmentIdType} - ${formData.governmentIdNumber}`
        : formData.governmentIdNumber;
    }

    return formData.governmentIdType
      ? `${formData.governmentIdType} - ${formData.governmentIdNumber}`
      : formData.governmentIdNumber;
  })();

  const age = calculateAge(formData.birthdate);

  const handleKeyDown = (e, name) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const fields = [
        "ecode",
        "lastName",
        "firstName",
        "middleName",
        "suffix",
        "gender",
        "civilStatus",
        "birthdate",
        "contactNo",
        "emailAddress",
        "currentAddress",
        "permanentAddress",
        "positionTitle",
        "project",
        "department",
        "areaSection",
        "employmentRank",
        "employmentClassification",
        "dateOfHire",
        "dateOfSeparation",
        "tin",
        "governmentIdType",
        "governmentIdNumber",
        "customGovernmentIdType",
        "emergencyContactName",
        "emergencyContactNumber",
        "emergencyContactAddress",
        "emergencyContactBirthplace",
        "emergencyContactReligion",
        "emergencyContactRelationship",
        "dailyRate",
        "salaryPackage",
        "medicalDate",
        "healthCardDate",
        "gmpDate",
        "prpDate",
        "housekeepingDate",
        "safetyDate",
        "crrDate",
        "haccpDate",
        "sss",
        "philHealth",
        "pagIbig",
      ];
      const idx = fields.indexOf(name);
      if (idx >= 0 && idx < fields.length - 1) {
        const next = fields[idx + 1];
        inputRefs.current[next]?.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Prepare data to match backend expectations
      const submitData = {
        // Personal Information
        last_name: formData.lastName.trim(),
        first_name: formData.firstName.trim(),
        middle_name: formData.middleName.trim() || null,
        suffix: formData.suffix.trim() || null,
        complete_name: completeName.trim(),

        // Employment Information
        position_title: formData.positionTitle.trim(),
        project: formData.project.trim(),
        department: formData.department.trim(),
        area_section: formData.areaSection.trim(),
        employment_rank: formData.employmentRank,
        date_of_hire: formData.dateOfHire,
        employment_classification: formData.employmentClassification.trim(),

        // Personal Details
        civil_status: formData.civilStatus,
        gender: formData.gender,
        birthdate: formData.birthdate,
        current_address: formData.currentAddress.trim(),
        permanent_address: formData.permanentAddress.trim(),
        contact_no: formData.contactNo.trim(),
        email_address: formData.emailAddress.trim(),

        // Government ID
        government_id_type:
          formData.governmentIdType === "other"
            ? formData.customGovernmentIdType.trim() || null
            : formData.governmentIdType.trim() || null,
        government_id_number: formData.governmentIdNumber.trim() || null,

        // Emergency Contact
        emergency_contact_name: formData.emergencyContactName.trim() || null,
        emergency_contact_number:
          formData.emergencyContactNumber.trim() || null,
        emergency_contact_address:
          formData.emergencyContactAddress.trim() || null,
        emergency_contact_birthplace:
          formData.emergencyContactBirthplace.trim() || null,
        emergency_contact_relationship:
          formData.emergencyContactRelationship.trim() || null,
        emergency_contact_religion:
          formData.emergencyContactReligion.trim() || null,

        // Compensation
        daily_rate: parseFloat(formData.dailyRate) || 0,
        salary_package: parseFloat(formData.salaryPackage) || 0,

        // Training/Certification Dates
        medical_date: formData.medicalDate || null,
        health_card_date: formData.healthCardDate || null,
        gmp_date: formData.gmpDate || null,
        prp_date: formData.prpDate || null,
        housekeeping_date: formData.housekeepingDate || null,
        safety_date: formData.safetyDate || null,
        crr_date: formData.crrDate || null,
        haccp_date: formData.haccpDate || null,

        // Government Benefits
        sss: formData.sss.trim() || null,
        phil_health: formData.philHealth.trim() || null,
        pag_ibig: formData.pagIbig.trim() || null,
        tin: formData.tin.trim() || null,

        // Employment Status
        date_of_separation: formData.dateOfSeparation || null,
      };

      console.log("Submitting data:", submitData); // Debug log

      // Fix the API endpoint - remove '/api/employee' prefix since it's already in baseURL
      const response = await apiClient.post(
        "/api/employee/employees",
        submitData
      );

      if (response.data.success) {
        // Success! Show success message and reset form
        alert("Employee added successfully!");

        // Reset form to initial state
        setFormData({
          ecode: "",
          lastName: "",
          firstName: "",
          middleName: "",
          suffix: "",
          completeName: "",
          positionTitle: "",
          project: "",
          department: "",
          areaSection: "",
          employmentRank: "",
          dateOfHire: "",
          employmentClassification: "",
          civilStatus: "",
          gender: "",
          birthdate: "",
          age: "",
          currentAddress: "",
          permanentAddress: "",
          contactNo: "",
          emailAddress: "",
          governmentIdType: "",
          governmentIdNumber: "",
          customGovernmentIdType: "",
          emergencyContactName: "",
          emergencyContactNumber: "",
          emergencyContactAddress: "",
          emergencyContactBirthplace: "",
          emergencyContactRelationship: "",
          emergencyContactReligion: "",
          dailyRate: "",
          salaryPackage: "",
          medicalDate: "",
          healthCardDate: "",
          gmpDate: "",
          prpDate: "",
          housekeepingDate: "",
          safetyDate: "",
          crrDate: "",
          haccpDate: "",
          sss: "",
          philHealth: "",
          pagIbig: "",
          tin: "",
          dateOfSeparation: "",
        });

        // Fetch next employee code for next entry
        fetchNextEcode();
        setSameAsCurrent(false);

        // Optionally redirect to employee list
        // window.location.href = '/admin-dashboard/employees';
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      console.error("Error response:", error.response?.data);

      if (error.response && error.response.status === 422) {
        // Validation errors
        const backendErrors = error.response.data.errors || {};
        setErrors(backendErrors);

        // Scroll to first error field
        const firstErrorField = Object.keys(backendErrors)[0];
        if (firstErrorField && inputRefs.current[firstErrorField]) {
          inputRefs.current[firstErrorField].focus();
          inputRefs.current[firstErrorField].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        alert(
          `Please check the form for errors: ${
            error.response.data.message || "Validation failed"
          }`
        );
      } else if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else if (error.code === "ERR_NETWORK") {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (fieldName) => {
    return errors[fieldName] ? errors[fieldName][0] : "";
  };

  const hasError = (fieldName) => {
    return errors[fieldName] && errors[fieldName].length > 0;
  };

  return (
    <div className=" right-0 bottom-0  min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <Breadcrumb
        items={[
          { label: "Employee" },
          { label: "Masterlist", href: "/admin-dashboard/employees" },
          {
            label: "Add New Employee",
            href: "/admin-dashboard/employees/add-employee",
          },
        ]}
      />
      <div
        className="bg-white p-3 rounded-lg border-t-4 shadow-md mb-2 -mt-2 h-20"
        style={{ borderTopColor: "#974364" }}
      >
        <h2 className="text-sm font-medium text-neutralDGray mb-2 flex items-center gap-2">
          Add New Employee
        </h2>
        <p className="text-neutralDGray text-xs">
          Fill out the form below to add a new employee to the system. Double
          check the information for accuracy before submitting.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <div className="bg-white p-3 rounded-lg shadow-md mb-2">
          <div className="bg-red-50 px-2 rounded">
            <h3 className="text-sm  text-neutralDGray mb-3 flex items-center gap-2">
              Personal Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Ecode<span className="text-red-500">*</span>
              </label>
              <input
                name="ecode"
                value={formData.ecode}
                disabled
                className="w-full p-2 border text-xs border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Last Name<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["lastName"] = el)}
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "lastName")}
                placeholder="e.g. Doe, Smith"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("last_name") ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {hasError("last_name") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("last_name")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                First Name<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["firstName"] = el)}
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "firstName")}
                placeholder="e.g. John, Jane"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("first_name") ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {hasError("first_name") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("first_name")}
                </p>
              )}
            </div>
            <div className="grid grid-cols-[70%_30%] gap-3">
              {/* Middle Name */}
              <div>
                <label className="block text-xs font-medium text-neutralDGray mb-1">
                  Middle Name <span className="italic"> (Optional)</span>
                </label>
                <input
                  ref={(el) => (inputRefs.current["middleName"] = el)}
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, "middleName")}
                  placeholder="e.g. Santos"
                  className="w-full p-2 border text-xs border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutralDGray mb-1">
                  Suffix <span className="italic">(Opt.)</span>
                </label>
                <input
                  ref={(el) => (inputRefs.current["suffix"] = el)}
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, "suffix")}
                  placeholder="e.g. Jr."
                  className="w-[80%] p-2 border text-xs border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Complete Name<span className="text-red-500">*</span>
              </label>
              <input
                value={completeName}
                className="w-full p-2 border text-xs border-gray-300 rounded-md"
                disabled
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Gender<span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("gender") ? "border-red-500" : "border-gray-300"
                }`}
                required
                ref={(el) => (inputRefs.current["gender"] = el)}
                name="gender"
                value={formData["gender"]}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "gender")}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {hasError("gender") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("gender")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Civil Status<span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("civil_status")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
                ref={(el) => (inputRefs.current["civilStatus"] = el)}
                name="civilStatus"
                value={formData["civilStatus"]}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "civilStatus")}
              >
                <option value="">Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="widowed">Widowed</option>
                <option value="separated">Separated</option>
              </select>
              {hasError("civil_status") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("civil_status")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Birthdate<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["birthdate"] = el)}
                name="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "birthdate")}
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("birthdate") ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {hasError("birthdate") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("birthdate")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Age<span className="text-red-500">*</span>
              </label>
              <input
                value={age}
                className="w-full p-2 border text-xs border-gray-300 rounded-md"
                disabled
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Contact Number<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["contactNo"] = el)}
                name="contactNo"
                type="tel"
                value={formData.contactNo}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "contactNo")}
                placeholder="e.g. 09123456789"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("contact_no") ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {hasError("contact_no") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("contact_no")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Email Address<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["emailAddress"] = el)}
                name="emailAddress"
                type="email"
                value={formData.emailAddress}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "emailAddress")}
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("email_address")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="e.g. johndoe@example.com"
                required
              />
              {hasError("email_address") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("email_address")}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Current Address<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["currentAddress"] = el)}
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "currentAddress")}
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("current_address")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="e.g. 123 Main St, City, Country"
                required
              />
              {hasError("current_address") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("current_address")}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Permanent Address<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["permanentAddress"] = el)}
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "permanentAddress")}
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("permanent_address")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="e.g. 123 Main St, City, Country"
                required
              />
              {hasError("permanent_address") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("permanent_address")}
                </p>
              )}
              <label className="flex items-center mt-2 text-xs text-neutralDGray">
                <input
                  type="checkbox"
                  checked={sameAsCurrent}
                  onChange={(e) => setSameAsCurrent(e.target.checked)}
                  className="mr-1 h-3 w-3 rounded-full"
                />
                Same as Current Address
              </label>
            </div>
          </div>
        </div>

        {/* Employment Information Section */}
        <div className="bg-white p-3 rounded-lg shadow-md mb-2">
          <div className="bg-red-50 px-2 rounded">
            <h3 className="text-sm  text-neutralDGray mb-3 flex items-center gap-2">
              Employment Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Position Title<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["positionTitle"] = el)}
                name="positionTitle"
                value={formData.positionTitle}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "positionTitle")}
                placeholder="e.g. Software Engineer, Manager"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("position_title")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
              />
              {hasError("position_title") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("position_title")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Project<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["project"] = el)}
                name="project"
                value={formData.project}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "project")}
                placeholder="e.g. Jollibee, Inasal"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("project") ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {hasError("project") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("project")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Department<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["department"] = el)}
                name="department"
                value={formData.department}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "department")}
                placeholder="e.g. IT, HR"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("department") ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {hasError("department") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("department")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Area/Section<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["areaSection"] = el)}
                name="areaSection"
                value={formData.areaSection}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "areaSection")}
                placeholder="e.g. Kitchen, Office"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("area_section")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
              />
              {hasError("area_section") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("area_section")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Employment Rank<span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("employment_rank")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
                ref={(el) => (inputRefs.current["employmentRank"] = el)}
                name="employmentRank"
                value={formData["employmentRank"]}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "employmentRank")}
              >
                <option value="">Select</option>
                <option value="managerial">Managerial</option>
                <option value="managerial-staff">Managerial Staff</option>
                <option value="supervisory">Supervisory</option>
                <option value="rank-and-file">Rank and File</option>
              </select>
              {hasError("employment_rank") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("employment_rank")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Employment Classification<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) =>
                  (inputRefs.current["employmentClassification"] = el)
                }
                name="employmentClassification"
                value={formData.employmentClassification}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "employmentClassification")}
                placeholder="e.g. Regular, Probationary"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("employment_classification")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
              />
              {hasError("employment_classification") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("employment_classification")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Date of Hire<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["dateOfHire"] = el)}
                name="dateOfHire"
                type="date"
                value={formData.dateOfHire}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "dateOfHire")}
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("date_of_hire")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
              />
              {hasError("date_of_hire") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("date_of_hire")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Date of Separation
              </label>
              <input
                ref={(el) => (inputRefs.current["dateOfSeparation"] = el)}
                name="dateOfSeparation"
                type="date"
                value={formData.dateOfSeparation}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "dateOfSeparation")}
                className="w-full p-2 border text-xs border-gray-300 rounded-md"
              />
              <p className="text-xs text-neutralDGray italic">
                Leave blank if still employed.
              </p>
            </div>
          </div>
        </div>

        {/* Government ID Information Section */}
        <div className="bg-white p-3 rounded-lg shadow-md mb-2">
          <div className="bg-red-50 px-2 rounded">
            <h3 className="text-sm  text-neutralDGray mb-3 flex items-center gap-2">
              Government ID Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                TIN Number
              </label>
              <input
                ref={(el) => (inputRefs.current["tin"] = el)}
                name="tin"
                value={formData.tin}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "tin")}
                placeholder="e.g. 1234567890"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("tin") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {hasError("tin") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("tin")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                ID Type
              </label>
              <select
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("government_id_type")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                ref={(el) => (inputRefs.current["governmentIdType"] = el)}
                name="governmentIdType"
                value={formData["governmentIdType"]}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "governmentIdType")}
              >
                <option value="">Select</option>
                <option value="PhilSys ID">PhilSys ID (National ID)</option>
                <option value="Passport">Philippine Passport</option>
                <option value="Drivers License">Driver's License</option>
                <option value="UMID">Unified Multi-Purpose ID (UMID)</option>
                <option value="Postal ID">Postal ID</option>
                <option value="Voters ID">Voter's ID / Certification</option>
                <option value="PRC ID">PRC ID</option>
                <option value="Cedula">Cedula</option>
                <option value="other">Other</option>
              </select>
              {hasError("government_id_type") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("government_id_type")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                ID Number
              </label>
              <input
                ref={(el) => (inputRefs.current["governmentIdNumber"] = el)}
                name="governmentIdNumber"
                value={formData.governmentIdNumber}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "governmentIdNumber")}
                placeholder="e.g. 123456789"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("government_id_number")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {hasError("government_id_number") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("government_id_number")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Government ID<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["customGovernmentIdType"] = el)}
                name="customGovernmentIdType"
                value={
                  formData.governmentIdType === "other"
                    ? formData.customGovernmentIdType
                    : govID
                }
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "customGovernmentIdType")}
                placeholder={
                  formData.governmentIdType === "other"
                    ? "Enter custom ID type and number"
                    : govID
                }
                className={`w-full p-2 border text-xs rounded-md ${
                  formData.governmentIdType === "other"
                    ? "border-gray-300 bg-white"
                    : "border-gray-300 bg-gray-100"
                }`}
                disabled={formData.governmentIdType !== "other"}
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="bg-white p-3 rounded-lg shadow-md mb-2">
          <div className="bg-red-50 px-2 rounded">
            <h3 className="text-sm  text-neutralDGray mb-3 flex items-center gap-2">
              Emergency Contact Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Emergency Contact Name<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["emergencyContactName"] = el)}
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "emergencyContactName")}
                placeholder="e.g. Jane Doe"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("emergency_contact_name")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
              />
              {hasError("emergency_contact_name") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("emergency_contact_name")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Emergency Contact Number<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["emergencyContactNumber"] = el)}
                name="emergencyContactNumber"
                value={formData.emergencyContactNumber}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "emergencyContactNumber")}
                placeholder="e.g. 09123456789"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("emergency_contact_number")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
              />
              {hasError("emergency_contact_number") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("emergency_contact_number")}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Emergency Contact Address<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) =>
                  (inputRefs.current["emergencyContactAddress"] = el)
                }
                name="emergencyContactAddress"
                value={formData.emergencyContactAddress}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "emergencyContactAddress")}
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("emergency_contact_address")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="e.g. 123 Main St, City, Country"
                required
              />
              {hasError("emergency_contact_address") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("emergency_contact_address")}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Emergency Contact Birthplace
                <span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) =>
                  (inputRefs.current["emergencyContactBirthplace"] = el)
                }
                name="emergencyContactBirthplace"
                value={formData.emergencyContactBirthplace}
                onChange={handleChange}
                onKeyDown={(e) =>
                  handleKeyDown(e, "emergencyContactBirthplace")
                }
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("emergency_contact_birthplace")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="e.g. 123 Main St, City, Country"
                required
              />
              {hasError("emergency_contact_birthplace") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("emergency_contact_birthplace")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Emergency Contact Religion
                <span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) =>
                  (inputRefs.current["emergencyContactReligion"] = el)
                }
                name="emergencyContactReligion"
                value={formData.emergencyContactNumber}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "emergencyContactReligion")}
                placeholder="e.g. Christianity, Islam"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("emergency_contact_religion")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
              />
              {hasError("emergency_contact_religion") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("emergency_contact_religion")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Emergency Contact Relationship
                <span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) =>
                  (inputRefs.current["emergencyContactRelationship"] = el)
                }
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                onKeyDown={(e) =>
                  handleKeyDown(e, "emergencyContactRelationship")
                }
                placeholder="e.g. Father, Sister"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("emergency_contact_relationship")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
              />
              {hasError("emergency_contact_relationship") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("emergency_contact_relationship")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Compensation Section */}
        <div className="bg-white p-3 rounded-lg shadow-md mb-2">
          <div className="bg-red-50 px-2 rounded">
            <h3 className="text-sm  text-neutralDGray mb-3 flex items-center gap-2">
              Compensation Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Daily Rate<span className="text-red-500">*</span>
              </label>
              <input
                ref={(el) => (inputRefs.current["dailyRate"] = el)}
                name="dailyRate"
                value={formData.dailyRate}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "dailyRate")}
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 500"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("daily_rate") ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {hasError("daily_rate") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("daily_rate")}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Salary Package
              </label>
              <input
                ref={(el) => (inputRefs.current["salaryPackage"] = el)}
                name="salaryPackage"
                value={formData.salaryPackage}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "salaryPackage")}
                placeholder="e.g. 25000"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("salary_package")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                type="number"
                step="0.01"
                min="0"
              />
              {hasError("salary_package") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("salary_package")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Training & Certification Section */}
        <div className="bg-white p-3 rounded-lg shadow-md mb-2">
          <div className="bg-red-50 px-2 rounded">
            <h3 className="text-sm  text-neutralDGray mb-3 flex items-center gap-2">
              Training & Certification Dates
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Medical
              </label>
              <input
                ref={(el) => (inputRefs.current["medicalDate"] = el)}
                name="medicalDate"
                type="date"
                value={formData.medicalDate}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "medicalDate")}
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("medical_date")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {hasError("medical_date") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("medical_date")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Health Card
              </label>
              <input
                ref={(el) => (inputRefs.current["healthCardDate"] = el)}
                name="healthCardDate"
                type="date"
                value={formData.healthCardDate}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "healthCardDate")}
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("health_card_date")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {hasError("health_card_date") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("health_card_date")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                GMP
              </label>
              <input
                ref={(el) => (inputRefs.current["gmpDate"] = el)}
                name="gmpDate"
                type="date"
                value={formData.gmpDate}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "gmpDate")}
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("gmp_date") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {hasError("gmp_date") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("gmp_date")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                PRP
              </label>
              <input
                ref={(el) => (inputRefs.current["prpDate"] = el)}
                name="prpDate"
                type="date"
                value={formData.prpDate}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "prpDate")}
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("prp_date") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {hasError("prp_date") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("prp_date")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Housekeeping
              </label>
              <input
                ref={(el) => (inputRefs.current["housekeepingDate"] = el)}
                name="housekeepingDate"
                type="date"
                value={formData.housekeepingDate}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "housekeepingDate")}
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("housekeeping_date")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {hasError("housekeeping_date") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("housekeeping_date")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Safety
              </label>
              <input
                ref={(el) => (inputRefs.current["safetyDate"] = el)}
                name="safetyDate"
                type="date"
                value={formData.safetyDate}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "safetyDate")}
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("safety_date") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {hasError("safety_date") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("safety_date")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                CRR/Compensation & Benefits
              </label>
              <input
                ref={(el) => (inputRefs.current["crrDate"] = el)}
                name="crrDate"
                type="date"
                value={formData.crrDate}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "crrDate")}
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("crr_date") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {hasError("crr_date") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("crr_date")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                HACCP
              </label>
              <input
                ref={(el) => (inputRefs.current["haccpDate"] = el)}
                name="haccpDate"
                type="date"
                value={formData.haccpDate}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "haccpDate")}
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("crr_date") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {hasError("haccp_date") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("haccp_date")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Government Benefits Section */}
        <div className="bg-white p-3 rounded-lg shadow-md mb-2">
          <div className="bg-red-50 px-2 rounded">
            <h3 className="text-sm  text-neutralDGray mb-3 flex items-center gap-2">
              Government Benefits Section
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                SSS Number
              </label>
              <input
                ref={(el) => (inputRefs.current["sss"] = el)}
                name="sss"
                value={formData.sss}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "sss")}
                placeholder="e.g. 1234567890"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("sss") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {hasError("sss") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("sss")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                PhilHealth Number
              </label>
              <input
                ref={(el) => (inputRefs.current["philHealth"] = el)}
                name="philHealth"
                value={formData.philHealth}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "philHealth")}
                placeholder="e.g. 1234567890"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("phil_health") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {hasError("phil_health") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("phil_health")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Pag-IBIG Number
              </label>
              <input
                ref={(el) => (inputRefs.current["pagIbig"] = el)}
                name="pagIbig"
                value={formData.pagIbig}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "pagIbig")}
                placeholder="e.g. 1234567890"
                className={`w-full p-2 border text-xs rounded-md ${
                  hasError("pag_ibig") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {hasError("pag_ibig") && (
                <p className="text-red-500 text-xs mt-1">
                  {getErrorMessage("pag_ibig")}
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-[#974364] hover:bg-[#5f263d] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Adding Employee...
            </>
          ) : (
            "Add Employee"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddNew;
