import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addRate, getRates } from '../controllers/ratesController.js';


const router = express.Router();

router.get('/', getRates);
router.post('/add', addRate);
//router.get('/:id', authMiddleware, getEmployee);
//router.put('/edit',updateEmployee)
//router.get('/department/:id', authMiddleware, fetchEmployeesByDepId)


export default router