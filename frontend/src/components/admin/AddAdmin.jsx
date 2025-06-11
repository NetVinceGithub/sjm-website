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
    role: "admin",
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
       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/get-users`);
       console.log(response.data);
       setUsers(response.data.users);
        } 
     catch(error){
      console.error(error);
     }
   }
  
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
      console.error("Error saving user:", error.response ?.data || error);
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
      console.error("Error updating user:", error.response ?.data || error);
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
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
          <p className="text-neutralDGray">You don't have permission to access this page.</p>
          <p className="text-sm italic text-gray-500 -mt-2">Only approvers can manage user accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6  h-[calc(100vh-150px)] overflow-auto">
      <div className="flex h-[calc(100vh-220px)] flex-col">
        <div className="border rounded p-2 ">
          <h2 className="text-lg font-bold mb-3 flex text-neutralDGray items-center gap-2">
            <FaUserPlus className="h-6 w-6 text-neutralDGray" /> Add Employee Access
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
                className="mt-1 p-1 w-full border rounded-md text-sm"
                placeholder="e.g., Jane Smith"
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
                className="mt-1 p-1 w-full border rounded-md text-sm"
                placeholder="e.g., jane.smith@company.com"
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
                className="mt-1 p-1 w-full border rounded-md text-sm"
                placeholder="Create a password"
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
                className="mt-1 mb-1 p-1 w-full border rounded-md text-sm"
              >
                <option value="default">
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
                className="w-32 text-md bg-brandPrimary h-10 hover:bg-neutralDGray text-white py-1 px-2 rounded"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Employee"}
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-row gap-5 mt-3">
          {loading ? (
            <p>Loading users...</p>
          ) : users.length > 0 ? (
            <>
              <div className="w-1/2">
                {/* Active Users */}
                <h4 className="text-[14px] mt-1 text-brandPrimary italic">
                  Active Users
              </h4>
                <ul className="border rounded-md p-1 mb-1">
                  {users
                    .filter((user) => !user.isBlocked)
                    .map((user, index) => (
                      <li
                        key={index}
                        className="border-b text-[13px] last:border-b-0 px-2"
                      >
                        {editingUser === user.id ? (
                          <div className="bg-gray-200/60 p-1 rounded">
                            <h6 className="text-sm text-neutralDGray font-semibold">Edit User</h6>
                            <form
                              onSubmit={handleEditSubmit}
                              className="flex flex-col gap-1 -mt-1"
                            >
                              <input
                                type="text"
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditChange}
                                className="border p-1 rounded text-sm text-neutralDGray"
                              />
                              <input
                                type="email"
                                name="email"
                                value={editFormData.email}
                                onChange={handleEditChange}
                                className="border p-1 rounded text-sm text-neutralDGray"
                              />
                              <select
                                name="role"
                                value={editFormData.role}
                                onChange={handleEditChange}
                                className="border p-1 rounded text-sm text-neutralDGray"
                              >
                                <option value="approver">Approver</option>
                                <option value="hr">HR</option>
                                <option value="admin">Admin</option>
                              </select>
                              <div className="flex gap-2 text-center">
                                <button
                                  type="submit"
                                  className="bg-brandPrimary w-14 h-8 hover:bg-green-500 text-white px-3 py-1 rounded flex items-center justify-center text-[13px]"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="bg-gray-300 hover:bg-neutralGray w-14 h-8 text-black px-3 py-1 rounded flex items-center justify-center text-[13px]"
                                >
                                  Cancel
                                </button>
                              </div>

                            </form>
                          </div>
                        ) : (
                            <div className="flex justify-between items-center">
                              <div className="text-center">
                                <span className="font-bold">{user.name}</span> → {user.email}
                              </div>

                              <div className="flex gap-1 items-center">
                                <button
                                  onClick={() => startEdit(user)}
                                  className="bg-green-500 hover:bg-green-900 border w-14 h-8 text-white px-3 rounded flex items-center justify-center"
                                >
                                  Edit
                              </button>

                                <button
                                  onClick={() => handleBlock(user.id)}
                                  className="bg-red-500 hover:bg-red-900 border text-white w-14 h-8 px-3 rounded flex items-center justify-center"
                                >
                                  <MdBlock size={15} />
                                </button>
                              </div>
                            </div>
                          )}
                      </li>
                    ))}
                </ul>
              </div>

              <div className="w-1/2">
                {/* Blocked Users */}
                <h4 className="mt-2 text-[14px] text-red-500 italic">Blocked Users</h4>
                <ul className="border rounded-md bg-red-50">
                  {users
                    .filter((user) => user.isBlocked)
                    .map((user, index) => (
                      <li
                        key={index}
                        className="py-1 px-2 text-[12px] border-b last:border-b-0 flex justify-between items-center text-red-600"
                      >
                        <div className="text-neutralDGray text-[12px]">
                          <span className="font-bold">{user.name}</span> → {user.email}
                        </div>

                        <div className="items-center">
                          <button
                            onClick={() => handleUnblock(user.id)}
                            className="bg-white h-8 w-20 text-[12px] text-neutralDGray hover:bg-red-500 hover:text-white border border-red-300 rounded flex items-center justify-center transition-colors duration-200"
                          >
                            Unblock
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>

              </div>
            </>
          ) : (
                <p>No users found.</p>
              )}
        </div>
      </div>
    </div>
  );
};

export default AddAdmin;
