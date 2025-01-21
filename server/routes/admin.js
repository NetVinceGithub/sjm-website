import express from "express";
import multer from "multer";
import { addIdData, updateIdData } from "../controllers/idDataController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/admin/add", upload.single("signature"), addIdData);
router.put("/admin/update/:id", upload.single("signature"), updateIdData);

export default router;
