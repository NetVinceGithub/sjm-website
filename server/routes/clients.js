import express from 'express';
import { addClient, getClients, getNextClientCode, getClientById, updateClient } from '../controllers/clientsController.js';

const router = express.Router();

router.get("/next-code", getNextClientCode);
router.post("/add", addClient);
router.get("/", getClients);
router.get("/:id", getClientById);  // Get specific client by ID
router.put("/:id", updateClient);   // Update specific client by ID

export default router;