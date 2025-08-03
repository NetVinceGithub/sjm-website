import React, { useState, useEffect, useRef } from "react";
import Breadcrumb from "../dashboard/Breadcrumb";

const AddNew = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    ecode: "",
    lastName: "",
    firstName: "",
    middleName: "",
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

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactNumber: "",
    emergencyContactAddress: "",

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    const generateEcode = () => {
      const baseCode = "M";
      const startingNumber = 2;
      const paddedNumber = String(startingNumber).padStart(5, "0"); // 00002
      return baseCode + paddedNumber;
    };

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "currentAddress" && sameAsCurrent
        ? { permanentAddress: value }
        : {}),
      ecode: generateEcode(),
    }));
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
  } ${formData.lastName}`.trim();

  const govID =
    formData.governmentIdType && formData.governmentIdNumber
      ? `${formData.governmentIdType} - ${formData.governmentIdNumber}`
      : "";

  const age = calculateAge(formData.birthdate);

  const handleKeyDown = (e, name) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const fields = [
        "ecode",
        "lastName",
        "firstName",
        "middleName",
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
        "dateOfHire",
        "employmentClassification",
        "dateOfSeparation",
        "governmentIdType",
        "governmentIdNumber",
        "emergencyContactName",
        "emergencyContactNumber",
        "emergencyContactAddress",
        "dailyRate",
        "salaryPackage",
        "medicalDate",
        "healthCardDate",
        "gmpDate",
        "prpDate",
        "housekeepingDate",
        "safetyDate",
        "crrDate",
        "sss",
        "philHealth",
        "pagIbig",
        "tin",
      ];
      const idx = fields.indexOf(name);
      if (idx >= 0 && idx < fields.length - 1) {
        const next = fields[idx + 1];
        inputRefs.current[next]?.focus();
      }
    }
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
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
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
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
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
              placeholder="e.g. Doe, Smith"
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
            />
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
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
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
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Civil Status<span className="text-red-500">*</span>
            </label>
            <select
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
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
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
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
              type="number"
              value={formData.contactNo}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "contactNo")}
              placeholder="e.g. 09123456789"
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
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
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              placeholder="e.g. johndoe@example.com"
              required
            />
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
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              placeholder="e.g. 123 Main St, City, Country"
              required
            />
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
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              placeholder="e.g. 123 Main St, City, Country"
              required
            />
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
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
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
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
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
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
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
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Employment Rank<span className="text-red-500">*</span>
            </label>
            <select
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
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
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Employment Classification<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["employmentClassification"] = el)}
              name="employmentClassification"
              value={formData.employmentClassification}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "employmentClassification")}
              placeholder="e.g. Regular, Probationary"
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
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
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Date of Separation
            </label>
            <input
              ref={(el) => (inputRefs.current["dateOfHire"] = el)}
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
              ID Type<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["governmentIdType"] = el)}
              name="governmentIdType"
              value={formData.governmentIdType}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "governmentIdType")}
              placeholder="e.g. Passport, SSS ID"
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              ID Number<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["governmentIdNumber"] = el)}
              name="governmentIdNumber"
              value={formData.governmentIdNumber}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "governmentIdNumber")}
              placeholder="e.g. 123456789"
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Government ID<span className="text-red-500">*</span>
            </label>
            <input
              value={govID}
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              disabled
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
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
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
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Emergency Contact Address<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["permanentAddress"] = el)}
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "permanentAddress")}
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              placeholder="e.g. 123 Main St, City, Country"
              required
            />
            <label className="flex items-center mt-2 text-xs text-neutralDGray">
              <input
                type="checkbox"
                checked={sameAsCurrent}
                onChange={(e) => setSameAsCurrent(e.target.checked)}
                className="mr-1 h-3 w-3 rounded-full"
              />
              Same as Personal Address
            </label>
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
              placeholder="e.g. 500"
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Salary Package<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["salaryPackage"] = el)}
              name="salaryPackage"
              value={formData.salaryPackage}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "salaryPackage")}
              placeholder="e.g. 25000"
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              type="number"
              required
            />
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
              Medical<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["medicalDate"] = el)}
              name="medicalDate"
              type="date"
              value={formData.medicalDate}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "medicalDate")}
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Health Card<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["healthCardDate"] = el)}
              name="healthCardDate"
              type="date"
              value={formData.healthCardDate}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "healthCardDate")}
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              GMP<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["gmpDate"] = el)}
              name="gmpDate"
              type="date"
              value={formData.gmpDate}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "gmpDate")}
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              PRP<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["prpDate"] = el)}
              name="prpDate"
              type="date"
              value={formData.prpDate}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "prpDate")}
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Housekeeping<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["housekeepingDate"] = el)}
              name="housekeepingDate"
              type="date"
              value={formData.housekeepingDate}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "housekeepingDate")}
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Safety<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["safetyDate"] = el)}
              name="safetyDate"
              type="date"
              value={formData.safetyDate}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "safetyDate")}
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              CRR<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["crrDate"] = el)}
              name="crrDate"
              type="date"
              value={formData.crrDate}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "crrDate")}
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              SSS Number<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["sss"] = el)}
              name="sss"
              value={formData.sss}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "sss")}
              type="number"
              placeholder="e.g. 1234567890"
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              PhilHealth Number<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["philHealth"] = el)}
              name="philHealth"
              value={formData.philHealth}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "philHealth")}
              placeholder="e.g. 1234567890"
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              type="number"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              Pag-IBIG Number<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["pagIbig"] = el)}
              name="pagIbig"
              value={formData.pagIbig}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "pagIbig")}
              type="number"
              placeholder="e.g. 1234567890"
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutralDGray mb-1">
              TIN Number<span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => (inputRefs.current["tin"] = el)}
              name="tin"
              value={formData.tin}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "tin")}
              placeholder="e.g. 1234567890"
              className="w-full p-2 border text-xs border-gray-300 rounded-md"
              type="number"
              required
            />
          </div>
        </div>
      </div>

      <button
        className="w-full h-10 bg-[#974364] hover:bg-[#5f263d] disabled:bg-blue-400 text-white text-sm py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        onClick={() => alert(JSON.stringify(formData))}
      >
        Add Employee
      </button>
    </div>
  );
};

export default AddNew;