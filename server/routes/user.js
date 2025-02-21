import express from "express";
import { addUser } from "../controllers/usersController.js";


const router = express.Router();

router.post("/add", addUser); // Manual Sync API

export default router;
