import React, { useState } from "react";
import axios from "axios";

const AdminLounge = () => {
  const [formData, setFormData] = useState({
    position: "",
    name: "",
  });

  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file upload for signature
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/png", "image/jpeg"];
      if (!validTypes.includes(file.type)) {
        alert("Invalid file type. Please upload a JPEG or PNG file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB.");
        return;
      }
      setSignature(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataObj = new FormData();
    formDataObj.append("position", formData.position);
    formDataObj.append("name", formData.name);
    if (signature) formDataObj.append("signature", signature);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/add",
        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("Data added successfully!");
        setFormData({ position: "", name: "" });
        setSignature(null);
      } else {
        alert(response.data.error || "Failed to save data.");
      }
    } catch (error) {
      console.error("Error saving data:", error.response?.data || error);
      alert("An error occurred while saving the data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-6">Admin Lounge</h2>
      <form onSubmit={handleSubmit}>
        {/* Position Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Position
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="Enter Position"
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Name"
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Signature Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Signature
          </label>
          <input
            type="file"
            name="signature"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default AdminLounge;
