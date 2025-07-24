import React, { useState, useEffect } from "react";
import { FaUserPlus } from "react-icons/fa";
import axios from "axios";
import { MdBlock } from "react-icons/md";

const AddAdmin = () => {
  const [userRole, setUserRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const role = localStorage.getItem("userRole"); // Get user role from localStorage
  const isApprover = role === "approver";
  const isAdmin = role === "admin";
  const isHr = role === "hr";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // For Editing
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "admin",
  });

  useEffect(() => {
    const checkUserRole = async () => {
      const token = localStorage.getItem("token"); // Make sure token is stored in localStorage
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        const userResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/current`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // 🔥 This is crucial
            },
          }
        );

        const currentUserRole = userResponse.data.user.role;
        setUserRole(currentUserRole);

        if (currentUserRole === "approver") {
          setIsAuthorized(true);
          // Fetch users here if needed
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error checking authorization:", error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/get-users`
        );
        console.log(response.data);
        setUsers(response.data.users);
      } catch (error) {
        console.error(error);
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
        `${import.meta.env.VITE_API_URL}/api/users/add`,
        formData
      );
      if (response.data.success) {
        setFormData({ name: "", email: "", password: "", role: "admin" });
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
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/block`,
        {
          userId,
        }
      );
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
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/unblock`,
        {
          userId,
        }
      );
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
    setEditFormData({ name: "", email: "", role: "employee" });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${editingUser}`,
        editFormData
      );
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

  if (loading) {
    return (
      <div className="p-6 h-[calc(100vh-150px)] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="p-6 h-[calc(100vh-150px)] flex items-center justify-center">
        <div className="text-center border p-3 -mt-12 rounded-lg shadow-lg">
          <h2 className="text-base text-red-600">Access Denied</h2>
          <p className="text-sm text-neutralDGray">
            You don't have permission to access this page.
          </p>
          <p className="text-xs italic text-gray-500 -mt-2">
            Only approvers can manage user accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 -mt-5">
      <div className="h-[calc(100vh-100px)]">
        {/* Parent Grid Container */}
        <div className="parent grid grid-cols-4 grid-rows-7 gap-2 h-full">
          {/* Div1 - Add Employee Form */}
          <div className="div1 col-span-4 row-span-4 border rounded bg-white shadow p-3 h-[100%]">
            <h2 className="text-lg font-bold mb-3 flex text-gray-700 items-center gap-2">
              <FaUserPlus className="h-6 w-6 text-gray-700" /> Add Employee
              Access
            </h2>
            <form className="space-y-0.5 h-[100%]" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employee Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md text-sm"
                  placeholder="e.g., Jane Smith"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md text-sm"
                  placeholder="e.g., jane.smith@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md text-sm"
                  placeholder="Create a password"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 mb-2 p-2 w-full border rounded-md text-sm"
                  required
                >
                  <option value="" disabled>
                    Select a Role
                  </option>
                  <option value="approver">Approver</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="text-sm w-full hover:bg-green-400 h-10 hover:text-white text-gray-700 border transition-all duration-300 py-2 px-4 rounded"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Employee"}
                </button>
              </div>
            </form>
          </div>

          {/* Div2 - Active Users */}
          <div className="div2 col-span-2 row-span-3 row-start-5 border bg-white shadow rounded p-3">
            <h4 className="text-sm mb-2 text-green-600 font-semibold">
              Active Users
            </h4>
            <div className="overflow-y-auto h-full">
              {loading ? (
                <p className="text-sm text-gray-500">Loading users...</p>
              ) : (
                <ul className="space-y-2">
                  {users
                    .filter((user) => !user.isBlocked)
                    .map((user, index) => (
                      <li key={index} className="border-b pb-2 last:border-b-0">
                        {editingUser === user.id ? (
                          <div className="bg-gray-100 p-2 rounded">
                            <h6 className="text-xs text-gray-700 font-semibold mb-2">
                              Edit User
                            </h6>
                            <form
                              onSubmit={handleEditSubmit}
                              className="space-y-2"
                            >
                              <input
                                type="text"
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditChange}
                                className="border p-1 rounded text-xs w-full"
                              />
                              <input
                                type="email"
                                name="email"
                                value={editFormData.email}
                                onChange={handleEditChange}
                                className="border p-1 rounded text-xs w-full"
                              />
                              <select
                                name="role"
                                value={editFormData.role}
                                onChange={handleEditChange}
                                className="border p-1 rounded text-xs w-full"
                              >
                                <option value="approver">Approver</option>
                                <option value="hr">HR</option>
                                <option value="admin">Admin</option>
                              </select>
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  className="hover:bg-green-300 flex-1 h-10 border hover:text-white px-2 py-1 rounded text-xs"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="border flex-1 h-10 hover:bg-gray-300 hover:text-white px-2 py-1 rounded text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div className="text-sm space-y-0.5">
                              <span className="font-bold">{user.name}</span>
                              <br />
                              <span className="text-gray-600 italic text-xs">
                                {user.email}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => startEdit(user)}
                                className="bg-green-500 h-10 w-20 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleBlock(user.id)}
                                className="bg-red-500 h-10 w-20 hover:bg-red-600 text-white flex text-center items-center justify-center p-1 rounded"
                              >
                                <MdBlock className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          {/* Div3 - Blocked Users */}
          <div className="div3 col-span-2 row-span-3 col-start-3 row-start-5 border shadow rounded p-3 bg-white">
            <h4 className="text-sm mb-2 text-red-600 font-semibold">
              Blocked Users
            </h4>
            <div className="overflow-y-auto h-full">
              <ul className="space-y-2">
                {users
                  .filter((user) => user.isBlocked)
                  .map((user, index) => (
                    <li
                      key={index}
                      className="border-b pb-2 last:border-b-0 flex justify-between items-center"
                    >
                      <div className="text-xs text-gray-700">
                        <span className="font-bold text-sm">{user.name}</span>
                        <br />
                        <span className="text-gray-600 italic text-xs">
                          {user.email}
                        </span>
                      </div>
                      <button
                        onClick={() => handleUnblock(user.id)}
                        className="bg-white w-20 h-10 hover:bg-red-500 hover:text-white border border-red-300 text-red-600 px-2 py-1 rounded text-xs transition-colors duration-200"
                      >
                        Unblock
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdmin;
