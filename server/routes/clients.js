import express from 'express';
import { addClient, getClients, getNextClientCode } from '../controllers/clientsController.js';

const router = express.Router()


router.get("/next-code", getNextClientCode);
router.post("/add", addClient);
router.get("/", getClients);



export default router;