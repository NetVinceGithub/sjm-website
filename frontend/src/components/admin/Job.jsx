
import React, { useState } from 'react';
import { FaUserPlus } from 'react-icons/fa';


const Job = () => {

const [formData, setFormData] = useState({
    title: "",
    description: "",

  });
const [loading, setLoading] = useState(false);
  

  const handleChange = (e) => {
    const { title, description } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/jobs/add", formData);
      if (response.data.success) {
        alert("✅ Job added successfully!");
        setFormData({ title: "", description: ""});
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
       <div>
         <h2 className="text-2xl font-bold mb-6 mt-1 flex text-neutralDGray items-center gap-2">
           <FaUserPlus className="h-8 w-8 text-neutralDGray" /> Add Jobs
         </h2>
         <form className="space-y-4" onSubmit={handleSubmit}>
           <div>
             <label className="block text-sm font-medium text-neutralDGray">Job Title</label>
             <input
               type="text"
               name="title"
               onChange={handleChange}
               className="mt-1 p-2 w-full border rounded-md"
               placeholder="Enter Job Title"
               required
             />
           </div>
           <div>
            <label className="block text-sm font-medium text-neutralDGray">
              Job Description
            </label>
            <textarea
              name="description"
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md resize"
              placeholder="Enter Job Description"
              required
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-neutralDGray">
              Job Responsibility
            </label>
            <textarea
              name="description"
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md resize"
              placeholder="Enter Job Responsibility"
              required
            />
            </div>
           <div>
             <label className="block text-sm font-medium text-neutralDGray">Application Link</label>
             <input
               type="text"
               name="description"
               onChange={handleChange}
               className="mt-1 p-2 w-full border rounded-md"
               placeholder="Attach application form link"
               required
             />
           </div>
           <div className="flex justify-end">
            <button
              type="submit"
              className="w-[20%] bg-brandPrimary hover:bg-neutralDGray text-white py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Job"}
            </button>
           </div>
         </form>
   
         
       </div>
  );
};

export default Job;