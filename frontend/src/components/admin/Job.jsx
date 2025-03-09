import React, { useState } from 'react';
import { FaUserPlus } from 'react-icons/fa';
import axios from 'axios';

const Job = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    responsibilities: "",
    link: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/jobs/add", formData);

      if (response.data.success) {
        alert("✅ Job added successfully!");
        setFormData({
          title: "",
          description: "",
          responsibilities: "",
          link: "",
        });
      } else {
        alert(response.data.error || "❌ Failed to save job.");
      }
    } catch (error) {
      console.error("Error saving job:", error.response?.data || error);
      alert("❌ An error occurred while saving the job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 mt-1 flex text-neutralDGray items-center gap-2">
        <FaUserPlus className="h-8 w-8 text-neutralDGray" /> Add Job
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-neutralDGray">Job Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter Job Title"
            required
          />
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium text-neutralDGray">Job Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md resize"
            placeholder="Enter Job Description"
            required
          />
        </div>

        {/* Job Responsibilities */}
        <div>
          <label className="block text-sm font-medium text-neutralDGray">Job Responsibilities</label>
          <textarea
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md resize"
            placeholder="Enter Job Responsibilities"
            required
          />
        </div>

        {/* Application Link */}
        <div>
          <label className="block text-sm font-medium text-neutralDGray">Application Link</label>
          <input
            type="text"
            name="link"
            value={formData.link}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Attach application form link"
            required
          />
        </div>

        {/* Submit Button */}
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
