import express from "express";
import { addUser, blockUser, editUser, getUsers, unblockUser, authenticateUser } from "../controllers/usersController.js";
import verifyUser from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/add", addUser); // Manual Sync API
router.get('/get-users', getUsers);
router.post('/block', blockUser );
router.post('/unblock', unblockUser);
router.put('/:id', editUser);
router.get('/current', verifyUser, authenticateUser);


export default router;
