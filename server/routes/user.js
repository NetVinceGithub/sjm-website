import express from "express";
import { addUser, blockUser, editUser, getUsers, unblockUser } from "../controllers/usersController.js";


const router = express.Router();

router.post("/add", addUser); // Manual Sync API
router.get('/get-users', getUsers);
router.post('/block', blockUser );
router.post('/unblock', unblockUser);
router.put('/:id', editUser);



export default router;
