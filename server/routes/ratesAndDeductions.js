import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addRate, getRate, getRates, updateRates } from '../controllers/ratesAndDeductionsController.js';


const router = express.Router();

router.get('/', getRates);
router.post('/add', addRate);
router.get('/:id', getRate);
router.put('/:id',updateRates)


export default router