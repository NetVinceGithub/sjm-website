import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { 
  addEmployee, 
  uploadFields, 
  getEmployees, 
  getEmployee, 
  updateEmployee, 
  fetchEmployeesByDepId, 
  getEmployeeImage 
} from '../controllers/employeeController.js';

const router = express.Router();

// Fetch all employees
router.get('/', authMiddleware, getEmployees);

// Add a new employee with file upload
router.post('/add', authMiddleware, uploadFields, addEmployee);

// Fetch a single employee by ID
router.get('/:id', authMiddleware, getEmployee);

// Update an employee (includes file upload)
router.put('/:id', authMiddleware, uploadFields, updateEmployee);

// Fetch employees by department ID
router.get('/department/:id', authMiddleware, fetchEmployeesByDepId);

// Get employee profile image
router.get('/image/:id', authMiddleware, getEmployeeImage);

export default router;
