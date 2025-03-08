import express from 'express'
import { getInvoices } from '../controllers/invoiceController.js';

const router = express.Router();

router.get("/", getInvoices); 

export default router;