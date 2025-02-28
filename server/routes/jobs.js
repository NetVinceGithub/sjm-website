import express from "express";
import { addJobs } from "../controllers/jobsController.js";


const router = express.Router();

router.post("/add", addJobs); 

export default router;
