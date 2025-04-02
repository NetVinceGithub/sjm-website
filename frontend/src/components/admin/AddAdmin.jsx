import React, { useState, useEffect } from "react";
import { FaUserPlus } from "react-icons/fa";
import axios from "axios";

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/get-users"
        );
        if (response.data.success) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/add",
        formData
      );
      if (response.data.success) {
        alert("✅ User added successfully!");
        setFormData({ name: "", email: "", password: "", role: "employee" });
        setUsers((prevUsers) => [...prevUsers, response.data.user]); // Add new user to the list
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
    <div className="p-6 h-[33rem] bg-white rounded shadow-sm">
      {/* ✅ Display Users */}
      <h3 className=" text-neutralDGray text-lg font-semibold -mt-3">
        Current user:
      </h3>
      {loading ? (
        <p>Loading users...</p>
      ) : users.length > 0 ? (
        <ul className="mt-2 border rounded-md p-1">
          {users.map((user, index) => (
            <li key={index} className="py-2 border-b last:border-b-0">
              <span className="text-neutralDGray font-bold ml-3">
                {user.name}
              </span>{" "}
              - {user.email}
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found.</p>
      )}
      <h2 className="text-lg font-bold mb-3 mt-2 flex text-neutralDGray items-center gap-2">
        <FaUserPlus className="h-6 w-6 text-neutralDGray" /> Add Admin
      </h2>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm -mt-1 font-medium text-neutralDGray">
            Employee Name
          </label>
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
          <label className="block text-sm font-medium text-neutralDGray">
            Company Email
          </label>
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
          <label className="block text-sm font-medium text-neutralDGray">
            Password
          </label>
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
          <label className="block text-sm font-medium text-neutralDGray">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 mb-1 p-2 w-full border rounded-md"
          >
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="w-[20%] bg-brandPrimary h-11 hover:bg-neutralDGray text-white py-1 px-3 rounded"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add "}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAdmin;
