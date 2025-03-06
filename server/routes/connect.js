import express from "express";
import Connect from "../models/Connect.js";
import { addMessages } from "../controllers/connectController.js";




const router = express.Router();

// POST request to save form data
router.post('/connect', addMessages);






export default router;
