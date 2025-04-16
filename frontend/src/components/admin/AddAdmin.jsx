import React, { useState, useEffect } from "react";
import { FaUserPlus } from "react-icons/fa";
import axios from "axios";
import { MdBlock } from "react-icons/md";

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // For Editing
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
  });

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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
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
        setFormData({ name: "", email: "", password: "", role: "employee" });
        setUsers((prevUsers) => [...prevUsers, response.data.user]);
      }
    } catch (error) {
      console.error("Error saving user:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (userId) => {
    try {
      const response = await axios.post("http://localhost:5000/api/users/block", {
        userId,
      });
      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, isBlocked: true } : user
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      const response = await axios.post("http://localhost:5000/api/users/unblock", {
        userId,
      });
      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, isBlocked: false } : user
          )
        );
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  const startEdit = (user) => {
    setEditingUser(user.id);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditFormData({ name: '', email: '', role: 'employee' });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/api/users/${editingUser}`, editFormData);
      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === editingUser ? { ...user, ...editFormData } : user
          )
        );
        cancelEdit();
      }
    } catch (error) {
      console.error("Error updating user:", error.response?.data || error);
    }
  };

  return (
    <div className="p-6 h-[33rem] bg-white rounded shadow-sm">
      <h3 className="text-neutralDGray text-lg font-semibold -mt-3">Current Users</h3>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length > 0 ? (
        <>
          {/* Active Users */}
          <h4 className="font-semibold mt-2 text-brandPrimary">Active Users</h4>
          <ul className="border rounded-md p-1 mb-4">
            {users
              .filter((user) => !user.isBlocked)
              .map((user, index) => (
                <li
                  key={index}
                  className="py-2 border-b last:border-b-0 px-2"
                >
                  {editingUser === user.id ? (
                    <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        className="border p-1 rounded"
                      />
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditChange}
                        className="border p-1 rounded"
                      />
                      <select
                        name="role"
                        value={editFormData.role}
                        onChange={handleEditChange}
                        className="border p-1 rounded"
                      >
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-green-500 text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="bg-gray-300 text-black px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold">{user.name}</span> - {user.email}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEdit(user)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleBlock(user.id)}
                          className="text-neutralDGray hover:text-red-500"
                        >
                          <MdBlock size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
          </ul>

          {/* Blocked Users */}
          <h4 className="font-semibold text-red-600">Blocked Users</h4>
          <ul className="border rounded-md p-1 bg-red-50">
            {users
              .filter((user) => user.isBlocked)
              .map((user, index) => (
                <li
                  key={index}
                  className="py-2 border-b last:border-b-0 px-2 flex justify-between items-center text-red-600"
                >
                  <div>
                    <span className="font-bold">{user.name}</span> - {user.email}
                  </div>
                  <button
                    onClick={() => handleUnblock(user.id)}
                    className="text-sm bg-white text-red-600 border border-red-300 px-3 py-1 rounded hover:bg-red-100"
                  >
                    Unblock
                  </button>
                </li>
              ))}
          </ul>
        </>
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
