import express from 'express';
import { addJobs, getAllJobs, getJobById, updateJob, deleteJob } from '../controllers/jobsController.js';

const router = express.Router();

// Create a job posting
router.post('/add', addJobs);

// Get all job postings
router.get('/all', getAllJobs);

// Get a single job posting by ID
router.get('/:id', getJobById);

// Update a job posting by ID
router.put('/:id', updateJob);

// Delete a job posting by ID
router.delete('/:id', deleteJob);

export default router;
