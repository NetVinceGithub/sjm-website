import Jobs from "../models/Jobs.js";

export const addJobs = async (req, res) => {
  try {
    const { title, description, location, requirements, responsibilities, applicationLink } = req.body;

    // Validate required fields
    if (!title || !description || !location || !applicationLink) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newJob = await Jobs.create({
      title,
      description,
      location,
      requirements: requirements || [], // Ensure empty array if undefined
      responsibilities: responsibilities || [],
      applicationLink,
    });

    res.status(201).json({ 
      success: true, 
      message: "Job added successfully", 
      job: newJob // Return the newly created job in response
    });

  } catch (error) {
    console.error("Error in addJobs:", error); // Log error for debugging
    res.status(500).json({ success: false, message: "Internal Server Error in jobsController" });
  }
};
