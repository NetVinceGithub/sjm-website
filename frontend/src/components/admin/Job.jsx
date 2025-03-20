import React, { useState } from "react";
import { FaUserPlus, FaSearch } from "react-icons/fa";
import DataTable from "react-data-table-component";
import {
  FaPrint,
  FaRegFileExcel,
  FaRegFilePdf,
  FaRegPenToSquare,
  FaTrash,
  FaXmark,
} from "react-icons/fa6";
import axios from "axios";
import { Cell } from "recharts";

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
      const response = await axios.post(
        "http://localhost:5000/api/jobs/add",
        formData
      );

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

  const columns = [
    {
      name: "Job",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Date Posted",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Project",
      selector: (row) =>
        projects.find((p) => p._id === row.project)?.projectName || "N/A",
      sortable: true,
    },
    {
      name: "Options",
      cell: (row) => (
        <div className="flex justify-center items-center">
          <button className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray flex items-center justify-center">
            <FaRegPenToSquare
              title="Edit"
              className=" text-neutralDGray w-5 h-5"
            />
          </button>
          <button className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray flex items-center justify-center">
            <FaTrash
              title="Delete"
              className=" text-neutralDGray w-5 h-5"
            />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2 h-[33rem]">
      <div className="flex gap-6 -mt-2">
        <div className="w-[50%]">
          <div className=" bg-white p-3 rounded shadow-sm">
            <h2 className="text-2xl font-bold mb-6 -mt-2 flex text-neutralDGray items-center gap-2">
              <FaUserPlus className="h-8 w-8 text-neutralDGray" /> Add Job
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-neutralDGray">
                  Job Title
                </label>
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
                <label className="block text-sm font-medium text-neutralDGray">
                  Job Description
                </label>
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
                <label className="block text-sm font-medium text-neutralDGray">
                  Job Responsibilities
                </label>
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
                <label className="block text-sm font-medium text-neutralDGray">
                  Application Link
                </label>
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
                  className="w-[20%] bg-brandPrimary h-11 hover:bg-neutralDGray text-white py-1 px-3 rounded"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Job"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="w-[50%]">
          <div className="bg-white p-3 rounded shadow-sm">
            <h2 className="text-[1.2rem] text-neutralDGray font-bold mb-4">
              Job Listings
            </h2>
            <div className="flex item justify-between">
              <div className="inline-flex border border-neutralDGray rounded h-7 mb-4">
                <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center">
                  <FaPrint title="Print" className="text-neutralDGray" />
                </button>
                <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray flex items-center justify-center">
                  <FaRegFileExcel
                    title="Export to Excel"
                    className="text-neutralDGray"
                  />
                </button>
                <button className="px-3 w-20 h-full hover:bg-neutralSilver transition-all duration-300 rounded-r flex items-center justify-center">
                  <FaRegFilePdf
                    title="Export to PDF"
                    className="text-neutralDGray"
                  />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex rounded items-center border border-gray-300 px-2">
                  <input
                    type="text"
                    placeholder="Search Employee"
                    className="px-2 py-1 border-none outline-none w-full"
                  />
                  <FaSearch className="ml-[-20px] text-neutralDGray" />
                </div>
              </div>
            </div>

            <DataTable
              columns={columns}
              pagination
              highlightOnHover
              striped
              responsive
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Job;
