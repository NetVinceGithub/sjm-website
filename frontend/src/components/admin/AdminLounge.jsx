import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLounge = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee", // ✅ Default role must match allowed values
  });

  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/payslip/pending-requests");
        setRequests(response.data || []);
      } catch (error) {
        console.error("Error fetching payroll requests:", error);
      }
    };

    fetchRequests();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleApproveRelease = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/payslip/release-payroll");

      if (response.data.success) {
        alert("✅ Payroll successfully released!");
        setRequests([]);
      } else {
        alert("❌ Failed to release payroll. " + response.data.message);
      }
    } catch (error) {
      console.error("❌ Error releasing payroll:", error.response?.data || error);
      alert("❌ An error occurred: " + (error.response?.data?.error || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting user:", formData); // ✅ Debugging log to check role

      const response = await axios.post("http://localhost:5000/api/users/add", formData);

      if (response.data.success) {
        alert("✅ User added successfully!");
        setFormData({ name: "", email: "", password: "", role: "employee" }); // ✅ Reset with valid default role
      } else {
        alert(response.data.error || "❌ Failed to save user.");
      }
    } catch (error) {
      console.error("Error saving user:", error.response?.data || error);
      alert("❌ An error occurred while saving the user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-6">Admin Lounge</h2>
      <button
        onClick={handleApproveRelease}
        disabled={requests.length === 0}
        className={`mb-4 w-full px-4 py-2 rounded ${
          requests.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        Approve Payroll Release
      </button>
      <div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Enter name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Enter email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Enter password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md"
            >
              <option value="admin">Admin</option>
              <option value="employee">Employee</option> {/* ✅ Allowed values */}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLounge;
