import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addEmployee, uploadFields, getEmployees, getEmployee, updateEmployee, fetchEmployeesByDepId, getEmployeeImage } from '../controllers/employeeController.js';
import Employee from '../models/Employee.js';


const router = express.Router();

router.get('/', authMiddleware, getEmployees);
router.post('/add', authMiddleware, uploadFields, addEmployee);
router.get('/:id', authMiddleware, getEmployee);
router.put('/:id', authMiddleware, updateEmployee);
router.get('/department/:id', authMiddleware, fetchEmployeesByDepId);
import fs from 'fs'; 

router.get('/image/:id', authMiddleware, getEmployeeImage);




export default router;
