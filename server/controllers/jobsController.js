import Jobs from "../models/Jobs.js"; // Import the Jobs model

// Create a job posting
export const addJobs = async (req, res) => {
  const { title, description, location, requirements, responsibilities, link } = req.body;

  try {
    // Validate if all required fields are present
    if (!title || !description || !location || !requirements || !responsibilities || !link) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Create a new job posting
    const newJob = await Jobs.create({
      title,
      description,
      location,
      requirements, // Assuming these are plain text
      responsibilities, // Assuming these are plain text
      applicationLink: link,
    });

    return res.status(200).json({ success: true, job: newJob });
  } catch (error) {
    console.error('Error adding job:', error);
    return res.status(500).json({ success: false, error: 'An error occurred while saving the job' });
  }
};

// Get all job postings
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Jobs.findAll(); // Fetch all jobs from the database
    return res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ success: false, error: 'An error occurred while fetching jobs' });
  }
};

// Get a single job by ID
export const getJobById = async (req, res) => {
  const { id } = req.params; // Get the job ID from the URL params

  try {
    const job = await Jobs.findByPk(id); // Find the job by its primary key (ID)

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    return res.status(200).json({ success: true, job });
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    return res.status(500).json({ success: false, error: 'An error occurred while fetching the job' });
  }
};

// Update a job posting by ID
export const updateJob = async (req, res) => {
  const { id } = req.params; // Get the job ID from the URL params
  const { title, description, location, requirements, responsibilities, link } = req.body;

  try {
    const job = await Jobs.findByPk(id); // Find the job by its ID

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Update job details
    job.title = title || job.title;
    job.description = description || job.description;
    job.location = location || job.location;
    job.requirements = requirements || job.requirements;
    job.responsibilities = responsibilities || job.responsibilities;
    job.applicationLink = link || job.applicationLink;

    await job.save(); // Save the updated job to the database

    return res.status(200).json({ success: true, job });
  } catch (error) {
    console.error('Error updating job:', error);
    return res.status(500).json({ success: false, error: 'An error occurred while updating the job' });
  }
};

// Delete a job posting by ID
export const deleteJob = async (req, res) => {
  const { id } = req.params; // Get the job ID from the URL params

  try {
    const job = await Jobs.findByPk(id); // Find the job by its ID

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    await job.destroy(); // Delete the job from the database

    return res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return res.status(500).json({ success: false, error: 'An error occurred while deleting the job' });
  }
};
