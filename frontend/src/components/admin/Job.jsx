import React, { useState, useEffect } from "react";
import {
  FaPeopleRoof,
  FaShopify,
  FaPeopleCarryBox,
  FaChalkboardUser,
  FaHandHoldingDollar,
  FaGears,
  FaPersonDigging,
  FaPersonMilitaryRifle,
  FaHospitalUser,
  FaPen,
  FaTrash,
  FaPencil,
  FaPlus,
} from "react-icons/fa6";
import { Button } from "flowbite-react";
import { FaArrowUp } from "react-icons/fa";
import axios from "axios"; // Make sure to install axios

const API_URL = `${import.meta.env.VITE_API_URL}/api/jobs`; // Replace with your actual API endpoint

const Modal = ({ showModal, setShowModal, job }) => (
  <div
    className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${
      showModal ? "block" : "hidden"
    }`}
  >
    <div className="relative bg-white mt-20 p-6 rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-y-auto text-left">
  {/* Close Button */}
  <button
    onClick={() => setShowModal(false)}
    className="absolute top-4 right-4 text-2xl text-neutralDGray hover:text-red-500"
  >
    &times;
  </button>

  {/* Content */}
  <h2 className="text-2xl font-semibold mb-4 text-neutralDGray mt-2">
    {job.title}
  </h2>

  <p className="text-neutralGray mb-4">
    <strong>Location:</strong> {job.location}
  </p>

  <div className="mb-4">
    <strong>Requirements:</strong>
    <ul className="list-disc pl-5 text-neutralGray mt-1">
      {job.requirements.map((req, index) => (
        <li key={index}>{req}</li>
      ))}
    </ul>
  </div>

  <div className="mb-6">
    <strong>Responsibilities:</strong>
    <ul className="list-disc pl-5 text-neutralGray mt-1">
      {job.responsibilities.map((resp, index) => (
        <li key={index}>{resp}</li>
      ))}
    </ul>
  </div>

  <a
    href={job.applicationLink || job.link}
    target="_blank"
    rel="noopener noreferrer"
  >
    <Button className="bg-brandPrimary no-underline shadow-md text-white font-semibold hover:bg-neutralDGray transition-all duration-300 w-full">
      Apply Now
    </Button>
  </a>
</div>
</div>
);

const JobFormModal = ({
  showModal,
  setShowModal,
  onSubmit,
  initialData,
  isLoading,
  isEditing,
}) => {
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    location: "",
    requirements: [""],
    responsibilities: [""],
    link: "",
  });

  // Reset form when the modal opens with initial data (for editing)
  useEffect(() => {
    if (initialData) {
      setJobData({
        title: initialData.title || "",
        description: initialData.description || "",
        location: initialData.location || "",
        requirements: initialData.requirements?.length
          ? [...initialData.requirements]
          : [""],
        responsibilities: initialData.responsibilities?.length
          ? [...initialData.responsibilities]
          : [""],
        link: initialData.applicationLink || initialData.link || "",
      });
    } else {
      // Reset form for new job
      setJobData({
        title: "",
        description: "",
        location: "",
        requirements: [""],
        responsibilities: [""],
        link: "",
      });
    }
  }, [initialData, showModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData({
      ...jobData,
      [name]: value,
    });
  };

  const handleListChange = (e, index, listType) => {
    const { value } = e.target;
    const updatedList = [...jobData[listType]];
    updatedList[index] = value;
    setJobData({
      ...jobData,
      [listType]: updatedList,
    });
  };

  const addListItem = (listType) => {
    setJobData({
      ...jobData,
      [listType]: [...jobData[listType], ""],
    });
  };

  const removeListItem = (index, listType) => {
    const updatedList = [...jobData[listType]];
    updatedList.splice(index, 1);
    setJobData({
      ...jobData,
      [listType]: updatedList,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out empty strings from requirements and responsibilities
    const filteredData = {
      ...jobData,
      requirements: jobData.requirements.filter((item) => item.trim() !== ""),
      responsibilities: jobData.responsibilities.filter(
        (item) => item.trim() !== ""
      ),
    };

    if (isEditing && initialData) {
      onSubmit(initialData.id, filteredData);
    } else {
      onSubmit(filteredData);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${
        showModal ? "block" : "hidden"
      }`}
    >
      <div className="bg-white mt-10 p-6 rounded-lg shadow-lg w-[700px] max-h-[80vh] overflow-y-auto relative text-left">
        <div className="flex items-center w-full">
          <h2 className="text-2xl font-semibold text-neutralDGray flex-grow">
            {isEditing ? "Edit Job" : "Add New Job"}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-3xl text-neutralDGray hover:text-red-500 transition-colors ml-auto"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Job Title</label>
            <input
              type="text"
              name="title"
              value={jobData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={jobData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="3"
              required
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="block mb-1 font-medium">Location</label>
            <input
              type="text"
              name="location"
              value={jobData.location}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 font-medium">Requirements</label>
            {jobData.requirements.map((req, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleListChange(e, index, "requirements")}
                  className="w-full p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => removeListItem(index, "requirements")}
                  className="ml-2 px-2 w-20 h-10 bg-red-500 text-white rounded"
                  disabled={jobData.requirements.length <= 1}
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem("requirements")}
              className="px-3 py-1 h-10 bg-green-500 text-white rounded"
            >
              + Add Requirement
            </button>
          </div>

          <div className="mb-3">
            <label className="block mb-1 font-medium">Responsibilities</label>
            {jobData.responsibilities.map((resp, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) =>
                    handleListChange(e, index, "responsibilities")
                  }
                  className="w-full p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => removeListItem(index, "responsibilities")}
                  className="ml-2 w-20 h-10 px-3 bg-red-500 text-white rounded"
                  disabled={jobData.responsibilities.length <= 1}
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem("responsibilities")}
              className="px-3 py-1 h-10 bg-green-500 text-white rounded"
            >
              + Add Responsibility
            </button>
          </div>

          <div className="mb-3">
            <label className="block mb-1 font-medium">Application Link</label>
            <input
              type="url"
              name="link"
              value={jobData.link}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <Button
            type="submit"
            className="bg-brandPrimary shadow-md text-white font-semibold hover:bg-neutralDGray transition-all duration-300 w-full"
            disabled={isLoading}
          >
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Adding..."
              : isEditing
              ? "Update Job"
              : "Add Job"}
          </Button>
        </form>
      </div>
    </div>
  );
};

const Job = () => {
  const [showArrow, setShowArrow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all jobs from the API when the component mounts
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/all`);
      if (response.data.success) {
        setJobs(response.data.jobs);
      } else {
        setError("Failed to fetch jobs");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowArrow(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addNewJob = async (jobData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/add`, {
        title: jobData.title,
        description: jobData.description,
        location: jobData.location,
        requirements: jobData.requirements,
        responsibilities: jobData.responsibilities,
        link: jobData.link,
      });

      if (response.data.success) {
        // Add the new job to the local state
        setJobs([...jobs, response.data.job]);
        setShowFormModal(false);
        // Show success message
      } else {
        setError(response.data.error || "Failed to add job");
      }
    } catch (error) {
      console.error("Error adding job:", error);
      setError("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  const updateJob = async (jobId, jobData) => {
    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL}/${jobId}`, {
        title: jobData.title,
        description: jobData.description,
        location: jobData.location,
        requirements: jobData.requirements,
        responsibilities: jobData.responsibilities,
        link: jobData.link,
      });

      if (response.data.success) {
        // Update the job in the local state
        setJobs(
          jobs.map((job) => (job.id === jobId ? response.data.job : job))
        );
        setShowFormModal(false);
        setEditingJob(null);
        // Show success message
      } else {
        setError(response.data.error || "Failed to update job");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      setError("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      setIsLoading(true);
      try {
        const response = await axios.delete(`${API_URL}/${id}`);
        if (response.data.success) {
          setJobs(jobs.filter((job) => job.id !== id));
        } else {
        }
      } catch (error) {
        console.error("Error deleting job:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowFormModal(true);
  };

  const handleFormSubmit = (jobIdOrData, jobData = null) => {
    if (jobData) {
      // If jobData is provided, this is an update operation
      updateJob(jobIdOrData, jobData);
    } else {
      // Otherwise, this is a create operation
      addNewJob(jobIdOrData);
    }
  };

  const openAddModal = () => {
    setEditingJob(null);
    setShowFormModal(true);
  };

  return (
    <div className="p-6  h-[calc(100vh-180px)] border rounded-lg">
      <div className="flex justify-between items-center -mt-3 mb-8">
        <h2 className="text-neutralDGray text-lg font-semibold">
          Available Jobs
        </h2>
        <Button
          onClick={openAddModal}
          className="bg-brandPrimary w-32 text-center h-10 text-white font-semibold hover:bg-neutralDGray transition-all duration-300"
        >
          Add Job
        </Button>
      </div>

      {isLoading && !showFormModal && (
        <div className="text-center py-10">
          <p className="text-xl">Loading jobs...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center py-10">
          <p className="text-xl text-red-500">{error}</p>
          <Button
            onClick={() => {
              setError(null);
              fetchJobs();
            }}
            className="mt-4 bg-brandPrimary shadow-md text-white font-semibold hover:bg-neutralDGray transition-all duration-300"
          >
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !error && jobs.length === 0 && (
        <div className="text-center py-10">
          <p className="text-md">No jobs available yet.</p>
          <p className="-mt-3 text-[12px] italic text-neutralDGray">Click "Add Job" to post your first job!</p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="relative flex flex-col justify-between gap-4 md:w-[300px] mx-auto md:h-80 p-2 border -mt-3 border-gray-200 rounded-2xl shadow-sm bg-neutralSilver hover:shadow-md transition-transform hover:-translate-y-2"
          >
            {/* Top Controls */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => handleEdit(job)}
                className="w-10 h-10 flex items-center justify-center text-neutralDGray hover:bg-green-500 rounded-full transition-colors"
                title="Edit"
              >
                <FaPencil size={14} />
              </button>

              <button
                onClick={() => handleDelete(job.id)}
                className="w-10 h-10 flex items-center justify-center text-neutralDGray hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                title="Delete"
              >
                <FaTrash size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="text-center flex-grow">
              <h4 className="text-xl font-semibold text-neutralDGray mb-1">
                {job.title}
              </h4>
              <p className="text-sm text-neutralGray line-clamp-4">
                {job.description}
              </p>
            </div>

            {/* Action Button */}
            <Button
              onClick={() => {
                setSelectedJob(job);
                setShowModal(true);
              }}
              className="w-[50%] bg-brandPrimary bottom-10 text-white mx-auto text-center font-medium hover:bg-neutralDGray transition-all duration-300 py-2 rounded-md flex items-center justify-center"
            >
              Explore Now
            </Button>
          </div>
        ))}
      </div>

      {selectedJob && (
        <Modal
          showModal={showModal}
          setShowModal={setShowModal}
          job={selectedJob}
        />
      )}

      <JobFormModal
        showModal={showFormModal}
        setShowModal={setShowFormModal}
        onSubmit={handleFormSubmit}
        initialData={editingJob}
        isLoading={isLoading}
        isEditing={!!editingJob}
      />

      {showArrow && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-10 right-10 bg-brandPrimary opacity-50 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:bg-brandPrimary hover:-translate-y-4 hover:opacity-100 hover:text-white"
        >
          <FaArrowUp className="text-xl" />
        </button>
      )}
    </div>
  );
};

export default Job;
