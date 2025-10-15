import express from 'express';
import { addClient, getClients, getClientById, updateClient, nextClientCode } from '../controllers/clientsController.js';

const router = express.Router();

router.get("/next-code", nextClientCode);
router.post("/add", addClient);
router.get("/", getClients);
router.get("/:id", getClientById);  // Get specific client by ID
router.put("/:id", updateClient);   // Update specific client by ID

export default router;