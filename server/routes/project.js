import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addProject, getProjects, getProject, updateProject } from '../controllers/projectController.js';

const router = express.Router();

router.get('/', authMiddleware, getProjects);
router.post('/add-project', authMiddleware, addProject);
router.get('/:id', authMiddleware, getProject);
router.put('/:id', authMiddleware, updateProject); // Add the PUT route for updating a project
//router.delete('/:id', authMiddleware, deleteProject);

export default router;
