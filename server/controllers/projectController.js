import Project from '../models/Project.js';
import Employee from '../models/Employee.js';

export const getProjects = async (req, res) => {
  try {
    // Fetch all projects
    const projects = await Project.find();

    // For each project, count how many employees are assigned
    const projectsWithEmployeeCount = await Promise.all(
      projects.map(async (project) => {
        const employeeCount = await Employee.countDocuments({ project: project._id });

        return {
          ...project.toObject(), // Convert project to a plain object to add new properties
          employeeCount,         // Add employee count to project data
        };
      })
    );

    return res.status(200).json({ success: true, projects: projectsWithEmployeeCount });
  } catch (error) {
    console.error("Error fetching projects | getProjects", error);
    return res.status(500).json({ success: false, error: "Error getting projects" });
  }
};

export const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    return res.status(200).json({ success: true, project });
  } catch (error) {
    console.error('Error in getProject:', error);
    return res.status(500).json({ success: false, error: 'Error getting project' });
  }
};


export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectName, location, date } = req.body;

    // Validate the required fields
    if (!projectName || !location || !date) {
      return res.status(400).json({ success: false, error: 'Missing or invalid required fields' });
    }

    // Find and update the project
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { projectName, location, date, updatedAt: Date.now() },
      { new: true } // Return the updated project
    );

    if (!updatedProject) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    return res.status(200).json({ success: true, project: updatedProject });
  } catch (error) {
    console.error('Error occurred in updateProject:', error);
    return res.status(500).json({ success: false, error: 'Error updating project' });
  }
};

export const addProject = async (req, res) => {
  try {
    const { projectName, location, date } = req.body;

    // Validate required fields
    if (!projectName || !location || !date) {
      return res.status(400).json({ success: false, error: 'Missing or invalid required fields' });
    }

    // Create and save the project
    const newProject = new Project({ projectName, location, date });
    await newProject.save();

    return res.status(200).json({ success: true, newProject });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error occurred' });
  }
};
