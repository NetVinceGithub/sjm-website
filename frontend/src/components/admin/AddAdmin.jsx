import React, { useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import axios from "axios";

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee", // ✅ Default role must match allowed values
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/users/add", formData);

      if (response.data.success) {
        alert("✅ User added successfully!");
        setFormData({ name: "", email: "", password: "", role: "employee" }); // ✅ Reset form
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
    <div className="bg-white p-6 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-6 flex text-neutralDGray items-center gap-2">
        <FaUserPlus className="h-8 w-8 text-neutralDGray" /> Add Admin
        </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-neutralDGray">Employee Name</label>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "Enter name")}
                className="mt-1 p-2 w-full border rounded-md"
                placeholder="Enter name"
                required
            />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutralDGray">Company Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "Enter email")}
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter email"
            required
            />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutralDGray">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "Enter password")}
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter password"
            required
            />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutralDGray">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 mb-9 p-2 w-full border rounded-md"
          >
            <option value="admin">Admin</option>
            <option value="employee">Employee</option> {/* ✅ Allowed values */}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-brandPrimary hover:bg-neutralDGray text-white py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add User"}
        </button>
      </form>
    </div>
  );
};

export default AddAdmin;
