import express from "express";
import { addMessages, getMessages } from "../controllers/connectController.js";
const router = express.Router();

// POST request to save form data
router.post('/', addMessages); // The route should be '/' since it is prefixed by '/api/connect' in index.js
router.get('/messages', getMessages);
export default router;
